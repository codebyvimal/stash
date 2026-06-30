import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction, Task, Reward, Settings } from '../types';
import { supabase } from '../lib/supabase';

const pushToSupabase = async <T extends object>(table: string, data: T) => {
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  const payload = { ...data } as Record<string, unknown>;
  delete payload.is_repeatable;
  
  if (!navigator.onLine) {
    useStore.getState().addToSyncQueue({ action: 'upsert', table, data: payload });
    return;
  }

  try {
    const { error } = await supabase.from(table).upsert({ ...payload, user_id: user.id });
    if (error) throw error;
  } catch (e) {
    console.error(e);
    useStore.getState().addToSyncQueue({ action: 'upsert', table, data: payload });
  }
};

const deleteFromSupabase = async (table: string, id: string) => {
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  if (!navigator.onLine) {
    useStore.getState().addToSyncQueue({ action: 'delete', table, id });
    return;
  }

  try {
    const { error } = await supabase.from(table).delete().match({ id, user_id: user.id });
    if (error) throw error;
  } catch (e) {
    console.error(e);
    useStore.getState().addToSyncQueue({ action: 'delete', table, id });
  }
};

type SyncAction = 
  | { action: 'upsert'; table: string; data: Record<string, unknown> }
  | { action: 'delete'; table: string; id: string }
  | { action: 'rpc'; fn: string; args: Record<string, unknown> };

interface StoreData {
  transactions: Transaction[];
  tasks: Task[];
  rewards: Reward[];
  settings: Settings;
  syncQueue: SyncAction[];
  _tick: number;
  isTourOpen: boolean;
}

interface StoreActions {
  addTask: (t: Omit<Task, 'id' | 'created_at' | 'status' | 'completed_at'>) => void;
  completeTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  addTransaction: (t: Omit<Transaction, 'id' | 'created_at'>) => void;
  addReward: (r: Omit<Reward, 'id' | 'created_at'>) => void;
  updateReward: (id: string, updates: Partial<Reward>) => void;
  deleteReward: (id: string) => void;
  claimReward: (rewardId: string) => void; // Optimistic sync update; Supabase sync is fire-and-forget
  updateSettings: (s: Partial<Settings>) => void;
  clearAll: () => void;
  initFromSupabase: () => Promise<void>;
  addToSyncQueue: (action: SyncAction) => void;
  processSyncQueue: () => Promise<void>;
  setTourOpen: (isOpen: boolean) => void;
}

const DEFAULT_SETTINGS: Settings = {
  daily_goal: 500,
  currency_name: 'pts',
  has_seen_tour: false
};

const DEFAULT_REWARDS: Reward[] = [];

const DEFAULT_DATA: Omit<StoreData, '_tick'> = {
  transactions: [],
  tasks: [],
  rewards: DEFAULT_REWARDS,
  settings: DEFAULT_SETTINGS,
  syncQueue: [],
  isTourOpen: false
};

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

export function getCreditTime(task: Task): string {
  if (!task.completed_at) return '';
  const createdAt = new Date(task.created_at).getTime();
  const completedAt = new Date(task.completed_at).getTime();
  const earliestCredit = createdAt + THREE_HOURS_MS;
  return new Date(Math.max(completedAt, earliestCredit)).toISOString();
}

export function isCredited(task: Task): boolean {
  if (task.status !== 'completed' || !task.completed_at) return false;
  return new Date(getCreditTime(task)).getTime() <= Date.now();
}

export const useStore = create<StoreData & StoreActions>()(
  persist(
    (set, get) => ({
      ...DEFAULT_DATA,
      _tick: Date.now(),
      addTask: (t) => {
        const newTask: Task = {
          ...t,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          status: 'pending'
        };
        set(state => ({ tasks: [...state.tasks, newTask] }));
        pushToSupabase('tasks', newTask);
      },
      completeTask: (taskId) => {
        set(state => {
          const newTasks = state.tasks.map(t =>
            t.id === taskId && t.status === 'pending'
              ? { ...t, status: 'completed' as const, completed_at: new Date().toISOString() }
              : t
          );
          const updatedTask = newTasks.find(t => t.id === taskId);
          if (updatedTask) pushToSupabase('tasks', updatedTask);
          return { tasks: newTasks };
        });
      },
      deleteTask: (taskId) => {
        const state = get();
        const taskToDelete = state.tasks.find(t => t.id === taskId);
        if (taskToDelete && isCredited(taskToDelete)) return;

        set(state => ({
          tasks: state.tasks.filter(t => t.id !== taskId)
        }));
        deleteFromSupabase('tasks', taskId);
      },
      addTransaction: (t) => {
        const newTx: Transaction = {
          ...t,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString()
        };
        set(state => ({ transactions: [...state.transactions, newTx] }));
        pushToSupabase('transactions', newTx);
      },
      addReward: (r) => {
        const newReward: Reward = {
          ...r,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString()
        };
        set(state => ({ rewards: [...state.rewards, newReward] }));
        pushToSupabase('rewards', newReward);
      },
      updateReward: (id, updates) => {
        set(state => {
          const newRewards = state.rewards.map(r => r.id === id ? { ...r, ...updates } : r);
          const updatedReward = newRewards.find(r => r.id === id);
          if (updatedReward) pushToSupabase('rewards', updatedReward);
          return { rewards: newRewards };
        });
      },
      deleteReward: (id) => {
        set(state => ({
          rewards: state.rewards.filter(r => r.id !== id)
        }));
        deleteFromSupabase('rewards', id);
      },
      claimReward: (rewardId) => {
        const state = get();
        const reward = state.rewards.find(r => r.id === rewardId);
        if (!reward) return;

        const newTx: Transaction = {
          title: `Claimed: ${reward.title}`,
          pts: reward.pts,
          type: 'spend',
          reward_id: rewardId,
          category: reward.category,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString()
        };

        // Optimistic update — synchronous so Zustand picks it up immediately
        set(state => ({ transactions: [...state.transactions, newTx] }));

        // Fire-and-forget async Supabase sync (outside the store action)
        if (supabase) {
          if (!navigator.onLine) {
            get().addToSyncQueue({ action: 'rpc', fn: 'claim_reward', args: { r_id: rewardId, tx_id: newTx.id } });
          } else {
            supabase.rpc('claim_reward', { r_id: rewardId, tx_id: newTx.id }).then(({ error }) => {
              if (error) {
                console.error("Failed to claim reward:", error);
                // Revert optimistic update on error
                useStore.setState(state => ({
                  transactions: state.transactions.filter(t => t.id !== newTx.id)
                }));
              }
            });
          }
        }
      },
      updateSettings: (s) => {
        set(state => ({
          settings: { ...state.settings, ...s }
        }));
      },
      clearAll: () => {
        set({ ...DEFAULT_DATA, _tick: Date.now() });
      },
      addToSyncQueue: (action) => {
        set(state => ({ syncQueue: [...state.syncQueue, action] }));
      },
      processSyncQueue: async () => {
        const state = get();
        if (!supabase || state.syncQueue.length === 0 || !navigator.onLine) return;
        
        const queue = [...state.syncQueue];
        set({ syncQueue: [] });

        for (const item of queue) {
           try {
             if (item.action === 'upsert') {
                await pushToSupabase(item.table, item.data);
             } else if (item.action === 'delete') {
                await deleteFromSupabase(item.table, item.id);
             } else if (item.action === 'rpc') {
                await supabase.rpc(item.fn, item.args);
             }
           } catch {
             get().addToSyncQueue(item);
           }
        }
      },
      initFromSupabase: async () => {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        await get().processSyncQueue();
        
        try {
          const [tasksRes, rewardsRes, txsRes] = await Promise.all([
            supabase.from('tasks').select('*').eq('user_id', user.id),
            supabase.from('rewards').select('*').eq('user_id', user.id),
            supabase.from('transactions').select('*').eq('user_id', user.id)
          ]);
          
          if (!tasksRes.error && !rewardsRes.error && !txsRes.error) {
            set({
              tasks: tasksRes.data as Task[],
              rewards: rewardsRes.data.length > 0 ? rewardsRes.data as Reward[] : DEFAULT_REWARDS,
              transactions: txsRes.data as Transaction[],
              _tick: Date.now()
            });
          }
        } catch (e) {
          console.error("Failed to sync from supabase", e);
        }
      },
      setTourOpen: (isOpen) => set({ isTourOpen: isOpen })
    }),
    {
      name: 'stash_data',
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _tick, isTourOpen, ...rest } = state;
        return rest;
      }
    }
  )
);

// Global tick to update computed values (like isCredited) without multiple intervals
if (typeof window !== 'undefined') {
  setInterval(() => {
    useStore.setState({ _tick: Date.now() });
  }, 60 * 1000);
}

export function useBalance() {
  return useStore(store => {
    const creditedTaskPts = store.tasks
      .filter(isCredited)
      .reduce((acc, t) => acc + t.pts, 0);

    return store.transactions.reduce((acc, t) =>
      t.type === 'earn' ? acc + t.pts : acc - t.pts, 0
    ) + creditedTaskPts;
  });
}

export function usePendingPts() {
  return useStore(store => store.tasks
    .filter(t => t.status === 'completed' && t.completed_at && !isCredited(t))
    .reduce((acc, t) => acc + t.pts, 0)
  );
}

export function useDailyEarned() {
  return useStore(store => {
    const isToday = (date: Date) => {
      const today = new Date();
      return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    };

    return store.transactions
      .filter(t => t.type === 'earn' && isToday(new Date(t.created_at)))
      .reduce((acc, t) => acc + t.pts, 0)
    + store.tasks
      .filter(t => isCredited(t) && isToday(new Date(t.completed_at!)))
      .reduce((acc, t) => acc + t.pts, 0);
  });
}

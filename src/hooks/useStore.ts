import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction, Task, Reward, Settings } from '../types';
import { supabase } from '../lib/supabase';

const pushToSupabase = async (table: string, data: any) => {
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  // Remove fields that shouldn't be synced or let Supabase handle them
  const { is_repeatable, ...payload } = data;
  try {
    await supabase.from(table).upsert({ ...payload, user_id: user.id });
  } catch (e) {
    console.error(e);
  }
};

const deleteFromSupabase = async (table: string, id: string) => {
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  try {
    await supabase.from(table).delete().match({ id, user_id: user.id });
  } catch (e) {
    console.error(e);
  }
};

interface StoreData {
  transactions: Transaction[];
  tasks: Task[];
  rewards: Reward[];
  settings: Settings;
  _tick: number;
}

interface StoreActions {
  addTask: (t: Omit<Task, 'id' | 'created_at' | 'status' | 'completed_at'>) => void;
  completeTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  addTransaction: (t: Omit<Transaction, 'id' | 'created_at'>) => void;
  addReward: (r: Omit<Reward, 'id' | 'created_at'>) => void;
  updateReward: (id: string, updates: Partial<Reward>) => void;
  deleteReward: (id: string) => void;
  claimReward: (rewardId: string) => void;
  updateSettings: (s: Partial<Settings>) => void;
  clearAll: () => void;
  initFromSupabase: () => Promise<void>;
}

const DEFAULT_SETTINGS: Settings = {
  daily_goal: 500,
  currency_name: 'pts'
};

const DEFAULT_REWARDS: Reward[] = [];

const DEFAULT_DATA: Omit<StoreData, '_tick'> = {
  transactions: [],
  tasks: [],
  rewards: DEFAULT_REWARDS,
  settings: DEFAULT_SETTINGS
};

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export function getCreditTime(task: Task): string {
  if (!task.completed_at) return '';
  const createdAt = new Date(task.created_at).getTime();
  const completedAt = new Date(task.completed_at).getTime();
  const earliestCredit = createdAt + SIX_HOURS_MS;
  return new Date(Math.max(completedAt, earliestCredit)).toISOString();
}

export function isCredited(task: Task): boolean {
  if (task.status !== 'completed' || !task.completed_at) return false;
  return new Date(getCreditTime(task)).getTime() <= Date.now();
}

export const useStoreBase = create<StoreData & StoreActions>()(
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
        set(state => ({ transactions: [...state.transactions, newTx] }));
        pushToSupabase('transactions', newTx);
      },
      updateSettings: (s) => {
        set(state => ({
          settings: { ...state.settings, ...s }
        }));
      },
      clearAll: () => {
        set({ ...DEFAULT_DATA, _tick: Date.now() });
      },
      initFromSupabase: async () => {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
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
      }
    }),
    {
      name: 'tally_data',
      partialize: (state) => {
        const { _tick, ...rest } = state;
        return rest;
      }
    }
  )
);

// Global tick to update computed values (like isCredited) without multiple intervals
if (typeof window !== 'undefined') {
  setInterval(() => {
    useStoreBase.setState({ _tick: Date.now() });
  }, 60 * 1000);
}

// Wrapper to maintain exact same API as before
export function useStore() {
  const store = useStoreBase();

  const creditedTaskPts = store.tasks
    .filter(isCredited)
    .reduce((acc, t) => acc + t.pts, 0);

  const balance = store.transactions.reduce((acc, t) =>
    t.type === 'earn' ? acc + t.pts : acc - t.pts, 0
  ) + creditedTaskPts;

  const pendingPts = store.tasks
    .filter(t => t.status === 'completed' && t.completed_at && !isCredited(t))
    .reduce((acc, t) => acc + t.pts, 0);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const dailyEarned = store.transactions
    .filter(t => t.type === 'earn' && isToday(new Date(t.created_at)))
    .reduce((acc, t) => acc + t.pts, 0)
  + store.tasks
    .filter(t => isCredited(t) && isToday(new Date(t.completed_at!)))
    .reduce((acc, t) => acc + t.pts, 0);

  return {
    ...store,
    balance,
    pendingPts,
    dailyEarned
  };
}

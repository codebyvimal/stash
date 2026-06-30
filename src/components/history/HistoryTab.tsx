import { useState, useMemo } from 'react';
import { useStore, isCredited } from '../../hooks/useStore';
import { TransactionGroup } from './TransactionGroup';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { History } from 'lucide-react';
import type { HistoryItem } from './TransactionCard';

type FilterType = 'all' | 'earn' | 'spend';

export function HistoryTab() {
  const transactions = useStore(s => s.transactions);
  const tasks = useStore(s => s.tasks);
  const settings = useStore(s => s.settings);
  const [filter, setFilter] = useState<FilterType>('all');

  const groupedTransactions = useMemo(() => {
    // Build a set of task IDs that already have a matching earn transaction
    // (created by addTransaction when tasks are completed in Supabase mode).
    // We only synthesize a HistoryItem for tasks that have NO corresponding transaction
    // to avoid duplicates.
    const taskIdsWithTransaction = new Set<string>(
      transactions.filter(t => t.task_id != null).map(t => t.task_id as string)
    );

    // Map completed tasks to HistoryItems only when no transaction already covers them
    const completedTasks: HistoryItem[] = tasks
      .filter(t => t.status === 'completed' && !taskIdsWithTransaction.has(t.id))
      .map(t => ({
        id: t.id,
        title: t.title,
        pts: t.pts,
        type: 'earn',
        category: t.category,
        task_id: t.id,
        created_at: t.completed_at || t.created_at,
        is_pending_credit: !isCredited(t)
      }));

    const allItems: HistoryItem[] = [...transactions, ...completedTasks];
    
    const filtered = allItems.filter(t => filter === 'all' || t.type === filter);
    
    const sorted = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    const groups: Record<string, HistoryItem[]> = {};
    
    const isToday = (d: Date) => {
      const today = new Date();
      return d.getDate() === today.getDate() && 
             d.getMonth() === today.getMonth() && 
             d.getFullYear() === today.getFullYear();
    };
    
    const isYesterday = (d: Date) => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return d.getDate() === yesterday.getDate() && 
             d.getMonth() === yesterday.getMonth() && 
             d.getFullYear() === yesterday.getFullYear();
    };

    sorted.forEach(t => {
      const d = new Date(t.created_at);
      let label: string;
      if (isToday(d)) {
        label = 'Today';
      } else if (isYesterday(d)) {
        label = 'Yesterday';
      } else {
        label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      }
      
      if (!groups[label]) groups[label] = [];
      groups[label].push(t);
    });

    return groups;
  }, [transactions, tasks, filter]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <History className="w-6 h-6 text-blue-500" />
          History
        </h2>
      </div>

      <div className="flex p-1 bg-white/40 backdrop-blur-md rounded-xl border border-white/40 w-fit shadow-sm">
        {(['all', 'earn', 'spend'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "relative px-6 py-2 text-sm font-medium rounded-lg transition-colors capitalize",
              filter === f ? "text-slate-800" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {filter === f && (
              <motion.div
                layoutId="history-filter-bg"
                className="absolute inset-0 bg-white/80 rounded-lg shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{f}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pb-20 pr-2">
        <AnimatePresence mode="popLayout">
          {Object.entries(groupedTransactions).length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-64 text-slate-400"
            >
              <History className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-lg text-slate-500">Log your first win ✓</p>
            </motion.div>
          ) : (
            Object.entries(groupedTransactions).map(([dateLabel, groupTxs]) => (
              <TransactionGroup 
                key={dateLabel} 
                dateLabel={dateLabel} 
                transactions={groupTxs} 
                currencyName={settings.currency_name} 
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

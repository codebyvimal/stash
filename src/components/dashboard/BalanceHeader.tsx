import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { cn } from '../../lib/utils';

export function BalanceHeader() {
  const { balance, pendingPts, dailyEarned, settings } = useStore();

  const goal = settings.daily_goal;
  const progressPercent = Math.min((dailyEarned / goal) * 100, 100);
  const isGoalMet = dailyEarned >= goal;

  return (
    <header className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4 md:mb-10 md:mt-2 text-center md:text-left py-4 md:py-0">
      <div className="w-full">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xs font-semibold tracking-wide md:tracking-wider uppercase text-slate-400 md:text-slate-500 mb-1 md:mb-1.5 block"
        >
          Current Balance
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl font-semibold md:font-bold tracking-tight text-slate-900 flex items-baseline justify-center md:justify-start"
        >
          {balance.toLocaleString()}
          <span className="text-xl md:text-2xl font-medium text-slate-400 ml-1.5">{settings.currency_name}</span>
        </motion.h1>

        {/* Pending points indicator */}
        <AnimatePresence>
          {pendingPts > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-1.5 flex items-center justify-center md:justify-start gap-1.5"
            >
              <Clock className="w-3 h-3 text-amber-500" />
              <span className="text-xs font-semibold text-amber-500">
                +{pendingPts.toLocaleString()} {settings.currency_name} pending (crediting soon)
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Goal Tracker */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="flex md:flex glass-element px-5 py-3.5 rounded-2xl flex-col gap-2 w-full md:w-52 shadow-sm relative overflow-hidden"
      >
        <div className="flex justify-between items-center text-xs font-semibold z-10">
          <span className={cn("transition-colors", isGoalMet ? "text-emerald-600" : "text-slate-600")}>
            {isGoalMet ? 'Goal Reached! 🎉' : 'Daily Goal'}
          </span>
          <span className={cn("transition-colors", isGoalMet ? "text-emerald-600" : "text-slate-600")}>
            {dailyEarned.toLocaleString()} / {goal.toLocaleString()}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden z-10 relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, type: "spring", bounce: 0.2 }}
            className={cn("h-full rounded-full transition-colors duration-500", isGoalMet ? "bg-emerald-500" : "bg-slate-900")}
          />
        </div>
        
        {/* Celebration Background Glow */}
        <AnimatePresence>
          {isGoalMet && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/5 z-0"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Trash2, Clock } from 'lucide-react';
import { useStore, getCreditTime, isCredited } from '../../hooks/useStore';
import { ConfirmModal } from '../ui/ConfirmModal';
import { cn } from '../../lib/utils';
import type { Task } from '../../types';

function TimeToCredit({ task }: { task: Task }) {
  if (task.status !== 'completed' || !task.completed_at) return null;
  if (isCredited(task)) return null;

  const creditAt = new Date(getCreditTime(task));
  const timeString = creditAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-50/80 border border-amber-200/60 px-2 py-0.5 rounded-full">
      <Clock className="w-2.5 h-2.5" />
      {timeString}
    </span>
  );
}

export function TaskList() {
  const tasks = useStore(s => s.tasks);
  const completeTask = useStore(s => s.completeTask);
  const deleteTask = useStore(s => s.deleteTask);
  const [confirmingTask, setConfirmingTask] = useState<Task | null>(null);

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const recentCompleted = tasks
    .filter(t => t.status === 'completed')
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
    .slice(0, 3);

  const allDisplayed = [...pendingTasks, ...recentCompleted];

  const handleComplete = (task: Task) => {
    const now = Date.now();
    const createdAt = new Date(task.created_at).getTime();
    const earliestCredit = createdAt + 6 * 60 * 60 * 1000;

    if (now < earliestCredit) {
      setConfirmingTask(task);
    } else {
      completeTask(task.id);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="flex-1 md:min-h-0 min-h-[160px]"
    >
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 md:text-slate-500">
          Tasks
        </h3>
        <div className="flex items-center gap-2">
          {pendingTasks.length > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-[10px] font-bold uppercase tracking-wider text-blue-600 border border-blue-200/40">
              {pendingTasks.length} pending
            </span>
          )}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex flex-col space-y-2.5">
        <AnimatePresence initial={false}>
          {allDisplayed.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-medium text-slate-400 px-2 py-4"
            >
              No tasks yet — plan one above ↑
            </motion.div>
          ) : (
            allDisplayed.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                onComplete={() => handleComplete(task)}
                onDelete={() => deleteTask(task.id)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex flex-col space-y-2">
        <AnimatePresence initial={false}>
          {allDisplayed.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-medium text-slate-400 px-2 py-4"
            >
              No tasks yet — plan one above ↑
            </motion.div>
          ) : (
            allDisplayed.map(task => (
              <TaskRowMobile
                key={task.id}
                task={task}
                onComplete={() => handleComplete(task)}
                onDelete={() => deleteTask(task.id)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      <ConfirmModal
        isOpen={!!confirmingTask}
        onClose={() => setConfirmingTask(null)}
        title="Cooldown Active"
        message={
          confirmingTask ? (
            <span>
              You must wait 6 hours after creating a task before you can complete it. It will unlock at{' '}
              <strong>
                {new Date(new Date(confirmingTask.created_at).getTime() + 6 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </strong>.
            </span>
          ) : null
        }
        cancelText="Got it"
      />
    </motion.section>
  );
}

function TaskRow({ task, onComplete, onDelete }: {
  task: Task;
  onComplete: () => void;
  onDelete: () => void;
}) {
  const credited = isCredited(task);
  const completed = task.status === 'completed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      whileHover={!completed ? { scale: 1.01, backgroundColor: "rgba(255,255,255,0.7)" } : {}}
      className={cn(
        "group flex items-center justify-between p-4 glass-card rounded-2xl transition-all border shadow-sm",
        completed
          ? credited
            ? "border-emerald-200/50 bg-emerald-50/30"
            : "border-amber-200/50 bg-amber-50/20 opacity-80"
          : "border-white/40 hover:border-white/70"
      )}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <button
          onClick={onComplete}
          disabled={completed}
          className={cn(
            "flex-shrink-0 transition-all",
            completed ? "cursor-default" : "hover:scale-110 active:scale-95"
          )}
        >
          {completed ? (
            <CheckCircle2 className={cn(
              "w-5 h-5",
              credited ? "text-emerald-500" : "text-amber-400"
            )} />
          ) : (
            <Circle className="w-5 h-5 text-slate-300 group-hover:text-slate-400 transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-semibold truncate",
            completed ? "text-slate-500 line-through decoration-slate-300" : "text-slate-800"
          )}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {completed && <TimeToCredit task={task} />}
            {credited && (
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                Credited ✓
              </span>
            )}
            {!completed && (
              <span className="text-[11px] font-medium text-slate-400">
                {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
        <span className={cn(
          "text-sm font-bold px-2.5 py-1 rounded-lg",
          completed
            ? credited
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-amber-500/10 text-amber-500"
            : "bg-slate-100/80 text-slate-600"
        )}>
          +{task.pts}
        </span>
        { !credited && (
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-400 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

function TaskRowMobile({ task, onComplete, onDelete }: {
  task: Task;
  onComplete: () => void;
  onDelete: () => void;
}) {
  const credited = isCredited(task);
  const completed = task.status === 'completed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex justify-between items-center p-3 glass-card rounded-xl transition-all border",
        completed
          ? credited
            ? "border-emerald-200/50 bg-emerald-50/20"
            : "border-amber-200/40 bg-amber-50/10 opacity-80"
          : "border-white/40 hover:bg-white/40"
      )}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <button
          onClick={onComplete}
          disabled={completed}
          className="flex-shrink-0"
        >
          {completed ? (
            <CheckCircle2 className={cn("w-4.5 h-4.5", credited ? "text-emerald-500" : "text-amber-400")} />
          ) : (
            <Circle className="w-4.5 h-4.5 text-slate-300" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <span className={cn(
            "text-sm font-medium truncate block",
            completed ? "text-slate-500 line-through decoration-slate-300" : "text-slate-800"
          )}>
            {task.title}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {completed && <TimeToCredit task={task} />}
            {credited && (
              <span className="text-[10px] font-semibold text-emerald-600">Credited ✓</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 ml-2">
        <span className={cn(
          "text-sm font-semibold px-2 py-0.5 rounded-md",
          completed
            ? credited ? "text-emerald-600 bg-emerald-500/10" : "text-amber-500 bg-amber-500/10"
            : "text-slate-600 bg-slate-100/80"
        )}>
          +{task.pts}
        </span>
        { !credited && (
          <button
            onClick={onDelete}
            className="p-1 rounded-lg text-slate-300 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

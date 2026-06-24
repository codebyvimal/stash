import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ListTodo } from 'lucide-react';
import { useStore } from '../../hooks/useStore';

export function TaskPlanner() {
  const [title, setTitle] = useState('');
  const [pts, setPts] = useState('');
  const [error, setError] = useState<string | null>(null);
  const addTask = useStore(s => s.addTask);

  const handleAdd = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    
    const ptsNum = parseInt(pts, 10);
    if (!ptsNum || ptsNum < 1) {
      setError("Please add points for this task.");
      return;
    }
    
    setError(null);
    addTask({ title: trimmed, pts: ptsNum });
    setTitle('');
    setPts('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mb-6 md:mb-8"
    >
      <div className="flex items-center gap-2 mb-3">
        <ListTodo className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Plan a Task
        </span>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex glass-element rounded-full p-1.5 items-center shadow-sm border border-white/80 transition-all focus-within:ring-2 focus-within:ring-slate-400/20 focus-within:bg-white/80 bg-white/40">
        <input
          type="text"
          placeholder="What will you get done?"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent px-5 py-3 focus:outline-none placeholder-slate-400 font-medium text-[15px]"
        />
        <div className="h-6 w-px bg-slate-300/60 mx-2" />
        <input
          type="number"
          placeholder="+ pts"
          value={pts}
          onChange={e => {
            setPts(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          className="w-24 bg-transparent px-3 py-3 focus:outline-none placeholder-emerald-400/70 font-bold text-emerald-600 text-[15px] text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          onClick={handleAdd}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-full p-3 ml-2 shadow-md transition-all active:scale-95 flex items-center justify-center group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Mobile */}
      <div className="relative flex items-center md:hidden w-full">
        <input
          type="text"
          placeholder="Plan a task..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-4 pr-24 py-3.5 bg-white/50 border border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 shadow-inner placeholder-slate-400 text-sm transition-all"
        />
        <div className="absolute right-2 flex items-center gap-1.5">
          <input
            type="number"
            placeholder="+pts"
            value={pts}
            onChange={e => {
              setPts(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            className="w-16 bg-transparent text-right font-medium text-blue-600 placeholder-blue-300 focus:outline-none text-sm pr-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={handleAdd}
            className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hint or Error */}
      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2 text-[12px] text-rose-500 font-medium px-2 flex items-center gap-1.5"
          >
            {error}
          </motion.p>
        ) : title.trim() && pts ? (
          <motion.p
            key="hint"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2 text-[11px] text-slate-400 font-medium px-2"
          >
            ⏱ Points credited 3 hours after task creation
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}

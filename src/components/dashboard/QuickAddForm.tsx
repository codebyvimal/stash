import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useStore } from '../../hooks/useStore';

export function QuickAddForm() {
  const [inputValue, setInputValue] = useState('');
  const [ptsValue, setPtsValue] = useState('');
  const addTransaction = useStore(s => s.addTransaction);

  const handleAddPts = () => {
    const pts = parseInt(ptsValue, 10);
    if (!ptsValue || isNaN(pts) || pts < 1) return;

    addTransaction({ 
      title: inputValue.trim() || 'Quick Add', 
      pts,
      type: 'earn' 
    });
    setInputValue('');
    setPtsValue('');
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
      className="mb-6 md:mb-8"
    >
      {/* Desktop Quick Add */}
      <div className="hidden md:flex glass-element rounded-full p-1.5 items-center shadow-sm border border-white/80 transition-all focus-within:ring-2 focus-within:ring-slate-400/20 focus-within:bg-white/80 bg-white/40">
        <input 
          type="text" 
          placeholder="What did you get done?" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 bg-transparent px-5 py-3 focus:outline-none placeholder-slate-400 font-medium text-[15px]"
        />
        
        <div className="h-6 w-px bg-slate-300/60 mx-2"></div>
        
        <input 
          type="number" 
          placeholder="+ pts" 
          value={ptsValue}
          onChange={(e) => setPtsValue(e.target.value)}
          className="w-24 bg-transparent px-3 py-3 focus:outline-none placeholder-emerald-400/70 font-bold text-emerald-600 text-[15px] text-right"
        />
        
        <button 
          onClick={handleAddPts}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-full p-3 ml-2 shadow-md transition-all active:scale-95 flex items-center justify-center group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Mobile Quick Add */}
      <div className="relative flex items-center md:hidden w-full">
        <input 
          type="text" 
          placeholder="Finished CS50 problem set..." 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full pl-4 pr-24 py-3.5 bg-white/50 border border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 shadow-inner placeholder-slate-400 text-sm transition-all transition-duration-200"
        />
        <div className="absolute right-2 flex items-center gap-1.5">
          <input 
            type="number" 
            placeholder="+100" 
            value={ptsValue}
            onChange={(e) => setPtsValue(e.target.value)}
            className="w-16 bg-transparent text-right font-medium text-blue-600 placeholder-blue-300 focus:outline-none text-sm pr-1"
          />
          <button 
            onClick={handleAddPts}
            className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-xl shadow-md transition-all active:scale-95"
          >
             <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.section>
  );
}

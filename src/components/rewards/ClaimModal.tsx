
import type { Reward } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift } from 'lucide-react';

interface ClaimModalProps {
  reward: Reward | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currencyName: string;
}

export function ClaimModal({ reward, isOpen, onClose, onConfirm, currencyName }: ClaimModalProps) {
  return (
    <AnimatePresence>
      {isOpen && reward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-white/10 flex flex-col"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100/50 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-600 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="h-32 bg-gradient-to-br from-indigo-400 to-purple-500 relative flex items-center justify-center">
              {reward.image_url ? (
                <img src={reward.image_url} alt={reward.title} className="w-full h-full object-cover opacity-80 mix-blend-overlay" />
              ) : (
                <Gift className="w-16 h-16 text-white/50" />
              )}
            </div>
            
            <div className="p-6 text-center">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Claim Reward</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Are you sure you want to spend <span className="font-bold text-slate-700 dark:text-slate-200">{reward.pts.toLocaleString()} {currencyName}</span> on <br/>
                <span className="font-semibold text-slate-800 dark:text-slate-100">"{reward.title}"</span>?
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

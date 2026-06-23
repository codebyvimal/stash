
import type { Reward } from '../../types';
import { Gift, Lock, Edit, Repeat } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface RewardCardProps {
  reward: Reward;
  currencyName: string;
  balance: number;
  onClaim: (reward: Reward) => void;
  onEdit: (reward: Reward) => void;
}

export function RewardCard({ reward, currencyName, balance, onClaim, onEdit }: RewardCardProps) {
  const isUnlocked = balance >= reward.pts;
  
  return (
    <motion.div
      whileHover={isUnlocked ? { y: -4 } : {}}
      className="bg-white/50 backdrop-blur-xl border border-white/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full"
    >
      <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative flex items-center justify-center">
        {reward.image_url ? (
          <img src={reward.image_url} alt={reward.title} className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
        ) : (
          <Gift className="w-12 h-12 text-white/50" />
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
          <div className={cn("w-2 h-2 rounded-full", isUnlocked ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-slate-400")} />
          <span className="text-xs font-bold text-slate-700">
            {reward.pts.toLocaleString()} {currencyName}
          </span>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-extrabold text-lg text-slate-900 leading-tight mb-2">
          {reward.title}
        </h3>
        {reward.description && (
          <p className="text-sm font-medium text-slate-600 mb-4 line-clamp-2">
            {reward.description}
          </p>
        )}
        <div className="flex gap-2 mb-4">
          {reward.is_repeatable && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">
              <Repeat className="w-3 h-3" />
              Repeatable
            </span>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 rounded-full text-slate-600">
              {reward.category}
            </span>
            <button
              onClick={() => onEdit(reward)}
              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
              title="Edit reward"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => onClaim(reward)}
            disabled={!isUnlocked}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              isUnlocked 
                ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95" 
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            {!isUnlocked && <Lock className="w-3.5 h-3.5" />}
            {isUnlocked ? 'Claim' : 'Locked'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

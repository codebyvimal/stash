import { motion } from 'framer-motion';
import { Gamepad2, Play, Package } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useMemo } from 'react';

interface RewardPreviewProps {
  onViewCatalog?: () => void;
}

export function RewardPreview({ onViewCatalog }: RewardPreviewProps) {
  const { rewards, balance, claimReward, transactions } = useStore();

  const previewRewards = useMemo(() => {
    const claimedRewardIds = new Set(
      transactions.filter(t => t.type === 'spend' && t.reward_id).map(t => t.reward_id)
    );

    const activeRewards = rewards.filter(r => r.is_repeatable || !claimedRewardIds.has(r.id));

    // Sort by: unlocked first (but not claimed yet), then closest to unlock
    return activeRewards.sort((a, b) => {
      const aUnlocked = balance >= a.pts;
      const bUnlocked = balance >= b.pts;
      
      if (aUnlocked && !bUnlocked) return -1;
      if (!aUnlocked && bUnlocked) return 1;
      
      return a.pts - b.pts;
    }).slice(0, 2);
  }, [rewards, balance, transactions]);

  const getIcon = (category?: string) => {
    if (category === 'Movies') return <Play className="w-3 h-3" />;
    if (category === 'Games') return <Gamepad2 className="w-3 h-3" />;
    return <Package className="w-3 h-3" />;
  };

  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 md:text-slate-500">
          <span className="hidden md:inline">Up Next</span>
          <span className="md:hidden">Available Rewards</span>
        </h3>
        <button onClick={onViewCatalog} className="text-xs font-medium md:font-semibold text-blue-600 md:text-slate-400 hover:underline md:hover:no-underline md:hover:text-blue-700 transition-colors">
          <span className="hidden md:inline">View Catalog →</span>
          <span className="md:hidden">View All</span>
        </button>
      </div>

      {/* Desktop Rewards List */}
      <div className="hidden md:flex flex-col gap-4">
        {previewRewards.length === 0 ? (
          <div className="text-sm font-medium text-slate-400">No rewards available.</div>
        ) : previewRewards.map((reward) => {
          const isUnlocked = balance >= reward.pts;
          const progressPercent = isUnlocked ? 100 : Math.min((balance / reward.pts) * 100, 100);

          return (
            <motion.div 
              key={reward.id}
              whileHover={isUnlocked ? { y: -2 } : {}}
              className={`h-44 rounded-[20px] relative overflow-hidden group flex flex-col justify-between p-5 text-white ${isUnlocked ? 'cursor-pointer shadow-md bg-slate-900 transition-all' : 'border border-slate-700/50 bg-slate-900'}`}
            >
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <img src={reward.image_url || "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=600"} alt={reward.category || 'Reward'} className={`w-full h-full object-cover ${isUnlocked ? 'opacity-60 group-hover:scale-105 transition-transform duration-700' : 'opacity-40 mix-blend-luminosity'}`} />
                <div className={`absolute inset-0 ${isUnlocked ? 'bg-gradient-to-t from-black/90 via-black/20 to-transparent' : 'bg-gradient-to-t from-slate-900/95 via-slate-900/60 to-slate-900/20'}`}></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 flex justify-between items-start">
                <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider ${isUnlocked ? 'text-white/90 mb-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 shadow-sm' : 'text-white/70 mb-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10'}`}>
                   {getIcon(reward.category)} {reward.category || 'Reward'}
                </span>
                <span className={`${isUnlocked ? 'text-white drop-shadow-md' : 'text-white/80'} text-xs font-bold px-2 py-1`}>
                  {reward.pts.toLocaleString()} pts
                </span>
              </div>
              
              <div className="relative z-10">
                <h4 className={`text-lg font-bold ${isUnlocked ? 'text-white drop-shadow-md' : 'text-white/90'} mb-3`}>{reward.title}</h4>
                {isUnlocked ? (
                  <div className="flex items-center justify-between">
                    <button onClick={(e) => { e.stopPropagation(); claimReward(reward.id); }} className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl shadow-lg transition-colors active:scale-95">Claim Reward</button>
                    <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5 drop-shadow-md">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span> Unlocked
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="h-1.5 w-full bg-slate-700/60 rounded-full overflow-hidden mb-2 backdrop-blur-sm">
                      <div className="h-full bg-slate-300 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-medium">
                      <span className="text-slate-300">{Math.round(progressPercent)}%</span>
                      <span className="text-slate-400">Need {(reward.pts - balance).toLocaleString()} more pts</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile Rewards Grid */}
      <div className="md:hidden grid grid-cols-2 gap-3.5">
        {previewRewards.length === 0 ? (
          <div className="text-sm font-medium text-slate-400 col-span-2">No rewards available.</div>
        ) : previewRewards.map((reward) => {
          const isUnlocked = balance >= reward.pts;

          return (
            <div key={reward.id} className={`aspect-square rounded-2xl relative overflow-hidden group flex flex-col justify-between p-3.5 shadow-sm text-white ${isUnlocked ? '' : 'border border-slate-700/50'}`}>
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <img src={reward.image_url || "https://images.unsplash.com/photo-1585951237318-9ea5e175b891?auto=format&fit=crop&q=80&w=400"} alt={reward.category || 'Reward'} className={`w-full h-full object-cover ${isUnlocked ? 'opacity-70' : 'opacity-50 mix-blend-luminosity'}`} />
                  <div className={`absolute inset-0 ${isUnlocked ? 'bg-gradient-to-t from-black/90 via-black/20 to-transparent' : 'bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent'}`}></div>
                </div>
                <div className="relative z-10">
                    <span className={`inline-flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-wider ${isUnlocked ? 'text-white/90 bg-black/40 shadow-sm' : 'text-white/80 bg-white/10 shadow-sm'} backdrop-blur-md px-1.5 py-0.5 rounded border border-white/10`}>
                      {getIcon(reward.category)} {reward.category || 'Reward'}
                    </span>
                    <h4 className={`text-sm font-bold ${isUnlocked ? 'text-white drop-shadow-md' : 'text-white/90'} mt-2 leading-tight`}>{reward.title}</h4>
                    <p className={`text-[11px] font-semibold ${isUnlocked ? 'text-emerald-400 drop-shadow-md' : 'text-slate-300'} mt-1`}>{reward.pts.toLocaleString()} pts</p>
                </div>
                {isUnlocked ? (
                  <button onClick={() => claimReward(reward.id)} className="relative z-10 w-full py-2 mt-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-md transition-all">Claim</button>
                ) : (
                  <div className="relative z-10 flex flex-col justify-end h-full mt-2">
                      <div className="w-full py-1.5 bg-white/10 backdrop-blur-md text-white/70 font-medium text-[10px] rounded-xl text-center border border-white/10">
                          Need {(reward.pts - balance).toLocaleString()} pts
                      </div>
                  </div>
                )}
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}

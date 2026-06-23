import { useState, useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { RewardCard } from './RewardCard';
import { ClaimModal } from './ClaimModal';
import { AddRewardModal } from './AddRewardModal';
import { EditRewardModal } from './EditRewardModal';
import { useToast } from '../ui/Toast';
import type { Reward } from '../../types';
import { motion } from 'framer-motion';
import { Gift, Plus, Archive, ChevronDown, ChevronUp } from 'lucide-react';

export function RewardsTab() {
  const { rewards, balance, settings, claimReward, addReward, updateReward, deleteReward, transactions } = useStore();
  const { toast } = useToast();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [rewardToEdit, setRewardToEdit] = useState<Reward | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const { activeRewards, archivedRewards } = useMemo(() => {
    const claimedRewardIds = new Set(
      transactions.filter(t => t.type === 'spend' && t.reward_id).map(t => t.reward_id)
    );

    const active: Reward[] = [];
    const archived: Reward[] = [];

    rewards.forEach(reward => {
      const isEnded = !reward.is_repeatable && claimedRewardIds.has(reward.id);
      if (isEnded) {
        archived.push(reward);
      } else {
        active.push(reward);
      }
    });

    const sortFn = (a: Reward, b: Reward) => {
      const aUnlocked = balance >= a.pts;
      const bUnlocked = balance >= b.pts;
      if (aUnlocked && !bUnlocked) return -1;
      if (!aUnlocked && bUnlocked) return 1;
      return a.pts - b.pts;
    };

    return {
      activeRewards: active.sort(sortFn),
      archivedRewards: archived.sort(sortFn)
    };
  }, [rewards, balance, transactions]);

  const handleClaimConfirm = () => {
    if (selectedReward) {
      claimReward(selectedReward.id);
      toast(`Successfully claimed "${selectedReward.title}"!`, 'success');
      setSelectedReward(null);
    }
  };

  const handleAddReward = (rewardData: Omit<Reward, 'id' | 'created_at'>) => {
    addReward(rewardData);
    toast(`Reward "${rewardData.title}" added successfully!`, 'success');
  };

  const handleRemoveReward = (id: string) => {
    deleteReward(id);
    toast('Reward deleted.', 'success');
  };

  const handleEditReward = (id: string, updates: Partial<Reward>) => {
    updateReward(id, updates);
    toast('Reward updated successfully!', 'success');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full space-y-6 relative"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Gift className="w-6 h-6 text-indigo-500" />
          Rewards
        </h2>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 text-white hover:bg-indigo-600 rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Reward
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 pr-2 custom-scrollbar">
        {activeRewards.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-64 text-slate-400"
          >
            <Gift className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium text-lg text-slate-500 dark:text-slate-400 mb-4">No active rewards</p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-2 bg-indigo-500 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20 hover:bg-indigo-600 transition-all active:scale-95"
            >
              Create your first reward →
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRewards.map(reward => (
              <RewardCard 
                key={reward.id} 
                reward={reward} 
                currencyName={settings.currency_name} 
                balance={balance} 
                onClaim={setSelectedReward} 
                onEdit={setRewardToEdit}
              />
            ))}
          </div>
        )}

        {archivedRewards.length > 0 && (
          <div className="mt-12">
            <button 
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 font-semibold mb-4 mx-auto"
            >
              <Archive className="w-4 h-4" />
              {showArchived ? 'Hide' : 'Show'} Archived Rewards ({archivedRewards.length})
              {showArchived ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showArchived && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-300"
              >
                {archivedRewards.map(reward => (
                  <RewardCard 
                    key={reward.id} 
                    reward={reward} 
                    currencyName={settings.currency_name} 
                    balance={0} // Force locked state for archived
                    onClaim={() => {}} 
                    onEdit={setRewardToEdit}
                  />
                ))}
              </motion.div>
            )}
          </div>
        )}
      </div>

      <ClaimModal 
        reward={selectedReward} 
        isOpen={selectedReward !== null} 
        onClose={() => setSelectedReward(null)} 
        onConfirm={handleClaimConfirm} 
        currencyName={settings.currency_name} 
      />

      <AddRewardModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddReward} 
        currencyName={settings.currency_name} 
      />

      <EditRewardModal
        reward={rewardToEdit}
        isOpen={rewardToEdit !== null}
        onClose={() => setRewardToEdit(null)}
        onEdit={handleEditReward}
        onDelete={handleRemoveReward}
        currencyName={settings.currency_name}
      />
    </motion.div>
  );
}

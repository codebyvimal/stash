import { motion } from 'framer-motion';
import { Play, Plus } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { cn } from '../../lib/utils';

export function ActivityList() {
  const transactions = useStore(s => s.transactions);

  const recentActivity = [...transactions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3);

  const formatTime = (isoString: string) => {
    const diffInSeconds = Math.floor((new Date().getTime() - new Date(isoString).getTime()) / 1000);
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return new Date(isoString).toLocaleDateString();
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
      className="flex-1 md:min-h-0 min-h-[160px]"
    >
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 md:text-slate-500">
          Recent Activity
        </h3>
        <span className="hidden md:inline-block px-2.5 py-1 rounded-md bg-white/40 text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-sm border border-white/50">Today</span>
      </div>
      
      {/* Desktop Activity List */}
      <div className="hidden md:flex flex-col space-y-3">
        {recentActivity.length === 0 ? (
          <div className="text-sm font-medium text-slate-400 px-2 py-4">No recent activity.</div>
        ) : recentActivity.map((item) => (
          <motion.div 
            key={item.id}
            whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.7)" }}
            className="group flex items-center justify-between p-4 glass-card rounded-2xl transition-all border border-white/40 shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shadow-sm",
                item.type === 'earn' ? "bg-emerald-100/80 text-emerald-600" : "bg-rose-100/80 text-rose-600"
              )}>
                {item.type === 'earn' ? <Plus className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">{formatTime(item.created_at)}</p>
              </div>
            </div>
            <span className={cn(
              "text-sm font-bold px-2.5 py-1 rounded-lg",
              item.type === 'earn' ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
            )}>
              {item.type === 'earn' ? '+' : '-'}{item.pts}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Mobile Activity List */}
      <div className="md:hidden flex flex-col space-y-2.5">
        {recentActivity.length === 0 ? (
          <div className="text-sm font-medium text-slate-400 px-2 py-4">No recent activity.</div>
        ) : recentActivity.map((item) => (
          <div key={item.id} className="flex justify-between items-center p-3 glass-card rounded-xl transition-all hover:bg-white/40">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-800">{item.title}</span>
              <span className="text-[11px] text-slate-400 font-medium">
                {item.type === 'earn' ? 'Earn' : 'Spend'} {item.category ? `• ${item.category}` : ''} • {formatTime(item.created_at)}
              </span>
            </div>
            <span className={cn(
              "text-sm font-semibold px-2 py-0.5 rounded-md",
              item.type === 'earn' ? "text-emerald-600 bg-emerald-500/10" : "text-rose-600 bg-rose-500/10"
            )}>
              {item.type === 'earn' ? '+' : '-'}{item.pts}
            </span>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

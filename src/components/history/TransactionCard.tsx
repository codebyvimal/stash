import type { Transaction } from '../../types';
import { CheckCircle2, Tag, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export type HistoryItem = Transaction & {
  is_pending_credit?: boolean;
};

interface TransactionCardProps {
  transaction: HistoryItem;
  currencyName: string;
}

export function TransactionCard({ transaction, currencyName }: TransactionCardProps) {
  const isEarn = transaction.type === 'earn';
  const isPending = transaction.is_pending_credit;
  
  // Use amber color if pending, otherwise emerald/rose
  const Icon = isPending ? Clock : (isEarn ? CheckCircle2 : Tag);
  
  const timeStr = new Date(transaction.created_at).toLocaleTimeString(undefined, { 
    hour: 'numeric', 
    minute: '2-digit' 
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/40 backdrop-blur-md border border-white/40 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shadow-inner",
          isPending ? "bg-amber-100 text-amber-600" 
            : (isEarn ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600")
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900">{transaction.title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-medium text-slate-600">{timeStr}</span>
            {transaction.category && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {transaction.category}
                </span>
              </>
            )}
            {isPending && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-xs font-medium text-amber-600">
                  Pending Credit
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className={cn(
        "font-bold text-lg whitespace-nowrap",
        isPending ? "text-amber-600" : (isEarn ? "text-emerald-600" : "text-rose-600")
      )}>
        {isEarn ? '+' : '-'}{transaction.pts.toLocaleString()} <span className="text-sm opacity-70 font-medium">{currencyName}</span>
      </div>
    </motion.div>
  );
}

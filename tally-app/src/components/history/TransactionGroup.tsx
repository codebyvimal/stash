import type { HistoryItem } from './TransactionCard';
import { TransactionCard } from './TransactionCard';

interface TransactionGroupProps {
  dateLabel: string;
  transactions: HistoryItem[];
  currencyName: string;
}

export function TransactionGroup({ dateLabel, transactions, currencyName }: TransactionGroupProps) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 pl-2">
        {dateLabel}
      </h3>
      <div className="flex flex-col gap-3">
        {transactions.map(t => (
          <TransactionCard key={t.id} transaction={t} currencyName={currencyName} />
        ))}
      </div>
    </div>
  );
}

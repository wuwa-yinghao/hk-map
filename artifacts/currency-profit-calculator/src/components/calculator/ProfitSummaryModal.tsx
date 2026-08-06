import { X, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProfitSummaryItem = {
  id: string;
  name: string;
  profit: number;
  mode: 'deposit' | 'withdraw' | 'mixed';
  settlementCurrency: 'USDT';
};

export function ProfitSummaryModal({
  isOpen,
  onClose,
  items,
  total,
}: {
  isOpen: boolean;
  onClose: () => void;
  items: ProfitSummaryItem[];
  total: number;
}) {
  if (!isOpen) return null;

  const formatProfit = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(3)}`;
  const valueClass = (value: number) => (
    value > 0 ? 'text-calc-pos' : value < 0 ? 'text-calc-neg' : 'text-muted-foreground'
  );

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-4 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+16px)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profit-summary-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-[#0A0C10]/80"
        aria-label="關閉利潤統計"
        onClick={onClose}
      />
      <div className="relative flex max-h-[80vh] w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-calc-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={17} className="text-calc-pos" />
            <h3 id="profit-summary-title" className="text-[15px] font-semibold">各幣種利潤統計</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
            aria-label="關閉利潤統計"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          <div className="mb-3 rounded-lg border border-calc-pos/20 bg-calc-pos/5 px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] text-muted-foreground">盈利總和</span>
              <span className={cn('font-mono text-xl font-bold tabular-nums', valueClass(total))}>
                {formatProfit(total)} USDT
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-calc-surface2 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-foreground">{item.name}</div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">
                    {item.mode === 'deposit' ? '入金' : item.mode === 'withdraw' ? '出金' : '多筆記錄'}
                  </div>
                </div>
                <span className={cn('shrink-0 font-mono text-[15px] font-semibold tabular-nums', valueClass(item.profit))}>
                  {formatProfit(item.profit)} USDT
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
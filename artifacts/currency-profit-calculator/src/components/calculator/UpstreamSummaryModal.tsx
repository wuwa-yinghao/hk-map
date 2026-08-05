import { ArrowUpFromLine, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type UpstreamSummaryItem = {
  id: string;
  name: string;
  amount: number;
  mode: 'deposit' | 'withdraw';
};

export function UpstreamSummaryModal({
  isOpen,
  onClose,
  items,
  total,
}: {
  isOpen: boolean;
  onClose: () => void;
  items: UpstreamSummaryItem[];
  total: number;
}) {
  if (!isOpen) return null;

  const formatAmount = (value: number) => value.toFixed(3);

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-4 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+16px)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upstream-summary-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-[#070B14]/80"
        aria-label="關閉上游金額統計"
        onClick={onClose}
      />
      <div className="relative flex max-h-[80vh] w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-calc-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <ArrowUpFromLine size={17} className="text-calc-up" />
            <h3 id="upstream-summary-title" className="text-[15px] font-semibold">各幣種上游金額</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
            aria-label="關閉上游金額統計"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          <div className="mb-3 rounded-lg border border-calc-up/20 bg-calc-up/5 px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] text-muted-foreground">上游金額總和</span>
              <span className="font-mono text-xl font-bold tabular-nums text-calc-up">
                {formatAmount(total)} USDT
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
                    {item.mode === 'deposit' ? '入金' : '出金'}
                  </div>
                </div>
                <span className={cn('shrink-0 font-mono text-[15px] font-semibold tabular-nums', 'text-calc-up')}>
                  {formatAmount(item.amount)} USDT
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
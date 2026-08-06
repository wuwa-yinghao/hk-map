import { ArrowUpFromLine, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FormulaHistoryEntry } from '@/hooks/use-formula-history';

export type UpstreamSummaryItem = {
  id: string;
  name: string;
  entries: FormulaHistoryEntry[];
  netAmount: number;
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
  const formatSignedAmount = (value: number) => `${value >= 0 ? '+' : ''}${formatAmount(value)}`;
  const formatInput = (value: string | number) => {
    const number = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(number)) return '0';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 }).format(number);
  };
  const calculateUpstream = (entry: FormulaHistoryEntry) => {
    const amount = Number(entry.amount) || 0;
    const point = Number(entry.upPoint) || 0;
    const rate = Number(entry.upRate) || 1;
    return (amount * ((100 - point) / 100)) / rate;
  };
  const formatTime = (value: string) => new Intl.DateTimeFormat('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
  const groupedItems = items.map((item) => ({
    ...item,
    entries: Array.isArray(item.entries) ? item.entries : [],
  }));

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
                <span className={total >= 0 ? 'text-calc-up' : 'text-calc-down'}>
                  {formatSignedAmount(total)} USDT
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {groupedItems.map((item) => (
              <section
                key={item.id}
                className="rounded-lg border border-border bg-calc-surface2 px-3 py-2.5"
                aria-labelledby={`upstream-${item.id}`}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h4 id={`upstream-${item.id}`} className="truncate text-[13px] font-semibold text-foreground">
                      {item.name}
                    </h4>
                    <p className={cn(
                      'font-mono text-[12px] font-semibold tabular-nums',
                      item.netAmount >= 0 ? 'text-calc-up' : 'text-calc-down',
                    )}>
                      {formatSignedAmount(item.netAmount)} USDT
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {item.entries.length} 筆
                  </span>
                </div>
                {item.entries.length === 0 ? (
                  <p className="py-1 text-[10px] text-muted-foreground">尚無上游公式記錄</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {item.entries.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-2">
                        <span className={cn(
                          'w-[32px] shrink-0 text-[10px] font-semibold',
                          entry.mode === 'deposit' ? 'text-calc-up' : 'text-calc-down',
                        )}>
                          {entry.mode === 'deposit' ? '入金' : '出金'}
                        </span>
                        <div
                          className="min-w-0 flex-1 overflow-x-auto rounded-md border border-calc-up/15 bg-calc-surface px-2 py-1 font-mono text-[10.5px] leading-relaxed text-muted-foreground"
                          aria-label={`${item.name}上游公式`}
                        >
                          <div className="whitespace-nowrap">
                            <span className="text-foreground">[{formatTime(entry.createdAt)}]</span>{' '}
                            {formatInput(entry.amount)} × {formatInput(100 - (Number(entry.upPoint) || 0))}% ÷ {formatInput(entry.upRate)} ={' '}
                            <b className="text-calc-up">
                              {formatAmount(entry.upResult ?? calculateUpstream(entry))}
                            </b>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {item.entries.some((entry) => entry.note) && (
                  <p className="mt-1.5 truncate text-[10px] text-muted-foreground">
                    備註：{item.entries.find((entry) => entry.note)?.note}
                  </p>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
import { ArrowDownToLine, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FormulaHistoryEntry } from '@/hooks/use-formula-history';
import { calculateProfit } from '@/hooks/use-calculator-state';

export type DownstreamSummaryItem = {
  id: string;
  name: string;
  entries: FormulaHistoryEntry[];
  netAmount: number;
};

export function DownstreamSummaryModal({
  isOpen,
  onClose,
  items,
  total,
}: {
  isOpen: boolean;
  onClose: () => void;
  items: DownstreamSummaryItem[];
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
  const calculateDownstream = (entry: FormulaHistoryEntry) => {
    return calculateProfit(entry).downResult;
  };
  const formatTime = (value: string) => new Intl.DateTimeFormat('zh-TW', {
    month: '2-digit',
    day: '2-digit',
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
      aria-labelledby="downstream-summary-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-[#070B14]/80"
        aria-label="關閉下游金額統計"
        onClick={onClose}
      />
      <div className="relative flex max-h-[80vh] w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-calc-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <ArrowDownToLine size={17} className="text-calc-down" />
            <h3 id="downstream-summary-title" className="text-[15px] font-semibold">各幣種下游金額</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
            aria-label="關閉下游金額統計"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          <div className="mb-3 rounded-lg border border-calc-down/20 bg-calc-down/5 px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] text-muted-foreground">下游金額總和</span>
              <span className={cn(
                'font-mono text-xl font-bold tabular-nums',
                total >= 0 ? 'text-calc-down' : 'text-calc-neg',
              )}>
                {formatSignedAmount(total)} USDT
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {groupedItems.length === 0 ? (
              <p className="py-4 text-center text-[12px] text-muted-foreground">尚無任何公式記錄</p>
            ) : (
              groupedItems.map((item) => (
                <section
                  key={item.id}
                  className="rounded-lg border border-border bg-calc-surface2 px-3 py-2.5"
                  aria-labelledby={`downstream-${item.id}`}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h4 id={`downstream-${item.id}`} className="truncate text-[13px] font-semibold text-foreground">
                        {item.name}
                      </h4>
                      <p className={cn(
                        'font-mono text-[12px] font-semibold tabular-nums',
                        item.netAmount >= 0 ? 'text-calc-down' : 'text-calc-neg',
                      )}>
                        {formatSignedAmount(item.netAmount)} USDT
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {item.entries.length} 筆
                    </span>
                  </div>
                  {item.entries.length === 0 ? (
                    <p className="py-1 text-[10px] text-muted-foreground">尚無下游公式記錄</p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {item.entries.map((entry) => {
                        const downResult = entry.downResult ?? calculateDownstream(entry);
                        return (
                          <div key={entry.id} className="flex items-center gap-2">
                            <span className={cn(
                              'w-[32px] shrink-0 text-[10px] font-semibold',
                              entry.mode === 'deposit' ? 'text-calc-up' : 'text-calc-down',
                            )}>
                              {entry.mode === 'deposit' ? '入金' : '出金'}
                            </span>
                            <div
                              className="min-w-0 flex-1 overflow-x-auto rounded-md border border-calc-down/15 bg-calc-surface px-2 py-1 font-mono text-[10.5px] leading-relaxed text-muted-foreground"
                              aria-label={`${item.name}下游公式`}
                            >
                              <div className="whitespace-nowrap">
                                <span className="text-foreground">[{formatTime(entry.createdAt)}]</span>{' '}
                                {formatInput(entry.amount)} × {formatInput(100 - (Number(entry.downPoint) || 0))}% ÷ {formatInput(entry.downRate)} ={' '}
                                <b className="text-calc-down">
                                  {formatAmount(downResult)}
                                </b>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {item.entries.some((entry) => entry.note) && (
                    <p className="mt-1.5 truncate text-[10px] text-muted-foreground">
                      備註：{item.entries.find((entry) => entry.note)?.note}
                    </p>
                  )}
                </section>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

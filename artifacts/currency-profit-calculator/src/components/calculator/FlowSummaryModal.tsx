import { ArrowDownToLine, ArrowUpFromLine, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateProfit } from '@/hooks/use-calculator-state';
import type { FormulaHistoryEntry } from '@/hooks/use-formula-history';

export type FlowSummaryDirection = 'upstream' | 'downstream';

export type FlowSummaryItem = {
  id: string;
  name: string;
  entries: FormulaHistoryEntry[];
  netAmount: number;
};

type FlowSummaryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  items: FlowSummaryItem[];
  total: number;
  direction: FlowSummaryDirection;
};

type DirectionConfig = {
  icon: LucideIcon;
  title: string;
  totalLabel: string;
  emptyEntryLabel: string;
  formulaLabel: string;
  resultColor: string;
  totalBorderColor: string;
  totalBackgroundColor: string;
  formulaBorderColor: string;
  positiveColor: string;
};

const directionConfig: Record<FlowSummaryDirection, DirectionConfig> = {
  upstream: {
    icon: ArrowUpFromLine,
    title: '各幣種上游金額',
    totalLabel: '上游金額總和',
    emptyEntryLabel: '尚無上游公式記錄',
    formulaLabel: '上游公式',
    resultColor: 'text-calc-up',
    totalBorderColor: 'border-calc-up/20',
    totalBackgroundColor: 'bg-calc-up/5',
    formulaBorderColor: 'border-calc-up/15',
    positiveColor: 'text-calc-up',
  },
  downstream: {
    icon: ArrowDownToLine,
    title: '各幣種下游金額',
    totalLabel: '下游金額總和',
    emptyEntryLabel: '尚無下游公式記錄',
    formulaLabel: '下游公式',
    resultColor: 'text-calc-down',
    totalBorderColor: 'border-calc-down/20',
    totalBackgroundColor: 'bg-calc-down/5',
    formulaBorderColor: 'border-calc-down/15',
    positiveColor: 'text-calc-down',
  },
};

function formatAmount(value: number) {
  return value.toFixed(3);
}

function formatSignedAmount(value: number) {
  return `${value >= 0 ? '+' : ''}${formatAmount(value)}`;
}

function formatInput(value: string | number) {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return '0';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 }).format(number);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

export function FlowSummaryModal({
  isOpen,
  onClose,
  items,
  total,
  direction,
}: FlowSummaryModalProps) {
  if (!isOpen) return null;

  const config = directionConfig[direction];
  const Icon = config.icon;
  const resultKey = direction === 'upstream' ? 'upResult' : 'downResult';
  const amountKey = direction === 'upstream' ? 'upAmount' : 'downAmount';
  const pointKey = direction === 'upstream' ? 'upPoint' : 'downPoint';
  const rateKey = direction === 'upstream' ? 'upRate' : 'downRate';
  const dialogTitle = `${config.title}`;
  const getResult = (entry: FormulaHistoryEntry) => (
    entry[resultKey] ?? calculateProfit(entry)[resultKey]
  );

  const groupedItems = items.map((item) => ({
    ...item,
    entries: Array.isArray(item.entries) ? item.entries : [],
  }));

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-4 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+16px)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${direction}-summary-title`}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-[#070B14]/80"
        aria-label={`關閉${config.title}`}
        onClick={onClose}
      />
      <div className="relative flex max-h-[80vh] w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-calc-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Icon size={17} className={config.resultColor} />
            <h3 id={`${direction}-summary-title`} className="text-[15px] font-semibold">
              {dialogTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
            aria-label={`關閉${config.title}`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          <div className={cn(
            'mb-3 rounded-lg border px-3 py-2.5',
            config.totalBorderColor,
            config.totalBackgroundColor,
          )}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] text-muted-foreground">{config.totalLabel}</span>
              <span className={cn(
                'font-mono text-xl font-bold tabular-nums',
                total >= 0 ? config.positiveColor : 'text-calc-neg',
              )}>
                {formatSignedAmount(total)} USDT
              </span>
            </div>
          </div>

          {groupedItems.length === 0 ? (
            <p className="py-4 text-center text-[12px] text-muted-foreground">尚無任何公式記錄</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {groupedItems.map((item) => (
                <section
                  key={item.id}
                  className="rounded-lg border border-border bg-calc-surface2 px-3 py-2.5"
                  aria-labelledby={`${direction}-${item.id}`}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h4 id={`${direction}-${item.id}`} className="truncate text-[13px] font-semibold text-foreground">
                        {item.name}
                      </h4>
                      <p className={cn(
                        'font-mono text-[12px] font-semibold tabular-nums',
                        item.netAmount >= 0 ? config.positiveColor : 'text-calc-neg',
                      )}>
                        {formatSignedAmount(item.netAmount)} USDT
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {item.entries.length} 筆
                    </span>
                  </div>

                  {item.entries.length === 0 ? (
                    <p className="py-1 text-[10px] text-muted-foreground">{config.emptyEntryLabel}</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {(['deposit', 'withdraw'] as const).map((mode) => {
                        const modeEntries = item.entries.filter((entry) => entry.mode === mode);
                        if (modeEntries.length === 0) return null;

                        return (
                          <div key={mode} className="flex flex-col gap-1">
                            <div className={cn(
                              'text-[10px] font-semibold',
                              mode === 'deposit' ? 'text-calc-up' : 'text-calc-down',
                            )}>
                              {mode === 'deposit' ? '入金' : '出金'}
                            </div>
                            <div className="flex flex-col gap-1">
                              {modeEntries.map((entry) => {
                                const result = getResult(entry);
                                const point = Number(entry[pointKey]) || 0;
                                const rate = Number(entry[rateKey]) || 1;

                                return (
                                  <div
                                    key={entry.id}
                                    className={cn(
                                      'w-full rounded-md border bg-calc-surface px-2 py-1 font-mono text-[10.5px] leading-relaxed text-muted-foreground',
                                      config.formulaBorderColor,
                                    )}
                                    aria-label={`${item.name}${config.formulaLabel}`}
                                  >
                                    <div className="break-words">
                                      <div>
                                        <span className="text-foreground">[{formatTime(entry.createdAt)}]</span>{' '}
                                        <span className="text-muted-foreground/80">備註：</span>
                                        <span className="text-foreground/80">{entry.note || '—'}</span>
                                      </div>
                                      <div className="mt-0.5">
                                        {formatInput(entry[amountKey])} × {formatInput(100 - point)}% ÷ {formatInput(rate)} ={' '}
                                        <b className={config.resultColor}>{formatAmount(result)} USDT</b>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { X, TrendingUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FormulaHistoryEntry } from '@/hooks/use-formula-history';
import { calculateProfit } from '@/hooks/use-calculator-state';

export type ProfitSummaryItem = {
  id: string;
  name: string;
  profit: number;
  mode: 'deposit' | 'withdraw' | 'mixed';
  settlementCurrency: 'USDT';
  entries: FormulaHistoryEntry[];
};

function formatAmount(value: number) {
  return value.toFixed(3);
}

function formatSigned(value: number) {
  return `${value >= 0 ? '+' : ''}${formatAmount(value)}`;
}

function formatInput(value: string | number) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return '0';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 }).format(n);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

function EntryRow({ entry }: { entry: FormulaHistoryEntry }) {
  const up = entry.upResult ?? calculateProfit(entry).upResult;
  const down = entry.downResult ?? calculateProfit(entry).downResult;
  const profit = entry.mode === 'deposit' ? up - down : down - up;
  const isDeposit = entry.mode === 'deposit';
  const profitColor = profit > 0 ? 'text-calc-pos' : profit < 0 ? 'text-calc-neg' : 'text-muted-foreground';

  // formula: 入金 → 上游 − 下游 = profit；出金 → 下游 − 上游 = profit
  const formulaStr = isDeposit
    ? `${formatAmount(up)} − ${formatAmount(down)} = `
    : `${formatAmount(down)} − ${formatAmount(up)} = `;

  return (
    <div className="flex flex-col gap-0.5 py-2 border-t border-border/50 first:border-0 first:pt-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={cn(
            'text-[10px] font-semibold px-1.5 py-0.5 rounded',
            isDeposit
              ? 'bg-calc-up/10 text-calc-up'
              : 'bg-calc-down/10 text-calc-down',
          )}>
            {isDeposit ? '入金' : '出金'}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {formatDateTime(entry.createdAt)}
          </span>
        </div>
        <span className={cn('font-mono text-[12px] font-bold tabular-nums', profitColor)}>
          {formatSigned(profit)}
        </span>
      </div>

      {/* 公式行 */}
      <div
        className="overflow-x-auto rounded-md border border-border/40 bg-calc-surface px-2 py-1 font-mono text-[10.5px] text-muted-foreground"
        aria-label="利潤公式"
      >
        <div className="whitespace-nowrap">
          金額&nbsp;
          <span className="text-foreground/80">{formatInput(entry.amount)}</span>
          {'　'}
          <span className="text-calc-up/80">上游&nbsp;{formatAmount(up)}</span>
          {'　'}
          <span className="text-calc-down/80">下游&nbsp;{formatAmount(down)}</span>
          {'　'}
          {formulaStr}
          <b className={profitColor}>{formatSigned(profit)}</b>
          &nbsp;USDT
        </div>
      </div>

      {entry.note ? (
        <p className="text-[10px] text-muted-foreground truncate pl-0.5">備註：{entry.note}</p>
      ) : null}
    </div>
  );
}

function CurrencySection({ item }: { item: ProfitSummaryItem }) {
  const [open, setOpen] = useState(false);
  const profitColor = item.profit > 0 ? 'text-calc-pos' : item.profit < 0 ? 'text-calc-neg' : 'text-muted-foreground';
  const borderColor = item.profit > 0 ? 'border-calc-pos/20' : item.profit < 0 ? 'border-calc-neg/20' : 'border-border';

  return (
    <section className={cn('rounded-lg border bg-calc-surface2', borderColor)}>
      {/* 幣種標頭 — 點擊展開 */}
      <button
        type="button"
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-foreground">{item.name}</div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">
            {item.mode === 'deposit' ? '入金' : item.mode === 'withdraw' ? '出金' : '多筆記錄'}
            {' · '}
            {item.entries.length} 筆
          </div>
        </div>
        <span className={cn('shrink-0 font-mono text-[15px] font-semibold tabular-nums', profitColor)}>
          {formatSigned(item.profit)}
        </span>
        <ChevronDown
          size={14}
          className={cn('shrink-0 text-muted-foreground transition-transform duration-150', open && 'rotate-180')}
        />
      </button>

      {/* 展開的單筆記錄 */}
      {open && (
        <div className="border-t border-border/60 px-3 pb-2">
          {item.entries.length === 0 ? (
            <p className="py-2 text-[10px] text-muted-foreground">尚無公式記錄</p>
          ) : (
            item.entries.map((entry) => (
              <EntryRow key={entry.id} entry={entry} />
            ))
          )}
        </div>
      )}
    </section>
  );
}

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
      <div className="relative flex max-h-[82vh] w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-calc-surface shadow-2xl">
        {/* 標頭 */}
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
          {/* 總和 */}
          <div className={cn(
            'mb-3 rounded-lg border px-3 py-2.5',
            total > 0 ? 'border-calc-pos/20 bg-calc-pos/5' : total < 0 ? 'border-calc-neg/20 bg-calc-neg/5' : 'border-border bg-calc-surface2',
          )}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] text-muted-foreground">盈利總和</span>
              <span className={cn(
                'font-mono text-xl font-bold tabular-nums',
                total > 0 ? 'text-calc-pos' : total < 0 ? 'text-calc-neg' : 'text-muted-foreground',
              )}>
                {formatSigned(total)} USDT
              </span>
            </div>
          </div>

          {/* 各幣種（可展開） */}
          {items.length === 0 ? (
            <p className="py-4 text-center text-[12px] text-muted-foreground">尚無任何公式記錄</p>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <CurrencySection key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { BookMarked, Plus, Trash2 } from 'lucide-react';
import { FormulaHistoryEntry } from '@/hooks/use-formula-history';

export function FormulaHistory({
  currencyName,
  note,
  onNoteChange,
  onSave,
  entries,
  onRemove,
}: {
  currencyName: string;
  note: string;
  onNoteChange: (value: string) => void;
  onSave: () => void;
  entries: FormulaHistoryEntry[];
  onRemove: (id: string) => void;
}) {
  const formatDate = (value: string) => new Intl.DateTimeFormat('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

  return (
    <section className="rounded-[10px] border border-border bg-calc-surface p-3" aria-labelledby="formula-history-title">
      <div className="mb-2.5 flex items-center gap-1.5">
        <BookMarked size={15} className="text-calc-source" />
        <h3 id="formula-history-title" className="text-[12px] font-semibold text-foreground">公式記錄</h3>
        <span className="ml-auto text-[10px] text-muted-foreground">{currencyName}・{entries.length} 筆</span>
      </div>

      <div className="flex gap-2">
        <input
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="新增備註（選填）"
          aria-label="公式記錄備註"
          className="min-w-0 flex-1 rounded-md border border-border bg-calc-surface2 px-2.5 py-2 text-[12px] text-foreground outline-none placeholder:text-muted-foreground focus:border-calc-source"
        />
        <button
          type="button"
          onClick={onSave}
          className="flex shrink-0 items-center justify-center gap-1 rounded-md border border-calc-source/40 bg-calc-source/10 px-3 text-[12px] font-semibold text-calc-source active:bg-calc-source/20"
        >
          <Plus size={14} />
          保存
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="py-4 text-center text-[11px] text-muted-foreground">尚無公式記錄</p>
      ) : (
        <div className="mt-3 flex max-h-72 flex-col gap-2 overflow-y-auto pr-0.5">
          {entries.map((entry) => (
            <article key={entry.id} className="rounded-lg border border-border bg-calc-surface2 px-2.5 py-2.5">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${entry.mode === 'deposit' ? 'bg-calc-up/15 text-calc-up' : 'bg-calc-down/15 text-calc-down'}`}>
                      {entry.mode === 'deposit' ? '入金' : '出金'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{formatDate(entry.createdAt)}</span>
                  </div>
                  {entry.note && <p className="mt-1 truncate text-[12px] text-foreground">{entry.note}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(entry.id)}
                  aria-label="刪除公式記錄"
                  className="rounded p-1 text-muted-foreground active:bg-calc-neg/10 active:text-calc-neg"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[10px] text-muted-foreground">
                <span>金額 <b className="text-foreground">{entry.amount}</b></span>
                <span>實時匯率 <b className="text-calc-source">{entry.srcRate}</b></span>
                <span>上游點位 <b className="text-calc-up">{entry.upPoint}%</b></span>
                <span>上游匯率 <b className="text-calc-up">{entry.upRate}</b></span>
                <span>下游點位 <b className="text-calc-down">{entry.downPoint}%</b></span>
                <span>下游匯率 <b className="text-calc-down">{entry.downRate}</b></span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
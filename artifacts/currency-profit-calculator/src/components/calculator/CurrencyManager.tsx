import { useState } from 'react';
import { X, Plus, AlertCircle, Check, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Currency } from '@/hooks/use-currencies';

export function CurrencyManager({ 
  isOpen, 
  onClose, 
  currencies, 
  onAdd, 
  onRemove,
  onUpdate,
  onMove,
}: { 
  isOpen: boolean, 
  onClose: () => void,
  currencies: Currency[],
  onAdd: (name: string) => void,
  onRemove: (id: string) => void,
  onUpdate: (id: string, name: string) => void,
  onMove: (id: string, direction: 'up' | 'down') => void,
}) {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) {
      setError('請輸入幣種名稱');
      return;
    }
    onAdd(name);
    setNewName('');
    setError('');
  };

  const beginEdit = (currency: Currency) => {
    setEditingId(currency.id);
    setEditName(currency.name);
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setError('');
  };

  const saveEdit = () => {
    const name = editName.trim();
    if (!name) {
      setError('請輸入幣種名稱');
      return;
    }
    const currency = currencies.find(c => c.id === editingId);
    if (currency) onUpdate(currency.id, name);
    cancelEdit();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <div
            className="absolute inset-0 bg-[#0A0C10]/80"
            onClick={onClose}
          />
          <div
            className="relative w-full max-w-sm bg-calc-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-[15px]">管理幣種</h3>
              <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground rounded-md">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto max-h-[45vh]">
              <div className="flex flex-col gap-2">
                {currencies.map((c, index) => (
                  <div key={c.id} className="bg-calc-surface2 border border-border rounded-lg px-3 py-2.5">
                    {editingId === c.id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          aria-label="編輯幣種名稱"
                          autoFocus
                          className="w-full bg-calc-surface border border-border rounded-md px-2.5 py-2 text-[13px] outline-none focus:border-primary"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                          >
                            <X size={13} />
                            取消
                          </button>
                          <button
                            type="button"
                            onClick={saveEdit}
                            className="flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/20"
                          >
                            <Check size={13} />
                            儲存
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[13px] text-muted-foreground">{c.name}</span>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onMove(c.id, 'up')}
                            disabled={index === 0}
                            aria-label={`將${c.name}上移`}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-25"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onMove(c.id, 'down')}
                            disabled={index === currencies.length - 1}
                            aria-label={`將${c.name}下移`}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-25"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => beginEdit(c)}
                            aria-label={`編輯${c.name}`}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (currencies.length === 1) {
                                setError('至少保留一個幣種');
                                return;
                              }
                              onRemove(c.id);
                            }}
                            aria-label={`刪除${c.name}`}
                            className="rounded-md p-1.5 text-calc-neg/80 hover:bg-calc-neg/10 hover:text-calc-neg"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-border bg-calc-surface2/50">
              <h4 className="text-[12px] font-medium text-muted-foreground mb-2">新增幣種</h4>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="幣種名稱"
                className="w-full mb-2 bg-calc-surface border border-border rounded-md px-3 py-2 text-[13px] outline-none focus:border-primary"
              />
              {error && (
                <div className="flex items-center gap-1.5 text-calc-neg text-[11px] mb-2">
                  <AlertCircle size={12} />
                  <span>{error}</span>
                </div>
              )}
              <button 
                onClick={handleAdd}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-md font-semibold text-[13px]"
              >
                <Plus size={16} />
                <span>新增</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

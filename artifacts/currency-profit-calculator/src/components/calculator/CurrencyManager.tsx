import { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Currency } from '@/hooks/use-currencies';

export function CurrencyManager({ 
  isOpen, 
  onClose, 
  currencies, 
  onAdd, 
  onRemove 
}: { 
  isOpen: boolean, 
  onClose: () => void,
  currencies: Currency[],
  onAdd: (code: string, name: string) => void,
  onRemove: (id: string) => void
}) {
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!newCode.trim() || !newName.trim()) {
      setError('請輸入幣種代碼與名稱');
      return;
    }
    if (currencies.some(c => c.code.toUpperCase() === newCode.trim().toUpperCase())) {
      setError('該幣種代碼已存在');
      return;
    }
    onAdd(newCode.trim().toUpperCase(), newName.trim());
    setNewCode('');
    setNewName('');
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0A0C10]/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-calc-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-[15px]">管理幣種</h3>
              <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto max-h-[45vh]">
              <div className="flex flex-col gap-2">
                {currencies.map(c => (
                  <div key={c.id} className="flex items-center justify-between bg-calc-surface2 border border-border rounded-lg px-3 py-2.5">
                    <div>
                      <span className="font-bold text-[14px] font-mono mr-2">{c.code}</span>
                      <span className="text-[13px] text-muted-foreground">{c.name}</span>
                    </div>
                    {!c.isDefault && (
                      <button 
                        onClick={() => onRemove(c.id)}
                        className="text-calc-neg/80 hover:text-calc-neg transition-colors p-1"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-border bg-calc-surface2/50">
              <h4 className="text-[12px] font-medium text-muted-foreground mb-2">新增幣種</h4>
              <div className="flex gap-2 mb-2">
                <input 
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="代碼 (例: THB)"
                  className="flex-1 w-full bg-calc-surface border border-border rounded-md px-3 py-2 text-[13px] outline-none focus:border-primary transition-colors font-mono uppercase"
                  maxLength={5}
                />
                <input 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="名稱 (例: 泰銖)"
                  className="flex-[1.5] w-full bg-calc-surface border border-border rounded-md px-3 py-2 text-[13px] outline-none focus:border-primary transition-colors"
                />
              </div>
              {error && (
                <div className="flex items-center gap-1.5 text-calc-neg text-[11px] mb-2">
                  <AlertCircle size={12} />
                  <span>{error}</span>
                </div>
              )}
              <button 
                onClick={handleAdd}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-md font-semibold text-[13px] transition-colors"
              >
                <Plus size={16} />
                <span>新增</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

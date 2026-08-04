import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X } from 'lucide-react';
import { Currency } from '@/hooks/use-currencies';
import { cn } from '@/lib/utils';

export function CurrencyRail({
  isOpen,
  onClose,
  currencies,
  activeId,
  onSelect,
  onOpenManager
}: {
  isOpen: boolean;
  onClose: () => void;
  currencies: Currency[];
  activeId: string;
  onSelect: (id: string) => void;
  onOpenManager: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0A0C10]/60 backdrop-blur-sm z-[70] touch-none"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed top-0 left-0 bottom-0 w-[260px] bg-calc-surface border-r border-border z-[80] shadow-[10px_0_30px_rgba(0,0,0,0.5)] flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-muted-foreground text-[13px] tracking-wider uppercase">切換幣種</h2>
              <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded-md">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-2 flex flex-col">
              {currencies.map(c => (
                <button
                  key={c.id}
                  onClick={() => { onSelect(c.id); onClose(); }}
                  className={cn(
                    "flex items-center justify-between w-full px-5 py-3.5 text-left transition-colors",
                    activeId === c.id 
                      ? "bg-primary/10 border-l-[3px] border-primary text-primary" 
                      : "border-l-[3px] border-transparent text-muted-foreground hover:bg-calc-surface2 hover:text-foreground"
                  )}
                >
                  <span className="font-mono font-bold text-[16px]">{c.code}</span>
                  <span className="text-[13px] font-medium">{c.name}</span>
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-border bg-calc-surface2/30">
              <button 
                onClick={() => {
                  onClose();
                  onOpenManager();
                }}
                className="w-full py-2.5 rounded-lg border border-border bg-calc-surface2 text-foreground text-[13px] font-semibold flex items-center justify-center gap-2 transition-all hover:border-primary hover:text-primary active:scale-95"
              >
                <Settings size={16} />
                管理自訂幣種
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

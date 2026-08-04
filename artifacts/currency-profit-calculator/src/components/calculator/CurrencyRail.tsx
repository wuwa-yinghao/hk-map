import { AnimatePresence, motion } from 'framer-motion';
import { Settings, X } from 'lucide-react';
import { Currency } from '@/hooks/use-currencies';
import { cn } from '@/lib/utils';

export function CurrencyRail({
  isOpen,
  onClose,
  currencies,
  activeId,
  hoverId,
  side,
  anchorY,
  onSelect,
  onHover,
  onOpenManager,
}: {
  isOpen: boolean;
  onClose: () => void;
  currencies: Currency[];
  activeId: string;
  hoverId: string | null;
  side: 'left' | 'right';
  anchorY: number;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onOpenManager: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: side === 'left' ? -92 : 92, scale: 0.88 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: side === 'left' ? -92 : 92, scale: 0.88 }}
          transition={{ type: 'spring', damping: 23, stiffness: 300 }}
          className={cn(
            'fixed z-[80] flex -translate-y-1/2 flex-col items-center gap-2',
            side === 'left' ? 'left-3' : 'right-3',
          )}
          style={{ top: `${anchorY}px` }}
          data-html2canvas-ignore="true"
          aria-label="浮動幣種切換"
        >
          <div className="pointer-events-none absolute inset-x-1/2 top-1/2 h-[calc(100%+24px)] w-px -translate-x-1/2 -translate-y-1/2 bg-primary/20" />

          {currencies.map((currency) => {
            const isActive = activeId === currency.id;
            const isHovered = hoverId === currency.id;

            return (
              <motion.button
                key={currency.id}
                type="button"
                whileTap={{ scale: 0.88 }}
                onClick={() => {
                  onSelect(currency.id);
                  onHover(null);
                  onClose();
                }}
                onPointerEnter={() => onHover(currency.id)}
                onPointerLeave={() => onHover(null)}
                className={cn(
                  'relative flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full border font-mono shadow-[0_6px_18px_rgba(0,0,0,0.45)] transition-colors',
                  isActive || isHovered
                    ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_20px_rgba(76,158,255,0.42)]'
                    : 'border-border bg-calc-surface text-muted-foreground hover:border-primary/70 hover:text-foreground',
                )}
                data-currency-id={currency.id}
                aria-label={`切換至${currency.name} ${currency.code}`}
              >
                <span className="text-[11px] font-bold leading-none">{currency.code}</span>
                <span className="mt-0.5 max-w-[42px] truncate font-sans text-[9px] leading-none">
                  {currency.name}
                </span>
                {isHovered && (
                  <span
                    className={cn(
                      'pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-primary/30 bg-calc-surface px-2 py-1 font-sans text-[10px] text-foreground shadow-xl',
                      side === 'left' ? 'left-[58px]' : 'right-[58px]',
                    )}
                  >
                    {currency.name}
                  </span>
                )}
              </motion.button>
            );
          })}

          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={() => {
              onHover(null);
              onClose();
              onOpenManager();
            }}
            onPointerEnter={() => onHover(null)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-calc-surface2 text-muted-foreground shadow-[0_6px_18px_rgba(0,0,0,0.4)] transition-colors hover:border-primary hover:text-primary"
            aria-label="管理幣種"
          >
            <Settings size={16} />
          </motion.button>

          <button
            type="button"
            onClick={() => {
              onHover(null);
              onClose();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border/80 bg-calc-surface text-muted-foreground shadow-lg transition-colors hover:text-foreground"
            aria-label="關閉浮動幣種切換"
          >
            <X size={13} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
import { Settings } from 'lucide-react';
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
  managerHover,
  onManagerHover,
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
  managerHover: boolean;
  onManagerHover: (hovered: boolean) => void;
}) {
  if (!isOpen) return null;

  const itemCount = currencies.length + 1;
  const itemSpacing = 54;
  const railHeight = Math.max(230, (itemCount - 1) * itemSpacing + 52);
  const center = (itemCount - 1) / 2;

  const getPosition = (index: number) => {
    const offset = index - center;
    return {
      x: side === 'left'
        ? 62 - Math.abs(offset) * 8
        : 68 + Math.abs(offset) * 8,
      y: railHeight / 2 + offset * itemSpacing,
    };
  };

  return (
    <div
      className={cn(
        'fixed z-[80] w-[130px] -translate-y-1/2 pointer-events-none',
        side === 'left' ? 'left-0' : 'right-0',
      )}
      style={{ top: `${anchorY}px`, height: `${railHeight}px` }}
      data-html2canvas-ignore="true"
      aria-label="浮動幣種切換"
    >
      {currencies.map((currency, index) => {
        const isActive = activeId === currency.id;
        const isHovered = hoverId === currency.id;
        const { x, y } = getPosition(index);

        return (
          <button
            key={currency.id}
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            onPointerEnter={() => {
              onHover(currency.id);
              onSelect(currency.id);
            }}
            onPointerLeave={() => onHover(null)}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(currency.id);
              onHover(null);
              onClose();
            }}
            className={cn(
              'pointer-events-auto absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border font-mono shadow-[0_6px_18px_rgba(0,0,0,0.45)]',
              isActive || isHovered
                ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_20px_rgba(76,158,255,0.42)]'
                : 'border-border bg-calc-surface text-muted-foreground',
            )}
            style={{ left: `${x}px`, top: `${y}px` }}
            data-currency-id={currency.id}
            aria-label={`切換至${currency.name}`}
          >
            <span className="max-w-[40px] truncate font-sans text-[10px] font-semibold leading-tight">
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
          </button>
        );
      })}

      {(() => {
        const { x, y } = getPosition(currencies.length);
        return (
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onHover(null);
              onManagerHover(false);
              onClose();
              onOpenManager();
            }}
            onPointerEnter={() => {
              onHover(null);
              onManagerHover(true);
            }}
            onPointerLeave={() => onManagerHover(false)}
            className={cn(
              'pointer-events-auto absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-muted-foreground shadow-[0_6px_18px_rgba(0,0,0,0.4)]',
              managerHover
                ? 'border-primary bg-primary/15 text-primary shadow-[0_0_18px_rgba(76,158,255,0.32)]'
                : 'border-border bg-calc-surface2',
            )}
            data-manager-button="true"
            aria-label="設置幣種"
            title="設置幣種"
            style={{ left: `${x}px`, top: `${y}px` }}
          >
            <Settings size={16} />
          </button>
        );
      })()}
    </div>
  );
}
import { Plus, Settings, Trash2, X } from 'lucide-react';
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
  onQuickAdd,
  onToggleDeleteMode,
  onDeleteCurrency,
  isDeleteMode,
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
  onQuickAdd: () => void;
  onToggleDeleteMode: () => void;
  onDeleteCurrency: (id: string) => void;
  isDeleteMode: boolean;
  managerHover: boolean;
  onManagerHover: (hovered: boolean) => void;
}) {
  if (!isOpen) return null;

  const itemCount = currencies.length + 3;
  const center = (itemCount - 1) / 2;
  const buttonSpacing = Math.min(46, 184 / Math.max(itemCount - 1, 1));
  const arcRadius = 92;
  const arcStep = Math.asin(buttonSpacing / arcRadius);

  const getPosition = (index: number) => {
    const arcAngle = (index - center) * arcStep;
    return {
      x: side === 'left'
        ? 18 + arcRadius * Math.cos(arcAngle)
        : 112 - arcRadius * Math.cos(arcAngle),
      y: 115 + arcRadius * Math.sin(arcAngle),
    };
  };

  return (
    <div
      className={cn(
        'fixed z-[80] h-[230px] w-[130px] -translate-y-1/2 pointer-events-none',
        side === 'left' ? 'left-0' : 'right-0',
      )}
      style={{ top: `${anchorY}px` }}
      data-html2canvas-ignore="true"
      aria-label="浮動幣種切換"
    >
      {currencies.map((currency, index) => {
        const isActive = activeId === currency.id;
        const isHovered = hoverId === currency.id;
        const { x, y } = getPosition(index);
        const canDelete = isDeleteMode && !currency.isDefault;

        return (
          <button
            key={currency.id}
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            onPointerEnter={() => {
              if (isDeleteMode) return;
              onHover(currency.id);
              onSelect(currency.id);
            }}
            onPointerLeave={() => onHover(null)}
            onClick={(event) => {
              event.stopPropagation();
              if (canDelete) {
                onDeleteCurrency(currency.id);
                return;
              }
              onSelect(currency.id);
              onHover(null);
              onClose();
            }}
            className={cn(
              'pointer-events-auto absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border font-mono shadow-[0_6px_18px_rgba(0,0,0,0.45)]',
              isActive || isHovered
                ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_20px_rgba(76,158,255,0.42)]'
                : 'border-border bg-calc-surface text-muted-foreground',
              canDelete && 'border-calc-neg bg-calc-neg/15 text-calc-neg',
            )}
            style={{ left: `${x}px`, top: `${y}px` }}
            data-currency-id={currency.id}
            aria-label={canDelete ? `刪除${currency.name}` : `切換至${currency.name}`}
          >
            <span className="max-w-[40px] truncate font-sans text-[10px] font-semibold leading-tight">
              {currency.name}
            </span>
            {canDelete && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-calc-neg text-background">
                <X size={11} strokeWidth={3} />
              </span>
            )}
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
              onQuickAdd();
            }}
            onPointerEnter={() => {
              onHover(null);
            }}
            onPointerLeave={() => undefined}
            className={cn(
              'pointer-events-auto absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-muted-foreground shadow-[0_6px_18px_rgba(0,0,0,0.4)]',
              'border-primary/40 bg-primary/10 text-primary',
            )}
            aria-label="新增幣種"
            title="新增幣種"
            style={{ left: `${x}px`, top: `${y}px` }}
          >
            <Plus size={17} />
          </button>
        );
      })()}
      {(() => {
        const { x, y } = getPosition(currencies.length + 1);
        return (
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onHover(null);
              onToggleDeleteMode();
            }}
            className={cn(
              'pointer-events-auto absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-[0_6px_18px_rgba(0,0,0,0.4)]',
              isDeleteMode
                ? 'border-calc-neg bg-calc-neg text-background'
                : 'border-border bg-calc-surface2 text-muted-foreground',
            )}
            aria-label={isDeleteMode ? '退出刪除模式' : '刪除自訂幣種'}
            title={isDeleteMode ? '退出刪除模式' : '刪除自訂幣種'}
            style={{ left: `${x}px`, top: `${y}px` }}
          >
            <Trash2 size={15} />
          </button>
        );
      })()}
      {(() => {
        const { x, y } = getPosition(currencies.length + 2);
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
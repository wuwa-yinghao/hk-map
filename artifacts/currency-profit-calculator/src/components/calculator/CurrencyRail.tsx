import { ArrowUpFromLine, Settings, TrendingUp } from 'lucide-react';
import { Currency } from '@/hooks/use-currencies';
import { cn } from '@/lib/utils';

const RAIL_BUTTON_SIZE = 'h-[44px] w-[44px] min-h-[44px] min-w-[44px] max-h-[44px] max-w-[44px] shrink-0 box-border p-0';
const RAIL_WIDTH = 130;
const RAIL_EDGE_INSET = 8;
const RAIL_BUTTON_RADIUS = 22;

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
  onOpenProfitSummary,
  onOpenUpstreamSummary,
  managerHover,
  onManagerHover,
  profitSummaryHover,
  onProfitSummaryHover,
  upstreamSummaryHover,
  onUpstreamSummaryHover,
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
  onOpenProfitSummary: () => void;
  onOpenUpstreamSummary: () => void;
  managerHover: boolean;
  onManagerHover: (hovered: boolean) => void;
  profitSummaryHover: boolean;
  onProfitSummaryHover: (hovered: boolean) => void;
  upstreamSummaryHover: boolean;
  onUpstreamSummaryHover: (hovered: boolean) => void;
}) {
  if (!isOpen) return null;

  const itemCount = currencies.length + 3;
  const itemSpacing = 54;
  const railHeight = Math.max(230, (itemCount - 1) * itemSpacing + 52);
  const center = (itemCount - 1) / 2;
  const minButtonCenter = RAIL_EDGE_INSET + RAIL_BUTTON_RADIUS;
  const maxButtonCenter = RAIL_WIDTH - RAIL_EDGE_INSET - RAIL_BUTTON_RADIUS;

  const getPosition = (index: number) => {
    const offset = index - center;
    const rawX = side === 'left'
      ? 76 - Math.abs(offset) * 20
      : 54 + Math.abs(offset) * 20;
    return {
      // Keep the fan shape, but never let a button touch or cross the
      // viewport edge when the currency list grows.
      x: Math.max(minButtonCenter, Math.min(maxButtonCenter, rawX)),
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
              'pointer-events-auto absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border font-mono leading-none shadow-[0_6px_18px_rgba(0,0,0,0.45)]',
              RAIL_BUTTON_SIZE,
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
              onProfitSummaryHover(false);
              onUpstreamSummaryHover(false);
              onClose();
              onOpenUpstreamSummary();
            }}
            onPointerEnter={() => {
              onHover(null);
              onManagerHover(false);
              onProfitSummaryHover(false);
              onUpstreamSummaryHover(true);
            }}
            onPointerLeave={() => onUpstreamSummaryHover(false)}
            className={cn(
              'pointer-events-auto absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-calc-up leading-none shadow-[0_6px_18px_rgba(0,0,0,0.4)]',
              RAIL_BUTTON_SIZE,
              upstreamSummaryHover
                ? 'border-calc-up bg-calc-up/25 text-calc-up shadow-[0_0_18px_rgba(96,165,250,0.38)]'
                : 'border-calc-up/45 bg-calc-up/10',
            )}
            data-upstream-summary-button="true"
            aria-label="查看上游金額統計"
            title="上游統計"
            style={{ left: `${x}px`, top: `${y}px` }}
          >
            <ArrowUpFromLine size={16} />
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
              onManagerHover(false);
              onUpstreamSummaryHover(false);
              onProfitSummaryHover(false);
              onClose();
              onOpenProfitSummary();
            }}
            onPointerEnter={() => {
              onHover(null);
              onManagerHover(false);
              onUpstreamSummaryHover(false);
              onProfitSummaryHover(true);
            }}
            onPointerLeave={() => onProfitSummaryHover(false)}
            className={cn(
              'pointer-events-auto absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-calc-pos leading-none shadow-[0_6px_18px_rgba(0,0,0,0.4)]',
              RAIL_BUTTON_SIZE,
              profitSummaryHover
                ? 'border-calc-pos bg-calc-pos/25 text-calc-pos shadow-[0_0_18px_rgba(47,209,128,0.38)]'
                : 'border-calc-pos/45 bg-calc-pos/10',
            )}
            data-profit-summary-button="true"
            aria-label="查看利潤統計"
            title="利潤統計"
            style={{ left: `${x}px`, top: `${y}px` }}
          >
            <TrendingUp size={16} />
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
              onUpstreamSummaryHover(false);
              onProfitSummaryHover(false);
              onClose();
              onOpenManager();
            }}
            onPointerEnter={() => {
              onHover(null);
              onManagerHover(true);
              onUpstreamSummaryHover(false);
              onProfitSummaryHover(false);
            }}
            onPointerLeave={() => onManagerHover(false)}
            className={cn(
              'pointer-events-auto absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-violet-300 leading-none shadow-[0_6px_18px_rgba(0,0,0,0.4)]',
              RAIL_BUTTON_SIZE,
              managerHover
                ? 'border-violet-300 bg-violet-400/25 text-violet-200 shadow-[0_0_18px_rgba(167,139,250,0.38)]'
                : 'border-violet-400/45 bg-violet-400/10',
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
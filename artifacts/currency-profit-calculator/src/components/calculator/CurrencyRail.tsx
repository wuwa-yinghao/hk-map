import { ArrowUpFromLine, Settings, TrendingUp } from 'lucide-react';
import { Currency } from '@/hooks/use-currencies';
import { cn } from '@/lib/utils';

const RAIL_BUTTON_SIZE =
  'h-[44px] w-[44px] min-h-[44px] min-w-[44px] max-h-[44px] max-w-[44px] shrink-0 box-border p-0';

export function CurrencyRail({
  isOpen,
  onClose,
  currencies,
  activeId,
  hoverId,
  side,
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

  const tooltipSide = side === 'left' ? 'left-[52px]' : 'right-[52px]';

  return (
    <div
      className={cn(
        'fixed z-[80] flex flex-col pointer-events-none',
        side === 'left' ? 'left-0' : 'right-0',
      )}
      style={{
        top: 'max(14px, env(safe-area-inset-top))',
        bottom: 'max(14px, env(safe-area-inset-bottom))',
        width: '56px',
      }}
      data-html2canvas-ignore="true"
      aria-label="浮動幣種切換"
    >
      {/* Scrollable currency buttons */}
      <div
        data-rail-scroll="true"
        className={cn(
          'flex-1 overflow-y-auto flex flex-col items-center gap-[10px] py-2 pointer-events-auto',
          'scrollbar-none',
          side === 'left' ? 'pl-1.5 pr-1' : 'pr-1.5 pl-1',
        )}
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      >
        {currencies.map((currency) => {
          const isActive = activeId === currency.id;
          const isHovered = hoverId === currency.id;
          return (
            <button
              key={currency.id}
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onPointerEnter={() => {
                onHover(currency.id);
                onSelect(currency.id);
              }}
              onPointerLeave={() => onHover(null)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(currency.id);
                onHover(null);
                onClose();
              }}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-full border font-mono leading-none shadow-[0_6px_18px_rgba(0,0,0,0.45)]',
                RAIL_BUTTON_SIZE,
                isActive || isHovered
                  ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_20px_rgba(76,158,255,0.42)]'
                  : 'border-border bg-calc-surface text-muted-foreground',
              )}
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
                    tooltipSide,
                  )}
                >
                  {currency.name}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Fixed action buttons at the bottom */}
      <div
        className={cn(
          'flex flex-col items-center gap-[10px] pb-2 pt-1 pointer-events-auto border-t border-border/40',
          side === 'left' ? 'pl-1.5 pr-1' : 'pr-1.5 pl-1',
        )}
      >
        {/* Upstream summary */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
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
            'relative flex items-center justify-center rounded-full border text-calc-up leading-none shadow-[0_6px_18px_rgba(0,0,0,0.4)]',
            RAIL_BUTTON_SIZE,
            upstreamSummaryHover
              ? 'border-calc-up bg-calc-up/25 text-calc-up shadow-[0_0_18px_rgba(96,165,250,0.38)]'
              : 'border-calc-up/45 bg-calc-up/10',
          )}
          data-upstream-summary-button="true"
          aria-label="查看上游金額統計"
          title="上游統計"
        >
          <ArrowUpFromLine size={16} />
          {upstreamSummaryHover && (
            <span
              className={cn(
                'pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-calc-up/30 bg-calc-surface px-2 py-1 font-sans text-[10px] text-foreground shadow-xl',
                tooltipSide,
              )}
            >
              上游統計
            </span>
          )}
        </button>

        {/* Profit summary */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
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
            'relative flex items-center justify-center rounded-full border text-calc-pos leading-none shadow-[0_6px_18px_rgba(0,0,0,0.4)]',
            RAIL_BUTTON_SIZE,
            profitSummaryHover
              ? 'border-calc-pos bg-calc-pos/25 text-calc-pos shadow-[0_0_18px_rgba(47,209,128,0.38)]'
              : 'border-calc-pos/45 bg-calc-pos/10',
          )}
          data-profit-summary-button="true"
          aria-label="查看利潤統計"
          title="利潤統計"
        >
          <TrendingUp size={16} />
          {profitSummaryHover && (
            <span
              className={cn(
                'pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-calc-pos/30 bg-calc-surface px-2 py-1 font-sans text-[10px] text-foreground shadow-xl',
                tooltipSide,
              )}
            >
              利潤統計
            </span>
          )}
        </button>

        {/* Manager */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
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
            'relative flex items-center justify-center rounded-full border text-violet-300 leading-none shadow-[0_6px_18px_rgba(0,0,0,0.4)]',
            RAIL_BUTTON_SIZE,
            managerHover
              ? 'border-violet-300 bg-violet-400/25 text-violet-200 shadow-[0_0_18px_rgba(167,139,250,0.38)]'
              : 'border-violet-400/45 bg-violet-400/10',
          )}
          data-manager-button="true"
          aria-label="設置幣種"
          title="設置幣種"
        >
          <Settings size={16} />
          {managerHover && (
            <span
              className={cn(
                'pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-violet-300/30 bg-calc-surface px-2 py-1 font-sans text-[10px] text-foreground shadow-xl',
                tooltipSide,
              )}
            >
              設置幣種
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

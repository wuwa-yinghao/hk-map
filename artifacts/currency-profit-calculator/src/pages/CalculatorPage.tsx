import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Camera, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { takeScreenshot } from '@/lib/screenshot';
import { useToast } from '@/hooks/use-toast';
import { useCurrencies } from '@/hooks/use-currencies';
import { useCalculatorState, useCalculations } from '@/hooks/use-calculator-state';
import { Gauge } from '@/components/calculator/Gauge';
import { PreviewModal } from '@/components/calculator/PreviewModal';
import { CurrencyRail } from '@/components/calculator/CurrencyRail';
import { CurrencyManager } from '@/components/calculator/CurrencyManager';
import { CalcCard, FieldRow, FormattedInput, NumberInput, DiffDisplay } from '@/components/calculator/shared';

function AdjustButton({ onClick, children }: { onClick: () => void, children: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className="flex-1 py-1.5 px-0.5 rounded-md border border-border bg-calc-surface2 text-foreground font-mono text-[11.5px] font-semibold flex items-center justify-center transition-all active:scale-95 active:border-calc-down active:text-calc-down"
    >
      {children}
    </button>
  );
}

function CurrencySwitchSection({
  pulse,
  className,
  children,
}: {
  pulse: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={className}
      animate={pulse ? {
        scale: [1, 1.018, 1],
        boxShadow: [
          '0 8px 24px rgba(0,0,0,0.3)',
          '0 0 26px rgba(76,158,255,0.38)',
          '0 8px 24px rgba(0,0,0,0.3)',
        ],
      } : {
        scale: 1,
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}
      transition={{ duration: 0.52, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export default function CalculatorPage() {
  const { toast } = useToast();
  const { currencies, activeId, setActiveId, addCurrency, removeCurrency, updateCurrency } = useCurrencies();
  const activeCurrency = currencies.find(c => c.id === activeId) || currencies[0];
  
  const { state, updateField, reset } = useCalculatorState(activeId);
  const calc = useCalculations(state);
  
  const [isRailOpen, setIsRailOpen] = useState(false);
  const [railSide, setRailSide] = useState<'left' | 'right'>('left');
  const [railAnchorY, setRailAnchorY] = useState(300);
  const [hoverCurrencyId, setHoverCurrencyId] = useState<string | null>(null);
  const [managerHover, setManagerHover] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [screenshotSrc, setScreenshotSrc] = useState<string | null>(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [currencyPulse, setCurrencyPulse] = useState(false);
  const isRailOpenRef = useRef(false);
  const railDismissTimerRef = useRef<number | null>(null);
  const currencyPulseTimerRef = useRef<number | null>(null);
  const previousActiveIdRef = useRef(activeId);
  const managerTouchHoverRef = useRef(false);
  const gestureRef = useRef({
    startX: 0,
    startY: 0,
    side: null as 'left' | 'right' | null,
    opening: false,
  });

  useEffect(() => {
    isRailOpenRef.current = isRailOpen;
    if (!isRailOpen && railDismissTimerRef.current) {
      window.clearTimeout(railDismissTimerRef.current);
      railDismissTimerRef.current = null;
    }
  }, [isRailOpen]);

  useEffect(() => {
    if (previousActiveIdRef.current === activeId) return;
    previousActiveIdRef.current = activeId;
    setCurrencyPulse(true);
    if (currencyPulseTimerRef.current) window.clearTimeout(currencyPulseTimerRef.current);
    currencyPulseTimerRef.current = window.setTimeout(() => {
      setCurrencyPulse(false);
      currencyPulseTimerRef.current = null;
    }, 520);

    return () => {
      if (currencyPulseTimerRef.current) window.clearTimeout(currencyPulseTimerRef.current);
    };
  }, [activeId]);

  useEffect(() => {
    const menuHeight = () => Math.min(window.innerHeight - 28, 230);
    const clampAnchor = (y: number) => {
      const half = menuHeight() / 2;
      return Math.max(half + 14, Math.min(window.innerHeight - half - 14, y));
    };

    const currencyAtPoint = (x: number, y: number) => {
      const target = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-currency-id]');
      if (target?.dataset.currencyId) return target.dataset.currencyId;

      // A fingertip often sits just outside the visible circle while dragging.
      // Use the curved buttons' vertical rhythm as a forgiving touch target.
      const buttonSpacing = Math.min(46, 184 / Math.max(currencies.length - 1, 1));
      const index = Math.round((y - (railAnchorY - ((currencies.length - 1) * buttonSpacing) / 2)) / buttonSpacing);
      return currencies[index]?.id ?? null;
    };
    
    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      gestureRef.current.startX = touch.clientX;
      gestureRef.current.startY = touch.clientY;
      // A touch that starts on an already-open rail should dismiss it on
      // release. A tap on a closed edge handle must be allowed to finish
      // opening the rail without the same touchend immediately closing it.
      gestureRef.current.opening = isRailOpenRef.current;
      managerTouchHoverRef.current = false;
      setManagerHover(false);
      gestureRef.current.side =
        touch.clientX < 28 ? 'left' : touch.clientX > window.innerWidth - 28 ? 'right' : null;
    };
    
    const onTouchMove = (e: TouchEvent) => {
      const { startX, startY, side } = gestureRef.current;
      if (!startX || !startY) return;
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      const diffX = x - startX;
      const diffY = y - startY;

      if (isRailOpenRef.current) {
        const managerTarget = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-manager-button]');
        const managerY = railAnchorY + 109;
        const nearManagerByPosition =
          Math.abs(y - managerY) <= 28 &&
          (railSide === 'left' ? x <= 130 : x >= window.innerWidth - 130);
        const isOverManager = Boolean(managerTarget) || nearManagerByPosition;
        managerTouchHoverRef.current = isOverManager;
        setManagerHover(isOverManager);
        if (isOverManager) {
          setHoverCurrencyId(null);
          return;
        }
        const currencyId = currencyAtPoint(x, y);
        setHoverCurrencyId(currencyId);
        if (currencyId) setActiveId(currencyId);
        return;
      }

      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        const isOpeningFromLeft = side === 'left' && diffX > 0;
        const isOpeningFromRight = side === 'right' && diffX < 0;
        if (isOpeningFromLeft || isOpeningFromRight) {
          if (railDismissTimerRef.current) window.clearTimeout(railDismissTimerRef.current);
          gestureRef.current.opening = true;
          setRailSide(side!);
          setRailAnchorY(clampAnchor(startY));
          setIsRailOpen(true);
        }
      }
    };

    const onTouchEnd = () => {
      if (gestureRef.current.opening) {
        const shouldOpenManager = managerTouchHoverRef.current;
        if (railDismissTimerRef.current) window.clearTimeout(railDismissTimerRef.current);
        setHoverCurrencyId(null);
        setManagerHover(false);
        setIsRailOpen(false);
        if (shouldOpenManager) setIsManagerOpen(true);
      }
      managerTouchHoverRef.current = false;
      gestureRef.current.startX = 0;
      gestureRef.current.startY = 0;
      gestureRef.current.side = null;
      gestureRef.current.opening = false;
    };
    
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    const preventPageScroll = (event: TouchEvent) => {
      if (isRailOpenRef.current) event.preventDefault();
    };
    window.addEventListener('touchmove', preventPageScroll, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchmove', preventPageScroll);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [currencies, railAnchorY, setActiveId]);

  useEffect(() => {
    if (!isRailOpen) return;

    const scrollY = window.scrollY;
    const { body, documentElement } = document;
    const preventBackgroundTouchMove = (event: TouchEvent) => event.preventDefault();
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
      overscroll: documentElement.style.overscrollBehavior,
      touchAction: documentElement.style.touchAction,
    };

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    documentElement.style.overscrollBehavior = 'none';
    documentElement.style.touchAction = 'none';
    document.addEventListener('touchmove', preventBackgroundTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchmove', preventBackgroundTouchMove);
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      documentElement.style.overscrollBehavior = previous.overscroll;
      documentElement.style.touchAction = previous.touchAction;
      window.scrollTo(0, scrollY);
    };
  }, [isRailOpen]);

  const handleCurrencyHover = (id: string | null) => {
    setHoverCurrencyId(id);
    if (id) setActiveId(id);
  };

  const closeFloatingCurrencies = () => {
    if (railDismissTimerRef.current) window.clearTimeout(railDismissTimerRef.current);
    railDismissTimerRef.current = null;
    setHoverCurrencyId(null);
    setManagerHover(false);
    setIsRailOpen(false);
  };

  const selectFloatingCurrency = (id: string) => {
    if (railDismissTimerRef.current) window.clearTimeout(railDismissTimerRef.current);
    railDismissTimerRef.current = null;
    setActiveId(id);
  };

  const openFloatingCurrencies = (side: 'left' | 'right') => {
    if (railDismissTimerRef.current) window.clearTimeout(railDismissTimerRef.current);
    setRailSide(side);
    setRailAnchorY(Math.max(190, Math.min(window.innerHeight - 190, window.innerHeight / 2)));
    setHoverCurrencyId(null);
    setManagerHover(false);
    managerTouchHoverRef.current = false;
    setIsRailOpen(true);
    railDismissTimerRef.current = window.setTimeout(() => {
      setHoverCurrencyId(null);
      setIsRailOpen(false);
    }, 3600);
  };

  useEffect(() => () => {
    if (railDismissTimerRef.current) window.clearTimeout(railDismissTimerRef.current);
    if (currencyPulseTimerRef.current) window.clearTimeout(currencyPulseTimerRef.current);
  }, []);

  const handleScreenshot = async () => {
    const src = await takeScreenshot('calculator-capture-area');
    if (src) {
      setScreenshotSrc(src);
    } else {
      toast({ description: "截圖生成失敗", variant: "destructive" });
    }
  };

  const toggleSign = (field: 'upPoint' | 'downPoint') => {
    const current = parseFloat(state[field]) || 0;
    updateField(field, (-current).toString());
  };

  const adjustDownPoint = (delta: number) => {
    const current = parseFloat(state.downPoint) || 0;
    updateField('downPoint', (current + delta).toString());
  };

  const adjustDownRatePct = (pct: number) => {
    const current = parseFloat(state.downRate) || 0;
    const next = current * (1 + pct / 100);
    updateField('downRate', next.toFixed(5));
  };

  return (
    <div className={cn(
      "min-h-[100dvh] w-full flex flex-col items-center pb-[max(24px,env(safe-area-inset-bottom))] pt-[calc(max(24px,env(safe-area-inset-top))+12px)] px-3 bg-background font-sans overflow-x-hidden",
      isRailOpen && "currency-rail-open",
    )}>
      
      <div className="w-full max-w-[420px] flex flex-col gap-2 relative z-10" id="calculator-capture-area">
        
        {/* Real-time Rate Accordion */}
        <CurrencySwitchSection
          pulse={currencyPulse}
          className="border border-border rounded-[10px] bg-calc-surface2/40 overflow-hidden mb-0.5"
        >
          <div 
            className="px-3.5 py-2.5 flex justify-between items-center cursor-pointer select-none"
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          >
            <h4 className="text-[12px] text-muted-foreground font-semibold flex items-center gap-1.5 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-calc-source">
              實時匯率
            </h4>
            <ChevronDown size={14} className={cn("text-muted-foreground transition-transform", isAccordionOpen && "rotate-180")} />
          </div>
          <AnimatePresence>
            {isAccordionOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-2.5 pb-2.5 flex flex-col gap-2"
              >
                <CalcCard variant="source" title="實時匯率">
                  <FieldRow label="金額" variant="source">
                    <FormattedInput value={state.amount} onChange={(v) => updateField('amount', v)} />
                  </FieldRow>
                  <FieldRow label="匯率" variant="source">
                    <NumberInput value={state.srcRate} onChange={(v) => updateField('srcRate', v)} step="0.0001" />
                  </FieldRow>
                  <div className="mt-2 pt-1.5 border-t border-dashed border-border flex items-baseline justify-between gap-1">
                    <span className="text-[11px] text-muted-foreground">實時匯率結果</span>
                    <span className="font-mono text-[15px] font-semibold text-calc-source">{calc.srcResult.toFixed(3)}</span>
                  </div>
                </CalcCard>

                <div className="bg-calc-surface border border-border rounded-xl p-3 shadow-lg">
                  <h3 className="text-[11px] tracking-wider text-muted-foreground font-semibold mb-2 text-center uppercase">實時匯率 ／ 上游（成本）</h3>
                  <DiffDisplay absolute={calc.srcDiffAbsolute} percent={calc.srcDiffPercent} />
                  <Gauge diffAbsolute={calc.srcDiffAbsolute} diffPercent={calc.srcDiffPercent} />
                  <div className="flex justify-between px-1 font-mono text-[9px] text-muted-foreground">
                    <span>−50%</span><span>0</span><span>+50%</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CurrencySwitchSection>

        {/* Upstream Card */}
        <div className="flex flex-col gap-2">
          <CurrencySwitchSection pulse={currencyPulse}>
            <CalcCard variant="up" title="上游 (成本)">
            <FieldRow label="金額" variant="up">
              <FormattedInput value={state.amount} onChange={(v) => updateField('amount', v)} onFocusSelect />
            </FieldRow>
            <FieldRow label="點位" variant="up">
              <NumberInput 
                value={state.upPoint} 
                onChange={(v) => updateField('upPoint', v)} 
                step="0.01"
                suffix="%"
                prefixButton={
                  <button 
                    onClick={() => toggleSign('upPoint')}
                    className="shrink-0 w-[22px] h-[22px] rounded border border-border bg-calc-surface text-muted-foreground font-mono text-xs font-semibold flex items-center justify-center mr-1 transition-all active:scale-90 active:border-calc-up active:text-calc-up"
                  >±</button>
                }
              />
            </FieldRow>
            <FieldRow label="匯率" variant="up">
              <NumberInput value={state.upRate} onChange={(v) => updateField('upRate', v)} step="0.0001" />
            </FieldRow>
            <div className="mt-2 pt-1.5 border-t border-dashed border-border flex items-baseline justify-between gap-1">
              <span className="text-[11px] text-muted-foreground">成本結果</span>
              <span className="font-mono text-[15px] font-semibold text-calc-up">{calc.upResult.toFixed(3)}</span>
            </div>
            </CalcCard>
          </CurrencySwitchSection>

          {/* Downstream Card */}
          <CurrencySwitchSection pulse={currencyPulse}>
            <CalcCard variant="down" title="下游 (報價)">
            <FieldRow label="金額" variant="down">
              <FormattedInput value={state.amount} onChange={(v) => updateField('amount', v)} onFocusSelect />
            </FieldRow>
            <FieldRow label="點位" variant="down">
              <NumberInput 
                value={state.downPoint} 
                onChange={(v) => updateField('downPoint', v)} 
                step="0.01"
                suffix="%"
                prefixButton={
                  <button 
                    onClick={() => toggleSign('downPoint')}
                    className="shrink-0 w-[22px] h-[22px] rounded border border-border bg-calc-surface text-muted-foreground font-mono text-xs font-semibold flex items-center justify-center mr-1 transition-all active:scale-90 active:border-calc-down active:text-calc-down"
                  >±</button>
                }
              />
            </FieldRow>
            <FieldRow label="匯率" variant="down">
              <NumberInput value={state.downRate} onChange={(v) => updateField('downRate', v)} step="0.0001" />
            </FieldRow>
            <div className="mt-2 pt-1.5 border-t border-dashed border-border flex items-baseline justify-between gap-1">
              <span className="text-[11px] text-muted-foreground">報價結果</span>
              <span className="font-mono text-[15px] font-semibold text-calc-down">{calc.downResult.toFixed(3)}</span>
            </div>
            </CalcCard>
          </CurrencySwitchSection>
        </div>

        {/* Downstream Quick Adjust */}
        <CurrencySwitchSection
          pulse={currencyPulse}
          className="bg-calc-surface border border-border rounded-[10px] p-2.5 px-3 flex flex-col gap-1.5"
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-calc-down" />
            <h4 className="text-[11.5px] font-semibold text-calc-down">下游快速微調</h4>
          </div>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] text-muted-foreground w-[35px]">點位</span>
            <div className="flex gap-1 flex-1">
              <AdjustButton onClick={() => adjustDownPoint(-1)}>−1</AdjustButton>
              <AdjustButton onClick={() => adjustDownPoint(1)}>+1</AdjustButton>
            </div>
          </div>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] text-muted-foreground w-[35px]">匯率</span>
            <div className="flex gap-1 flex-1">
              <AdjustButton onClick={() => adjustDownRatePct(-1)}>−1%</AdjustButton>
              <AdjustButton onClick={() => adjustDownRatePct(-0.5)}>−0.5%</AdjustButton>
              <AdjustButton onClick={() => adjustDownRatePct(0.5)}>+0.5%</AdjustButton>
              <AdjustButton onClick={() => adjustDownRatePct(1)}>+1%</AdjustButton>
            </div>
          </div>
        </CurrencySwitchSection>

        {/* Main Dashboard */}
        <CurrencySwitchSection
          pulse={currencyPulse}
          className="bg-gradient-to-b from-[#1C2130] to-[#12151D] border border-[rgba(76,158,255,0.25)] rounded-xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.3)] shrink-0 mt-1 mb-1"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] tracking-wider text-muted-foreground font-semibold uppercase flex-1 text-center pl-10">
              上下游利潤分析 ({state.mode === 'deposit' ? '入金' : '出金'})
            </h3>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeId}
                initial={{ opacity: 0, scale: 0.72, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                className="text-[10px] font-mono bg-calc-surface2 text-muted-foreground px-2 py-0.5 rounded-full shrink-0 border border-border flex items-center justify-center min-w-[36px]"
                aria-live="polite"
              >
                {activeCurrency.code}
              </motion.div>
            </AnimatePresence>
          </div>
          <DiffDisplay absolute={calc.diffAbsolute} percent={calc.diffPercent} large />
          <Gauge diffAbsolute={calc.diffAbsolute} diffPercent={calc.diffPercent} />
          <div className="flex justify-between px-1 font-mono text-[9px] text-muted-foreground">
            <span>−50%</span><span>0</span><span>+50%</span>
          </div>
        </CurrencySwitchSection>

        {/* Mode Toggle */}
        <CurrencySwitchSection
          pulse={currencyPulse}
          className="flex gap-1.5 bg-calc-surface/60 p-[3px] rounded-lg border border-border shrink-0"
        >
          <button 
            onClick={() => updateField('mode', 'deposit')}
            className={cn("flex-1 h-[34px] rounded-md text-[13.5px] font-bold tracking-wide transition-all", 
              state.mode === 'deposit' ? "bg-calc-up text-background shadow-[0_2px_8px_rgba(76,158,255,0.3)]" : "text-muted-foreground")}
          >
            入金
          </button>
          <button 
            onClick={() => updateField('mode', 'withdraw')}
            className={cn("flex-1 h-[34px] rounded-md text-[13.5px] font-bold tracking-wide transition-all", 
              state.mode === 'withdraw' ? "bg-calc-down text-background shadow-[0_2px_8px_rgba(47,209,128,0.3)]" : "text-muted-foreground")}
          >
            出金
          </button>
        </CurrencySwitchSection>

        {/* Bottom Actions */}
        <CurrencySwitchSection pulse={currencyPulse}>
          <button
            type="button"
            onClick={reset}
            data-html2canvas-ignore="true"
            className="w-full min-h-[38px] rounded-lg border border-[rgba(255,92,92,0.35)] bg-calc-surface text-calc-neg text-[13px] font-semibold flex items-center justify-center gap-2 mt-1 active:bg-calc-surface2 transition-all"
          >
            <RefreshCw size={14} />
            <span>重置全部欄位</span>
          </button>
        </CurrencySwitchSection>

        <CurrencySwitchSection pulse={currencyPulse}>
          <button
            type="button"
            onClick={handleScreenshot}
            data-html2canvas-ignore="true"
            className="w-full min-h-[38px] rounded-lg border border-border bg-calc-surface text-muted-foreground hover:text-foreground text-[13px] font-semibold flex items-center justify-center gap-2 mt-1 active:border-calc-source active:text-foreground transition-all mb-4"
          >
            <Camera size={14} />
            <span>生成截圖</span>
          </button>
        </CurrencySwitchSection>

      </div>

      {/* Discoverability Handles */}
      {!isRailOpen && (
        <>
          <button
            type="button"
            className="fixed left-2 top-1/2 z-[90] flex h-16 w-10 -translate-y-1/2 items-center justify-start touch-none"
            onPointerDown={() => openFloatingCurrencies('left')}
            onClick={() => openFloatingCurrencies('left')}
            aria-label="從左側開啟幣種浮球"
            data-html2canvas-ignore="true"
          >
            <span className="h-12 w-1 rounded-r-md bg-white/10 transition-colors hover:bg-white/20" />
          </button>
          <button
            type="button"
            className="fixed right-2 top-1/2 z-[90] flex h-16 w-10 -translate-y-1/2 items-center justify-end touch-none"
            onPointerDown={() => openFloatingCurrencies('right')}
            onClick={() => openFloatingCurrencies('right')}
            aria-label="從右側開啟幣種浮球"
            data-html2canvas-ignore="true"
          >
            <span className="h-12 w-1 rounded-l-md bg-white/10 transition-colors hover:bg-white/20" />
          </button>
        </>
      )}

      <CurrencyRail 
        isOpen={isRailOpen}
        onClose={closeFloatingCurrencies}
        currencies={currencies}
        activeId={activeId}
        hoverId={hoverCurrencyId}
        side={railSide}
        anchorY={railAnchorY}
        onSelect={selectFloatingCurrency}
        onHover={handleCurrencyHover}
        managerHover={managerHover}
        onManagerHover={setManagerHover}
        onOpenManager={() => setIsManagerOpen(true)}
      />
      <CurrencyManager 
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        currencies={currencies}
        onAdd={addCurrency}
        onRemove={removeCurrency}
        onUpdate={updateCurrency}
      />
      <PreviewModal 
        isOpen={!!screenshotSrc}
        imageSrc={screenshotSrc}
        onClose={() => setScreenshotSrc(null)}
      />
    </div>
  );
}

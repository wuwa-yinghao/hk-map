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

export default function CalculatorPage() {
  const { toast } = useToast();
  const { currencies, activeId, setActiveId, addCurrency, removeCurrency } = useCurrencies();
  const activeCurrency = currencies.find(c => c.id === activeId) || currencies[0];
  
  const { state, updateField, reset } = useCalculatorState(activeId);
  const calc = useCalculations(state);
  
  const [isRailOpen, setIsRailOpen] = useState(false);
  const [railSide, setRailSide] = useState<'left' | 'right'>('left');
  const [railAnchorY, setRailAnchorY] = useState(300);
  const [hoverCurrencyId, setHoverCurrencyId] = useState<string | null>(null);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [screenshotSrc, setScreenshotSrc] = useState<string | null>(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const gestureRef = useRef({
    startX: 0,
    startY: 0,
    side: null as 'left' | 'right' | null,
    opening: false,
  });

  useEffect(() => {
    const menuHeight = () => Math.min(window.innerHeight - 28, (currencies.length + 2) * 58);
    const clampAnchor = (y: number) => {
      const half = menuHeight() / 2;
      return Math.max(half + 14, Math.min(window.innerHeight - half - 14, y));
    };

    const currencyAtY = (y: number) => {
      const itemCount = currencies.length + 2;
      const itemHeight = 56;
      const firstCenter = railAnchorY - ((itemCount - 1) * itemHeight) / 2;
      let closestIndex = -1;
      let closestDistance = 31;
      for (let index = 0; index < currencies.length; index += 1) {
        const distance = Math.abs(y - (firstCenter + index * itemHeight));
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      }
      return closestIndex >= 0 ? currencies[closestIndex].id : null;
    };
    
    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      gestureRef.current.startX = touch.clientX;
      gestureRef.current.startY = touch.clientY;
      gestureRef.current.opening = false;
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

      if (isRailOpen) {
        setHoverCurrencyId(currencyAtY(y));
        return;
      }

      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        const isOpeningFromLeft = side === 'left' && diffX > 0;
        const isOpeningFromRight = side === 'right' && diffX < 0;
        if (isOpeningFromLeft || isOpeningFromRight) {
          gestureRef.current.opening = true;
          setRailSide(side!);
          setRailAnchorY(clampAnchor(startY));
          setHoverCurrencyId(currencyAtY(startY));
          setIsRailOpen(true);
        }
      }
    };

    const onTouchEnd = () => {
      if (isRailOpen && gestureRef.current.opening && hoverCurrencyId) {
        setActiveId(hoverCurrencyId);
        setHoverCurrencyId(null);
        setIsRailOpen(false);
      }
      gestureRef.current.startX = 0;
      gestureRef.current.startY = 0;
      gestureRef.current.side = null;
      gestureRef.current.opening = false;
    };
    
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [currencies, hoverCurrencyId, isRailOpen, setActiveId]);

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
    <div className="min-h-[100dvh] w-full flex flex-col items-center pb-[max(24px,env(safe-area-inset-bottom))] pt-[calc(max(24px,env(safe-area-inset-top))+12px)] px-3 bg-background font-sans overflow-x-hidden">
      
      <div className="w-full max-w-[420px] flex flex-col gap-2 relative z-10" id="calculator-capture-area">
        
        {/* Real-time Rate Accordion */}
        <div className="border border-border rounded-[10px] bg-calc-surface2/40 overflow-hidden mb-0.5">
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
        </div>

        {/* Upstream Card */}
        <div className="flex flex-col gap-2">
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

          {/* Downstream Card */}
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
        </div>

        {/* Downstream Quick Adjust */}
        <div className="bg-calc-surface border border-border rounded-[10px] p-2.5 px-3 flex flex-col gap-1.5">
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
        </div>

        {/* Main Dashboard */}
        <div className="bg-gradient-to-b from-[#1C2130] to-[#12151D] border border-[rgba(76,158,255,0.25)] rounded-xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.3)] shrink-0 mt-1 mb-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] tracking-wider text-muted-foreground font-semibold uppercase flex-1 text-center pl-10">
              上下游利潤分析 ({state.mode === 'deposit' ? '入金' : '出金'})
            </h3>
            <div className="text-[10px] font-mono bg-calc-surface2 text-muted-foreground px-2 py-0.5 rounded-full shrink-0 border border-border flex items-center justify-center min-w-[36px]">
              {activeCurrency.code}
            </div>
          </div>
          <DiffDisplay absolute={calc.diffAbsolute} percent={calc.diffPercent} large />
          <Gauge diffAbsolute={calc.diffAbsolute} diffPercent={calc.diffPercent} />
          <div className="flex justify-between px-1 font-mono text-[9px] text-muted-foreground">
            <span>−50%</span><span>0</span><span>+50%</span>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-1.5 bg-calc-surface/60 p-[3px] rounded-lg border border-border shrink-0">
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
        </div>

        {/* Bottom Actions */}
        <button 
          type="button" 
          onClick={reset}
          data-html2canvas-ignore="true"
          className="w-full min-h-[38px] rounded-lg border border-[rgba(255,92,92,0.35)] bg-calc-surface text-calc-neg text-[13px] font-semibold flex items-center justify-center gap-2 mt-1 active:bg-calc-surface2 transition-all"
        >
          <RefreshCw size={14} />
          <span>重置全部欄位</span>
        </button>

        <button 
          type="button" 
          onClick={handleScreenshot}
          data-html2canvas-ignore="true"
          className="w-full min-h-[38px] rounded-lg border border-border bg-calc-surface text-muted-foreground hover:text-foreground text-[13px] font-semibold flex items-center justify-center gap-2 mt-1 active:border-calc-source active:text-foreground transition-all mb-4"
        >
          <Camera size={14} />
          <span>生成截圖</span>
        </button>

      </div>

      {/* Discoverability Handles */}
      <div 
        className="fixed inset-y-0 left-0 w-3 z-40 flex items-center justify-start group touch-none" 
        onPointerDown={() => {
          setRailSide('left');
          setRailAnchorY(Math.max(190, Math.min(window.innerHeight - 190, window.innerHeight / 2)));
          setHoverCurrencyId(null);
          setIsRailOpen(true);
        }}
        data-html2canvas-ignore="true"
      >
        <div className="w-1 h-12 bg-white/10 rounded-r-md group-hover:bg-white/20 transition-colors" />
      </div>
      <div 
        className="fixed inset-y-0 right-0 w-3 z-40 flex items-center justify-end group touch-none" 
        onPointerDown={() => {
          setRailSide('right');
          setRailAnchorY(Math.max(190, Math.min(window.innerHeight - 190, window.innerHeight / 2)));
          setHoverCurrencyId(null);
          setIsRailOpen(true);
        }}
        data-html2canvas-ignore="true"
      >
        <div className="w-1 h-12 bg-white/10 rounded-l-md group-hover:bg-white/20 transition-colors" />
      </div>

      <CurrencyRail 
        isOpen={isRailOpen}
        onClose={() => setIsRailOpen(false)}
        currencies={currencies}
        activeId={activeId}
        hoverId={hoverCurrencyId}
        side={railSide}
        anchorY={railAnchorY}
        onSelect={setActiveId}
        onHover={setHoverCurrencyId}
        onOpenManager={() => setIsManagerOpen(true)}
      />
      <CurrencyManager 
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        currencies={currencies}
        onAdd={addCurrency}
        onRemove={removeCurrency}
      />
      <PreviewModal 
        isOpen={!!screenshotSrc}
        imageSrc={screenshotSrc}
        onClose={() => setScreenshotSrc(null)}
      />
    </div>
  );
}

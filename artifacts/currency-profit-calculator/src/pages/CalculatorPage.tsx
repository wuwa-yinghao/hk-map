import { useState, useEffect, useRef, useMemo } from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrencies } from '@/hooks/use-currencies';
import {
  SETTLEMENT_CURRENCY,
  calculateProfit,
  useCalculatorState,
  useCalculations,
} from '@/hooks/use-calculator-state';
import { Gauge } from '@/components/calculator/Gauge';
import { CurrencyRail } from '@/components/calculator/CurrencyRail';
import { CurrencyManager } from '@/components/calculator/CurrencyManager';
import { ProfitSummaryModal, ProfitSummaryItem } from '@/components/calculator/ProfitSummaryModal';
import { UpstreamSummaryModal, UpstreamSummaryItem } from '@/components/calculator/UpstreamSummaryModal';
import { DownstreamSummaryModal, DownstreamSummaryItem } from '@/components/calculator/DownstreamSummaryModal';
import { FormulaHistory } from '@/components/calculator/FormulaHistory';
import { loadFormulaHistory, useFormulaHistory } from '@/hooks/use-formula-history';
import { CalcCard, CalcResult, FieldRow, FormattedInput, NumberInput, DiffDisplay } from '@/components/calculator/shared';

function AdjustButton({ onClick, children, tone = 'neutral' }: { onClick: () => void, children: React.ReactNode, tone?: 'neg' | 'pos' | 'neutral' }) {
  const activeClass = tone === 'neg'
    ? 'active:border-calc-neg active:text-calc-neg active:bg-calc-neg/10'
    : tone === 'pos'
    ? 'active:border-calc-pos active:text-calc-pos active:bg-calc-pos/10'
    : 'active:border-calc-down active:text-calc-down active:bg-calc-down/10';
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-1.5 px-0.5 rounded-md border border-border bg-calc-surface2 text-muted-foreground font-mono text-[11.5px] font-semibold flex items-center justify-center transition-colors",
        activeClass,
      )}
    >
      {children}
    </button>
  );
}

function CurrencySwitchSection({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>{children}</div>
  );
}

export default function CalculatorPage() {
  const { currencies, activeId, setActiveId, addCurrency, removeCurrency, updateCurrency, moveCurrency } = useCurrencies();
  const activeCurrency = currencies.find(c => c.id === activeId) || currencies[0];
  
  const { state, updateField } = useCalculatorState(activeId);
  const {
    entries: formulaHistory,
    addEntry: addFormulaHistory,
    removeEntry: removeFormulaHistory,
    clearEntries: clearFormulaHistory,
  } = useFormulaHistory(activeId);
  const calc = useCalculations(state);
  const profitSummary = useMemo<ProfitSummaryItem[]>(() => (
    currencies.flatMap((currency) => {
      const entries = currency.id === activeId
        ? formulaHistory
        : loadFormulaHistory(currency.id);

      if (entries.length === 0) return [];

      const profit = entries.reduce((sum, entry) => {
        const upstream = entry.upResult ?? calculateProfit(entry).upResult;
        const downstream = entry.downResult ?? calculateProfit(entry).downResult;
        const entryProfit = entry.mode === 'deposit'
          ? upstream - downstream
          : downstream - upstream;
        return sum + Number(entryProfit.toFixed(3));
      }, 0);
      const modes = new Set(entries.map((entry) => entry.mode));

      return [{
        id: currency.id,
        name: currency.name,
        mode: modes.size === 1 ? entries[0].mode : 'mixed',
        profit,
        settlementCurrency: SETTLEMENT_CURRENCY,
        entries,
      }];
    })
  ), [activeId, currencies, formulaHistory]);
  const totalProfit = useMemo(
    () => profitSummary.reduce(
      (sum, item) => sum + Number(item.profit.toFixed(3)),
      0,
    ),
    [profitSummary],
  );
  const upstreamSummary = useMemo<UpstreamSummaryItem[]>(() => (
    currencies.map((currency) => ({
        id: currency.id,
        name: currency.name,
        entries: currency.id === activeId
          ? formulaHistory
          : loadFormulaHistory(currency.id),
        netAmount: 0,
      }))
  ).map((item) => ({
    ...item,
    netAmount: item.entries.reduce((sum, entry) => {
      const amount = entry.upResult ?? calculateProfit(entry).upResult;
      const signedAmount = entry.mode === 'deposit' ? amount : -amount;
      return sum + Number(signedAmount.toFixed(3));
    }, 0),
  })), [activeId, currencies, formulaHistory]);
  const totalUpstream = useMemo(
    () => upstreamSummary.reduce(
      (sum, item) => sum + item.netAmount,
      0,
    ),
    [upstreamSummary],
  );
  const downstreamSummary = useMemo<DownstreamSummaryItem[]>(() => (
    currencies.map((currency) => ({
      id: currency.id,
      name: currency.name,
      entries: currency.id === activeId
        ? formulaHistory
        : loadFormulaHistory(currency.id),
      netAmount: 0,
    }))
  ).map((item) => ({
    ...item,
    netAmount: item.entries.reduce((sum, entry) => {
      const amount = entry.downResult ?? calculateProfit(entry).downResult;
      const signedAmount = entry.mode === 'deposit' ? amount : -amount;
      return sum + Number(signedAmount.toFixed(3));
    }, 0),
  })), [activeId, currencies, formulaHistory]);
  const totalDownstream = useMemo(
    () => downstreamSummary.reduce(
      (sum, item) => sum + item.netAmount,
      0,
    ),
    [downstreamSummary],
  );
  
  const [isRailOpen, setIsRailOpen] = useState(false);
  const [railSide, setRailSide] = useState<'left' | 'right'>('left');
  const [railAnchorY, setRailAnchorY] = useState(300);
  const [hoverCurrencyId, setHoverCurrencyId] = useState<string | null>(null);
  const [managerHover, setManagerHover] = useState(false);
  const [profitSummaryHover, setProfitSummaryHover] = useState(false);
  const [upstreamSummaryHover, setUpstreamSummaryHover] = useState(false);
  const [downstreamSummaryHover, setDownstreamSummaryHover] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [isProfitSummaryOpen, setIsProfitSummaryOpen] = useState(false);
  const [isUpstreamSummaryOpen, setIsUpstreamSummaryOpen] = useState(false);
  const [isDownstreamSummaryOpen, setIsDownstreamSummaryOpen] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [formulaNote, setFormulaNote] = useState('');
  const isRailOpenRef = useRef(false);
  const railDismissTimerRef = useRef<number | null>(null);
  const managerTouchHoverRef = useRef(false);
  const profitSummaryTouchHoverRef = useRef(false);
  const upstreamSummaryTouchHoverRef = useRef(false);
  const downstreamSummaryTouchHoverRef = useRef(false);
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
    const clampAnchor = (y: number) => {
      return Math.max(14, Math.min(window.innerHeight - 14, y));
    };

    const currencyAtPoint = (x: number, y: number) => {
      const target = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-currency-id]');
      return target?.dataset.currencyId ?? null;
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
      profitSummaryTouchHoverRef.current = false;
      upstreamSummaryTouchHoverRef.current = false;
      downstreamSummaryTouchHoverRef.current = false;
      setManagerHover(false);
      setProfitSummaryHover(false);
      setUpstreamSummaryHover(false);
      setDownstreamSummaryHover(false);
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
        const target = document.elementFromPoint(x, y);
        const isOverManager = Boolean(target?.closest<HTMLElement>('[data-manager-button]'));
        const isOverUpstreamSummary = Boolean(target?.closest<HTMLElement>('[data-upstream-summary-button]'));
        const isOverDownstreamSummary = Boolean(target?.closest<HTMLElement>('[data-downstream-summary-button]'));
        const isOverProfitSummary = Boolean(target?.closest<HTMLElement>('[data-profit-summary-button]'));
        managerTouchHoverRef.current = isOverManager;
        upstreamSummaryTouchHoverRef.current = isOverUpstreamSummary;
        downstreamSummaryTouchHoverRef.current = isOverDownstreamSummary;
        profitSummaryTouchHoverRef.current = isOverProfitSummary;
        setManagerHover(isOverManager);
        setUpstreamSummaryHover(isOverUpstreamSummary);
        setDownstreamSummaryHover(isOverDownstreamSummary);
        setProfitSummaryHover(isOverProfitSummary);
        if (isOverManager || isOverProfitSummary || isOverUpstreamSummary || isOverDownstreamSummary) {
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
        const shouldOpenProfitSummary = profitSummaryTouchHoverRef.current;
        const shouldOpenUpstreamSummary = upstreamSummaryTouchHoverRef.current;
        const shouldOpenDownstreamSummary = downstreamSummaryTouchHoverRef.current;
        if (railDismissTimerRef.current) window.clearTimeout(railDismissTimerRef.current);
        setHoverCurrencyId(null);
        setManagerHover(false);
        setProfitSummaryHover(false);
        setUpstreamSummaryHover(false);
        setDownstreamSummaryHover(false);
        setIsRailOpen(false);
        if (shouldOpenManager) setIsManagerOpen(true);
        if (shouldOpenProfitSummary) setIsProfitSummaryOpen(true);
        if (shouldOpenUpstreamSummary) setIsUpstreamSummaryOpen(true);
        if (shouldOpenDownstreamSummary) setIsDownstreamSummaryOpen(true);
      }
      managerTouchHoverRef.current = false;
      profitSummaryTouchHoverRef.current = false;
      upstreamSummaryTouchHoverRef.current = false;
      downstreamSummaryTouchHoverRef.current = false;
      gestureRef.current.startX = 0;
      gestureRef.current.startY = 0;
      gestureRef.current.side = null;
      gestureRef.current.opening = false;
    };
    
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    const preventPageScroll = (event: TouchEvent) => {
      if (!isRailOpenRef.current) return;
      // Allow native vertical scroll inside the rail's scrollable list.
      const touch = event.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (target?.closest('[data-rail-scroll]')) return;
      event.preventDefault();
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
     }, [setActiveId]);

  useEffect(() => {
    if (!isRailOpen) return;

    const scrollY = window.scrollY;
    const { body, documentElement } = document;
    // Only block touchmove outside the rail's scrollable list so the
    // currency buttons can be scrolled vertically on touch devices.
    const preventBackgroundTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (target?.closest('[data-rail-scroll]')) return;
      event.preventDefault();
    };
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
      overscroll: documentElement.style.overscrollBehavior,
    };

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    documentElement.style.overscrollBehavior = 'none';
    document.addEventListener('touchmove', preventBackgroundTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchmove', preventBackgroundTouchMove);
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      documentElement.style.overscrollBehavior = previous.overscroll;
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
    setProfitSummaryHover(false);
    setUpstreamSummaryHover(false);
    setDownstreamSummaryHover(false);
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
    setHoverCurrencyId(null);
    setManagerHover(false);
    setProfitSummaryHover(false);
    setUpstreamSummaryHover(false);
    setDownstreamSummaryHover(false);
    managerTouchHoverRef.current = false;
    profitSummaryTouchHoverRef.current = false;
    upstreamSummaryTouchHoverRef.current = false;
    downstreamSummaryTouchHoverRef.current = false;
    setIsRailOpen(true);
    railDismissTimerRef.current = window.setTimeout(() => {
      setHoverCurrencyId(null);
      setIsRailOpen(false);
    }, 8000);
  };

  useEffect(() => () => {
    if (railDismissTimerRef.current) window.clearTimeout(railDismissTimerRef.current);
  }, []);

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

  const saveFormulaHistory = () => {
    addFormulaHistory(state, formulaNote, {
      upResult: calc.upResult,
      downResult: calc.downResult,
    });
    setFormulaNote('');
  };

  return (
    <div className={cn(
      "min-h-[100dvh] w-full flex flex-col items-center pb-[max(24px,env(safe-area-inset-bottom))] pt-[calc(max(24px,env(safe-area-inset-top))+12px)] px-3 bg-background font-sans overflow-x-hidden",
      isRailOpen && "currency-rail-open",
    )}>
      
      <div className="w-full max-w-[420px] flex flex-col gap-2 relative z-10" id="calculator-capture-area">
        
        {/* Real-time Rate Accordion */}
        <CurrencySwitchSection
          className="border border-border rounded-[10px] bg-calc-surface2/40 overflow-hidden mb-0.5"
        >
          <div 
            className="px-3.5 py-2.5 flex justify-between items-center cursor-pointer select-none"
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          >
            <h4 className="text-[12px] text-muted-foreground font-semibold flex items-center gap-1.5 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-calc-source">
              實時匯率
            </h4>
            <ChevronDown size={14} className={cn("text-muted-foreground", isAccordionOpen && "rotate-180")} />
          </div>
          {isAccordionOpen && (
              <div className="px-2.5 pb-2.5 flex flex-col gap-2">
                <CalcCard variant="source" title="實時匯率">
                  <FieldRow label="金額" variant="source">
                    <FormattedInput value={state.amount} onChange={(v) => updateField('amount', v)} />
                  </FieldRow>
                  <FieldRow label="匯率" variant="source">
                    <NumberInput value={state.srcRate} onChange={(v) => updateField('srcRate', v)} step="0.0001" />
                  </FieldRow>
                  <CalcResult variant="source" label="實時匯率結果" value={calc.srcResult.toFixed(3)} />
                </CalcCard>

                <div className="bg-calc-surface border border-border rounded-xl p-3 shadow-lg">
                  <h3 className="text-[11px] tracking-wider text-muted-foreground font-semibold mb-2 text-center uppercase">實時匯率 ／ 上游（成本）</h3>
                  <DiffDisplay absolute={calc.srcDiffAbsolute} percent={calc.srcDiffPercent} />
                  <Gauge diffAbsolute={calc.srcDiffAbsolute} diffPercent={calc.srcDiffPercent} />
                  <div className="flex justify-between px-1 font-mono text-[9px] text-muted-foreground">
                    <span>−50%</span><span>0</span><span>+50%</span>
                  </div>
                </div>
              </div>
          )}
        </CurrencySwitchSection>

        {/* Upstream Card */}
        <div className="flex flex-col gap-2">
          <CurrencySwitchSection>
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
                    className="shrink-0 w-[22px] h-[22px] rounded border border-border bg-calc-surface text-muted-foreground font-mono text-xs font-semibold flex items-center justify-center mr-1 active:border-calc-up active:text-calc-up"
                  >±</button>
                }
              />
            </FieldRow>
            <FieldRow label="匯率" variant="up">
              <NumberInput value={state.upRate} onChange={(v) => updateField('upRate', v)} step="0.0001" />
            </FieldRow>
            <CalcResult variant="up" label="成本結果" value={calc.upResult.toFixed(3)} />
            </CalcCard>
          </CurrencySwitchSection>

          {/* Downstream Card */}
          <CurrencySwitchSection>
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
                    className="shrink-0 w-[22px] h-[22px] rounded border border-border bg-calc-surface text-muted-foreground font-mono text-xs font-semibold flex items-center justify-center mr-1 active:border-calc-down active:text-calc-down"
                  >±</button>
                }
              />
            </FieldRow>
            <FieldRow label="匯率" variant="down">
              <NumberInput value={state.downRate} onChange={(v) => updateField('downRate', v)} step="0.0001" />
            </FieldRow>
            <CalcResult variant="down" label="報價結果" value={calc.downResult.toFixed(3)} />
            </CalcCard>
          </CurrencySwitchSection>
        </div>

        {/* Downstream Quick Adjust */}
        <CurrencySwitchSection
          className="bg-calc-surface border border-border rounded-[10px] p-2.5 px-3 flex flex-col gap-1.5"
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-calc-down" />
            <h4 className="text-[11.5px] font-semibold text-calc-down">下游快速微調</h4>
          </div>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] text-muted-foreground w-[35px]">點位</span>
            <div className="flex gap-1 flex-1">
              <AdjustButton tone="neg" onClick={() => adjustDownPoint(-1)}>−1</AdjustButton>
              <AdjustButton tone="pos" onClick={() => adjustDownPoint(1)}>+1</AdjustButton>
            </div>
          </div>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] text-muted-foreground w-[35px]">匯率</span>
            <div className="flex gap-1 flex-1">
              <AdjustButton tone="neg" onClick={() => adjustDownRatePct(-1)}>−1%</AdjustButton>
              <AdjustButton tone="neg" onClick={() => adjustDownRatePct(-0.5)}>−0.5%</AdjustButton>
              <AdjustButton tone="pos" onClick={() => adjustDownRatePct(0.5)}>+0.5%</AdjustButton>
              <AdjustButton tone="pos" onClick={() => adjustDownRatePct(1)}>+1%</AdjustButton>
            </div>
          </div>
        </CurrencySwitchSection>

        {/* Mode Toggle — above dashboard so context is clear */}
        <CurrencySwitchSection className="flex gap-1.5 bg-calc-surface p-[3px] rounded-xl border border-border shrink-0">
          <button
            onClick={() => updateField('mode', 'deposit')}
            className={cn(
              "flex-1 h-[38px] rounded-[9px] text-[14px] font-bold tracking-wide transition-all duration-200",
              state.mode === 'deposit'
                ? "bg-calc-up text-[#0a1628] shadow-[0_0_20px_rgba(76,158,255,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]"
                : "text-muted-foreground active:text-foreground",
            )}
          >
            入金
          </button>
          <button
            onClick={() => updateField('mode', 'withdraw')}
            className={cn(
              "flex-1 h-[38px] rounded-[9px] text-[14px] font-bold tracking-wide transition-all duration-200",
              state.mode === 'withdraw'
                ? "bg-calc-down text-[#071a10] shadow-[0_0_20px_rgba(47,209,128,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]"
                : "text-muted-foreground active:text-foreground",
            )}
          >
            出金
          </button>
        </CurrencySwitchSection>

        {/* Main Dashboard */}
        <CurrencySwitchSection
          className={cn(
            "relative rounded-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] shrink-0 overflow-hidden border",
            calc.diffAbsolute > 0
              ? "bg-gradient-to-b from-[#111d2a] to-[#0d1319] border-[rgba(47,209,128,0.2)]"
              : calc.diffAbsolute < 0
              ? "bg-gradient-to-b from-[#1f1214] to-[#0d1319] border-[rgba(255,92,92,0.2)]"
              : "bg-gradient-to-b from-[#151b28] to-[#0d1319] border-border",
          )}
        >
          {/* subtle tinted glow behind the number */}
          <div className={cn(
            "pointer-events-none absolute inset-0 opacity-20",
            calc.diffAbsolute > 0
              ? "bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(47,209,128,0.3),transparent)]"
              : calc.diffAbsolute < 0
              ? "bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(255,92,92,0.3),transparent)]"
              : "",
          )} />
          <div className="relative flex items-center justify-between mb-3">
            <h3 className="text-[11px] tracking-widest text-muted-foreground font-semibold uppercase flex-1 text-center pl-[44px]">
              利潤分析
            </h3>
            <div
              className="text-[10px] font-mono bg-calc-surface2/80 text-muted-foreground px-2.5 py-0.5 rounded-full shrink-0 border border-border"
              aria-live="polite"
            >
              {activeCurrency.name}
            </div>
          </div>
          <DiffDisplay absolute={calc.diffAbsolute} percent={calc.diffPercent} large />
          <Gauge diffAbsolute={calc.diffAbsolute} diffPercent={calc.diffPercent} />
          <div className="flex justify-between px-1 font-mono text-[9px] text-muted-foreground/60 mt-0.5">
            <span>−50%</span><span>0</span><span>+50%</span>
          </div>
        </CurrencySwitchSection>

        {/* Bottom Actions */}
        <FormulaHistory
          currencyName={activeCurrency.name}
          note={formulaNote}
          onNoteChange={setFormulaNote}
          onSave={saveFormulaHistory}
          entries={formulaHistory}
          onRemove={removeFormulaHistory}
        />

        <CurrencySwitchSection>
          <button
            type="button"
            onClick={clearFormulaHistory}
            data-html2canvas-ignore="true"
            className="w-full min-h-[38px] rounded-lg border border-[rgba(255,92,92,0.35)] bg-calc-surface text-calc-neg text-[13px] font-semibold flex items-center justify-center gap-2 mt-1 active:bg-calc-surface2"
          >
            <RefreshCw size={14} />
            <span>重置公式紀錄</span>
          </button>
        </CurrencySwitchSection>

      </div>

      {/* Discoverability Handles */}
      {!isRailOpen && (
        <>
          <button
            type="button"
            className="fixed left-0 top-1/2 z-[90] flex h-20 w-8 -translate-y-1/2 items-center justify-start touch-none group"
            onPointerDown={() => openFloatingCurrencies('left')}
            onClick={() => openFloatingCurrencies('left')}
            aria-label="從左側開啟幣種浮球"
            data-html2canvas-ignore="true"
          >
            <span className="h-14 w-[5px] rounded-r-full bg-white/[0.12] group-active:bg-white/25 transition-colors shadow-[2px_0_8px_rgba(255,255,255,0.05)]" />
          </button>
          <button
            type="button"
            className="fixed right-0 top-1/2 z-[90] flex h-20 w-8 -translate-y-1/2 items-center justify-end touch-none group"
            onPointerDown={() => openFloatingCurrencies('right')}
            onClick={() => openFloatingCurrencies('right')}
            aria-label="從右側開啟幣種浮球"
            data-html2canvas-ignore="true"
          >
            <span className="h-14 w-[5px] rounded-l-full bg-white/[0.12] group-active:bg-white/25 transition-colors shadow-[-2px_0_8px_rgba(255,255,255,0.05)]" />
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
        profitSummaryHover={profitSummaryHover}
        onProfitSummaryHover={setProfitSummaryHover}
        onOpenProfitSummary={() => setIsProfitSummaryOpen(true)}
        upstreamSummaryHover={upstreamSummaryHover}
        onUpstreamSummaryHover={setUpstreamSummaryHover}
        onOpenUpstreamSummary={() => setIsUpstreamSummaryOpen(true)}
        downstreamSummaryHover={downstreamSummaryHover}
        onDownstreamSummaryHover={setDownstreamSummaryHover}
        onOpenDownstreamSummary={() => setIsDownstreamSummaryOpen(true)}
      />
      <CurrencyManager 
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        currencies={currencies}
        onAdd={addCurrency}
        onRemove={removeCurrency}
        onUpdate={updateCurrency}
        onMove={moveCurrency}
      />
      <ProfitSummaryModal
        isOpen={isProfitSummaryOpen}
        onClose={() => setIsProfitSummaryOpen(false)}
        items={profitSummary}
        total={totalProfit}
      />
      <UpstreamSummaryModal
        isOpen={isUpstreamSummaryOpen}
        onClose={() => setIsUpstreamSummaryOpen(false)}
        items={upstreamSummary}
        total={totalUpstream}
      />
      <DownstreamSummaryModal
        isOpen={isDownstreamSummaryOpen}
        onClose={() => setIsDownstreamSummaryOpen(false)}
        items={downstreamSummary}
        total={totalDownstream}
      />
    </div>
  );
}

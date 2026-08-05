import { useState, useEffect, useCallback, useMemo } from 'react';

export type CalcState = {
  mode: 'deposit' | 'withdraw';
  amount: string;
  srcRate: string;
  upPoint: string;
  upRate: string;
  downPoint: string;
  downRate: string;
};

export const SETTLEMENT_CURRENCY = 'USDT' as const;

export const DEFAULT_CALC_STATE: CalcState = {
  mode: 'deposit',
  amount: '200000',
  srcRate: '1',
  upPoint: '12',
  upRate: '1',
  downPoint: '13',
  downRate: '0.995',
};

export function useCalculatorState(currencyId: string) {
  const [state, setState] = useState<CalcState>(() => {
    try {
      const saved = localStorage.getItem(`calc_state_${currencyId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_CALC_STATE;
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`calc_state_${currencyId}`);
      if (saved) {
        setState(JSON.parse(saved));
      } else {
        setState(DEFAULT_CALC_STATE);
      }
    } catch {}
  }, [currencyId]);

  useEffect(() => {
    localStorage.setItem(`calc_state_${currencyId}`, JSON.stringify(state));
  }, [state, currencyId]);

  const updateField = useCallback(<K extends keyof CalcState>(field: K, value: CalcState[K]) => {
    setState(s => ({ ...s, [field]: value }));
  }, []);

  const reset = useCallback(() => {
    setState(DEFAULT_CALC_STATE);
  }, []);

  return { state, updateField, reset };
}

export function calculateProfit(state: CalcState) {
  const amountNum = parseFloat(state.amount) || 0;
  const upPointNum = parseFloat(state.upPoint) || 0;
  const upRateNum = parseFloat(state.upRate) || 1;
  const downPointNum = parseFloat(state.downPoint) || 0;
  const downRateNum = parseFloat(state.downRate) || 1;

  const calcLeg = (amount: number, point: number, rate: number) => {
    const pt = (100 - point) / 100;
    return (amount * pt) / rate;
  };

  const upResult = calcLeg(amountNum, upPointNum, upRateNum);
  const downResult = calcLeg(amountNum, downPointNum, downRateNum);
  const diffAbsolute = state.mode === 'deposit'
    ? upResult - downResult
    : downResult - upResult;
  const base = state.mode === 'deposit' ? upResult : downResult;
  const diffPercent = base !== 0 ? (diffAbsolute / base) * 100 : 0;

  return {
    upResult,
    downResult,
    diffAbsolute,
    diffPercent,
    // Both upstream and downstream results are already settled in USDT by
    // the calculator's input contract, so aggregation must not convert them
    // a second time using srcRate.
    settlementCurrency: SETTLEMENT_CURRENCY,
  };
}

export function isCalcState(value: unknown): value is CalcState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<CalcState>;
  return (
    (candidate.mode === 'deposit' || candidate.mode === 'withdraw') &&
    typeof candidate.amount === 'string' &&
    typeof candidate.srcRate === 'string' &&
    typeof candidate.upPoint === 'string' &&
    typeof candidate.upRate === 'string' &&
    typeof candidate.downPoint === 'string' &&
    typeof candidate.downRate === 'string'
  );
}

export function useCalculations(state: CalcState) {
  return useMemo(() => {
    const amountNum = parseFloat(state.amount) || 0;
    const srcRateNum = parseFloat(state.srcRate) || 1;
    const upPointNum = parseFloat(state.upPoint) || 0;
    const upRateNum = parseFloat(state.upRate) || 1;
    const downPointNum = parseFloat(state.downPoint) || 0;
    const downRateNum = parseFloat(state.downRate) || 1;

    const srcResult = amountNum / srcRateNum;
    
    const calcLeg = (amt: number, point: number, rate: number) => {
      const pt = (100 - point) / 100;
      return (amt * pt) / rate;
    };

    const upResult = calcLeg(amountNum, upPointNum, upRateNum);
    const downResult = calcLeg(amountNum, downPointNum, downRateNum);

    const diffAbsolute = state.mode === 'deposit' ? (upResult - downResult) : (downResult - upResult);
    const base = state.mode === 'deposit' ? upResult : downResult;
    const diffPercent = base !== 0 ? (diffAbsolute / base) * 100 : 0;

    const srcDiffAbsolute = state.mode === 'deposit' ? (srcResult - upResult) : (upResult - srcResult);
    const srcBase = state.mode === 'deposit' ? srcResult : upResult;
    const srcDiffPercent = srcBase !== 0 ? (srcDiffAbsolute / srcBase) * 100 : 0;

    return {
      srcResult, upResult, downResult,
      diffAbsolute, diffPercent,
      srcDiffAbsolute, srcDiffPercent
    };
  }, [state]);
}

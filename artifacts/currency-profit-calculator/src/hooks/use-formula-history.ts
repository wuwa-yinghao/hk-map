import { useCallback, useEffect, useState } from 'react';
import { CalcState } from '@/hooks/use-calculator-state';

export type FormulaHistoryEntry = CalcState & {
  id: string;
  note: string;
  createdAt: string;
};

const historyKey = (currencyId: string) => `calc_formula_history_${currencyId}`;

const isFormulaHistoryEntry = (value: unknown): value is FormulaHistoryEntry => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<FormulaHistoryEntry>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.note === 'string' &&
    typeof candidate.createdAt === 'string' &&
    (candidate.mode === 'deposit' || candidate.mode === 'withdraw') &&
    typeof candidate.amount === 'string' &&
    typeof candidate.srcRate === 'string' &&
    typeof candidate.upPoint === 'string' &&
    typeof candidate.upRate === 'string' &&
    typeof candidate.downPoint === 'string' &&
    typeof candidate.downRate === 'string'
  );
};

const loadHistory = (currencyId: string) => {
  try {
    const saved = localStorage.getItem(historyKey(currencyId));
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter(isFormulaHistoryEntry) : [];
  } catch {
    return [];
  }
};

export function useFormulaHistory(currencyId: string) {
  const [entries, setEntries] = useState<FormulaHistoryEntry[]>(() => loadHistory(currencyId));

  useEffect(() => {
    setEntries(loadHistory(currencyId));
  }, [currencyId]);

  useEffect(() => {
    localStorage.setItem(historyKey(currencyId), JSON.stringify(entries));
  }, [currencyId, entries]);

  const addEntry = useCallback((state: CalcState, note: string) => {
    setEntries((current) => [{
      ...state,
      id: crypto.randomUUID(),
      note: note.trim(),
      createdAt: new Date().toISOString(),
    }, ...current]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }, []);

  return { entries, addEntry, removeEntry };
}
import { useCallback, useEffect, useState } from 'react';
import { CalcState, normalizeCalcState } from '@/hooks/use-calculator-state';

export type FormulaHistoryEntry = CalcState & {
  id: string;
  note: string;
  createdAt: string;
  upResult?: number;
  downResult?: number;
};

const historyKey = (currencyId: string) => `calc_formula_history_${currencyId}`;

const normalizeFormulaHistoryEntry = (value: unknown): FormulaHistoryEntry | null => {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<FormulaHistoryEntry>;
  const legacyCandidate = candidate as Partial<FormulaHistoryEntry> & {
    upAmount?: unknown;
    downAmount?: unknown;
  };
  const state = normalizeCalcState(candidate);
  const usesDeprecatedIndependentAmounts =
    typeof legacyCandidate.upAmount === 'string' ||
    typeof legacyCandidate.downAmount === 'string';
  if (
    !state ||
    typeof candidate.id !== 'string' ||
    typeof candidate.note !== 'string' ||
    typeof candidate.createdAt !== 'string'
  ) {
    return null;
  }

  return {
    ...state,
    id: candidate.id,
    note: candidate.note,
    createdAt: candidate.createdAt,
    ...(typeof candidate.upResult === 'number' && !usesDeprecatedIndependentAmounts
      ? { upResult: candidate.upResult }
      : {}),
    ...(typeof candidate.downResult === 'number' && !usesDeprecatedIndependentAmounts
      ? { downResult: candidate.downResult }
      : {}),
  };
};

export const loadFormulaHistory = (currencyId: string): FormulaHistoryEntry[] => {
  try {
    const saved = localStorage.getItem(historyKey(currencyId));
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed)
      ? parsed.map(normalizeFormulaHistoryEntry).filter((entry): entry is FormulaHistoryEntry => entry !== null)
      : [];
  } catch {
    return [];
  }
};

export function useFormulaHistory(currencyId: string) {
  const [entries, setEntries] = useState<FormulaHistoryEntry[]>(() => loadFormulaHistory(currencyId));

  useEffect(() => {
    setEntries(loadFormulaHistory(currencyId));
  }, [currencyId]);

  useEffect(() => {
    localStorage.setItem(historyKey(currencyId), JSON.stringify(entries));
  }, [currencyId, entries]);

  const addEntry = useCallback((state: CalcState, note: string, results: { upResult: number; downResult: number }) => {
    setEntries((current) => [{
      ...state,
      ...results,
      id: crypto.randomUUID(),
      note: note.trim(),
      createdAt: new Date().toISOString(),
    }, ...current]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const clearEntries = useCallback(() => {
    setEntries([]);
  }, []);

  return { entries, addEntry, removeEntry, clearEntries };
}
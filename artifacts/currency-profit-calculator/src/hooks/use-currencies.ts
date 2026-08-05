import { useState, useEffect } from 'react';

export type Currency = {
  id: string;
  code: string;
  name: string;
  isDefault: boolean;
};

const DEFAULT_CURRENCIES: Currency[] = [
  { id: 'myr', code: 'MYR', name: '馬幣', isDefault: true },
  { id: 'sgd', code: 'SGD', name: '新幣', isDefault: true },
  { id: 'hkd', code: 'HKD', name: '港幣', isDefault: true },
  { id: 'vnd', code: 'VND', name: '越盾', isDefault: true },
];

export function useCurrencies() {
  const [currencies, setCurrencies] = useState<Currency[]>(() => {
    try {
      const saved = localStorage.getItem('calc_currencies');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_CURRENCIES;
  });

  const [activeId, setActiveId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('calc_active_currency');
      if (saved && currencies.some(c => c.id === saved)) return saved;
    } catch {}
    return currencies[0].id;
  });

  useEffect(() => {
    localStorage.setItem('calc_currencies', JSON.stringify(currencies));
  }, [currencies]);

  useEffect(() => {
    localStorage.setItem('calc_active_currency', activeId);
  }, [activeId]);

  const addCurrency = (name: string) => {
    const id = 'currency_' + Date.now();
    const newCur = { id, code: id, name, isDefault: false };
    setCurrencies(prev => [...prev, newCur]);
    setActiveId(newCur.id);
  };

  const removeCurrency = (id: string) => {
    setCurrencies(prev => {
      if (prev.length <= 1) return prev;
      const currency = prev.find(item => item.id === id);
      if (!currency || currency.isDefault) return prev;
      const next = prev.filter(c => c.id !== id);
      if (activeId === id && next[0]) setActiveId(next[0].id);
      return next;
    });
  };

  const updateCurrency = (id: string, name: string) => {
    setCurrencies(prev => prev.map(currency => (
      currency.id === id ? { ...currency, name } : currency
    )));
  };

  const moveCurrency = (id: string, direction: 'up' | 'down') => {
    setCurrencies(prev => {
      const currentIndex = prev.findIndex(currency => currency.id === id);
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= prev.length) return prev;

      const next = [...prev];
      [next[currentIndex], next[targetIndex]] = [next[targetIndex], next[currentIndex]];
      return next;
    });
  };

  return {
    currencies,
    activeId,
    setActiveId,
    addCurrency,
    removeCurrency,
    updateCurrency,
    moveCurrency,
  };
}

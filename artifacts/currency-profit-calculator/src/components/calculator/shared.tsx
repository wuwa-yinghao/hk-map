import React, { useState } from 'react';
import { cn, formatThousands } from '@/lib/utils';

type CardVariant = 'source' | 'up' | 'down';

const variantAccentBorder = {
  source: 'border-l-[3px] border-l-calc-source',
  up: 'border-l-[3px] border-l-calc-up',
  down: 'border-l-[3px] border-l-calc-down',
};

const variantGlow = {
  source: 'shadow-[0_2px_16px_rgba(167,139,250,0.08)]',
  up: 'shadow-[0_2px_16px_rgba(76,158,255,0.08)]',
  down: 'shadow-[0_2px_16px_rgba(47,209,128,0.08)]',
};

const variantResultBg = {
  source: 'bg-calc-source/5 border-calc-source/20',
  up: 'bg-calc-up/5 border-calc-up/20',
  down: 'bg-calc-down/5 border-calc-down/20',
};

const variantTextColors = {
  source: 'text-calc-source',
  up: 'text-calc-up',
  down: 'text-calc-down',
};

const variantFocusClasses = {
  source: 'focus-within:border-calc-source',
  up: 'focus-within:border-calc-up',
  down: 'focus-within:border-calc-down',
};

export function CalcCard({ variant, title, children }: { variant: CardVariant, title: string, children: React.ReactNode }) {
  return (
    <div className={cn(
      "relative bg-calc-surface border border-border rounded-[10px] p-2.5 px-3 overflow-hidden",
      variantAccentBorder[variant],
      variantGlow[variant],
    )}>
      <div className="flex items-center gap-1.5 mb-2">
        <h3 className={cn("text-[12px] font-semibold tracking-wide", variantTextColors[variant])}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function CalcResult({ variant, label, value }: { variant: CardVariant, label: string, value: string }) {
  return (
    <div className={cn(
      "mt-2 pt-1.5 border-t border-dashed border-border",
      "flex items-baseline justify-between gap-1",
    )}>
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className={cn("font-mono text-[17px] font-bold tabular-nums", variantTextColors[variant])}>{value}</span>
    </div>
  );
}

export function FieldRow({ label, variant, children }: { label: string, variant: CardVariant, children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5 last:mb-0">
      <label className="w-[30px] shrink-0 text-[11px] text-muted-foreground font-medium">{label}</label>
      <div className={cn(
        "flex-1 min-w-0 flex items-center bg-calc-surface2 border border-border rounded-md px-2 transition-colors focus-within:bg-[#20242F]",
        variantFocusClasses[variant],
      )}>
        {children}
      </div>
    </div>
  );
}

export function FormattedInput({ value, onChange, onFocusSelect, className, suffix, prefixButton }: {
  value: string;
  onChange: (val: string) => void;
  onFocusSelect?: boolean;
  className?: string;
  suffix?: React.ReactNode;
  prefixButton?: React.ReactNode;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const displayValue = isFocused ? value : formatThousands(value);

  return (
    <>
      {prefixButton}
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onFocus={(e) => {
          setIsFocused(true);
          if (onFocusSelect) setTimeout(() => e.target.select(), 0);
        }}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => onChange(e.target.value.replace(/,/g, ''))}
        className={cn(
          "flex-1 w-full min-w-0 bg-transparent border-none outline-none font-mono text-[15px] font-semibold text-foreground text-right py-1.5",
          className
        )}
      />
      {suffix && <span className="text-[11px] font-medium text-muted-foreground ml-1 font-mono">{suffix}</span>}
    </>
  );
}

export function NumberInput({ value, onChange, className, suffix, prefixButton, step }: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  suffix?: React.ReactNode;
  prefixButton?: React.ReactNode;
  step?: string;
}) {
  return (
    <>
      {prefixButton}
      <input
        type="number"
        inputMode="decimal"
        step={step || "any"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => setTimeout(() => e.target.select(), 0)}
        className={cn(
          "flex-1 w-full min-w-0 bg-transparent border-none outline-none font-mono text-[15px] font-semibold text-foreground text-right py-1.5",
          className
        )}
      />
      {suffix && <span className="text-[11px] font-medium text-muted-foreground ml-1 font-mono">{suffix}</span>}
    </>
  );
}

export function DiffDisplay({ absolute, percent, large = false }: { absolute: number, percent: number, large?: boolean }) {
  const isPos = absolute > 0;
  const isNeg = absolute < 0;
  
  const absStr = (isPos ? '+' : '') + absolute.toFixed(3);
  const pctStr = (isPos ? '+' : '') + percent.toFixed(2) + '%';
  
  const colorClass = isPos ? 'text-calc-pos' : isNeg ? 'text-calc-neg' : 'text-muted-foreground';
  const glowClass = isPos
    ? 'drop-shadow-[0_0_18px_rgba(47,209,128,0.45)]'
    : isNeg
    ? 'drop-shadow-[0_0_18px_rgba(255,92,92,0.45)]'
    : '';

  return (
    <div className="text-center mb-3">
      <div className={cn(
        "font-mono font-bold tabular-nums tracking-tight leading-tight",
        large ? "text-[44px]" : "text-3xl",
        colorClass,
        large && glowClass,
      )}>
        {absStr}
      </div>
      <div className={cn("font-mono text-[13px] font-semibold mt-0.5", colorClass)}>
        {pctStr}
      </div>
    </div>
  );
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stripCommas(str: string | undefined | null) {
  return (str || '').toString().replace(/,/g, '');
}

export function formatThousands(numStr: string | undefined | null) {
  const cleaned = stripCommas(numStr);
  if (cleaned === '' || cleaned === '-' || isNaN(parseFloat(cleaned))) return cleaned;
  return parseFloat(cleaned).toLocaleString('en-US', { maximumFractionDigits: 6 });
}

import { useState, useEffect } from 'react';

type ToastProps = {
  description: string;
  variant?: 'default' | 'destructive';
  duration?: number;
};

let memoryState: ToastProps | null = null;
let listeners: ((t: ToastProps | null) => void)[] = [];

export function toast(props: ToastProps) {
  memoryState = props;
  listeners.forEach(l => l(memoryState));
  setTimeout(() => {
    if (memoryState === props) {
      memoryState = null;
      listeners.forEach(l => l(null));
    }
  }, props.duration || 3000);
}

export function useToast() {
  const [current, setCurrent] = useState<ToastProps | null>(memoryState);
  
  useEffect(() => {
    listeners.push(setCurrent);
    return () => {
      listeners = listeners.filter(l => l !== setCurrent);
    };
  }, []);
  
  return { toast, current };
}

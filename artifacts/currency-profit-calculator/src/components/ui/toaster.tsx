import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { current } = useToast();
  return (
    <AnimatePresence>
      {current && (
        <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+20px)] left-1/2 -translate-x-1/2 z-[120] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "px-4 py-2.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.5)] border text-[12.5px] whitespace-nowrap font-medium text-center",
              current.variant === 'destructive' 
                ? "bg-calc-neg text-black border-calc-neg" 
                : "bg-calc-surface2 text-foreground border-border"
            )}
          >
            {current.description}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

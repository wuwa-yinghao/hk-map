import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PreviewModal({ isOpen, imageSrc, onClose }: { isOpen: boolean, imageSrc: string | null, onClose: () => void }) {
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!imageSrc) return;
    try {
      const blob = await (await fetch(imageSrc)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      toast({ description: "圖片已複製到剪貼簿", duration: 2000 });
    } catch (err) {
      toast({ description: "複製失敗，請嘗試直接長按圖片儲存", variant: "destructive", duration: 3000 });
    }
  };

  const handleSave = () => {
    if (!imageSrc) return;
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `profit_calc_${Date.now()}.png`;
    link.click();
    toast({ description: "圖片已開始下載", duration: 2000 });
  };

  return (
    <AnimatePresence>
      {isOpen && imageSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0A0C10]/95 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[380px] flex flex-col gap-3"
          >
            <button 
              onClick={onClose} 
              className="absolute -top-12 right-0 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground bg-calc-surface2 rounded-full border border-border"
            >
              <X size={20} />
            </button>
            
            <p className="text-[12.5px] text-muted-foreground text-center leading-relaxed bg-calc-surface2 p-3 rounded-lg border border-border">
              點擊下方按鈕或<b className="text-calc-down font-medium">直接長按圖片</b>即可儲存或分享。
            </p>
            
            <img 
              src={imageSrc} 
              alt="Screenshot Preview" 
              className="w-full h-auto max-h-[55vh] object-contain rounded-lg border border-border shadow-[0_6px_30px_rgba(0,0,0,0.6)]"
            />
            
            <button 
              onClick={handleCopy}
              className="w-full min-h-[44px] rounded-lg border border-calc-up bg-[rgba(76,158,255,0.12)] text-calc-up text-[14px] font-semibold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(76,158,255,0.15)] active:bg-[rgba(76,158,255,0.25)] transition-colors"
            >
              <Copy size={18} />
              <span>複製圖片</span>
            </button>
            
            <button 
              onClick={handleSave}
              className="w-full min-h-[44px] rounded-lg border border-calc-down bg-[rgba(47,209,128,0.12)] text-calc-down text-[14px] font-semibold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(47,209,128,0.15)] active:bg-[rgba(47,209,128,0.25)] transition-colors"
            >
              <Download size={18} />
              <span>保存到相冊</span>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

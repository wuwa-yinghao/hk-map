import {
  FlowSummaryModal,
  type FlowSummaryItem,
} from '@/components/calculator/FlowSummaryModal';

export type UpstreamSummaryItem = FlowSummaryItem;

export function UpstreamSummaryModal({
  isOpen,
  onClose,
  items,
  total,
}: {
  isOpen: boolean;
  onClose: () => void;
  items: UpstreamSummaryItem[];
  total: number;
}) {
  return (
    <FlowSummaryModal
      isOpen={isOpen}
      onClose={onClose}
      items={items}
      total={total}
      direction="upstream"
    />
  );
}
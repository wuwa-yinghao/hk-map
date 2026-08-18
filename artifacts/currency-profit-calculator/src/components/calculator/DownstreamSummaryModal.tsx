import {
  FlowSummaryModal,
  type FlowSummaryItem,
} from '@/components/calculator/FlowSummaryModal';

export type DownstreamSummaryItem = FlowSummaryItem;

export function DownstreamSummaryModal({
  isOpen,
  onClose,
  items,
  total,
}: {
  isOpen: boolean;
  onClose: () => void;
  items: DownstreamSummaryItem[];
  total: number;
}) {
  return (
    <FlowSummaryModal
      isOpen={isOpen}
      onClose={onClose}
      items={items}
      total={total}
      direction="downstream"
    />
  );
}

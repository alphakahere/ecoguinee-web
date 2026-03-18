import { Badge } from '@/components/ui/badge';
import type { WasteType } from '@/lib/types';

const WASTE_META: Record<WasteType, { label: string; color: string; bg: string }> = {
  solid:  { label: 'Solide',  color: 'text-orange-600',  bg: 'bg-orange-500/10' },
  liquid: { label: 'Liquide', color: 'text-blue-500',    bg: 'bg-blue-500/10' },
  mixed:  { label: 'Mixte',   color: 'text-purple-500',  bg: 'bg-purple-500/10' },
};

export function WasteTypeBadge({ type }: { type: WasteType }) {
  const meta = WASTE_META[type];
  return (
    <Badge className={`${meta.bg} ${meta.color} border-0`}>
      {meta.label}
    </Badge>
  );
}

import { Badge } from '@/components/ui/badge';
import { STATUS_META, type InterventionStatus } from '@/lib/types';

export function StatusBadge({ status }: { status: InterventionStatus }) {
  const meta = STATUS_META[status];
  return (
    <Badge className={`${meta.bg} ${meta.color} border-0`}>
      {meta.label}
    </Badge>
  );
}

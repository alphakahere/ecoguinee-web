import { Badge } from '@/components/ui/badge';
import { SEVERITY_META, type SeverityLevel } from '@/lib/types';

export function SeverityBadge({ severity }: { severity: SeverityLevel }) {
  const meta = SEVERITY_META[severity];
  return (
    <Badge className={`${meta.bg} ${meta.color} border-0`}>
      {meta.label}
    </Badge>
  );
}

import { Badge } from '@/components/ui/badge';
import { CAMP_STATUS_META, type CampaignStatus } from '@/lib/types';

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const meta = CAMP_STATUS_META[status];
  return (
    <Badge className={`${meta.bg} ${meta.text} border-0`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: meta.dot }} />
      {meta.label}
    </Badge>
  );
}

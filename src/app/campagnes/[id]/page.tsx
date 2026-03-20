import { CampaignDetailView } from '@/components/campagnes/campaign-detail-view';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({ params }: Props) {
  const { id } = await params;
  return <CampaignDetailView id={id} />;
}

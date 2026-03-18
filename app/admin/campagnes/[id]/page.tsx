import { CampaignDetailView } from '@/components/campagnes/campaign-detail-view';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminCampaignDetailPage({ params }: Props) {
  const { id } = await params;
  return <CampaignDetailView id={id} basePath="/admin/campagnes" />;
}

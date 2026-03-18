import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CAMPAIGNS } from '@/lib/data/campaigns-data';
import { CampaignCard } from '@/components/shared/campaign-card';

const latestCampaigns = CAMPAIGNS.filter((c) => c.statut !== 'annulee').slice(0, 3);

export function CampaignsPreview() {
  return (
    <section className="py-20 bg-background topo-pattern">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: '#2D7D46' }}>
              Nos actions sur le terrain
            </p>
            <h2 className="font-bold" style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)' }}>
              Campagnes récentes
            </h2>
          </div>
          <Link
            href="/campagnes"
            className="hidden md:flex items-center gap-2 text-sm font-mono font-semibold transition-all group"
            style={{ color: '#2D7D46' }}
          >
            Voir toutes les campagnes
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestCampaigns.map((c, i) => (
            <CampaignCard key={c.id} campaign={c} index={i} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/campagnes"
            className="inline-flex items-center gap-2 text-sm font-mono font-semibold"
            style={{ color: '#2D7D46' }}
          >
            Voir toutes les campagnes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

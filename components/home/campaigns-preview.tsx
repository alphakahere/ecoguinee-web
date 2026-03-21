'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useCampaigns } from '@/hooks/queries/useCampaigns';
import { API_CAMPAIGN_STATUS_META, API_CAMPAIGN_TYPE_META } from '@/types/api';

export function CampaignsPreview() {
  const { data } = useCampaigns({ page: 1, limit: 3 });
  const campaigns = data?.data ?? [];

  return (
    <section className="py-20 bg-background topo-pattern">
      <div className="max-w-7xl mx-auto px-5">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-end justify-between mb-10"
        >
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
        </motion.div>

        {campaigns.length === 0 ? (
          <p className="text-sm font-mono text-muted-foreground text-center py-12">Aucune campagne pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((c, i) => {
              const statusMeta = API_CAMPAIGN_STATUS_META[c.status];
              const typeMeta = API_CAMPAIGN_TYPE_META[c.type];
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={`${typeMeta.bg} ${typeMeta.color} border-0`}>{typeMeta.label}</Badge>
                      <Badge className={`${statusMeta.bg} ${statusMeta.color} border-0`}>{statusMeta.label}</Badge>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{c.title}</h3>
                    {c.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{c.description}</p>
                    )}
                    <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mt-auto pt-3 border-t border-border">
                      <span>{c.zone?.name ?? '—'}</span>
                      <span>{formatDate(c.scheduledDate)}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 text-center md:hidden"
        >
          <Link
            href="/campagnes"
            className="inline-flex items-center gap-2 text-sm font-mono font-semibold"
            style={{ color: '#2D7D46' }}
          >
            Voir toutes les campagnes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

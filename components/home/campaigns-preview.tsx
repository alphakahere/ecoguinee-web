'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { CampaignCard } from '@/components/shared/campaign-card';
import { useCampaigns } from '@/hooks/queries/useCampaigns';
import { useScrollRevealMotion } from '@/lib/motion-prefs';

export function CampaignsPreview() {
  const { data } = useCampaigns({ page: 1, limit: 3 });
  const campaigns = data?.data ?? [];
  const { offscreen, onscreen, transition, reduced } = useScrollRevealMotion();

  return (
    <section className="py-20 bg-background topo-pattern">
      <div className="max-w-7xl mx-auto px-5">
        <motion.div
          initial={offscreen}
          whileInView={onscreen}
          viewport={{ once: true, margin: '-60px' }}
          transition={transition}
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
            {campaigns.map((c, i) => (
              <motion.div
                key={c.id}
                initial={offscreen}
                whileInView={onscreen}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ ...transition, delay: reduced ? 0 : i * 0.1 }}
              >
                <CampaignCard campaign={c} index={i} />
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={offscreen}
          whileInView={onscreen}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ ...transition, delay: reduced ? 0 : 0.3 }}
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

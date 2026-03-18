'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { CAMPAIGNS } from '@/lib/data/campaigns-data';
import { CampaignCard } from '@/components/shared/campaign-card';

const latestCampaigns = CAMPAIGNS.filter((c) => c.statut !== 'annulee').slice(0, 3);

export function CampaignsPreview() {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestCampaigns.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <CampaignCard campaign={c} index={i} />
            </motion.div>
          ))}
        </div>

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

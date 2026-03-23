'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Wrench, Landmark, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollRevealMotion } from '@/lib/motion-prefs';

const audiences = [
  {
    icon: Users,
    color: '#6FCF4A',
    bg: 'rgba(111,207,74,0.1)',
    title: 'Citoyens',
    desc: 'Signalez un dépôt sauvage ou un déversement près de chez vous. Votre contribution améliore votre quartier.',
    cta: { label: 'Faire un signalement', href: '/signaler' },
  },
  {
    icon: Wrench,
    color: '#2D7D46',
    bg: 'rgba(45,125,70,0.1)',
    title: 'Agents de terrain',
    desc: 'Collectez et gérez les incidents depuis le terrain. Suivez vos interventions en temps réel.',
    cta: { label: 'Espace Agent', href: '/agent' },
  },
  {
    icon: Landmark,
    color: '#E8A020',
    bg: 'rgba(232,160,32,0.1)',
    title: 'Autorités locales',
    desc: 'Pilotez les interventions, analysez les données par territoire et optimisez les ressources en temps réel.',
    cta: { label: 'Administration', href: '/login?next=%2Fadmin' },
  },
];

export function WhoIsItFor() {
  const { offscreen, onscreen, transition, reduced } = useScrollRevealMotion();

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-5">
        <motion.div
          initial={offscreen}
          whileInView={onscreen}
          viewport={{ once: true, margin: '-60px' }}
          transition={transition}
          className="mb-14 text-center"
        >
          <p
            className="text-xs font-mono uppercase tracking-widest mb-3"
            style={{ color: '#2D7D46' }}
          >
            Pour qui ?
          </p>
          <h2
            className="font-bold"
            style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)' }}
          >
            Une plateforme pour tous
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {audiences.map((a, i) => (
            <motion.div
              key={a.title}
              initial={offscreen}
              whileInView={onscreen}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ ...transition, delay: reduced ? 0 : i * 0.1 }}
            >
              <div
                className={cn(
                  'bg-card rounded-2xl p-7 border border-border h-full flex flex-col gap-5 hover:shadow-xl transition-all',
                  !reduced && 'hover:-translate-y-1',
                )}
              >
                <div
                  className="w-13 h-13 rounded-2xl flex items-center justify-center"
                  style={{ background: a.bg }}
                >
                  <a.icon className="w-6 h-6" style={{ color: a.color }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-2" style={{ fontSize: '1.15rem' }}>
                    {a.title}
                  </h3>
                  <p className="text-sm font-mono text-muted-foreground leading-relaxed">
                    {a.desc}
                  </p>
                </div>
                <Link
                  href={a.cta.href}
                  className="group flex items-center gap-2 text-sm font-mono font-semibold mt-auto transition-all"
                  style={{ color: a.color }}
                >
                  {a.cta.label}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

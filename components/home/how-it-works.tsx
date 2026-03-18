'use client';

import { motion } from 'framer-motion';
import { Camera, Bell, TrendingUp } from 'lucide-react';

const STEPS = [
  {
    step: '01', icon: Camera, title: 'Signalez', color: '#2D7D46', bg: 'rgba(45,125,70,0.1)',
    description: 'Prenez une photo, géolocalisez le problème, décrivez-le en quelques secondes. Pas besoin de compte.',
  },
  {
    step: '02', icon: Bell, title: 'Intervenir', color: '#E8A020', bg: 'rgba(232,160,32,0.1)',
    description: 'Les agents et opérateurs reçoivent l\'alerte instantanément et planifient l\'intervention selon la priorité.',
  },
  {
    step: '03', icon: TrendingUp, title: 'Résoudre', color: '#6FCF4A', bg: 'rgba(111,207,74,0.1)',
    description: 'Suivez l\'état d\'avancement jusqu\'à la résolution complète du problème signalé.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-background topo-pattern">
      <div className="max-w-7xl mx-auto px-5">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 text-center"
        >
          <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: '#2D7D46' }}>
            Comment ça fonctionne ?
          </p>
          <h2 className="font-bold" style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)' }}>
            3 étapes, un impact réel
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div
            className="hidden md:block absolute top-12 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px pointer-events-none"
            style={{ background: 'repeating-linear-gradient(90deg, rgba(45,125,70,0.4) 0, rgba(45,125,70,0.4) 8px, transparent 8px, transparent 20px)' }}
          />

          {STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="bg-card rounded-2xl p-7 border border-border h-full flex flex-col gap-5 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="w-13 h-13 rounded-2xl flex items-center justify-center" style={{ background: s.bg }}>
                    <s.icon className="w-6 h-6" style={{ color: s.color }} />
                  </div>
                  <span className="font-bold" style={{ fontSize: '2.8rem', lineHeight: 1, color: 'rgba(45,125,70,0.12)' }}>
                    {s.step}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold mb-2" style={{ color: s.color, fontSize: '1.15rem' }}>
                    {s.title}
                  </h3>
                  <p className="text-sm font-mono text-muted-foreground leading-relaxed">
                    {s.description}
                  </p>
                </div>
                <div className="mt-auto h-0.5 rounded-full" style={{ background: s.color, opacity: 0.25 }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

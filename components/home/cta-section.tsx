'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, AlertTriangle } from 'lucide-react';

export function CtaSection() {
  return (
    <section className="relative overflow-hidden" style={{ background: '#1E5C32' }}>
      <div className="absolute inset-0 topo-pattern opacity-30 pointer-events-none" />
      <div
        className="absolute pointer-events-none"
        style={{
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(111,207,74,0.2) 0%, transparent 65%)',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-5 py-20 md:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6"
          style={{ background: 'rgba(111,207,74,0.15)', border: '1px solid rgba(111,207,74,0.3)' }}
        >
          <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#6FCF4A' }} />
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#6FCF4A' }}>
            Rejoignez le mouvement
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-bold text-white mb-4"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.2 }}
        >
          Vous voyez un problème ?<br />
          Signalez-le maintenant.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-mono mb-10 mx-auto max-w-lg"
          style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}
        >
          Pas besoin de créer un compte. 2 minutes suffisent pour soumettre un signalement.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href="/signaler"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-mono transition-all hover:scale-105 hover:shadow-2xl"
            style={{ background: '#2D7D46', boxShadow: '0 6px 36px rgba(45,125,70,0.5)', fontSize: '1rem' }}
          >
            Faire un signalement
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-5 text-xs font-mono"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Vos signalements sont traités par les autorités locales et les agents certifiés EcoGuinée.
        </motion.p>
      </div>
    </section>
  );
}

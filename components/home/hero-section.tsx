'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, ArrowRight, LogIn, Leaf } from 'lucide-react';

export function HeroSection() {
  return (
    <section
      className="relative flex flex-col justify-center min-h-[80vh] overflow-hidden"
      style={{ background: '#0A1A10' }}
    >
      {/* Green radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '70vw', height: '70vw', maxWidth: 900, maxHeight: 900,
          background: 'radial-gradient(circle, rgba(45,125,70,0.22) 0%, rgba(111,207,74,0.08) 40%, transparent 72%)',
          top: '50%', left: '50%', transform: 'translate(-50%, -56%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #0A1A10)' }}
      />

      <div className="relative max-w-7xl mx-auto px-5 py-24 md:py-32 w-full">
        <div className="max-w-5xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-7"
            style={{ borderColor: 'rgba(111,207,74,0.3)', background: 'rgba(111,207,74,0.08)' }}
          >
            <Leaf className="w-3.5 h-3.5" style={{ color: '#6FCF4A' }} />
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#6FCF4A' }}>
              Plateforme officielle · République de Guinée
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-bold text-white mb-5"
            style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4rem)', lineHeight: 1.12, letterSpacing: '-0.02em' }}
          >
            Ensemble pour une Guinée
            <br />
            <span style={{ color: '#6FCF4A' }}>plus propre</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-mono mb-9 max-w-xl"
            style={{ color: 'rgba(245,240,232,0.6)', fontSize: '1rem', lineHeight: 1.7 }}
          >
            EcoGuinée connecte les citoyens, les agents de terrain et les autorités
            pour éliminer les points noirs environnementaux à travers tout le pays.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              href="/signaler"
              className="group flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-white font-mono transition-all hover:scale-105"
              style={{ background: '#2D7D46', boxShadow: '0 4px 24px rgba(45,125,70,0.45)' }}
            >
              <FileText className="w-4 h-4" />
              Signaler un point noir
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/carte"
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-mono transition-all hover:scale-105"
              style={{
                border: '1px solid rgba(255,255,255,0.18)',
                color: 'rgba(245,240,232,0.85)',
                background: 'rgba(255,255,255,0.06)',
              }}
            >
              <LogIn className="w-4 h-4" />
              Voir la carte
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

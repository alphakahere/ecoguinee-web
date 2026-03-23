'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { FileText, ArrowRight, Map, Leaf } from 'lucide-react';
import { usePublicStats } from '@/hooks/queries/usePublicStats';

function useCountUp(target: number, duration = 1500, delay = 0, skipAnimation = false) {
  const [count, setCount] = useState(0);
  /** Last target we fully ran the count-up for (avoids blocking when stats load after first paint or refetch) */
  const lastAnimatedTarget = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (skipAnimation) return;

    if (target === 0) {
      lastAnimatedTarget.current = null;
      return;
    }

    // Skip only if we already finished animating to this value (not on every re-render before completion)
    if (lastAnimatedTarget.current === target) return;

    const t = setTimeout(() => {
      const startTime = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setCount(Math.round(target * eased));
        if (p < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          lastAnimatedTarget.current = target;
          rafRef.current = null;
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(t);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [target, duration, delay, skipAnimation]);

  if (skipAnimation) return target === 0 ? 0 : target;
  // While stats are loading (target 0), show 0 without syncing count in the effect (avoids cascading renders)
  return target === 0 ? 0 : count;
}

function CounterItem({ value, label, suffix = '', delay = 0, skipAnimation = false }: {
  value: number; label: string; suffix?: string; delay?: number; skipAnimation?: boolean;
}) {
  const count = useCountUp(value, 1500, delay, skipAnimation);
  return (
    <motion.div
      initial={skipAnimation ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: skipAnimation ? 0 : 0.5, delay: skipAnimation ? 0 : delay / 1000 + 0.6 }}
      className="flex flex-col items-center gap-1 px-6 py-4"
    >
      <span
        className="font-bold text-white"
        style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', lineHeight: 1 }}
      >
        {count}{suffix}
      </span>
      <span className="text-xs font-mono text-white/50 uppercase tracking-widest text-center">
        {label}
      </span>
    </motion.div>
  );
}

function TopoSVG() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1200 700"
    >
      <g fill="none" stroke="rgba(111,207,74,0.13)" strokeWidth="1">
        {[280, 240, 200, 162, 126, 92, 60, 34].map((r, i) => (
          <ellipse key={i} cx="600" cy="350" rx={r * 2.2} ry={r * 1.3} />
        ))}
        {[180, 148, 118, 90, 64, 42].map((r, i) => (
          <ellipse key={`b${i}`} cx="200" cy="150" rx={r * 2} ry={r * 1.2} />
        ))}
        {[160, 128, 98, 72].map((r, i) => (
          <ellipse key={`c${i}`} cx="1050" cy="580" rx={r * 1.8} ry={r} />
        ))}
        {Array.from({ length: 14 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 52} x2="1200" y2={i * 52 + 18} strokeOpacity="0.06" />
        ))}
      </g>
    </svg>
  );
}

export function HeroSection() {
  const { data: stats } = usePublicStats();
  const prefersReducedMotion = useReducedMotion();

  const enter = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : undefined;
  const trans = (d: number, delay = 0) =>
    prefersReducedMotion ? { duration: 0 } : { duration: d, delay };

  return (
    <section
      className="relative flex flex-col justify-center overflow-hidden min-h-[calc(100vh-4rem)]"
      style={{ background: '#0A1A10' }}
    >
      <TopoSVG />
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
          <motion.div
            initial={enter ?? { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={trans(0.5)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-7"
            style={{ borderColor: 'rgba(111,207,74,0.3)', background: 'rgba(111,207,74,0.08)' }}
          >
            <Leaf className="w-3.5 h-3.5" style={{ color: '#6FCF4A' }} />
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#6FCF4A' }}>
              Plateforme officielle · République de Guinée
            </span>
          </motion.div>

          <motion.h1
            initial={enter ?? { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.1 }}
            className="font-bold text-white mb-5"
            style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4rem)', lineHeight: 1.12, letterSpacing: '-0.02em' }}
          >
            Ensemble pour une Guinée
            <br />
            <span style={{ color: '#6FCF4A' }}>plus propre</span>
          </motion.h1>

          <motion.p
            initial={enter ?? { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.2 }}
            className="font-mono mb-9 max-w-xl"
            style={{ color: 'rgba(245,240,232,0.6)', fontSize: '1rem', lineHeight: 1.7 }}
          >
            EcoGuinée connecte les citoyens, les agents de terrain et les autorités
            pour éliminer les points noirs environnementaux à travers tout le pays.
          </motion.p>

          <motion.div
            initial={enter ?? { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-3 mb-16"
          >
            <Link
              href="/signaler"
              className={`group flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-white font-mono transition-all ${prefersReducedMotion ? '' : 'hover:scale-105'}`}
              style={{ background: '#2D7D46', boxShadow: '0 4px 24px rgba(45,125,70,0.45)' }}
            >
              <FileText className="w-4 h-4" />
              Signaler un point noir
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/carte"
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-mono transition-all ${prefersReducedMotion ? '' : 'hover:scale-105'}`}
              style={{
                border: '1px solid rgba(255,255,255,0.18)',
                color: 'rgba(245,240,232,0.85)',
                background: 'rgba(255,255,255,0.06)',
              }}
            >
              <Map className="w-4 h-4" aria-hidden />
              Voir la carte
            </Link>
          </motion.div>

          <p className="text-[11px] font-mono uppercase tracking-widest text-white/40 mb-3">
            Aperçu en direct
          </p>
          <motion.div
            initial={enter ?? { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.5 }}
            className="inline-flex flex-col md:flex-row flex-wrap md:flex-nowrap rounded-2xl overflow-hidden divide-x divide-white/10 w-full md:w-auto"
            style={{
              border: '1px solid rgba(111,207,74,0.18)',
              background: 'rgba(15,31,21,0.7)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <CounterItem value={stats?.totalReports ?? 0} label="Points noirs signalés" delay={0} skipAnimation={!!prefersReducedMotion} />
            <CounterItem value={stats?.resolvedReports ?? 0} label="Interventions résolues" delay={150} skipAnimation={!!prefersReducedMotion} />
            <CounterItem value={stats?.communes ?? 0} label="Communes couvertes" delay={300} skipAnimation={!!prefersReducedMotion} />
            <CounterItem value={stats?.activeSmes ?? 0} label="PMEs partenaires" delay={450} skipAnimation={!!prefersReducedMotion} />
          </motion.div>
          <p className="mt-4 text-center md:text-left">
            <a
              href="#impact"
              className="text-xs font-mono text-[#6FCF4A]/80 hover:text-[#6FCF4A] underline-offset-4 hover:underline transition-colors"
            >
              Indicateurs détaillés et tendances →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

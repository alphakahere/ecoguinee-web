'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Activity, Users, CheckCircle, Megaphone } from 'lucide-react';
import { usePublicStats } from '@/hooks/queries/usePublicStats';

function useScrollCountUp(target: number, duration = 1500, delay = 0, started = false) {
  const [count, setCount] = useState(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!started || hasStarted.current || target === 0) return;
    hasStarted.current = true;
    const t = setTimeout(() => {
      const startTime = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setCount(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [target, duration, delay, started]);

  return count;
}

function StatCard({
  stat, index, started,
}: {
  stat: { icon: React.ElementType; color: string; value: number; suffix?: string; label: string };
  index: number;
  started: boolean;
}) {
  const count = useScrollCountUp(stat.value, 1500, index * 100, started);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={started ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{
        background: 'rgba(26,47,32,0.6)',
        border: `1px solid ${stat.color}22`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}14` }}>
        <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
      </div>
      <div>
        <p className="font-bold text-white" style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', lineHeight: 1 }}>
          {count}{stat.suffix ?? ''}
        </p>
        <p className="text-xs font-mono mt-1" style={{ color: 'rgba(245,240,232,0.45)' }}>
          {stat.label}
        </p>
      </div>
      <div className="h-0.5 rounded-full mt-auto" style={{ background: stat.color, opacity: 0.2 }} />
    </motion.div>
  );
}

export function KeyFigures() {
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { once: true, margin: '-80px' });
  const { data: publicStats } = usePublicStats();

  const stats = [
    { icon: MapPin,      color: '#6FCF4A', value: publicStats?.communes ?? 0,        label: 'Communes couvertes' },
    { icon: Users,       color: '#2D7D46', value: publicStats?.activeSmes ?? 0,      label: 'PMEs partenaires' },
    { icon: Activity,    color: '#E8A020', value: publicStats?.totalReports ?? 0,     label: 'Signalements reçus' },
    { icon: CheckCircle, color: '#D94035', value: publicStats?.resolvedReports ?? 0,  label: 'Signalements traités', suffix: '+' },
    { icon: Megaphone,   color: '#6FCF4A', value: publicStats?.totalCampaigns ?? 0,   label: 'Campagnes réalisées' },
  ];

  return (
    <section className="py-20" style={{ background: '#0A1A10' }}>
      <div className="max-w-7xl mx-auto px-5">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: '#6FCF4A' }}>
            Notre impact
          </p>
          <h2 className="font-bold text-white" style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)' }}>
            Des chiffres qui parlent
          </h2>
        </motion.div>

        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {stats.map((s, i) => (
            <StatCard key={s.label} stat={s} index={i} started={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

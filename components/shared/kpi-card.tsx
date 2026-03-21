'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

const colorClasses = {
  primary:  { border: 'border-l-[#2D7D46]', icon: 'text-[#2D7D46]' },
  warning:  { border: 'border-l-[#E8A020]', icon: 'text-[#E8A020]' },
  success:  { border: 'border-l-[#6FCF4A]', icon: 'text-[#6FCF4A]' },
  neutral:  { border: 'border-l-muted-foreground', icon: 'text-muted-foreground' },
} as const;

interface KPICardProps {
  title: string;
  value: number;
  trend?: number;
  icon: LucideIcon;
  color: keyof typeof colorClasses;
  delay?: number;
}

export function KPICard({ title, value, trend, icon: Icon, color, delay = 0 }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const increment = value / 30;
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, 20);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  const c = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-card rounded-2xl p-4 border border-border grain-overlay"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide font-mono">{title}</p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-4xl font-bold counter-animate font-mono">{displayValue}</h3>
            {trend !== undefined && (
              <span className={`text-sm font-mono ${trend >= 0 ? 'text-[#6FCF4A]' : 'text-[#D94035]'}`}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-lg bg-muted/30 ${c.icon}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}

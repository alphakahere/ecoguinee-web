'use client';

import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

const variantStyles = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary/20 text-secondary-foreground',
  destructive: 'bg-destructive/10 text-destructive',
  outline: 'border border-border text-foreground bg-transparent',
} as const;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variantStyles;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

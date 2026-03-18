'use client';

import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export function Slider({ className, label, id, ...props }: SliderProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        id={id}
        type="range"
        className={cn(
          'w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary',
          className,
        )}
        {...props}
      />
    </div>
  );
}

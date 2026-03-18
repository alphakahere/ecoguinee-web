'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounce?: number;
}

export function SearchInput({ value, onChange, placeholder = 'Rechercher...', className, debounce = 300 }: SearchInputProps) {
  const [internal, setInternal] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => { setInternal(value); }, [value]);

  const handleChange = (v: string) => {
    setInternal(v);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onChange(v), debounce);
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        value={internal}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      {internal && (
        <button
          onClick={() => { setInternal(''); onChange(''); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

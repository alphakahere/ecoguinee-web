'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-5 text-center">
      <div className="w-20 h-20 rounded-2xl bg-[#D94035]/10 flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10 text-[#D94035]" />
      </div>

      <h1 className="font-bold text-2xl mb-2">Une erreur est survenue</h1>
      <p className="text-sm font-mono text-muted-foreground mb-8 max-w-md">
        Quelque chose s&apos;est mal passé. Veuillez réessayer ou contacter le support si le problème persiste.
      </p>

      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-mono text-sm hover:bg-primary/90 transition-all"
      >
        <RotateCcw className="w-4 h-4" />
        Réessayer
      </button>
    </div>
  );
}

import Link from 'next/link';
import { MapPin, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 text-center">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <MapPin className="w-10 h-10 text-primary" />
      </div>

      <h1 className="font-bold text-5xl mb-3" style={{ color: '#2D7D46' }}>404</h1>
      <h2 className="font-bold text-xl mb-2">Page introuvable</h2>
      <p className="text-sm font-mono text-muted-foreground mb-8 max-w-md">
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
        Vérifiez l&apos;URL ou retournez à l&apos;accueil.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-mono text-sm hover:bg-primary/90 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}

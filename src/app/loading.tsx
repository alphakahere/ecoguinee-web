import { MapPin } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
        <MapPin className="w-6 h-6 text-primary" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <p className="text-sm font-mono text-muted-foreground mt-4">Chargement...</p>
    </div>
  );
}

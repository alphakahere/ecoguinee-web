'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, FileText, LogIn, Map, Megaphone } from 'lucide-react';

const NAV_LINKS = [
  { href: '/carte',     label: 'Carte',     icon: Map },
  { href: '/campagnes', label: 'Campagnes', icon: Megaphone },
];

export function PublicNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-sm block leading-none">EcoGuinée</span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Conakry · Guinée</span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 p-1 rounded-xl border border-border bg-muted/40">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href} href={href}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg font-mono text-sm transition-all"
                style={{
                  background: active ? '#2D7D46' : 'transparent',
                  color: active ? '#ffffff' : 'var(--muted-foreground)',
                  boxShadow: active ? '0 2px 8px rgba(45,125,70,0.3)' : 'none',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/login" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-mono text-muted-foreground hover:bg-muted/50 transition-all">
            <LogIn className="w-3.5 h-3.5" /> Connexion
          </Link>
          <Link href="/signaler" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-mono hover:bg-primary/90 transition-all hover:shadow-md hover:shadow-primary/30">
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Signaler</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

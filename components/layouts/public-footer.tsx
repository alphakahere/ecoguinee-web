import Link from 'next/link';
import { MapPin, Mail, Phone, Globe, Leaf } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-5 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold block">EcoGuinée</span>
              <span className="text-xs font-mono text-muted-foreground">Plateforme de gestion environnementale</span>
            </div>
          </div>
          <p className="text-sm font-mono text-muted-foreground leading-relaxed max-w-xs">
            Coordonner la lutte contre les déchets sauvages en Guinée grâce à la technologie et à la mobilisation citoyenne.
          </p>
        </div>

        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Navigation</p>
          <ul className="space-y-2.5">
            {[
              { label: 'Accueil', href: '/' },
              { label: 'Nos actions', href: '/campagnes' },
              { label: 'Signaler', href: '/signaler' },
              { label: 'Connexion', href: '/admin' },
              { label: 'Administration', href: '/admin' },
            ].map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Contact</p>
          <ul className="space-y-3">
            <li className="flex items-center gap-2.5 text-sm font-mono text-muted-foreground">
              <Mail className="w-4 h-4 flex-shrink-0 text-primary" />contact@ecoguinee.gn
            </li>
            <li className="flex items-center gap-2.5 text-sm font-mono text-muted-foreground">
              <Phone className="w-4 h-4 flex-shrink-0 text-primary" />+224 620 00 00 00
            </li>
            <li className="flex items-center gap-2.5 text-sm font-mono text-muted-foreground">
              <Globe className="w-4 h-4 flex-shrink-0 text-primary" />www.ecoguinee.gn
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-mono text-muted-foreground">© 2026 EcoGuinée · Tous droits réservés</p>
          <p className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
            <Leaf className="w-3 h-3" style={{ color: '#6FCF4A' }} />Made for Guinea
          </p>
        </div>
      </div>
    </footer>
  );
}

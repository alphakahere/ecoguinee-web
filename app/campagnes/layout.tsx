'use client';

import { PublicNavbar } from '@/components/layouts/public-navbar';
import { PublicFooter } from '@/components/layouts/public-footer';

export default function CampagnesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}

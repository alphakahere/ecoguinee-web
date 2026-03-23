'use client';

import { PublicNavbar } from '@/components/layouts/public-navbar';
import { PublicFooter } from '@/components/layouts/public-footer';
import { ReportWizard } from '@/components/signaler/report-wizard';

export default function SignalerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar />
      <main className="flex-1 px-4">
        <ReportWizard />
      </main>
      <PublicFooter />
    </div>
  );
}

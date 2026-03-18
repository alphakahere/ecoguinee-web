import { DashboardOverview } from '@/components/superviseur/dashboard-overview';

export default function SuperviseurDashboardPage() {
  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h2 className="font-bold text-xl sm:text-2xl mb-1">Tableau de bord</h2>
        <p className="text-sm font-mono text-muted-foreground">
          Vue d&apos;ensemble de votre périmètre
        </p>
      </div>
      <DashboardOverview />
    </div>
  );
}

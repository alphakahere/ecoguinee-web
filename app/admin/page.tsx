import { DashboardSummary } from '@/components/admin/dashboard-summary';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="font-bold text-xl sm:text-2xl mb-1">Administration</h2>
        <p className="text-sm font-mono text-muted-foreground">
          Vue d&apos;ensemble de la plateforme EcoGuinée
        </p>
      </div>
      <DashboardSummary />
    </div>
  );
}

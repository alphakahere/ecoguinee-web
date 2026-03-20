import { DashboardStats } from '@/components/agent/dashboard-stats';
import { RecentReports } from '@/components/agent/recent-reports';

export default function AgentDashboardPage() {
  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h2 className="font-bold text-xl sm:text-2xl mb-1">Bonjour, Fatoumata</h2>
        <p className="text-muted-foreground font-mono text-sm">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>
      <DashboardStats />
      <RecentReports />
    </div>
  );
}

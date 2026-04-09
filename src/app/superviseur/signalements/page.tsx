'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { SearchInput } from '@/components/shared/search-input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/shared/data-table';
import { ViewModeTabs, type ViewMode } from '@/components/shared/view-mode-tabs';
import { ReportsMapView } from '@/components/maps/reports-map-view';
import { formatDate } from '@/lib/utils';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useReports } from '@/hooks/queries/useReports';
import { useAvailableReports } from '@/hooks/queries/useAvailableReports';
import { useClaimReport } from '@/hooks/mutations/useClaimReport';
import { useSupervisorOverview } from '@/hooks/queries/useSupervisorDashboard';
import type { ApiReport, ReportStatus, ApiSeverity } from '@/types/api';
import { REPORT_STATUS_META, SEVERITY_META_API, WASTE_TYPE_META, REPORT_SOURCE_META } from '@/types/api';
import { AxiosError } from 'axios';

const MAP_PAGE_SIZE = 200;

type TabKey = 'all' | 'available' | 'in_progress' | 'resolved';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'available', label: 'Disponibles' },
  { key: 'in_progress', label: 'En cours' },
  { key: 'resolved', label: 'Résolus' },
];

export default function SuperviseurSignalementsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: overview } = useSupervisorOverview();
  const organizationId = overview?.pme.id;

  const initialTab = (searchParams.get('tab') as TabKey) || 'all';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [view, setView] = useState<ViewMode>('table');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const resetPage = () => setPage(1);

  // Tab-based status mapping
  const tabStatus: Record<TabKey, ReportStatus | undefined> = {
    all: (statusFilter || undefined) as ReportStatus | undefined,
    available: 'REPORTED',
    in_progress: 'IN_PROGRESS',
    resolved: 'RESOLVED',
  };

  const filters = {
    organizationId: organizationId || undefined,
    search: debouncedSearch || undefined,
    status: tabStatus[activeTab],
    severity: (severityFilter || undefined) as ApiSeverity | undefined,
  };

  const tableFilters = organizationId
    ? { ...filters, page, limit: pageSize }
    : undefined;
  const mapFilters = organizationId
    ? { ...filters, page: 1, limit: MAP_PAGE_SIZE }
    : undefined;

  // For 'available' tab, use the dedicated endpoint
  const availableQuery = useAvailableReports();
  const isAvailableTab = activeTab === 'available';

  const tableQuery = useReports(tableFilters, {
    enabled: !!organizationId && view === 'table' && !isAvailableTab,
  });
  const mapQuery = useReports(mapFilters, {
    enabled: !!organizationId && view === 'map' && !isAvailableTab,
  });

  const claim = useClaimReport();

  const handleClaim = (reportId: string) => {
    claim.mutate(
      { reportId },
      {
        onSuccess: () => {
          toast.success('Signalement pris en charge !');
        },
        onError: (error) => {
          if (error instanceof AxiosError && error.response?.status === 409) {
            toast.error('Ce signalement vient d\'être pris en charge par une autre organisation.');
          } else {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur lors de la prise en charge.';
            toast.error(message);
          }
        },
      },
    );
  };

  // Data source depends on tab
  const activeData = isAvailableTab
    ? (availableQuery.data?.data ?? [])
    : (tableQuery.data?.data ?? []);
  const activeTotal = isAvailableTab
    ? (availableQuery.data?.total ?? 0)
    : (tableQuery.data?.total ?? 0);
  const activeLoading = isAvailableTab
    ? availableQuery.isLoading
    : (tableQuery.isLoading || !organizationId);
  const activeError = isAvailableTab
    ? availableQuery.isError
    : tableQuery.isError;

  const totalPages = Math.max(1, Math.ceil(activeTotal / pageSize));
  const canNext = page < totalPages;
  const canPrev = page > 1;

  const columns: Column<ApiReport>[] = [
    {
      key: 'id',
      label: 'Réf.',
      render: (r) => (
        <Link
          href={`/superviseur/signalements/${r.reference ?? r.id}`}
          className="font-mono text-xs text-primary hover:underline"
        >
          {r.reference ?? `#SIG-${r.id.slice(0, 6)}`}
        </Link>
      ),
    },
    { key: 'type', label: 'Type', render: (r) => <Badge className={`${WASTE_TYPE_META[r.type].bg} ${WASTE_TYPE_META[r.type].color} border-0`}>{WASTE_TYPE_META[r.type].label}</Badge> },
    { key: 'severity', label: 'Gravité', render: (r) => <Badge className={`${SEVERITY_META_API[r.severity].bg} ${SEVERITY_META_API[r.severity].color} border-0`}>{SEVERITY_META_API[r.severity].label}</Badge> },
    { key: 'zone', label: 'Zone', render: (r) => <span className="text-sm font-mono">{r.zone?.name ?? '—'}</span> },
    { key: 'source', label: 'Source', render: (r) => <span className="text-xs font-mono text-muted-foreground">{REPORT_SOURCE_META[r.source].label}</span> },
    { key: 'status', label: 'Statut', render: (r) => <Badge className={`${REPORT_STATUS_META[r.status].bg} ${REPORT_STATUS_META[r.status].color} border-0`}>{REPORT_STATUS_META[r.status].label}</Badge> },
    { key: 'date', label: 'Date', render: (r) => <span className="text-xs font-mono text-muted-foreground">{formatDate(r.createdAt)}</span> },
    {
      key: 'actions',
      label: '',
      headerClassName: 'text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground',
      className: 'text-right w-[160px]',
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          {isAvailableTab && (
            <Button
              size="sm"
              onClick={() => handleClaim(r.id)}
              disabled={claim.isPending}
              className="text-xs h-7 px-2"
            >
              Prendre en charge
            </Button>
          )}
          <Link
            href={`/superviseur/signalements/${r.reference ?? r.id}`}
            className="inline-flex rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Voir le détail"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ];

  const toolbar = (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
      <SearchInput value={search} onChange={(v) => { setSearch(v); resetPage(); }} placeholder="Adresse, zone…" className="w-full max-w-md" />
      {activeTab === 'all' && (
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }} className="min-w-[150px] max-w-xs">
          <option value="">Tous les statuts</option>
          {Object.entries(REPORT_STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
        </Select>
      )}
      <Select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); resetPage(); }} className="min-w-[140px] max-w-xs">
        <option value="">Toutes gravités</option>
        {Object.entries(SEVERITY_META_API).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
      </Select>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Signalements"
        description={`${activeTotal} signalement${activeTotal !== 1 ? 's' : ''} dans votre périmètre`}
        action={<ViewModeTabs value={view} onChange={setView} />}
      />

      {/* Tab bar */}
      <div className="flex gap-1 mb-4 bg-muted/50 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); resetPage(); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              activeTab === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.key === 'available' && (availableQuery.data?.total ?? 0) > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px]">
                {availableQuery.data?.total}
              </span>
            )}
          </button>
        ))}
      </div>

      {view === 'table' ? (
        <DataTable
          data={activeData}
          columns={columns}
          total={activeTotal}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          canPrev={canPrev}
          canNext={canNext}
          toolbar={toolbar}
          isLoading={activeLoading}
          isError={activeError}
          getRowKey={(r) => r.id}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">{toolbar}</div>
          <ReportsMapView
            reports={isAvailableTab ? (availableQuery.data?.data ?? []) : (mapQuery.data?.data ?? [])}
            isLoading={isAvailableTab ? availableQuery.isLoading : (mapQuery.isLoading || !organizationId)}
          />
        </div>
      )}
    </div>
  );
}

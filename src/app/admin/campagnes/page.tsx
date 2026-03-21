'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { SearchInput } from '@/components/shared/search-input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useCampaigns } from '@/hooks/queries/useCampaigns';
import { useDeleteCampaign } from '@/hooks/mutations/useDeleteCampaign';
import type { ApiCampaign, ApiCampaignStatus, ApiCampaignType } from '@/types/api';
import { API_CAMPAIGN_STATUS_META, API_CAMPAIGN_TYPE_META } from '@/types/api';

const PAGE_SIZE = 15;

export default function AdminCampagnesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const filters = {
    search: debouncedSearch || undefined,
    status: (statusFilter || undefined) as ApiCampaignStatus | undefined,
    type: (typeFilter || undefined) as ApiCampaignType | undefined,
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, isError } = useCampaigns(filters);
  const campaigns = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const deleteCampaign = useDeleteCampaign();

  const handleDelete = async (c: ApiCampaign) => {
    if (!window.confirm(`Supprimer la campagne « ${c.title} » ?`)) return;
    try {
      await deleteCampaign.mutateAsync(c.id);
      toast.success('Campagne supprimée');
    } catch {
      toast.error('Suppression impossible');
    }
  };

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Campagnes</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {total} campagne{total !== 1 ? 's' : ''}
            </p>
          </div>
          <Link href="/admin/campagnes/nouvelle">
            <Button className="font-mono text-xs">
              <Plus className="w-4 h-4 mr-2" /> Nouvelle campagne
            </Button>
          </Link>
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); resetPage(); }}
            placeholder="Titre, zone, agent…"
            className="w-full max-w-md"
          />
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }} className="min-w-[160px]">
            <option value="">Tous les statuts</option>
            {Object.entries(API_CAMPAIGN_STATUS_META).map(([v, m]) => (
              <option key={v} value={v}>{m.label}</option>
            ))}
          </Select>
          <Select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); resetPage(); }} className="min-w-[160px]">
            <option value="">Tous les types</option>
            {Object.entries(API_CAMPAIGN_TYPE_META).map(([v, m]) => (
              <option key={v} value={v}>{m.label}</option>
            ))}
          </Select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <span className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
          </div>
        ) : isError ? (
          <p className="py-8 text-sm font-mono text-muted-foreground">Impossible de charger les campagnes.</p>
        ) : (
          <>
            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-background">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Titre</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Zone</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date prévue</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Agent</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">Aucun résultat</TableCell>
                    </TableRow>
                  ) : campaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Link href={`/admin/campagnes/${c.id}`} className="text-sm font-semibold hover:text-primary transition-colors">
                          {c.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${API_CAMPAIGN_TYPE_META[c.type].bg} ${API_CAMPAIGN_TYPE_META[c.type].color} border-0`}>
                          {API_CAMPAIGN_TYPE_META[c.type].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">{c.zone?.name ?? '—'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${API_CAMPAIGN_STATUS_META[c.status].bg} ${API_CAMPAIGN_STATUS_META[c.status].color} border-0`}>
                          {API_CAMPAIGN_STATUS_META[c.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono text-muted-foreground">{formatDate(c.scheduledDate)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono">{c.agent?.name ?? '—'}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/campagnes/${c.id}`} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(c)}
                            disabled={deleteCampaign.isPending}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-4 mt-4">
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg p-1.5 hover:bg-muted disabled:opacity-50">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="font-mono text-xs">{page} / {totalPages}</span>
                  <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg p-1.5 hover:bg-muted disabled:opacity-50">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { reportsService } from '@/services/reports';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiReportFilters, OwnershipFilter } from '@/types/api';

type ReportFiltersWithOwnership = ApiReportFilters & {
  ownership?: OwnershipFilter;
};

function resolveFilters(
  filters: ReportFiltersWithOwnership | undefined,
  currentUserId: string | undefined,
): ApiReportFilters | undefined {
  if (!filters) return undefined;
  const { ownership, ...rest } = filters;
  if (!ownership || ownership === 'all') return rest;
  if (ownership === 'mine') {
    return { ...rest, agentId: currentUserId };
  }
  // 'organization' — same org zones but exclude own reports
  return { ...rest, excludeAgentId: currentUserId };
}

export function useReports(
  filters?: ReportFiltersWithOwnership,
  options?: { enabled?: boolean },
) {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const resolved = useMemo(
    () => resolveFilters(filters, currentUserId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(filters), currentUserId],
  );

  return useQuery({
    queryKey: resolved
      ? queryKeys.reports.filtered(resolved)
      : queryKeys.reports.all,
    queryFn: () => reportsService.getAll(resolved),
    enabled: options?.enabled !== false,
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: queryKeys.reports.detail(id),
    queryFn: () => reportsService.getById(id),
    enabled: !!id,
  });
}

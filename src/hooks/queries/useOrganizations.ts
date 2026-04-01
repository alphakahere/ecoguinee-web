import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { organizationsService } from '@/services/organizations';
import type { OrganizationFilters } from '@/types/api';

export function useOrganizations(filters?: OrganizationFilters) {
  return useQuery({
    queryKey: filters ? queryKeys.organizations.filtered(filters) : queryKeys.organizations.all,
    queryFn: () => organizationsService.getAll(filters),
  });
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: queryKeys.organizations.detail(id),
    queryFn: () => organizationsService.getById(id),
    enabled: !!id,
  });
}

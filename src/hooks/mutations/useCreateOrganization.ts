import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { organizationsService } from '@/services/organizations';
import type { CreateOrganizationPayload } from '@/types/api';

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrganizationPayload) => organizationsService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.organizations.all }),
  });
}

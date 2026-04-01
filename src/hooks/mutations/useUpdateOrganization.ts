import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { organizationsService } from '@/services/organizations';
import type { UpdateOrganizationPayload } from '@/types/api';

export function useUpdateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOrganizationPayload }) =>
      organizationsService.update(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.organizations.all });
      qc.invalidateQueries({ queryKey: queryKeys.organizations.detail(id) });
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { organizationsService } from '@/services/organizations';

export function useDeleteOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizationsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.organizations.all }),
  });
}

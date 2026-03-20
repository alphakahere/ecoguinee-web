import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { usersService } from '@/services/users';
import type { UserFilters } from '@/types';

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: filters
      ? queryKeys.users.filtered(filters)
      : queryKeys.users.all,
    queryFn: () => usersService.getAll(filters),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersService.getById(id),
    enabled: !!id,
  });
}

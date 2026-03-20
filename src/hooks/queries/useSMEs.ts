import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { smesService } from '@/services/smes';

export function useSMEs() {
  return useQuery({
    queryKey: queryKeys.smes.all,
    queryFn: () => smesService.getAll(),
  });
}

export function useSME(id: string) {
  return useQuery({
    queryKey: queryKeys.smes.detail(id),
    queryFn: () => smesService.getById(id),
    enabled: !!id,
  });
}

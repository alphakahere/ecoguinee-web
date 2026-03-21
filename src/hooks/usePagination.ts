import { useState, useCallback, useMemo } from 'react';

interface PaginationOptions {
  pageSize?: number;
  initialPage?: number;
}

interface PaginationReturn {
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: (page: number) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
  canNext: boolean;
  canPrev: boolean;
}

export function usePagination(total: number, options: PaginationOptions = {}): PaginationReturn {
  const { pageSize = 15, initialPage = 1 } = options;
  const [page, setPage] = useState(initialPage);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const next = useCallback(() => setPage((p) => Math.min(totalPages, p + 1)), [totalPages]);
  const prev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const reset = useCallback(() => setPage(1), []);

  return {
    page,
    pageSize,
    totalPages,
    setPage,
    next,
    prev,
    reset,
    canNext: page < totalPages,
    canPrev: page > 1,
  };
}

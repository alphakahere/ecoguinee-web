'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Column<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
  headerClassName?: string;
  className?: string;
}

interface DataTableProps<T> {
  /** Data rows for the current page (already fetched from API) */
  data: T[];
  columns: Column<T>[];
  /** Total number of items across all pages (from API response) */
  total?: number;
  /** Current page number (1-based) */
  page?: number;
  /** Total number of pages */
  totalPages?: number;
  /** Called when user changes page */
  onPageChange?: (page: number) => void;
  canPrev?: boolean;
  canNext?: boolean;
  /** Slot for toolbar content (search, filters) rendered above the table */
  toolbar?: React.ReactNode;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  isError?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Row key extractor */
  getRowKey?: (item: T, index: number) => string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DataTable<T>({
  data,
  columns,
  total,
  page,
  totalPages,
  onPageChange,
  canPrev,
  canNext,
  toolbar,
  isLoading = false,
  isError = false,
  errorMessage = 'Impossible de charger les données.',
  emptyMessage = 'Aucun résultat',
  getRowKey,
}: DataTableProps<T>) {
  const showPagination = totalPages && totalPages > 1 && onPageChange;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        {toolbar && <div className="mb-4">{toolbar}</div>}
        <div className="flex justify-center py-16">
          <span className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        {toolbar && <div className="mb-4">{toolbar}</div>}
        <p className="py-8 text-sm font-mono text-muted-foreground">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      {toolbar && <div className="mb-4">{toolbar}</div>}

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-background">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={col.headerClassName ?? 'text-xs font-semibold uppercase tracking-wider text-muted-foreground'}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, i) => (
                <TableRow key={getRowKey ? getRowKey(item, i) : i}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer: count + pagination */}
      <div className="flex items-center justify-between mt-4">
        {total != null && (
          <span className="text-xs font-mono text-muted-foreground">
            {total} résultat{total !== 1 ? 's' : ''}
          </span>
        )}
        {showPagination && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => onPageChange(page! - 1)}
              disabled={!canPrev}
              className="rounded-lg p-1.5 hover:bg-muted disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-mono text-xs">{page} / {totalPages}</span>
            <button
              type="button"
              onClick={() => onPageChange(page! + 1)}
              disabled={!canNext}
              className="rounded-lg p-1.5 hover:bg-muted disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

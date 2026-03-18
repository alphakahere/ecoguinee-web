'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { SearchInput } from './search-input';
import { Select } from '@/components/ui/select';

interface Column<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
  searchable?: boolean;
}

interface Filter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  filters?: Filter[];
  pageSize?: number;
  searchPlaceholder?: string;
  getSearchValue?: (item: T) => string;
}

export function DataTable<T extends { id?: string }>({
  data,
  columns,
  filters = [],
  pageSize = 10,
  searchPlaceholder,
  getSearchValue,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    let result = data;

    if (search && getSearchValue) {
      const q = search.toLowerCase();
      result = result.filter((item) => getSearchValue(item).toLowerCase().includes(q));
    }

    for (const [key, value] of Object.entries(filterValues)) {
      if (value) {
        result = result.filter((item) => String((item as Record<string, unknown>)[key]) === value);
      }
    }

    return result;
  }, [data, search, filterValues, getSearchValue]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(0); }}
          placeholder={searchPlaceholder}
          className="sm:max-w-xs"
        />
        {filters.length > 0 && (
          <div className="flex gap-2">
            {filters.map((f) => (
              <Select
                key={f.key}
                value={filterValues[f.key] || ''}
                onChange={(e) => {
                  setFilterValues((prev) => ({ ...prev, [f.key]: e.target.value }));
                  setPage(0);
                }}
                className="w-auto min-w-[140px]"
              >
                <option value="">{f.label}</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  Aucun résultat
                </TableCell>
              </TableRow>
            ) : (
              paged.map((item, i) => (
                <TableRow key={(item as Record<string, unknown>).id as string ?? i}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>{col.render(item)}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs">{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

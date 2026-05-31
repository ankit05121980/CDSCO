import { useState, ReactNode } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Search, Loader2, Inbox } from 'lucide-react';
import { api, Paginated } from '../../lib/api';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  endpoint: string;
  columns: Column<T>[];
  params?: Record<string, any>;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  toolbar?: ReactNode;
  limit?: number;
  emptyMessage?: string;
}

export default function DataTable<T extends { id?: string }>({
  endpoint,
  columns,
  params = {},
  searchPlaceholder = 'Search…',
  onRowClick,
  toolbar,
  limit = 15,
  emptyMessage = 'No records found.',
}: Props<T>) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isFetching, isError } = useQuery({
    queryKey: [endpoint, page, search, params],
    queryFn: async () => {
      const res = await api.get<Paginated<T>>(endpoint, {
        params: { page, limit, search: search || undefined, ...params },
      });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const rows = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(searchInput);
          }}
          className="relative flex-1 min-w-[220px] max-w-md"
        >
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-md border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
          />
        </form>
        <div className="flex items-center gap-2">{toolbar}</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              {columns.map((c) => (
                <th key={c.key} className={`px-4 py-3 font-semibold ${c.className || ''}`}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-slate-50 ${
                  onRowClick ? 'cursor-pointer hover:bg-navy-50' : ''
                }`}
              >
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 ${c.className || ''}`}>
                    {c.render ? c.render(row) : (row as any)[c.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && !isFetching && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-slate-400">
                  <Inbox className="mx-auto mb-2" />
                  {isError ? 'Failed to load data.' : emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 p-3 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          {isFetching && <Loader2 size={14} className="animate-spin" />}
          {meta ? (
            <span>
              {meta.total.toLocaleString('en-IN')} records · page {meta.page} of{' '}
              {meta.totalPages}
            </span>
          ) : (
            <span>Loading…</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            className="btn-outline px-2 py-1 disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="btn-outline px-2 py-1 disabled:opacity-40"
            disabled={meta ? page >= meta.totalPages : true}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

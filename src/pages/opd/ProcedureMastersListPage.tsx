// src/pages/opd/ProcedureMastersListPage.tsx
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useProcedureMasters } from '@/hooks/useOPD';
import type { ProcedureMasterListParams } from '@/types/opd.types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCcw,
  Plus,
  FileText,
  ClipboardSignature,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Banknote,
  Layers3,
  Building2,
  Eye,
} from 'lucide-react';

// shared responsive table like Patients
import { DataTable, DataTableColumn } from '@/components/DataTable';

// ------------------ helpers ------------------

function formatRupee(value: number | string | undefined | null) {
  if (value === undefined || value === null) return '₹0.00';
  const num =
    typeof value === 'string' ? parseFloat(value as string) : (value as number);
  if (isNaN(num)) return '₹0.00';
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function ActiveStatusBadge({ is_active }: { is_active: boolean }) {
  if (is_active) {
    return (
      <Badge
        variant="secondary"
        className="bg-green-100 text-green-700 border border-green-200 flex items-center gap-1 text-[10px] font-medium"
      >
        <CheckCircle2 className="h-3 w-3" />
        Active
      </Badge>
    );
  }
  return (
    <Badge
      variant="secondary"
      className="bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-1 text-[10px] font-medium"
    >
      <XCircle className="h-3 w-3" />
      Inactive
    </Badge>
  );
}

function ConsentBadge({ requires_consent }: { requires_consent: boolean }) {
  if (!requires_consent) {
    return (
      <Badge
        variant="outline"
        className="text-[10px] font-medium flex items-center gap-1 text-slate-600 border-slate-300 bg-slate-50"
      >
        <ShieldCheck className="h-3 w-3" />
        No Consent Req.
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="text-[10px] font-medium flex items-center gap-1 text-orange-700 border-orange-300 bg-orange-50"
    >
      <ClipboardSignature className="h-3 w-3" />
      Consent Needed
    </Badge>
  );
}

// ------------------ component ------------------

export default function ProcedureMastersListPage() {
  // server filters
  const [filters, setFilters] = useState<ProcedureMasterListParams>({
    page: 1,
    is_active: undefined,
    search: '',
    category: undefined,
    department: undefined,
  });

  // separate local search text for debounce
  const [searchText, setSearchText] = useState(filters.search || '');

  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchText,
        page: 1,
      }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const {
    procedureMasters,
    count,
    next,
    previous,
    isLoading,
    error,
    mutate,
  } = useProcedureMasters(filters);

  // have we loaded at least once (for skeleton behavior)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  useEffect(() => {
    if (!isLoading && !error) {
      setHasLoadedOnce(true);
    }
  }, [isLoading, error]);

  const handleFilterChange = (
    key: keyof ProcedureMasterListParams,
    value: any
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
      page: 1,
    }));
  };

  const handleRefresh = () => {
    mutate();
  };

  // row actions (to plug into drawers later)
  const handleViewProcedure = useCallback((proc: any) => {
    console.log('view procedure', proc.id);
    // open detail drawer in view mode
  }, []);

  const handleEditProcedure = useCallback((proc: any) => {
    console.log('edit procedure', proc.id);
    // open drawer in edit mode
  }, []);

  const handleDeleteProcedure = useCallback(async (proc: any) => {
    console.log('delete procedure', proc.id);
    // delete API (soft-delete or deactivate), then mutate()
  }, []);

  // ------------------ desktop table columns ------------------
  const columns = useMemo<DataTableColumn<any>[]>(() => {
    return [
      {
        key: 'procedure',
        header: 'Procedure',
        cell: (p) => (
          <div>
            <div className="font-medium text-slate-900 flex items-center gap-1 text-[13px] leading-tight">
              <FileText className="h-3.5 w-3.5 text-slate-500" />
              <span>{p.name || '—'}</span>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 leading-tight">
              <span className="text-xs text-slate-500 font-mono bg-slate-100 dark:bg-slate-900/40 rounded px-1 py-[1px]">
                {p.code || `#${p.id}`}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: 'category',
        header: 'Category / Dept',
        cell: (p) => (
          <div className="text-xs leading-tight text-slate-700">
            <div className="flex items-center gap-1 text-[12px] font-medium text-slate-900">
              <Layers3 className="h-3.5 w-3.5 text-slate-500" />
              <span>{p.category || '—'}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground leading-tight">
              <Building2 className="h-3 w-3 text-slate-400" />
              <span>{p.department || '—'}</span>
            </div>
          </div>
        ),
      },
      {
        key: 'pricing',
        header: 'Base Price',
        cell: (p) => (
          <div className="text-sm text-slate-900 font-medium flex items-center gap-1 whitespace-nowrap leading-tight">
            <Banknote className="h-3.5 w-3.5 text-slate-500" />
            <span>{formatRupee(p.base_price)}</span>
          </div>
        ),
      },
      {
        key: 'flags',
        header: 'Status / Consent',
        cell: (p) => (
          <div className="flex flex-col gap-1 text-xs">
            <ActiveStatusBadge is_active={!!p.is_active} />
            <ConsentBadge requires_consent={!!p.requires_consent} />
          </div>
        ),
      },
      {
        key: 'desc',
        header: 'Description',
        className: 'w-[300px]',
        cell: (p) => (
          <div className="text-xs text-slate-700 leading-snug line-clamp-3">
            {p.description || '—'}
          </div>
        ),
      },
    ];
  }, []);

  // ------------------ mobile card layout ------------------
  const renderMobileCard = useCallback(
    (p: any, actions: any) => {
      return (
        <div className="space-y-3 text-sm">
          {/* Header row: name/code/status */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-semibold text-base leading-tight text-slate-900 flex items-center gap-1">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span>{p.name || '—'}</span>
                </h3>

                <span className="text-[11px] text-slate-500 font-mono bg-slate-100 dark:bg-slate-900/40 rounded px-1 py-[1px]">
                  {p.code || `#${p.id}`}
                </span>
              </div>

              <div className="text-[11px] text-muted-foreground flex flex-wrap items-center gap-2 leading-snug">
                <div className="flex items-center gap-1">
                  <Layers3 className="h-3 w-3 text-slate-400" />
                  <span>{p.category || '—'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-slate-400" />
                  <span>{p.department || '—'}</span>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <ActiveStatusBadge is_active={!!p.is_active} />
                <ConsentBadge requires_consent={!!p.requires_consent} />
              </div>
            </div>

            {/* quick View button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                actions.view && actions.view();
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Price + Desc */}
          <div className="space-y-2">
            <div className="text-sm font-medium leading-snug text-slate-900 flex items-center gap-1">
              <Banknote className="h-4 w-4 text-slate-500" />
              <span>{formatRupee(p.base_price)}</span>
            </div>

            {p.description ? (
              <div className="text-[11px] text-muted-foreground leading-snug line-clamp-3">
                {p.description}
              </div>
            ) : (
              <div className="text-[11px] text-muted-foreground leading-snug">
                No description
              </div>
            )}
          </div>

          {/* Footer row: Edit + Delete shortcuts */}
          <div className="flex items-center justify-between pt-2 border-t text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <ClipboardSignature className="h-3.5 w-3.5 text-slate-400" />
              <span>Procedure #{p.id}</span>
            </span>

            {actions.edit && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.edit && actions.edit();
                }}
              >
                Edit
              </Button>
            )}
          </div>

          {actions.askDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive h-7 text-xs p-0"
              onClick={(e) => {
                e.stopPropagation();
                actions.askDelete && actions.askDelete();
              }}
            >
              Delete
            </Button>
          )}
        </div>
      );
    },
    []
  );

  // ------------------ INITIAL SKELETON ------------------
  if (!hasLoadedOnce && isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        {/* header skeleton */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="h-9 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="border rounded-lg p-4 space-y-2 bg-white animate-pulse"
            >
              <div className="h-4 w-1/2 bg-gray-100 rounded" />
              <div className="h-6 w-1/3 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {/* table skeleton card */}
        <div className="bg-white border rounded-lg p-6">
          <div className="h-5 w-44 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="h-32 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // ------------------ ERROR STATE ------------------
  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Error Loading Procedures</h2>
          <p>{(error as any)?.message || 'Failed to load procedure masters'}</p>
          <Button onClick={handleRefresh} className="mt-4" variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // ------------------ MAIN RENDER ------------------
  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">
            Procedure Masters
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage medical procedures and their pricing
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="min-w-[90px]"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" className="min-w-[90px]">
            <Plus className="mr-2 h-4 w-4" />
            New Procedure
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Procedures</p>
          <p className="text-2xl font-bold">{count}</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">Active</p>
          <p className="text-2xl font-bold text-green-700">
            {procedureMasters.filter((p: any) => p.is_active).length}
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-600">Requires Consent</p>
          <p className="text-2xl font-bold text-orange-700">
            {procedureMasters.filter((p: any) => p.requires_consent).length}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600">Categories</p>
          <p className="text-2xl font-bold text-blue-700">
            {new Set(procedureMasters.map((p: any) => p.category)).size}
          </p>
        </div>
      </div>

      {/* Table card (filters inline + table + pagination) */}
      <div className="bg-white border rounded-lg">
        {/* header + filter bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between p-4 md:p-6 border-b">
          {/* left side summary + page info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold leading-none">
                Procedure List
              </h2>
              <Badge variant="outline" className="text-[11px] font-normal">
                {procedureMasters.length} shown / {count} total
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Page {filters.page || 1}
            </p>
          </div>

          {/* right side filters (search / category / department / status) */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            {/* search */}
            <div className="flex flex-col">
              <Input
                id="search"
                className="h-9 w-[220px] md:w-[200px] lg:w-[220px]"
                placeholder="Search code / name / desc"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            {/* category filter */}
            <div className="flex flex-col">
              <Input
                id="category"
                className="h-9 w-[160px] text-xs"
                placeholder="Category"
                value={filters.category || ''}
                onChange={(e) =>
                  handleFilterChange('category', e.target.value || undefined)
                }
              />
            </div>

            {/* department filter */}
            <div className="flex flex-col">
              <Input
                id="department"
                className="h-9 w-[160px] text-xs"
                placeholder="Department"
                value={filters.department || ''}
                onChange={(e) =>
                  handleFilterChange('department', e.target.value || undefined)
                }
              />
            </div>

            {/* status dropdown (native select styled via Input) */}
            <div className="flex flex-col">
              <select
                id="is_active"
                className="h-9 w-[140px] text-xs appearance-none px-2 py-1 border rounded-md"
                value={
                  filters.is_active === undefined
                    ? 'all'
                    : filters.is_active
                    ? 'active'
                    : 'inactive'
                }
                onChange={(e) =>
                  handleFilterChange(
                    'is_active',
                    e.target.value === 'all'
                      ? undefined
                      : e.target.value === 'active'
                  )
                }
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Apply/refresh button */}
            <div className="flex flex-col">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-[12px] font-normal"
                onClick={handleRefresh}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Apply
              </Button>
            </div>
          </div>
        </div>

        {/* table body */}
        <div className="py-4 md:py-6">
          <DataTable
            rows={procedureMasters}
            isLoading={isLoading && hasLoadedOnce}
            columns={columns}
            getRowId={(p: any) => p.id}
            getRowLabel={(p: any) => p.name || p.code || `Procedure #${p.id}`}
            onView={handleViewProcedure}
            onEdit={handleEditProcedure}
            onDelete={handleDeleteProcedure}
            renderMobileCard={renderMobileCard}
            emptyTitle="No procedures found"
            emptySubtitle="Try adjusting filters or create a new procedure"
          />
        </div>

        {/* pagination footer */}
        {(next || previous) && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t px-4 py-4 md:px-6">
            <Button
              variant="outline"
              disabled={!previous}
              onClick={() =>
                handleFilterChange('page', (filters.page || 1) - 1)
              }
              className="sm:min-w-[100px]"
              size="sm"
            >
              Previous
            </Button>

            <span className="text-sm text-muted-foreground text-center">
              Page {filters.page || 1}
            </span>

            <Button
              variant="outline"
              disabled={!next}
              onClick={() =>
                handleFilterChange('page', (filters.page || 1) + 1)
              }
              className="sm:min-w-[100px]"
              size="sm"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

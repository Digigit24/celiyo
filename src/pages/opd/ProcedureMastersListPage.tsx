// src/pages/opd/ProcedureMastersListPage.tsx
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useProcedureMasters } from '@/hooks/opd/useProcedureMaster.hooks';
import type { ProcedureMasterListParams } from '@/types/opd/procedureMaster.types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCcw,
  Plus,
  FileText,
  CheckCircle2,
  XCircle,
  Banknote,
  Layers3,
  Eye,
} from 'lucide-react';

// DataTable component
import { DataTable, DataTableColumn } from '@/components/DataTable';

// Import the drawer
import ProcedureMasterFormDrawer from '@/components/opd/ProcedureMasterFormDrawer';

// ------------------ helpers ------------------

function formatRupee(value: string | number | undefined | null) {
  if (value === undefined || value === null) return '₹0.00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
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

function CategoryBadge({ category }: { category: string }) {
  const categoryColors: Record<string, string> = {
    laboratory: 'bg-blue-100 text-blue-700 border-blue-200',
    radiology: 'bg-purple-100 text-purple-700 border-purple-200',
    cardiology: 'bg-red-100 text-red-700 border-red-200',
    pathology: 'bg-green-100 text-green-700 border-green-200',
    ultrasound: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    ct_scan: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    mri: 'bg-pink-100 text-pink-700 border-pink-200',
    ecg: 'bg-orange-100 text-orange-700 border-orange-200',
    xray: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    other: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const colorClass = categoryColors[category] || categoryColors.other;
  const displayName = category.replace('_', ' ').toUpperCase();

  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-medium border ${colorClass}`}
    >
      {displayName}
    </Badge>
  );
}

// ------------------ component ------------------

export default function ProcedureMastersListPage() {
  // Drawer state
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view');

  // server filters
  const [filters, setFilters] = useState<ProcedureMasterListParams>({
    page: 1,
    is_active: undefined,
    search: '',
    category: undefined,
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

  // Handle create
  const handleCreate = useCallback(() => {
    setSelectedId(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  }, []);

  // Handle view
  const handleViewProcedure = useCallback((proc: any) => {
    setSelectedId(proc.id);
    setDrawerMode('view');
    setDrawerOpen(true);
  }, []);

  // Handle edit (called from within drawer)
  const handleEditProcedure = useCallback((proc: any) => {
    setSelectedId(proc.id);
    setDrawerMode('edit');
    setDrawerOpen(true);
  }, []);

  // Handle delete (called from within drawer)
  const handleDeleteProcedure = useCallback(async (proc: any) => {
    // This will be handled inside the drawer
    console.log('delete procedure', proc.id);
  }, []);

  // Handle success (after create/update/delete)
  const handleSuccess = useCallback(() => {
    mutate(); // Refresh list
  }, [mutate]);

  // CRITICAL FIX: Move ALL hooks BEFORE any conditional returns
  // This ensures hooks are called in the same order every render
  
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
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 leading-tight mt-0.5">
              <span className="text-xs text-slate-500 font-mono bg-slate-100 dark:bg-slate-900/40 rounded px-1 py-[1px]">
                {p.code || `#${p.id}`}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: 'category',
        header: 'Category',
        cell: (p) => (
          <div className="flex items-center gap-1">
            <Layers3 className="h-3.5 w-3.5 text-slate-500" />
            <CategoryBadge category={p.category} />
          </div>
        ),
      },
      {
        key: 'charge',
        header: 'Default Charge',
        cell: (p) => (
          <div className="text-sm text-slate-900 font-medium flex items-center gap-1 whitespace-nowrap leading-tight">
            <Banknote className="h-3.5 w-3.5 text-slate-500" />
            <span>{formatRupee(p.default_charge)}</span>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (p) => (
          <ActiveStatusBadge is_active={!!p.is_active} />
        ),
      },
      {
        key: 'desc',
        header: 'Description',
        className: 'w-[300px]',
        cell: (p) => (
          <div className="text-xs text-slate-700 leading-snug line-clamp-2">
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
                <CategoryBadge category={p.category} />
              </div>

              <div className="mt-2">
                <ActiveStatusBadge is_active={!!p.is_active} />
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

          {/* Charge + Desc */}
          <div className="space-y-2">
            <div className="text-sm font-medium leading-snug text-slate-900 flex items-center gap-1">
              <Banknote className="h-4 w-4 text-slate-500" />
              <span>{formatRupee(p.default_charge)}</span>
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

          {/* Footer row */}
          <div className="flex items-center justify-between pt-2 border-t text-xs">
            <span className="text-muted-foreground">
              ID: {p.id}
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
        </div>
      );
    },
    []
  );

  // Group procedures by category for summary (moved before conditional returns)
  const categoryGroups = useMemo(() => {
    const groups: Record<string, number> = {};
    procedureMasters.forEach((p: any) => {
      groups[p.category] = (groups[p.category] || 0) + 1;
    });
    return groups;
  }, [procedureMasters]);

  // Calculate average charge (moved before conditional returns)
  const averageCharge = useMemo(() => {
    if (procedureMasters.length === 0) return 0;
    return procedureMasters.reduce((sum: number, p: any) => 
      sum + parseFloat(p.default_charge || '0'), 0) / procedureMasters.length;
  }, [procedureMasters]);

  // Count active procedures (moved before conditional returns)
  const activeCount = useMemo(() => {
    return procedureMasters.filter((p: any) => p.is_active).length;
  }, [procedureMasters]);

  // ------------------ NOW safe to do conditional returns ------------------
  
  // INITIAL SKELETON
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

  // ERROR STATE
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
          <Button size="sm" className="min-w-[90px]" onClick={handleCreate}>
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
          <p className="text-2xl font-bold text-green-700">{activeCount}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600">Categories</p>
          <p className="text-2xl font-bold text-blue-700">
            {Object.keys(categoryGroups).length}
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-600">Avg. Charge</p>
          <p className="text-2xl font-bold text-purple-700">
            {formatRupee(averageCharge)}
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

          {/* right side filters (search / category / status) */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            {/* search */}
            <div className="flex flex-col">
              <Input
                id="search"
                className="h-9 w-[220px] md:w-[200px] lg:w-[220px]"
                placeholder="Search code / name"
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

            {/* status dropdown */}
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

      {/* Form Drawer - Handles view/edit/create */}
      <ProcedureMasterFormDrawer
        itemId={selectedId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={drawerMode}
        onModeChange={setDrawerMode}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
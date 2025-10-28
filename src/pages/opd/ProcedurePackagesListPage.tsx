// src/pages/opd/ProcedurePackagesListPage.tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useProcedurePackages } from '@/hooks/useOPD';
import type { ProcedurePackageListParams } from '@/types/opd.types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCcw,
  Plus,
  Package,
  Percent,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Layers3,
  Info,
  Eye,
} from 'lucide-react';

// shared responsive table component
import { DataTable, DataTableColumn } from '@/components/DataTable';
// Import the new drawer
import PackageFormDrawer from '@/components/opd/PackageFormDrawer';

// ---------- helpers ----------

function formatRupee(val: string | number | undefined | null) {
  if (val === undefined || val === null) return '₹0.00';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '₹0.00';
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge
      variant="secondary"
      className="bg-green-100 text-green-700 border border-green-200 flex items-center gap-1 text-[10px] font-medium"
    >
      <CheckCircle2 className="h-3 w-3" />
      Active
    </Badge>
  ) : (
    <Badge
      variant="secondary"
      className="bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-1 text-[10px] font-medium"
    >
      <XCircle className="h-3 w-3" />
      Inactive
    </Badge>
  );
}

// ---------- page ----------

export default function ProcedurePackagesListPage() {
  // server filters
  const [filters, setFilters] = useState<ProcedurePackageListParams>({
    page: 1,
    is_active: undefined,
    search: '',
    ordering: undefined,
  });

  // debounced search text
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
    procedurePackages,
    count,
    next,
    previous,
    isLoading,
    error,
    mutate,
  } = useProcedurePackages(filters);

  // remember first-successful-load so we can show skeleton once
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  useEffect(() => {
    if (!isLoading && !error) {
      setHasLoadedOnce(true);
    }
  }, [isLoading, error]);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);

  // derived summary metrics
  const activeCount = useMemo(
    () => procedurePackages.filter((p: any) => p.is_active).length,
    [procedurePackages]
  );

  const avgDiscount = useMemo(() => {
    if (!procedurePackages.length) return 0;
    const total = procedurePackages.reduce((sum: number, p: any) => {
      const d = parseFloat(p.discount_percent);
      return sum + (isNaN(d) ? 0 : d);
    }, 0);
    return total / procedurePackages.length;
  }, [procedurePackages]);

  // filters / pagination
  const handleFilterChange = (
    key: keyof ProcedurePackageListParams,
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

  const handlePrevPage = () => {
    setFilters((prev) => ({
      ...prev,
      page: (prev.page || 1) - 1,
    }));
  };

  const handleNextPage = () => {
    setFilters((prev) => ({
      ...prev,
      page: (prev.page || 1) + 1,
    }));
  };

  // Drawer handlers
  const handleCreatePackage = () => {
    setDrawerMode('create');
    setSelectedPackageId(null);
    setDrawerOpen(true);
  };

  const handleViewPackage = useCallback((pkg: any) => {
    setDrawerMode('view');
    setSelectedPackageId(pkg.id);
    setDrawerOpen(true);
  }, []);

  const handleEditPackage = useCallback((pkg: any) => {
    setDrawerMode('edit');
    setSelectedPackageId(pkg.id);
    setDrawerOpen(true);
  }, []);

  const handleDeletePackage = useCallback(async (pkg: any) => {
    if (!confirm(`Are you sure you want to delete "${pkg.package_name}"?`)) {
      return;
    }
    try {
      const response = await fetch(`/api/opd/procedure-packages/${pkg.id}/`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete package');
      mutate(); // Refresh the list
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete package. Please try again.');
    }
  }, [mutate]);

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedPackageId(null);
  };

  const handleDrawerSuccess = () => {
    mutate(); // Refresh the list after successful create/edit
  };

  // ---------- table columns (desktop) ----------

  const columns = useMemo<DataTableColumn<any>[]>(() => {
    return [
      {
        key: 'package',
        header: 'Package',
        cell: (p) => (
          <div className="leading-tight">
            <div className="font-medium text-slate-900 flex items-center gap-1 text-[13px]">
              <Package className="h-3.5 w-3.5 text-slate-500" />
              <span>{p.package_name || '—'}</span>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 leading-tight">
              <span className="text-xs text-slate-500 font-mono bg-slate-100 dark:bg-slate-900/40 rounded px-1 py-[1px]">
                {p.package_code || `#${p.id}`}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: 'pricing',
        header: 'Price / Discount',
        cell: (p) => (
          <div className="text-sm leading-tight text-slate-900 font-medium space-y-1">
            <div className="flex items-center gap-1 whitespace-nowrap">
              <IndianRupee className="h-3.5 w-3.5 text-slate-500" />
              <span>{formatRupee(p.package_price)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap leading-tight">
              <Percent className="h-3 w-3 text-slate-400" />
              <span>{p.discount_percent ? `${p.discount_percent}% off` : '—'}</span>
            </div>
          </div>
        ),
      },
      {
        key: 'count',
        header: 'Items',
        cell: (p) => (
          <div className="text-xs text-slate-700 leading-tight flex items-center gap-1">
            <Layers3 className="h-3.5 w-3.5 text-slate-500" />
            <span>
              {p.total_procedures ?? p.procedures_count ?? p.items_count ?? '—'}{' '}
              procedures
            </span>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (p) => <ActiveBadge active={!!p.is_active} />,
      },
      {
        key: 'desc',
        header: 'Description',
        className: 'w-[300px]',
        cell: (p) => (
          <div className="text-xs text-slate-700 leading-snug line-clamp-3 flex items-start gap-1">
            <Info className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-[2px]" />
            <span>{p.description || '—'}</span>
          </div>
        ),
      },
    ];
  }, []);

  // ---------- mobile card renderer ----------

  const renderMobileCard = useCallback(
    (p: any, actions: any) => {
      return (
        <div className="space-y-3 text-sm">
          {/* Header row */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-semibold text-base leading-tight text-slate-900 flex items-center gap-1">
                  <Package className="h-4 w-4 text-slate-500" />
                  {p.package_name || '—'}
                </h3>
                <ActiveBadge active={!!p.is_active} />
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                {p.package_code || `#${p.id}`}
              </p>
            </div>
          </div>

          {/* Price / Discount */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-900">
              <IndianRupee className="h-4 w-4 text-slate-500" />
              <span>{formatRupee(p.package_price)}</span>
            </div>
            {p.discount_percent && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Percent className="h-3 w-3" />
                <span>{p.discount_percent}% discount</span>
              </div>
            )}
          </div>

          {/* Items count */}
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <Layers3 className="h-3.5 w-3.5 text-slate-500" />
            <span>
              {p.total_procedures ?? p.procedures_count ?? p.items_count ?? 0}{' '}
              procedures included
            </span>
          </div>

          {/* Description */}
          {p.description && (
            <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
              {p.description}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {actions}
          </div>
        </div>
      );
    },
    []
  );

  // ---------- loading state (initial) ----------

  if (isLoading && !hasLoadedOnce) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        {/* header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-80 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-9 w-36 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border rounded-lg p-4 space-y-2 bg-white animate-pulse"
            >
              <div className="h-4 w-1/2 bg-gray-100 rounded" />
              <div className="h-6 w-1/3 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {/* table skeleton */}
        <div className="bg-white border rounded-lg p-6">
          <div className="h-5 w-44 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="h-32 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // ---------- error state ----------

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Error Loading Packages</h2>
          <p>{(error as any)?.message || 'Failed to load procedure packages'}</p>
          <Button onClick={handleRefresh} className="mt-4" variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // ---------- main ----------

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">
            Procedure Packages
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage bundled procedure packages with discounted pricing
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
          <Button 
            size="sm" 
            className="min-w-[90px]"
            onClick={handleCreatePackage}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Package
          </Button>
        </div>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Packages</p>
          <p className="text-2xl font-bold">{count}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">Active Packages</p>
          <p className="text-2xl font-bold text-green-700">{activeCount}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600">Avg. Discount</p>
          <p className="text-2xl font-bold text-blue-700">
            {avgDiscount.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* table card */}
      <div className="bg-white border rounded-lg">
        {/* header / filters row */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between p-4 md:p-6 border-b">
          {/* Left summary block */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold leading-none">
                Package List
              </h2>
              <Badge variant="outline" className="text-[11px] font-normal">
                {procedurePackages.length} shown / {count} total
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Page {filters.page || 1}
            </p>
          </div>

          {/* Right filters block */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            {/* search text */}
            <div className="flex flex-col">
              <Input
                id="search"
                className="h-9 w-[220px] md:w-[200px] lg:w-[220px]"
                placeholder="Search name / code"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            {/* status dropdown as native select via Input */}
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

            {/* ordering select as native <select> */}
            <div className="flex flex-col">
              <select
                id="ordering"
                className="h-9 w-[160px] text-xs appearance-none px-2 py-1 border rounded-md"
                value={filters.ordering || 'default'}
                onChange={(e) =>
                  handleFilterChange(
                    'ordering',
                    e.target.value === 'default'
                      ? undefined
                      : e.target.value
                  )
                }
              >
                <option value="default">Sort: Default</option>
                <option value="package_name">Name (A-Z)</option>
                <option value="-package_name">Name (Z-A)</option>
                <option value="package_price">Price (Low-High)</option>
                <option value="-package_price">Price (High-Low)</option>
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
              </select>
            </div>

            {/* apply/refresh button */}
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
            rows={procedurePackages}
            isLoading={isLoading && hasLoadedOnce}
            columns={columns}
            getRowId={(p: any) => p.id}
            getRowLabel={(p: any) =>
              p.package_name || p.package_code || `Package #${p.id}`
            }
            onView={handleViewPackage}
            onEdit={handleEditPackage}
            onDelete={handleDeletePackage}
            renderMobileCard={renderMobileCard}
            emptyTitle="No packages found"
            emptySubtitle="Try adjusting filters or create a new package"
          />
        </div>

        {/* pagination footer */}
        {(next || previous) && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t px-4 py-4 md:px-6">
            <Button
              variant="outline"
              disabled={!previous}
              onClick={handlePrevPage}
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
              onClick={handleNextPage}
              className="sm:min-w-[100px]"
              size="sm"
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Package Form Drawer */}
      <PackageFormDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        packageId={selectedPackageId}
        mode={drawerMode}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  );
}
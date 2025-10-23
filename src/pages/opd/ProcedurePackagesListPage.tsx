// src/pages/opd/ProcedurePackagesListPage.tsx
import { useState } from 'react';
import { useProcedurePackages } from '@/hooks/useOPD';
import type { ProcedurePackageListParams } from '@/types/opd.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCcw, Plus } from 'lucide-react';

export default function ProcedurePackagesListPage() {
  const [filters, setFilters] = useState<ProcedurePackageListParams>({
    page: 1,
    is_active: undefined,
    search: '',
  });

  const { procedurePackages, count, next, previous, isLoading, error, mutate } =
    useProcedurePackages(filters);

  const handleFilterChange = (key: keyof ProcedurePackageListParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
      page: 1,
    }));
  };

  const handleRefresh = () => {
    mutate();
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Error Loading Packages</h2>
          <p>{error?.message || 'Failed to load procedure packages'}</p>
          <Button onClick={handleRefresh} className="mt-4" variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Procedure Packages</h1>
          <p className="text-muted-foreground mt-1">
            Manage bundled procedure packages with discounted pricing
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Package
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Packages</p>
          <p className="text-2xl font-bold">{count}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">Active Packages</p>
          <p className="text-2xl font-bold text-green-700">
            {procedurePackages.filter((p) => p.is_active).length}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600">Avg. Discount</p>
          <p className="text-2xl font-bold text-blue-700">
            {procedurePackages.length > 0
              ? (
                  procedurePackages.reduce(
                    (sum, p) => sum + parseFloat(p.discount_percent),
                    0
                  ) / procedurePackages.length
                ).toFixed(1)
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Package code, name..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Active Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="is_active">Status</Label>
            <Select
              value={
                filters.is_active === undefined
                  ? 'all'
                  : filters.is_active
                  ? 'active'
                  : 'inactive'
              }
              onValueChange={(value) =>
                handleFilterChange(
                  'is_active',
                  value === 'all' ? undefined : value === 'active'
                )
              }
            >
              <SelectTrigger id="is_active">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ordering */}
          <div className="space-y-2">
            <Label htmlFor="ordering">Sort By</Label>
            <Select
              value={filters.ordering || 'default'}
              onValueChange={(value) =>
                handleFilterChange('ordering', value === 'default' ? undefined : value)
              }
            >
              <SelectTrigger id="ordering">
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="package_name">Name (A-Z)</SelectItem>
                <SelectItem value="-package_name">Name (Z-A)</SelectItem>
                <SelectItem value="package_price">Price (Low-High)</SelectItem>
                <SelectItem value="-package_price">Price (High-Low)</SelectItem>
                <SelectItem value="-created_at">Newest First</SelectItem>
                <SelectItem value="created_at">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <strong>Total Packages:</strong> {count} | <strong>Current Page:</strong>{' '}
          {filters.page || 1}
        </div>
      </div>

      {/* Packages List - Raw JSON */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          Procedure Packages (Raw API Response)
        </h2>
        <div className="bg-gray-50 p-4 rounded overflow-auto max-h-[600px]">
          <pre className="text-xs">
            {JSON.stringify(
              {
                count,
                next,
                previous,
                results: procedurePackages,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>

      {/* Pagination */}
      {(next || previous) && (
        <div className="flex items-center justify-between bg-white border rounded-lg p-4">
          <Button
            variant="outline"
            disabled={!previous}
            onClick={() => handleFilterChange('page', (filters.page || 1) - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {filters.page || 1}
          </span>
          <Button
            variant="outline"
            disabled={!next}
            onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
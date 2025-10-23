// src/pages/opd/ProcedureMastersListPage.tsx
import { useState } from 'react';
import { useProcedureMasters } from '@/hooks/useOPD';
import type { ProcedureMasterListParams } from '@/types/opd.types';
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

export default function ProcedureMastersListPage() {
  const [filters, setFilters] = useState<ProcedureMasterListParams>({
    page: 1,
    is_active: undefined,
    search: '',
  });

  const { procedureMasters, count, next, previous, isLoading, error, mutate } =
    useProcedureMasters(filters);

  const handleFilterChange = (key: keyof ProcedureMasterListParams, value: any) => {
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
          <h2 className="font-semibold mb-2">Error Loading Procedures</h2>
          <p>{error?.message || 'Failed to load procedure masters'}</p>
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
          <h1 className="text-3xl font-bold">Procedure Masters</h1>
          <p className="text-muted-foreground mt-1">
            Manage medical procedures and their pricing
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Procedure
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Procedures</p>
          <p className="text-2xl font-bold">{count}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">Active</p>
          <p className="text-2xl font-bold text-green-700">
            {procedureMasters.filter((p) => p.is_active).length}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-600">Requires Consent</p>
          <p className="text-2xl font-bold text-orange-700">
            {procedureMasters.filter((p) => p.requires_consent).length}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600">Categories</p>
          <p className="text-2xl font-bold text-blue-700">
            {new Set(procedureMasters.map((p) => p.category)).size}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Code, name, description..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="Filter by category..."
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            />
          </div>

          {/* Department Filter */}
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              placeholder="Filter by department..."
              value={filters.department || ''}
              onChange={(e) => handleFilterChange('department', e.target.value)}
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
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <strong>Total Procedures:</strong> {count} | <strong>Current Page:</strong>{' '}
          {filters.page || 1}
        </div>
      </div>

      {/* Procedures List - Raw JSON */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          Procedure Masters (Raw API Response)
        </h2>
        <div className="bg-gray-50 p-4 rounded overflow-auto max-h-[600px]">
          <pre className="text-xs">
            {JSON.stringify(
              {
                count,
                next,
                previous,
                results: procedureMasters,
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
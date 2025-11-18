// src/pages/tenants/TenantsListPage.tsx

import { useState } from 'react';
import { useTenants } from '@/hooks/useTenants';
import type { TenantListParams } from '@/types/tenant.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TenantsListPage() {
  const [filters, setFilters] = useState<TenantListParams>({
    status: undefined,
    search: '',
    page: 1,
    page_size: 20,
  });

  const { tenants, count, loading, error, updateFilters } = useTenants(filters);

  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, search: value, page: 1 };
    setFilters(newFilters);
    updateFilters(newFilters);
  };

  const handleStatusChange = (value: string) => {
    const newFilters = {
      ...filters,
      status: value === 'all' ? undefined : (value as any),
      page: 1,
    };
    setFilters(newFilters);
    updateFilters(newFilters);
  };

  const handleActiveChange = (value: string) => {
    const newFilters = {
      ...filters,
      is_active: value === 'all' ? undefined : value === 'true',
      page: 1,
    };
    setFilters(newFilters);
    updateFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    updateFilters(newFilters);
  };

  if (loading && tenants.length === 0) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading tenants...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Error loading tenants</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tenant Management</h1>
        <p className="text-gray-600">
          Manage all hospital and clinic tenants in the system
        </p>
      </div>

      {/* Filter Controls */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <Input
              type="text"
              placeholder="Search tenants..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select
              value={filters.status || 'all'}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Active Flag
            </label>
            <Select
              value={
                filters.is_active === undefined
                  ? 'all'
                  : filters.is_active
                  ? 'true'
                  : 'false'
              }
              onValueChange={handleActiveChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active Only</SelectItem>
                <SelectItem value="false">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Page Size */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Items per page
            </label>
            <Select
              value={String(filters.page_size || 20)}
              onValueChange={(value) => {
                const newFilters = {
                  ...filters,
                  page_size: Number(value),
                  page: 1,
                };
                setFilters(newFilters);
                updateFilters(newFilters);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Total Tenants: <strong>{count}</strong>
            </span>
            <span className="text-gray-600">
              Showing: <strong>{tenants.length}</strong> results
            </span>
          </div>
        </div>
      </div>

      {/* Raw API Response Display */}
      <div className="border rounded-lg p-6 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Raw API Response</h2>
          {loading && (
            <span className="text-sm text-blue-600 animate-pulse">
              Refreshing...
            </span>
          )}
        </div>
        <pre className="bg-white p-4 rounded border overflow-auto max-h-[600px] text-xs font-mono">
          {JSON.stringify(
            {
              count,
              results: tenants,
              filters: filters,
            },
            null,
            2
          )}
        </pre>
      </div>

      {/* Pagination Controls */}
      {count > (filters.page_size || 20) && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange((filters.page || 1) - 1)}
            disabled={!filters.page || filters.page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 px-4">
            Page {filters.page || 1} of{' '}
            {Math.ceil(count / (filters.page_size || 20))}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange((filters.page || 1) + 1)}
            disabled={
              (filters.page || 1) >= Math.ceil(count / (filters.page_size || 20))
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
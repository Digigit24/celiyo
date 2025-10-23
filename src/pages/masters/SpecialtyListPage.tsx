// ==================== SPECIALTIES LIST PAGE ====================
// Full filters implementation matching DoctorsListPage pattern

import { useState } from 'react';
import { useSpecialties } from '@/hooks/useDoctors';
import type { SpecialtyListParams } from '@/types/specialty.types';

export default function SpecialtiesListPage() {
  const [filters, setFilters] = useState<SpecialtyListParams>({
    search: '',
    is_active: undefined,
    department: '',
    ordering: '',
  });

  const { specialties, count, next, previous, isLoading, error, mutate } = useSpecialties(filters);

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Loading Specialties...</h1>
        <div className="text-gray-600">Fetching data from API...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">
          Error Loading Specialties
        </h1>
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          <p className="font-semibold">Error Message:</p>
          <p>{error.message || 'Failed to load specialties'}</p>
        </div>
        <button
          onClick={() => mutate()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Medical Specialties</h1>

        {/* Filter Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4 flex-wrap">
            {/* Search Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by name, code, description..."
                className="border px-4 py-2 rounded w-64"
                value={filters.search || ''}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <input
                type="text"
                placeholder="Filter by department"
                className="border px-4 py-2 rounded w-48"
                value={filters.department || ''}
                onChange={(e) =>
                  setFilters({ ...filters, department: e.target.value })
                }
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="border px-4 py-2 rounded"
                value={
                  filters.is_active === undefined
                    ? ''
                    : filters.is_active.toString()
                }
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    is_active:
                      e.target.value === ''
                        ? undefined
                        : e.target.value === 'true',
                  })
                }
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {/* Sort By Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <select
                className="border px-4 py-2 rounded"
                value={filters.ordering || ''}
                onChange={(e) =>
                  setFilters({ ...filters, ordering: e.target.value })
                }
              >
                <option value="">Default</option>
                <option value="name">Name (A-Z)</option>
                <option value="-name">Name (Z-A)</option>
                <option value="code">Code (A-Z)</option>
                <option value="-code">Code (Z-A)</option>
                <option value="created_at">Oldest First</option>
                <option value="-created_at">Newest First</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() =>
                setFilters({
                  search: '',
                  is_active: undefined,
                  department: '',
                  ordering: '',
                })
              }
            >
              Clear Filters
            </button>
            <button
              onClick={() => mutate()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="mb-4 p-4 bg-blue-50 rounded">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-semibold">Total Count:</span> {count}
            </div>
            <div>
              <span className="font-semibold">Current Page:</span>{' '}
              {specialties.length} items
            </div>
            <div>
              <span className="font-semibold">Has Next:</span>{' '}
              {next ? 'Yes' : 'No'}
            </div>
            <div>
              <span className="font-semibold">Has Previous:</span>{' '}
              {previous ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      </div>

      {/* Raw JSON Display */}
      <div className="border rounded-lg p-6 bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">
          Raw API Response (JSON):
        </h2>
        <pre className="bg-white p-4 rounded overflow-auto max-h-[600px] text-xs font-mono">
          {JSON.stringify(
            {
              count,
              next,
              previous,
              results: specialties,
            },
            null,
            2
          )}
        </pre>
      </div>

      {/* Empty State */}
      {specialties.length === 0 && (
        <div className="mt-6 p-8 bg-yellow-50 rounded text-center">
          <p className="text-gray-600">
            No specialties found with current filters.
          </p>
        </div>
      )}
    </div>
  );
}
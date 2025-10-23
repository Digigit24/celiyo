// ==================== SPECIALTIES LIST PAGE ====================
// Basic page showing raw JSON response - NO UI styling yet

import { useState, useEffect } from 'react';
import { useSpecialties } from '@/hooks/usespecialties';
import type { SpecialtyListParams } from '@/types/specialty.types';

export default function SpecialtiesListPage() {
  const [filters, setFilters] = useState<SpecialtyListParams>({
    page: 1,
    search: '',
    department: '',
    is_active: undefined,
    ordering: '',
  });

  const { 
    specialties, 
    count, 
    next, 
    previous, 
    loading, 
    error, 
    fetchSpecialties 
  } = useSpecialties();

  useEffect(() => {
    fetchSpecialties(filters);
  }, [filters]);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Loading Specialties...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error Loading Specialties</h1>
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Specialties List</h1>
        
        {/* ==================== FILTER CONTROLS ==================== */}
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
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
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
                onChange={(e) => setFilters({ ...filters, department: e.target.value, page: 1 })}
              />
            </div>
            
            {/* Active Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="border px-4 py-2 rounded"
                value={filters.is_active === undefined ? '' : filters.is_active.toString()}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  is_active: e.target.value === '' ? undefined : e.target.value === 'true',
                  page: 1 
                })}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {/* Ordering Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <select
                className="border px-4 py-2 rounded"
                value={filters.ordering || ''}
                onChange={(e) => setFilters({ ...filters, ordering: e.target.value, page: 1 })}
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

          {/* Clear Filters Button */}
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => setFilters({ page: 1, search: '', department: '', is_active: undefined, ordering: '' })}
          >
            Clear Filters
          </button>
        </div>

        {/* ==================== METADATA ==================== */}
        <div className="mb-4 p-4 bg-blue-50 rounded">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Total Count:</span> {count}
            </div>
            <div>
              <span className="font-semibold">Current Page Items:</span> {specialties.length}
            </div>
            <div>
              <span className="font-semibold">Has Next Page:</span> {next ? 'Yes' : 'No'}
            </div>
            <div>
              <span className="font-semibold">Has Previous Page:</span> {previous ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {/* ==================== PAGINATION ==================== */}
        <div className="flex gap-2 mb-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!previous}
            onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
          >
            Previous Page
          </button>
          <span className="px-4 py-2 bg-gray-100 rounded">
            Page {filters.page || 1}
          </span>
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!next}
            onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
          >
            Next Page
          </button>
        </div>
      </div>

      {/* ==================== RAW API RESPONSE ==================== */}
      <div className="border rounded-lg p-6 bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">Raw API Response (JSON):</h2>
        <pre className="bg-white p-4 rounded overflow-auto max-h-[600px] text-xs font-mono">
          {JSON.stringify(
            { 
              count, 
              next, 
              previous, 
              results: specialties 
            }, 
            null, 
            2
          )}
        </pre>
      </div>

      {/* ==================== EMPTY STATE ==================== */}
      {specialties.length === 0 && (
        <div className="mt-6 p-8 bg-yellow-50 rounded text-center">
          <p className="text-gray-600">No specialties found with current filters.</p>
        </div>
      )}
    </div>
  );
}
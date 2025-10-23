import { useState } from 'react';
import { useDoctors } from '@/hooks/useDoctors';
import type { DoctorListParams } from '@/types/doctor.types';

export default function DoctorsListPage() {
  const [filters, setFilters] = useState<DoctorListParams>({
    status: 'active',
    search: '',
  });

  const { doctors, count, isLoading, error } = useDoctors(filters);

  if (isLoading) {
    return <div className="p-8">Loading doctors...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 text-red-700 p-4 rounded">
          Error loading doctors: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Doctors List</h1>
        
        {/* Filter Controls */}
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search doctors..."
            className="border px-4 py-2 rounded"
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          
          <select
            className="border px-4 py-2 rounded"
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          Total Doctors: {count}
        </div>
      </div>

      {/* Raw API Response Display */}
      <div className="border rounded-lg p-6 bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">Raw API Response:</h2>
        <pre className="bg-white p-4 rounded overflow-auto max-h-[600px] text-xs">
          {JSON.stringify({ count, results: doctors }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
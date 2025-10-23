import { useState, useEffect } from 'react';
import { useAppointments } from '@/hooks/useAppointments';
import type { AppointmentListParams, AppointmentStatus, AppointmentPriority } from '@/types/appointment.types';

export default function AppointmentsListPage() {
  const [filters, setFilters] = useState<AppointmentListParams>({
    page: 1,
    page_size: 20,
  });

  const { 
    appointments, 
    count, 
    next, 
    previous, 
    loading, 
    error, 
    fetchAppointments 
  } = useAppointments();

  useEffect(() => {
    fetchAppointments(filters);
  }, [filters, fetchAppointments]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading appointments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 text-red-700 p-4 rounded border border-red-300">
          <h2 className="font-semibold mb-2">Error Loading Appointments</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Appointments List</h1>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search complaint, symptoms..."
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search || ''}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value, page: 1 })
              }
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: e.target.value as AppointmentStatus,
                  page: 1,
                })
              }
            >
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.priority || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  priority: e.target.value as AppointmentPriority,
                  page: 1,
                })
              }
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium mb-1">Date From</label>
            <input
              type="date"
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.date_from || ''}
              onChange={(e) =>
                setFilters({ ...filters, date_from: e.target.value, page: 1 })
              }
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium mb-1">Date To</label>
            <input
              type="date"
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.date_to || ''}
              onChange={(e) =>
                setFilters({ ...filters, date_to: e.target.value, page: 1 })
              }
            />
          </div>

          {/* Doctor ID */}
          <div>
            <label className="block text-sm font-medium mb-1">Doctor ID</label>
            <input
              type="number"
              placeholder="Filter by doctor ID"
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.doctor_id || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  doctor_id: e.target.value ? Number(e.target.value) : undefined,
                  page: 1,
                })
              }
            />
          </div>

          {/* Patient ID */}
          <div>
            <label className="block text-sm font-medium mb-1">Patient ID</label>
            <input
              type="number"
              placeholder="Filter by patient ID"
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.patient_id || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  patient_id: e.target.value ? Number(e.target.value) : undefined,
                  page: 1,
                })
              }
            />
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div>
            Total Appointments: <span className="font-semibold">{count}</span>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!previous}
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
            >
              Previous
            </button>
            <span className="px-3 py-1">Page {filters.page || 1}</span>
            <button
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!next}
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Raw API Response Display */}
      <div className="border rounded-lg p-6 bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">Raw API Response:</h2>
        <pre className="bg-white p-4 rounded overflow-auto max-h-[600px] text-xs border border-gray-200">
          {JSON.stringify(
            {
              count,
              next,
              previous,
              results: appointments,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
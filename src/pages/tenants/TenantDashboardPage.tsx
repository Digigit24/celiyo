// src/pages/tenants/TenantDashboardPage.tsx

import { useDashboardStats } from '@/hooks/useTenants';

export default function TenantDashboardPage() {
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Error loading dashboard</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tenant Dashboard</h1>
        <p className="text-gray-600">Overview of all tenants in the system</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-2">Total Tenants</div>
          <div className="text-3xl font-bold text-blue-600">
            {stats?.total_tenants || 0}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-2">Active Tenants</div>
          <div className="text-3xl font-bold text-green-600">
            {stats?.active_tenants || 0}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-2">Pending Tenants</div>
          <div className="text-3xl font-bold text-yellow-600">
            {stats?.pending_tenants || 0}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-2">Inactive Tenants</div>
          <div className="text-3xl font-bold text-red-600">
            {stats?.inactive_tenants || 0}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-2">Total Users</div>
          <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-2">Total Patients</div>
          <div className="text-2xl font-bold">
            {stats?.total_patients || 0}
          </div>
        </div>
      </div>

      {/* Raw API Response */}
      <div className="border rounded-lg p-6 bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">Raw Dashboard Data</h2>
        <pre className="bg-white p-4 rounded border overflow-auto max-h-[600px] text-xs font-mono">
          {JSON.stringify(stats, null, 2)}
        </pre>
      </div>
    </div>
  );
}
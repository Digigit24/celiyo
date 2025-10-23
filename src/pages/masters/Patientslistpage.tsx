// ==================== PATIENTS LIST PAGE ====================
// Main page for displaying patient list with filters
// Step 1: Raw JSON display to verify API integration

import { useState } from 'react';
import { usePatients } from '@/hooks/usePatients';
import type { PatientListParams, PatientGender, PatientStatus, BloodGroup } from '@/types/patient.types';

export default function PatientsListPage() {
  // ==================== STATE MANAGEMENT ====================
  const [filters, setFilters] = useState<PatientListParams>({
    status: 'active',
    search: '',
    page: 1,
  });

  // ==================== DATA FETCHING ====================
  const { patients, count, isLoading, error, next, previous } = usePatients(filters);

  // ==================== FILTER HANDLERS ====================
  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value, page: 1 });
  };

  const handleStatusChange = (value: string) => {
    setFilters({
      ...filters,
      status: value ? (value as PatientStatus) : undefined,
      page: 1,
    });
  };

  const handleGenderChange = (value: string) => {
    setFilters({
      ...filters,
      gender: value ? (value as PatientGender) : undefined,
      page: 1,
    });
  };

  const handleBloodGroupChange = (value: string) => {
    setFilters({
      ...filters,
      blood_group: value ? (value as BloodGroup) : undefined,
      page: 1,
    });
  };

  const handleInsuranceChange = (value: string) => {
    setFilters({
      ...filters,
      has_insurance: value === '' ? undefined : value === 'true',
      page: 1,
    });
  };

  const handleCityChange = (value: string) => {
    setFilters({ ...filters, city: value || undefined, page: 1 });
  };

  const handleStateChange = (value: string) => {
    setFilters({ ...filters, state: value || undefined, page: 1 });
  };

  const handleAgeMinChange = (value: string) => {
    const numValue = parseInt(value);
    setFilters({
      ...filters,
      age_min: value ? numValue : undefined,
      page: 1,
    });
  };

  const handleAgeMaxChange = (value: string) => {
    const numValue = parseInt(value);
    setFilters({
      ...filters,
      age_max: value ? numValue : undefined,
      page: 1,
    });
  };

  const handleDateFromChange = (value: string) => {
    setFilters({ ...filters, date_from: value || undefined, page: 1 });
  };

  const handleDateToChange = (value: string) => {
    setFilters({ ...filters, date_to: value || undefined, page: 1 });
  };

  const handleOrderingChange = (value: string) => {
    setFilters({ ...filters, ordering: value || undefined, page: 1 });
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'active',
      search: '',
      page: 1,
    });
  };

  // ==================== LOADING STATE ====================
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading patients...</p>
          </div>
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Patients</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message || 'Failed to fetch patient data'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="p-8">
      {/* ==================== HEADER ==================== */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Patients</h1>
        <p className="text-gray-600">
          Total Patients: <span className="font-semibold">{count}</span>
        </p>
      </div>

      {/* ==================== FILTERS SECTION ==================== */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={handleResetFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Reset Filters
          </button>
        </div>

        {/* Row 1: Search, Status, Gender */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, patient ID, or phone..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status || ''}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deceased">Deceased</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.gender || ''}
              onChange={(e) => handleGenderChange(e.target.value)}
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Row 2: Blood Group, Insurance, City */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Group
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.blood_group || ''}
              onChange={(e) => handleBloodGroupChange(e.target.value)}
            >
              <option value="">All Blood Groups</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Insurance Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={
                filters.has_insurance === undefined
                  ? ''
                  : filters.has_insurance
                  ? 'true'
                  : 'false'
              }
              onChange={(e) => handleInsuranceChange(e.target.value)}
            >
              <option value="">All</option>
              <option value="true">Has Insurance</option>
              <option value="false">No Insurance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              placeholder="Filter by city..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.city || ''}
              onChange={(e) => handleCityChange(e.target.value)}
            />
          </div>
        </div>

        {/* Row 3: State, Age Range */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              placeholder="Filter by state..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.state || ''}
              onChange={(e) => handleStateChange(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age Min
            </label>
            <input
              type="number"
              placeholder="Min age..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.age_min || ''}
              onChange={(e) => handleAgeMinChange(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age Max
            </label>
            <input
              type="number"
              placeholder="Max age..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.age_max || ''}
              onChange={(e) => handleAgeMaxChange(e.target.value)}
            />
          </div>
        </div>

        {/* Row 4: Date Range, Ordering */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Date From
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.date_from || ''}
              onChange={(e) => handleDateFromChange(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Date To
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.date_to || ''}
              onChange={(e) => handleDateToChange(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.ordering || ''}
              onChange={(e) => handleOrderingChange(e.target.value)}
            >
              <option value="">Default</option>
              <option value="-registration_date">Newest First</option>
              <option value="registration_date">Oldest First</option>
              <option value="last_name">Name (A-Z)</option>
              <option value="-last_name">Name (Z-A)</option>
              <option value="age">Age (Low to High)</option>
              <option value="-age">Age (High to Low)</option>
              <option value="-last_visit_date">Recent Visit</option>
            </select>
          </div>
        </div>
      </div>

      {/* ==================== ACTIVE FILTERS DISPLAY ==================== */}
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.search && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Search: {filters.search}
          </span>
        )}
        {filters.status && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Status: {filters.status}
          </span>
        )}
        {filters.gender && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Gender: {filters.gender}
          </span>
        )}
        {filters.blood_group && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Blood Group: {filters.blood_group}
          </span>
        )}
        {filters.has_insurance !== undefined && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Insurance: {filters.has_insurance ? 'Yes' : 'No'}
          </span>
        )}
      </div>

      {/* ==================== PAGINATION INFO ==================== */}
      <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {patients.length} of {count} patients
        </div>
        <div className="flex gap-2">
          {previous && (
            <span className="text-blue-600">← Previous available</span>
          )}
          {next && <span className="text-blue-600">Next available →</span>}
        </div>
      </div>

      {/* ==================== RAW JSON DISPLAY ==================== */}
      <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Raw API Response (Step 1 - Verify Data)
          </h2>
          <div className="text-sm text-gray-500">
            Count: {count} | Results: {patients.length}
          </div>
        </div>

        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          <pre className="p-4 overflow-auto max-h-[600px] text-xs font-mono">
            {JSON.stringify(
              {
                count,
                next,
                previous,
                results: patients,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>

      {/* ==================== EMPTY STATE ==================== */}
      {patients.length === 0 && (
        <div className="mt-6 text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters or search criteria
          </p>
        </div>
      )}
    </div>
  );
}
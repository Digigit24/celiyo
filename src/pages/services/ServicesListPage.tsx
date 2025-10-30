// src/pages/services/ServicesListPage.tsx
import { useEffect, useState } from 'react';
import {
  useServiceCategories,
  useDiagnosticTests,
  useNursingCarePackages,
  useHomeHealthcareServices,
} from '@/hooks/useServices';

export default function ServicesListPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'diagnostic' | 'nursing' | 'homecare'>('categories');

  // Fetch all services
  const {
    categories,
    count: categoriesCount,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useServiceCategories({ page_size: 100 });

  const {
    diagnosticTests,
    count: diagnosticCount,
    isLoading: diagnosticLoading,
    error: diagnosticError,
  } = useDiagnosticTests({ page_size: 100 });

  const {
    nursingPackages,
    count: nursingCount,
    isLoading: nursingLoading,
    error: nursingError,
  } = useNursingCarePackages({ page_size: 100 });

  const {
    homeHealthcareServices,
    count: homecareCount,
    isLoading: homecareLoading,
    error: homecareError,
  } = useHomeHealthcareServices({ page_size: 100 });

  // Tab data
  const tabs = [
    {
      key: 'categories' as const,
      label: 'Service Categories',
      count: categoriesCount,
      loading: categoriesLoading,
      error: categoriesError,
      data: categories,
    },
    {
      key: 'diagnostic' as const,
      label: 'Diagnostic Tests',
      count: diagnosticCount,
      loading: diagnosticLoading,
      error: diagnosticError,
      data: diagnosticTests,
    },
    {
      key: 'nursing' as const,
      label: 'Nursing Packages',
      count: nursingCount,
      loading: nursingLoading,
      error: nursingError,
      data: nursingPackages,
    },
    {
      key: 'homecare' as const,
      label: 'Home Healthcare',
      count: homecareCount,
      loading: homecareLoading,
      error: homecareError,
      data: homeHealthcareServices,
    },
  ];

  const currentTab = tabs.find((tab) => tab.key === activeTab);

  useEffect(() => {
    console.log('=== SERVICE CATEGORIES DATA ===');
    console.log('Count:', categoriesCount);
    console.log('Data:', categories);
    console.log('Loading:', categoriesLoading);
    console.log('Error:', categoriesError);
  }, [categories, categoriesCount, categoriesLoading, categoriesError]);

  useEffect(() => {
    console.log('=== DIAGNOSTIC TESTS DATA ===');
    console.log('Count:', diagnosticCount);
    console.log('Data:', diagnosticTests);
    console.log('Loading:', diagnosticLoading);
    console.log('Error:', diagnosticError);
  }, [diagnosticTests, diagnosticCount, diagnosticLoading, diagnosticError]);

  useEffect(() => {
    console.log('=== NURSING PACKAGES DATA ===');
    console.log('Count:', nursingCount);
    console.log('Data:', nursingPackages);
    console.log('Loading:', nursingLoading);
    console.log('Error:', nursingError);
  }, [nursingPackages, nursingCount, nursingLoading, nursingError]);

  useEffect(() => {
    console.log('=== HOME HEALTHCARE DATA ===');
    console.log('Count:', homecareCount);
    console.log('Data:', homeHealthcareServices);
    console.log('Loading:', homecareLoading);
    console.log('Error:', homecareError);
  }, [homeHealthcareServices, homecareCount, homecareLoading, homecareError]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Services API Test Page</h1>
          <p className="text-gray-600">
            Testing all services module APIs - Raw data display for debugging
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {tabs.map((tab) => (
            <div
              key={tab.key}
              className={`bg-white p-4 rounded-lg shadow border-2 cursor-pointer transition-all ${
                activeTab === tab.key
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              <h3 className="text-sm font-semibold text-gray-600 mb-1">{tab.label}</h3>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-gray-900">
                  {tab.loading ? '...' : tab.count}
                </p>
                {tab.error && (
                  <span className="text-xs text-red-600 font-medium">Error</span>
                )}
                {tab.loading && (
                  <span className="text-xs text-blue-600 font-medium">Loading</span>
                )}
                {!tab.loading && !tab.error && (
                  <span className="text-xs text-green-600 font-medium">✓ Loaded</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 text-xs">({tab.count})</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* Loading State */}
          {currentTab?.loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading {currentTab.label}...</p>
            </div>
          )}

          {/* Error State */}
          {currentTab?.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
              <p className="text-red-600 mb-4">
                {currentTab.error.message || 'Failed to fetch data from API'}
              </p>
              <pre className="bg-red-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(currentTab.error, null, 2)}
              </pre>
            </div>
          )}

          {/* Data State */}
          {!currentTab?.loading && !currentTab?.error && currentTab && (
            <div>
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{currentTab.label}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Total Records: <span className="font-semibold">{currentTab.count}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(currentTab.data, null, 2));
                    alert('Data copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Copy JSON
                </button>
              </div>

              {/* Raw JSON Display */}
              <div className="bg-gray-900 rounded-lg p-6 overflow-auto max-h-[600px]">
                <pre className="text-green-400 text-xs font-mono">
                  {JSON.stringify(currentTab.data, null, 2)}
                </pre>
              </div>

              {/* Data Stats */}
              {currentTab.data.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Data Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Records:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {currentTab.data.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">First ID:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {currentTab.data[0]?.id || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last ID:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {currentTab.data[currentTab.data.length - 1]?.id || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Fields:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {Object.keys(currentTab.data[0] || {}).length}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {currentTab.data.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Found</h3>
                  <p className="text-gray-600">
                    No {currentTab.label.toLowerCase()} available in the system.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* API Endpoints Reference */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">API Endpoints Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="border border-gray-200 rounded p-3">
              <span className="font-semibold text-gray-700">Service Categories:</span>
              <code className="block mt-1 text-xs bg-gray-100 p-2 rounded">
                GET /api/services/categories/
              </code>
            </div>
            <div className="border border-gray-200 rounded p-3">
              <span className="font-semibold text-gray-700">Diagnostic Tests:</span>
              <code className="block mt-1 text-xs bg-gray-100 p-2 rounded">
                GET /api/services/diagnostic-tests/
              </code>
            </div>
            <div className="border border-gray-200 rounded p-3">
              <span className="font-semibold text-gray-700">Nursing Packages:</span>
              <code className="block mt-1 text-xs bg-gray-100 p-2 rounded">
                GET /api/services/nursing-packages/
              </code>
            </div>
            <div className="border border-gray-200 rounded p-3">
              <span className="font-semibold text-gray-700">Home Healthcare:</span>
              <code className="block mt-1 text-xs bg-gray-100 p-2 rounded">
                GET /api/services/home-healthcare/
              </code>
            </div>
          </div>
        </div>

        {/* Console Log Note */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">💡 Note:</span> Check browser console (F12) for detailed
            logging of all API responses and hook states.
          </p>
        </div>
      </div>
    </div>
  );
}
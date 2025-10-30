// src/pages/services/ServiceCategoriesListPage.tsx
import { useServiceCategories } from '@/hooks/useServices';

export default function ServiceCategoriesListPage() {
  const { categories, count, isLoading, error, mutate } = useServiceCategories({
    page_size: 100,
  });

  console.log('=== SERVICE CATEGORIES PAGE ===');
  console.log('Categories:', categories);
  console.log('Count:', count);
  console.log('Loading:', isLoading);
  console.log('Error:', error);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Service Categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl w-full">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Service Categories</h3>
          <p className="text-sm text-red-600 mb-4">{error.message || 'Failed to fetch data'}</p>
          <pre className="bg-red-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
          <button
            onClick={() => mutate()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Service Categories</h1>
              <p className="text-sm text-gray-600 mt-1">Total: {count} categories</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => mutate()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Refresh
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(categories, null, 2));
                  alert('Data copied to clipboard!');
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Copy JSON
              </button>
            </div>
          </div>

          {/* Raw JSON Display */}
          <div className="bg-gray-900 rounded-lg p-6 overflow-auto max-h-[600px]">
            <pre className="text-green-400 text-xs font-mono">
              {JSON.stringify(categories, null, 2)}
            </pre>
          </div>
        </div>

        {/* API Endpoint Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">API Endpoint</h3>
          <code className="block bg-gray-100 p-4 rounded text-sm">
            GET https://hms.dglinkup.com/api/services/categories/
          </code>
        </div>
      </div>
    </div>
  );
}
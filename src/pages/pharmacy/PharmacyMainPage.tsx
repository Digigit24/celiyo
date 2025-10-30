// src/pages/pharmacy/PharmacyMainPage.tsx
// UPDATED to match actual backend API endpoints
import { useState, useEffect } from 'react';
import {
  useProductCategories,
  usePharmacyProducts,
  useLowStockProducts,
  useNearExpiryProducts,
  usePharmacyStatistics,
  useCart,
  usePharmacyOrders,
} from '@/hooks/usePharmacy';

export default function PharmacyMainPage() {
  const [activeTab, setActiveTab] = useState<string>('categories');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Fetch all GET endpoints
  const categoriesData = useProductCategories();
  const productsData = usePharmacyProducts({ page_size: 100 });
  const lowStockData = useLowStockProducts();
  const nearExpiryData = useNearExpiryProducts();
  const statisticsData = usePharmacyStatistics();
  const cartData = useCart();
  const ordersData = usePharmacyOrders({ page_size: 100 });

  // Debug logging
  useEffect(() => {
    console.log('=== PHARMACY PAGE DEBUG ===');
    console.log('Categories:', {
      data: categoriesData.categories,
      count: categoriesData.count,
      loading: categoriesData.isLoading,
      error: categoriesData.error,
    });
    console.log('Products:', {
      data: productsData.products,
      count: productsData.count,
      loading: productsData.isLoading,
      error: productsData.error,
    });
    console.log('Low Stock:', {
      data: lowStockData.lowStockProducts,
      loading: lowStockData.isLoading,
      error: lowStockData.error,
    });
    console.log('Near Expiry:', {
      data: nearExpiryData.nearExpiryProducts,
      loading: nearExpiryData.isLoading,
      error: nearExpiryData.error,
    });
    console.log('Statistics:', {
      data: statisticsData.statistics,
      loading: statisticsData.isLoading,
      error: statisticsData.error,
    });
    console.log('Cart:', {
      data: cartData.cart,
      loading: cartData.isLoading,
      error: cartData.error,
    });
    console.log('Orders:', {
      data: ordersData.orders,
      count: ordersData.count,
      loading: ordersData.isLoading,
      error: ordersData.error,
    });

    setDebugInfo({
      categories: categoriesData,
      products: productsData,
      lowStock: lowStockData,
      nearExpiry: nearExpiryData,
      statistics: statisticsData,
      cart: cartData,
      orders: ordersData,
    });
  }, [
    categoriesData.categories,
    productsData.products,
    lowStockData.lowStockProducts,
    nearExpiryData.nearExpiryProducts,
    statisticsData.statistics,
    cartData.cart,
    ordersData.orders,
  ]);

  // API Tabs configuration
  const apiTabs = [
    {
      key: 'categories',
      label: 'Product Categories',
      endpoint: 'GET /pharmacy/categories/',
      data: categoriesData,
      response: {
        count: categoriesData.count,
        results: categoriesData.categories,
      },
    },
    {
      key: 'products',
      label: 'Pharmacy Products',
      endpoint: 'GET /pharmacy/products/',
      data: productsData,
      response: {
        count: productsData.count,
        results: productsData.products,
      },
    },
    {
      key: 'low-stock',
      label: 'Low Stock Products',
      endpoint: 'GET /pharmacy/products/low_stock/',
      data: lowStockData,
      response: lowStockData.lowStockProducts,
    },
    {
      key: 'near-expiry',
      label: 'Near Expiry Products',
      endpoint: 'GET /pharmacy/products/near_expiry/',
      data: nearExpiryData,
      response: nearExpiryData.nearExpiryProducts,
    },
    {
      key: 'statistics',
      label: 'Pharmacy Statistics',
      endpoint: 'GET /pharmacy/products/statistics/',
      data: statisticsData,
      response: statisticsData.statistics,
    },
    {
      key: 'cart',
      label: 'Shopping Cart',
      endpoint: 'GET /pharmacy/cart/',
      data: cartData,
      response: cartData.cart,
    },
    {
      key: 'orders',
      label: 'Pharmacy Orders',
      endpoint: 'GET /pharmacy/orders/',
      data: ordersData,
      response: {
        count: ordersData.count,
        results: ordersData.orders,
      },
    },
  ];

  const activeApiTab = apiTabs.find((tab) => tab.key === activeTab);

  // Check if any hook is loading
  const anyLoading =
    categoriesData.isLoading ||
    productsData.isLoading ||
    lowStockData.isLoading ||
    nearExpiryData.isLoading ||
    statisticsData.isLoading ||
    cartData.isLoading ||
    ordersData.isLoading;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Pharmacy Module - API Testing
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Testing all Pharmacy GET endpoints with raw API responses
              </p>
              {anyLoading && (
                <p className="text-xs text-blue-600 mt-1 animate-pulse">
                  ⏳ Loading data...
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Refresh all data
                  categoriesData.mutate();
                  productsData.mutate();
                  lowStockData.mutate();
                  nearExpiryData.mutate();
                  statisticsData.mutate();
                  cartData.mutate();
                  ordersData.mutate();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                🔄 Refresh All
              </button>
              <button
                onClick={() => {
                  console.log('=== DEBUG INFO ===', debugInfo);
                  alert('Debug info logged to console');
                }}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
              >
                🐛 Debug
              </button>
            </div>
          </div>

          {/* API Tabs */}
          <div className="flex gap-2 flex-wrap border-b border-gray-200 pb-2">
            {apiTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-t transition ${
                  activeTab === tab.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
                {tab.data.isLoading && (
                  <span className="ml-2 inline-block animate-spin">⏳</span>
                )}
                {tab.data.error && <span className="ml-2">❌</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Active API Tab Content */}
        {activeApiTab && (
          <div className="bg-white rounded-lg shadow p-6">
            {/* API Info Header */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeApiTab.label}
                  </h2>
                  <code className="block mt-2 text-sm bg-gray-100 px-3 py-2 rounded text-blue-600">
                    {activeApiTab.endpoint}
                  </code>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => activeApiTab.data.mutate()}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                    disabled={activeApiTab.data.isLoading}
                  >
                    {activeApiTab.data.isLoading ? '⏳ Loading...' : '🔄 Refresh'}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        JSON.stringify(activeApiTab.response, null, 2)
                      );
                      alert('Response copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                  >
                    📋 Copy JSON
                  </button>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex gap-2 flex-wrap">
                {activeApiTab.data.isLoading && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                    ⏳ Loading...
                  </span>
                )}
                {activeApiTab.data.error && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                    ❌ Error
                  </span>
                )}
                {!activeApiTab.data.isLoading && !activeApiTab.data.error && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                    ✅ Success
                  </span>
                )}
                {activeApiTab.response &&
                  typeof activeApiTab.response === 'object' &&
                  'count' in activeApiTab.response && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      📊 Count: {(activeApiTab.response as any).count}
                    </span>
                  )}
              </div>
            </div>

            {/* Loading State */}
            {activeApiTab.data.isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading {activeApiTab.label}...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {activeApiTab.data.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Error Loading {activeApiTab.label}
                </h3>
                <p className="text-sm text-red-600 mb-4">
                  {activeApiTab.data.error.message || 'Failed to fetch data'}
                </p>
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-red-700 hover:text-red-900">
                    View Error Details
                  </summary>
                  <pre className="mt-2 bg-red-100 p-4 rounded text-xs overflow-auto max-h-96">
                    {JSON.stringify(activeApiTab.data.error, null, 2)}
                  </pre>
                </details>
                <button
                  onClick={() => activeApiTab.data.mutate()}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  🔄 Retry
                </button>
              </div>
            )}

            {/* Success State - Raw JSON Response */}
            {!activeApiTab.data.isLoading && !activeApiTab.data.error && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Raw API Response
                  </h3>
                  <span className="text-sm text-gray-500">
                    {JSON.stringify(activeApiTab.response).length} characters
                  </span>
                </div>

                {/* JSON Display */}
                <div className="bg-gray-900 rounded-lg p-6 overflow-auto max-h-[600px]">
                  <pre className="text-green-400 text-xs font-mono leading-relaxed">
                    {JSON.stringify(activeApiTab.response, null, 2)}
                  </pre>
                </div>

                {/* Quick Stats */}
                {Array.isArray(activeApiTab.response) && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      📊 <strong>Total Items:</strong>{' '}
                      {activeApiTab.response.length}
                    </p>
                  </div>
                )}

                {activeApiTab.response &&
                  typeof activeApiTab.response === 'object' &&
                  'results' in activeApiTab.response && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        📊 <strong>Total Results:</strong>{' '}
                        {(activeApiTab.response as any).results?.length || 0}
                      </p>
                    </div>
                  )}
              </div>
            )}
          </div>
        )}

        {/* API Endpoints Reference */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            📚 All Pharmacy API Endpoints (Actual Backend)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GET Endpoints */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-700 mb-2">GET Endpoints</h4>
              <ul className="space-y-1 text-xs">
                <li className="font-mono">GET /pharmacy/categories/</li>
                <li className="font-mono">GET /pharmacy/categories/:id/</li>
                <li className="font-mono">GET /pharmacy/products/</li>
                <li className="font-mono">GET /pharmacy/products/:id/</li>
                <li className="font-mono">GET /pharmacy/products/low_stock/</li>
                <li className="font-mono">GET /pharmacy/products/near_expiry/</li>
                <li className="font-mono">GET /pharmacy/products/statistics/</li>
                <li className="font-mono">GET /pharmacy/cart/</li>
                <li className="font-mono">GET /pharmacy/cart/:id/</li>
                <li className="font-mono">GET /pharmacy/orders/</li>
                <li className="font-mono">GET /pharmacy/orders/:id/</li>
              </ul>
            </div>

            {/* POST Endpoints */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-700 mb-2">POST Endpoints</h4>
              <ul className="space-y-1 text-xs">
                <li className="font-mono">POST /pharmacy/categories/</li>
                <li className="font-mono">POST /pharmacy/products/</li>
                <li className="font-mono">POST /pharmacy/cart/</li>
                <li className="font-mono">POST /pharmacy/cart/add_item/</li>
                <li className="font-mono">POST /pharmacy/orders/</li>
              </ul>
            </div>

            {/* PATCH/PUT Endpoints */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-700 mb-2">PATCH/PUT Endpoints</h4>
              <ul className="space-y-1 text-xs">
                <li className="font-mono">PATCH /pharmacy/categories/:id/</li>
                <li className="font-mono">PATCH /pharmacy/products/:id/</li>
                <li className="font-mono">PATCH /pharmacy/cart/:id/</li>
                <li className="font-mono">PATCH /pharmacy/orders/:id/</li>
              </ul>
            </div>

            {/* DELETE Endpoints */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-700 mb-2">DELETE Endpoints</h4>
              <ul className="space-y-1 text-xs">
                <li className="font-mono">DELETE /pharmacy/categories/:id/</li>
                <li className="font-mono">DELETE /pharmacy/products/:id/</li>
                <li className="font-mono">DELETE /pharmacy/cart/:id/</li>
                <li className="font-mono">DELETE /pharmacy/orders/:id/</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
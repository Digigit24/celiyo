// src/pages/OPD.tsx
import { useOPD } from '@/hooks/useOPD';

export default function OPD() {
  const { data, loading, error, refetch } = useOPD();

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-lg text-gray-600">Loading OPD data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto mt-8">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Error Loading OPD Data
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          OPD Module - Raw API Data
        </h1>
        <p className="text-gray-600 mb-4">
          Displaying all OPD endpoints data in JSON format
        </p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      <div className="space-y-6">
        {/* Visits Section */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">
            1. Visits (GET /opd/visits/)
          </h2>
          <div className="bg-white p-4 rounded overflow-auto max-h-[400px]">
            <pre className="text-xs">
              {JSON.stringify(data.visits, null, 2)}
            </pre>
          </div>
        </div>

        {/* Today's Visits Section */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">
            2. Today's Visits (GET /opd/visits/today/)
          </h2>
          <div className="bg-white p-4 rounded overflow-auto max-h-[400px]">
            <pre className="text-xs">
              {JSON.stringify(data.todayVisits, null, 2)}
            </pre>
          </div>
        </div>

        {/* Queue Section */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 text-green-700">
            3. Queue Status (GET /opd/visits/queue/)
          </h2>
          <div className="bg-white p-4 rounded overflow-auto max-h-[400px]">
            <pre className="text-xs">{JSON.stringify(data.queue, null, 2)}</pre>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 text-purple-700">
            4. Visit Statistics (GET /opd/visits/statistics/)
          </h2>
          <div className="bg-white p-4 rounded overflow-auto max-h-[400px]">
            <pre className="text-xs">
              {JSON.stringify(data.statistics, null, 2)}
            </pre>
          </div>
        </div>

        {/* OPD Bills Section */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 text-orange-700">
            5. OPD Bills (GET /opd/opd-bills/)
          </h2>
          <div className="bg-white p-4 rounded overflow-auto max-h-[400px]">
            <pre className="text-xs">
              {JSON.stringify(data.opdBills, null, 2)}
            </pre>
          </div>
        </div>

        {/* Procedure Masters Section */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 text-indigo-700">
            6. Procedure Masters (GET /opd/procedure-masters/)
          </h2>
          <div className="bg-white p-4 rounded overflow-auto max-h-[400px]">
            <pre className="text-xs">
              {JSON.stringify(data.procedureMasters, null, 2)}
            </pre>
          </div>
        </div>

        {/* Procedure Packages Section */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 text-pink-700">
            7. Procedure Packages (GET /opd/procedure-packages/)
          </h2>
          <div className="bg-white p-4 rounded overflow-auto max-h-[400px]">
            <pre className="text-xs">
              {JSON.stringify(data.procedurePackages, null, 2)}
            </pre>
          </div>
        </div>

        {/* Procedure Bills Section */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 text-red-700">
            8. Procedure Bills (GET /opd/procedure-bills/)
          </h2>
          <div className="bg-white p-4 rounded overflow-auto max-h-[400px]">
            <pre className="text-xs">
              {JSON.stringify(data.procedureBills, null, 2)}
            </pre>
          </div>
        </div>

        {/* Clinical Notes Section */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 text-teal-700">
            9. Clinical Notes (GET /opd/clinical-notes/)
          </h2>
          <div className="bg-white p-4 rounded overflow-auto max-h-[400px]">
            <pre className="text-xs">
              {JSON.stringify(data.clinicalNotes, null, 2)}
            </pre>
          </div>
        </div>

        {/* Visit Findings Section */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 text-cyan-700">
            10. Visit Findings (GET /opd/visit-findings/)
          </h2>
          <div className="bg-white p-4 rounded overflow-auto max-h-[400px]">
            <pre className="text-xs">
              {JSON.stringify(data.visitFindings, null, 2)}
            </pre>
          </div>
        </div>

        {/* Visit Attachments Section */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 text-amber-700">
            11. Visit Attachments (GET /opd/visit-attachments/)
          </h2>
          <div className="bg-white p-4 rounded overflow-auto max-h-[400px]">
            <pre className="text-xs">
              {JSON.stringify(data.visitAttachments, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
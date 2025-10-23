// src/pages/opd/OpdVisitsListPage.tsx
import { useState } from 'react';
import { useVisits, useVisitStatistics, useTodayVisits, useQueue } from '@/hooks/useOPD';
import type { VisitListParams, VisitStatus, PaymentStatus, VisitType } from '@/types/opd.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCcw } from 'lucide-react';

export default function OpdVisitsListPage() {
  const [filters, setFilters] = useState<VisitListParams>({
    page: 1,
    status: undefined,
    payment_status: undefined,
    visit_type: undefined,
    search: '',
  });

  const { visits, count, next, previous, isLoading, error, mutate } = useVisits(filters);
  const { statistics, isLoading: statsLoading } = useVisitStatistics();
  const { todayVisits, count: todayCount, isLoading: todayLoading } = useTodayVisits();
  const { waiting, called, inConsultation, isLoading: queueLoading } = useQueue();

  const handleFilterChange = (key: keyof VisitListParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
      page: 1, // Reset to page 1 when filters change
    }));
  };

  const handleRefresh = () => {
    mutate();
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Error Loading Visits</h2>
          <p>{error?.message || 'Failed to load OPD visits'}</p>
          <Button onClick={handleRefresh} className="mt-4" variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">OPD Visits</h1>
          <p className="text-muted-foreground mt-1">
            Manage outpatient department visits and consultations
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {!statsLoading && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Visits</p>
            <p className="text-2xl font-bold">{statistics.total_visits}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600">Waiting</p>
            <p className="text-2xl font-bold text-blue-700">{statistics.waiting}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-600">In Consultation</p>
            <p className="text-2xl font-bold text-yellow-700">{statistics.in_consultation}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600">Completed</p>
            <p className="text-2xl font-bold text-green-700">{statistics.completed}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Patient name, visit number..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="called">Called</SelectItem>
                <SelectItem value="in_consultation">In Consultation</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="payment_status">Payment Status</Label>
            <Select
              value={filters.payment_status || 'all'}
              onValueChange={(value) => handleFilterChange('payment_status', value)}
            >
              <SelectTrigger id="payment_status">
                <SelectValue placeholder="All Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Status</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Visit Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="visit_type">Visit Type</Label>
            <Select
              value={filters.visit_type || 'all'}
              onValueChange={(value) => handleFilterChange('visit_type', value)}
            >
              <SelectTrigger id="visit_type">
                <SelectValue placeholder="All Visit Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Visit Types</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="follow_up">Follow Up</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <strong>Total Visits:</strong> {count} | <strong>Current Page:</strong> {filters.page || 1}
        </div>
      </div>

      {/* Today's Visits Section */}
      {!todayLoading && todayVisits.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Today's Visits ({todayCount})</h2>
          <div className="bg-gray-50 p-4 rounded overflow-auto max-h-[300px]">
            <pre className="text-xs">{JSON.stringify(todayVisits, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Queue Status Section */}
      {!queueLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-blue-600">Waiting ({waiting.length})</h3>
            <div className="bg-blue-50 p-3 rounded overflow-auto max-h-[200px]">
              <pre className="text-xs">{JSON.stringify(waiting, null, 2)}</pre>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-yellow-600">Called ({called.length})</h3>
            <div className="bg-yellow-50 p-3 rounded overflow-auto max-h-[200px]">
              <pre className="text-xs">{JSON.stringify(called, null, 2)}</pre>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-green-600">
              In Consultation ({inConsultation.length})
            </h3>
            <div className="bg-green-50 p-3 rounded overflow-auto max-h-[200px]">
              <pre className="text-xs">{JSON.stringify(inConsultation, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Main Visits List - Raw JSON */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">All Visits (Raw API Response)</h2>
        <div className="bg-gray-50 p-4 rounded overflow-auto max-h-[600px]">
          <pre className="text-xs">
            {JSON.stringify(
              {
                count,
                next,
                previous,
                results: visits,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>

      {/* Pagination Info */}
      {(next || previous) && (
        <div className="flex items-center justify-between bg-white border rounded-lg p-4">
          <Button
            variant="outline"
            disabled={!previous}
            onClick={() => handleFilterChange('page', (filters.page || 1) - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {filters.page || 1}
          </span>
          <Button
            variant="outline"
            disabled={!next}
            onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
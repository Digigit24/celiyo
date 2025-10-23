// src/pages/opd/VisitFindingsListPage.tsx
import { useState } from 'react';
import { useVisitFindings } from '@/hooks/useOPD';
import type { VisitFindingListParams, FindingType } from '@/types/opd.types';
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
import { RefreshCcw, Plus } from 'lucide-react';

export default function VisitFindingsListPage() {
  const [filters, setFilters] = useState<VisitFindingListParams>({
    page: 1,
    finding_type: undefined,
    search: '',
  });

  const { visitFindings, count, next, previous, isLoading, error, mutate } = useVisitFindings(filters);

  const handleFilterChange = (key: keyof VisitFindingListParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
      page: 1,
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
          <h2 className="font-semibold mb-2">Error Loading Visit Findings</h2>
          <p>{error?.message || 'Failed to load visit findings'}</p>
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
          <h1 className="text-3xl font-bold">Visit Findings</h1>
          <p className="text-muted-foreground mt-1">
            View and manage patient vital signs and examination findings
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Record Finding
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Findings</p>
          <p className="text-2xl font-bold">{count}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-600">Examinations</p>
          <p className="text-2xl font-bold text-purple-700">
            {visitFindings.filter((f) => f.finding_type === 'examination').length}
          </p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-sm text-indigo-600">Investigations</p>
          <p className="text-2xl font-bold text-indigo-700">
            {visitFindings.filter((f) => f.finding_type === 'investigation').length}
          </p>
        </div>
      </div>

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

          {/* Finding Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="finding_type">Finding Type</Label>
            <Select
              value={filters.finding_type || 'all'}
              onValueChange={(value) => handleFilterChange('finding_type', value)}
            >
              <SelectTrigger id="finding_type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="examination">Examination</SelectItem>
                <SelectItem value="investigation">Investigation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Finding Date Filter */}
          <div className="space-y-2">
            <Label htmlFor="finding_date">Finding Date</Label>
            <Input
              id="finding_date"
              type="date"
              value={filters.finding_date || ''}
              onChange={(e) => handleFilterChange('finding_date', e.target.value)}
            />
          </div>

          {/* Visit ID Filter */}
          <div className="space-y-2">
            <Label htmlFor="visit">Visit ID</Label>
            <Input
              id="visit"
              type="number"
              placeholder="Filter by visit ID..."
              value={filters.visit || ''}
              onChange={(e) => handleFilterChange('visit', parseInt(e.target.value) || undefined)}
            />
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <strong>Total Findings:</strong> {count} | <strong>Current Page:</strong> {filters.page || 1}
        </div>
      </div>

      {/* Visit Findings List - Raw JSON */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Visit Findings (Raw API Response)</h2>
        <div className="bg-gray-50 p-4 rounded overflow-auto max-h-[600px]">
          <pre className="text-xs">
            {JSON.stringify(
              {
                count,
                next,
                previous,
                results: visitFindings,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>

      {/* Pagination */}
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
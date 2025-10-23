// src/pages/opd/ClinicalNotesListPage.tsx
import { useState } from 'react';
import { useClinicalNotes } from '@/hooks/useOPD';
import type { ClinicalNoteListParams } from '@/types/opd.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCcw, Plus } from 'lucide-react';

export default function ClinicalNotesListPage() {
  const [filters, setFilters] = useState<ClinicalNoteListParams>({
    page: 1,
    search: '',
  });

  const { clinicalNotes, count, next, previous, isLoading, error, mutate } = useClinicalNotes(filters);

  const handleFilterChange = (key: keyof ClinicalNoteListParams, value: any) => {
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
          <h2 className="font-semibold mb-2">Error Loading Clinical Notes</h2>
          <p>{error?.message || 'Failed to load clinical notes'}</p>
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
          <h1 className="text-3xl font-bold">Clinical Notes</h1>
          <p className="text-muted-foreground mt-1">
            View and manage patient clinical notes and medical records
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Notes</p>
          <p className="text-2xl font-bold">{count}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600">Today's Notes</p>
          <p className="text-2xl font-bold text-blue-700">
            {clinicalNotes.filter((note) => {
              const today = new Date().toISOString().split('T')[0];
              return note.note_date === today;
            }).length}
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">With Follow-up</p>
          <p className="text-2xl font-bold text-green-700">
            {clinicalNotes.filter((note) => note.next_followup_date).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Patient name, diagnosis..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Note Date Filter */}
          <div className="space-y-2">
            <Label htmlFor="note_date">Note Date</Label>
            <Input
              id="note_date"
              type="date"
              value={filters.note_date || ''}
              onChange={(e) => handleFilterChange('note_date', e.target.value)}
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
          <strong>Total Notes:</strong> {count} | <strong>Current Page:</strong> {filters.page || 1}
        </div>
      </div>

      {/* Clinical Notes List - Raw JSON */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Clinical Notes (Raw API Response)</h2>
        <div className="bg-gray-50 p-4 rounded overflow-auto max-h-[600px]">
          <pre className="text-xs">
            {JSON.stringify(
              {
                count,
                next,
                previous,
                results: clinicalNotes,
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
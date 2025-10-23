// src/pages/opd/OpdBillsListPage.tsx
import { useState } from 'react';
import { useOPDBills } from '@/hooks/useOPD';
import type { OPDBillListParams, PaymentStatus, OPDType } from '@/types/opd.types';
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

export default function OpdBillsListPage() {
  const [filters, setFilters] = useState<OPDBillListParams>({
    page: 1,
    payment_status: undefined,
    opd_type: undefined,
    search: '',
  });

  const { opdBills, count, next, previous, isLoading, error, mutate } = useOPDBills(filters);

  const handleFilterChange = (key: keyof OPDBillListParams, value: any) => {
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
          <h2 className="font-semibold mb-2">Error Loading OPD Bills</h2>
          <p>{error?.message || 'Failed to load OPD bills'}</p>
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
          <h1 className="text-3xl font-bold">OPD Bills</h1>
          <p className="text-muted-foreground mt-1">
            Manage OPD consultation bills and payments
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Bill
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Bills</p>
          <p className="text-2xl font-bold">{count}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">Paid</p>
          <p className="text-2xl font-bold text-green-700">
            {opdBills.filter((b) => b.payment_status === 'paid').length}
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-600">Partial</p>
          <p className="text-2xl font-bold text-yellow-700">
            {opdBills.filter((b) => b.payment_status === 'partial').length}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">Unpaid</p>
          <p className="text-2xl font-bold text-red-700">
            {opdBills.filter((b) => b.payment_status === 'unpaid').length}
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
              placeholder="Bill number, patient name..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
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

          {/* OPD Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="opd_type">OPD Type</Label>
            <Select
              value={filters.opd_type || 'all'}
              onValueChange={(value) => handleFilterChange('opd_type', value)}
            >
              <SelectTrigger id="opd_type">
                <SelectValue placeholder="All OPD Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All OPD Types</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="follow_up">Follow Up</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bill Date Filter */}
          <div className="space-y-2">
            <Label htmlFor="bill_date">Bill Date</Label>
            <Input
              id="bill_date"
              type="date"
              value={filters.bill_date || ''}
              onChange={(e) => handleFilterChange('bill_date', e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <strong>Total Bills:</strong> {count} | <strong>Current Page:</strong> {filters.page || 1}
        </div>
      </div>

      {/* Bills List - Raw JSON */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">OPD Bills (Raw API Response)</h2>
        <div className="bg-gray-50 p-4 rounded overflow-auto max-h-[600px]">
          <pre className="text-xs">
            {JSON.stringify(
              {
                count,
                next,
                previous,
                results: opdBills,
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
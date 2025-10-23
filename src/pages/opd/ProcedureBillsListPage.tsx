// src/pages/opd/ProcedureBillsListPage.tsx
import { useState } from 'react';
import { useProcedureBills } from '@/hooks/useOPD';
import type { ProcedureBillListParams, PaymentStatus } from '@/types/opd.types';
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

export default function ProcedureBillsListPage() {
  const [filters, setFilters] = useState<ProcedureBillListParams>({
    page: 1,
    payment_status: undefined,
    search: '',
  });

  const { procedureBills, count, next, previous, isLoading, error, mutate } =
    useProcedureBills(filters);

  const handleFilterChange = (key: keyof ProcedureBillListParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
      page: 1,
    }));
  };

  const handleRefresh = () => {
    mutate();
  };

  // Calculate total revenue
  const totalRevenue = procedureBills.reduce(
    (sum, bill) => sum + parseFloat(bill.total_amount),
    0
  );

  const totalReceived = procedureBills.reduce(
    (sum, bill) => sum + parseFloat(bill.received_amount),
    0
  );

  const totalPending = procedureBills.reduce(
    (sum, bill) => sum + parseFloat(bill.balance_amount),
    0
  );

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
          <h2 className="font-semibold mb-2">Error Loading Procedure Bills</h2>
          <p>{error?.message || 'Failed to load procedure bills'}</p>
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
          <h1 className="text-3xl font-bold">Procedure Bills</h1>
          <p className="text-muted-foreground mt-1">
            Manage procedure billing and payments
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Bills</p>
          <p className="text-2xl font-bold">{count}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-600">Total Revenue</p>
          <p className="text-xl font-bold text-purple-700">₹{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">Received</p>
          <p className="text-xl font-bold text-green-700">₹{totalReceived.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">Pending</p>
          <p className="text-xl font-bold text-red-700">₹{totalPending.toFixed(2)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600">Paid Bills</p>
          <p className="text-2xl font-bold text-blue-700">
            {procedureBills.filter((b) => b.payment_status === 'paid').length}
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
              placeholder="Bill number, patient..."
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

          {/* Visit ID Filter */}
          <div className="space-y-2">
            <Label htmlFor="visit">Visit ID</Label>
            <Input
              id="visit"
              type="number"
              placeholder="Filter by visit..."
              value={filters.visit || ''}
              onChange={(e) =>
                handleFilterChange('visit', parseInt(e.target.value) || undefined)
              }
            />
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <strong>Total Bills:</strong> {count} | <strong>Current Page:</strong>{' '}
          {filters.page || 1}
        </div>
      </div>

      {/* Bills List - Raw JSON */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          Procedure Bills (Raw API Response)
        </h2>
        <div className="bg-gray-50 p-4 rounded overflow-auto max-h-[600px]">
          <pre className="text-xs">
            {JSON.stringify(
              {
                count,
                next,
                previous,
                results: procedureBills,
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
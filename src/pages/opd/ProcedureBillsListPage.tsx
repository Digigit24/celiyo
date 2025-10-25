// src/pages/opd/ProcedureBillsListPage.tsx

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useProcedureBills } from '@/hooks/useOPD';
import type {
  ProcedureBillListParams,
  PaymentStatus,
} from '@/types/opd.types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCcw,
  Plus,
  Phone,
  CalendarDays,
  Receipt,
  Wallet,
} from 'lucide-react';

// shared responsive table
import { DataTable, DataTableColumn } from '@/components/DataTable';

// -----------------------
// helpers / formatters
// -----------------------

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatRupee(value: string | number | undefined | null) {
  if (value === undefined || value === null) return '₹0.00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '₹0.00';
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function StatusBadge({ status }: { status?: PaymentStatus | string }) {
  if (status === 'paid') {
    return (
      <Badge
        variant="secondary"
        className="bg-green-100 text-green-700 border border-green-200 font-medium"
      >
        Paid
      </Badge>
    );
  }
  if (status === 'partial') {
    return (
      <Badge
        variant="secondary"
        className="bg-yellow-100 text-yellow-700 border border-yellow-200 font-medium"
      >
        Partial
      </Badge>
    );
  }
  return (
    <Badge
      variant="secondary"
      className="bg-red-100 text-red-700 border border-red-200 font-medium"
    >
      Unpaid
    </Badge>
  );
}

// -----------------------
// mobile card renderer
// -----------------------
function useProcedureBillMobileCard({
  onView,
  onCollect,
}: {
  onView: (bill: any) => void;
  onCollect: (bill: any) => void;
}) {
  return useCallback(
    (bill: any, actionsFromTable: any) => {
      return (
        <div className="space-y-3 text-sm">
          {/* header row */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* bill number + date */}
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <div className="font-semibold text-base leading-tight text-slate-900">
                  {bill.bill_number || `#${bill.id}`}
                </div>

                <Badge
                  variant="outline"
                  className="text-[10px] font-normal flex items-center gap-1"
                >
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(bill.bill_date)}
                </Badge>
              </div>

              {/* patient info */}
              <div className="text-[13px] text-slate-900 font-medium leading-tight">
                {bill.patient_name || '—'}
              </div>

              {bill.patient_phone && (
                <div className="text-[11px] text-slate-500 flex items-center gap-1 leading-tight">
                  <Phone className="h-3 w-3 text-slate-400" />
                  <span>{bill.patient_phone}</span>
                </div>
              )}

              {/* maybe visit/procedure etc. */}
              {bill.visit && (
                <div className="text-[11px] text-slate-500 leading-tight">
                  Visit: {bill.visit}
                </div>
              )}

              {bill.procedure_name && (
                <div className="text-[11px] text-slate-500 leading-tight">
                  {bill.procedure_name}
                </div>
              )}

              <div className="mt-2">
                <StatusBadge status={bill.payment_status} />
              </div>
            </div>

            {/* quick view button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onView(bill);
              }}
            >
              <Receipt className="h-4 w-4" />
            </Button>
          </div>

          {/* money summary */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="text-xs leading-tight">
              <div className="text-slate-900 font-medium flex items-center gap-1">
                <Wallet className="h-3.5 w-3.5 text-slate-500" />
                <span>
                  Total {formatRupee(bill.total_amount)}
                </span>
              </div>

              <div className="text-[11px] text-slate-700 mt-1 leading-tight">
                Received: {formatRupee(bill.received_amount)}
              </div>
              <div className="text-[11px] text-slate-500 leading-tight">
                Balance: {formatRupee(bill.balance_amount)}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 text-right">
              {onCollect && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCollect(bill);
                  }}
                >
                  Collect
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    },
    [onCollect, onView]
  );
}

// -----------------------
// main page
// -----------------------

export default function ProcedureBillsListPage() {
  // table / api filters
  const [filters, setFilters] = useState<ProcedureBillListParams>({
    page: 1,
    payment_status: undefined,
    search: '',
    bill_date: undefined,
    visit: undefined,
  });

  // separate local search input (debounced-ish)
  const [searchText, setSearchText] = useState(filters.search || '');

  // update filters.search when user pauses typing
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchText,
        page: 1,
      }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchText]);

  // fetch data
  const {
    procedureBills,
    count,
    next,
    previous,
    isLoading,
    error,
    mutate,
  } = useProcedureBills(filters);

  // for skeleton handling like other pages
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  useEffect(() => {
    if (!isLoading && !error) {
      setHasLoadedOnce(true);
    }
  }, [isLoading, error]);

  // update any filter field
  const handleFilterChange = (
    key: keyof ProcedureBillListParams,
    value: any
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
      page: 1,
    }));
  };

  const handleRefresh = () => {
    mutate();
  };

  // stats across page
  const { totalRevenue, totalReceived, totalPending, paidCount } = useMemo(() => {
    let revenue = 0;
    let received = 0;
    let pending = 0;
    let paid = 0;

    for (const b of procedureBills) {
      revenue += parseFloat(b.total_amount || '0');
      received += parseFloat(b.received_amount || '0');
      pending += parseFloat(b.balance_amount || '0');
      if (b.payment_status === 'paid') paid += 1;
    }

    return {
      totalRevenue: revenue,
      totalReceived: received,
      totalPending: pending,
      paidCount: paid,
    };
  }, [procedureBills]);

  // row actions
  const handleViewBill = useCallback((bill: any) => {
    console.log('view bill', bill.id);
    // open bill drawer / print preview etc.
  }, []);

  const handleCollectPayment = useCallback((bill: any) => {
    console.log('collect payment for bill', bill.id);
    // open payment modal etc.
  }, []);

  // -----------------------
  // table columns (desktop)
  // -----------------------
  const columns = useMemo<DataTableColumn<any>[]>(() => {
    return [
      {
        key: 'billno',
        header: 'Bill #',
        cell: (bill) => (
          <div className="font-medium text-slate-900 leading-tight">
            {bill.bill_number || `#${bill.id}`}
          </div>
        ),
      },
      {
        key: 'patient',
        header: 'Patient',
        cell: (bill) => (
          <div className="leading-tight">
            <div className="text-slate-900 font-medium text-[13px]">
              {bill.patient_name || '—'}
            </div>
            {bill.patient_phone ? (
              <div className="text-[11px] text-slate-500 flex items-center gap-1 leading-tight">
                <Phone className="h-3 w-3 text-slate-400" />
                <span>{bill.patient_phone}</span>
              </div>
            ) : null}
            {bill.visit ? (
              <div className="text-[11px] text-slate-500 leading-tight">
                Visit: {bill.visit}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        key: 'date',
        header: 'Date',
        cell: (bill) => (
          <div className="whitespace-nowrap text-sm leading-tight">
            {formatDate(bill.bill_date)}
          </div>
        ),
      },
      {
        key: 'amounts',
        header: 'Amount / Received / Bal',
        className: 'min-w-[180px]',
        cell: (bill) => (
          <div className="whitespace-nowrap text-xs leading-tight">
            <div className="text-slate-900 font-medium">
              Total: {formatRupee(bill.total_amount)}
            </div>
            <div className="text-slate-700">
              Recv: {formatRupee(bill.received_amount)}
            </div>
            <div className="text-slate-500">
              Bal: {formatRupee(bill.balance_amount)}
            </div>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (bill) => <StatusBadge status={bill.payment_status} />,
      },
    ];
  }, []);

  // mobile card renderer (hook)
  const renderMobileCard = useProcedureBillMobileCard({
    onView: handleViewBill,
    onCollect: handleCollectPayment,
  });

  // skeleton state like the others
  if (!hasLoadedOnce && isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        {/* header skeleton */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="h-7 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="h-9 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="border rounded-lg p-4 space-y-2 bg-white animate-pulse"
            >
              <div className="h-4 w-1/2 bg-gray-100 rounded" />
              <div className="h-6 w-1/3 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {/* table skeleton */}
        <div className="border rounded-lg bg-white p-6">
          <div className="h-5 w-44 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="h-32 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // error state
  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Error Loading Procedure Bills</h2>
          <p>{(error as any)?.message || 'Failed to load procedure bills'}</p>
          <Button onClick={handleRefresh} className="mt-4" variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // main render
  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">
            Procedure Bills
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage procedure billing and payments
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="min-w-[90px]"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" className="min-w-[90px]">
            <Plus className="mr-2 h-4 w-4" />
            New Bill
          </Button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border rounded-lg p-4 flex flex-col">
          <p className="text-sm text-muted-foreground">Total Bills</p>
          <p className="text-2xl font-bold">{count}</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex flex-col">
          <p className="text-sm text-purple-600">Total Revenue</p>
          <p className="text-xl font-bold text-purple-700">
            {formatRupee(totalRevenue)}
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col">
          <p className="text-sm text-green-600">Received</p>
          <p className="text-xl font-bold text-green-700">
            {formatRupee(totalReceived)}
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col">
          <p className="text-sm text-red-600">Pending</p>
          <p className="text-xl font-bold text-red-700">
            {formatRupee(totalPending)}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col">
          <p className="text-sm text-blue-600">Paid Bills</p>
          <p className="text-2xl font-bold text-blue-700">{paidCount}</p>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white border rounded-lg">
        {/* HEADER + FILTER BAR */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between p-4 md:p-6 border-b">
          {/* left side: title + page info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold leading-none">Bills</h2>
              <Badge variant="outline" className="text-[11px] font-normal">
                {procedureBills.length} shown / {count} total
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Page {filters.page || 1}
            </p>
          </div>

          {/* right side filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            {/* Search (global) */}
            <div className="flex flex-col">
              <Input
                id="search"
                className="h-9 w-[220px] md:w-[200px] lg:w-[220px]"
                placeholder="Search bill / patient"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            {/* Bill Date */}
            <div className="flex flex-col">
              <Input
                id="bill_date"
                type="date"
                className="h-9 w-[150px] text-xs"
                value={filters.bill_date || ''}
                onChange={(e) =>
                  handleFilterChange('bill_date', e.target.value)
                }
              />
            </div>

            {/* Payment Status */}
            <div className="flex flex-col">
              <select
                id="payment_status"
                className="h-9 w-[150px] text-xs appearance-none px-2 py-1 border rounded-md"
                value={filters.payment_status || 'all'}
                onChange={(e) =>
                  handleFilterChange(
                    'payment_status',
                    e.target.value === 'all' ? undefined : e.target.value
                  )
                }
              >
                <option value="all">All Status</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {/* Visit ID filter */}
            <div className="flex flex-col">
              <Input
                id="visit"
                type="number"
                className="h-9 w-[120px] text-xs"
                placeholder="Visit ID"
                value={filters.visit || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'visit',
                    parseInt(e.target.value) || undefined
                  )
                }
              />
            </div>

            {/* Apply / Refresh */}
            <div className="flex flex-col">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-[12px] font-normal"
                onClick={handleRefresh}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Apply
              </Button>
            </div>
          </div>
        </div>

        {/* TABLE BODY */}
        <div className="py-4 md:py-6">
          <DataTable
            rows={procedureBills}
            isLoading={isLoading && hasLoadedOnce}
            columns={columns}
            getRowId={(bill: any) => bill.id}
            getRowLabel={(bill: any) =>
              `Bill ${bill.bill_number || bill.id} for ${
                bill.patient_name || '—'
              }`
            }
            onView={handleViewBill}
            onEdit={handleCollectPayment} // reuse edit slot as "Collect"
            // no delete yet
            renderMobileCard={renderMobileCard}
            emptyTitle="No procedure bills found"
            emptySubtitle="Try adjusting filters or search"
          />
        </div>

        {/* PAGINATION FOOTER */}
        {(next || previous) && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t px-4 py-4 md:px-6">
            <Button
              variant="outline"
              disabled={!previous}
              onClick={() =>
                handleFilterChange('page', (filters.page || 1) - 1)
              }
              className="sm:min-w-[100px]"
              size="sm"
            >
              Previous
            </Button>

            <span className="text-sm text-muted-foreground text-center">
              Page {filters.page || 1}
            </span>

            <Button
              variant="outline"
              disabled={!next}
              onClick={() =>
                handleFilterChange('page', (filters.page || 1) + 1)
              }
              className="sm:min-w-[100px]"
              size="sm"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

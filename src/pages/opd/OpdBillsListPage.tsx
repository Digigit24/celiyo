// src/pages/opd/OpdBillsListPage.tsx

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useOPDBills } from '@/hooks/useOPD';
import type {
  OPDBillListParams,
  PaymentStatus,
  OPDType,
} from '@/types/opd.types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw, Plus, Phone, Receipt, CalendarDays, Wallet } from 'lucide-react';

// our shared / reusable table
import { DataTable, DataTableColumn } from '@/components/DataTable';

// ---- formatting helpers ----------------------------------------------------

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

function StatusBadge({ status }: { status: PaymentStatus | string | undefined }) {
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

function TypeBadge({ opd_type }: { opd_type: OPDType | string | undefined }) {
  const map: Record<string, string> = {
    consultation: 'Consultation',
    follow_up: 'Follow Up',
    emergency: 'Emergency',
  };

  return (
    <Badge
      variant="outline"
      className="uppercase tracking-wide text-[10px] font-medium"
    >
      {map[opd_type || ''] || opd_type || '-'}
    </Badge>
  );
}

// ---- component -------------------------------------------------------------

export default function OpdBillsListPage() {
  // filters + debounced global search
  const [filters, setFilters] = useState<OPDBillListParams>({
    page: 1,
    payment_status: undefined,
    opd_type: undefined,
    search: '',
    bill_date: undefined,
  });

  const [searchText, setSearchText] = useState(filters.search || '');

  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchText, // backend should treat this as "search all fields"
        page: 1,
      }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const {
    opdBills,
    count,
    next,
    previous,
    isLoading,
    error,
    mutate,
  } = useOPDBills(filters);

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  useEffect(() => {
    if (!isLoading && !error) {
      setHasLoadedOnce(true);
    }
  }, [isLoading, error]);

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

  // actions
  const handleViewBill = useCallback((bill: any) => {
    console.log('view bill', bill.id);
    // open drawer / navigate / etc.
  }, []);

  const handleCollectPayment = useCallback((bill: any) => {
    console.log('collect payment for bill', bill.id);
    // open payment modal etc.
  }, []);

  // desktop columns config for DataTable
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
          </div>
        ),
      },
      {
        key: 'type',
        header: 'OPD Type',
        cell: (bill) => <TypeBadge opd_type={bill.opd_type} />,
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
        key: 'amount',
        header: 'Amount',
        cell: (bill) => (
          <div className="whitespace-nowrap">
            <div className="font-medium text-slate-900 leading-tight">
              {formatRupee(bill.total_amount)}
            </div>
          </div>
        ),
      },
      {
        key: 'paid_due',
        header: 'Paid / Due',
        cell: (bill) => (
          <div className="whitespace-nowrap text-xs leading-tight">
            <div className="text-slate-900 font-medium">
              Paid: {formatRupee(bill.paid_amount)}
            </div>
            <div className="text-slate-500">
              Due: {formatRupee(bill.due_amount)}
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

  // mobile card renderer for each bill
  const renderMobileCard = useCallback(
    (bill: any, actions: any) => {
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

              {/* opd type */}
              <div className="mt-2">
                <TypeBadge opd_type={bill.opd_type} />
              </div>
            </div>

            {/* quick view */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                actions.view && actions.view();
              }}
            >
              <Receipt className="h-4 w-4" />
            </Button>
          </div>

          {/* money block */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="text-xs leading-tight">
              <div className="text-slate-900 font-medium flex items-center gap-1">
                <Wallet className="h-3.5 w-3.5 text-slate-500" />
                <span>Total {formatRupee(bill.total_amount)}</span>
              </div>

              <div className="text-[11px] text-slate-700 mt-1 leading-tight">
                Paid: {formatRupee(bill.paid_amount)}
              </div>
              <div className="text-[11px] text-slate-500 leading-tight">
                Due: {formatRupee(bill.due_amount)}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 text-right">
              <StatusBadge status={bill.payment_status} />

              {actions.collect && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.collect();
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
    []
  );

  // wrap our feature actions into DataTable row actions
  function extraActionsForRow(bill: any) {
    // this shows up in the desktop row dropdown after "View" / "Edit"
    // we don't have edit for bills, but we DO have "Collect"
    return (
      <div
        className="text-[13px]"
        onClick={(e) => {
          e.stopPropagation();
          handleCollectPayment(bill);
        }}
      >
        Collect Payment
      </div>
    );
  }

  // initial load skeleton (before first data) - keep your UX
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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
          <h2 className="font-semibold mb-2">Error Loading OPD Bills</h2>
          <p>{(error as any)?.message || 'Failed to load OPD bills'}</p>
          <Button onClick={handleRefresh} className="mt-4" variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // main page
  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">
            OPD Bills
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage OPD consultation bills and payments
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

      {/* summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4 flex flex-col">
          <p className="text-sm text-muted-foreground">Total Bills</p>
          <p className="text-2xl font-bold">{count}</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col">
          <p className="text-sm text-green-600">Paid</p>
          <p className="text-2xl font-bold text-green-700">
            {opdBills.filter((b: any) => b.payment_status === 'paid').length}
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex flex-col">
          <p className="text-sm text-yellow-600">Partial</p>
          <p className="text-2xl font-bold text-yellow-700">
            {opdBills.filter((b: any) => b.payment_status === 'partial').length}
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col">
          <p className="text-sm text-red-600">Unpaid</p>
          <p className="text-2xl font-bold text-red-700">
            {opdBills.filter((b: any) => b.payment_status === 'unpaid').length}
          </p>
        </div>
      </div>

      {/* table card */}
      <div className="bg-white border rounded-lg">
        {/* header / filter bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between p-4 md:p-6 border-b">
          {/* left side */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold leading-none">Bills</h2>
              <Badge variant="outline" className="text-[11px] font-normal">
                {opdBills.length} shown / {count} total
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Page {filters.page || 1}
            </p>
          </div>

          {/* right side filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            {/* GLOBAL SEARCH */}
            <div className="flex flex-col">
              <Input
                id="search"
                className="h-9 w-[220px] md:w-[200px] lg:w-[220px]"
                placeholder="Search"
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

            {/* apply */}
            <div className="flex flex-col">
              <Label className="text-[11px] text-transparent mb-1 select-none">
                .
              </Label>
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

        {/* TABLE BODY (DataTable) */}
        <div className="py-4 md:py-6">
          <DataTable
            rows={opdBills}
            isLoading={isLoading && hasLoadedOnce}
            columns={columns}
            getRowId={(bill: any) => bill.id}
            getRowLabel={(bill: any) =>
              `Bill ${bill.bill_number || bill.id} for ${bill.patient_name || '—'}`
            }
            onView={handleViewBill}
            // we don't really "edit" an OPD bill, but you might reuse for 'Collect'
            onEdit={handleCollectPayment}
            // we are NOT passing onDelete here yet. you can add void/cancel flow later.
            renderMobileCard={(bill, actions) =>
              renderMobileCard(
                bill,
                {
                  ...actions,
                  collect: () => handleCollectPayment(bill),
                }
              )
            }
            emptyTitle="No bills found"
            emptySubtitle="Try adjusting filters or search"
            extraActions={(bill) => (
              <div
                className="text-[13px]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCollectPayment(bill);
                }}
              >
                Collect Payment
              </div>
            )}
          />
        </div>

        {/* pagination */}
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

      {/* raw json debug */}
      {/* <div className="border rounded-lg bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">
          OPD Bills (Raw API Response)
        </h2>
        <div className="bg-gray-50 p-4 rounded overflow-auto max-h-[400px] text-xs leading-relaxed">
          <pre className="whitespace-pre">
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
      </div> */}
    </div>
  );
}

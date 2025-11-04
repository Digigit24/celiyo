// src/pages/opd/OpdBillsListPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useOPDBills } from '@/hooks/useOPD';
import type { OPDBillListParams, PaymentStatus, OPDType } from '@/types/opd.types';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Icons
import {
  Plus,
  Search,
  RefreshCcw,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  FileText,
  User,
  Stethoscope,
  Download,
  Eye,
  Printer,
  X,
  Minus,
} from 'lucide-react';

// Custom Components
import { DataTable, DataTableColumn } from '@/components/DataTable';
import BillViewDrawer from '@/components/opd/BillViewDrawer'; // Changed from BillFormDrawer
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function OpdBillsListPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Simplified drawer state (view-only)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<number | null>(null);

  // State & Filters
  const [filters, setFilters] = useState<OPDBillListParams>({
    page: 1,
    payment_status: undefined,
    opd_type: undefined,
    search: '',
  });

  const { opdBills, count, next, previous, isLoading, error, mutate } = useOPDBills(filters);

  // Active filter chips
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleFilterChange = (key: keyof OPDBillListParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
      page: 1,
    }));
  };

  const handleRefresh = () => {
    mutate();
    toast.success('Bills refreshed');
  };

  // Filter chips management
  const addFilterChip = (type: string, value: string) => {
    setActiveFilters([...activeFilters, `${type}:${value}`]);
    setFilters({ ...filters, [type]: value, page: 1 });
  };

  const removeFilterChip = (chip: string) => {
    const [type] = chip.split(':');
    setActiveFilters(activeFilters.filter((f) => f !== chip));
    setFilters({ ...filters, [type]: undefined, page: 1 });
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setFilters({ page: 1, search: '' });
  };

  // Calculate statistics
  const statistics = {
    total: count,
    paid: opdBills.filter((b) => b.payment_status === 'paid').length,
    partial: opdBills.filter((b) => b.payment_status === 'partial').length,
    unpaid: opdBills.filter((b) => b.payment_status === 'unpaid').length,
    totalRevenue: opdBills.reduce((sum, b) => sum + parseFloat(b.total_amount), 0),
    receivedAmount: opdBills.reduce((sum, b) => sum + parseFloat(b.received_amount), 0),
    balanceAmount: opdBills.reduce((sum, b) => sum + parseFloat(b.balance_amount), 0),
  };

  // Simplified bill action handler (view-only)
  const handleViewBill = (bill: any) => {
    console.log('Opening bill for view:', bill.id);
    setSelectedBillId(bill.id);
    setDrawerOpen(true);
  };

  const handlePrintBill = (bill: any) => {
    toast.success(`Printing bill ${bill.bill_number}`);
  };

  const handleDownloadBill = (bill: any) => {
    toast.success(`Downloading bill ${bill.bill_number}`);
  };

  // DataTable columns
  const columns: DataTableColumn<any>[] = [
    {
      header: 'Bill Number',
      key: 'bill_number',
      cell: (bill) => (
        <div>
          <p className="font-mono text-sm font-medium">{bill.bill_number}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(bill.bill_date), 'MMM dd, yyyy')}
          </p>
        </div>
      ),
    },
    {
      header: 'Visit',
      key: 'visit_number',
      cell: (bill) => (
        <div>
          <p className="text-sm font-medium">{bill.visit_number}</p>
          <p className="text-xs text-muted-foreground">Visit #{bill.visit}</p>
        </div>
      ),
    },
    {
      header: 'Patient',
      key: 'patient_name',
      cell: (bill) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <span className="font-medium">{bill.patient_name}</span>
        </div>
      ),
    },
    {
      header: 'Doctor',
      key: 'doctor_name',
      cell: (bill) => (
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Dr. {bill.doctor_name}</span>
        </div>
      ),
    },
    {
      header: 'Type',
      key: 'opd_type',
      cell: (bill) => (
        <Badge
          variant="outline"
          className={
            bill.opd_type === 'emergency'
              ? 'bg-red-100 text-red-700 border-red-200'
              : bill.opd_type === 'follow_up'
              ? 'bg-blue-100 text-blue-700 border-blue-200'
              : 'bg-purple-100 text-purple-700 border-purple-200'
          }
        >
          {bill.opd_type === 'consultation' && 'Consultation'}
          {bill.opd_type === 'follow_up' && 'Follow Up'}
          {bill.opd_type === 'emergency' && 'Emergency'}
        </Badge>
      ),
    },
    {
      header: 'Amount',
      key: 'total_amount',
      cell: (bill) => (
        <div>
          <p className="font-semibold">₹{parseFloat(bill.total_amount).toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">
            Payable: ₹{parseFloat(bill.payable_amount).toFixed(2)}
          </p>
        </div>
      ),
    },
    {
      header: 'Paid',
      key: 'received_amount',
      cell: (bill) => (
        <div>
          <p className="font-medium text-green-600">₹{parseFloat(bill.received_amount).toFixed(2)}</p>
          {parseFloat(bill.balance_amount) > 0 && (
            <p className="text-xs text-red-600">
              Due: ₹{parseFloat(bill.balance_amount).toFixed(2)}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'payment_status',
      cell: (bill) => {
        const statusConfig = {
          paid: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
          partial: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Minus },
          unpaid: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
        };
        const config = statusConfig[bill.payment_status as PaymentStatus];
        const Icon = config.icon;
        return (
          <Badge variant="outline" className={config.color}>
            <Icon className="h-3 w-3 mr-1" />
            {bill.payment_status.charAt(0).toUpperCase() + bill.payment_status.slice(1)}
          </Badge>
        );
      },
    },
  ];

  // Mobile card renderer
  const renderMobileCard = (bill: any, actions: any) => (
    <>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-mono text-sm font-medium">{bill.bill_number}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(bill.bill_date), 'MMM dd, yyyy')}
          </p>
        </div>
        <Badge
          variant="outline"
          className={
            bill.payment_status === 'paid'
              ? 'bg-green-100 text-green-700 border-green-200'
              : bill.payment_status === 'partial'
              ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
              : 'bg-red-100 text-red-700 border-red-200'
          }
        >
          {bill.payment_status}
        </Badge>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium">{bill.patient_name}</p>
          <p className="text-xs text-muted-foreground">Visit: {bill.visit_number}</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Stethoscope className="h-4 w-4" />
          <span>Dr. {bill.doctor_name}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="text-sm font-semibold">₹{parseFloat(bill.total_amount).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Received</p>
            <p className="text-sm font-semibold text-green-600">
              ₹{parseFloat(bill.received_amount).toFixed(2)}
            </p>
          </div>
        </div>

        {parseFloat(bill.balance_amount) > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2">
            <p className="text-xs text-red-600 font-medium">
              Balance Due: ₹{parseFloat(bill.balance_amount).toFixed(2)}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {actions.view && (
            <Button size="sm" variant="outline" onClick={actions.view} className="flex-1">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePrintBill(bill)}
            className="flex-1"
          >
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
        </div>
      </div>
    </>
  );

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
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="border-b bg-background p-4 md:p-6 space-y-4">
        {/* Title & Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">OPD Bills</h1>
            <p className="text-sm text-muted-foreground">
              Manage OPD consultation bills and payments
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size={isMobile ? 'sm' : 'default'}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Total Bills
                </p>
                <p className="text-2xl font-bold mt-1">{statistics.total}</p>
              </div>
              <div className="h-10 w-10 bg-blue-200 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">Paid</p>
                <p className="text-2xl font-bold mt-1">{statistics.paid}</p>
                <p className="text-xs text-green-600 dark:text-green-400 font-mono mt-1">
                  ₹{statistics.receivedAmount.toFixed(2)}
                </p>
              </div>
              <div className="h-10 w-10 bg-green-200 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                  Partial
                </p>
                <p className="text-2xl font-bold mt-1">{statistics.partial}</p>
              </div>
              <div className="h-10 w-10 bg-yellow-200 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Minus className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">Unpaid</p>
                <p className="text-2xl font-bold mt-1">{statistics.unpaid}</p>
                <p className="text-xs text-red-600 dark:text-red-400 font-mono mt-1">
                  ₹{statistics.balanceAmount.toFixed(2)}
                </p>
              </div>
              <div className="h-10 w-10 bg-red-200 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Revenue Summary Banner */}
        <Card className="p-4 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-green-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">₹{statistics.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 text-right">
              <div>
                <p className="text-xs text-muted-foreground">Received</p>
                <p className="text-lg font-bold text-green-600">
                  ₹{statistics.receivedAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-lg font-bold text-red-600">
                  ₹{statistics.balanceAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by bill #, patient name, visit #..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={filters.payment_status || 'all'}
              onValueChange={(value) => handleFilterChange('payment_status', value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.opd_type || 'all'}
              onValueChange={(value) => handleFilterChange('opd_type', value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="follow_up">Follow Up</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeFilters.includes('payment_status:unpaid') ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                activeFilters.includes('payment_status:unpaid')
                  ? removeFilterChip('payment_status:unpaid')
                  : addFilterChip('payment_status', 'unpaid')
              }
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              Unpaid Only
            </Button>

            <Button
              variant={activeFilters.includes('payment_status:partial') ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                activeFilters.includes('payment_status:partial')
                  ? removeFilterChip('payment_status:partial')
                  : addFilterChip('payment_status', 'partial')
              }
            >
              <Minus className="h-3 w-3 mr-1" />
              Partial Only
            </Button>

            <Button
              variant={activeFilters.includes('opd_type:emergency') ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                activeFilters.includes('opd_type:emergency')
                  ? removeFilterChip('opd_type:emergency')
                  : addFilterChip('opd_type', 'emergency')
              }
            >
              Emergency Bills
            </Button>

            {activeFilters.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing <strong>{opdBills.length}</strong> of <strong>{count}</strong> bills
          </div>
        </div>
      </div>

      {/* Bills List */}
      <ScrollArea className="flex-1">
        <DataTable
          rows={opdBills}
          isLoading={isLoading}
          columns={columns}
          renderMobileCard={renderMobileCard}
          getRowId={(bill) => bill.id}
          getRowLabel={(bill) => bill.bill_number}
          onView={handleViewBill}
          extraActions={(bill) => (
            <>
              <DropdownMenuItem onClick={() => handlePrintBill(bill)}>
                <Printer className="h-4 w-4 mr-2" />
                Print Bill
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownloadBill(bill)}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </DropdownMenuItem>
            </>
          )}
          emptyTitle="No bills found"
          emptySubtitle="Start by creating a new OPD bill or adjust your filters"
        />
      </ScrollArea>

      {/* Pagination */}
      {(next || previous) && (
        <div className="border-t bg-background p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              disabled={!previous || isLoading}
              onClick={() => handleFilterChange('page', (filters.page || 1) - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground font-medium">
              Page {filters.page || 1}
            </span>
            <Button
              variant="outline"
              disabled={!next || isLoading}
              onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* View-Only Bill Drawer */}
      <BillViewDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        billId={selectedBillId}
      />
    </div>
  );
}
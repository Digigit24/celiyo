// src/components/opd/bill-drawer/BillViewContent.tsx
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Stethoscope, DollarSign, CreditCard, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { OPDBill } from '@/types/opd.types';

interface BillViewContentProps {
  bill: OPDBill;
}

export default function BillViewContent({ bill }: BillViewContentProps) {
  // Safely parse and calculate amounts
  const totalAmount = parseFloat(bill.total_amount || '0');
  const discountPercent = parseFloat(bill.discount_percent || '0');
  const discountAmount = parseFloat(bill.discount_amount || '0');
  const payableAmount = parseFloat(bill.payable_amount || '0');
  const receivedAmount = parseFloat(bill.received_amount || '0');
  const balanceAmount = parseFloat(bill.balance_amount || '0');

  // Safe date formatting function
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy hh:mm a');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      {/* Bill Header Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-4 w-4" />
          <h3 className="text-sm font-semibold">Bill Information</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Bill Number</Label>
            <p className="text-sm font-mono font-semibold mt-1">{bill.bill_number || 'N/A'}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Bill Date</Label>
            <p className="text-sm font-medium mt-1">
              {formatDate(bill.bill_date)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Visit Number</Label>
            <p className="text-sm font-medium mt-1">{bill.visit_number || 'N/A'}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Payment Status</Label>
            <div className="mt-1">
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
                {bill.payment_status ? bill.payment_status.toUpperCase() : 'UNKNOWN'}
              </Badge>
            </div>
          </div>
        </div>

        {bill.billed_by_name && (
          <div>
            <Label className="text-xs text-muted-foreground">Billed By</Label>
            <p className="text-sm font-medium mt-1">{bill.billed_by_name}</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Patient Information */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <h3 className="text-sm font-semibold">Patient Information</h3>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-base font-semibold">{bill.patient_name || 'Unknown Patient'}</p>
        </div>
      </div>

      <Separator />

      {/* Doctor Information */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Stethoscope className="h-4 w-4" />
          <h3 className="text-sm font-semibold">Doctor Information</h3>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-base font-semibold">
            {bill.doctor_name ? `Dr. ${bill.doctor_name}` : 'Not Assigned'}
          </p>
        </div>
      </div>

      <Separator />

      {/* Bill Type & Details */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Bill Details</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">OPD Type</Label>
            <div className="mt-1">
              <Badge variant="outline" className="text-sm">
                {bill.opd_type === 'consultation' && 'Consultation'}
                {bill.opd_type === 'follow_up' && 'Follow Up'}
                {bill.opd_type === 'emergency' && 'Emergency'}
                {!bill.opd_type && 'Not Specified'}
              </Badge>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Charge Type</Label>
            <div className="mt-1">
              <Badge variant="outline" className="text-sm">
                {bill.charge_type === 'first_visit' && 'First Visit'}
                {bill.charge_type === 'revisit' && 'Revisit'}
                {bill.charge_type === 'emergency' && 'Emergency'}
                {!bill.charge_type && 'Not Specified'}
              </Badge>
            </div>
          </div>
        </div>

        {bill.opd_subtype && (
          <div>
            <Label className="text-xs text-muted-foreground">OPD Subtype</Label>
            <p className="text-sm mt-1">{bill.opd_subtype}</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Diagnosis & Remarks */}
      {(bill.diagnosis || bill.remarks) && (
        <>
          <div className="space-y-3">
            {bill.diagnosis && (
              <div>
                <Label className="text-xs text-muted-foreground">Diagnosis</Label>
                <div className="bg-muted/50 rounded-lg p-3 mt-1">
                  <p className="text-sm whitespace-pre-wrap">{bill.diagnosis}</p>
                </div>
              </div>
            )}

            {bill.remarks && (
              <div>
                <Label className="text-xs text-muted-foreground">Remarks</Label>
                <div className="bg-muted/50 rounded-lg p-3 mt-1">
                  <p className="text-sm whitespace-pre-wrap">{bill.remarks}</p>
                </div>
              </div>
            )}
          </div>
          <Separator />
        </>
      )}

      {/* Billing Summary */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <DollarSign className="h-4 w-4" />
          <h3 className="text-sm font-semibold">Billing Summary</h3>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Amount</span>
            <span className="text-lg font-bold">₹{totalAmount.toFixed(2)}</span>
          </div>

          {discountAmount > 0 && (
            <>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Discount ({discountPercent.toFixed(2)}%)
                </span>
                <span className="text-sm font-semibold text-red-600">
                  - ₹{discountAmount.toFixed(2)}
                </span>
              </div>
            </>
          )}

          <Separator className="bg-blue-300 dark:bg-blue-800" />
          
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold">Payable Amount</span>
            <span className="text-xl font-bold text-blue-600">₹{payableAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Payment Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CreditCard className="h-4 w-4" />
          <h3 className="text-sm font-semibold">Payment Details</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Payment Mode</Label>
            <div className="mt-1">
              <Badge variant="outline" className="text-sm">
                {bill.payment_mode ? bill.payment_mode.toUpperCase() : 'NOT SPECIFIED'}
              </Badge>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Received Amount</Label>
            <p className="text-sm font-bold text-green-600 mt-1">
              ₹{receivedAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {bill.payment_details && (
          <div>
            <Label className="text-xs text-muted-foreground">Payment Reference</Label>
            <div className="bg-muted/50 rounded-lg p-3 mt-1">
              <p className="text-sm font-mono">{String(bill.payment_details)}</p>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Balance Amount */}
      <div
        className={`rounded-lg p-4 border-2 ${
          balanceAmount > 0
            ? 'bg-red-50 dark:bg-red-950/20 border-red-300'
            : 'bg-green-50 dark:bg-green-950/20 border-green-300'
        }`}
      >
        <div className="flex justify-between items-center">
          <div>
            <Label className="text-xs font-medium">Balance Amount</Label>
            {balanceAmount > 0 && (
              <p className="text-xs text-red-600 mt-1">Payment pending</p>
            )}
            {balanceAmount === 0 && (
              <p className="text-xs text-green-600 mt-1">Fully paid</p>
            )}
          </div>
          <span
            className={`text-2xl font-bold ${
              balanceAmount > 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            ₹{balanceAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Timestamps */}
      <div className="pt-4 border-t">
        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div>
            <Label className="text-xs text-muted-foreground">Created At</Label>
            <p className="text-xs mt-1">
              {formatDate(bill.created_at)}
            </p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Last Updated</Label>
            <p className="text-xs mt-1">
              {formatDate(bill.updated_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
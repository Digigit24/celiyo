// src/components/opd/bill-drawer/BillBasicInfo.tsx
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Stethoscope, DollarSign, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { createOPDBill, updateOPDBill } from '@/services/opd/opdBill.service';
import type { OPDBill, OPDBillCreateData, OPDBillUpdateData, OPDType, ChargeType, PaymentMode } from '@/types/opd.types';

export interface BillBasicInfoRef {
  submitForm: () => Promise<void>;
}

interface BillBasicInfoProps {
  bill: OPDBill | null;
  mode: 'view' | 'edit' | 'create';
  onSuccess?: () => void;
  onSaveStart?: () => void;
  onSaveEnd?: () => void;
}

const BillBasicInfo = forwardRef<BillBasicInfoRef, BillBasicInfoProps>(
  ({ bill, mode, onSuccess, onSaveStart, onSaveEnd }, ref) => {
    const isReadOnly = mode === 'view';

    const [formData, setFormData] = useState<Partial<OPDBillCreateData>>({
      visit: bill?.visit || 0,
      doctor: bill?.doctor || 0,
      opd_type: bill?.opd_type || 'consultation',
      opd_subtype: bill?.opd_subtype || '',
      charge_type: bill?.charge_type || 'first_visit',
      diagnosis: bill?.diagnosis || '',
      remarks: bill?.remarks || '',
      total_amount: bill?.total_amount || '0',
      discount_percent: bill?.discount_percent || '0',
      payment_mode: bill?.payment_mode || 'cash',
      payment_details: bill?.payment_details || '',
      received_amount: bill?.received_amount || '0',
    });

    useEffect(() => {
      if (bill) {
        setFormData({
          visit: bill.visit,
          doctor: bill.doctor,
          opd_type: bill.opd_type,
          opd_subtype: bill.opd_subtype,
          charge_type: bill.charge_type,
          diagnosis: bill.diagnosis,
          remarks: bill.remarks,
          total_amount: bill.total_amount,
          discount_percent: bill.discount_percent,
          payment_mode: bill.payment_mode,
          payment_details: bill.payment_details,
          received_amount: bill.received_amount,
        });
      }
    }, [bill]);

    const handleSubmit = async () => {
      onSaveStart?.();
      try {
        if (mode === 'create') {
          await createOPDBill(formData as OPDBillCreateData);
          toast.success('Bill created successfully');
        } else if (mode === 'edit' && bill) {
          await updateOPDBill(bill.id, formData as OPDBillUpdateData);
          toast.success('Bill updated successfully');
        }
        onSuccess?.();
      } catch (error: any) {
        toast.error('Failed to save bill', {
          description: error?.response?.data?.message || error?.message || 'Please try again',
        });
        throw error;
      } finally {
        onSaveEnd?.();
      }
    };

    useImperativeHandle(ref, () => ({
      submitForm: handleSubmit,
    }));

    const handleChange = (field: keyof OPDBillCreateData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Calculate payable and balance amounts
    const totalAmount = parseFloat(formData.total_amount || '0');
    const discountPercent = parseFloat(formData.discount_percent || '0');
    const receivedAmount = parseFloat(formData.received_amount || '0');
    const discountAmount = (totalAmount * discountPercent) / 100;
    const payableAmount = totalAmount - discountAmount;
    const balanceAmount = payableAmount - receivedAmount;

    return (
      <div className="space-y-6">
        {/* Bill Info Section (View Mode Only) */}
        {bill && mode === 'view' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Bill Number</Label>
                <p className="text-sm font-mono font-medium mt-1">{bill.bill_number}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Bill Date</Label>
                <p className="text-sm font-medium mt-1">
                  {format(new Date(bill.bill_date), 'MMM dd, yyyy hh:mm a')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Visit Number</Label>
                <p className="text-sm font-medium mt-1">{bill.visit_number}</p>
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
                    {bill.payment_status.toUpperCase()}
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

            <Separator />
          </div>
        )}

        {/* Patient Info (View Mode) */}
        {bill && mode === 'view' && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Patient Information
            </h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium">{bill.patient_name}</p>
            </div>
          </div>
        )}

        {/* Doctor Info (View Mode) */}
        {bill && mode === 'view' && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Doctor Information
            </h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium">Dr. {bill.doctor_name}</p>
            </div>
          </div>
        )}

        {/* Bill Type & Charge Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="opd_type">OPD Type *</Label>
            {isReadOnly ? (
              <div className="bg-muted/50 rounded-lg px-3 py-2">
                <Badge variant="outline">
                  {formData.opd_type === 'consultation' && 'Consultation'}
                  {formData.opd_type === 'follow_up' && 'Follow Up'}
                  {formData.opd_type === 'emergency' && 'Emergency'}
                </Badge>
              </div>
            ) : (
              <Select
                value={formData.opd_type}
                onValueChange={(value: OPDType) => handleChange('opd_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="charge_type">Charge Type *</Label>
            {isReadOnly ? (
              <div className="bg-muted/50 rounded-lg px-3 py-2">
                <Badge variant="outline">
                  {formData.charge_type === 'first_visit' && 'First Visit'}
                  {formData.charge_type === 'revisit' && 'Revisit'}
                  {formData.charge_type === 'emergency' && 'Emergency'}
                </Badge>
              </div>
            ) : (
              <Select
                value={formData.charge_type}
                onValueChange={(value: ChargeType) => handleChange('charge_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first_visit">First Visit</SelectItem>
                  <SelectItem value="revisit">Revisit</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* OPD Subtype */}
        <div className="space-y-2">
          <Label htmlFor="opd_subtype">OPD Subtype</Label>
          {isReadOnly ? (
            <div className="bg-muted/50 rounded-lg px-3 py-2 min-h-[40px]">
              <p className="text-sm">{formData.opd_subtype || 'Not specified'}</p>
            </div>
          ) : (
            <Input
              id="opd_subtype"
              value={formData.opd_subtype}
              onChange={(e) => handleChange('opd_subtype', e.target.value)}
              placeholder="e.g., General Checkup, Specialist Consultation"
            />
          )}
        </div>

        {/* Diagnosis */}
        <div className="space-y-2">
          <Label htmlFor="diagnosis">Diagnosis</Label>
          {isReadOnly ? (
            <div className="bg-muted/50 rounded-lg px-3 py-2 min-h-[60px]">
              <p className="text-sm">{formData.diagnosis || 'No diagnosis recorded'}</p>
            </div>
          ) : (
            <Textarea
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => handleChange('diagnosis', e.target.value)}
              rows={3}
              placeholder="Enter diagnosis..."
            />
          )}
        </div>

        {/* Remarks */}
        <div className="space-y-2">
          <Label htmlFor="remarks">Remarks</Label>
          {isReadOnly ? (
            <div className="bg-muted/50 rounded-lg px-3 py-2 min-h-[60px]">
              <p className="text-sm">{formData.remarks || 'No remarks'}</p>
            </div>
          ) : (
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => handleChange('remarks', e.target.value)}
              rows={2}
              placeholder="Enter remarks..."
            />
          )}
        </div>

        <Separator />

        {/* Billing Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Billing Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_amount">Total Amount (₹) *</Label>
              {isReadOnly ? (
                <div className="bg-muted/50 rounded-lg px-3 py-2">
                  <p className="text-sm font-semibold">₹{parseFloat(formData.total_amount || '0').toFixed(2)}</p>
                </div>
              ) : (
                <Input
                  id="total_amount"
                  type="number"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) => handleChange('total_amount', e.target.value)}
                  required
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_percent">Discount (%)</Label>
              {isReadOnly ? (
                <div className="bg-muted/50 rounded-lg px-3 py-2">
                  <p className="text-sm">{formData.discount_percent || '0'}%</p>
                </div>
              ) : (
                <Input
                  id="discount_percent"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.discount_percent}
                  onChange={(e) => handleChange('discount_percent', e.target.value)}
                />
              )}
            </div>
          </div>

          {/* Calculated Amounts */}
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 space-y-2">
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount Amount:</span>
                <span className="font-medium text-red-600">- ₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="text-muted-foreground font-semibold">Payable Amount:</span>
              <span className="font-bold">₹{payableAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Payment Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_mode">Payment Mode</Label>
              {isReadOnly ? (
                <div className="bg-muted/50 rounded-lg px-3 py-2">
                  <Badge variant="outline">{formData.payment_mode?.toUpperCase()}</Badge>
                </div>
              ) : (
                <Select
                  value={formData.payment_mode}
                  onValueChange={(value: PaymentMode) => handleChange('payment_mode', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="multiple">Multiple</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="received_amount">Received Amount (₹)</Label>
              {isReadOnly ? (
                <div className="bg-muted/50 rounded-lg px-3 py-2">
                  <p className="text-sm font-semibold text-green-600">
                    ₹{parseFloat(formData.received_amount || '0').toFixed(2)}
                  </p>
                </div>
              ) : (
                <Input
                  id="received_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.received_amount}
                  onChange={(e) => handleChange('received_amount', e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_details">Payment Details / Reference</Label>
            {isReadOnly ? (
              <div className="bg-muted/50 rounded-lg px-3 py-2 min-h-[60px]">
                <p className="text-sm">{formData.payment_details || 'No payment details'}</p>
              </div>
            ) : (
              <Textarea
                id="payment_details"
                value={formData.payment_details}
                onChange={(e) => handleChange('payment_details', e.target.value)}
                rows={2}
                placeholder="Transaction ID, reference number, etc..."
              />
            )}
          </div>

          {/* Balance Amount */}
          <div
            className={`rounded-lg p-4 ${
              balanceAmount > 0
                ? 'bg-red-50 dark:bg-red-950/20 border border-red-200'
                : 'bg-green-50 dark:bg-green-950/20 border border-green-200'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Balance Amount:</span>
              <span
                className={`text-lg font-bold ${
                  balanceAmount > 0 ? 'text-red-600' : 'text-green-600'
                }`}
              >
                ₹{balanceAmount.toFixed(2)}
              </span>
            </div>
            {balanceAmount > 0 && (
              <p className="text-xs text-red-600 mt-1">Payment pending</p>
            )}
            {balanceAmount === 0 && (
              <p className="text-xs text-green-600 mt-1">Fully paid</p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

BillBasicInfo.displayName = 'BillBasicInfo';

export default BillBasicInfo;
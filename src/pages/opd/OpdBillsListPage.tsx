// src/components/billing/BillDrawer.tsx

import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// you'll likely replace these with real service hooks
// e.g. getOPDBillById, createOPDBill, updateOPDBill, etc.
async function mockFetchBillById(id: number) {
  // placeholder shape
  return {
    id,
    bill_number: `BILL-${id}`,
    patient_name: 'John Doe',
    patient_phone: '9876543210',
    bill_date: '2025-01-01',
    total_amount: '1500.00',
    paid_amount: '500.00',
    due_amount: '1000.00',
    opd_type: 'consultation',
    payment_status: 'partial',
    line_items: [
      { desc: 'Consultation', amount: 1000 },
      { desc: 'Procedure', amount: 500 },
    ],
  };
}

interface BillDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billId: number | null;
  mode: 'create' | 'view' | 'edit';
  onSuccess?: () => void;
}

export default function BillDrawer({
  open,
  onOpenChange,
  billId,
  mode,
  onSuccess,
}: BillDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [billData, setBillData] = useState<any | null>(null);

  // load bill when opening in view/edit mode
  useEffect(() => {
    if (open && billId && mode !== 'create') {
      loadBill();
    }
    if (open && mode === 'create') {
      // reset for fresh bill
      setBillData({
        bill_date: new Date().toISOString().split('T')[0],
        patient_name: '',
        patient_phone: '',
        opd_type: 'consultation',
        line_items: [],
        total_amount: '0.00',
        paid_amount: '0.00',
        due_amount: '0.00',
        payment_status: 'unpaid',
      });
    }
  }, [open, billId, mode]);

  async function loadBill() {
    if (!billId) return;
    try {
      setLoading(true);
      const data = await mockFetchBillById(billId);
      setBillData(data);
    } catch (err: any) {
      toast.error('Failed to load bill');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    onOpenChange(false);
  }

  // TODO: wire to real create / update API
  async function handleSaveOrUpdate() {
    try {
      toast.success(
        mode === 'create' ? 'Bill created' : 'Bill updated'
      );
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error('Failed to save bill');
    }
  }

  const title =
    mode === 'create'
      ? 'Create OPD Bill'
      : mode === 'edit'
      ? `Edit Bill #${billData?.bill_number || billId || ''}`
      : `Bill Details #${billData?.bill_number || billId || ''}`;

  const canEdit = mode === 'create' || mode === 'edit';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader className="border-b pb-4 mb-4">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {mode === 'create'
              ? 'Generate and record a new OPD bill.'
              : 'View billing details, payments, and patient info.'}
          </SheetDescription>
        </SheetHeader>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : billData ? (
            <div className="space-y-4 text-sm">
              {/* Patient Section */}
              <div className="border rounded-lg p-4">
                <div className="text-xs uppercase text-muted-foreground font-medium mb-2">
                  Patient
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-base leading-tight">
                    {billData.patient_name || '—'}
                  </div>
                  <div className="text-muted-foreground text-[12px] leading-tight">
                    {billData.patient_phone || '—'}
                  </div>
                </div>
              </div>

              {/* Billing Meta */}
              <div className="border rounded-lg p-4">
                <div className="text-xs uppercase text-muted-foreground font-medium mb-2">
                  Bill Info
                </div>
                <div className="grid grid-cols-2 gap-3 text-[13px] leading-tight">
                  <div>
                    <div className="text-muted-foreground text-[11px]">
                      Bill Date
                    </div>
                    <div className="font-medium">
                      {billData.bill_date || '—'}
                    </div>
                  </div>

                  <div>
                    <div className="text-muted-foreground text-[11px]">
                      Type
                    </div>
                    <div className="font-medium capitalize">
                      {billData.opd_type || '—'}
                    </div>
                  </div>

                  <div>
                    <div className="text-muted-foreground text-[11px]">
                      Total
                    </div>
                    <div className="font-medium">
                      ₹{billData.total_amount || '0.00'}
                    </div>
                  </div>

                  <div>
                    <div className="text-muted-foreground text-[11px]">
                      Paid
                    </div>
                    <div className="font-medium">
                      ₹{billData.paid_amount || '0.00'}
                    </div>
                  </div>

                  <div>
                    <div className="text-muted-foreground text-[11px]">
                      Due
                    </div>
                    <div className="font-medium text-red-600">
                      ₹{billData.due_amount || '0.00'}
                    </div>
                  </div>

                  <div>
                    <div className="text-muted-foreground text-[11px]">
                      Status
                    </div>
                    <div className="font-medium capitalize">
                      {billData.payment_status || 'unpaid'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="border rounded-lg p-4">
                <div className="text-xs uppercase text-muted-foreground font-medium mb-2 flex items-center justify-between">
                  <span>Items</span>
                  {canEdit && (
                    <Button
                      size="sm"
                      className="h-6 px-2 text-[11px]"
                      variant="outline"
                      onClick={() => {
                        // placeholder for "Add Item"
                        toast.info('Add item clicked');
                      }}
                    >
                      + Add Item
                    </Button>
                  )}
                </div>

                {billData.line_items && billData.line_items.length > 0 ? (
                  <div className="space-y-2 text-[13px]">
                    {billData.line_items.map(
                      (item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between border rounded p-2"
                        >
                          <div className="flex-1 pr-2">
                            <div className="font-medium leading-tight">
                              {item.desc || 'Untitled'}
                            </div>
                            <div className="text-[11px] text-muted-foreground leading-tight">
                              ₹{item.amount?.toFixed?.(2) ?? item.amount}
                            </div>
                          </div>

                          {canEdit && (
                            <Button
                              size="sm"
                              className="h-6 px-2 text-[11px]"
                              variant="ghost"
                              onClick={() => {
                                toast.info('Edit item clicked');
                              }}
                            >
                              Edit
                            </Button>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-[12px] text-muted-foreground">
                    No items yet.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-8">
              No bill data
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="border-t pt-4 mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>

          {canEdit && (
            <Button onClick={handleSaveOrUpdate}>
              {mode === 'create' ? 'Save Bill' : 'Update Bill'}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// src/components/opd/visit-drawer/VisitBillingTab.tsx
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Plus, Receipt } from 'lucide-react';
import type { Visit } from '@/types/opd.types';

interface VisitBillingTabProps {
  visitId: number;
  visit: Visit;
  readOnly: boolean;
  onUpdate?: () => void;
}

export default function VisitBillingTab({
  visitId,
  visit,
  readOnly,
  onUpdate,
}: VisitBillingTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Billing Information</h3>
        </div>
        {!readOnly && (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Bill
          </Button>
        )}
      </div>

      {/* Payment Summary Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Payment Status</p>
            <Badge
              variant="outline"
              className={
                visit.payment_status === 'paid'
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : visit.payment_status === 'partial'
                  ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                  : 'bg-red-100 text-red-700 border-red-200'
              }
            >
              {visit.payment_status.toUpperCase()}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
            <p className="text-2xl font-bold">₹{visit.total_amount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Balance</p>
            <p className="text-2xl font-bold text-red-600">₹{visit.balance_amount}</p>
          </div>
        </div>
      </Card>

      {/* Bills List */}
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No bills generated yet</p>
          {!readOnly && (
            <p className="text-xs mt-1">Click "Create Bill" to generate a consultation or procedure bill</p>
          )}
        </div>
      </Card>
    </div>
  );
}
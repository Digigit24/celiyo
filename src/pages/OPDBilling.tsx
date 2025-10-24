// src/pages/OPDBilling.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useVisit, useOPDBills } from '@/hooks/useOPD';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  User, 
  Receipt, 
  CreditCard, 
  DollarSign,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function OPDBilling() {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const { visit, isLoading: visitLoading, error: visitError } = useVisit(Number(visitId));
  const { opdBills, isLoading: billsLoading } = useOPDBills({ visit: Number(visitId) });

  const isLoading = visitLoading || billsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading billing information...</p>
        </div>
      </div>
    );
  }

  if (visitError || !visit) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Billing</CardTitle>
            <CardDescription>
              {visitError?.message || 'Visit not found'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/opd/visits')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Visits
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const existingBill = opdBills && opdBills.length > 0 ? opdBills[0] : null;
  const hasBill = !!existingBill;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate(`/consultation/${visitId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">OPD Billing</h1>
            <p className="text-muted-foreground">
              Visit #{visit.visit_number}
            </p>
          </div>
        </div>
        <Badge variant={visit.payment_status === 'paid' ? 'default' : 'destructive'}>
          {visit.payment_status}
        </Badge>
      </div>

      <Separator />

      {/* Patient Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Patient Name</p>
              <p className="font-semibold">{visit.patient_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Patient ID</p>
              <p className="font-mono text-sm">{visit.patient_id || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Doctor</p>
              <p className="font-semibold">{visit.doctor_name || 'Not assigned'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              ₹{visit.total_amount || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              ₹{visit.paid_amount || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Balance Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-5 w-5" />
              ₹{visit.balance_amount || '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Existing Bill or Create New */}
      {hasBill ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Existing Bill
            </CardTitle>
            <CardDescription>
              Bill #{existingBill.bill_number}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Bill Date</p>
                <p className="font-mono text-sm">
                  {format(new Date(existingBill.bill_date), 'PP')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">OPD Type</p>
                <Badge variant="outline" className="capitalize">
                  {existingBill.opd_type}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Mode</p>
                <Badge variant="outline" className="capitalize">
                  {existingBill.payment_mode}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <Badge 
                  variant={existingBill.payment_status === 'paid' ? 'default' : 'destructive'}
                  className="capitalize"
                >
                  {existingBill.payment_status}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-semibold">₹{existingBill.total_amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount:</span>
                <span className="text-green-600">-₹{existingBill.discount_amount}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Payable Amount:</span>
                <span>₹{existingBill.payable_amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Received:</span>
                <span className="text-green-600">₹{existingBill.received_amount}</span>
              </div>
              <div className="flex justify-between text-orange-600">
                <span>Balance:</span>
                <span className="font-semibold">₹{existingBill.balance_amount}</span>
              </div>
            </div>

            {existingBill.diagnosis && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Diagnosis</p>
                  <p className="text-sm">{existingBill.diagnosis}</p>
                </div>
              </>
            )}

            {existingBill.remarks && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Remarks</p>
                <p className="text-sm">{existingBill.remarks}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Create OPD Bill
            </CardTitle>
            <CardDescription>
              No bill has been created for this visit yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>OPD bill creation form will be implemented here</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Recording */}
      {hasBill && existingBill.payment_status !== 'paid' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Record Payment
            </CardTitle>
            <CardDescription>
              Record additional payment for this bill
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Payment recording form will be implemented here</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3 justify-between">
            <Button 
              variant="outline"
              onClick={() => navigate(`/consultation/${visitId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Consultation
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/opd/visits')}
              >
                Back to Visits
              </Button>
              {hasBill && (
                <Button variant="default">
                  <Receipt className="mr-2 h-4 w-4" />
                  Print Bill
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
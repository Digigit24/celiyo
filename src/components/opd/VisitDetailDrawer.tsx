// src/components/opd/VisitDetailDrawer.tsx
import { useEffect, useState } from 'react';
import { useVisit, useUpdateVisit } from '@/hooks/useOPD';
import type { Visit, VisitStatus } from '@/types/opd.types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  User,
  Stethoscope,
  Clock,
  CreditCard,
  FileText,
  Activity,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface VisitDetailDrawerProps {
  visitId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function VisitDetailDrawer({
  visitId,
  open,
  onOpenChange,
  onSuccess,
}: VisitDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { visit, isLoading, mutate, error } = useVisit(visitId);
  const { updateVisit, isUpdating } = useUpdateVisit(visitId || 0);

  useEffect(() => {
    if (open && visitId) {
      setActiveTab('overview');
    }
  }, [open, visitId]);

  const handleStatusChange = async (newStatus: VisitStatus) => {
    if (!visitId) return;

    try {
      await updateVisit({ status: newStatus });
      toast.success(`Visit status updated to ${newStatus}`);
      mutate();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update visit status');
    }
  };

  const getStatusConfig = (status: VisitStatus) => {
    const configs = {
      waiting: {
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Clock,
        label: 'Waiting',
      },
      called: {
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        icon: AlertCircle,
        label: 'Called',
      },
      in_consultation: {
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: Stethoscope,
        label: 'In Consultation',
      },
      completed: {
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle2,
        label: 'Completed',
      },
      cancelled: {
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: XCircle,
        label: 'Cancelled',
      },
      no_show: {
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: XCircle,
        label: 'No Show',
      },
    };

    return configs[status] || configs.waiting;
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
    } catch {
      return dateString;
    }
  };

  if (!open) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !visit ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Visit not found</p>
          </div>
        ) : (
          <>
            <SheetHeader className="mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <SheetTitle className="text-2xl">
                    {visit.patient_details?.full_name || visit.patient_name}
                  </SheetTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Visit #{visit.visit_number}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={getStatusConfig(visit.status).color}
                >
                  {getStatusConfig(visit.status).label}
                </Badge>
              </div>
            </SheetHeader>

            {/* Quick Actions */}
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('called')}
                  disabled={isUpdating || visit.status === 'called'}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Call Patient
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('in_consultation')}
                  disabled={isUpdating || visit.status === 'in_consultation'}
                >
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Start Consultation
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('completed')}
                  disabled={isUpdating || visit.status === 'completed'}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Visit
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="patient">Patient</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Visit Information */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Visit Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Visit Number</span>
                      <span className="text-sm font-medium font-mono">{visit.visit_number}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Visit Date</span>
                      <span className="text-sm font-medium">{visit.visit_date}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Visit Type</span>
                      <Badge variant="outline">
                        {visit.visit_type === 'new' && 'New'}
                        {visit.visit_type === 'follow_up' && 'Follow-up'}
                        {visit.visit_type === 'emergency' && 'Emergency'}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Entry Time</span>
                      <span className="text-sm font-medium">{formatDateTime(visit.entry_time)}</span>
                    </div>
                    {visit.consultation_start_time && (
                      <>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Consultation Start</span>
                          <span className="text-sm font-medium">
                            {formatDateTime(visit.consultation_start_time)}
                          </span>
                        </div>
                      </>
                    )}
                    {visit.consultation_end_time && (
                      <>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Consultation End</span>
                          <span className="text-sm font-medium">
                            {formatDateTime(visit.consultation_end_time)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </Card>

                {/* Doctor Information */}
                {visit.doctor_details && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" />
                      Doctor Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Doctor</span>
                        <span className="text-sm font-medium">
                          Dr. {visit.doctor_details.full_name}
                        </span>
                      </div>
                      {visit.doctor_details.specialties?.length > 0 && (
                        <>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Specialties</span>
                            <div className="flex flex-wrap gap-1 justify-end">
                              {visit.doctor_details.specialties.map((specialty, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Consultation Fee</span>
                        <span className="text-sm font-medium">₹{visit.doctor_details.consultation_fee}</span>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Payment Information */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Payment Status</span>
                      <Badge
                        variant="outline"
                        className={
                          visit.payment_status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : visit.payment_status === 'partial'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }
                      >
                        {visit.payment_status}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Amount</span>
                      <span className="text-sm font-medium">₹{visit.total_amount}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Paid Amount</span>
                      <span className="text-sm font-medium">₹{visit.paid_amount}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Balance</span>
                      <span className="text-sm font-medium text-red-600">₹{visit.balance_amount}</span>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Patient Tab */}
              <TabsContent value="patient" className="mt-6 space-y-6">
                {visit.patient_details && (
                  <>
                    <Card className="p-4">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Patient Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Patient ID</span>
                          <span className="text-sm font-medium font-mono">
                            {visit.patient_details.patient_id}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Full Name</span>
                          <span className="text-sm font-medium">{visit.patient_details.full_name}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Age / Gender</span>
                          <span className="text-sm font-medium">
                            {visit.patient_details.age}y, {visit.patient_details.gender}
                          </span>
                        </div>
                        {visit.patient_details.blood_group && (
                          <>
                            <Separator />
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Blood Group</span>
                              <Badge variant="outline" className="text-rose-600 border-rose-200">
                                {visit.patient_details.blood_group}
                              </Badge>
                            </div>
                          </>
                        )}
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Mobile</span>
                          <span className="text-sm font-medium flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {visit.patient_details.mobile}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </>
                )}
              </TabsContent>

              {/* Billing Tab */}
              <TabsContent value="billing" className="mt-6">
                <Card className="p-4">
                  <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Billing Information</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Detailed billing coming soon
                    </p>
                    <Button>Generate Bill</Button>
                  </div>
                </Card>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="mt-6">
                <Card className="p-4">
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Visit History</h3>
                    <p className="text-sm text-muted-foreground">
                      No history available for this visit
                    </p>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
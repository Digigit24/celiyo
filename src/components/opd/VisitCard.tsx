// src/components/opd/VisitCard.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Visit, VisitStatus } from '@/types/opd.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Clock,
  User,
  Stethoscope,
  MoreVertical,
  Phone,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useUpdateVisit } from '@/hooks/useOPD';
import { toast } from 'sonner';

interface VisitCardProps {
  visit: Visit;
  onClick: () => void;
  onStatusChange?: () => void;
}

export default function VisitCard({ visit, onClick, onStatusChange }: VisitCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateVisit } = useUpdateVisit(visit.id);
  const navigate = useNavigate();

  const getStatusConfig = (status: VisitStatus) => {
    const configs = {
      waiting: {
        color:
          'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
        icon: Clock,
        label: 'Waiting',
      },
      called: {
        color:
          'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800',
        icon: AlertCircle,
        label: 'Called',
      },
      in_consultation: {
        color:
          'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800',
        icon: Stethoscope,
        label: 'In Consultation',
      },
      completed: {
        color:
          'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
        icon: CheckCircle2,
        label: 'Completed',
      },
      cancelled: {
        color:
          'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
        icon: XCircle,
        label: 'Cancelled',
      },
      no_show: {
        color:
          'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800',
        icon: XCircle,
        label: 'No Show',
      },
    } as const;

    return configs[status] || configs.waiting;
  };

  const getPaymentStatusConfig = (status: string) => {
    const configs = {
      paid: {
        color: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
        label: 'Paid',
      },
      partial: {
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400',
        label: 'Partial',
      },
      unpaid: {
        color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
        label: 'Unpaid',
      },
    } as const;

    return configs[status as keyof typeof configs] || configs.unpaid;
  };

  const getVisitTypeConfig = (type: string) => {
    const configs = {
      new: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400', label: 'New' },
      follow_up: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400', label: 'Follow-up' },
      emergency: { color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400', label: 'Emergency' },
    } as const;

    return configs[type as keyof typeof configs] || configs.new;
  };

  const handleStatusChange = async (newStatus: VisitStatus) => {
    setIsUpdating(true);
    try {
      await updateVisit({ status: newStatus });
      toast.success(`Visit status updated to ${newStatus}`);
      onStatusChange?.();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update visit status');
    } finally {
      setIsUpdating(false);
    }
  };

  const goToConsultation = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/consultation/${visit.id}`); // or navigate(`/consultation?visitId=${visit.id}`)
  };

  const goToOPDBilling = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/opdbilling/${visit.id}`); // or navigate(`/opdbilling?visitId=${visit.id}`)
  };

  const statusConfig = getStatusConfig(visit.status);
  const paymentConfig = getPaymentStatusConfig(visit.payment_status);
  const visitTypeConfig = getVisitTypeConfig(visit.visit_type);
  const StatusIcon = statusConfig.icon;

  const waitingTime = visit.entry_time
    ? formatDistanceToNow(new Date(visit.entry_time), { addSuffix: true })
    : null;

  return (
    <div
      className="bg-card border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Patient Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-3">
            {/* Avatar */}
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>

            {/* Patient Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base truncate">
                  {visit.patient_details?.full_name || visit.patient_name || 'Unknown Patient'}
                </h3>
                <Badge variant="outline" className={statusConfig.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{visit.visit_number}</span>
                <span>•</span>
                <span>{visit.patient_details?.patient_id || visit.patient_id}</span>
                {visit.patient_details?.age && (
                  <>
                    <span>•</span>
                    <span>
                      {visit.patient_details.age}y, {visit.patient_details.gender}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Visit Details */}
          <div className="space-y-2">
            {/* Doctor */}
            {(visit.doctor_details || visit.doctor_name) && (
              <div className="flex items-center gap-2 text-sm">
                <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Dr. {visit.doctor_details?.full_name || visit.doctor_name}</span>
              </div>
            )}

            {/* Time */}
            {waitingTime && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{waitingTime}</span>
              </div>
            )}

            {/* Contact */}
            {visit.patient_details?.mobile && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{visit.patient_details.mobile}</span>
              </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant="outline" className={visitTypeConfig.color}>
                {visitTypeConfig.label}
              </Badge>
              <Badge variant="outline" className={paymentConfig.color}>
                <CreditCard className="h-3 w-3 mr-1" />
                {paymentConfig.label}
              </Badge>
              {visit.is_follow_up && (
                <Badge
                  variant="outline"
                  className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400"
                >
                  Follow-up
                </Badge>
              )}
            </div>

            {/* Primary Actions */}
            <div className="flex flex-wrap gap-2 pt-3">
              <Button size="sm" onClick={goToConsultation} disabled={isUpdating} aria-label="Start Consultation">
                <Stethoscope className="h-4 w-4 mr-2" />
                Start Consultation
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={goToOPDBilling}
                disabled={isUpdating}
                aria-label="Go to OPD Billing"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                OPD Billing
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Status Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={isUpdating}
              aria-label="Open visit actions"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange('waiting'); }} disabled={visit.status === 'waiting'}>
              <Clock className="h-4 w-4 mr-2" />
              Mark as Waiting
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange('called'); }} disabled={visit.status === 'called'}>
              <AlertCircle className="h-4 w-4 mr-2" />
              Call Patient
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange('in_consultation'); }} disabled={visit.status === 'in_consultation'}>
              <Stethoscope className="h-4 w-4 mr-2" />
              Start Consultation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange('completed'); }} disabled={visit.status === 'completed'}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete Visit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange('cancelled'); }} className="text-destructive">
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Visit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

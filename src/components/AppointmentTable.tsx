// src/components/AppointmentTable.tsx

import * as React from 'react';
import { DataTable, DataTableColumn } from '@/components/DataTable';
import type { AppointmentList } from '@/types/appointment.types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Clock, Calendar, User, Stethoscope, IndianRupee, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { deleteAppointment } from '@/services/appointment.service';

// util: format a date or fallback
function formatDate(value?: string | null) {
  if (!value) return '-';
  try {
    return format(new Date(value), 'dd MMM yyyy');
  } catch {
    return '-';
  }
}

// util: format time
function formatTime(value?: string | null) {
  if (!value) return '-';
  try {
    // Assuming value is in HH:MM:SS format
    const [hours, minutes] = value.split(':');
    return `${hours}:${minutes}`;
  } catch {
    return value;
  }
}

// util: format price
function formatPrice(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `₹${num.toFixed(2)}`;
}

// util: get status color
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    checked_in: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    no_show: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

// util: get priority color
function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
}

export interface AppointmentTableProps {
  appointments: AppointmentList[];
  isLoading: boolean;
  onView: (appointment: AppointmentList) => void;
  onEdit: (appointment: AppointmentList) => void;
  onRefresh: () => void;
}

export default function AppointmentTable({
  appointments,
  isLoading,
  onView,
  onEdit,
  onRefresh,
}: AppointmentTableProps) {
  //
  // 1. Define table columns for DESKTOP view
  //
  const columns = React.useMemo<DataTableColumn<AppointmentList>[]>(() => {
    return [
      {
        key: 'appointment',
        header: 'Appointment Details',
        cell: (apt) => (
          <div>
            <div className="font-medium">{apt.appointment_id}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(apt.appointment_date)}</span>
              <span>•</span>
              <Clock className="h-3 w-3" />
              <span>{formatTime(apt.appointment_time)}</span>
            </div>
          </div>
        ),
      },
      {
        key: 'patient',
        header: 'Patient',
        cell: (apt) => (
          <div>
            <div className="font-medium">{apt.patient.full_name}</div>
            <div className="text-xs text-muted-foreground">{apt.patient.patient_id}</div>
            {apt.patient.age && (
              <div className="text-xs text-muted-foreground">
                {apt.patient.age}y • {apt.patient.gender}
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'doctor',
        header: 'Doctor',
        cell: (apt) => (
          <div className="flex items-start gap-2">
            <Stethoscope className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-medium">{apt.doctor.full_name}</div>
              {apt.doctor.specialties && apt.doctor.specialties.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {apt.doctor.specialties.join(', ')}
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        cell: (apt) => (
          <div className="space-y-1">
            <Badge variant="secondary" className="capitalize">
              {apt.appointment_type}
            </Badge>
            {apt.is_follow_up && (
              <Badge variant="outline" className="text-xs">
                Follow-up
              </Badge>
            )}
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (apt) => (
          <div className="space-y-1">
            <Badge variant="secondary" className={getStatusColor(apt.status)}>
              {apt.status_display}
            </Badge>
            <Badge variant="secondary" className={getPriorityColor(apt.priority)}>
              {apt.priority_display}
            </Badge>
          </div>
        ),
      },
      {
        key: 'fee',
        header: 'Fee',
        cell: (apt) => (
          <div className="flex items-center gap-1">
            <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{formatPrice(apt.consultation_fee)}</span>
          </div>
        ),
      },
    ];
  }, []);

  //
  // 2. Delete handler passed into DataTable
  //
  async function handleDelete(apt: AppointmentList) {
    const reason = window.prompt('Please provide a cancellation reason:');
    if (reason === null) return;
    
    await deleteAppointment(apt.id, reason);
    toast.success('Appointment cancelled');
    onRefresh();
  }

  //
  // 3. Mobile card renderer
  //
  const renderMobileCard = React.useCallback(
    (apt: AppointmentList, actions: any) => {
      return (
        <div className="space-y-3 text-sm">
          {/* header row */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base">{apt.appointment_id}</h3>
                {apt.priority === 'urgent' && (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(apt.appointment_date)}</span>
                <span>•</span>
                <Clock className="h-3 w-3" />
                <span>{formatTime(apt.appointment_time)}</span>
              </div>
            </div>

            {/* quick view button (mobile) */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                actions.view && actions.view();
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* patient info */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{apt.patient.full_name}</p>
              <p className="text-xs text-muted-foreground">
                {apt.patient.patient_id}
                {apt.patient.age && ` • ${apt.patient.age}y • ${apt.patient.gender}`}
              </p>
            </div>
          </div>

          {/* doctor info */}
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{apt.doctor.full_name}</p>
              {apt.doctor.specialties && apt.doctor.specialties.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {apt.doctor.specialties.join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* tags row */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className={getStatusColor(apt.status)}>
              {apt.status_display}
            </Badge>
            <Badge variant="secondary" className={getPriorityColor(apt.priority)}>
              {apt.priority_display}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {apt.appointment_type}
            </Badge>
            {apt.is_follow_up && (
              <Badge variant="outline" className="text-xs">
                Follow-up
              </Badge>
            )}
          </div>

          {/* fee */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <IndianRupee className="h-4 w-4" />
            <span className="font-semibold">{formatPrice(apt.consultation_fee)}</span>
          </div>

          {/* complaint/symptoms */}
          {apt.chief_complaint && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Complaint:</span> {apt.chief_complaint}
            </div>
          )}

          {/* footer row */}
          <div className="flex items-center justify-between pt-2 border-t text-xs">
            <span className="text-muted-foreground">
              Created: {formatDate(apt.created_at)}
            </span>

            {actions.edit && apt.status !== 'completed' && apt.status !== 'cancelled' && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.edit && actions.edit();
                }}
              >
                Edit
              </Button>
            )}
          </div>

          {actions.askDelete && apt.status !== 'completed' && apt.status !== 'cancelled' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive h-7 text-xs p-0"
              onClick={(e) => {
                e.stopPropagation();
                actions.askDelete && actions.askDelete();
              }}
            >
              Cancel Appointment
            </Button>
          )}
        </div>
      );
    },
    []
  );

  //
  // 4. Render the shared DataTable
  //
  return (
    <DataTable
      rows={appointments}
      isLoading={isLoading}
      columns={columns}
      getRowId={(apt: AppointmentList) => apt.id}
      getRowLabel={(apt: AppointmentList) => apt.appointment_id}
      onView={onView}
      onEdit={onEdit}
      onDelete={handleDelete}
      renderMobileCard={renderMobileCard}
      emptyTitle="No appointments found"
      emptySubtitle="Try adjusting your filters or create a new appointment"
    />
  );
}

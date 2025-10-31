// src/components/appointment-drawer/AppointmentForm.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  IndianRupee,
  FileText,
  Activity,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type {
  AppointmentDetail,
  AppointmentStatus,
  AppointmentPriority,
} from '@/types/appointment.types';

interface AppointmentFormProps {
  appointment?: AppointmentDetail | null;
  mode: 'view' | 'edit' | 'create';
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  /** NEW: prefill selected date from calendar */
  prefillDate?: Date;
}

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked_in', label: 'Checked In' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' },
];

const PRIORITY_OPTIONS: { value: AppointmentPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

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

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
}

export default function AppointmentForm({
  appointment,
  mode,
  onSubmit,
  onCancel,
  isSubmitting,
  prefillDate,
}: AppointmentFormProps) {
  const isViewMode = mode === 'view';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      patient_id: appointment?.patient?.id || '',
      doctor_id: appointment?.doctor?.id || '',
      appointment_type_id: 1,
      appointment_date: appointment?.appointment_date || '',
      appointment_time: appointment?.appointment_time || '',
      duration_minutes: appointment?.duration_minutes || 30,
      chief_complaint: appointment?.chief_complaint || '',
      symptoms: appointment?.symptoms || '',
      priority: appointment?.priority || 'normal',
      notes: appointment?.notes || '',
      status: appointment?.status || 'scheduled',
      is_follow_up: appointment?.is_follow_up || false,
    },
  });

  const priority = watch('priority');
  const status = watch('status');

  // >>> Prefill date when creating from calendar
  useEffect(() => {
    if (mode !== 'create') return;
    if (!prefillDate) return;

    const current = getValues('appointment_date');
    const formatted = format(prefillDate, 'yyyy-MM-dd');

    // Only set if empty or different
    if (!current || current !== formatted) {
      setValue('appointment_date', formatted, { shouldDirty: true, shouldValidate: true });
    }
  }, [mode, prefillDate, getValues, setValue]);

  const onSubmitForm = async (data: any) => {
    const formData: any = {
      ...data,
      patient_id: parseInt(data.patient_id),
      doctor_id: parseInt(data.doctor_id),
      appointment_type_id: parseInt(data.appointment_type_id),
      duration_minutes: parseInt(data.duration_minutes),
    };
    await onSubmit(formData);
  };

  if (isViewMode && appointment) {
    return (
      <div className="space-y-6">
        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className={getStatusColor(appointment.status)}>
            {appointment.status_display}
          </Badge>
          <Badge variant="secondary" className={getPriorityColor(appointment.priority)}>
            {appointment.priority_display}
          </Badge>
          {appointment.is_follow_up && <Badge variant="outline">Follow-up Visit</Badge>}
        </div>

        <Separator />

        {/* Appointment Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Appointment Information</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Appointment ID</Label>
              <p className="text-sm font-medium mt-1">{appointment.appointment_id}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Type</Label>
              <p className="text-sm font-medium mt-1 capitalize">
                {String(appointment.appointment_type)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Date</Label>
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">
                  {new Date(appointment.appointment_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Time</Label>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{appointment.appointment_time}</p>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Duration</Label>
            <p className="text-sm mt-1">{appointment.duration_minutes} minutes</p>
          </div>
        </div>

        <Separator />

        {/* Patient Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Patient Information</h3>

          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{appointment.patient.full_name}</p>
              <p className="text-sm text-muted-foreground">{appointment.patient.patient_id}</p>
              {appointment.patient.age && (
                <p className="text-sm text-muted-foreground">
                  {appointment.patient.age} years • {appointment.patient.gender}
                </p>
              )}
              {appointment.patient.mobile_primary && (
                <p className="text-sm text-muted-foreground">{appointment.patient.mobile_primary}</p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Doctor Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Doctor Information</h3>

          <div className="flex items-start gap-3">
            <Stethoscope className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{appointment.doctor.full_name}</p>
              <p className="text-sm text-muted-foreground">
                {appointment.doctor.medical_license_number}
              </p>
              {appointment.doctor.specialties && appointment.doctor.specialties.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {appointment.doctor.specialties.join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Clinical Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Clinical Information</h3>

          {appointment.chief_complaint && (
            <div>
              <Label className="text-xs text-muted-foreground">Chief Complaint</Label>
              <div className="flex items-start gap-2 mt-1">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm">{appointment.chief_complaint}</p>
              </div>
            </div>
          )}

          {appointment.symptoms && (
            <div>
              <Label className="text-xs text-muted-foreground">Symptoms</Label>
              <div className="flex items-start gap-2 mt-1">
                <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm">{appointment.symptoms}</p>
              </div>
            </div>
          )}

          {appointment.notes && (
            <div>
              <Label className="text-xs text-muted-foreground">Notes</Label>
              <p className="text-sm mt-1">{appointment.notes}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Financial Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Financial</h3>

          <div>
            <Label className="text-xs text-muted-foreground">Consultation Fee</Label>
            <div className="flex items-center gap-1 mt-1">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">
                ₹{parseFloat(appointment.consultation_fee).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Timeline Information */}
        {(appointment.check_in_time ||
          appointment.actual_start_time ||
          appointment.actual_end_time) && (
          <>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Timeline</h3>

              <div className="space-y-3">
                {appointment.check_in_time && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <Label className="text-xs text-muted-foreground">Checked In</Label>
                      <p className="text-sm">{new Date(appointment.check_in_time).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {appointment.actual_start_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                      <Label className="text-xs text-muted-foreground">Started</Label>
                      <p className="text-sm">{new Date(appointment.actual_start_time).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {appointment.actual_end_time && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <div>
                      <Label className="text-xs text-muted-foreground">Completed</Label>
                      <p className="text-sm">{new Date(appointment.actual_end_time).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {appointment.waiting_time_minutes !== undefined && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <div>
                      <Label className="text-xs text-muted-foreground">Waiting Time</Label>
                      <p className="text-sm">{appointment.waiting_time_minutes} minutes</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Cancellation Information */}
        {appointment.status === 'cancelled' && appointment.cancellation_reason && (
          <>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Cancellation</h3>

              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Reason</Label>
                  <p className="text-sm">{appointment.cancellation_reason}</p>
                  {appointment.cancelled_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Cancelled: {new Date(appointment.cancelled_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Metadata */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Metadata</h3>

          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <Label className="text-xs text-muted-foreground">Created</Label>
              <p className="mt-1">{new Date(appointment.created_at).toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Last Updated</Label>
              <p className="mt-1">{new Date(appointment.updated_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EDIT/CREATE MODE - FORM
  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Appointment Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Appointment Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="patient_id">
              Patient ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="patient_id"
              type="number"
              {...register('patient_id', { required: 'Patient ID is required' })}
              placeholder="Enter patient ID"
              disabled={mode === 'edit'}
            />
            {errors.patient_id && (
              <p className="text-xs text-destructive">{String(errors.patient_id.message)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor_id">
              Doctor ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="doctor_id"
              type="number"
              {...register('doctor_id', { required: 'Doctor ID is required' })}
              placeholder="Enter doctor ID"
            />
            {errors.doctor_id && (
              <p className="text-xs text-destructive">{String(errors.doctor_id.message)}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="appointment_date">
              Date <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="appointment_date"
                type="date"
                {...register('appointment_date', { required: 'Date is required' })}
                className="pl-9"
              />
            </div>
            {errors.appointment_date && (
              <p className="text-xs text-destructive">{String(errors.appointment_date.message)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="appointment_time">
              Time <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="appointment_time"
                type="time"
                {...register('appointment_time', { required: 'Time is required' })}
                className="pl-9"
              />
            </div>
            {errors.appointment_time && (
              <p className="text-xs text-destructive">{String(errors.appointment_time.message)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration_minutes">Duration (mins)</Label>
            <Input id="duration_minutes" type="number" {...register('duration_minutes')} placeholder="30" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(value) => setValue('priority', value as AppointmentPriority)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mode === 'edit' && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setValue('status', value as AppointmentStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Clinical Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Clinical Information</h3>

        <div className="space-y-2">
          <Label htmlFor="chief_complaint">Chief Complaint</Label>
          <Textarea
            id="chief_complaint"
            {...register('chief_complaint')}
            placeholder="Main reason for visit"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="symptoms">Symptoms</Label>
          <Textarea id="symptoms" {...register('symptoms')} placeholder="List of symptoms" rows={3} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea id="notes" {...register('notes')} placeholder="Any additional information" rows={2} />
        </div>
      </div>

      <Separator />

      {/* Form Actions */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Appointment' : 'Update Appointment'}
        </Button>
      </div>
    </form>
  );
}

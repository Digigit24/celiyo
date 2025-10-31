// src/components/AppointmentDrawer.tsx
import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2, UserCheck, Play, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAppointment, useAppointments } from '@/hooks/useAppointments';
import type { AppointmentList, AppointmentDetail } from '@/types/appointment.types';
import AppointmentForm from './appointment-drawer/AppointmentForm';
import { SideDrawer, type DrawerActionButton, type DrawerHeaderAction } from '@/components/SideDrawer';

interface AppointmentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: number | null;
  mode: 'view' | 'edit' | 'create';
  onSuccess?: () => void;
  onModeChange?: (mode: 'view' | 'edit' | 'create') => void;
  /** NEW: selected calendar date to prefill form */
  prefillDate?: Date;
}

export default function AppointmentDrawer({
  open,
  onOpenChange,
  appointmentId,
  mode,
  onSuccess,
  onModeChange,
  prefillDate,
}: AppointmentDrawerProps) {
  const [currentMode, setCurrentMode] = useState(mode);

  // Fetch appointment only when not creating
  const { appointment, loading: isFetching } = useAppointment(
    currentMode !== 'create' ? appointmentId : null
  );

  // Mutations
  const { createItem, updateItem, deleteItem, checkIn, start, complete } = useAppointments();

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  const handleSuccess = useCallback(() => {
    onSuccess?.();
  }, [onSuccess]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSwitchToEdit = useCallback(() => {
    setCurrentMode('edit');
    onModeChange?.('edit');
  }, [onModeChange]);

  const handleSwitchToView = useCallback(() => {
    setCurrentMode('view');
    onModeChange?.('view');
  }, [onModeChange]);

  const handleDelete = useCallback(async () => {
    if (!appointmentId) return;

    const reason = window.prompt('Please provide a cancellation reason:');
    if (reason === null) return;

    try {
      await deleteItem(appointmentId, reason);
      toast.success('Appointment cancelled successfully');
      handleSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to cancel appointment');
    }
  }, [appointmentId, deleteItem, handleSuccess, handleClose]);

  const handleCheckIn = useCallback(async () => {
    if (!appointmentId) return;
    try {
      await checkIn(appointmentId);
      toast.success('Patient checked in successfully');
      handleSuccess();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to check in');
    }
  }, [appointmentId, checkIn, handleSuccess]);

  const handleStart = useCallback(async () => {
    if (!appointmentId) return;
    try {
      await start(appointmentId);
      toast.success('Appointment started successfully');
      handleSuccess();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to start appointment');
    }
  }, [appointmentId, start, handleSuccess]);

  const handleComplete = useCallback(async () => {
    if (!appointmentId) return;
    try {
      await complete(appointmentId);
      toast.success('Appointment completed successfully');
      handleSuccess();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to complete appointment');
    }
  }, [appointmentId, complete, handleSuccess]);

  const handleSave = useCallback(
    async (formData: any) => {
      try {
        if (currentMode === 'create') {
          await createItem(formData);
          toast.success('Appointment created successfully');
          handleSuccess();
          handleClose();
        } else if (currentMode === 'edit' && appointmentId) {
          await updateItem(appointmentId, formData);
          toast.success('Appointment updated successfully');
          handleSuccess();
          handleSwitchToView();
        }
      } catch (error: any) {
        toast.error(error?.message || 'Failed to save appointment');
        throw error;
      }
    },
    [currentMode, appointmentId, createItem, updateItem, handleSuccess, handleClose, handleSwitchToView]
  );

  const drawerTitle =
    currentMode === 'create' ? 'Create New Appointment' : appointment?.appointment_id || 'Appointment Details';

  const drawerDescription =
    currentMode === 'create'
      ? undefined
      : appointment
      ? `${appointment.patient.full_name} • ${appointment.doctor.full_name}`
      : undefined;

  const headerActions: DrawerHeaderAction[] =
    currentMode === 'view' && appointment
      ? [
          ...(appointment.status === 'confirmed'
            ? [
                {
                  icon: UserCheck,
                  onClick: handleCheckIn,
                  label: 'Check in patient',
                  variant: 'ghost' as const,
                },
              ]
            : []),
          ...(appointment.status === 'checked_in'
            ? [
                {
                  icon: Play,
                  onClick: handleStart,
                  label: 'Start consultation',
                  variant: 'ghost' as const,
                },
              ]
            : []),
          ...(appointment.status === 'in_progress'
            ? [
                {
                  icon: CheckCircle,
                  onClick: handleComplete,
                  label: 'Complete appointment',
                  variant: 'ghost' as const,
                },
              ]
            : []),
          ...(appointment.status !== 'completed' && appointment.status !== 'cancelled'
            ? [
                {
                  icon: Pencil,
                  onClick: handleSwitchToEdit,
                  label: 'Edit appointment',
                  variant: 'ghost' as const,
                },
                {
                  icon: Trash2,
                  onClick: handleDelete,
                  label: 'Cancel appointment',
                  variant: 'ghost' as const,
                },
              ]
            : []),
        ]
      : [];

  const [isSubmitting] = useState(false);

  const footerButtons: DrawerActionButton[] =
    currentMode === 'view'
      ? [
          {
            label: 'Close',
            onClick: handleClose,
            variant: 'outline',
          },
        ]
      : [];

  const drawerContent = (
    <div className="space-y-6">
      <AppointmentForm
        appointment={appointment}
        mode={currentMode}
        onSubmit={handleSave}
        onCancel={currentMode === 'edit' ? handleSwitchToView : handleClose}
        isSubmitting={isSubmitting}
        prefillDate={prefillDate}
      />
    </div>
  );

  return (
    <SideDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={drawerTitle}
      description={drawerDescription}
      mode={currentMode}
      headerActions={headerActions}
      isLoading={isFetching}
      loadingText="Loading appointment data..."
      size="xl"
      footerButtons={footerButtons}
      footerAlignment="right"
      showBackButton={true}
      resizable={true}
      storageKey="appointment-drawer-width"
      onClose={handleClose}
    >
      {drawerContent}
    </SideDrawer>
  );
}

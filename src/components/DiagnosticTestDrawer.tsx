// src/components/DiagnosticTestDrawer.tsx
import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  useDiagnosticTest, 
  useCreateDiagnosticTest, 
  useUpdateDiagnosticTest,
  useDeleteDiagnosticTest 
} from '@/hooks/useServices';
import type { DiagnosticTest } from '@/types/service.types';
import DiagnosticTestForm from './diagnostic-test-drawer/DiagnosticTestForm';

import { SideDrawer, type DrawerActionButton, type DrawerHeaderAction } from '@/components/SideDrawer';

interface DiagnosticTestDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testId: number | null;
  mode: 'view' | 'edit' | 'create';
  onSuccess?: () => void;
  onModeChange?: (mode: 'view' | 'edit' | 'create') => void;
}

export default function DiagnosticTestDrawer({
  open,
  onOpenChange,
  testId,
  mode,
  onSuccess,
  onModeChange,
}: DiagnosticTestDrawerProps) {
  const [currentMode, setCurrentMode] = useState(mode);

  // Fetch test data when drawer opens
  const { diagnosticTest, isLoading: isFetching } = useDiagnosticTest(
    currentMode !== 'create' ? testId : null
  );

  // Mutations
  const { createDiagnosticTest, isCreating } = useCreateDiagnosticTest();
  const { updateDiagnosticTest, isUpdating } = useUpdateDiagnosticTest(testId || 0);
  const { deleteDiagnosticTest, isDeleting } = useDeleteDiagnosticTest();

  // Sync internal mode with prop
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
    if (!testId) return;
    
    if (window.confirm('Are you sure you want to delete this diagnostic test? This action cannot be undone.')) {
      try {
        await deleteDiagnosticTest({ id: testId });
        toast.success('Diagnostic test deleted successfully');
        handleSuccess();
        handleClose();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete test');
      }
    }
  }, [testId, deleteDiagnosticTest, handleSuccess, handleClose]);

  const handleSave = useCallback(async (formData: any) => {
    try {
      if (currentMode === 'create') {
        await createDiagnosticTest(formData);
        toast.success('Diagnostic test created successfully');
        handleSuccess();
        handleClose();
      } else if (currentMode === 'edit' && testId) {
        await updateDiagnosticTest(formData);
        toast.success('Diagnostic test updated successfully');
        handleSuccess();
        handleSwitchToView();
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save test');
      throw error; // Re-throw so form can handle it
    }
  }, [currentMode, testId, createDiagnosticTest, updateDiagnosticTest, handleSuccess, handleClose, handleSwitchToView]);

  // ===== HEADER CONFIGURATION =====
  const drawerTitle = 
    currentMode === 'create'
      ? 'Create New Diagnostic Test'
      : diagnosticTest?.name || 'Test Details';

  const drawerDescription = 
    currentMode === 'create'
      ? undefined
      : diagnosticTest
      ? `Code: ${diagnosticTest.code} • ${diagnosticTest.category?.name || 'No Category'}`
      : undefined;

  // Header actions (edit, delete buttons in view mode)
  const headerActions: DrawerHeaderAction[] = 
    currentMode === 'view' && diagnosticTest
      ? [
          {
            icon: Pencil,
            onClick: handleSwitchToEdit,
            label: 'Edit test',
            variant: 'ghost',
          },
          {
            icon: Trash2,
            onClick: handleDelete,
            label: 'Delete test',
            variant: 'ghost',
            disabled: isDeleting,
          },
        ]
      : [];

  // ===== FOOTER CONFIGURATION =====
  const isSaving = isCreating || isUpdating;

  const footerButtons: DrawerActionButton[] = 
    currentMode === 'view'
      ? [
          {
            label: 'Close',
            onClick: handleClose,
            variant: 'outline',
          },
        ]
      : []; // Form will have its own submit buttons

  // ===== CONTENT =====
  const drawerContent = (
    <div className="space-y-6">
      <DiagnosticTestForm
        test={diagnosticTest}
        mode={currentMode}
        onSubmit={handleSave}
        onCancel={currentMode === 'edit' ? handleSwitchToView : handleClose}
        isSubmitting={isSaving}
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
      loadingText="Loading test data..."
      size="xl"
      footerButtons={footerButtons}
      footerAlignment="right"
      showBackButton={true}
      resizable={true}
      storageKey="diagnostic-test-drawer-width"
      onClose={handleClose}
    >
      {drawerContent}
    </SideDrawer>
  );
}
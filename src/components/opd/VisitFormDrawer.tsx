// src/components/opd/VisitFormDrawer.tsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Trash2, Activity, FileText, Paperclip, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

import { getVisitById, deleteVisit } from '@/services/opd/visit.service';
import type { Visit } from '@/types/opd/visit.types';

import VisitBasicInfo, { type VisitBasicInfoRef } from './visit-drawer/VisitBasicInfo';
import VisitFindingsTab from './visit-drawer/VisitFindingsTab';
import VisitClinicalNoteTab from './visit-drawer/VisitClinicalNoteTab';
import VisitBillingTab from './visit-drawer/VisitBillingTab';
import VisitAttachmentsTab from './visit-drawer/VisitAttachmentsTab';

import { SideDrawer, type DrawerActionButton, type DrawerHeaderAction } from '@/components/SideDrawer';

interface VisitFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitId: number | null;
  mode: 'view' | 'edit' | 'create';
  onSuccess?: () => void;
  onDelete?: (id: number) => void;
  onModeChange?: (mode: 'view' | 'edit' | 'create') => void;
}

export default function VisitFormDrawer({
  open,
  onOpenChange,
  visitId,
  mode,
  onSuccess,
  onDelete,
  onModeChange,
}: VisitFormDrawerProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [visit, setVisit] = useState<Visit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);
  
  // Ref to access VisitBasicInfo's submit method
  const formRef = useRef<VisitBasicInfoRef>(null);

  // Sync internal mode with prop
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  // Fetch visit data when drawer opens
  useEffect(() => {
    if (open && visitId && currentMode !== 'create') {
      fetchVisitData();
    } else if (currentMode === 'create') {
      setVisit(null);
      setActiveTab('basic');
    }
  }, [open, visitId, currentMode]);

  const fetchVisitData = async () => {
    if (!visitId) return;

    setIsLoading(true);
    try {
      const data = await getVisitById(visitId);
      setVisit(data);
    } catch (error: any) {
      toast.error('Failed to load visit data', {
        description: error?.message || 'Please try again',
      });
      console.error('Error fetching visit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = useCallback(() => {
    if (currentMode !== 'create') {
      fetchVisitData();
    }
    onSuccess?.();
  }, [currentMode, onSuccess]);

  const handleClose = useCallback(() => {
    setActiveTab('basic');
    setVisit(null);
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
    if (!visitId) return;

    if (
      window.confirm(
        'Are you sure you want to delete this visit? This action cannot be undone and will remove all associated data.'
      )
    ) {
      try {
        await deleteVisit(visitId);
        toast.success('Visit deleted successfully');
        onDelete?.(visitId);
        handleClose();
      } catch (error: any) {
        toast.error('Failed to delete visit', {
          description: error?.message || 'Please try again',
        });
      }
    }
  }, [visitId, onDelete, handleClose]);

  const handleSave = useCallback(async () => {
    // Trigger the form submission via ref
    if (!formRef.current) {
      console.error('Form ref not available');
      return;
    }

    try {
      await formRef.current.submitForm();
      // Success toast and callbacks are handled in VisitBasicInfo's onSubmit
    } catch (error: any) {
      // Error toast is handled in VisitBasicInfo's onSubmit
      console.error('Form submission error:', error);
    }
  }, []);

  // Drawer title
  const drawerTitle =
    currentMode === 'create'
      ? 'Create New Visit'
      : visit?.visit_number || 'Visit Details';

  // Drawer description
  const drawerDescription =
    currentMode === 'create'
      ? 'Register a new patient visit'
      : visit
      ? `${visit.patient_name} • ${visit.visit_type.replace('_', ' ')} • ${visit.status.replace('_', ' ')}`
      : undefined;

  // Header actions
  const headerActions: DrawerHeaderAction[] =
    currentMode === 'view' && visit
      ? [
          {
            icon: Pencil,
            onClick: handleSwitchToEdit,
            label: 'Edit visit',
            variant: 'ghost',
          },
          {
            icon: Trash2,
            onClick: handleDelete,
            label: 'Delete visit',
            variant: 'ghost',
          },
        ]
      : [];

  // Footer buttons
  const footerButtons: DrawerActionButton[] =
    currentMode === 'view'
      ? [
          {
            label: 'Close',
            onClick: handleClose,
            variant: 'outline',
          },
        ]
      : currentMode === 'edit'
      ? [
          {
            label: 'Cancel',
            onClick: handleSwitchToView,
            variant: 'outline',
            disabled: isSaving,
          },
          {
            label: 'Save Changes',
            onClick: handleSave,
            variant: 'default',
            loading: isSaving,
          },
        ]
      : [
          {
            label: 'Cancel',
            onClick: handleClose,
            variant: 'outline',
            disabled: isSaving,
          },
          {
            label: 'Create Visit',
            onClick: handleSave,
            variant: 'default',
            loading: isSaving,
          },
        ];

  // Drawer content
  const drawerContent = (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="findings" disabled={currentMode === 'create' || !visit}>
            <Activity className="h-3 w-3 mr-1" />
            Findings
          </TabsTrigger>
          <TabsTrigger value="clinical" disabled={currentMode === 'create' || !visit}>
            <Stethoscope className="h-3 w-3 mr-1" />
            Clinical
          </TabsTrigger>
          <TabsTrigger value="billing" disabled={currentMode === 'create' || !visit}>
            <FileText className="h-3 w-3 mr-1" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="attachments" disabled={currentMode === 'create' || !visit}>
            <Paperclip className="h-3 w-3 mr-1" />
            Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6 space-y-6">
          <VisitBasicInfo
            ref={formRef}
            visit={visit}
            mode={currentMode}
            onSuccess={handleSuccess}
            onSaveStart={() => setIsSaving(true)}
            onSaveEnd={() => setIsSaving(false)}
          />
        </TabsContent>

        <TabsContent value="findings" className="mt-6">
          {visitId && visit && (
            <VisitFindingsTab
              visitId={visitId}
              visitNumber={visit.visit_number}
              readOnly={currentMode === 'view'}
              onUpdate={handleSuccess}
            />
          )}
        </TabsContent>

        <TabsContent value="clinical" className="mt-6">
          {visitId && visit && (
            <VisitClinicalNoteTab
              visitId={visitId}
              visitNumber={visit.visit_number}
              readOnly={currentMode === 'view'}
              onUpdate={handleSuccess}
            />
          )}
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          {visitId && visit && (
            <VisitBillingTab
              visitId={visitId}
              visit={visit}
              readOnly={currentMode === 'view'}
              onUpdate={handleSuccess}
            />
          )}
        </TabsContent>

        <TabsContent value="attachments" className="mt-6">
          {visitId && visit && (
            <VisitAttachmentsTab
              visitId={visitId}
              visitNumber={visit.visit_number}
              readOnly={currentMode === 'view'}
              onUpdate={handleSuccess}
            />
          )}
        </TabsContent>
      </Tabs>
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
      isLoading={isLoading}
      loadingText="Loading visit data..."
      size="2xl"
      footerButtons={footerButtons}
      footerAlignment="right"
      showBackButton={true}
      resizable={true}
      storageKey="visit-drawer-width"
      onClose={handleClose}
    >
      {drawerContent}
    </SideDrawer>
  );
}
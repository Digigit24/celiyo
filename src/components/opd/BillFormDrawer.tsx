// src/components/opd/BillFormDrawer.tsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Trash2, FileText, Printer, Download } from 'lucide-react';
import { toast } from 'sonner';

import { getOPDBillById, deleteOPDBill, printOPDBill } from '@/services/opd/opdBill.service';
import type { OPDBill } from '@/types/opd.types';

import BillBasicInfo, { type BillBasicInfoRef } from './bill-drawer/BillBasicInfo';
import { SideDrawer, type DrawerActionButton, type DrawerHeaderAction } from '@/components/SideDrawer';

interface BillFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billId: number | null;
  mode: 'view' | 'edit' | 'create';
  onSuccess?: () => void;
  onDelete?: (id: number) => void;
  onModeChange?: (mode: 'view' | 'edit' | 'create') => void;
}

function BillFormDrawer({
  open,
  onOpenChange,
  billId,
  mode,
  onSuccess,
  onDelete,
  onModeChange,
}: BillFormDrawerProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [bill, setBill] = useState<OPDBill | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);

  const formRef = useRef<BillBasicInfoRef>(null);

  // Sync internal mode with prop
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  // Fetch bill data when drawer opens
  useEffect(() => {
    if (open && billId && currentMode !== 'create') {
      fetchBillData();
    } else if (currentMode === 'create') {
      setBill(null);
      setActiveTab('basic');
    }
  }, [open, billId, currentMode]);

  const fetchBillData = async () => {
    if (!billId) return;

    setIsLoading(true);
    try {
      const data = await getOPDBillById(billId);
      setBill(data);
    } catch (error: any) {
      toast.error('Failed to load bill data', {
        description: error?.response?.data?.message || error?.message || 'Please try again',
      });
      console.error('Error fetching bill:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = useCallback(() => {
    if (currentMode !== 'create') {
      fetchBillData();
    }
    onSuccess?.();
  }, [currentMode, onSuccess]);

  const handleClose = useCallback(() => {
    setActiveTab('basic');
    setBill(null);
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
    if (!billId) return;

    if (
      window.confirm(
        'Are you sure you want to delete this bill? This action cannot be undone.'
      )
    ) {
      try {
        await deleteOPDBill(billId);
        toast.success('Bill deleted successfully');
        onDelete?.(billId);
        handleClose();
      } catch (error: any) {
        toast.error('Failed to delete bill', {
          description: error?.response?.data?.message || error?.message || 'Please try again',
        });
      }
    }
  }, [billId, onDelete, handleClose]);

  const handleSave = useCallback(async () => {
    if (!formRef.current) {
      console.error('Form ref not available');
      return;
    }

    try {
      await formRef.current.submitForm();
    } catch (error: any) {
      console.error('Form submission error:', error);
    }
  }, []);

  const handlePrint = useCallback(async () => {
    if (!billId) return;
    
    try {
      const result = await printOPDBill(billId);
      if (result.success && result.pdf_url) {
        window.open(result.pdf_url, '_blank');
        toast.success('Opening bill for printing');
      } else {
        toast.info('Print functionality coming soon');
      }
    } catch (error: any) {
      toast.error('Failed to print bill', {
        description: error?.response?.data?.message || error?.message || 'Please try again',
      });
    }
  }, [billId]);

  const handleDownload = useCallback(async () => {
    if (!billId) return;
    
    try {
      const result = await printOPDBill(billId);
      if (result.success && result.pdf_url) {
        const link = document.createElement('a');
        link.href = result.pdf_url;
        link.download = `bill_${bill?.bill_number || billId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Downloading bill');
      } else {
        toast.info('Download functionality coming soon');
      }
    } catch (error: any) {
      toast.error('Failed to download bill', {
        description: error?.response?.data?.message || error?.message || 'Please try again',
      });
    }
  }, [billId, bill]);

  const drawerTitle =
    currentMode === 'create'
      ? 'Create New Bill'
      : bill?.bill_number || 'Bill Details';

  const drawerDescription =
    currentMode === 'create'
      ? 'Create a new OPD bill'
      : bill
      ? `${bill.patient_name} • ${bill.opd_type} • ${bill.payment_status.toUpperCase()}`
      : undefined;

  const headerActions: DrawerHeaderAction[] =
    currentMode === 'view' && bill
      ? [
          {
            icon: Printer,
            onClick: handlePrint,
            label: 'Print bill',
            variant: 'ghost',
          },
          {
            icon: Download,
            onClick: handleDownload,
            label: 'Download bill',
            variant: 'ghost',
          },
          {
            icon: Pencil,
            onClick: handleSwitchToEdit,
            label: 'Edit bill',
            variant: 'ghost',
          },
          {
            icon: Trash2,
            onClick: handleDelete,
            label: 'Delete bill',
            variant: 'ghost',
          },
        ]
      : [];

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
            label: 'Create Bill',
            onClick: handleSave,
            variant: 'default',
            loading: isSaving,
          },
        ];

  const drawerContent = (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="basic">
            <FileText className="h-3 w-3 mr-1" />
            Bill Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6 space-y-6">
          <BillBasicInfo
            ref={formRef}
            bill={bill}
            mode={currentMode}
            onSuccess={handleSuccess}
            onSaveStart={() => setIsSaving(true)}
            onSaveEnd={() => setIsSaving(false)}
          />
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
      loadingText="Loading bill data..."
      size="xl"
      footerButtons={footerButtons}
      footerAlignment="right"
      showBackButton={true}
      resizable={true}
      storageKey="bill-drawer-width"
      onClose={handleClose}
    >
      {drawerContent}
    </SideDrawer>
  );
}

export default BillFormDrawer;
// src/components/opd/BillViewDrawer.tsx
import { useEffect, useState, useCallback } from 'react';
import { Printer, Download, X } from 'lucide-react';
import { toast } from 'sonner';

import { getOPDBillById, printOPDBill } from '@/services/opd/opdBill.service';
import type { OPDBill } from '@/types/opd.types';

import BillViewContent from './bill-drawer/BillViewContent';
import { SideDrawer, type DrawerActionButton, type DrawerHeaderAction } from '@/components/SideDrawer';

interface BillViewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billId: number | null;
}

function BillViewDrawer({
  open,
  onOpenChange,
  billId,
}: BillViewDrawerProps) {
  const [bill, setBill] = useState<OPDBill | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch bill data when drawer opens
  useEffect(() => {
    if (open && billId) {
      fetchBillData();
    } else {
      setBill(null);
    }
  }, [open, billId]);

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

  const handleClose = useCallback(() => {
    setBill(null);
    onOpenChange(false);
  }, [onOpenChange]);

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

  // Drawer title
  const drawerTitle = bill?.bill_number || 'Bill Details';

  // Drawer description
  const drawerDescription = bill
    ? `${bill.patient_name} • ${bill.opd_type} • ${bill.payment_status.toUpperCase()}`
    : undefined;

  // Header actions (only print and download)
  const headerActions: DrawerHeaderAction[] = bill
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
      ]
    : [];

  // Footer buttons (only close button)
  const footerButtons: DrawerActionButton[] = [
    {
      label: 'Close',
      onClick: handleClose,
      variant: 'outline',
    },
  ];

  return (
    <SideDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={drawerTitle}
      description={drawerDescription}
      mode="view"
      headerActions={headerActions}
      isLoading={isLoading}
      loadingText="Loading bill data..."
      size="xl"
      footerButtons={footerButtons}
      footerAlignment="right"
      showBackButton={true}
      resizable={true}
      storageKey="bill-view-drawer-width"
      onClose={handleClose}
    >
      {bill && <BillViewContent bill={bill} />}
    </SideDrawer>
  );
}

export default BillViewDrawer;
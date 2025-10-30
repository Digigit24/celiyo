// src/components/opd/ProcedureBillDrawer.tsx
import { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2, Plus, Search, AlertCircle, IndianRupee, Wallet } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

import { SideDrawer, type DrawerActionButton, type DrawerHeaderAction } from '@/components/SideDrawer';

import {
  useCreateProcedureBill,
  useUpdateProcedureBill,
  useDeleteProcedureBill,
  useRecordProcedureBillPayment,
} from '@/hooks/opd/useProcedureBill.hooks';
import { getProcedureBillById } from '@/services/opd/procedureBill.service';

// Import doctors hook and type
import { useDoctors } from '@/hooks/useDoctors';
import type { Doctor as DoctorType } from '@/types/doctor.types';

// Import procedures hook and type
import { useProcedureMasters } from '@/hooks/opd/useProcedureMaster.hooks';
import type { ProcedureMaster } from '@/types/opd/procedureMaster.types';

// Import types
import type { PaymentMode, BillType } from '@/types/opd/procedureBill.types';

// ---------------------------------------------------------
// Types
// ---------------------------------------------------------

interface BillProcedure {
  id?: number;
  procedure_id: number;
  procedure_name?: string;
  procedure_code?: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_amount: number;
  note?: string;
}

interface BillFormData {
  bill_number: string;
  bill_date: string;
  patient_id: number | null;
  patient_name: string;
  patient_phone: string;
  visit_id: number | null;
  doctor_id: number | null;
  doctor_name: string;
  bill_type: BillType;
  category: string;
  procedures: BillProcedure[];
  subtotal_amount: number;
  discount_percent: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  received_amount: number;
  balance_amount: number;
  payment_status: 'unpaid' | 'partial' | 'paid';
  payment_method: PaymentMode;
  payment_details: string;
}

interface ProcedureBillDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billId?: number | null;
  mode: 'create' | 'edit' | 'view' | 'collect';
  onSuccess?: () => void;
  onDelete?: (id: number) => void;
  onModeChange?: (mode: 'view' | 'edit' | 'create' | 'collect') => void;
}

interface AvailableProcedure {
  id: number;
  name: string;
  code: string;
  base_price: number;
}

interface Patient {
  id: number;
  name: string;
  phone: string;
  patient_id: string;
}

const EMPTY_FORM: BillFormData = {
  bill_number: '',
  bill_date: new Date().toISOString().split('T')[0],
  patient_id: null,
  patient_name: '',
  patient_phone: '',
  visit_id: null,
  doctor_id: null,
  doctor_name: '',
  bill_type: 'hospital',
  category: '',
  procedures: [],
  subtotal_amount: 0,
  discount_percent: 0,
  discount_amount: 0,
  tax_amount: 0,
  total_amount: 0,
  received_amount: 0,
  balance_amount: 0,
  payment_status: 'unpaid',
  payment_method: 'cash',
  payment_details: '',
};

export default function ProcedureBillDrawer({
  open,
  onOpenChange,
  billId,
  mode,
  onSuccess,
  onDelete,
  onModeChange,
}: ProcedureBillDrawerProps) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [formData, setFormData] = useState<BillFormData>(EMPTY_FORM);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [billData, setBillData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Patient search state
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [patientSearchText, setPatientSearchText] = useState('');
  const [availablePatients, setAvailablePatients] = useState<Patient[]>([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);

  // Doctor search state
  const [showDoctorSearch, setShowDoctorSearch] = useState(false);
  const [doctorSearchText, setDoctorSearchText] = useState('');

  // Procedure search state
  const [showProcedureSearch, setShowProcedureSearch] = useState(false);
  const [procedureSearchText, setProcedureSearchText] = useState('');

  // Sync internal mode with prop
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  // ---------------------------------------------------------
  // Hooks for fetching data
  // ---------------------------------------------------------
  
  // Fetch doctors with search
  const { doctors, isLoading: isLoadingDoctors } = useDoctors(
    showDoctorSearch && doctorSearchText
      ? { search: doctorSearchText, page_size: 20 }
      : undefined
  );

  // Fetch procedures with search - FIXED: use procedureMasters instead of procedures
  const { procedureMasters, isLoading: isLoadingProcedures } = useProcedureMasters(
    showProcedureSearch && procedureSearchText
      ? { search: procedureSearchText, is_active: true, page_size: 20 }
      : undefined
  );

  // ---------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------
  const {
    createProcedureBill,
    isCreating,
    error: createError,
  } = useCreateProcedureBill();

  const {
    updateProcedureBill,
    isUpdating,
    error: updateError,
  } = useUpdateProcedureBill(billId || 0);

  const {
    deleteProcedureBill,
  } = useDeleteProcedureBill();

  const {
    recordPayment,
    isRecording,
    error: paymentError,
  } = useRecordProcedureBillPayment(billId || 0);

  useEffect(() => {
    if (createError) {
      setError((createError as any)?.message || 'Failed to create bill');
    }
  }, [createError]);

  useEffect(() => {
    if (updateError) {
      setError((updateError as any)?.message || 'Failed to update bill');
    }
  }, [updateError]);

  useEffect(() => {
    if (paymentError) {
      setError((paymentError as any)?.message || 'Failed to record payment');
    }
  }, [paymentError]);

  // ---------------------------------------------------------
  // Fetch bill data
  // ---------------------------------------------------------
  const fetchBillData = async () => {
    if (!billId) return;

    console.log('Fetching bill data for ID:', billId);
    setIsLoading(true);
    setError(null);

    try {
      const data = await getProcedureBillById(billId);
      console.log('Fetched bill data:', data);
      setBillData(data);
    } catch (error: any) {
      console.error('Error fetching bill:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load bill data';
      toast.error('Failed to load bill data', {
        description: errorMessage,
      });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when drawer opens
  useEffect(() => {
    console.log('Effect triggered:', { open, billId, currentMode });

    if (open && billId && currentMode !== 'create') {
      fetchBillData();
    } else if (open && currentMode === 'create') {
      // Reset for create mode
      setBillData(null);
      setFormData(EMPTY_FORM);
      setValidationErrors({});
      setError(null);
      setShowPatientSearch(false);
      setShowDoctorSearch(false);
      setShowProcedureSearch(false);
      setPatientSearchText('');
      setDoctorSearchText('');
      setProcedureSearchText('');
    }
  }, [open, billId, currentMode]);

  // Hydrate form when bill data is loaded
  useEffect(() => {
    if (billData && currentMode !== 'create') {
      console.log('Hydrating form with bill data:', billData);
      hydrateFormData(billData);
    }
  }, [billData, currentMode]);

  const hydrateFormData = (data: any) => {
    console.log('Starting hydration with:', data);

    // Map items to procedures
    const backendItems = data.items || [];
    const normalizedProcedures: BillProcedure[] = backendItems.map((item: any) => ({
      id: item.id,
      procedure_id: item.procedure,
      procedure_name: item.particular_name,
      procedure_code: '',
      quantity: item.quantity || 1,
      unit_price: parseFloat(item.unit_charge || 0),
      discount_amount: 0,
      total_amount: parseFloat(item.unit_charge || 0) * (item.quantity || 1),
      note: item.note || '',
    }));

    const hydratedData: BillFormData = {
      bill_number: data.bill_number || '',
      bill_date: data.bill_date || new Date().toISOString().split('T')[0],
      patient_id: data.patient || null,
      patient_name: data.patient_name || '',
      patient_phone: data.patient_phone || '',
      visit_id: data.visit || null,
      doctor_id: data.doctor || null,
      doctor_name: data.doctor_name || '',
      bill_type: (data.bill_type || 'hospital') as BillType,
      category: data.category || '',
      procedures: normalizedProcedures,
      subtotal_amount: parseFloat(data.subtotal_amount || 0),
      discount_percent: parseFloat(data.discount_percent || 0),
      discount_amount: parseFloat(data.discount_amount || 0),
      tax_amount: parseFloat(data.tax_amount || 0),
      total_amount: parseFloat(data.total_amount || 0),
      received_amount: parseFloat(data.received_amount || 0),
      balance_amount: parseFloat(data.balance_amount || 0),
      payment_status: data.payment_status || 'unpaid',
      payment_method: (data.payment_mode || 'cash') as PaymentMode,
      payment_details: data.payment_details || '',
    };

    console.log('Hydrated form data:', hydratedData);
    setFormData(hydratedData);
    setValidationErrors({});
    setError(null);
    setShowPatientSearch(false);
    setShowDoctorSearch(false);
    setShowProcedureSearch(false);
    setPatientSearchText('');
    setDoctorSearchText('');
    setProcedureSearchText('');
  };

  // ---------------------------------------------------------
  // Patient search
  // ---------------------------------------------------------
  const searchPatients = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setAvailablePatients([]);
      return;
    }

    setIsSearchingPatients(true);
    try {
      const response = await fetch(
        `/api/patients/?search=${encodeURIComponent(searchQuery)}&page_size=20`
      );
      if (!response.ok) throw new Error('Failed to search patients');
      const data = await response.json();
      setAvailablePatients(data.results || []);
    } catch (err) {
      console.error('Patient search failed:', err);
    } finally {
      setIsSearchingPatients(false);
    }
  };

  useEffect(() => {
    if (!showPatientSearch) return;

    const timer = setTimeout(() => {
      searchPatients(patientSearchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [patientSearchText, showPatientSearch]);

  const selectPatient = (patient: Patient) => {
    setFormData((prev) => ({
      ...prev,
      patient_id: patient.id,
      patient_name: patient.name,
      patient_phone: patient.phone || '',
    }));
    setShowPatientSearch(false);
    setPatientSearchText('');
    setAvailablePatients([]);
  };

  // ---------------------------------------------------------
  // Doctor selection (using hook)
  // FIXED: Use the correct Doctor type and access properties correctly
  // ---------------------------------------------------------
  const selectDoctor = (doctor: DoctorType) => {
    // Get the doctor name - adjust based on your actual Doctor type structure
    // Common properties might be: first_name + last_name, full_name, or user.name
    const doctorName = 
      (doctor as any).full_name || 
      (doctor as any).name ||
      `${(doctor as any).first_name || ''} ${(doctor as any).last_name || ''}`.trim() ||
      (doctor as any).user?.name ||
      'Unknown Doctor';

    setFormData((prev) => ({
      ...prev,
      doctor_id: doctor.id,
      doctor_name: doctorName,
    }));
    setShowDoctorSearch(false);
    setDoctorSearchText('');
  };

  // ---------------------------------------------------------
  // Procedure selection (using hook)
  // ---------------------------------------------------------
  const addProcedureToBill = (procedure: AvailableProcedure) => {
    if (formData.procedures.some((p) => p.procedure_id === procedure.id)) {
      return;
    }

    const newProcedure: BillProcedure = {
      procedure_id: procedure.id,
      procedure_name: procedure.name,
      procedure_code: procedure.code,
      quantity: 1,
      unit_price: procedure.base_price,
      discount_amount: 0,
      total_amount: procedure.base_price,
      note: '',
    };

    const updatedProcedures = [...formData.procedures, newProcedure];
    updateBillAmounts(updatedProcedures);

    setShowProcedureSearch(false);
    setProcedureSearchText('');
  };

  // ---------------------------------------------------------
  // Form field updates
  // ---------------------------------------------------------
  const updateField = useCallback(
    (field: keyof BillFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (validationErrors[field]) {
        setValidationErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [validationErrors]
  );

  const removeProcedureFromBill = (index: number) => {
    const updatedProcedures = formData.procedures.filter((_, i) => i !== index);
    updateBillAmounts(updatedProcedures);
  };

  const updateProcedureQuantity = (index: number, quantity: number) => {
    const updatedProcedures = [...formData.procedures];
    const qty = Math.max(1, quantity);
    updatedProcedures[index] = {
      ...updatedProcedures[index],
      quantity: qty,
      total_amount:
        updatedProcedures[index].unit_price * qty -
        updatedProcedures[index].discount_amount,
    };
    updateBillAmounts(updatedProcedures);
  };

  const updateProcedureDiscount = (index: number, discount: number) => {
    const updatedProcedures = [...formData.procedures];
    const maxDiscount =
      updatedProcedures[index].unit_price * updatedProcedures[index].quantity;
    const validDiscount = Math.max(0, Math.min(discount, maxDiscount));

    updatedProcedures[index] = {
      ...updatedProcedures[index],
      discount_amount: validDiscount,
      total_amount:
        updatedProcedures[index].unit_price * updatedProcedures[index].quantity -
        validDiscount,
    };
    updateBillAmounts(updatedProcedures);
  };

  const updateProcedureNote = (index: number, note: string) => {
    const updatedProcedures = [...formData.procedures];
    updatedProcedures[index] = {
      ...updatedProcedures[index],
      note,
    };
    setFormData((prev) => ({ ...prev, procedures: updatedProcedures }));
  };

  const updateBillAmounts = (procedures: BillProcedure[]) => {
    const subtotal = procedures.reduce((sum, proc) => sum + proc.total_amount, 0);
    const totalDiscount = procedures.reduce(
      (sum, proc) => sum + proc.discount_amount,
      0
    );
    
    // Calculate discount from percentage
    const discountFromPercent = (subtotal * formData.discount_percent) / 100;
    const finalDiscount = totalDiscount + discountFromPercent;
    
    const tax = (subtotal - finalDiscount) * 0; // Adjust tax rate as needed
    const total = subtotal - finalDiscount + tax;
    const balance = total - formData.received_amount;

    let paymentStatus: 'unpaid' | 'partial' | 'paid' = 'unpaid';
    if (formData.received_amount >= total) {
      paymentStatus = 'paid';
    } else if (formData.received_amount > 0) {
      paymentStatus = 'partial';
    }

    setFormData((prev) => ({
      ...prev,
      procedures,
      subtotal_amount: subtotal,
      discount_amount: finalDiscount,
      tax_amount: tax,
      total_amount: total,
      balance_amount: balance,
      payment_status: paymentStatus,
    }));
  };

  const updateDiscountPercent = (percent: number) => {
    const validPercent = Math.max(0, Math.min(100, percent));
    setFormData((prev) => ({ ...prev, discount_percent: validPercent }));
    updateBillAmounts(formData.procedures);
  };

  const updateReceivedAmount = (amount: number) => {
    const validAmount = Math.max(0, amount);
    const balance = formData.total_amount - validAmount;

    let paymentStatus: 'unpaid' | 'partial' | 'paid' = 'unpaid';
    if (validAmount >= formData.total_amount) {
      paymentStatus = 'paid';
    } else if (validAmount > 0) {
      paymentStatus = 'partial';
    }

    setFormData((prev) => ({
      ...prev,
      received_amount: validAmount,
      balance_amount: balance,
      payment_status: paymentStatus,
    }));
  };

  // ---------------------------------------------------------
  // Validation
  // ---------------------------------------------------------
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formData.patient_id) {
      errors.patient = 'Patient is required';
    }

    if (!formData.doctor_id) {
      errors.doctor = 'Doctor is required';
    }

    if (!formData.bill_date) {
      errors.bill_date = 'Bill date is required';
    }

    if (formData.procedures.length === 0) {
      errors.procedures = 'At least one procedure is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // ---------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------
  const handleClose = useCallback(() => {
    setFormData(EMPTY_FORM);
    setValidationErrors({});
    setError(null);
    setShowPatientSearch(false);
    setShowDoctorSearch(false);
    setShowProcedureSearch(false);
    setPatientSearchText('');
    setDoctorSearchText('');
    setProcedureSearchText('');
    setBillData(null);
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

  const handleSwitchToCollect = useCallback(() => {
    setCurrentMode('collect');
    onModeChange?.('collect');
  }, [onModeChange]);

  const handleDelete = useCallback(async () => {
    if (!billId) return;

    if (
      window.confirm(
        'Are you sure you want to delete this bill? This action cannot be undone.'
      )
    ) {
      try {
        await deleteProcedureBill(billId);
        toast.success('Bill deleted successfully');
        onDelete?.(billId);
        handleClose();
      } catch (error: any) {
        toast.error('Failed to delete bill', {
          description: error?.message || 'Please try again',
        });
      }
    }
  }, [billId, deleteProcedureBill, onDelete, handleClose]);

  const handleSave = useCallback(async () => {
    if (currentMode === 'collect') {
      await handleCollectPayment();
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        visit: formData.visit_id || undefined,
        doctor: formData.doctor_id!,
        bill_type: formData.bill_type,
        category: formData.category || undefined,
        discount_percent: String(formData.discount_percent),
        payment_mode: formData.payment_method,
        payment_details: formData.payment_details || undefined,
        received_amount: String(formData.received_amount),
        items: formData.procedures.map((p, index) => ({
          procedure: p.procedure_id,
          particular_name: p.procedure_name,
          note: p.note || undefined,
          quantity: p.quantity,
          unit_charge: String(p.unit_price),
          item_order: index + 1,
        })),
      };

      if (currentMode === 'edit' && billId) {
        await updateProcedureBill(payload);
        toast.success('Bill updated successfully');
      } else {
        await createProcedureBill(payload);
        toast.success('Bill created successfully');
      }

      onSuccess?.();
      handleClose();
    } catch (err: any) {
      const errorMessage = err?.message || 'An error occurred while saving';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [
    validateForm,
    formData,
    currentMode,
    billId,
    updateProcedureBill,
    createProcedureBill,
    onSuccess,
    handleClose,
  ]);

  const handleCollectPayment = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await recordPayment({
        amount: String(formData.received_amount),
        payment_mode: formData.payment_method,
        payment_details: { notes: formData.payment_details },
      });

      toast.success('Payment collected successfully');
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      const errorMessage =
        err?.message || 'An error occurred while collecting payment';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------------------------------------------------
  // Helper functions
  // ---------------------------------------------------------
  const formatRupee = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // FIXED: Helper function to get doctor name from Doctor type
  const getDoctorName = (doctor: DoctorType): string => {
    return (
      (doctor as any).full_name || 
      (doctor as any).name ||
      `${(doctor as any).first_name || ''} ${(doctor as any).last_name || ''}`.trim() ||
      (doctor as any).user?.name ||
      'Unknown Doctor'
    );
  };

  // ---------------------------------------------------------
  // Drawer configuration
  // ---------------------------------------------------------
  const isViewMode = currentMode === 'view';
  const isCollectMode = currentMode === 'collect';
  const isEditMode = currentMode === 'edit';
  const isCreateMode = currentMode === 'create';

  const drawerTitle =
    isCreateMode
      ? 'Create New Bill'
      : isEditMode
      ? 'Edit Bill'
      : isViewMode
      ? 'View Bill'
      : 'Collect Payment';

  const drawerDescription =
    isCreateMode
      ? 'Create a new procedure bill'
      : isEditMode
      ? 'Update bill information'
      : isViewMode
      ? billData
        ? `Bill ${billData.bill_number || `#${billData.id}`} • ${formData.patient_name}`
        : 'View bill details'
      : 'Collect payment for this bill';

  // Header actions
  const headerActions: DrawerHeaderAction[] =
    isViewMode && billData
      ? [
          {
            icon: Wallet,
            onClick: handleSwitchToCollect,
            label: 'Collect payment',
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

  // Footer buttons
  const footerButtons: DrawerActionButton[] =
    isViewMode
      ? [
          {
            label: 'Close',
            onClick: handleClose,
            variant: 'outline',
          },
        ]
      : isEditMode
      ? [
          {
            label: 'Cancel',
            onClick: handleSwitchToView,
            variant: 'outline',
            disabled: isSaving || isUpdating,
          },
          {
            label: 'Save Changes',
            onClick: handleSave,
            variant: 'default',
            loading: isSaving || isUpdating,
          },
        ]
      : isCollectMode
      ? [
          {
            label: 'Cancel',
            onClick: handleSwitchToView,
            variant: 'outline',
            disabled: isSaving || isRecording,
          },
          {
            label: 'Collect Payment',
            onClick: handleSave,
            variant: 'default',
            loading: isSaving || isRecording,
          },
        ]
      : [
          {
            label: 'Cancel',
            onClick: handleClose,
            variant: 'outline',
            disabled: isSaving || isCreating,
          },
          {
            label: 'Create Bill',
            onClick: handleSave,
            variant: 'default',
            loading: isSaving || isCreating,
          },
        ];

  // Map mode to DrawerMode (collect -> edit for SideDrawer)
  const drawerMode: 'view' | 'edit' | 'create' = 
    isCollectMode ? 'edit' : currentMode as 'view' | 'edit' | 'create';

  // ---------------------------------------------------------
  // Drawer content
  // ---------------------------------------------------------
  const drawerContent = (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Bill Information */}
      {!isCollectMode && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
            Bill Information
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bill_number" className="text-xs">
                Bill Number
              </Label>
              <Input
                id="bill_number"
                value={formData.bill_number}
                onChange={(e) => updateField('bill_number', e.target.value)}
                disabled={isViewMode || isEditMode}
                placeholder="Auto-generated"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bill_date" className="text-xs">
                Bill Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bill_date"
                type="date"
                value={formData.bill_date}
                onChange={(e) => updateField('bill_date', e.target.value)}
                disabled={isViewMode}
                className={validationErrors.bill_date ? 'border-red-500' : ''}
              />
              {validationErrors.bill_date && (
                <p className="text-xs text-red-500">{validationErrors.bill_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs">
                Category
              </Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => updateField('category', e.target.value)}
                disabled={isViewMode}
                placeholder="e.g., General, Dental"
              />
            </div>
          </div>
        </div>
      )}

      {/* Patient Information */}
      {!isCollectMode && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-semibold text-slate-900">
              Patient Information <span className="text-red-500">*</span>
            </h3>
            {!isViewMode && !formData.patient_id && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPatientSearch(!showPatientSearch)}
              >
                <Search className="h-4 w-4 mr-1" />
                Search Patient
              </Button>
            )}
          </div>

          {validationErrors.patient && (
            <p className="text-xs text-red-500">{validationErrors.patient}</p>
          )}

          {/* Patient search box */}
          {showPatientSearch && !isViewMode && (
            <div className="border rounded-lg p-4 bg-slate-50 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, phone, or ID..."
                  value={patientSearchText}
                  onChange={(e) => setPatientSearchText(e.target.value)}
                  className="pl-9"
                />
              </div>

              {isSearchingPatients && (
                <div className="text-xs text-slate-500 text-center py-2">
                  Searching...
                </div>
              )}

              {!isSearchingPatients && availablePatients.length > 0 && (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {availablePatients.map((patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => selectPatient(patient)}
                      className="w-full text-left p-3 border rounded-lg hover:bg-white transition-colors"
                    >
                      <p className="text-sm font-medium text-slate-900">
                        {patient.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {patient.patient_id} • {patient.phone}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {!isSearchingPatients &&
                patientSearchText &&
                availablePatients.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">
                    No patients found. Try a different search term.
                  </p>
                )}
            </div>
          )}

          {/* Selected patient display */}
          {formData.patient_id && (
            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {formData.patient_name}
                  </p>
                  {formData.patient_phone && (
                    <p className="text-xs text-slate-600">{formData.patient_phone}</p>
                  )}
                </div>
                {!isViewMode && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        patient_id: null,
                        patient_name: '',
                        patient_phone: '',
                      }));
                      setShowPatientSearch(true);
                    }}
                    className="h-6 text-xs"
                  >
                    Change
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="visit_id" className="text-xs">
              Visit ID (Optional)
            </Label>
            <Input
              id="visit_id"
              type="number"
              value={formData.visit_id || ''}
              onChange={(e) =>
                updateField('visit_id', parseInt(e.target.value) || null)
              }
              disabled={isViewMode}
              placeholder="Link to OPD visit"
            />
          </div>
        </div>
      )}

      {/* Doctor Information */}
      {!isCollectMode && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-semibold text-slate-900">
              Doctor <span className="text-red-500">*</span>
            </h3>
            {!isViewMode && !formData.doctor_id && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDoctorSearch(!showDoctorSearch)}
              >
                <Search className="h-4 w-4 mr-1" />
                Search Doctor
              </Button>
            )}
          </div>

          {validationErrors.doctor && (
            <p className="text-xs text-red-500">{validationErrors.doctor}</p>
          )}

          {/* Doctor search box - FIXED: Use getDoctorName helper */}
          {showDoctorSearch && !isViewMode && (
            <div className="border rounded-lg p-4 bg-slate-50 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by doctor name..."
                  value={doctorSearchText}
                  onChange={(e) => setDoctorSearchText(e.target.value)}
                  className="pl-9"
                />
              </div>

              {isLoadingDoctors && (
                <div className="text-xs text-slate-500 text-center py-2">
                  Searching...
                </div>
              )}

              {!isLoadingDoctors && doctors.length > 0 && (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {doctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      type="button"
                      onClick={() => selectDoctor(doctor)}
                      className="w-full text-left p-3 border rounded-lg hover:bg-white transition-colors"
                    >
                      <p className="text-sm font-medium text-slate-900">
                        {getDoctorName(doctor)}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {!isLoadingDoctors &&
                doctorSearchText &&
                doctors.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">
                    No doctors found. Try a different search term.
                  </p>
                )}
            </div>
          )}

          {/* Selected doctor display */}
          {formData.doctor_id && (
            <div className="border rounded-lg p-4 bg-green-50 border-green-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {formData.doctor_name}
                  </p>
                </div>
                {!isViewMode && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        doctor_id: null,
                        doctor_name: '',
                      }));
                      setShowDoctorSearch(true);
                    }}
                    className="h-6 text-xs"
                  >
                    Change
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Procedures - FIXED: Use procedureMasters instead of procedures */}
      {!isCollectMode && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-semibold text-slate-900">
              Procedures <span className="text-red-500">*</span>
            </h3>
            {!isViewMode && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowProcedureSearch(!showProcedureSearch)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Procedure
              </Button>
            )}
          </div>

          {validationErrors.procedures && (
            <p className="text-xs text-red-500">{validationErrors.procedures}</p>
          )}

          {/* Procedure search box */}
          {showProcedureSearch && !isViewMode && (
            <div className="border rounded-lg p-4 bg-slate-50 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search procedures by name or code..."
                  value={procedureSearchText}
                  onChange={(e) => setProcedureSearchText(e.target.value)}
                  className="pl-9"
                />
              </div>

              {isLoadingProcedures && (
                <div className="text-xs text-slate-500 text-center py-2">
                  Searching...
                </div>
              )}

              {!isLoadingProcedures && procedureMasters.length > 0 && (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {procedureMasters.map((proc) => (
                    <button
                      key={proc.id}
                      type="button"
                      onClick={() => addProcedureToBill({
                        id: proc.id,
                        name: proc.name,
                        code: proc.code,
                        base_price: parseFloat(proc.default_charge),
                      })}
                      className="w-full text-left p-3 border rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={formData.procedures.some(
                        (p) => p.procedure_id === proc.id
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {proc.name}
                          </p>
                          <p className="text-xs text-slate-500">{proc.code}</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          ₹{parseFloat(proc.default_charge).toFixed(2)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!isLoadingProcedures &&
                procedureSearchText &&
                procedureMasters.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">
                    No procedures found. Try a different search term.
                  </p>
                )}
            </div>
          )}

          {/* Selected procedures list */}
          {formData.procedures.length > 0 ? (
            <div className="space-y-2">
              {formData.procedures.map((proc, index) => (
                <div
                  key={index}
                  className="border rounded-lg bg-white p-3 space-y-2"
                >
                  <div className="grid grid-cols-12 gap-2 items-center text-xs">
                    <div className="col-span-4">
                      <p className="font-medium text-slate-900 text-sm">
                        {proc.procedure_name}
                      </p>
                      {proc.procedure_code && (
                        <p className="text-slate-500">{proc.procedure_code}</p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <Label className="text-[10px] text-slate-500">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        value={proc.quantity}
                        onChange={(e) =>
                          updateProcedureQuantity(
                            index,
                            parseInt(e.target.value) || 1
                          )
                        }
                        disabled={isViewMode}
                        className="h-7 mt-1"
                      />
                    </div>

                    <div className="col-span-2 text-right">
                      <Label className="text-[10px] text-slate-500">Unit Price</Label>
                      <p className="font-medium mt-1">₹{proc.unit_price.toFixed(2)}</p>
                    </div>

                    <div className="col-span-2">
                      <Label className="text-[10px] text-slate-500">Discount</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={proc.discount_amount}
                        onChange={(e) =>
                          updateProcedureDiscount(
                            index,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        disabled={isViewMode}
                        className="h-7 mt-1"
                      />
                    </div>

                    <div className="col-span-2 flex items-end justify-between">
                      <div className="text-right flex-1">
                        <Label className="text-[10px] text-slate-500">Total</Label>
                        <p className="font-semibold text-slate-900 mt-1">
                          ₹{proc.total_amount.toFixed(2)}
                        </p>
                      </div>
                      {!isViewMode && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProcedureFromBill(index)}
                          className="h-7 w-7 p-0 ml-2"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Note field */}
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500">Note (Optional)</Label>
                    <Input
                      value={proc.note || ''}
                      onChange={(e) => updateProcedureNote(index, e.target.value)}
                      disabled={isViewMode}
                      placeholder="Add a note for this procedure..."
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm border rounded-lg bg-slate-50">
              No procedures added yet. Click "Add Procedure" to get started.
            </div>
          )}
        </div>
      )}

      {/* Bill Summary */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
          Bill Summary
        </h3>

        <div className="bg-slate-50 border rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal:</span>
            <span className="font-medium text-slate-900">
              {formatRupee(formData.subtotal_amount)}
            </span>
          </div>
          
          <div className="flex justify-between text-sm items-center">
            <span className="text-slate-600">Discount:</span>
            <div className="flex items-center gap-2">
              {!isViewMode && (
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.discount_percent}
                  onChange={(e) =>
                    updateDiscountPercent(parseFloat(e.target.value) || 0)
                  }
                  className="h-7 w-20 text-xs"
                  placeholder="0"
                />
              )}
              <span className="font-medium text-red-600">
                - {formatRupee(formData.discount_amount)} ({formData.discount_percent}%)
              </span>
            </div>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Tax:</span>
            <span className="font-medium text-slate-900">
              {formatRupee(formData.tax_amount)}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t">
            <span className="text-slate-900">Total Amount:</span>
            <span className="text-slate-900">
              {formatRupee(formData.total_amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
          Payment Information
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="received_amount" className="text-xs">
              Received Amount
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="received_amount"
                type="number"
                step="0.01"
                value={formData.received_amount}
                onChange={(e) =>
                  updateReceivedAmount(parseFloat(e.target.value) || 0)
                }
                disabled={isViewMode}
                className="pl-9"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method" className="text-xs">
              Payment Method
            </Label>
            <select
              id="payment_method"
              value={formData.payment_method}
              onChange={(e) => updateField('payment_method', e.target.value as PaymentMode)}
              disabled={isViewMode}
              className="w-full h-10 px-3 py-2 text-sm border rounded-md"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="bank">Bank Transfer</option>
              <option value="multiple">Multiple Methods</option>
            </select>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-slate-700">Balance Amount:</p>
              <p className="text-2xl font-bold text-blue-700">
                {formatRupee(formData.balance_amount)}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={
                formData.payment_status === 'paid'
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : formData.payment_status === 'partial'
                  ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                  : 'bg-red-100 text-red-700 border-red-200'
              }
            >
              {formData.payment_status.charAt(0).toUpperCase() +
                formData.payment_status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_details" className="text-xs">
            Payment Details / Notes
          </Label>
          <Textarea
            id="payment_details"
            value={formData.payment_details}
            onChange={(e) => updateField('payment_details', e.target.value)}
            disabled={isViewMode}
            placeholder="Additional payment details or notes"
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  return (
    <SideDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={drawerTitle}
      description={drawerDescription}
      mode={drawerMode}
      headerActions={headerActions}
      isLoading={isLoading}
      loadingText="Loading bill data..."
      size="xl"
      footerButtons={footerButtons}
      footerAlignment="right"
      showBackButton={true}
      resizable={true}
      storageKey="procedure-bill-drawer-width"
      onClose={handleClose}
    >
      {drawerContent}
    </SideDrawer>
  );
}
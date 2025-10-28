// src/components/opd/ProcedureBillDrawer.tsx
import { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertCircle, Plus, Trash2, Search, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface BillProcedure {
  id?: number;
  procedure_id: number;
  procedure_name?: string;
  procedure_code?: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_amount: number;
}

interface BillFormData {
  bill_number: string;
  bill_date: string;
  patient_id: number | null;
  patient_name: string;
  patient_phone: string;
  visit_id: number | null;
  procedures: BillProcedure[];
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  received_amount: number;
  balance_amount: number;
  payment_status: 'unpaid' | 'partial' | 'paid';
  payment_method: string;
  notes: string;
}

interface ProcedureBillDrawerProps {
  open: boolean;
  onClose: () => void;
  billId?: number | null;
  mode: 'create' | 'edit' | 'view' | 'collect';
  onSuccess?: () => void;
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

const initialFormData: BillFormData = {
  bill_number: '',
  bill_date: new Date().toISOString().split('T')[0],
  patient_id: null,
  patient_name: '',
  patient_phone: '',
  visit_id: null,
  procedures: [],
  subtotal_amount: 0,
  discount_amount: 0,
  tax_amount: 0,
  total_amount: 0,
  received_amount: 0,
  balance_amount: 0,
  payment_status: 'unpaid',
  payment_method: 'cash',
  notes: '',
};

export default function ProcedureBillDrawer({
  open,
  onClose,
  billId,
  mode,
  onSuccess,
}: ProcedureBillDrawerProps) {
  const [formData, setFormData] = useState<BillFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Patient search
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [patientSearchText, setPatientSearchText] = useState('');
  const [availablePatients, setAvailablePatients] = useState<Patient[]>([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);

  // Procedure search
  const [showProcedureSearch, setShowProcedureSearch] = useState(false);
  const [procedureSearchText, setProcedureSearchText] = useState('');
  const [availableProcedures, setAvailableProcedures] = useState<AvailableProcedure[]>([]);
  const [isSearchingProcedures, setIsSearchingProcedures] = useState(false);

  const isViewMode = mode === 'view';
  const isCollectMode = mode === 'collect';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  // Fetch bill data when editing/viewing/collecting
  useEffect(() => {
    if (open && billId && (isEditMode || isViewMode || isCollectMode)) {
      fetchBillData();
    } else if (open && isCreateMode) {
      setFormData(initialFormData);
      setError(null);
      setValidationErrors({});
    }
  }, [open, billId, mode]);

  const fetchBillData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/opd/procedure-bills/${billId}/`);
      if (!response.ok) throw new Error('Failed to fetch bill data');
      const data = await response.json();
      
      setFormData({
        bill_number: data.bill_number || '',
        bill_date: data.bill_date || new Date().toISOString().split('T')[0],
        patient_id: data.patient_id || data.patient || null,
        patient_name: data.patient_name || '',
        patient_phone: data.patient_phone || '',
        visit_id: data.visit_id || data.visit || null,
        procedures: data.procedures || data.bill_items || [],
        subtotal_amount: parseFloat(data.subtotal_amount || 0),
        discount_amount: parseFloat(data.discount_amount || 0),
        tax_amount: parseFloat(data.tax_amount || 0),
        total_amount: parseFloat(data.total_amount || 0),
        received_amount: parseFloat(data.received_amount || 0),
        balance_amount: parseFloat(data.balance_amount || 0),
        payment_status: data.payment_status || 'unpaid',
        payment_method: data.payment_method || 'cash',
        notes: data.notes || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bill data');
    } finally {
      setIsLoading(false);
    }
  };

  // Search for patients
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

  // Search for procedures
  const searchProcedures = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setAvailableProcedures([]);
      return;
    }

    setIsSearchingProcedures(true);
    try {
      const response = await fetch(
        `/api/opd/procedure-masters/?search=${encodeURIComponent(searchQuery)}&is_active=true&page_size=20`
      );
      if (!response.ok) throw new Error('Failed to search procedures');
      const data = await response.json();
      setAvailableProcedures(data.results || []);
    } catch (err) {
      console.error('Procedure search failed:', err);
    } finally {
      setIsSearchingProcedures(false);
    }
  };

  // Debounce patient search
  useEffect(() => {
    if (!showPatientSearch) return;
    
    const timer = setTimeout(() => {
      searchPatients(patientSearchText);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [patientSearchText, showPatientSearch]);

  // Debounce procedure search
  useEffect(() => {
    if (!showProcedureSearch) return;
    
    const timer = setTimeout(() => {
      searchProcedures(procedureSearchText);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [procedureSearchText, showProcedureSearch]);

  const handleChange = (
    field: keyof BillFormData,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const selectPatient = (patient: Patient) => {
    setFormData(prev => ({
      ...prev,
      patient_id: patient.id,
      patient_name: patient.name,
      patient_phone: patient.phone || '',
    }));
    setShowPatientSearch(false);
    setPatientSearchText('');
    setAvailablePatients([]);
  };

  const addProcedureToBill = (procedure: AvailableProcedure) => {
    // Check if already added
    if (formData.procedures.some(p => p.procedure_id === procedure.id)) {
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
    };

    const updatedProcedures = [...formData.procedures, newProcedure];
    updateBillAmounts(updatedProcedures);
    
    setShowProcedureSearch(false);
    setProcedureSearchText('');
    setAvailableProcedures([]);
  };

  const removeProcedureFromBill = (index: number) => {
    const updatedProcedures = formData.procedures.filter((_, i) => i !== index);
    updateBillAmounts(updatedProcedures);
  };

  const updateProcedureQuantity = (index: number, quantity: number) => {
    const updatedProcedures = [...formData.procedures];
    updatedProcedures[index] = {
      ...updatedProcedures[index],
      quantity: Math.max(1, quantity),
      total_amount: updatedProcedures[index].unit_price * Math.max(1, quantity) - updatedProcedures[index].discount_amount,
    };
    updateBillAmounts(updatedProcedures);
  };

  const updateProcedureDiscount = (index: number, discount: number) => {
    const updatedProcedures = [...formData.procedures];
    const maxDiscount = updatedProcedures[index].unit_price * updatedProcedures[index].quantity;
    const validDiscount = Math.max(0, Math.min(discount, maxDiscount));
    
    updatedProcedures[index] = {
      ...updatedProcedures[index],
      discount_amount: validDiscount,
      total_amount: (updatedProcedures[index].unit_price * updatedProcedures[index].quantity) - validDiscount,
    };
    updateBillAmounts(updatedProcedures);
  };

  const updateBillAmounts = (procedures: BillProcedure[]) => {
    const subtotal = procedures.reduce((sum, proc) => sum + proc.total_amount, 0);
    const totalDiscount = procedures.reduce((sum, proc) => sum + proc.discount_amount, 0);
    const tax = subtotal * 0; // Adjust tax rate as needed
    const total = subtotal + tax;
    const balance = total - formData.received_amount;
    
    let paymentStatus: 'unpaid' | 'partial' | 'paid' = 'unpaid';
    if (formData.received_amount >= total) {
      paymentStatus = 'paid';
    } else if (formData.received_amount > 0) {
      paymentStatus = 'partial';
    }

    setFormData(prev => ({
      ...prev,
      procedures,
      subtotal_amount: subtotal,
      discount_amount: totalDiscount,
      tax_amount: tax,
      total_amount: total,
      balance_amount: balance,
      payment_status: paymentStatus,
    }));
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

    setFormData(prev => ({
      ...prev,
      received_amount: validAmount,
      balance_amount: balance,
      payment_status: paymentStatus,
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.patient_id) {
      errors.patient = 'Patient is required';
    }
    
    if (!formData.bill_date) {
      errors.bill_date = 'Bill date is required';
    }

    if (formData.procedures.length === 0) {
      errors.procedures = 'At least one procedure is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (isCollectMode) {
      // Only update payment information
      await handleCollectPayment();
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        bill_number: formData.bill_number || undefined,
        bill_date: formData.bill_date,
        patient: formData.patient_id,
        visit: formData.visit_id || undefined,
        procedures: formData.procedures.map(p => ({
          procedure: p.procedure_id,
          quantity: p.quantity,
          unit_price: p.unit_price,
          discount_amount: p.discount_amount,
          total_amount: p.total_amount,
        })),
        subtotal_amount: formData.subtotal_amount,
        discount_amount: formData.discount_amount,
        tax_amount: formData.tax_amount,
        total_amount: formData.total_amount,
        received_amount: formData.received_amount,
        balance_amount: formData.balance_amount,
        payment_status: formData.payment_status,
        payment_method: formData.payment_method,
        notes: formData.notes,
      };

      const url = isEditMode
        ? `/api/opd/procedure-bills/${billId}/`
        : '/api/opd/procedure-bills/';
      
      const method = isEditMode ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save bill');
      }

      // Success!
      onSuccess?.();
      onClose();
      setFormData(initialFormData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCollectPayment = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/opd/procedure-bills/${billId}/collect-payment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: formData.received_amount,
          payment_method: formData.payment_method,
          notes: formData.notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to collect payment');
      }

      onSuccess?.();
      onClose();
      setFormData(initialFormData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while collecting payment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
      setFormData(initialFormData);
      setError(null);
      setValidationErrors({});
      setShowPatientSearch(false);
      setShowProcedureSearch(false);
      setPatientSearchText('');
      setProcedureSearchText('');
      setAvailablePatients([]);
      setAvailableProcedures([]);
    }
  };

  const formatRupee = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isCreateMode && 'Create New Bill'}
            {isEditMode && 'Edit Bill'}
            {isViewMode && 'View Bill'}
            {isCollectMode && 'Collect Payment'}
          </SheetTitle>
          <SheetDescription>
            {isCreateMode && 'Create a new procedure bill'}
            {isEditMode && 'Update bill information'}
            {isViewMode && 'View bill details'}
            {isCollectMode && 'Collect payment for this bill'}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-6 space-y-6">
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bill_number" className="text-xs">
                      Bill Number
                    </Label>
                    <Input
                      id="bill_number"
                      value={formData.bill_number}
                      onChange={(e) => handleChange('bill_number', e.target.value)}
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
                      onChange={(e) => handleChange('bill_date', e.target.value)}
                      disabled={isViewMode}
                      className={validationErrors.bill_date ? 'border-red-500' : ''}
                    />
                    {validationErrors.bill_date && (
                      <p className="text-xs text-red-500">{validationErrors.bill_date}</p>
                    )}
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
                            <p className="text-sm font-medium text-slate-900">{patient.name}</p>
                            <p className="text-xs text-slate-500">
                              {patient.patient_id} • {patient.phone}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}

                    {!isSearchingPatients && patientSearchText && availablePatients.length === 0 && (
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
                        <p className="text-sm font-semibold text-slate-900">{formData.patient_name}</p>
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
                            setFormData(prev => ({
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
                    onChange={(e) => handleChange('visit_id', parseInt(e.target.value) || null)}
                    disabled={isViewMode}
                    placeholder="Link to OPD visit"
                  />
                </div>
              </div>
            )}

            {/* Procedures */}
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

                    {isSearchingProcedures && (
                      <div className="text-xs text-slate-500 text-center py-2">
                        Searching...
                      </div>
                    )}

                    {!isSearchingProcedures && availableProcedures.length > 0 && (
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {availableProcedures.map((proc) => (
                          <button
                            key={proc.id}
                            type="button"
                            onClick={() => addProcedureToBill(proc)}
                            className="w-full text-left p-3 border rounded-lg hover:bg-white transition-colors"
                            disabled={formData.procedures.some(p => p.procedure_id === proc.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-medium text-slate-900">{proc.name}</p>
                                <p className="text-xs text-slate-500">{proc.code}</p>
                              </div>
                              <p className="text-sm font-semibold text-slate-900">
                                ₹{proc.base_price.toFixed(2)}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {!isSearchingProcedures && procedureSearchText && availableProcedures.length === 0 && (
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
                        className="grid grid-cols-12 gap-2 p-3 border rounded-lg bg-white items-center text-xs"
                      >
                        <div className="col-span-4">
                          <p className="font-medium text-slate-900 text-sm">
                            {proc.procedure_name}
                          </p>
                          <p className="text-slate-500">{proc.procedure_code}</p>
                        </div>

                        <div className="col-span-2">
                          <Label className="text-[10px] text-slate-500">Qty</Label>
                          <Input
                            type="number"
                            min="1"
                            value={proc.quantity}
                            onChange={(e) => updateProcedureQuantity(index, parseInt(e.target.value) || 1)}
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
                            onChange={(e) => updateProcedureDiscount(index, parseFloat(e.target.value) || 0)}
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
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Discount:</span>
                  <span className="font-medium text-red-600">
                    - {formatRupee(formData.discount_amount)}
                  </span>
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
                      onChange={(e) => updateReceivedAmount(parseFloat(e.target.value) || 0)}
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
                    onChange={(e) => handleChange('payment_method', e.target.value)}
                    disabled={isViewMode}
                    className="w-full h-10 px-3 py-2 text-sm border rounded-md"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="cheque">Cheque</option>
                    <option value="online">Online Transfer</option>
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
                    {formData.payment_status.charAt(0).toUpperCase() + formData.payment_status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-xs">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  disabled={isViewMode}
                  placeholder="Additional notes or comments"
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            {!isViewMode && (
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isCollectMode ? 'Processing...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isCreateMode && 'Create Bill'}
                      {isEditMode && 'Update Bill'}
                      {isCollectMode && 'Collect Payment'}
                    </>
                  )}
                </Button>
              </div>
            )}

            {isViewMode && (
              <div className="flex justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Close
                </Button>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
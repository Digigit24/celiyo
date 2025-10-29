// src/components/opd/PackageFormDrawer.tsx

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Save,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  Search,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Alert, AlertDescription } from '@/components/ui/alert';

import {
  useProcedurePackage,
  useCreateProcedurePackage,
  useUpdateProcedurePackage,
} from '@/hooks/opd/useProcedurePackage.hooks';
import { useProcedureMasters } from '@/hooks/opd/useProcedureMaster.hooks';

// ---------------------------------------------------------
// Local form types
// ---------------------------------------------------------

interface PackageProcedure {
  id?: number;
  procedure_id: number;
  procedure_name?: string;
  procedure_code?: string;
  procedure_price?: number;
  quantity: number;
}

interface PackageFormData {
  package_name: string;
  package_code: string;
  description: string;
  package_price: string;        // UI field (this will become discounted_charge)
  discount_percent: string;     // derived UI-only
  validity_days: string;        // UI-only
  is_active: boolean;
  procedures: PackageProcedure[];
}

interface PackageFormDrawerProps {
  open: boolean;
  onClose: () => void;
  packageId?: number | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess?: () => void;
}

const EMPTY_FORM: PackageFormData = {
  package_name: '',
  package_code: '',
  description: '',
  package_price: '',
  discount_percent: '',
  validity_days: '',
  is_active: true,
  procedures: [],
};

export default function PackageFormDrawer({
  open,
  onClose,
  packageId,
  mode,
  onSuccess,
}: PackageFormDrawerProps) {
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  const [formData, setFormData] = useState<PackageFormData>(EMPTY_FORM);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---------------------------------------------------------
  // fetch existing package if editing or viewing
  // ---------------------------------------------------------
  const shouldFetchPackage =
    open && packageId && (isEditMode || isViewMode) ? packageId : null;

  const {
    procedurePackage,
    isLoading: isPackageLoading,
    error: packageError,
  } = useProcedurePackage(shouldFetchPackage);

  // ---------------------------------------------------------
  // mutations
  // ---------------------------------------------------------
  const {
    createProcedurePackage,
    isCreating,
    error: createError,
  } = useCreateProcedurePackage();

  const {
    updateProcedurePackage,
    isUpdating,
    error: updateError,
  } = useUpdateProcedurePackage(packageId || 0);

  const isSaving = isSubmitting || isCreating || isUpdating;

  useEffect(() => {
    if (createError) {
      setError((createError as any)?.message || 'Failed to create package');
    }
  }, [createError]);

  useEffect(() => {
    if (updateError) {
      setError((updateError as any)?.message || 'Failed to update package');
    }
  }, [updateError]);

  // ---------------------------------------------------------
  // procedure picker state
  // ---------------------------------------------------------
  const [showProcedureSearch, setShowProcedureSearch] = useState(false);
  const [procedureSearchText, setProcedureSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (!showProcedureSearch) return;
    const t = setTimeout(() => setDebouncedSearch(procedureSearchText), 300);
    return () => clearTimeout(t);
  }, [procedureSearchText, showProcedureSearch]);

  // load available procedures from master
  const {
    procedureMasters: availableProcedureMasters,
    isLoading: isProceduresLoading,
  } = useProcedureMasters({
    is_active: true,
    search: debouncedSearch || undefined,
    page_size: 20,
  });

  const availableProcedures = useMemo(() => {
    return (availableProcedureMasters || []).map((proc: any) => ({
      id: proc.id,
      name: proc.name,
      code: proc.code,
      base_price: parseFloat(proc.default_charge) || 0,
    }));
  }, [availableProcedureMasters]);

  // ---------------------------------------------------------
  // init create mode
  // ---------------------------------------------------------
  useEffect(() => {
    if (open && isCreateMode) {
      setFormData(EMPTY_FORM);
      setValidationErrors({});
      setError(null);
    }
  }, [open, isCreateMode]);

  // ---------------------------------------------------------
  // hydrate form in edit/view mode from API data
  // ---------------------------------------------------------
  useEffect(() => {
    // Only run this effect for edit/view modes
    if (!open || isCreateMode) return;
    
    // If still loading, wait
    if (isPackageLoading) return;

    // Handle error case
    if (packageError) {
      setError(
        (packageError as any)?.message || 'Failed to load package data'
      );
      return;
    }

    // If no package data after loading is complete, don't proceed
    if (!procedurePackage) {
      return;
    }

    console.log('Hydrating form with package data:', procedurePackage);

    // API response structure:
    // {
    //   "id": 1,
    //   "name": "sfcsc",
    //   "code": "scf",
    //   "procedures": [
    //     {
    //       "id": 3,
    //       "name": "ECG",
    //       "code": "CARD001",
    //       "category": "cardiology",
    //       "default_charge": "400.00",
    //       "is_active": true
    //     }
    //   ],
    //   "total_charge": "400.00",
    //   "discounted_charge": "200.00",
    //   "discount_percent": "50.00",
    //   "savings_amount": "200.00",
    //   "is_active": true
    // }

    const backendProcs = (procedurePackage as any).procedures || [];

    const normalizedProcedures: PackageProcedure[] = backendProcs.map(
      (p: any) => ({
        // The procedure object has its own id, which is the procedure_id we need
        id: p.id,
        procedure_id: p.id,
        procedure_name: p.name ?? '',
        procedure_code: p.code ?? '',
        procedure_price: parseFloat(p.default_charge ?? 0),
        quantity: 1, // Backend doesn't send quantity, default to 1
      })
    );

    // Map the package fields from API response
    const pkgName = (procedurePackage as any).name ?? '';
    const pkgCode = (procedurePackage as any).code ?? '';
    const pkgDesc = (procedurePackage as any).description ?? '';
    const pkgDiscountedCharge = (procedurePackage as any).discounted_charge ?? '';
    const pkgActive = (procedurePackage as any).is_active ?? true;
    
    // Also capture discount_percent from API if available (for display)
    const pkgDiscountPercent = (procedurePackage as any).discount_percent ?? '';

    const hydratedData = {
      package_name: String(pkgName),
      package_code: String(pkgCode),
      description: String(pkgDesc),
      package_price: pkgDiscountedCharge !== undefined && pkgDiscountedCharge !== null
        ? String(pkgDiscountedCharge)
        : '',
      discount_percent: pkgDiscountPercent ? String(pkgDiscountPercent) : '',
      validity_days: '',
      is_active: !!pkgActive,
      procedures: normalizedProcedures,
    };

    console.log('Setting form data to:', hydratedData);
    setFormData(hydratedData);
    setValidationErrors({});
    setError(null);
  }, [open, procedurePackage, packageError, isPackageLoading, isCreateMode]);

  // ---------------------------------------------------------
  // helpers to update individual fields
  // ---------------------------------------------------------
  const updateField = useCallback(
    (field: keyof PackageFormData, value: any) => {
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

  // ---------------------------------------------------------
  // procedure list mgmt
  // ---------------------------------------------------------
  const addProcedureToPackage = (proc: {
    id: number;
    name: string;
    code: string;
    base_price: number;
  }) => {
    if (formData.procedures.some((p) => p.procedure_id === proc.id)) {
      return;
    }

    const newProc: PackageProcedure = {
      procedure_id: proc.id,
      procedure_name: proc.name,
      procedure_code: proc.code,
      procedure_price: proc.base_price,
      quantity: 1,
    };

    updateField('procedures', [...formData.procedures, newProc]);

    setShowProcedureSearch(false);
    setProcedureSearchText('');
  };

  const removeProcedureFromPackage = (index: number) => {
    const updated = formData.procedures.filter((_, i) => i !== index);
    updateField('procedures', updated);
  };

  const updateProcedureQuantity = (index: number, qty: number) => {
    const normalizedQty = Number.isFinite(qty) && qty > 0 ? qty : 1;
    const updated = [...formData.procedures];
    updated[index] = {
      ...updated[index],
      quantity: normalizedQty,
    };
    updateField('procedures', updated);
  };

  // ---------------------------------------------------------
  // pricing helpers
  // ---------------------------------------------------------
  // totalBasePrice is the sum of procedure_price * quantity
  // this becomes total_charge in the payload
  const totalBasePrice = useMemo(() => {
    return formData.procedures.reduce((sum, proc) => {
      const line =
        (proc.procedure_price || 0) * (proc.quantity || 1);
      return sum + line;
    }, 0);
  }, [formData.procedures]);

  // discountAmount = total_base - selling_price
  const discountAmount = useMemo(() => {
    const discounted = parseFloat(formData.package_price) || 0;
    return totalBasePrice - discounted > 0
      ? totalBasePrice - discounted
      : 0;
  }, [totalBasePrice, formData.package_price]);

  // derive discount_percent just for UI (but don't override if we got it from API)
  useEffect(() => {
    // Skip auto-calculation if in view mode or if we already have a value from API
    if (isViewMode) return;
    
    if (formData.package_price && formData.procedures.length > 0) {
      const discounted = parseFloat(formData.package_price);
      if (!isNaN(discounted) && totalBasePrice > 0) {
        const pct =
          ((totalBasePrice - discounted) / totalBasePrice) * 100;
        if (pct >= 0) {
          setFormData((prev) => ({
            ...prev,
            discount_percent: pct.toFixed(2),
          }));
        }
      }
    }
  }, [formData.package_price, formData.procedures, totalBasePrice, isViewMode]);

  // ---------------------------------------------------------
  // validation
  // ---------------------------------------------------------
  const validateForm = useCallback(() => {
    const errs: Record<string, string> = {};

    if (!formData.package_name.trim()) {
      errs.package_name = 'Package name is required';
    }
    if (!formData.package_code.trim()) {
      errs.package_code = 'Package code is required';
    }

    // selling price = discounted_charge
    if (!formData.package_price.trim()) {
      errs.package_price = 'Selling price is required';
    } else if (
      isNaN(parseFloat(formData.package_price))
    ) {
      errs.package_price = 'Please enter a valid number';
    }

    if (formData.procedures.length === 0) {
      errs.procedures = 'At least one procedure is required';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  }, [formData]);

  // ---------------------------------------------------------
  // close
  // ---------------------------------------------------------
  const handleClose = useCallback(() => {
    if (isSaving) return;
    onClose();

    setFormData(EMPTY_FORM);
    setValidationErrors({});
    setError(null);
    setShowProcedureSearch(false);
    setProcedureSearchText('');
  }, [isSaving, onClose]);

  // ---------------------------------------------------------
  // submit
  // ---------------------------------------------------------
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const total_charge_str = String(totalBasePrice);
      const discounted_charge_str = formData.package_price.trim();

      const payload = {
        name: formData.package_name.trim(),
        code: formData.package_code.trim(),
        procedures: formData.procedures.map((p) => p.procedure_id),
        total_charge: total_charge_str,
        discounted_charge: discounted_charge_str,
        is_active: formData.is_active,
      };

      if (isEditMode && packageId) {
        await updateProcedurePackage(payload);
      } else {
        await createProcedurePackage(payload);
      }

      onSuccess?.();
      handleClose();
    } catch (err: any) {
      setError(err?.message || 'An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateForm,
    formData,
    totalBasePrice,
    isEditMode,
    packageId,
    updateProcedurePackage,
    createProcedurePackage,
    onSuccess,
    handleClose,
  ]);

  // ---------------------------------------------------------
  // header text
  // ---------------------------------------------------------
  const titleText = isCreateMode
    ? 'Create New Package'
    : isEditMode
    ? 'Edit Package'
    : 'View Package';

  const descriptionText = isCreateMode
    ? 'Create a bundled procedure package with discounted pricing'
    : isEditMode
    ? 'Update package information and procedures'
    : 'View package details';

  const effectiveLoading = isPackageLoading && (isEditMode || isViewMode);

  console.log('Current formData:', formData);
  console.log('isPackageLoading:', isPackageLoading);
  console.log('procedurePackage:', procedurePackage);

  // ---------------------------------------------------------
  // render
  // ---------------------------------------------------------
  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{titleText}</SheetTitle>
          <SheetDescription>{descriptionText}</SheetDescription>
        </SheetHeader>

        {effectiveLoading ? (
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

            {/* BASIC INFO */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
                Basic Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Package Name */}
                <div className="space-y-2">
                  <Label htmlFor="package_name" className="text-xs">
                    Package Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="package_name"
                    value={formData.package_name}
                    onChange={(e) =>
                      updateField('package_name', e.target.value)
                    }
                    disabled={isViewMode}
                    placeholder="e.g., Cardiac Check-up Package"
                    className={
                      validationErrors.package_name ? 'border-red-500' : ''
                    }
                  />
                  {validationErrors.package_name && (
                    <p className="text-xs text-red-500">
                      {validationErrors.package_name}
                    </p>
                  )}
                </div>

                {/* Package Code */}
                <div className="space-y-2">
                  <Label htmlFor="package_code" className="text-xs">
                    Package Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="package_code"
                    value={formData.package_code}
                    onChange={(e) =>
                      updateField('package_code', e.target.value)
                    }
                    disabled={isViewMode}
                    placeholder="e.g., PKG-CARDIAC-001"
                    className={
                      validationErrors.package_code ? 'border-red-500' : ''
                    }
                  />
                  {validationErrors.package_code && (
                    <p className="text-xs text-red-500">
                      {validationErrors.package_code}
                    </p>
                  )}
                </div>
              </div>

              {/* Description (not sent to backend, but still useful for user) */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    updateField('description', e.target.value)
                  }
                  disabled={isViewMode}
                  placeholder="Brief description of the package"
                  rows={3}
                />
              </div>
            </div>

            {/* PROCEDURES */}
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
                    onClick={() => setShowProcedureSearch((prev) => !prev)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Procedure
                  </Button>
                )}
              </div>

              {validationErrors.procedures && (
                <p className="text-xs text-red-500">
                  {validationErrors.procedures}
                </p>
              )}

              {/* procedure search drawer */}
              {showProcedureSearch && !isViewMode && (
                <div className="border rounded-lg p-4 bg-slate-50 space-y-3">
                  {/* search field */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search procedures by name or code..."
                      value={procedureSearchText}
                      onChange={(e) => setProcedureSearchText(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* searching/loading */}
                  {isProceduresLoading && (
                    <div className="text-xs text-slate-500 text-center py-2">
                      Searching...
                    </div>
                  )}

                  {/* results */}
                  {!isProceduresLoading &&
                    availableProcedures.length > 0 && (
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {availableProcedures.map((proc) => (
                          <button
                            key={proc.id}
                            type="button"
                            onClick={() => addProcedureToPackage(proc)}
                            className="w-full text-left p-3 border rounded-lg hover:bg-white transition-colors"
                            disabled={formData.procedures.some(
                              (p) => p.procedure_id === proc.id
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-medium text-slate-900">
                                  {proc.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {proc.code}
                                </p>
                              </div>
                              <p className="text-sm font-semibold text-slate-900">
                                ₹{proc.base_price.toFixed(2)}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                  {/* no results state */}
                  {!isProceduresLoading &&
                    debouncedSearch &&
                    availableProcedures.length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-4">
                        No procedures found. Try a different search term.
                      </p>
                    )}
                </div>
              )}

              {/* Selected procedures */}
              {formData.procedures.length > 0 ? (
                <div className="space-y-2">
                  {formData.procedures.map((proc, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border rounded-lg bg-white"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {proc.procedure_name || 'Unnamed Procedure'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {proc.procedure_code} • ₹
                          {(proc.procedure_price || 0).toFixed(2)} each
                        </p>
                      </div>

                      {/* Qty */}
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`qty-${index}`}
                          className="text-xs whitespace-nowrap"
                        >
                          Qty:
                        </Label>
                        <Input
                          id={`qty-${index}`}
                          type="number"
                          min="1"
                          value={proc.quantity || 1}
                          onChange={(e) =>
                            updateProcedureQuantity(
                              index,
                              parseInt(e.target.value) || 1
                            )
                          }
                          disabled={isViewMode}
                          className="w-20 h-8"
                        />
                      </div>

                      {/* line total */}
                      <div className="text-sm font-semibold text-slate-900 min-w-[80px] text-right">
                        ₹
                        {(
                          (proc.procedure_price || 0) *
                          (proc.quantity || 1)
                        ).toFixed(2)}
                      </div>

                      {!isViewMode && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProcedureFromPackage(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm border rounded-lg bg-slate-50">
                  No procedures added yet. Click "Add Procedure" to get started.
                </div>
              )}
            </div>

            {/* PRICING */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
                Pricing
              </h3>

              {/* summary card */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Base Price:</span>
                  <span className="font-semibold text-slate-900">
                    ₹{totalBasePrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Selling Price:</span>
                  <span className="font-semibold text-slate-900">
                    ₹{formData.package_price || '0.00'}
                  </span>
                </div>

                <div className="flex justify-between text-sm pt-2 border-t border-blue-300">
                  <span className="text-blue-700 font-medium">
                    Discount:
                  </span>
                  <span className="font-bold text-blue-700">
                    ₹{discountAmount.toFixed(2)} ({formData.discount_percent || '0.00'}%)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Selling Price (discounted_charge) */}
                <div className="space-y-2">
                  <Label htmlFor="package_price" className="text-xs">
                    Selling Price (₹)
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="package_price"
                    type="text"
                    value={formData.package_price}
                    onChange={(e) =>
                      updateField('package_price', e.target.value)
                    }
                    disabled={isViewMode}
                    placeholder="e.g. 4999.99"
                    className={
                      validationErrors.package_price ? 'border-red-500' : ''
                    }
                  />
                  {validationErrors.package_price && (
                    <p className="text-xs text-red-500">
                      {validationErrors.package_price}
                    </p>
                  )}
                </div>

                {/* Validity (pure UI only) */}
                <div className="space-y-2">
                  <Label htmlFor="validity_days" className="text-xs">
                    Validity (days) — optional
                  </Label>
                  <Input
                    id="validity_days"
                    type="number"
                    value={formData.validity_days}
                    onChange={(e) =>
                      updateField('validity_days', e.target.value)
                    }
                    disabled={isViewMode}
                    placeholder="e.g., 90"
                  />
                </div>
              </div>
            </div>

            {/* STATUS */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
                Status
              </h3>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    updateField('is_active', checked)
                  }
                  disabled={isViewMode}
                />
                <Label
                  htmlFor="is_active"
                  className="text-xs font-normal"
                >
                  Active (Available for purchase)
                </Label>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            {!isViewMode ? (
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
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isCreateMode ? 'Create Package' : 'Update Package'}
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
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
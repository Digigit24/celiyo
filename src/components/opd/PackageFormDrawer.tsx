// src/components/opd/PackageFormDrawer.tsx

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { SideDrawer, type DrawerActionButton, type DrawerHeaderAction } from '@/components/SideDrawer';

import {
  useCreateProcedurePackage,
  useUpdateProcedurePackage,
  useDeleteProcedurePackage,
} from '@/hooks/opd/useProcedurePackage.hooks';
import { useProcedureMasters } from '@/hooks/opd/useProcedureMaster.hooks';
import { getProcedurePackageById } from '@/services/opd/procedurePackage.service';

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
  package_price: string;
  discount_percent: string;
  validity_days: string;
  is_active: boolean;
  procedures: PackageProcedure[];
}

interface PackageFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId?: number | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess?: () => void;
  onDelete?: (id: number) => void;
  onModeChange?: (mode: 'view' | 'edit' | 'create') => void;
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
  onOpenChange,
  packageId,
  mode,
  onSuccess,
  onDelete,
  onModeChange,
}: PackageFormDrawerProps) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [formData, setFormData] = useState<PackageFormData>(EMPTY_FORM);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [packageData, setPackageData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync internal mode with prop
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

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

  const {
    deleteProcedurePackage,
  } = useDeleteProcedurePackage();

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
  // Fetch package data using service
  // ---------------------------------------------------------
  const fetchPackageData = async () => {
    if (!packageId) return;

    console.log('Fetching package data for ID:', packageId);
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getProcedurePackageById(packageId);
      console.log('Fetched package data:', data);
      setPackageData(data);
    } catch (error: any) {
      console.error('Error fetching package:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load package data';
      toast.error('Failed to load package data', {
        description: errorMessage,
      });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when drawer opens - ONLY fetch, don't reset form
  useEffect(() => {
    console.log('Effect triggered:', { open, packageId, currentMode });
    
    if (open && packageId && currentMode !== 'create') {
      fetchPackageData();
    } else if (open && currentMode === 'create') {
      // Only reset for create mode
      setPackageData(null);
      setFormData(EMPTY_FORM);
      setValidationErrors({});
      setError(null);
      setShowProcedureSearch(false);
      setProcedureSearchText('');
    }
  }, [open, packageId, currentMode]);

  // Hydrate form when package data is loaded - SEPARATE EFFECT
  useEffect(() => {
    if (packageData && currentMode !== 'create') {
      console.log('Hydrating form with package data:', packageData);
      hydrateFormData(packageData);
    }
  }, [packageData, currentMode]);

  const hydrateFormData = (pkg: any) => {
    console.log('Starting hydration with:', pkg);

    const backendProcs = pkg.procedures || [];
    console.log('Backend procedures:', backendProcs);

    const normalizedProcedures: PackageProcedure[] = backendProcs.map(
      (p: any) => ({
        id: p.id,
        procedure_id: p.id,
        procedure_name: p.name ?? '',
        procedure_code: p.code ?? '',
        procedure_price: parseFloat(p.default_charge ?? 0),
        quantity: 1,
      })
    );

    const hydratedData: PackageFormData = {
      package_name: pkg.name ?? '',
      package_code: pkg.code ?? '',
      description: pkg.description ?? '',
      package_price: pkg.discounted_charge ?? '',
      discount_percent: pkg.discount_percent ?? '',
      validity_days: '',
      is_active: pkg.is_active ?? true,
      procedures: normalizedProcedures,
    };

    console.log('Hydrated form data:', hydratedData);
    setFormData(hydratedData);
    setValidationErrors({});
    setError(null);
    setShowProcedureSearch(false);
    setProcedureSearchText('');
  };

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
  const totalBasePrice = useMemo(() => {
    return formData.procedures.reduce((sum, proc) => {
      const line = (proc.procedure_price || 0) * (proc.quantity || 1);
      return sum + line;
    }, 0);
  }, [formData.procedures]);

  const discountAmount = useMemo(() => {
    const discounted = parseFloat(formData.package_price) || 0;
    return totalBasePrice - discounted > 0 ? totalBasePrice - discounted : 0;
  }, [totalBasePrice, formData.package_price]);

  // Auto-calculate discount percent only for edit/create, not on initial load
  useEffect(() => {
    if (currentMode === 'view') return;
    
    // Don't override if we just loaded data from API
    if (packageData && formData.discount_percent) return;
    
    if (formData.package_price && formData.procedures.length > 0) {
      const discounted = parseFloat(formData.package_price);
      if (!isNaN(discounted) && totalBasePrice > 0) {
        const pct = ((totalBasePrice - discounted) / totalBasePrice) * 100;
        if (pct >= 0) {
          setFormData((prev) => ({
            ...prev,
            discount_percent: pct.toFixed(2),
          }));
        }
      }
    }
  }, [formData.package_price, formData.procedures, totalBasePrice, currentMode, packageData]);

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

    if (!formData.package_price.trim()) {
      errs.package_price = 'Selling price is required';
    } else if (isNaN(parseFloat(formData.package_price))) {
      errs.package_price = 'Please enter a valid number';
    }

    if (formData.procedures.length === 0) {
      errs.procedures = 'At least one procedure is required';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  }, [formData]);

  // ---------------------------------------------------------
  // handlers
  // ---------------------------------------------------------
  const handleClose = useCallback(() => {
    setFormData(EMPTY_FORM);
    setValidationErrors({});
    setError(null);
    setShowProcedureSearch(false);
    setProcedureSearchText('');
    setPackageData(null);
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
    if (!packageId) return;

    if (
      window.confirm(
        'Are you sure you want to delete this package? This action cannot be undone.'
      )
    ) {
      try {
        await deleteProcedurePackage(packageId);
        toast.success('Package deleted successfully');
        onDelete?.(packageId);
        handleClose();
      } catch (error: any) {
        toast.error('Failed to delete package', {
          description: error?.message || 'Please try again',
        });
      }
    }
  }, [packageId, deleteProcedurePackage, onDelete, handleClose]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    setIsSaving(true);
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

      if (currentMode === 'edit' && packageId) {
        await updateProcedurePackage(payload);
        toast.success('Package updated successfully');
      } else {
        await createProcedurePackage(payload);
        toast.success('Package created successfully');
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
    totalBasePrice,
    currentMode,
    packageId,
    updateProcedurePackage,
    createProcedurePackage,
    onSuccess,
    handleClose,
  ]);

  // ---------------------------------------------------------
  // drawer configuration
  // ---------------------------------------------------------
  const drawerTitle =
    currentMode === 'create'
      ? 'Create New Package'
      : packageData
      ? packageData.name || 'Package Details'
      : 'Package Details';

  const drawerDescription =
    currentMode === 'create'
      ? 'Create a bundled procedure package with discounted pricing'
      : packageData
      ? `${packageData.code} • ${formData.procedures.length} procedure${formData.procedures.length !== 1 ? 's' : ''}`
      : undefined;

  // Header actions
  const headerActions: DrawerHeaderAction[] =
    currentMode === 'view' && packageData
      ? [
          {
            icon: Pencil,
            onClick: handleSwitchToEdit,
            label: 'Edit package',
            variant: 'ghost',
          },
          {
            icon: Trash2,
            onClick: handleDelete,
            label: 'Delete package',
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
            disabled: isSaving || isUpdating,
          },
          {
            label: 'Save Changes',
            onClick: handleSave,
            variant: 'default',
            loading: isSaving || isUpdating,
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
            label: 'Create Package',
            onClick: handleSave,
            variant: 'default',
            loading: isSaving || isCreating,
          },
        ];

  // ---------------------------------------------------------
  // drawer content
  // ---------------------------------------------------------
  const drawerContent = (
    <div className="space-y-6">
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
              onChange={(e) => updateField('package_name', e.target.value)}
              disabled={currentMode === 'view'}
              placeholder="e.g., Cardiac Check-up Package"
              className={validationErrors.package_name ? 'border-red-500' : ''}
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
              onChange={(e) => updateField('package_code', e.target.value)}
              disabled={currentMode === 'view'}
              placeholder="e.g., PKG-CARDIAC-001"
              className={validationErrors.package_code ? 'border-red-500' : ''}
            />
            {validationErrors.package_code && (
              <p className="text-xs text-red-500">
                {validationErrors.package_code}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-xs">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            disabled={currentMode === 'view'}
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

          {currentMode !== 'view' && (
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
          <p className="text-xs text-red-500">{validationErrors.procedures}</p>
        )}

        {/* procedure search drawer */}
        {showProcedureSearch && currentMode !== 'view' && (
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

            {isProceduresLoading && (
              <div className="text-xs text-slate-500 text-center py-2">
                Searching...
              </div>
            )}

            {!isProceduresLoading && availableProcedures.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {availableProcedures.map((proc) => (
                  <button
                    key={proc.id}
                    type="button"
                    onClick={() => addProcedureToPackage(proc)}
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
                        ₹{proc.base_price.toFixed(2)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

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
                    disabled={currentMode === 'view'}
                    className="w-20 h-8"
                  />
                </div>

                <div className="text-sm font-semibold text-slate-900 min-w-[80px] text-right">
                  ₹
                  {((proc.procedure_price || 0) * (proc.quantity || 1)).toFixed(
                    2
                  )}
                </div>

                {currentMode !== 'view' && (
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
            <span className="text-blue-700 font-medium">Discount:</span>
            <span className="font-bold text-blue-700">
              ₹{discountAmount.toFixed(2)} (
              {formData.discount_percent || '0.00'}%)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="package_price" className="text-xs">
              Selling Price (₹)
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="package_price"
              type="text"
              value={formData.package_price}
              onChange={(e) => updateField('package_price', e.target.value)}
              disabled={currentMode === 'view'}
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

          <div className="space-y-2">
            <Label htmlFor="validity_days" className="text-xs">
              Validity (days) — optional
            </Label>
            <Input
              id="validity_days"
              type="number"
              value={formData.validity_days}
              onChange={(e) => updateField('validity_days', e.target.value)}
              disabled={currentMode === 'view'}
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
            onCheckedChange={(checked) => updateField('is_active', checked)}
            disabled={currentMode === 'view'}
          />
          <Label htmlFor="is_active" className="text-xs font-normal">
            Active (Available for purchase)
          </Label>
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
      mode={currentMode}
      headerActions={headerActions}
      isLoading={isLoading}
      loadingText="Loading package data..."
      size="xl"
      footerButtons={footerButtons}
      footerAlignment="right"
      showBackButton={true}
      resizable={true}
      storageKey="package-drawer-width"
      onClose={handleClose}
    >
      {drawerContent}
    </SideDrawer>
  );
}
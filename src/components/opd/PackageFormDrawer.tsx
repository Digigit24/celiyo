// src/components/opd/PackageFormDrawer.tsx
import { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertCircle, Plus, Trash2, Search } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

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
  onClose: () => void;
  packageId?: number | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess?: () => void;
}

interface AvailableProcedure {
  id: number;
  name: string;
  code: string;
  base_price: number;
}

const initialFormData: PackageFormData = {
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
  const [formData, setFormData] = useState<PackageFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Procedure search
  const [showProcedureSearch, setShowProcedureSearch] = useState(false);
  const [procedureSearchText, setProcedureSearchText] = useState('');
  const [availableProcedures, setAvailableProcedures] = useState<AvailableProcedure[]>([]);
  const [isSearchingProcedures, setIsSearchingProcedures] = useState(false);

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  // Fetch package data when editing or viewing
  useEffect(() => {
    if (open && packageId && (isEditMode || isViewMode)) {
      fetchPackageData();
    } else if (open && isCreateMode) {
      setFormData(initialFormData);
      setError(null);
      setValidationErrors({});
    }
  }, [open, packageId, mode]);

  const fetchPackageData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/opd/procedure-packages/${packageId}/`);
      if (!response.ok) throw new Error('Failed to fetch package data');
      const data = await response.json();
      
      setFormData({
        package_name: data.package_name || '',
        package_code: data.package_code || '',
        description: data.description || '',
        package_price: data.package_price?.toString() || '',
        discount_percent: data.discount_percent?.toString() || '',
        validity_days: data.validity_days?.toString() || '',
        is_active: data.is_active ?? true,
        procedures: data.procedures || data.package_procedures || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load package data');
    } finally {
      setIsLoading(false);
    }
  };

  // Search for procedures to add
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
      console.error('Search failed:', err);
    } finally {
      setIsSearchingProcedures(false);
    }
  };

  // Debounce procedure search
  useEffect(() => {
    if (!showProcedureSearch) return;
    
    const timer = setTimeout(() => {
      searchProcedures(procedureSearchText);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [procedureSearchText, showProcedureSearch]);

  const handleChange = (
    field: keyof PackageFormData,
    value: string | boolean | PackageProcedure[]
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

  const addProcedureToPackage = (procedure: AvailableProcedure) => {
    // Check if already added
    if (formData.procedures.some(p => p.procedure_id === procedure.id)) {
      return;
    }

    const newProcedure: PackageProcedure = {
      procedure_id: procedure.id,
      procedure_name: procedure.name,
      procedure_code: procedure.code,
      procedure_price: procedure.base_price,
      quantity: 1,
    };

    handleChange('procedures', [...formData.procedures, newProcedure]);
    setShowProcedureSearch(false);
    setProcedureSearchText('');
    setAvailableProcedures([]);
  };

  const removeProcedureFromPackage = (index: number) => {
    const updated = formData.procedures.filter((_, i) => i !== index);
    handleChange('procedures', updated);
  };

  const updateProcedureQuantity = (index: number, quantity: number) => {
    const updated = [...formData.procedures];
    updated[index] = { ...updated[index], quantity: Math.max(1, quantity) };
    handleChange('procedures', updated);
  };

  // Calculate total base price
  const calculateTotalBasePrice = (): number => {
    return formData.procedures.reduce((sum, proc) => {
      return sum + ((proc.procedure_price || 0) * proc.quantity);
    }, 0);
  };

  // Calculate actual discount amount
  const calculateDiscountAmount = (): number => {
    const basePrice = calculateTotalBasePrice();
    const packagePrice = parseFloat(formData.package_price) || 0;
    return Math.max(0, basePrice - packagePrice);
  };

  // Auto-calculate discount percentage
  useEffect(() => {
    if (formData.package_price && formData.procedures.length > 0) {
      const basePrice = calculateTotalBasePrice();
      const packagePrice = parseFloat(formData.package_price);
      
      if (basePrice > 0 && !isNaN(packagePrice)) {
        const discountPercent = ((basePrice - packagePrice) / basePrice) * 100;
        if (discountPercent >= 0) {
          setFormData(prev => ({
            ...prev,
            discount_percent: discountPercent.toFixed(2)
          }));
        }
      }
    }
  }, [formData.package_price, formData.procedures]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.package_name.trim()) {
      errors.package_name = 'Package name is required';
    }
    if (!formData.package_code.trim()) {
      errors.package_code = 'Package code is required';
    }
    if (!formData.package_price.trim()) {
      errors.package_price = 'Package price is required';
    } else if (isNaN(parseFloat(formData.package_price)) || parseFloat(formData.package_price) < 0) {
      errors.package_price = 'Please enter a valid price';
    }

    if (formData.procedures.length === 0) {
      errors.procedures = 'At least one procedure is required';
    }

    if (formData.validity_days && (isNaN(parseInt(formData.validity_days)) || parseInt(formData.validity_days) < 0)) {
      errors.validity_days = 'Please enter a valid number of days';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        package_name: formData.package_name,
        package_code: formData.package_code,
        description: formData.description,
        package_price: parseFloat(formData.package_price),
        discount_percent: parseFloat(formData.discount_percent) || 0,
        validity_days: formData.validity_days ? parseInt(formData.validity_days) : null,
        is_active: formData.is_active,
        procedures: formData.procedures.map(p => ({
          procedure_id: p.procedure_id,
          quantity: p.quantity,
        })),
      };

      const url = isEditMode
        ? `/api/opd/procedure-packages/${packageId}/`
        : '/api/opd/procedure-packages/';
      
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
        throw new Error(errorData.detail || 'Failed to save package');
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

  const handleClose = () => {
    if (!isSaving) {
      onClose();
      setFormData(initialFormData);
      setError(null);
      setValidationErrors({});
      setShowProcedureSearch(false);
      setProcedureSearchText('');
      setAvailableProcedures([]);
    }
  };

  const totalBasePrice = calculateTotalBasePrice();
  const discountAmount = calculateDiscountAmount();

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isCreateMode && 'Create New Package'}
            {isEditMode && 'Edit Package'}
            {isViewMode && 'View Package'}
          </SheetTitle>
          <SheetDescription>
            {isCreateMode && 'Create a bundled procedure package with discounted pricing'}
            {isEditMode && 'Update package information and procedures'}
            {isViewMode && 'View package details'}
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

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
                Basic Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="package_name" className="text-xs">
                    Package Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="package_name"
                    value={formData.package_name}
                    onChange={(e) => handleChange('package_name', e.target.value)}
                    disabled={isViewMode}
                    placeholder="e.g., Cardiac Check-up Package"
                    className={validationErrors.package_name ? 'border-red-500' : ''}
                  />
                  {validationErrors.package_name && (
                    <p className="text-xs text-red-500">{validationErrors.package_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="package_code" className="text-xs">
                    Package Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="package_code"
                    value={formData.package_code}
                    onChange={(e) => handleChange('package_code', e.target.value)}
                    disabled={isViewMode}
                    placeholder="e.g., PKG-CARDIAC-001"
                    className={validationErrors.package_code ? 'border-red-500' : ''}
                  />
                  {validationErrors.package_code && (
                    <p className="text-xs text-red-500">{validationErrors.package_code}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  disabled={isViewMode}
                  placeholder="Brief description of the package"
                  rows={3}
                />
              </div>
            </div>

            {/* Procedures */}
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
                          onClick={() => addProcedureToPackage(proc)}
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
                      className="flex items-center gap-3 p-3 border rounded-lg bg-white"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {proc.procedure_name || 'Unnamed Procedure'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {proc.procedure_code} • ₹{(proc.procedure_price || 0).toFixed(2)} each
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Label htmlFor={`qty-${index}`} className="text-xs whitespace-nowrap">
                          Qty:
                        </Label>
                        <Input
                          id={`qty-${index}`}
                          type="number"
                          min="1"
                          value={proc.quantity}
                          onChange={(e) => updateProcedureQuantity(index, parseInt(e.target.value) || 1)}
                          disabled={isViewMode}
                          className="w-20 h-8"
                        />
                      </div>

                      <div className="text-sm font-semibold text-slate-900 min-w-[80px] text-right">
                        ₹{((proc.procedure_price || 0) * proc.quantity).toFixed(2)}
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

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
                Pricing
              </h3>

              {/* Pricing summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Base Price:</span>
                  <span className="font-semibold text-slate-900">
                    ₹{totalBasePrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Package Price:</span>
                  <span className="font-semibold text-slate-900">
                    ₹{parseFloat(formData.package_price || '0').toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-blue-300">
                  <span className="text-blue-700 font-medium">Discount:</span>
                  <span className="font-bold text-blue-700">
                    ₹{discountAmount.toFixed(2)} ({formData.discount_percent || '0'}%)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="package_price" className="text-xs">
                    Package Price (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="package_price"
                    type="number"
                    step="0.01"
                    value={formData.package_price}
                    onChange={(e) => handleChange('package_price', e.target.value)}
                    disabled={isViewMode}
                    placeholder="0.00"
                    className={validationErrors.package_price ? 'border-red-500' : ''}
                  />
                  {validationErrors.package_price && (
                    <p className="text-xs text-red-500">{validationErrors.package_price}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validity_days" className="text-xs">
                    Validity (days)
                  </Label>
                  <Input
                    id="validity_days"
                    type="number"
                    value={formData.validity_days}
                    onChange={(e) => handleChange('validity_days', e.target.value)}
                    disabled={isViewMode}
                    placeholder="e.g., 90"
                    className={validationErrors.validity_days ? 'border-red-500' : ''}
                  />
                  {validationErrors.validity_days && (
                    <p className="text-xs text-red-500">{validationErrors.validity_days}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
                Status
              </h3>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleChange('is_active', checked)}
                  disabled={isViewMode}
                />
                <Label htmlFor="is_active" className="text-xs font-normal">
                  Active (Available for purchase)
                </Label>
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
// src/components/opd/ProcedureFormDrawer.tsx

import { useState, useEffect, useCallback } from 'react';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
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

interface ProcedureFormData {
  name: string;
  code: string;
  description: string;
  category: string;
  department: string;
  base_price: string;
  duration_minutes: string;
  requires_consent: boolean;
  consent_form_template: string;
  pre_procedure_instructions: string;
  post_procedure_instructions: string;
  complications: string;
  contraindications: string;
  is_active: boolean;
}

interface ProcedureApiResponse {
  // we don't know exact backend shape, so keep it loose
  [key: string]: any;
}

interface ProcedureFormDrawerProps {
  open: boolean;
  onClose: () => void;
  procedureId?: number | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess?: () => void;
}

const EMPTY_FORM: ProcedureFormData = {
  name: '',
  code: '',
  description: '',
  category: '',
  department: '',
  base_price: '',
  duration_minutes: '',
  requires_consent: false,
  consent_form_template: '',
  pre_procedure_instructions: '',
  post_procedure_instructions: '',
  complications: '',
  contraindications: '',
  is_active: true,
};

/**
 * Take raw backend data and map it into the exact shape our form uses.
 * Edit this mapping so it matches your API payload fields.
 */
function normalizeProcedure(data: ProcedureApiResponse): ProcedureFormData {
  if (!data || typeof data !== 'object') {
    return { ...EMPTY_FORM };
  }

  // Try multiple possible keys for each field.
  // Adjust these fallbacks to match your actual API.
  const name =
    data.name ??
    data.procedure_name ??
    '';

  const code =
    data.code ??
    data.procedure_code ??
    '';

  const description =
    data.description ??
    data.details ??
    data.procedure_description ??
    '';

  const category =
    data.category ??
    data.procedure_category ??
    '';

  const department =
    data.department ??
    data.department_name ??
    data.department_display ??
    '';

  const basePriceRaw =
    data.base_price ??
    data.price ??
    data.default_charge ??
    data.procedure_price ??
    '';

  const durationRaw =
    data.duration_minutes ??
    data.duration ??
    '';

  const requires_consent =
    data.requires_consent ??
    data.needs_consent ??
    false;

  const consent_form_template =
    data.consent_form_template ??
    data.consent_template ??
    '';

  const pre_procedure_instructions =
    data.pre_procedure_instructions ??
    data.pre_instructions ??
    '';

  const post_procedure_instructions =
    data.post_procedure_instructions ??
    data.post_instructions ??
    '';

  const complications =
    data.complications ??
    data.risks ??
    '';

  const contraindications =
    data.contraindications ??
    data.not_recommended_for ??
    '';

  const is_active =
    data.is_active ??
    data.active ??
    true;

  return {
    name: String(name),
    code: String(code),
    description: String(description),
    category: String(category),
    department: String(department),

    base_price:
      basePriceRaw === null || basePriceRaw === undefined
        ? ''
        : String(basePriceRaw),

    duration_minutes:
      durationRaw === null || durationRaw === undefined
        ? ''
        : String(durationRaw),

    requires_consent: Boolean(requires_consent),
    consent_form_template: String(consent_form_template),
    pre_procedure_instructions: String(pre_procedure_instructions),
    post_procedure_instructions: String(post_procedure_instructions),
    complications: String(complications),
    contraindications: String(contraindications),
    is_active: Boolean(is_active),
  };
}

export default function ProcedureFormDrawer({
  open,
  onClose,
  procedureId,
  mode,
  onSuccess,
}: ProcedureFormDrawerProps) {
  const [formData, setFormData] = useState<ProcedureFormData>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  /**
   * Fetch a single procedure from the API and hydrate form
   */
  const fetchProcedureData = useCallback(async () => {
    if (!procedureId || !(isEditMode || isViewMode)) {
      console.log('No procedureId or not in edit/view mode, skipping fetch');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching procedure data for ID:', procedureId);
      const res = await fetch(`/api/opd/procedure-masters/${procedureId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Fetch procedure response status:', res);

      if (!res.ok) {
        throw new Error('Failed to fetch procedure data');
      }

      const data = (await res.json()) as ProcedureApiResponse;

      // normalize from backend -> form state
      const normalized = normalizeProcedure(data);

      setFormData(normalized);
    } catch (err: any) {
      setError(
        err?.message || 'Failed to load procedure data'
      );
      // if fetch fails, keep whatever we had
    } finally {
        setIsLoading(false);
    }
  }, [procedureId, isEditMode, isViewMode]);

  /**
   * Sync behavior on drawer open / mode change
   */
useEffect(() => {
    console.log('-------------------------0');
  if (open && isCreateMode) {
    console.log('1');
    setFormData(EMPTY_FORM);
    setValidationErrors({});
    setError(null);
    setIsLoading(false);
    return;
  }

  if (open && procedureId && (isEditMode || isViewMode)) {
    console.log('2');
    fetchProcedureData();
    return;
  }

  if (!open) {
    console.log('3');
    setFormData(EMPTY_FORM);
    setValidationErrors({});
    setError(null);
    setIsLoading(false);
    setIsSaving(false);
  }
}, [open, isCreateMode, isEditMode, isViewMode, procedureId, fetchProcedureData]);


  /**
   * Generic change handler
   */
  const handleChange = (
    field: keyof ProcedureFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // clear per-field validation error on edit
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  /**
   * Validate required fields before save
   */
  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Procedure name is required';
    }
    if (!formData.code.trim()) {
      nextErrors.code = 'Procedure code is required';
    }
    if (!formData.category.trim()) {
      nextErrors.category = 'Category is required';
    }
    if (!formData.department.trim()) {
      nextErrors.department = 'Department is required';
    }
    if (!formData.base_price.trim()) {
      nextErrors.base_price = 'Base price is required';
    } else if (
      isNaN(parseFloat(formData.base_price)) ||
      parseFloat(formData.base_price) < 0
    ) {
      nextErrors.base_price = 'Please enter a valid price';
    }

    if (
      formData.duration_minutes &&
      (isNaN(parseInt(formData.duration_minutes)) ||
        parseInt(formData.duration_minutes) < 0)
    ) {
      nextErrors.duration_minutes = 'Please enter a valid duration';
    }

    setValidationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  /**
   * Submit create / update
   */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setError(null);

    try {
      // what we send to API
      const payload = {
        // use API field names, not UI names
        // adjust this block so it matches what your backend accepts
        name: formData.name,
        code: formData.code,
        description: formData.description,
        category: formData.category,
        department: formData.department,
        base_price: parseFloat(formData.base_price),
        duration_minutes: formData.duration_minutes
          ? parseInt(formData.duration_minutes)
          : null,
        requires_consent: formData.requires_consent,
        consent_form_template: formData.consent_form_template,
        pre_procedure_instructions: formData.pre_procedure_instructions,
        post_procedure_instructions: formData.post_procedure_instructions,
        complications: formData.complications,
        contraindications: formData.contraindications,
        is_active: formData.is_active,
      };

      const url = isEditMode
        ? `/api/opd/procedure-masters/${procedureId}/`
        : '/api/opd/procedure-masters/';

      const method = isEditMode ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = 'Failed to save procedure';
        try {
          const errJson = await res.json();
          // DRF often returns { detail: "..."} or field errors as {field:["msg"]}
          if (errJson.detail) message = errJson.detail;
        } catch {
          // ignore parse fail
        }
        throw new Error(message);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Close handler
   */
  const handleClose = () => {
    if (isSaving) return;
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isCreateMode && 'Create New Procedure'}
            {isEditMode && 'Edit Procedure'}
            {isViewMode && 'View Procedure'}
          </SheetTitle>
          <SheetDescription>
            {isCreateMode && 'Add a new procedure to the master list'}
            {isEditMode && 'Update procedure information'}
            {isViewMode && 'View procedure details'}
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
                  <Label htmlFor="name" className="text-xs">
                    Procedure Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    disabled={isViewMode}
                    placeholder="e.g., ECG"
                    className={validationErrors.name ? 'border-red-500' : ''}
                  />
                  {validationErrors.name && (
                    <p className="text-xs text-red-500">{validationErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code" className="text-xs">
                    Procedure Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleChange('code', e.target.value)}
                    disabled={isViewMode}
                    placeholder="e.g., ECG-001"
                    className={validationErrors.code ? 'border-red-500' : ''}
                  />
                  {validationErrors.code && (
                    <p className="text-xs text-red-500">{validationErrors.code}</p>
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
                  placeholder="Brief description of the procedure"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-xs">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    disabled={isViewMode}
                    placeholder="e.g., Diagnostic"
                    className={validationErrors.category ? 'border-red-500' : ''}
                  />
                  {validationErrors.category && (
                    <p className="text-xs text-red-500">{validationErrors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="text-xs">
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    disabled={isViewMode}
                    placeholder="e.g., Cardiology"
                    className={validationErrors.department ? 'border-red-500' : ''}
                  />
                  {validationErrors.department && (
                    <p className="text-xs text-red-500">{validationErrors.department}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base_price" className="text-xs">
                    Base Price (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="base_price"
                    type="number"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => handleChange('base_price', e.target.value)}
                    disabled={isViewMode}
                    placeholder="0.00"
                    className={validationErrors.base_price ? 'border-red-500' : ''}
                  />
                  {validationErrors.base_price && (
                    <p className="text-xs text-red-500">{validationErrors.base_price}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_minutes" className="text-xs">
                    Duration (minutes)
                  </Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => handleChange('duration_minutes', e.target.value)}
                    disabled={isViewMode}
                    placeholder="e.g., 30"
                    className={validationErrors.duration_minutes ? 'border-red-500' : ''}
                  />
                  {validationErrors.duration_minutes && (
                    <p className="text-xs text-red-500">{validationErrors.duration_minutes}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Consent & Instructions */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
                Consent & Instructions
              </h3>

              <div className="flex items-center space-x-2">
                <Switch
                  id="requires_consent"
                  checked={formData.requires_consent}
                  onCheckedChange={(checked) =>
                    handleChange('requires_consent', checked)
                  }
                  disabled={isViewMode}
                />
                <Label htmlFor="requires_consent" className="text-xs font-normal">
                  Requires Patient Consent
                </Label>
              </div>

              {formData.requires_consent && (
                <div className="space-y-2">
                  <Label htmlFor="consent_form_template" className="text-xs">
                    Consent Form Template
                  </Label>
                  <Textarea
                    id="consent_form_template"
                    value={formData.consent_form_template}
                    onChange={(e) =>
                      handleChange('consent_form_template', e.target.value)
                    }
                    disabled={isViewMode}
                    placeholder="Enter consent form template or reference"
                    rows={3}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="pre_procedure_instructions" className="text-xs">
                  Pre-Procedure Instructions
                </Label>
                <Textarea
                  id="pre_procedure_instructions"
                  value={formData.pre_procedure_instructions}
                  onChange={(e) =>
                    handleChange('pre_procedure_instructions', e.target.value)
                  }
                  disabled={isViewMode}
                  placeholder="Instructions to be followed before the procedure"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="post_procedure_instructions" className="text-xs">
                  Post-Procedure Instructions
                </Label>
                <Textarea
                  id="post_procedure_instructions"
                  value={formData.post_procedure_instructions}
                  onChange={(e) =>
                    handleChange('post_procedure_instructions', e.target.value)
                  }
                  disabled={isViewMode}
                  placeholder="Instructions to be followed after the procedure"
                  rows={3}
                />
              </div>
            </div>

            {/* Clinical Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
                Clinical Information
              </h3>

              <div className="space-y-2">
                <Label htmlFor="complications" className="text-xs">
                  Potential Complications
                </Label>
                <Textarea
                  id="complications"
                  value={formData.complications}
                  onChange={(e) =>
                    handleChange('complications', e.target.value)
                  }
                  disabled={isViewMode}
                  placeholder="List potential complications or side effects"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contraindications" className="text-xs">
                  Contraindications
                </Label>
                <Textarea
                  id="contraindications"
                  value={formData.contraindications}
                  onChange={(e) =>
                    handleChange('contraindications', e.target.value)
                  }
                  disabled={isViewMode}
                  placeholder="When procedure should NOT be performed"
                  rows={3}
                />
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
                  onCheckedChange={(checked) =>
                    handleChange('is_active', checked)
                  }
                  disabled={isViewMode}
                />
                <Label htmlFor="is_active" className="text-xs font-normal">
                  Active (Available for use)
                </Label>
              </div>
            </div>

            {/* Actions */}
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
                      {isCreateMode ? 'Create Procedure' : 'Update Procedure'}
                    </>
                  )}
                </Button>
              </div>
            )}

            {isViewMode && (
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

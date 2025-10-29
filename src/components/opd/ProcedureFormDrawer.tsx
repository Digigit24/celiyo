"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ---------------------------
// Types
// ---------------------------
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
  [key: string]: any;
}

interface ProcedureFormDrawerProps {
  open: boolean;
  onClose: () => void;
  procedureId?: number | null;
  mode: "create" | "edit" | "view";
  onSuccess?: () => void;
}

// ---------------------------
// Constants
// ---------------------------
const EMPTY_FORM: ProcedureFormData = {
  name: "",
  code: "",
  description: "",
  category: "",
  department: "",
  base_price: "",
  duration_minutes: "",
  requires_consent: false,
  consent_form_template: "",
  pre_procedure_instructions: "",
  post_procedure_instructions: "",
  complications: "",
  contraindications: "",
  is_active: true,
};

// ---------------------------
// Normalizer: API -> UI
// ---------------------------
function normalizeProcedure(data: ProcedureApiResponse): ProcedureFormData {
  console.log("[normalizeProcedure] raw input:", data);

  if (!data || typeof data !== "object") {
    console.warn("[normalizeProcedure] invalid data, returning EMPTY_FORM");
    return { ...EMPTY_FORM };
  }

  const name = data.name ?? data.procedure_name ?? "";
  const code = data.code ?? data.procedure_code ?? "";
  const description =
    data.description ?? data.details ?? data.procedure_description ?? "";
  const category = data.category ?? data.procedure_category ?? "";
  const department =
    data.department ?? data.department_name ?? data.department_display ?? "";

  const basePriceRaw =
    data.base_price ??
    data.price ??
    data.default_charge ??
    data.procedure_price ??
    "";

  const durationRaw =
    data.duration_minutes ??
    data.duration ??
    "";

  const requires_consent =
    data.requires_consent ??
    data.needs_consent ??
    false;

  const consent_form_template =
    data.consent_form_template ??
    data.consent_template ??
    "";

  const pre_procedure_instructions =
    data.pre_procedure_instructions ??
    data.pre_instructions ??
    "";

  const post_procedure_instructions =
    data.post_procedure_instructions ??
    data.post_instructions ??
    "";

  const complications =
    data.complications ??
    data.risks ??
    "";

  const contraindications =
    data.contraindications ??
    data.not_recommended_for ??
    "";

  const is_active =
    data.is_active ??
    data.active ??
    true;

  const normalized: ProcedureFormData = {
    name: String(name),
    code: String(code),
    description: String(description),
    category: String(category),
    department: String(department),
    base_price:
      basePriceRaw === null || basePriceRaw === undefined
        ? ""
        : String(basePriceRaw),
    duration_minutes:
      durationRaw === null || durationRaw === undefined
        ? ""
        : String(durationRaw),
    requires_consent: Boolean(requires_consent),
    consent_form_template: String(consent_form_template),
    pre_procedure_instructions: String(pre_procedure_instructions),
    post_procedure_instructions: String(post_procedure_instructions),
    complications: String(complications),
    contraindications: String(contraindications),
    is_active: Boolean(is_active),
  };

  console.log("[normalizeProcedure] normalized output:", normalized);
  return normalized;
}

// ---------------------------
// Component
// ---------------------------
export default function ProcedureFormDrawer({
  open,
  onClose,
  procedureId,
  mode,
  onSuccess,
}: ProcedureFormDrawerProps) {
  console.log("<<< RENDER ProcedureFormDrawer >>>", {
    open,
    mode,
    procedureId,
  });

  const [formData, setFormData] = useState<ProcedureFormData>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false); // fetching existing record
  const [isSaving, setIsSaving] = useState(false); // saving create/update
  const [error, setError] = useState<string | null>(null); // top-level error
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({}); // per-field validation

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // ---------------------------
  // Fetch a single procedure (for view/edit)
  // ---------------------------
  const fetchProcedureData = useCallback(async () => {
    console.log("[fetchProcedureData] called", {
      procedureId,
      isEditMode,
      isViewMode,
    });

    if (!procedureId || !(isEditMode || isViewMode)) {
      console.log(
        "[fetchProcedureData] skipping fetch because invalid procedureId or wrong mode"
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = `/api/opd/procedure-masters/${procedureId}/`;
      console.log("[fetchProcedureData] GET", url);

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("[fetchProcedureData] response object:", res);
      console.log("[fetchProcedureData] response status:", res.status);

      if (!res.ok) {
        throw new Error(
          `Failed to fetch procedure data (status ${res.status})`
        );
      }

      const data = (await res.json()) as ProcedureApiResponse;
      console.log("[fetchProcedureData] response JSON:", data);

      const normalized = normalizeProcedure(data);
      console.log("[fetchProcedureData] setting formData to:", normalized);

      setFormData(normalized);
    } catch (err: any) {
      console.error("[fetchProcedureData] error:", err);
      setError(err?.message || "Failed to load procedure data");
    } finally {
      console.log("[fetchProcedureData] done, setIsLoading(false)");
      setIsLoading(false);
    }
  }, [procedureId, isEditMode, isViewMode]);

  // ---------------------------
  // Sync drawer lifecycle (open/close/mode change)
  // ---------------------------
  useEffect(() => {
    console.log("[useEffect] fired with deps:", {
      open,
      mode,
      procedureId,
      isCreateMode,
      isEditMode,
      isViewMode,
    });

    // drawer closed -> full reset
    if (!open) {
      console.log("[useEffect] branch: drawer closed, resetting state");
      setFormData(EMPTY_FORM);
      setValidationErrors({});
      setError(null);
      setIsLoading(false);
      setIsSaving(false);
      return;
    }

    // drawer opened in create mode -> blank form
    if (open && isCreateMode) {
      console.log(
        "[useEffect] branch: create mode, initializing empty formData"
      );
      setFormData(EMPTY_FORM);
      setValidationErrors({});
      setError(null);
      setIsLoading(false);
      return;
    }

    // drawer opened in edit or view mode with an id -> fetch existing
    if (open && procedureId && (isEditMode || isViewMode)) {
      console.log(
        "[useEffect] branch: edit/view mode with procedureId, calling fetchProcedureData"
      );
      fetchProcedureData();
      return;
    }

    // if we get here, drawer is open but we don't have what we need
    console.warn(
      "[useEffect] branch: drawer open but no procedureId or bad mode. No fetch."
    );
  }, [
    open,
    mode,
    procedureId,
    isCreateMode,
    isEditMode,
    isViewMode,
    fetchProcedureData,
  ]);

  // ---------------------------
  // Change handler
  // ---------------------------
  const handleChange = (
    field: keyof ProcedureFormData,
    value: string | boolean
  ) => {
    console.log("[handleChange]", { field, value });
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      console.log("[handleChange] new formData:", next);
      return next;
    });

    // clear per-field validation error on edit
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        console.log("[handleChange] clearing validation error for", field);
        return next;
      });
    }
  };

  // ---------------------------
  // Validate required fields before submit
  // ---------------------------
  const validateForm = (): boolean => {
    console.log("[validateForm] running on formData:", formData);

    const nextErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Procedure name is required";
    }
    if (!formData.code.trim()) {
      nextErrors.code = "Procedure code is required";
    }
    if (!formData.category.trim()) {
      nextErrors.category = "Category is required";
    }
    if (!formData.department.trim()) {
      nextErrors.department = "Department is required";
    }
    if (!formData.base_price.trim()) {
      nextErrors.base_price = "Base price is required";
    } else if (
      isNaN(parseFloat(formData.base_price)) ||
      parseFloat(formData.base_price) < 0
    ) {
      nextErrors.base_price = "Please enter a valid price";
    }

    if (
      formData.duration_minutes &&
      (isNaN(parseInt(formData.duration_minutes)) ||
        parseInt(formData.duration_minutes) < 0)
    ) {
      nextErrors.duration_minutes = "Please enter a valid duration";
    }

    console.log("[validateForm] nextErrors:", nextErrors);

    setValidationErrors(nextErrors);
    const isValid = Object.keys(nextErrors).length === 0;
    console.log("[validateForm] isValid:", isValid);
    return isValid;
  };

  // ---------------------------
  // Submit create / update
  // ---------------------------
  const handleSubmit = async () => {
    console.log("[handleSubmit] start");
    if (!validateForm()) {
      console.log("[handleSubmit] validation failed, abort");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        // map UI -> API. Adjust keys if backend expects different.
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
        : "/api/opd/procedure-masters/";

      const method = isEditMode ? "PATCH" : "POST";

      console.log("[handleSubmit] sending request", {
        method,
        url,
        payload,
      });

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("[handleSubmit] response status:", res.status);

      if (!res.ok) {
        let message = "Failed to save procedure";
        try {
          const errJson = await res.json();
          console.log("[handleSubmit] error body:", errJson);
          if (errJson.detail) message = errJson.detail;
        } catch (parseErr) {
          console.warn("[handleSubmit] could not parse error json:", parseErr);
        }
        throw new Error(message);
      }

      console.log("[handleSubmit] success, running onSuccess + onClose");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("[handleSubmit] error:", err);
      setError(err?.message || "An error occurred while saving");
    } finally {
      console.log("[handleSubmit] done");
      setIsSaving(false);
    }
  };

  // ---------------------------
  // Close handler
  // ---------------------------
  const handleClose = () => {
    console.log("[handleClose] called");
    if (isSaving) {
      console.log("[handleClose] blocked because still saving");
      return;
    }
    onClose();
  };

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isCreateMode && "Create New Procedure"}
            {isEditMode && "Edit Procedure"}
            {isViewMode && "View Procedure"}
          </SheetTitle>
          <SheetDescription>
            {isCreateMode && "Add a new procedure to the master list"}
            {isEditMode && "Update procedure information"}
            {isViewMode && "View procedure details"}
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

            {/* SECTION: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
                Basic Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">
                    Procedure Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    disabled={isViewMode}
                    placeholder="e.g., ECG"
                    className={validationErrors.name ? "border-red-500" : ""}
                  />
                  {validationErrors.name && (
                    <p className="text-xs text-red-500">
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                {/* Code */}
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-xs">
                    Procedure Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleChange("code", e.target.value)}
                    disabled={isViewMode}
                    placeholder="e.g., ECG-001"
                    className={validationErrors.code ? "border-red-500" : ""}
                  />
                  {validationErrors.code && (
                    <p className="text-xs text-red-500">
                      {validationErrors.code}
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
                  onChange={(e) =>
                    handleChange("description", e.target.value)
                  }
                  disabled={isViewMode}
                  placeholder="Brief description of the procedure"
                  rows={3}
                />
              </div>

              {/* Category / Department */}
              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-xs">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    disabled={isViewMode}
                    placeholder="e.g., Diagnostic"
                    className={
                      validationErrors.category ? "border-red-500" : ""
                    }
                  />
                  {validationErrors.category && (
                    <p className="text-xs text-red-500">
                      {validationErrors.category}
                    </p>
                  )}
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-xs">
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    disabled={isViewMode}
                    placeholder="e.g., Cardiology"
                    className={
                      validationErrors.department ? "border-red-500" : ""
                    }
                  />
                  {validationErrors.department && (
                    <p className="text-xs text-red-500">
                      {validationErrors.department}
                    </p>
                  )}
                </div>
              </div>

              {/* Price / Duration */}
              <div className="grid grid-cols-2 gap-4">
                {/* Base Price */}
                <div className="space-y-2">
                  <Label htmlFor="base_price" className="text-xs">
                    Base Price (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="base_price"
                    type="number"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => handleChange("base_price", e.target.value)}
                    disabled={isViewMode}
                    placeholder="0.00"
                    className={
                      validationErrors.base_price ? "border-red-500" : ""
                    }
                  />
                  {validationErrors.base_price && (
                    <p className="text-xs text-red-500">
                      {validationErrors.base_price}
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration_minutes" className="text-xs">
                    Duration (minutes)
                  </Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) =>
                      handleChange("duration_minutes", e.target.value)
                    }
                    disabled={isViewMode}
                    placeholder="e.g., 30"
                    className={
                      validationErrors.duration_minutes
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {validationErrors.duration_minutes && (
                    <p className="text-xs text-red-500">
                      {validationErrors.duration_minutes}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION: Consent & Instructions */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
                Consent & Instructions
              </h3>

              <div className="flex items-center space-x-2">
                <Switch
                  id="requires_consent"
                  checked={formData.requires_consent}
                  onCheckedChange={(checked) =>
                    handleChange("requires_consent", checked)
                  }
                  disabled={isViewMode}
                />
                <Label
                  htmlFor="requires_consent"
                  className="text-xs font-normal"
                >
                  Requires Patient Consent
                </Label>
              </div>

              {formData.requires_consent && (
                <div className="space-y-2">
                  <Label
                    htmlFor="consent_form_template"
                    className="text-xs"
                  >
                    Consent Form Template
                  </Label>
                  <Textarea
                    id="consent_form_template"
                    value={formData.consent_form_template}
                    onChange={(e) =>
                      handleChange(
                        "consent_form_template",
                        e.target.value
                      )
                    }
                    disabled={isViewMode}
                    placeholder="Enter consent form template or reference"
                    rows={3}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="pre_procedure_instructions"
                  className="text-xs"
                >
                  Pre-Procedure Instructions
                </Label>
                <Textarea
                  id="pre_procedure_instructions"
                  value={formData.pre_procedure_instructions}
                  onChange={(e) =>
                    handleChange(
                      "pre_procedure_instructions",
                      e.target.value
                    )
                  }
                  disabled={isViewMode}
                  placeholder="Instructions to be followed before the procedure"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="post_procedure_instructions"
                  className="text-xs"
                >
                  Post-Procedure Instructions
                </Label>
                <Textarea
                  id="post_procedure_instructions"
                  value={formData.post_procedure_instructions}
                  onChange={(e) =>
                    handleChange(
                      "post_procedure_instructions",
                      e.target.value
                    )
                  }
                  disabled={isViewMode}
                  placeholder="Instructions to be followed after the procedure"
                  rows={3}
                />
              </div>
            </div>

            {/* SECTION: Clinical Info */}
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
                    handleChange("complications", e.target.value)
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
                    handleChange("contraindications", e.target.value)
                  }
                  disabled={isViewMode}
                  placeholder="When procedure should NOT be performed"
                  rows={3}
                />
              </div>
            </div>

            {/* SECTION: Status */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
                Status
              </h3>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    handleChange("is_active", checked)
                  }
                  disabled={isViewMode}
                />
                <Label htmlFor="is_active" className="text-xs font-normal">
                  Active (Available for use)
                </Label>
              </div>
            </div>

            {/* SECTION: Actions */}
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
                      {isCreateMode ? "Create Procedure" : "Update Procedure"}
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

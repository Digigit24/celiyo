import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  SideDrawer,
  type DrawerActionButton,
  type DrawerHeaderAction,
} from '@/components/SideDrawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Edit, Trash2, FileText, Info } from 'lucide-react';
import { toast } from 'sonner';

import type {
  ProcedureMaster,
  ProcedureMasterCreateData,
  ProcedureCategory,
} from '@/types/opd/procedureMaster.types';

import {
  useProcedureMaster,
  useCreateProcedureMaster,
  useUpdateProcedureMaster,
  useDeleteProcedureMaster,
} from '@/hooks/opd/useProcedureMaster.hooks';
import { Button } from '../ui/button';

interface ProcedureMasterFormDrawerProps {
  itemId?: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'view' | 'edit' | 'create';
  onSuccess?: () => void;
  onModeChange?: (mode: 'view' | 'edit' | 'create') => void;
}

// allowed categories
const CATEGORY_OPTIONS: { value: ProcedureCategory; label: string }[] = [
  { value: 'laboratory', label: 'Laboratory' },
  { value: 'radiology', label: 'Radiology' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'pathology', label: 'Pathology' },
  { value: 'ultrasound', label: 'Ultrasound' },
  { value: 'ct_scan', label: 'CT Scan' },
  { value: 'mri', label: 'MRI' },
  { value: 'ecg', label: 'ECG' },
  { value: 'xray', label: 'X-Ray' },
  { value: 'other', label: 'Other' },
];

const DEFAULT_FORM_DATA: ProcedureMasterCreateData = {
  code: '',
  name: '',
  category: 'laboratory',
  description: '',
  default_charge: '0.00',
  is_active: true,
};

export default function ProcedureMasterFormDrawer(props: ProcedureMasterFormDrawerProps) {
  const {
    itemId,
    open,
    onOpenChange,
    mode,
    onSuccess,
    onModeChange,
  } = props;

  // local mode so we can toggle view <-> edit without forcing parent immediately
  const [currentMode, setCurrentMode] = useState<'view' | 'edit' | 'create'>(mode);

  // active tab UI state
  const [activeTab, setActiveTab] = useState<'basic' | 'details'>('basic');

  // form state
  const [formData, setFormData] = useState<ProcedureMasterCreateData>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // we consider "create" mode as no fetch
  const isCreate = currentMode === 'create';
  const isEdit = currentMode === 'edit';
  const isView = currentMode === 'view';

  // only fetch from API if not create mode and we have a valid id
  const fetchItemId = isCreate ? null : (itemId ?? null);

  const {
    procedureMaster: fetchedItem,
    isLoading: isFetchingItem,
    error: fetchError,
  } = useProcedureMaster(fetchItemId);

  const { createProcedureMaster, isCreating } = useCreateProcedureMaster();
  const { updateProcedureMaster, isUpdating } = useUpdateProcedureMaster(itemId ?? 0);
  const { deleteProcedureMaster, isDeleting } = useDeleteProcedureMaster();

  const isSaving = isCreating || isUpdating;

  // sync down parent mode into local mode when parent changes
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  // reset drawer state when it's closed
  useEffect(() => {
    if (!open) {
      setFormData(DEFAULT_FORM_DATA);
      setErrors({});
      setActiveTab('basic');
    }
  }, [open]);

  // GUARDED HYDRATION: only hydrate for the record that opened the drawer
  useEffect(() => {
    if (!open) return;

    // create mode: use defaults
    if (isCreate) {
      setFormData(DEFAULT_FORM_DATA);
      setErrors({});
      return;
    }

    if (isFetchingItem) return;

    if (fetchError) {
      toast.error('Failed to load procedure data');
      return;
    }

    if (fetchedItem && itemId && fetchedItem.id === itemId) {
      setFormData({
        code: fetchedItem.code || '',
        name: fetchedItem.name || '',
        category: (fetchedItem.category as ProcedureCategory) || 'laboratory',
        description: fetchedItem.description || '',
        default_charge:
          fetchedItem.default_charge !== undefined && fetchedItem.default_charge !== null
            ? String(fetchedItem.default_charge)
            : '0.00',
        is_active: fetchedItem.is_active ?? true,
      });
      setErrors({});
    }
  }, [open, isCreate, isFetchingItem, fetchedItem, fetchError, itemId]);

  // -----------------------
  // validation
  // -----------------------
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      newErrors.code = 'Procedure code is required';
    }

    if (!formData.name?.trim()) {
      newErrors.name = 'Procedure name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // default_charge must be valid positive number or zero
    const chargeNum = parseFloat(formData.default_charge);
    if (isNaN(chargeNum) || chargeNum < 0) {
      newErrors.default_charge = 'Default charge must be a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // -----------------------
  // field change
  // -----------------------
  const handleChange = useCallback(
    (field: keyof ProcedureMasterCreateData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors]
  );

  // -----------------------
  // save (create or update)
  // -----------------------
  const handleSave = useCallback(async () => {
    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      if (isEdit && itemId) {
        await updateProcedureMaster(formData);
        toast.success('Procedure updated successfully');
      } else if (isCreate) {
        await createProcedureMaster(formData);
        toast.success('Procedure created successfully');
      } else {
        toast.error('Invalid action');
        return;
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save procedure');
    }
  }, [
    validate,
    isEdit,
    isCreate,
    itemId,
    formData,
    updateProcedureMaster,
    createProcedureMaster,
    onSuccess,
    onOpenChange,
  ]);

  // -----------------------
  // mode switches
  // -----------------------
  const handleSwitchToEdit = useCallback(() => {
    setCurrentMode('edit');
    onModeChange?.('edit');
  }, [onModeChange]);

  const handleSwitchToView = useCallback(() => {
    setCurrentMode('view');
    onModeChange?.('view');

    // reset unsaved edits back to last fetched snapshot
    if (fetchedItem) {
      setFormData({
        code: fetchedItem.code || '',
        name: fetchedItem.name || '',
        category: (fetchedItem.category as ProcedureCategory) || 'laboratory',
        description: fetchedItem.description || '',
        default_charge:
          fetchedItem.default_charge !== undefined && fetchedItem.default_charge !== null
            ? String(fetchedItem.default_charge)
            : '0.00',
        is_active: fetchedItem.is_active ?? true,
      });
      setErrors({});
    }
  }, [fetchedItem, onModeChange]);

  // -----------------------
  // delete
  // -----------------------
  const handleDelete = useCallback(async () => {
    if (!itemId) return;

    const ok = window.confirm(
      'Are you sure you want to delete this procedure? This action cannot be undone.'
    );
    if (!ok) return;

    try {
      await deleteProcedureMaster(itemId);
      toast.success('Procedure deleted successfully');
      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete procedure');
    }
  }, [itemId, deleteProcedureMaster, onSuccess, onOpenChange]);

  // -----------------------
  // header actions (view mode only)
  // -----------------------
  const headerActions: DrawerHeaderAction[] = useMemo(() => {
    if (!isView) return [];

    return [
      {
        icon: Edit,
        onClick: handleSwitchToEdit,
        label: 'Edit procedure',
        variant: 'ghost',
      },
      {
        icon: Trash2,
        onClick: handleDelete,
        label: 'Delete procedure',
        variant: 'ghost',
        disabled: isDeleting,
      },
    ];
  }, [isView, handleSwitchToEdit, handleDelete, isDeleting]);

  // -----------------------
  // footer buttons
  // -----------------------
  const footerButtons: DrawerActionButton[] = useMemo(() => {
    if (isView) {
      return [
        {
          label: 'Close',
          onClick: () => onOpenChange(false),
          variant: 'outline',
        },
      ];
    }

    if (isEdit) {
      return [
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
      ];
    }

    // create
    return [
      {
        label: 'Cancel',
        onClick: () => onOpenChange(false),
        variant: 'outline',
        disabled: isSaving,
      },
      {
        label: 'Create Procedure',
        onClick: handleSave,
        variant: 'default',
        loading: isSaving,
      },
    ];
  }, [isView, isEdit, isSaving, handleSave, handleSwitchToView, onOpenChange]);

  // -----------------------
  // drawer title / description
  // -----------------------
  const drawerTitle = useMemo(() => {
    if (isCreate) return 'Create New Procedure';
    if (isEdit) return `Edit ${fetchedItem?.name || 'Procedure'}`;
    return fetchedItem?.name || 'Procedure Details';
  }, [isCreate, isEdit, fetchedItem]);

  const drawerDescription = useMemo(() => {
    if (isCreate) {
      return 'Fill in the details below to create a new procedure master';
    }
    if (fetchedItem) {
      return `Code: ${fetchedItem.code} • Category: ${fetchedItem.category}`;
    }
    return undefined;
  }, [isCreate, fetchedItem]);

  // -----------------------
  // high-level loading / not found states
  // -----------------------
  const showLoadingState = !isCreate && isFetchingItem;

  const notFound =
    open &&
    !isCreate &&
    !isFetchingItem &&
    !fetchedItem &&
    !!itemId &&
    !fetchError;

  if (fetchError) {
    return (
      <SideDrawer
        open={open}
        onOpenChange={onOpenChange}
        title="Error Loading Procedure"
        description="There was a problem loading the procedure data"
        mode="view"
        headerActions={[]}
        isLoading={false}
        size="xl"
        footerButtons={[
          {
            label: 'Close',
            onClick: () => onOpenChange(false),
            variant: 'outline',
          },
        ]}
        footerAlignment="right"
        showBackButton={true}
        resizable={true}
        storageKey="procedure-master-form-drawer-width"
      >
        <div className="text-center py-12">
          <div className="text-red-500 text-sm mb-4">
            {(fetchError as any)?.message || 'Failed to load procedure data'}
          </div>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Close
          </Button>
        </div>
      </SideDrawer>
    );
  }

  if (notFound) {
    return (
      <SideDrawer
        open={open}
        onOpenChange={onOpenChange}
        title="Procedure not found"
        description={`No procedure found for ID ${itemId}`}
        mode="view"
        headerActions={[]}
        isLoading={false}
        size="xl"
        loadingText={undefined}
        footerButtons={[
          {
            label: 'Close',
            onClick: () => onOpenChange(false),
            variant: 'outline',
          },
        ]}
        footerAlignment="right"
        showBackButton={true}
        resizable={true}
        storageKey="procedure-master-form-drawer-width"
      >
        <div className="text-center text-muted-foreground py-12 text-sm">
          The record may have been deleted or you don't have access.
        </div>
      </SideDrawer>
    );
  }

  // -----------------------
  // NORMAL RENDER
  // -----------------------
  return (
    <SideDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={drawerTitle}
      description={drawerDescription}
      mode={currentMode}
      headerActions={headerActions}
      isLoading={showLoadingState}
      loadingText="Loading procedure data..."
      size="xl"
      footerButtons={footerButtons}
      footerAlignment="right"
      showBackButton={true}
      resizable={true}
      storageKey="procedure-master-form-drawer-width"
    >
      <Tabs
        value={activeTab}
        onValueChange={(val: 'basic' | 'details') => setActiveTab(val)}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">
            <FileText className="h-4 w-4 mr-2" />
            Basic Info
          </TabsTrigger>

          <TabsTrigger value="details" disabled={isCreate}>
            <Info className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
        </TabsList>

        {/* BASIC TAB */}
        <TabsContent value="basic" className="mt-6 space-y-5">
          {/* Procedure Code */}
          <div className="space-y-2">
            <Label htmlFor="code">
              Procedure Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              placeholder="e.g., CBC001, XRAY001"
              disabled={isView}
              className={errors.code ? 'border-red-500' : ''}
            />
            {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
            <p className="text-xs text-muted-foreground">
              Unique identifier for this procedure
            </p>
          </div>

          {/* Procedure Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Procedure Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Complete Blood Count, Chest X-Ray"
              disabled={isView}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                handleChange('category', value as ProcedureCategory)
              }
              disabled={isView}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Default Charge */}
          <div className="space-y-2">
            <Label htmlFor="default_charge">
              Default Charge (₹) <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                ₹
              </div>
              <Input
                id="default_charge"
                type="text"
                value={formData.default_charge}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*\.?\d{0,2}$/.test(val) || val === '') {
                    handleChange('default_charge', val);
                  }
                }}
                placeholder="0.00"
                disabled={isView}
                className={`pl-9 ${errors.default_charge ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.default_charge && (
              <p className="text-sm text-red-500">{errors.default_charge}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Standard charge for this procedure (can be overridden per visit)
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter detailed description of the procedure"
              rows={4}
              disabled={isView}
            />
            <p className="text-xs text-muted-foreground">
              Additional details about this procedure
            </p>
          </div>

          {/* Active Switch */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is_active" className="text-base">
                Active Status
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable this procedure for use in the system
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange('is_active', checked)}
              disabled={isView}
            />
          </div>
        </TabsContent>

        {/* DETAILS TAB */}
        <TabsContent value="details" className="mt-6 space-y-5">
          {itemId && fetchedItem ? (
            <>
              {/* Info Card */}
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <h4 className="font-semibold text-sm">Procedure Information</h4>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Procedure Code</p>
                    <p className="font-medium font-mono">{fetchedItem.code}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-xs">Category</p>
                    <p className="font-medium capitalize">
                      {String(fetchedItem.category).replace('_', ' ')}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-xs">Default Charge</p>
                    <p className="font-medium">
                      ₹
                      {parseFloat(fetchedItem.default_charge).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    <p className="font-medium">
                      {fetchedItem.is_active ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-gray-600">Inactive</span>
                      )}
                    </p>
                  </div>
                </div>

                {fetchedItem.description && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Description</p>
                    <p className="text-sm leading-relaxed">{fetchedItem.description}</p>
                  </div>
                )}
              </div>

              {/* Metadata Card */}
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <h4 className="font-semibold text-sm">Record Information</h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {fetchedItem.created_at
                        ? new Date(fetchedItem.created_at).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium">
                      {fetchedItem.updated_at
                        ? new Date(fetchedItem.updated_at).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Info className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Detailed information will be available after creating the procedure</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </SideDrawer>
  );
}

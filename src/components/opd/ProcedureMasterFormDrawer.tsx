// src/components/opd/ProcedureMasterFormDrawer.tsx
import { useEffect, useState, useCallback } from 'react';
import { SideDrawer, type DrawerActionButton, type DrawerHeaderAction } from '@/components/SideDrawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, FileText, DollarSign, Info } from 'lucide-react';
import { toast } from 'sonner';
import type { ProcedureMaster, ProcedureMasterCreateData, ProcedureCategory } from '@/types/opd/procedureMaster.types';
import { 
  useProcedureMaster,
  useCreateProcedureMaster,
  useUpdateProcedureMaster,
  useDeleteProcedureMaster,
} from '@/hooks/opd/useProcedureMaster.hooks';

interface ProcedureMasterFormDrawerProps {
  itemId?: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'view' | 'edit' | 'create';
  onSuccess?: () => void;
  onModeChange?: (mode: 'view' | 'edit' | 'create') => void;
}

// Category options matching backend
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

export default function ProcedureMasterFormDrawer({
  itemId,
  open,
  onOpenChange,
  mode,
  onSuccess,
  onModeChange,
}: ProcedureMasterFormDrawerProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [currentMode, setCurrentMode] = useState(mode);
  
  const isEdit = currentMode === 'edit';
  const isCreate = currentMode === 'create';
  const isView = currentMode === 'view';

  // CRITICAL FIX: Always pass itemId to the hook, let the hook handle null/undefined
  // The hook should skip fetching when itemId is null/undefined
  const { procedureMaster: item, isLoading } = useProcedureMaster(itemId);
  const { createProcedureMaster, isCreating } = useCreateProcedureMaster();
  const { updateProcedureMaster, isUpdating } = useUpdateProcedureMaster(itemId || 0);
  const { deleteProcedureMaster, isDeleting } = useDeleteProcedureMaster();

  const isSaving = isCreating || isUpdating;

  // Form state
  const [formData, setFormData] = useState<ProcedureMasterCreateData>({
    code: '',
    name: '',
    category: 'laboratory',
    description: '',
    default_charge: '0.00',
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync mode with prop
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  // Reset form when drawer opens in create mode or closed
  useEffect(() => {
    if (!open) {
      // Reset errors when drawer closes
      setErrors({});
      return;
    }

    if (isCreate) {
      // Reset form for create mode
      setFormData({
        code: '',
        name: '',
        category: 'laboratory',
        description: '',
        default_charge: '0.00',
        is_active: true,
      });
      setActiveTab('basic');
      setErrors({});
    }
  }, [open, isCreate]);

  // Load data for edit/view mode when item becomes available
  useEffect(() => {
    // Only populate form when we have item data and we're NOT in create mode
    if (!isCreate && item && !isLoading) {
      setFormData({
        code: item.code || '',
        name: item.name || '',
        category: item.category || 'laboratory',
        description: item.description || '',
        default_charge: item.default_charge || '0.00',
        is_active: item.is_active !== undefined ? item.is_active : true,
      });
    }
  }, [item, isLoading, isCreate]);

  // Validation
  const validate = (): boolean => {
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

    // Validate default_charge is a valid decimal
    const chargeNum = parseFloat(formData.default_charge);
    if (isNaN(chargeNum) || chargeNum < 0) {
      newErrors.default_charge = 'Default charge must be a valid positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field change
  const handleChange = (field: keyof ProcedureMasterCreateData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle submit
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
      }
      
      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save procedure');
    }
  }, [formData, isEdit, isCreate, itemId, createProcedureMaster, updateProcedureMaster, onSuccess, onOpenChange]);

  // Handle mode switch
  const handleSwitchToEdit = useCallback(() => {
    setCurrentMode('edit');
    onModeChange?.('edit');
  }, [onModeChange]);

  const handleSwitchToView = useCallback(() => {
    setCurrentMode('view');
    onModeChange?.('view');
    // Reload data to discard changes
    if (item) {
      setFormData({
        code: item.code || '',
        name: item.name || '',
        category: item.category || 'laboratory',
        description: item.description || '',
        default_charge: item.default_charge || '0.00',
        is_active: item.is_active !== undefined ? item.is_active : true,
      });
      setErrors({});
    }
  }, [item, onModeChange]);

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!itemId) return;

    if (!confirm('Are you sure you want to delete this procedure? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteProcedureMaster(itemId);
      toast.success('Procedure deleted successfully');
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete procedure');
    }
  }, [itemId, deleteProcedureMaster, onSuccess, onOpenChange]);

  // Header actions (for view mode)
  const headerActions: DrawerHeaderAction[] = isView ? [
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
  ] : [];

  // Footer buttons
  const footerButtons: DrawerActionButton[] = 
    isView
      ? [
          {
            label: 'Close',
            onClick: () => onOpenChange(false),
            variant: 'outline',
          },
        ]
      : isEdit
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

  // Drawer title
  const drawerTitle = 
    isCreate ? 'Create New Procedure' :
    isEdit ? `Edit ${item?.name || 'Procedure'}` :
    item?.name || 'Procedure Details';

  // Drawer description
  const drawerDescription = 
    isCreate ? 'Fill in the details below to create a new procedure master' :
    item ? `Code: ${item.code} • Category: ${item.category}` :
    undefined;

  // Show loading state for view/edit modes until data loads
  const showLoadingState = !isCreate && isLoading;

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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
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

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="mt-6 space-y-5">
          {/* Code Field */}
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
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Unique identifier for this procedure
            </p>
          </div>

          {/* Name Field */}
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
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Category Field */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange('category', value as ProcedureCategory)}
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

          {/* Default Charge Field */}
          <div className="space-y-2">
            <Label htmlFor="default_charge">
              Default Charge (₹) <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="default_charge"
                type="text"
                value={formData.default_charge}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only numbers and decimal point
                  if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
                    handleChange('default_charge', value);
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

          {/* Description Field */}
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

          {/* Active Status Switch */}
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

        {/* Details Tab (disabled for create mode) */}
        <TabsContent value="details" className="mt-6 space-y-5">
          {itemId && item ? (
            <>
              {/* Procedure Information Card */}
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <h4 className="font-semibold text-sm">Procedure Information</h4>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Procedure Code</p>
                    <p className="font-medium font-mono">{item.code}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Category</p>
                    <p className="font-medium capitalize">{item.category.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Default Charge</p>
                    <p className="font-medium">₹{parseFloat(item.default_charge).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    <p className="font-medium">
                      {item.is_active ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-gray-600">Inactive</span>
                      )}
                    </p>
                  </div>
                </div>

                {item.description && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Description</p>
                    <p className="text-sm leading-relaxed">{item.description}</p>
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
                      {item.created_at ? new Date(item.created_at).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      }) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium">
                      {item.updated_at ? new Date(item.updated_at).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      }) : '—'}
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
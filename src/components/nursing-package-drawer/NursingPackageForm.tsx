// src/components/nursing-package-drawer/NursingPackageForm.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, Plus } from 'lucide-react';
import type { NursingCarePackage } from '@/types/service.types';
import { 
  PACKAGE_TYPE_CHOICES, 
  TARGET_GROUP_CHOICES 
} from '@/types/service.types';
import { useServiceCategories } from '@/hooks/useServices';

// Validation schema
const nursingPackageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
  category_id: z.number({
    required_error: 'Category is required',
    invalid_type_error: 'Category is required',
  }),
  base_price: z.coerce.number().min(0, 'Base price must be positive'),
  discounted_price: z.coerce.number().min(0).optional().nullable(),
  package_type: z.enum(['hourly', 'half_day', 'full_day']),
  target_group: z.enum(['elderly', 'post_surgery', 'child_care', 'other']).default('other'),
  max_duration: z.coerce.number().min(0, 'Max duration is required'),
  included_services: z.array(z.string()).optional().nullable(),
  duration_minutes: z.coerce.number().min(0).default(240),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

type FormData = z.infer<typeof nursingPackageSchema>;

interface NursingPackageFormProps {
  package: NursingCarePackage | null;
  mode: 'view' | 'edit' | 'create';
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function NursingPackageForm({
  package: pkg,
  mode,
  onSubmit,
  onCancel,
  isSubmitting,
}: NursingPackageFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    pkg?.image || null
  );
  const [serviceInput, setServiceInput] = useState('');
  const [services, setServices] = useState<string[]>(pkg?.included_services || []);

  // Fetch categories
  const { categories, isLoading: categoriesLoading } = useServiceCategories({
    is_active: true,
    type: 'nursing',
    page_size: 100,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(nursingPackageSchema),
    defaultValues: {
      name: pkg?.name || '',
      code: pkg?.code || '',
      description: pkg?.description || '',
      category_id: pkg?.category?.id,
      base_price: pkg?.base_price ? parseFloat(pkg.base_price) : 0,
      discounted_price: pkg?.discounted_price ? parseFloat(pkg.discounted_price) : null,
      package_type: pkg?.package_type || 'half_day',
      target_group: pkg?.target_group || 'other',
      max_duration: pkg?.max_duration || 0,
      included_services: pkg?.included_services || [],
      duration_minutes: pkg?.duration_minutes || 240,
      is_active: pkg?.is_active ?? true,
      is_featured: pkg?.is_featured || false,
    },
  });

  // Update form when package changes
  useEffect(() => {
    if (pkg) {
      form.reset({
        name: pkg.name,
        code: pkg.code,
        description: pkg.description || '',
        category_id: pkg.category?.id,
        base_price: parseFloat(pkg.base_price),
        discounted_price: pkg.discounted_price ? parseFloat(pkg.discounted_price) : null,
        package_type: pkg.package_type,
        target_group: pkg.target_group,
        max_duration: pkg.max_duration,
        included_services: pkg.included_services || [],
        duration_minutes: pkg.duration_minutes,
        is_active: pkg.is_active,
        is_featured: pkg.is_featured,
      });
      setServices(pkg.included_services || []);
      setImagePreview(pkg.image);
    }
  }, [pkg, form]);

  // Handle image file change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Service list management
  const handleAddService = () => {
    if (serviceInput.trim()) {
      const newServices = [...services, serviceInput.trim()];
      setServices(newServices);
      form.setValue('included_services', newServices);
      setServiceInput('');
    }
  };

  const handleRemoveService = (index: number) => {
    const newServices = services.filter((_, i) => i !== index);
    setServices(newServices);
    form.setValue('included_services', newServices);
  };

  const handleFormSubmit = async (data: FormData) => {
    try {
      const submitData: any = {
        ...data,
        discounted_price: data.discounted_price || null,
        included_services: services.length > 0 ? services : null,
      };

      // Add image if new file selected
      if (imageFile) {
        submitData.image = imageFile;
      }

      await onSubmit(submitData);
    } catch (error) {
      // Error is handled by parent
      console.error('Form submission error:', error);
    }
  };

  const isReadOnly = mode === 'view';

  // View mode display
  if (isReadOnly && pkg) {
    return (
      <div className="space-y-6">
        {/* Image */}
        {pkg.image && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Package Image</h3>
            <img
              src={pkg.image}
              alt={pkg.name}
              className="w-full max-w-sm rounded-lg border"
            />
          </div>
        )}

        {/* Basic Info */}
        <div className="grid gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p className="text-base font-semibold">{pkg.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Code</p>
            <p className="text-base">{pkg.code}</p>
          </div>
          {pkg.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-base">{pkg.description}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Category</p>
            <Badge variant="secondary">{pkg.category?.name || 'No Category'}</Badge>
          </div>
        </div>

        <Separator />

        {/* Pricing */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Pricing</h3>
          <div className="grid gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Base Price</p>
              <p className="text-base font-semibold">₹{pkg.base_price}</p>
            </div>
            {pkg.discounted_price && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Discounted Price</p>
                <p className="text-base font-semibold text-green-600">₹{pkg.discounted_price}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Final Price</p>
              <p className="text-lg font-bold text-primary">₹{pkg.final_price}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Package Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Package Details</h3>
          <div className="grid gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Package Type</p>
              <Badge variant="secondary" className="capitalize">
                {pkg.package_type.replace('_', ' ')}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Target Group</p>
              <Badge variant="outline" className="capitalize">
                {pkg.target_group.replace('_', ' ')}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Max Duration</p>
              <p className="text-base">{pkg.max_duration} hours</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Duration</p>
              <p className="text-base">{pkg.duration_minutes} minutes</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Included Services */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Included Services</h3>
          {pkg.included_services && pkg.included_services.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {pkg.included_services.map((service, idx) => (
                <li key={idx} className="text-sm">{service}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No services listed</p>
          )}
        </div>

        <Separator />

        {/* Status */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Status</h3>
          <div className="flex gap-2">
            <Badge variant={pkg.is_active ? 'default' : 'secondary'}>
              {pkg.is_active ? 'Active' : 'Inactive'}
            </Badge>
            {pkg.is_featured && (
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                Featured
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Edit/Create mode form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-3">
          <FormLabel>Package Image</FormLabel>
          {imagePreview && (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-w-sm rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="cursor-pointer"
            />
            <FormDescription>Upload an image for the package</FormDescription>
          </div>
        </div>

        <Separator />

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Basic Information</h3>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Elderly Care Package" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package Code *</FormLabel>
                <FormControl>
                  <Input placeholder="NCP-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detailed description of the package..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select
                  disabled={categoriesLoading}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Pricing */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Pricing</h3>

          <FormField
            control={form.control}
            name="base_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Price (₹) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="1000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discounted_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discounted Price (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="800"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>Leave empty if no discount</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Package Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Package Details</h3>

          <FormField
            control={form.control}
            name="package_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PACKAGE_TYPE_CHOICES.map((choice) => (
                      <SelectItem key={choice.value} value={choice.value}>
                        {choice.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target_group"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Group *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TARGET_GROUP_CHOICES.map((choice) => (
                      <SelectItem key={choice.value} value={choice.value}>
                        {choice.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="max_duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Duration (hours) *</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="8" {...field} />
                </FormControl>
                <FormDescription>Maximum duration of care</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="240" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Included Services */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Included Services</h3>
          
          <div className="flex gap-2">
            <Input
              placeholder="Add a service..."
              value={serviceInput}
              onChange={(e) => setServiceInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddService();
                }
              }}
            />
            <Button type="button" onClick={handleAddService} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {services.length > 0 && (
            <div className="space-y-2">
              {services.map((service, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <span className="text-sm">{service}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveService(idx)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Status Flags */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Status & Visibility</h3>

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Active</FormLabel>
                  <FormDescription>Package is available for booking</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_featured"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Featured</FormLabel>
                  <FormDescription>Show on homepage and featured lists</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Create Package' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
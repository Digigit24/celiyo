// src/components/diagnostic-test-drawer/DiagnosticTestForm.tsx
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
import { Loader2, Upload, X } from 'lucide-react';
import type { DiagnosticTest } from '@/types/service.types';
import { 
  SAMPLE_TYPE_CHOICES, 
  REPORTING_TYPE_CHOICES 
} from '@/types/service.types';
import { useServiceCategories } from '@/hooks/useServices';

// Validation schema
const diagnosticTestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
  category_id: z.number({
    required_error: 'Category is required',
    invalid_type_error: 'Category is required',
  }),
  base_price: z.coerce.number().min(0, 'Base price must be positive'),
  discounted_price: z.coerce.number().min(0).optional().nullable(),
  sample_type: z.enum(['blood', 'urine', 'imaging', 'other']),
  is_home_collection: z.boolean().default(false),
  home_collection_fee: z.coerce.number().min(0).default(0),
  preparation_instructions: z.string().optional(),
  typical_turnaround_time: z.coerce.number().min(0, 'Turnaround time is required'),
  reporting_type: z.enum(['digital', 'physical', 'both']).default('digital'),
  duration_minutes: z.coerce.number().min(0).default(30),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

type FormData = z.infer<typeof diagnosticTestSchema>;

interface DiagnosticTestFormProps {
  test: DiagnosticTest | null;
  mode: 'view' | 'edit' | 'create';
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function DiagnosticTestForm({
  test,
  mode,
  onSubmit,
  onCancel,
  isSubmitting,
}: DiagnosticTestFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    test?.image || null
  );

  // Fetch categories
  const { categories, isLoading: categoriesLoading } = useServiceCategories({
    is_active: true,
    page_size: 100,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(diagnosticTestSchema),
    defaultValues: {
      name: test?.name || '',
      code: test?.code || '',
      description: test?.description || '',
      category_id: test?.category?.id,
      base_price: test?.base_price ? parseFloat(test.base_price) : 0,
      discounted_price: test?.discounted_price ? parseFloat(test.discounted_price) : null,
      sample_type: test?.sample_type || 'blood',
      is_home_collection: test?.is_home_collection || false,
      home_collection_fee: test?.home_collection_fee ? parseFloat(test.home_collection_fee) : 0,
      preparation_instructions: test?.preparation_instructions || '',
      typical_turnaround_time: test?.typical_turnaround_time || 0,
      reporting_type: test?.reporting_type || 'digital',
      duration_minutes: test?.duration_minutes || 30,
      is_active: test?.is_active ?? true,
      is_featured: test?.is_featured || false,
    },
  });

  // Update form when test changes
  useEffect(() => {
    if (test) {
      form.reset({
        name: test.name,
        code: test.code,
        description: test.description || '',
        category_id: test.category?.id,
        base_price: parseFloat(test.base_price),
        discounted_price: test.discounted_price ? parseFloat(test.discounted_price) : null,
        sample_type: test.sample_type,
        is_home_collection: test.is_home_collection,
        home_collection_fee: parseFloat(test.home_collection_fee),
        preparation_instructions: test.preparation_instructions || '',
        typical_turnaround_time: test.typical_turnaround_time,
        reporting_type: test.reporting_type,
        duration_minutes: test.duration_minutes,
        is_active: test.is_active,
        is_featured: test.is_featured,
      });
      setImagePreview(test.image);
    }
  }, [test, form]);

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

  const handleFormSubmit = async (data: FormData) => {
    try {
      const submitData: any = {
        ...data,
        discounted_price: data.discounted_price || null,
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
  if (isReadOnly && test) {
    return (
      <div className="space-y-6">
        {/* Image */}
        {test.image && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Test Image</h3>
            <img
              src={test.image}
              alt={test.name}
              className="w-full max-w-sm rounded-lg border"
            />
          </div>
        )}

        {/* Basic Info */}
        <div className="grid gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p className="text-base font-semibold">{test.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Code</p>
            <p className="text-base">{test.code}</p>
          </div>
          {test.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-base">{test.description}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Category</p>
            <Badge variant="secondary">{test.category?.name || 'No Category'}</Badge>
          </div>
        </div>

        <Separator />

        {/* Pricing */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Pricing</h3>
          <div className="grid gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Base Price</p>
              <p className="text-base font-semibold">₹{test.base_price}</p>
            </div>
            {test.discounted_price && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Discounted Price</p>
                <p className="text-base font-semibold text-green-600">₹{test.discounted_price}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Final Price</p>
              <p className="text-lg font-bold text-primary">₹{test.final_price}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Sample Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Sample & Collection</h3>
          <div className="grid gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sample Type</p>
              <Badge variant="secondary" className="capitalize">{test.sample_type}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Home Collection</p>
              <p className="text-base">{test.is_home_collection ? 'Available' : 'Not Available'}</p>
            </div>
            {test.is_home_collection && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Home Collection Fee</p>
                <p className="text-base">₹{test.home_collection_fee}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Test Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Test Details</h3>
          <div className="grid gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Turnaround Time</p>
              <p className="text-base">{test.typical_turnaround_time} hours</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Reporting Type</p>
              <Badge variant="outline" className="capitalize">{test.reporting_type}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Duration</p>
              <p className="text-base">{test.duration_minutes} minutes</p>
            </div>
            {test.preparation_instructions && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Preparation Instructions</p>
                <p className="text-base whitespace-pre-wrap">{test.preparation_instructions}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Status */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Status</h3>
          <div className="flex gap-2">
            <Badge variant={test.is_active ? 'default' : 'secondary'}>
              {test.is_active ? 'Active' : 'Inactive'}
            </Badge>
            {test.is_featured && (
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
          <FormLabel>Test Image</FormLabel>
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
            <FormDescription>Upload an image for the diagnostic test</FormDescription>
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
                <FormLabel>Test Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Complete Blood Count" {...field} />
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
                <FormLabel>Test Code *</FormLabel>
                <FormControl>
                  <Input placeholder="CBC-001" {...field} />
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
                    placeholder="Detailed description of the test..."
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
                  <Input type="number" step="0.01" min="0" placeholder="500" {...field} />
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
                    placeholder="450"
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

        {/* Sample & Collection */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Sample & Collection</h3>

          <FormField
            control={form.control}
            name="sample_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sample Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SAMPLE_TYPE_CHOICES.map((choice) => (
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
            name="is_home_collection"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Home Collection Available</FormLabel>
                  <FormDescription>
                    Can this test be collected at patient's home?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {form.watch('is_home_collection') && (
            <FormField
              control={form.control}
              name="home_collection_fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home Collection Fee (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <Separator />

        {/* Test Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Test Details</h3>

          <FormField
            control={form.control}
            name="typical_turnaround_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Turnaround Time (hours) *</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="24" {...field} />
                </FormControl>
                <FormDescription>Time to deliver results</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reporting_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reporting Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {REPORTING_TYPE_CHOICES.map((choice) => (
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
            name="duration_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Test Duration (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="30" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preparation_instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preparation Instructions</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., Fasting required for 8-12 hours..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                  <FormDescription>Test is available for booking</FormDescription>
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
            {mode === 'create' ? 'Create Test' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
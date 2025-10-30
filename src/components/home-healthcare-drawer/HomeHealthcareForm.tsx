// src/components/home-healthcare-drawer/HomeHealthcareForm.tsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { ImagePlus, X, IndianRupee, Clock, MapPin, Stethoscope, Wrench } from 'lucide-react';
import type { HomeHealthcareService, HomeHealthcareServiceCreateData } from '@/types/service.types';
import { HOME_SERVICE_TYPE_CHOICES, STAFF_TYPE_CHOICES } from '@/types/service.types';
import { useServiceCategories } from '@/hooks/useServices';

interface HomeHealthcareFormProps {
  service?: HomeHealthcareService | null;
  mode: 'view' | 'edit' | 'create';
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function HomeHealthcareForm({
  service,
  mode,
  onSubmit,
  onCancel,
  isSubmitting,
}: HomeHealthcareFormProps) {
  const isViewMode = mode === 'view';
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Fetch categories
  const { categories } = useServiceCategories({ is_active: true, type: 'home_care', page_size: 100 });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: service?.name || '',
      code: service?.code || '',
      description: service?.description || '',
      base_price: service?.base_price || '',
      discounted_price: service?.discounted_price || '',
      category_id: service?.category?.id || '',
      service_type: service?.service_type || 'medical_assistance',
      staff_type_required: service?.staff_type_required || 'nurse',
      equipment_needed: service?.equipment_needed || '',
      max_distance_km: service?.max_distance_km || '',
      duration_minutes: service?.duration_minutes || 30,
      is_active: service?.is_active ?? true,
      is_featured: service?.is_featured ?? false,
    },
  });

  // Watch for price changes to calculate savings
  const basePrice = watch('base_price');
  const discountedPrice = watch('discounted_price');
  const isActive = watch('is_active');
  const isFeatured = watch('is_featured');

  // Calculate savings
  const savings = discountedPrice && basePrice
    ? parseFloat(basePrice.toString()) - parseFloat(discountedPrice.toString())
    : 0;

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Set initial image preview
  useEffect(() => {
    if (service?.image) {
      setImagePreview(service.image);
    }
  }, [service]);

  const onSubmitForm = async (data: any) => {
    const formData: any = {
      ...data,
      category_id: parseInt(data.category_id),
      base_price: parseFloat(data.base_price),
      discounted_price: data.discounted_price ? parseFloat(data.discounted_price) : null,
      duration_minutes: parseInt(data.duration_minutes),
      max_distance_km: data.max_distance_km ? parseFloat(data.max_distance_km) : null,
    };

    // Add image if selected
    if (selectedImage) {
      formData.image = selectedImage;
    }

    await onSubmit(formData);
  };

  if (isViewMode && service) {
    return (
      <div className="space-y-6">
        {/* Image Section */}
        {service.image && (
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
            <img
              src={service.image}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className={
              service.is_active
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
            }
          >
            {service.is_active ? 'Active' : 'Inactive'}
          </Badge>
          {service.is_featured && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              Featured
            </Badge>
          )}
          <Badge variant="secondary" className="capitalize">
            {service.service_type.replace(/_/g, ' ')}
          </Badge>
          <Badge variant="outline">
            <Stethoscope className="h-3 w-3 mr-1" />
            {service.staff_type_required}
          </Badge>
        </div>

        <Separator />

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Basic Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Service Name</Label>
              <p className="text-sm font-medium mt-1">{service.name}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Service Code</Label>
              <p className="text-sm font-medium mt-1">{service.code}</p>
            </div>
          </div>

          {service.description && (
            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <p className="text-sm mt-1">{service.description}</p>
            </div>
          )}

          <div>
            <Label className="text-xs text-muted-foreground">Category</Label>
            <p className="text-sm font-medium mt-1">{service.category?.name || 'No Category'}</p>
          </div>
        </div>

        <Separator />

        {/* Pricing Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Pricing</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Base Price</Label>
              <div className="flex items-center gap-1 mt-1">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">₹{parseFloat(service.base_price).toFixed(2)}</p>
              </div>
            </div>
            {service.discounted_price && (
              <div>
                <Label className="text-xs text-muted-foreground">Discounted Price</Label>
                <div className="flex items-center gap-1 mt-1">
                  <IndianRupee className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium text-green-600">
                    ₹{parseFloat(service.discounted_price).toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {service.discounted_price && (
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-400">
                Save ₹{(parseFloat(service.base_price) - parseFloat(service.discounted_price)).toFixed(2)}
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Service Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Service Details</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Service Type</Label>
              <p className="text-sm font-medium mt-1 capitalize">
                {service.service_type.replace(/_/g, ' ')}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Staff Required</Label>
              <p className="text-sm font-medium mt-1 capitalize">{service.staff_type_required}</p>
            </div>
          </div>

          {service.duration_minutes > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Duration</Label>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">
                  {service.duration_minutes < 60
                    ? `${service.duration_minutes} minutes`
                    : `${Math.floor(service.duration_minutes / 60)}h ${service.duration_minutes % 60}m`}
                </p>
              </div>
            </div>
          )}

          {Number(service.max_distance_km ?? 10) > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Maximum Distance</Label>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{Number(service.max_distance_km ?? 10).toFixed(1)} km</p>
              </div>
            </div>
          )}

          {service.equipment_needed && (
            <div>
              <Label className="text-xs text-muted-foreground">Equipment Needed</Label>
              <div className="flex items-start gap-2 mt-1">
                <Wrench className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm">{service.equipment_needed}</p>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Metadata */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Metadata</h3>
          
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <Label className="text-xs text-muted-foreground">Created</Label>
              <p className="mt-1">{new Date(service.created_at).toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Last Updated</Label>
              <p className="mt-1">{new Date(service.updated_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Image Upload */}
      <div className="space-y-3">
        <Label htmlFor="image">Service Image</Label>
        {imagePreview ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover"
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
        ) : (
          <label
            htmlFor="image"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <ImagePlus className="h-10 w-10 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Click to upload image</span>
            <input
              id="image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        )}
      </div>

      <Separator />

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Service Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name', { required: 'Service name is required' })}
              placeholder="E.g., Home Consultation"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">
              Service Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              {...register('code', { required: 'Service code is required' })}
              placeholder="E.g., HC001"
            />
            {errors.code && (
              <p className="text-xs text-destructive">{errors.code.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Brief description of the service"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category_id">
            Category <span className="text-destructive">*</span>
          </Label>
          <Select
            value={watch('category_id')?.toString()}
            onValueChange={(value) => setValue('category_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category_id && (
            <p className="text-xs text-destructive">{errors.category_id.message}</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Pricing</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="base_price">
              Base Price (₹) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="base_price"
                type="number"
                step="0.01"
                {...register('base_price', { required: 'Base price is required' })}
                placeholder="0.00"
                className="pl-9"
              />
            </div>
            {errors.base_price && (
              <p className="text-xs text-destructive">{errors.base_price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="discounted_price">Discounted Price (₹)</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="discounted_price"
                type="number"
                step="0.01"
                {...register('discounted_price')}
                placeholder="0.00"
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {savings > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-400">
              Customers save ₹{savings.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      <Separator />

      {/* Service Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Service Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="service_type">
              Service Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('service_type')}
              onValueChange={(value) => setValue('service_type', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {HOME_SERVICE_TYPE_CHOICES.map((choice) => (
                  <SelectItem key={choice.value} value={choice.value}>
                    {choice.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff_type_required">
              Staff Type Required <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('staff_type_required')}
              onValueChange={(value) => setValue('staff_type_required', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select staff type" />
              </SelectTrigger>
              <SelectContent>
                {STAFF_TYPE_CHOICES.map((choice) => (
                  <SelectItem key={choice.value} value={choice.value}>
                    {choice.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration_minutes">Duration (minutes)</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="duration_minutes"
                type="number"
                {...register('duration_minutes')}
                placeholder="30"
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_distance_km">Maximum Distance (km)</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="max_distance_km"
                type="number"
                step="0.1"
                {...register('max_distance_km')}
                placeholder="10.0"
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="equipment_needed">Equipment Needed</Label>
          <div className="relative">
            <Wrench className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Textarea
              id="equipment_needed"
              {...register('equipment_needed')}
              placeholder="List any equipment needed for this service"
              rows={2}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Status Toggles */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Status</h3>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="is_active">Active Service</Label>
            <p className="text-xs text-muted-foreground">
              Make this service available for booking
            </p>
          </div>
          <Switch
            id="is_active"
            checked={isActive}
            onCheckedChange={(checked) => setValue('is_active', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="is_featured">Featured Service</Label>
            <p className="text-xs text-muted-foreground">
              Show this service in featured section
            </p>
          </div>
          <Switch
            id="is_featured"
            checked={isFeatured}
            onCheckedChange={(checked) => setValue('is_featured', checked)}
          />
        </div>
      </div>

      <Separator />

      {/* Form Actions */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Service' : 'Update Service'}
        </Button>
      </div>
    </form>
  );
}
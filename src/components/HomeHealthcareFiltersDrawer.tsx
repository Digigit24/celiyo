// src/components/HomeHealthcareFiltersDrawer.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';
import type { HomeHealthcareServiceListParams } from '@/types/service.types';
import { HOME_SERVICE_TYPE_CHOICES, STAFF_TYPE_CHOICES } from '@/types/service.types';
import { useServiceCategories } from '@/hooks/useServices';

interface HomeHealthcareFiltersDrawerProps {
  filters: HomeHealthcareServiceListParams;
  onApplyFilters: (filters: HomeHealthcareServiceListParams) => void;
  onResetFilters: () => void;
  onClose: () => void;
}

export default function HomeHealthcareFiltersDrawer({
  filters,
  onApplyFilters,
  onResetFilters,
  onClose,
}: HomeHealthcareFiltersDrawerProps) {
  const [localFilters, setLocalFilters] = useState<HomeHealthcareServiceListParams>(filters);

  // Fetch categories for filter dropdown
  const { categories } = useServiceCategories({ is_active: true, type: 'home_care', page_size: 100 });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleReset = () => {
    onResetFilters();
  };

  const updateFilter = <K extends keyof HomeHealthcareServiceListParams>(
    key: K,
    value: HomeHealthcareServiceListParams[K]
  ) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Status Filter */}
        <div className="space-y-3">
          <Label>Status</Label>
          <div className="flex items-center justify-between">
            <span className="text-sm">Active Only</span>
            <Switch
              checked={localFilters.is_active === true}
              onCheckedChange={(checked) =>
                updateFilter('is_active', checked ? true : undefined)
              }
            />
          </div>
        </div>

        <Separator />

        {/* Category Filter */}
        <div className="space-y-3">
          <Label>Category</Label>
          <Select
            value={localFilters.category?.toString() || 'all'}
            onValueChange={(value) =>
              updateFilter('category', value === 'all' ? undefined : parseInt(value))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Service Type Filter */}
        <div className="space-y-3">
          <Label>Service Type</Label>
          <Select
            value={localFilters.service_type || 'all'}
            onValueChange={(value) =>
              updateFilter('service_type', value === 'all' ? undefined : (value as any))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All service types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Service Types</SelectItem>
              {HOME_SERVICE_TYPE_CHOICES.map((choice) => (
                <SelectItem key={choice.value} value={choice.value}>
                  {choice.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Staff Type Filter */}
        <div className="space-y-3">
          <Label>Staff Type Required</Label>
          <Select
            value={localFilters.staff_type_required || 'all'}
            onValueChange={(value) =>
              updateFilter('staff_type_required', value === 'all' ? undefined : (value as any))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All staff types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff Types</SelectItem>
              {STAFF_TYPE_CHOICES.map((choice) => (
                <SelectItem key={choice.value} value={choice.value}>
                  {choice.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t p-4 space-y-2">
        <Button onClick={handleApply} className="w-full">
          Apply Filters
        </Button>
        <Button onClick={handleReset} variant="outline" className="w-full">
          Reset All
        </Button>
      </div>
    </div>
  );
}
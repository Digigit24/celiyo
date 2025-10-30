// src/components/NursingPackageFiltersDrawer.tsx
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
import type { NursingCarePackageListParams } from '@/types/service.types';
import { PACKAGE_TYPE_CHOICES, TARGET_GROUP_CHOICES } from '@/types/service.types';
import { useServiceCategories } from '@/hooks/useServices';

interface NursingPackageFiltersDrawerProps {
  filters: NursingCarePackageListParams;
  onApplyFilters: (filters: NursingCarePackageListParams) => void;
  onResetFilters: () => void;
  onClose: () => void;
}

export default function NursingPackageFiltersDrawer({
  filters,
  onApplyFilters,
  onResetFilters,
  onClose,
}: NursingPackageFiltersDrawerProps) {
  const [localFilters, setLocalFilters] = useState<NursingCarePackageListParams>(filters);

  // Fetch categories for filter dropdown
  const { categories } = useServiceCategories({ is_active: true, type: 'nursing', page_size: 100 });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleReset = () => {
    onResetFilters();
  };

  const updateFilter = <K extends keyof NursingCarePackageListParams>(
    key: K,
    value: NursingCarePackageListParams[K]
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

        {/* Package Type Filter */}
        <div className="space-y-3">
          <Label>Package Type</Label>
          <Select
            value={localFilters.package_type || 'all'}
            onValueChange={(value) =>
              updateFilter('package_type', value === 'all' ? undefined : (value as any))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All package types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Package Types</SelectItem>
              {PACKAGE_TYPE_CHOICES.map((choice) => (
                <SelectItem key={choice.value} value={choice.value}>
                  {choice.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Target Group Filter */}
        <div className="space-y-3">
          <Label>Target Group</Label>
          <Select
            value={localFilters.target_group || 'all'}
            onValueChange={(value) =>
              updateFilter('target_group', value === 'all' ? undefined : (value as any))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All target groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Target Groups</SelectItem>
              {TARGET_GROUP_CHOICES.map((choice) => (
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
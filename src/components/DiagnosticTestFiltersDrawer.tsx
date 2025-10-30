// src/components/DiagnosticTestFiltersDrawer.tsx
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
import type { DiagnosticTestListParams } from '@/types/service.types';
import { SAMPLE_TYPE_CHOICES, REPORTING_TYPE_CHOICES } from '@/types/service.types';
import { useServiceCategories } from '@/hooks/useServices';

interface DiagnosticTestFiltersDrawerProps {
  filters: DiagnosticTestListParams;
  onApplyFilters: (filters: DiagnosticTestListParams) => void;
  onResetFilters: () => void;
  onClose: () => void;
}

export default function DiagnosticTestFiltersDrawer({
  filters,
  onApplyFilters,
  onResetFilters,
  onClose,
}: DiagnosticTestFiltersDrawerProps) {
  const [localFilters, setLocalFilters] = useState<DiagnosticTestListParams>(filters);

  // Fetch categories for filter dropdown
  const { categories } = useServiceCategories({ is_active: true, page_size: 100 });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleReset = () => {
    onResetFilters();
  };

  const updateFilter = <K extends keyof DiagnosticTestListParams>(
    key: K,
    value: DiagnosticTestListParams[K]
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

        {/* Sample Type Filter */}
        <div className="space-y-3">
          <Label>Sample Type</Label>
          <Select
            value={localFilters.sample_type || 'all'}
            onValueChange={(value) =>
              updateFilter('sample_type', value === 'all' ? undefined : (value as any))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All sample types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sample Types</SelectItem>
              {SAMPLE_TYPE_CHOICES.map((choice) => (
                <SelectItem key={choice.value} value={choice.value}>
                  {choice.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Reporting Type Filter */}
        <div className="space-y-3">
          <Label>Reporting Type</Label>
          <Select
            value={localFilters.reporting_type || 'all'}
            onValueChange={(value) =>
              updateFilter('reporting_type', value === 'all' ? undefined : (value as any))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All reporting types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reporting Types</SelectItem>
              {REPORTING_TYPE_CHOICES.map((choice) => (
                <SelectItem key={choice.value} value={choice.value}>
                  {choice.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Home Collection Filter */}
        <div className="space-y-3">
          <Label>Home Collection</Label>
          <Select
            value={
              localFilters.is_home_collection === undefined
                ? 'all'
                : localFilters.is_home_collection
                ? 'yes'
                : 'no'
            }
            onValueChange={(value) =>
              updateFilter(
                'is_home_collection',
                value === 'all' ? undefined : value === 'yes'
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All tests" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tests</SelectItem>
              <SelectItem value="yes">Home Collection Available</SelectItem>
              <SelectItem value="no">No Home Collection</SelectItem>
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
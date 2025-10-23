// src/components/SpecialtyFiltersDrawer.tsx
import { useState, useEffect } from 'react';
import type { SpecialtyListParams } from '@/types/doctor.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';

interface SpecialtyFiltersDrawerProps {
  filters: SpecialtyListParams;
  onApplyFilters: (filters: SpecialtyListParams) => void;
  onResetFilters: () => void;
  onClose: () => void;
}

export default function SpecialtyFiltersDrawer({
  filters,
  onApplyFilters,
  onResetFilters,
  onClose,
}: SpecialtyFiltersDrawerProps) {
  const [localFilters, setLocalFilters] = useState<SpecialtyListParams>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleReset = () => {
    onResetFilters();
  };

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Refine your specialty search</SheetDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </SheetHeader>

      <ScrollArea className="flex-1 px-6 py-4">
        <div className="space-y-6">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="is_active">Status</Label>
            <Select
              value={
                localFilters.is_active === undefined
                  ? 'all'
                  : localFilters.is_active
                  ? 'active'
                  : 'inactive'
              }
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  is_active: value === 'all' ? undefined : value === 'active',
                })
              }
            >
              <SelectTrigger id="is_active">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="ordering">Sort By</Label>
            <Select
              value={localFilters.ordering || 'default'}
              onValueChange={(value) =>
                setLocalFilters({ 
                  ...localFilters, 
                  ordering: value === 'default' ? undefined : value 
                })
              }
            >
              <SelectTrigger id="ordering">
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="-name">Name (Z-A)</SelectItem>
                <SelectItem value="code">Code (A-Z)</SelectItem>
                <SelectItem value="-code">Code (Z-A)</SelectItem>
                <SelectItem value="-doctors_count">Most Doctors</SelectItem>
                <SelectItem value="doctors_count">Least Doctors</SelectItem>
                <SelectItem value="-created_at">Newest First</SelectItem>
                <SelectItem value="created_at">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Search by Department */}
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              placeholder="Filter by department..."
              value={(localFilters as any).department || ''}
              onChange={(e) =>
                setLocalFilters({ 
                  ...localFilters, 
                  department: e.target.value || undefined 
                } as SpecialtyListParams)
              }
            />
            <p className="text-xs text-muted-foreground">
              Search for specialties in a specific department
            </p>
          </div>
        </div>
      </ScrollArea>

      <SheetFooter className="px-6 py-4 border-t bg-background">
        <div className="flex gap-2 w-full">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Reset
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
        </div>
      </SheetFooter>
    </div>
  );
}
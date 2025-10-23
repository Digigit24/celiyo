// src/components/DoctorFiltersDrawer.tsx
import { useState, useEffect } from 'react';
import type { DoctorListParams } from '@/types/doctor.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';
import { useSpecialties } from '@/hooks/useDoctors';

interface DoctorFiltersDrawerProps {
  filters: DoctorListParams;
  onApplyFilters: (filters: DoctorListParams) => void;
  onResetFilters: () => void;
  onClose: () => void;
}

export default function DoctorFiltersDrawer({
  filters,
  onApplyFilters,
  onResetFilters,
  onClose,
}: DoctorFiltersDrawerProps) {
  const [localFilters, setLocalFilters] = useState<DoctorListParams>(filters);
  const { specialties, isLoading: specialtiesLoading } = useSpecialties();

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
            <SheetDescription>Refine your doctor search</SheetDescription>
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
            <Label htmlFor="status">Status</Label>
            <Select
              value={localFilters.status || 'all'}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, status: value === 'all' ? undefined : value as 'active' | 'on_leave' | 'inactive' })
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Specialty Filter */}
          <div className="space-y-2">
            <Label htmlFor="specialty">Specialty</Label>
            <Select
              value={localFilters.specialty || 'all'}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, specialty: value === 'all' ? undefined : value })
              }
              disabled={specialtiesLoading}
            >
              <SelectTrigger id="specialty">
                <SelectValue placeholder={specialtiesLoading ? "Loading..." : "All Specialties"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={String(specialty.id)}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Availability Filter */}
          <div className="space-y-2">
            <Label htmlFor="available">Availability</Label>
            <Select
              value={
                localFilters.available === undefined
                  ? 'all'
                  : localFilters.available
                  ? 'true'
                  : 'false'
              }
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  available: value === 'all' ? undefined : value === 'true',
                })
              }
            >
              <SelectTrigger id="available">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Available</SelectItem>
                <SelectItem value="false">Not Available</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Minimum Rating */}
          <div className="space-y-2">
            <Label htmlFor="min_rating">Minimum Rating</Label>
            <Select
              value={localFilters.min_rating ? String(localFilters.min_rating) : 'all'}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  min_rating: value === 'all' ? undefined : parseFloat(value),
                })
              }
            >
              <SelectTrigger id="min_rating">
                <SelectValue placeholder="Any Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Rating</SelectItem>
                <SelectItem value="4.5">4.5+ ⭐</SelectItem>
                <SelectItem value="4.0">4.0+ ⭐</SelectItem>
                <SelectItem value="3.5">3.5+ ⭐</SelectItem>
                <SelectItem value="3.0">3.0+ ⭐</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Consultation Fee Range */}
          <div className="space-y-2">
            <Label>Consultation Fee Range (₹)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="min_fee" className="text-xs text-muted-foreground">
                  Min Fee
                </Label>
                <Input
                  id="min_fee"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={localFilters.min_fee || ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      min_fee: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="max_fee" className="text-xs text-muted-foreground">
                  Max Fee
                </Label>
                <Input
                  id="max_fee"
                  type="number"
                  placeholder="10000"
                  min="0"
                  value={localFilters.max_fee || ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      max_fee: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="ordering">Sort By</Label>
            <Select
              value={localFilters.ordering || 'default'}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, ordering: value === 'default' ? undefined : value })
              }
            >
              <SelectTrigger id="ordering">
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default (Newest First)</SelectItem>
                <SelectItem value="full_name">Name (A-Z)</SelectItem>
                <SelectItem value="-full_name">Name (Z-A)</SelectItem>
                <SelectItem value="-average_rating">Highest Rated</SelectItem>
                <SelectItem value="average_rating">Lowest Rated</SelectItem>
                <SelectItem value="consultation_fee">Fee (Low to High)</SelectItem>
                <SelectItem value="-consultation_fee">Fee (High to Low)</SelectItem>
                <SelectItem value="-years_of_experience">Most Experienced</SelectItem>
                <SelectItem value="years_of_experience">Least Experienced</SelectItem>
                <SelectItem value="-total_consultations">Most Consultations</SelectItem>
              </SelectContent>
            </Select>
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
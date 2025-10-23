import { useState, useEffect } from 'react';
import type { PatientListParams, PatientGender, PatientStatus, BloodGroup } from '@/types/patient.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';

interface PatientFiltersDrawerProps {
  filters: PatientListParams;
  onApplyFilters: (filters: PatientListParams) => void;
  onResetFilters: () => void;
  onClose: () => void;
}

export default function PatientFiltersDrawer({
  filters,
  onApplyFilters,
  onResetFilters,
  onClose,
}: PatientFiltersDrawerProps) {
  const [localFilters, setLocalFilters] = useState<PatientListParams>(filters);

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
            <SheetDescription>Refine your patient search</SheetDescription>
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
                setLocalFilters({ ...localFilters, status: value === 'all' ? undefined : value as PatientStatus })
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="deceased">Deceased</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Gender Filter */}
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={localFilters.gender || 'all'}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, gender: value === 'all' ? undefined : value as PatientGender })
              }
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="All Genders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Blood Group Filter */}
          <div className="space-y-2">
            <Label htmlFor="blood_group">Blood Group</Label>
            <Select
              value={localFilters.blood_group || 'all'}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, blood_group: value === 'all' ? undefined : value as BloodGroup })
              }
            >
              <SelectTrigger id="blood_group">
                <SelectValue placeholder="All Blood Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blood Groups</SelectItem>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Insurance Filter */}
          <div className="space-y-2">
            <Label htmlFor="insurance">Insurance Status</Label>
            <Select
              value={
                localFilters.has_insurance === undefined
                  ? 'all'
                  : localFilters.has_insurance
                  ? 'true'
                  : 'false'
              }
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  has_insurance: value === 'all' ? undefined : value === 'true',
                })
              }
            >
              <SelectTrigger id="insurance">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Has Insurance</SelectItem>
                <SelectItem value="false">No Insurance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Age Range */}
          <div className="space-y-2">
            <Label>Age Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="age_min" className="text-xs text-muted-foreground">
                  Min Age
                </Label>
                <Input
                  id="age_min"
                  type="number"
                  placeholder="0"
                  min="0"
                  max="150"
                  value={localFilters.age_min || ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      age_min: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="age_max" className="text-xs text-muted-foreground">
                  Max Age
                </Label>
                <Input
                  id="age_max"
                  type="number"
                  placeholder="150"
                  min="0"
                  max="150"
                  value={localFilters.age_max || ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      age_max: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Location Filters */}
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="Filter by city..."
              value={localFilters.city || ''}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, city: e.target.value || undefined })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              placeholder="Filter by state..."
              value={localFilters.state || ''}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, state: e.target.value || undefined })
              }
            />
          </div>

          <Separator />

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Registration Date Range</Label>
            <div className="grid grid-cols-1 gap-2">
              <div className="space-y-1">
                <Label htmlFor="date_from" className="text-xs text-muted-foreground">
                  From
                </Label>
                <Input
                  id="date_from"
                  type="date"
                  value={localFilters.date_from || ''}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, date_from: e.target.value || undefined })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="date_to" className="text-xs text-muted-foreground">
                  To
                </Label>
                <Input
                  id="date_to"
                  type="date"
                  value={localFilters.date_to || ''}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, date_to: e.target.value || undefined })
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
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="-registration_date">Newest First</SelectItem>
                <SelectItem value="registration_date">Oldest First</SelectItem>
                <SelectItem value="first_name">Name (A-Z)</SelectItem>
                <SelectItem value="-first_name">Name (Z-A)</SelectItem>
                <SelectItem value="age">Age (Low to High)</SelectItem>
                <SelectItem value="-age">Age (High to Low)</SelectItem>
                <SelectItem value="-last_visit_date">Recent Visit</SelectItem>
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
// src/components/AppointmentFiltersDrawer.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { X, Calendar } from 'lucide-react';
import type { AppointmentListParams, AppointmentStatus, AppointmentPriority } from '@/types/appointment.types';

interface AppointmentFiltersDrawerProps {
  filters: AppointmentListParams;
  onApplyFilters: (filters: AppointmentListParams) => void;
  onResetFilters: () => void;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked_in', label: 'Checked In' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' },
];

const PRIORITY_OPTIONS: { value: AppointmentPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export default function AppointmentFiltersDrawer({
  filters,
  onApplyFilters,
  onResetFilters,
  onClose,
}: AppointmentFiltersDrawerProps) {
  const [localFilters, setLocalFilters] = useState<AppointmentListParams>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleReset = () => {
    onResetFilters();
  };

  const updateFilter = <K extends keyof AppointmentListParams>(
    key: K,
    value: AppointmentListParams[K]
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
          <Select
            value={localFilters.status || 'all'}
            onValueChange={(value) =>
              updateFilter('status', value === 'all' ? undefined : (value as AppointmentStatus))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Priority Filter */}
        <div className="space-y-3">
          <Label>Priority</Label>
          <Select
            value={localFilters.priority || 'all'}
            onValueChange={(value) =>
              updateFilter('priority', value === 'all' ? undefined : (value as AppointmentPriority))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {PRIORITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Date Range Filters */}
        <div className="space-y-3">
          <Label>Date Range</Label>
          
          <div className="space-y-2">
            <Label htmlFor="date_from" className="text-xs text-muted-foreground">
              From Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="date_from"
                type="date"
                value={localFilters.date_from || ''}
                onChange={(e) => updateFilter('date_from', e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_to" className="text-xs text-muted-foreground">
              To Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="date_to"
                type="date"
                value={localFilters.date_to || ''}
                onChange={(e) => updateFilter('date_to', e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Doctor ID Filter */}
        <div className="space-y-3">
          <Label htmlFor="doctor_id">Doctor ID</Label>
          <Input
            id="doctor_id"
            type="number"
            placeholder="Filter by doctor ID"
            value={localFilters.doctor_id || ''}
            onChange={(e) =>
              updateFilter('doctor_id', e.target.value ? Number(e.target.value) : undefined)
            }
          />
        </div>

        <Separator />

        {/* Patient ID Filter */}
        <div className="space-y-3">
          <Label htmlFor="patient_id">Patient ID</Label>
          <Input
            id="patient_id"
            type="number"
            placeholder="Filter by patient ID"
            value={localFilters.patient_id || ''}
            onChange={(e) =>
              updateFilter('patient_id', e.target.value ? Number(e.target.value) : undefined)
            }
          />
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

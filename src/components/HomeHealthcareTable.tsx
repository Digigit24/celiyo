// src/components/HomeHealthcareTable.tsx

import * as React from 'react';
import { DataTable, DataTableColumn } from '@/components/DataTable';
import type { HomeHealthcareService } from '@/types/service.types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Clock, Stethoscope, MapPin, IndianRupee, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { deleteHomeHealthcareService } from '@/services/service.service';

// util: format a date or fallback
function formatDate(value?: string | null) {
  if (!value) return '-';
  try {
    return format(new Date(value), 'dd MMM yyyy');
  } catch {
    return '-';
  }
}

// util: format price
function formatPrice(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `₹${num.toFixed(2)}`;
}

// util: format duration
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// util: format distance
function formatDistance(km: string | number): string {
  const num = typeof km === 'string' ? parseFloat(km) : km;
  return `${num.toFixed(1)} km`;
}

export interface HomeHealthcareTableProps {
  services: HomeHealthcareService[];
  isLoading: boolean;
  onView: (service: HomeHealthcareService) => void;
  onEdit: (service: HomeHealthcareService) => void;
  onRefresh: () => void;
}

export default function HomeHealthcareTable({
  services,
  isLoading,
  onView,
  onEdit,
  onRefresh,
}: HomeHealthcareTableProps) {
  //
  // 1. Define table columns for DESKTOP view
  //
  const columns = React.useMemo<DataTableColumn<HomeHealthcareService>[]>(() => {
    return [
      {
        key: 'service',
        header: 'Service Details',
        cell: (service) => (
          <div>
            <div className="font-medium">{service.name}</div>
            <div className="text-xs text-muted-foreground">{service.code}</div>
            {service.category && (
              <div className="text-xs text-muted-foreground mt-0.5">
                {service.category.name}
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'type',
        header: 'Service Type',
        cell: (service) => (
          <div className="flex flex-col gap-1">
            <Badge variant="secondary" className="w-fit capitalize">
              {service.service_type.replace(/_/g, ' ')}
            </Badge>
            {service.duration_minutes > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(service.duration_minutes)}</span>
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'staff',
        header: 'Staff Required',
        cell: (service) => (
          <div className="flex items-center gap-1.5">
            <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
            <Badge variant="outline" className="capitalize">
              {service.staff_type_required}
            </Badge>
          </div>
        ),
      },
      {
        key: 'pricing',
        header: 'Pricing',
        cell: (service) => (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {service.discounted_price ? (
                <>
                  <span className="font-medium text-green-600">
                    {formatPrice(service.discounted_price)}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(service.base_price)}
                  </span>
                </>
              ) : (
                <span className="font-medium">{formatPrice(service.base_price)}</span>
              )}
            </div>
            {service.discounted_price && (
              <div className="text-xs text-green-600">
                Save {formatPrice(parseFloat(service.base_price) - parseFloat(service.discounted_price))}
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'details',
        header: 'Service Details',
        cell: (service) => (
          <div className="space-y-1 text-sm">
            {service.max_distance_km && parseFloat(service.max_distance_km) > 0 && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>Max: {formatDistance(service.max_distance_km)}</span>
              </div>
            )}
            {service.equipment_needed && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Wrench className="h-3.5 w-3.5" />
                <span className="text-xs truncate max-w-[150px]" title={service.equipment_needed}>
                  {service.equipment_needed}
                </span>
              </div>
            )}
            {!service.equipment_needed && (
              <span className="text-xs text-muted-foreground">No equipment</span>
            )}
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (service) => (
          <div className="flex flex-col gap-1.5">
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
          </div>
        ),
      },
    ];
  }, []);

  //
  // 2. Delete handler passed into DataTable
  //
  async function handleDelete(service: HomeHealthcareService) {
    await deleteHomeHealthcareService(service.id);
    toast.success('Home healthcare service deleted');
    onRefresh();
  }

  //
  // 3. Mobile card renderer
  //
  const renderMobileCard = React.useCallback(
    (service: HomeHealthcareService, actions: any) => {
      return (
        <div className="space-y-3 text-sm">
          {/* header row */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base">{service.name}</h3>
                {service.is_featured && (
                  <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">
                    Featured
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{service.code}</p>
              {service.category && (
                <p className="text-xs text-muted-foreground">{service.category.name}</p>
              )}
            </div>

            {/* quick view button (mobile) */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                actions.view && actions.view();
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* pricing */}
          <div className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
            {service.discounted_price ? (
              <>
                <span className="font-semibold text-green-600">
                  {formatPrice(service.discounted_price)}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(service.base_price)}
                </span>
              </>
            ) : (
              <span className="font-semibold">{formatPrice(service.base_price)}</span>
            )}
          </div>

          {/* tags row */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="capitalize">
              {service.service_type.replace(/_/g, ' ')}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {service.staff_type_required}
            </Badge>
            <Badge
              variant="secondary"
              className={
                service.is_active
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-gray-100 text-gray-800'
              }
            >
              {service.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* details */}
          <div className="space-y-2">
            {service.duration_minutes > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-sm">Duration: {formatDuration(service.duration_minutes)}</span>
              </div>
            )}

            {service.max_distance_km && parseFloat(service.max_distance_km) > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span className="text-sm">Max Distance: {formatDistance(service.max_distance_km)}</span>
              </div>
            )}

            {service.equipment_needed && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wrench className="h-3.5 w-3.5" />
                <span className="text-sm line-clamp-1">{service.equipment_needed}</span>
              </div>
            )}
          </div>

          {/* footer row */}
          <div className="flex items-center justify-between pt-2 border-t text-xs">
            <span className="text-muted-foreground">
              Added: {formatDate(service.created_at)}
            </span>

            {actions.edit && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.edit && actions.edit();
                }}
              >
                Edit
              </Button>
            )}
          </div>

          {actions.askDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive h-7 text-xs p-0"
              onClick={(e) => {
                e.stopPropagation();
                actions.askDelete && actions.askDelete();
              }}
            >
              Delete
            </Button>
          )}
        </div>
      );
    },
    []
  );

  //
  // 4. Render the shared DataTable
  //
  return (
    <DataTable
      rows={services}
      isLoading={isLoading}
      columns={columns}
      getRowId={(service: HomeHealthcareService) => service.id}
      getRowLabel={(service: HomeHealthcareService) => service.name}
      onView={onView}
      onEdit={onEdit}
      onDelete={handleDelete}
      renderMobileCard={renderMobileCard}
      emptyTitle="No home healthcare services found"
      emptySubtitle="Try adjusting your filters or add a new service"
    />
  );
}
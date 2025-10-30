// src/components/NursingPackageTable.tsx

import * as React from 'react';
import { DataTable, DataTableColumn } from '@/components/DataTable';
import type { NursingCarePackage } from '@/types/service.types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Clock, Users, Package, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { deleteNursingCarePackage } from '@/services/service.service';

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
function formatDuration(hours: number): string {
  if (hours < 1) return `${hours * 60}min`;
  if (hours === 1) return '1 hour';
  return `${hours} hours`;
}

export interface NursingPackageTableProps {
  packages: NursingCarePackage[];
  isLoading: boolean;
  onView: (pkg: NursingCarePackage) => void;
  onEdit: (pkg: NursingCarePackage) => void;
  onRefresh: () => void;
}

export default function NursingPackageTable({
  packages,
  isLoading,
  onView,
  onEdit,
  onRefresh,
}: NursingPackageTableProps) {
  //
  // 1. Define table columns for DESKTOP view
  //
  const columns = React.useMemo<DataTableColumn<NursingCarePackage>[]>(() => {
    return [
      {
        key: 'package',
        header: 'Package Details',
        cell: (pkg) => (
          <div>
            <div className="font-medium">{pkg.name}</div>
            <div className="text-xs text-muted-foreground">{pkg.code}</div>
            {pkg.category && (
              <div className="text-xs text-muted-foreground mt-0.5">
                {pkg.category.name}
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'type',
        header: 'Package Type',
        cell: (pkg) => (
          <div className="flex flex-col gap-1">
            <Badge variant="secondary" className="w-fit capitalize">
              {pkg.package_type.replace('_', ' ')}
            </Badge>
            {pkg.max_duration > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Max: {formatDuration(pkg.max_duration)}</span>
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'target',
        header: 'Target Group',
        cell: (pkg) => (
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <Badge variant="outline" className="capitalize">
              {pkg.target_group.replace('_', ' ')}
            </Badge>
          </div>
        ),
      },
      {
        key: 'pricing',
        header: 'Pricing',
        cell: (pkg) => (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {pkg.discounted_price ? (
                <>
                  <span className="font-medium text-green-600">
                    {formatPrice(pkg.discounted_price)}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(pkg.base_price)}
                  </span>
                </>
              ) : (
                <span className="font-medium">{formatPrice(pkg.base_price)}</span>
              )}
            </div>
            {pkg.discounted_price && (
              <div className="text-xs text-green-600">
                Save {formatPrice(parseFloat(pkg.base_price) - parseFloat(pkg.discounted_price))}
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'services',
        header: 'Included Services',
        cell: (pkg) => (
          <div className="text-sm">
            {pkg.included_services && pkg.included_services.length > 0 ? (
              <div className="flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{pkg.included_services.length} services</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">No services listed</span>
            )}
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (pkg) => (
          <div className="flex flex-col gap-1.5">
            <Badge
              variant="secondary"
              className={
                pkg.is_active
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
              }
            >
              {pkg.is_active ? 'Active' : 'Inactive'}
            </Badge>
            {pkg.is_featured && (
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
  async function handleDelete(pkg: NursingCarePackage) {
    await deleteNursingCarePackage(pkg.id);
    toast.success('Nursing package deleted');
    onRefresh();
  }

  //
  // 3. Mobile card renderer
  //
  const renderMobileCard = React.useCallback(
    (pkg: NursingCarePackage, actions: any) => {
      return (
        <div className="space-y-3 text-sm">
          {/* header row */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base">{pkg.name}</h3>
                {pkg.is_featured && (
                  <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">
                    Featured
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{pkg.code}</p>
              {pkg.category && (
                <p className="text-xs text-muted-foreground">{pkg.category.name}</p>
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
            {pkg.discounted_price ? (
              <>
                <span className="font-semibold text-green-600">
                  {formatPrice(pkg.discounted_price)}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(pkg.base_price)}
                </span>
              </>
            ) : (
              <span className="font-semibold">{formatPrice(pkg.base_price)}</span>
            )}
          </div>

          {/* tags row */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="capitalize">
              {pkg.package_type.replace('_', ' ')}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {pkg.target_group.replace('_', ' ')}
            </Badge>
            <Badge
              variant="secondary"
              className={
                pkg.is_active
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-gray-100 text-gray-800'
              }
            >
              {pkg.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* details */}
          {pkg.max_duration > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-sm">Max Duration: {formatDuration(pkg.max_duration)}</span>
            </div>
          )}

          {pkg.included_services && pkg.included_services.length > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-3.5 w-3.5" />
              <span className="text-sm">{pkg.included_services.length} services included</span>
            </div>
          )}

          {/* footer row */}
          <div className="flex items-center justify-between pt-2 border-t text-xs">
            <span className="text-muted-foreground">
              Added: {formatDate(pkg.created_at)}
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
      rows={packages}
      isLoading={isLoading}
      columns={columns}
      getRowId={(pkg: NursingCarePackage) => pkg.id}
      getRowLabel={(pkg: NursingCarePackage) => pkg.name}
      onView={onView}
      onEdit={onEdit}
      onDelete={handleDelete}
      renderMobileCard={renderMobileCard}
      emptyTitle="No nursing packages found"
      emptySubtitle="Try adjusting your filters or add a new package"
    />
  );
}
// src/components/DiagnosticTestTable.tsx

import * as React from 'react';
import { DataTable, DataTableColumn } from '@/components/DataTable';
import type { DiagnosticTest } from '@/types/service.types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Home, FileText, Clock, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { deleteDiagnosticTest } from '@/services/service.service';

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

export interface DiagnosticTestTableProps {
  tests: DiagnosticTest[];
  isLoading: boolean;
  onView: (test: DiagnosticTest) => void;
  onEdit: (test: DiagnosticTest) => void;
  onRefresh: () => void;
}

export default function DiagnosticTestTable({
  tests,
  isLoading,
  onView,
  onEdit,
  onRefresh,
}: DiagnosticTestTableProps) {
  //
  // 1. Define table columns for DESKTOP view
  //
  const columns = React.useMemo<DataTableColumn<DiagnosticTest>[]>(() => {
    return [
      {
        key: 'test',
        header: 'Test Details',
        cell: (test) => (
          <div>
            <div className="font-medium">{test.name}</div>
            <div className="text-xs text-muted-foreground">{test.code}</div>
            {test.category && (
              <div className="text-xs text-muted-foreground mt-0.5">
                {test.category.name}
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'sample',
        header: 'Sample Type',
        cell: (test) => (
          <div className="flex flex-col gap-1">
            <Badge variant="secondary" className="w-fit">
              {test.sample_type}
            </Badge>
            {test.is_home_collection && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Home className="h-3 w-3" />
                <span>Home Collection</span>
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'pricing',
        header: 'Pricing',
        cell: (test) => (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {test.discounted_price ? (
                <>
                  <span className="font-medium text-green-600">
                    {formatPrice(test.discounted_price)}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(test.base_price)}
                  </span>
                </>
              ) : (
                <span className="font-medium">{formatPrice(test.base_price)}</span>
              )}
            </div>
            {test.is_home_collection && test.home_collection_fee !== '0.00' && (
              <div className="text-xs text-muted-foreground">
                +{formatPrice(test.home_collection_fee)} home fee
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'turnaround',
        header: 'Turnaround',
        cell: (test) => (
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{test.typical_turnaround_time}h</span>
          </div>
        ),
      },
      {
        key: 'reporting',
        header: 'Reporting',
        cell: (test) => (
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <Badge variant="outline" className="capitalize">
              {test.reporting_type}
            </Badge>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (test) => (
          <div className="flex flex-col gap-1.5">
            <Badge
              variant="secondary"
              className={
                test.is_active
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
              }
            >
              {test.is_active ? 'Active' : 'Inactive'}
            </Badge>
            {test.is_featured && (
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
  async function handleDelete(test: DiagnosticTest) {
    await deleteDiagnosticTest(test.id);
    toast.success('Diagnostic test deleted');
    onRefresh();
  }

  //
  // 3. Mobile card renderer
  //
  const renderMobileCard = React.useCallback(
    (test: DiagnosticTest, actions: any) => {
      return (
        <div className="space-y-3 text-sm">
          {/* header row */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base">{test.name}</h3>
                {test.is_featured && (
                  <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">
                    Featured
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{test.code}</p>
              {test.category && (
                <p className="text-xs text-muted-foreground">{test.category.name}</p>
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
            {test.discounted_price ? (
              <>
                <span className="font-semibold text-green-600">
                  {formatPrice(test.discounted_price)}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(test.base_price)}
                </span>
              </>
            ) : (
              <span className="font-semibold">{formatPrice(test.base_price)}</span>
            )}
          </div>

          {/* tags row */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">{test.sample_type}</Badge>
            <Badge variant="outline" className="capitalize">
              {test.reporting_type}
            </Badge>
            {test.is_home_collection && (
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                Home Collection
              </Badge>
            )}
            <Badge
              variant="secondary"
              className={
                test.is_active
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-gray-100 text-gray-800'
              }
            >
              {test.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* turnaround time */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-sm">
              Turnaround: {test.typical_turnaround_time} hours
            </span>
          </div>

          {/* footer row */}
          <div className="flex items-center justify-between pt-2 border-t text-xs">
            <span className="text-muted-foreground">
              Added: {formatDate(test.created_at)}
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
      rows={tests}
      isLoading={isLoading}
      columns={columns}
      getRowId={(test: DiagnosticTest) => test.id}
      getRowLabel={(test: DiagnosticTest) => test.name}
      onView={onView}
      onEdit={onEdit}
      onDelete={handleDelete}
      renderMobileCard={renderMobileCard}
      emptyTitle="No diagnostic tests found"
      emptySubtitle="Try adjusting your filters or add a new test"
    />
  );
}
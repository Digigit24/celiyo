// src/components/PatientTable.tsx

import * as React from 'react';
import { DataTable, DataTableColumn } from '@/components/DataTable';
import type { PatientProfile } from '@/types/patient.types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { deletePatient } from '@/services/patient.service';

// util: format a date or fallback
function formatDate(value?: string | null) {
  if (!value) return '-';
  try {
    return format(new Date(value), 'dd MMM yyyy');
  } catch {
    return '-';
  }
}

export interface PatientTableProps {
  patients: PatientProfile[];
  isLoading: boolean;
  onView: (p: PatientProfile) => void;
  onEdit: (p: PatientProfile) => void;
  onRefresh: () => void;
}

export default function PatientTable({
  patients,
  isLoading,
  onView,
  onEdit,
  onRefresh,
}: PatientTableProps) {
  //
  // 1. Define table columns for DESKTOP view
  //
  const columns = React.useMemo<DataTableColumn<PatientProfile>[]>(() => {
    return [
      {
        key: 'patient',
        header: 'Patient',
        cell: (p) => (
          <div>
            <div className="font-medium">{p.full_name}</div>
            <div className="text-xs text-muted-foreground">{p.patient_id}</div>
          </div>
        ),
      },
      {
        key: 'contact',
        header: 'Contact',
        cell: (p) => (
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span>{p.mobile_primary}</span>
            </div>

            {p.email && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate max-w-[150px]">{p.email}</span>
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'details',
        header: 'Details',
        cell: (p) => (
          <div className="flex flex-wrap gap-1.5">
            {/* gender */}
            <Badge variant="secondary">{p.gender}</Badge>

            {/* age */}
            <Badge variant="outline">{p.age}y</Badge>

            {/* blood group */}
            {p.blood_group && (
              <Badge variant="outline" className="text-rose-600 border-rose-200">
                {p.blood_group}
              </Badge>
            )}

            {/* insurance */}
            {p.is_insurance_valid && (
              <Badge
                variant="outline"
                className="text-emerald-600 border-emerald-200"
              >
                Insured
              </Badge>
            )}
          </div>
        ),
      },
      {
        key: 'location',
        header: 'Location',
        cell: (p) =>
          p.city ? (
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <MapPin className="h-3 w-3" />
              <span>{p.city}</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          ),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (p) => (
          <Badge
            variant="secondary"
            className={
              p.status === 'active'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
            }
          >
            {p.status}
          </Badge>
        ),
      },
      {
        key: 'visits',
        header: 'Visits',
        cell: (p) => (
          <div className="text-sm">
            <div className="font-medium">{p.total_visits} visits</div>
            <div className="text-xs text-muted-foreground">
              {p.last_visit_date
                ? formatDate(p.last_visit_date)
                : 'No visits yet'}
            </div>
          </div>
        ),
      },
    ];
  }, []);

  //
  // 2. Delete handler passed into DataTable
  //
  async function handleDelete(patient: PatientProfile) {
    await deletePatient(patient.id);
    toast.success('Patient deleted');
    onRefresh();
  }

  //
  // 3. Mobile card renderer
  //
  const renderMobileCard = React.useCallback(
    (p: PatientProfile, actions: any) => {
      return (
        <div className="space-y-3 text-sm">
          {/* header row */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base">{p.full_name}</h3>
                <Badge variant="secondary">{p.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{p.patient_id}</p>
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

          {/* tags row */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">{p.gender}</Badge>
            <Badge variant="outline">{p.age}y</Badge>

            {p.blood_group && (
              <Badge variant="outline" className="text-rose-600 border-rose-200">
                {p.blood_group}
              </Badge>
            )}

            {p.is_insurance_valid && (
              <Badge
                variant="outline"
                className="text-emerald-600 border-emerald-200"
              >
                Insured
              </Badge>
            )}
          </div>

          {/* contact */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            <span>{p.mobile_primary}</span>
          </div>

          {p.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">{p.email}</span>
            </div>
          )}

          {p.city && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{p.city}</span>
            </div>
          )}

          {/* footer row */}
          <div className="flex items-center justify-between pt-2 border-t text-xs">
            <span className="text-muted-foreground">
              Registered:{' '}
              {p.registration_date
                ? formatDate(p.registration_date)
                : '-'}
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
      rows={patients}
      isLoading={isLoading}
      columns={columns}
      getRowId={(p: PatientProfile) => p.id}
      getRowLabel={(p: PatientProfile) => p.full_name}
      onView={onView}
      onEdit={onEdit}
      onDelete={handleDelete}
      renderMobileCard={renderMobileCard}
      emptyTitle="No patients found"
      emptySubtitle="Try adjusting your filters or search criteria"
    />
  );
}

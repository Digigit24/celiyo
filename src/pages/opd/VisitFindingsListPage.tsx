// src/pages/opd/VisitFindingsListPage.tsx

import { useState, useMemo, useCallback } from 'react';
import { useVisitFindings } from '@/hooks/useOPD';
import type { VisitFindingListParams, FindingType } from '@/types/opd.types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import {
  RefreshCcw,
  Plus,
  Stethoscope,
  FlaskConical,
  CalendarDays,
  FileText,
  User,
  Hash,
  Eye,
} from 'lucide-react';

// global shared table (same one PatientsTable uses)
import { DataTable, DataTableColumn } from '@/components/DataTable';

// ----------------------------------------------------
// helpers (similar idea to how PatientTable formats its cells)
// ----------------------------------------------------

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getPatientName(f: any) {
  if (f.patient_name) return f.patient_name;
  if (f.patient?.full_name) return f.patient.full_name;
  const first = f.patient?.first_name || '';
  const last = f.patient?.last_name || '';
  const full = `${first} ${last}`.trim();
  return full || '—';
}

function getVisitId(f: any) {
  if (typeof f.visit === 'number') return f.visit;
  if (f.visit_id) return f.visit_id;
  if (f.visit?.id) return f.visit.id;
  return '—';
}

function FindingTypeBadge({ finding_type }: { finding_type?: FindingType | string }) {
  if (!finding_type) {
    return (
      <Badge variant="outline" className="text-[10px] font-medium">
        -
      </Badge>
    );
  }

  if (finding_type === 'examination') {
    return (
      <Badge
        variant="outline"
        className="flex items-center gap-1 text-[10px] font-medium text-purple-700 border-purple-300 bg-purple-50"
      >
        <Stethoscope className="h-3 w-3" />
        Exam
      </Badge>
    );
  }

  if (finding_type === 'investigation') {
    return (
      <Badge
        variant="outline"
        className="flex items-center gap-1 text-[10px] font-medium text-indigo-700 border-indigo-300 bg-indigo-50"
      >
        <FlaskConical className="h-3 w-3" />
        Investigation
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="flex items-center gap-1 text-[10px] font-medium"
    >
      {String(finding_type)}
    </Badge>
  );
}

function getFindingMainText(f: any) {
  if (f.description) return f.description;
  if (f.result_value) return f.result_value;
  if (f.notes) return f.notes;
  return '-';
}

function getFindingExtraText(f: any) {
  if (f.notes && f.notes !== f.description) return f.notes;
  if (f.result_value && f.result_value !== f.description) return f.result_value;
  return '';
}

// ----------------------------------------------------
// main page
// ----------------------------------------------------

export default function VisitFindingsListPage() {
  const [filters, setFilters] = useState<VisitFindingListParams>({
    page: 1,
    finding_type: undefined,
    search: '',
  });

  const {
    visitFindings,
    count,
    next,
    previous,
    isLoading,
    error,
    mutate,
  } = useVisitFindings(filters);

  const handleFilterChange = (key: keyof VisitFindingListParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
      page: 1,
    }));
  };

  const handleRefresh = () => {
    mutate();
  };

  // ---
  // row actions like PatientTable
  // ---

  const handleViewFinding = useCallback((finding: any) => {
    console.log('view finding', finding.id);
    // open drawer / navigate
  }, []);

  const handleEditFinding = useCallback((finding: any) => {
    console.log('edit finding', finding.id);
    // open edit drawer
  }, []);

  const handleDeleteFinding = useCallback(async (finding: any) => {
    console.log('delete finding', finding.id);
    // you'll call delete API here in future:
    // await deleteVisitFinding(finding.id)
    // mutate()
  }, []);

  // ---
  // Desktop table columns
  // This mirrors the style of PatientTable columns:
  // - left-aligned, multi-line cells
  // - small metadata under primary line
  // - badges for status/type/etc.
  // ---

  const columns = useMemo<DataTableColumn<any>[]>(() => {
    return [
      {
        key: 'patient',
        header: 'Patient',
        cell: (f) => (
          <div>
            <div className="font-medium text-slate-900 flex items-center gap-1 text-[13px]">
              <User className="h-3.5 w-3.5 text-slate-500" />
              <span>{getPatientName(f)}</span>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 leading-tight">
              <Hash className="h-3 w-3 text-slate-400" />
              <span>Visit {getVisitId(f)}</span>
            </div>
          </div>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        cell: (f) => (
          <div className="flex flex-wrap gap-1.5">
            <FindingTypeBadge finding_type={f.finding_type} />
          </div>
        ),
      },
      {
        key: 'finding',
        header: 'Finding / Notes',
        className: 'w-[320px]',
        cell: (f) => (
          <div className="text-sm leading-tight">
            <div className="font-medium text-slate-900 line-clamp-2">
              {getFindingMainText(f)}
            </div>
            {getFindingExtraText(f) ? (
              <div className="text-[11px] text-muted-foreground leading-tight line-clamp-2 mt-1">
                {getFindingExtraText(f)}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        key: 'recorded',
        header: 'Recorded On',
        cell: (f) => (
          <div className="text-xs text-muted-foreground flex flex-col">
            <div className="flex items-center gap-1 text-slate-700 text-sm leading-tight">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
              <span>{formatDate(f.finding_date)}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] leading-tight text-slate-500">
              <FileText className="h-3 w-3 text-slate-400" />
              <span>#{f.id}</span>
            </div>
          </div>
        ),
      },
    ];
  }, []);

  // ---
  // Mobile card renderer
  // This mirrors PatientTable's mobile card pattern:
  // header (name + badge + meta) + body info + footer actions
  // ---

  const renderMobileCard = useCallback(
    (f: any, actions: any) => {
      return (
        <div className="space-y-3 text-sm">
          {/* header row */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-semibold text-base leading-tight text-slate-900 flex items-center gap-1">
                  <User className="h-4 w-4 text-slate-500" />
                  <span>{getPatientName(f)}</span>
                </h3>

                <Badge
                  variant="outline"
                  className="text-[10px] font-normal flex items-center gap-1"
                >
                  <Hash className="h-3 w-3 text-slate-500" />
                  Visit {getVisitId(f)}
                </Badge>
              </div>

              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                <span>{formatDate(f.finding_date)}</span>
              </div>

              <div className="mt-2">
                <FindingTypeBadge finding_type={f.finding_type} />
              </div>
            </div>

            {/* quick view button (like PatientTable using Eye) */}
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

          {/* main finding data */}
          <div>
            <div className="text-sm font-medium leading-snug text-slate-900">
              {getFindingMainText(f)}
            </div>
            {getFindingExtraText(f) && (
              <div className="text-[11px] text-muted-foreground leading-snug mt-1 line-clamp-3">
                {getFindingExtraText(f)}
              </div>
            )}
          </div>

          {/* footer row with meta + edit/delete CTAs, same vibe as PatientTable */}
          <div className="flex items-center justify-between pt-2 border-t text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span>Finding #{f.id}</span>
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

  // ---
  // loading-before-data (kept same as you had)
  // ---
  if (isLoading && visitFindings.length === 0) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  // ---
  // error state (unchanged)
  // ---
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Error Loading Visit Findings</h2>
          <p>{(error as any)?.message || 'Failed to load visit findings'}</p>
          <Button onClick={handleRefresh} className="mt-4" variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // ---
  // main page layout with EXACT PatientTable-style table in the middle
  // ---

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Visit Findings</h1>
          <p className="text-muted-foreground mt-1">
            View and manage patient vital signs and examination findings
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Record Finding
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Findings</p>
          <p className="text-2xl font-bold">{count}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-600">Examinations</p>
          <p className="text-2xl font-bold text-purple-700">
            {visitFindings.filter(
              (f: any) => f.finding_type === 'examination'
            ).length}
          </p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-sm text-indigo-600">Investigations</p>
          <p className="text-2xl font-bold text-indigo-700">
            {visitFindings.filter(
              (f: any) => f.finding_type === 'investigation'
            ).length}
          </p>
        </div>
      </div>

      {/* Filters (unchanged) */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Patient name, visit number..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Finding Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="finding_type">Finding Type</Label>
            <Select
              value={filters.finding_type || 'all'}
              onValueChange={(value) =>
                handleFilterChange('finding_type', value)
              }
            >
              <SelectTrigger id="finding_type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="examination">Examination</SelectItem>
                <SelectItem value="investigation">Investigation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Finding Date Filter */}
          <div className="space-y-2">
            <Label htmlFor="finding_date">Finding Date</Label>
            <Input
              id="finding_date"
              type="date"
              value={filters.finding_date || ''}
              onChange={(e) =>
                handleFilterChange('finding_date', e.target.value)
              }
            />
          </div>

          {/* Visit ID Filter */}
          <div className="space-y-2">
            <Label htmlFor="visit">Visit ID</Label>
            <Input
              id="visit"
              type="number"
              placeholder="Filter by visit ID..."
              value={filters.visit || ''}
              onChange={(e) =>
                handleFilterChange(
                  'visit',
                  parseInt(e.target.value) || undefined
                )
              }
            />
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <strong>Total Findings:</strong> {count} |{' '}
          <strong>Current Page:</strong> {filters.page || 1}
        </div>
      </div>

      {/* TABLE AREA (EXACTLY LIKE PatientTable pattern) */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          Findings List
          <Badge variant="outline" className="text-[11px] font-normal">
            {visitFindings.length} shown / {count} total
          </Badge>
        </h2>

        <div className="w-full overflow-hidden">
          <DataTable
            rows={visitFindings}
            isLoading={isLoading && visitFindings.length === 0}
            columns={columns}
            getRowId={(f: any) => f.id}
            getRowLabel={(f: any) =>
              `Finding ${f.id} (${f.finding_type || '-'}) for ${getPatientName(
                f
              )}`
            }
            onView={handleViewFinding}
            onEdit={handleEditFinding}
            onDelete={handleDeleteFinding}
            renderMobileCard={renderMobileCard}
            emptyTitle="No findings found"
            emptySubtitle="Try changing filters or record a new finding"
          />
        </div>
      </div>

      {/* Pagination (unchanged) */}
      {(next || previous) && (
        <div className="flex items-center justify-between bg-white border rounded-lg p-4">
          <Button
            variant="outline"
            disabled={!previous}
            onClick={() =>
              handleFilterChange('page', (filters.page || 1) - 1)
            }
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {filters.page || 1}
          </span>
          <Button
            variant="outline"
            disabled={!next}
            onClick={() =>
              handleFilterChange('page', (filters.page || 1) + 1)
            }
          >
            Next
          </Button>
        </div>
      )}

      {/* Raw JSON debug (unchanged) */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          Visit Findings (Raw API Response)
        </h2>
        <div className="bg-gray-50 p-4 rounded overflow-auto max-h-[600px]">
          <pre className="text-xs">
            {JSON.stringify(
              {
                count,
                next,
                previous,
                results: visitFindings,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}

// src/pages/opd/VisitFindingsListPage.tsx

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useVisitFindings } from '@/hooks/useOPD';
import type { VisitFindingListParams, FindingType } from '@/types/opd.types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

import { DataTable, DataTableColumn } from '@/components/DataTable';

// --------------------------------------
// helpers
// --------------------------------------

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
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

function FindingTypeBadge({
  finding_type,
}: {
  finding_type?: FindingType | string;
}) {
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

// --------------------------------------
// page
// --------------------------------------

export default function VisitFindingsListPage() {
  // server filters
  const [filters, setFilters] = useState<VisitFindingListParams>({
    page: 1,
    finding_type: undefined,
    search: '',
    finding_date: undefined,
    visit: undefined,
  });

  // debounced search input
  const [searchText, setSearchText] = useState(filters.search || '');
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchText,
        page: 1,
      }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchText]);

  // data hook
  const {
    visitFindings,
    count,
    next,
    previous,
    isLoading,
    error,
    mutate,
  } = useVisitFindings(filters);

  // first successful load tracker
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  useEffect(() => {
    if (!isLoading && !error) {
      setHasLoadedOnce(true);
    }
  }, [isLoading, error]);

  // quick derived stats for summary cards
  const examCount = useMemo(
    () =>
      visitFindings.filter((f: any) => f.finding_type === 'examination')
        .length,
    [visitFindings]
  );

  const investigationCount = useMemo(
    () =>
      visitFindings.filter((f: any) => f.finding_type === 'investigation')
        .length,
    [visitFindings]
  );

  // filter setter + page reset
  const updateFilter = useCallback(
    (key: keyof VisitFindingListParams, value: any) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value === 'all' ? undefined : value,
        page: 1,
      }));
    },
    []
  );

  // pagination
  const goPrevPage = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      page: (prev.page || 1) - 1,
    }));
  }, []);

  const goNextPage = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      page: (prev.page || 1) + 1,
    }));
  }, []);

  // refresh
  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  // row actions
  const handleViewFinding = useCallback((finding: any) => {
    console.log('view finding', finding.id);
    // TODO open GlobalDrawer in view mode
  }, []);

  const handleEditFinding = useCallback((finding: any) => {
    console.log('edit finding', finding.id);
    // TODO open GlobalDrawer in edit mode
  }, []);

  const handleDeleteFinding = useCallback(async (finding: any) => {
    console.log('delete finding', finding.id);
    // TODO call deleteVisitFinding(finding.id); mutate();
  }, []);

  // columns for desktop table
  const columns = useMemo<DataTableColumn<any>[]>(() => {
    return [
      {
        key: 'patient',
        header: 'Patient',
        cell: (f) => (
          <div>
            <div className="font-medium text-slate-900 flex items-center gap-1 text-[13px] leading-tight">
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
          <div className="text-xs text-muted-foreground flex flex-col leading-tight">
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

  // mobile card layout
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

            {/* quick view */}
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

          {/* content */}
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

          {/* footer actions */}
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

  // ---------- skeleton before first data ----------

  if (!hasLoadedOnce && isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        {/* header skeleton */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="h-9 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border rounded-lg p-4 space-y-2 bg-white animate-pulse"
            >
              <div className="h-4 w-1/2 bg-gray-100 rounded" />
              <div className="h-6 w-1/3 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {/* table skeleton */}
        <div className="bg-white border rounded-lg p-6">
          <div className="h-5 w-44 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="h-32 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // ---------- error state ----------

  if (error) {
    return (
      <div className="p-4 md:p-8">
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

  // ---------- main layout ----------

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">
            Visit Findings
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            View and manage patient examination and investigation findings
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="min-w-[90px]"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" className="min-w-[90px]">
            <Plus className="mr-2 h-4 w-4" />
            Record Finding
          </Button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Findings</p>
          <p className="text-2xl font-bold">{count}</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-600">Examinations</p>
          <p className="text-2xl font-bold text-purple-700">{examCount}</p>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-sm text-indigo-600">Investigations</p>
          <p className="text-2xl font-bold text-indigo-700">
            {investigationCount}
          </p>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white border rounded-lg">
        {/* header / filters row */}
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start md:justify-between p-4 md:p-6 border-b">
          {/* left block: title + counts */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold leading-none">
                Findings List
              </h2>
              <Badge variant="outline" className="text-[11px] font-normal">
                {visitFindings.length} shown / {count} total
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Page {filters.page || 1}
            </p>
          </div>

          {/* right block: filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            {/* SEARCH (debounced via searchText) */}
            <div className="flex flex-col">
              <Input
                id="search"
                className="h-9 w-[220px] md:w-[200px] lg:w-[220px]"
                placeholder="Patient, visit, notes..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            {/* TYPE */}
            <div className="flex flex-col">
              <Select
                value={filters.finding_type || 'all'}
                onValueChange={(val) => updateFilter('finding_type', val)}
              >
                <SelectTrigger className="h-9 w-[140px] text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="examination">Examination</SelectItem>
                  <SelectItem value="investigation">Investigation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* DATE */}
            <div className="flex flex-col">
              <Input
                id="finding_date"
                type="date"
                className="h-9 w-[150px] text-xs"
                value={filters.finding_date || ''}
                onChange={(e) =>
                  updateFilter(
                    'finding_date',
                    e.target.value ? e.target.value : undefined
                  )
                }
              />
            </div>

            {/* VISIT ID */}
            <div className="flex flex-col">
              <Input
                id="visit"
                type="number"
                className="h-9 w-[120px] text-xs"
                placeholder="Visit #"
                value={filters.visit ?? ''}
                onChange={(e) => {
                  const parsed = parseInt(e.target.value);
                  updateFilter('visit', isNaN(parsed) ? undefined : parsed);
                }}
              />
            </div>

            {/* APPLY / REFRESH */}
            <div className="flex flex-col">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-[12px] font-normal"
                onClick={handleRefresh}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Apply
              </Button>
            </div>
          </div>
        </div>

        {/* TABLE BODY */}
        <div className="py-4 md:py-6">
          <DataTable
            rows={visitFindings}
            columns={columns}
            isLoading={isLoading && hasLoadedOnce}
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
            emptySubtitle="Try adjusting filters or record a new finding"
          />
        </div>

        {/* PAGINATION FOOTER */}
        {(next || previous) && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t px-4 py-4 md:px-6">
            <Button
              variant="outline"
              disabled={!previous}
              onClick={goPrevPage}
              className="sm:min-w-[100px]"
              size="sm"
            >
              Previous
            </Button>

            <span className="text-sm text-muted-foreground text-center">
              Page {filters.page || 1}
            </span>

            <Button
              variant="outline"
              disabled={!next}
              onClick={goNextPage}
              className="sm:min-w-[100px]"
              size="sm"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

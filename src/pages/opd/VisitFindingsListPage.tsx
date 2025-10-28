// src/pages/opd/VisitFindingsListPage.tsx

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useVisitFindings } from '@/hooks/useOPD';
import type { FindingListParams, FindingType, Finding } from '@/types/opd.types';

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
  Activity,
  ClipboardList,
  Brain,
  Eye,
  CalendarDays,
  FileText,
  User,
  Hash,
  AlertTriangle,
} from 'lucide-react';

import { DataTable, DataTableColumn } from '@/components/DataTable';
import OPDFindingsDrawer from '@/components/opd/findings-drawer/OPDFindingsDrawer';
import { deleteFinding } from '@/services/opd/findings.service';

// ==================== HELPER FUNCTIONS ====================

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Backend might still be enriching result with patient info
// Keep fallback so UI doesn't break if it's missing
function getPatientName(f: any) {
  if (f.patient_name) return f.patient_name;
  if (f.patient?.full_name) return f.patient.full_name;
  const first = f.patient?.first_name || '';
  const last = f.patient?.last_name || '';
  const full = `${first} ${last}`.trim();
  return full || '—';
}

function getVisitId(f: any) {
  if (typeof f.visit_id === 'number') return f.visit_id;
  if (typeof f.visit === 'number') return f.visit;
  if (f.visit?.id) return f.visit.id;
  return '—';
}

// This badge reflects new finding_type values
function FindingTypeBadge({ finding_type }: { finding_type?: FindingType | string }) {
  if (!finding_type) {
    return (
      <Badge variant="outline" className="text-[10px] font-medium">
        -
      </Badge>
    );
  }

  switch (finding_type) {
    case 'vital_signs':
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 text-[10px] font-medium text-red-700 border-red-300 bg-red-50"
        >
          <Activity className="h-3 w-3" />
          Vitals
        </Badge>
      );

    case 'physical_examination':
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 text-[10px] font-medium text-purple-700 border-purple-300 bg-purple-50"
        >
          <Stethoscope className="h-3 w-3" />
          Physical Exam
        </Badge>
      );

    case 'symptoms':
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 text-[10px] font-medium text-amber-700 border-amber-300 bg-amber-50"
        >
          <AlertTriangle className="h-3 w-3" />
          Symptoms
        </Badge>
      );

    case 'general_observation':
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 text-[10px] font-medium text-sky-700 border-sky-300 bg-sky-50"
        >
          <ClipboardList className="h-3 w-3" />
          Observation
        </Badge>
      );

    case 'system_examination':
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 text-[10px] font-medium text-indigo-700 border-indigo-300 bg-indigo-50"
        >
          <Brain className="h-3 w-3" />
          System Exam
        </Badge>
      );

    default:
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 text-[10px] font-medium"
        >
          {String(finding_type)}
        </Badge>
      );
  }
}

// Try to show something meaningful in the "Finding / Notes" column
// Priority:
// 1. findings_notes
// 2. abnormalities
// 3. synthesized vitals summary (BP / Temp / Pulse...)
// if nothing, "-"
function getFindingMainText(f: Finding | any) {
  if (f.findings_notes) return f.findings_notes;
  if (f.abnormalities) return f.abnormalities;

  const bpSys = f.blood_pressure_systolic || '';
  const bpDia = f.blood_pressure_diastolic || '';
  const pulse = f.pulse_rate || '';
  const temp = f.temperature || '';
  const spo2 = f.oxygen_saturation || '';
  const rr = f.respiratory_rate || '';

  const parts: string[] = [];

  if (bpSys || bpDia) {
    parts.push(`BP ${bpSys}/${bpDia}`);
  }
  if (pulse) {
    parts.push(`Pulse ${pulse}`);
  }
  if (temp) {
    parts.push(`Temp ${temp}`);
  }
  if (spo2) {
    parts.push(`SpO₂ ${spo2}`);
  }
  if (rr) {
    parts.push(`RR ${rr}`);
  }

  if (parts.length > 0) {
    return parts.join(' • ');
  }

  return '-';
}

// Optional "extra" line if we have both notes + abnormalities
function getFindingExtraText(f: Finding | any) {
  if (f.findings_notes && f.abnormalities && f.abnormalities !== f.findings_notes) {
    return f.abnormalities;
  }
  return '';
}

// ==================== PAGE COMPONENT ====================

export default function VisitFindingsListPage() {
  // ==================== STATE ====================
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  // Server filters
  const [filters, setFilters] = useState<FindingListParams>({
    page: 1,
    finding_type: undefined,
    search: '',
    recorded_at: undefined,
    visit_id: undefined,
  });

  // Debounced search input
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

  // Data hook
  const {
    visitFindings,
    count,
    next,
    previous,
    isLoading,
    error,
    mutate,
  } = useVisitFindings(filters);

  // First successful load tracker
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  useEffect(() => {
    if (!isLoading && !error) {
      setHasLoadedOnce(true);
    }
  }, [isLoading, error]);

  // ==================== DERIVED STATS ====================
  
  const vitalCount = useMemo(
    () =>
      visitFindings.filter((f: any) => f.finding_type === 'vital_signs')
        .length,
    [visitFindings]
  );

  const physicalExamCount = useMemo(
    () =>
      visitFindings.filter(
        (f: any) => f.finding_type === 'physical_examination'
      ).length,
    [visitFindings]
  );

  const abnormalCount = useMemo(
    () =>
      visitFindings.filter((f: any) => {
        // Check for specific flags or conditions
        // For now, count findings with abnormalities text
        return f.abnormalities && f.abnormalities.trim() !== '';
      }).length,
    [visitFindings]
  );

  // ==================== HANDLERS ====================

  // Drawer handlers
  const handleOpenCreateDrawer = useCallback(() => {
    setSelectedFinding(null);
    setIsDrawerOpen(true);
  }, []);

  const handleFindingSuccess = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedFinding(null);
    mutate(); // Refresh the list
  }, [mutate]);

  // Filter update helper
  const updateFilter = useCallback(
    (key: keyof FindingListParams, value: any) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value === 'all' ? undefined : value,
        page: 1,
      }));
    },
    []
  );

  // Table action handlers
  const handleViewFinding = useCallback((finding: Finding) => {
    setSelectedFinding(finding);
    setIsDrawerOpen(true);
  }, []);

  const handleEditFinding = useCallback((finding: Finding) => {
    setSelectedFinding(finding);
    setIsDrawerOpen(true);
  }, []);

  // Delete handler for table rows (with confirmation)
  const handleDeleteFinding = useCallback(
    async (finding: Finding) => {
      if (
        !window.confirm(
          `Are you sure you want to delete this finding for ${getPatientName(finding)}?`
        )
      ) {
        return;
      }

      try {
        await deleteFinding(finding.id);
        mutate();
      } catch (err) {
        console.error('Failed to delete finding:', err);
        alert('Failed to delete finding. Please try again.');
      }
    },
    [mutate]
  );

  // Delete handler for drawer (receives only the ID, no confirmation needed as drawer handles it)
  const handleDeleteFromDrawer = useCallback(
    async (id: number) => {
      try {
        await deleteFinding(id);
        setIsDrawerOpen(false);
        setSelectedFinding(null);
        mutate();
      } catch (err) {
        console.error('Failed to delete finding:', err);
        throw err; // Re-throw so drawer can handle the error
      }
    },
    [mutate]
  );

  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  // Pagination handlers
  const goNextPage = useCallback(() => {
    if (next) {
      setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }));
    }
  }, [next]);

  const goPrevPage = useCallback(() => {
    if (previous) {
      setFilters((prev) => ({ ...prev, page: Math.max((prev.page || 1) - 1, 1) }));
    }
  }, [previous]);

  // ==================== TABLE CONFIGURATION ====================

  // Column definitions
  const columns: DataTableColumn<Finding>[] = useMemo(
    () => [
      {
        key: 'id',
        header: 'ID',
        width: '60px',
        cell: (f: Finding) => (
          <span className="text-xs font-mono text-muted-foreground">
            #{f.id}
          </span>
        ),
      },
      {
        key: 'finding_type',
        header: 'Type',
        width: '140px',
        cell: (f: Finding) => <FindingTypeBadge finding_type={f.finding_type} />,
      },
      {
        key: 'patient',
        header: 'Patient',
        width: '160px',
        cell: (f: any) => (
          <div className="text-sm font-medium">{getPatientName(f)}</div>
        ),
      },
      {
        key: 'visit',
        header: 'Visit',
        width: '80px',
        cell: (f: any) => (
          <span className="text-xs font-mono">#{getVisitId(f)}</span>
        ),
      },
      {
        key: 'findings',
        header: 'Finding / Notes',
        cell: (f: Finding) => {
          const mainText = getFindingMainText(f);
          const extraText = getFindingExtraText(f);
          return (
            <div className="space-y-1">
              <div className="text-sm line-clamp-2">{mainText}</div>
              {extraText && (
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {extraText}
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: 'recorded_at',
        header: 'Recorded',
        width: '120px',
        cell: (f: Finding) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(f.recorded_at)}
          </span>
        ),
      },
    ],
    []
  );

  // Mobile card renderer
  const renderMobileCard = useCallback((f: Finding) => {
    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">
              {getPatientName(f)}
            </div>
            <div className="text-xs text-muted-foreground">
              Visit #{getVisitId(f)} • {formatDate(f.recorded_at)}
            </div>
          </div>
          <FindingTypeBadge finding_type={f.finding_type} />
        </div>
        <div className="text-sm text-muted-foreground line-clamp-3">
          {getFindingMainText(f)}
        </div>
      </div>
    );
  }, []);

  // ==================== RENDER CONDITIONS ====================

  // Initial loading state
  if (isLoading && !hasLoadedOnce) {
    return (
      <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="h-9 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Cards skeleton */}
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

        {/* Table skeleton */}
        <div className="bg-white border rounded-lg p-6">
          <div className="h-5 w-44 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="h-32 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Error Loading Findings</h2>
          <p>{(error as any)?.message || 'Failed to load findings'}</p>
          <Button onClick={handleRefresh} className="mt-4" variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // ==================== MAIN LAYOUT ====================

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">
            Clinical Findings
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            View and manage vitals, system examinations, and observations
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
          <Button 
            size="sm" 
            className="min-w-[90px]"  
            onClick={handleOpenCreateDrawer}
          >
            <Plus className="mr-2 h-4 w-4" />
            Record Findings
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
          <p className="text-sm text-purple-600">Physical Exams</p>
          <p className="text-2xl font-bold text-purple-700">
            {physicalExamCount}
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">Abnormal Findings</p>
          <p className="text-2xl font-bold text-red-700">{abnormalCount}</p>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white border rounded-lg">
        {/* Header / Filters Row */}
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start md:justify-between p-4 md:p-6 border-b">
          {/* Left block: title + counts */}
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

          {/* Right block: filters */}
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
                onValueChange={(val) =>
                  updateFilter('finding_type', val)
                }
              >
                <SelectTrigger className="h-9 w-[170px] text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="vital_signs">Vital Signs</SelectItem>
                  <SelectItem value="physical_examination">
                    Physical Exam
                  </SelectItem>
                  <SelectItem value="symptoms">Symptoms</SelectItem>
                  <SelectItem value="general_observation">
                    Observation
                  </SelectItem>
                  <SelectItem value="system_examination">
                    System Exam
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* DATE */}
            <div className="flex flex-col">
              <Input
                id="recorded_at"
                type="date"
                className="h-9 w-[150px] text-xs"
                value={filters.recorded_at || ''}
                onChange={(e) =>
                  updateFilter(
                    'recorded_at',
                    e.target.value ? e.target.value : undefined
                  )
                }
              />
            </div>

            {/* VISIT ID */}
            <div className="flex flex-col">
              <Input
                id="visit_id"
                type="number"
                className="h-9 w-[120px] text-xs"
                placeholder="Visit #"
                value={filters.visit_id ?? ''}
                onChange={(e) => {
                  const parsed = parseInt(e.target.value);
                  updateFilter(
                    'visit_id',
                    isNaN(parsed) ? undefined : parsed
                  );
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

      {/* DRAWER COMPONENT */}
      <OPDFindingsDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        findingId={selectedFinding?.id}
        visitId={selectedFinding?.visit_id}
        mode={selectedFinding ? 'edit' : 'create'}
        onSuccess={handleFindingSuccess}
        onDelete={handleDeleteFromDrawer}
      />
    </div>
  );
}
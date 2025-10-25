// src/pages/opd/ClinicalNotesListPage.tsx

import { useState, useMemo, useCallback } from 'react';
import { useClinicalNotes } from '@/hooks/useOPD';
import type { ClinicalNoteListParams, ClinicalNote } from '@/types/opd.types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import {
  Filter,
  Plus,
  Search,
  X,
  ArrowLeft,
  RefreshCcw,
  ClipboardList,
  CalendarDays,
  FileText,
  Eye,
} from 'lucide-react';

import { useIsMobile } from '@/hooks/use-is-mobile';

// global reusable table
import { DataTable, DataTableColumn } from '@/components/DataTable';

// global drawer
import { SideDrawer } from '@/components/SideDrawer';

// drawer bodies
import ClinicalNotesFiltersDrawer from '@/components/ClinicalNotesFiltersDrawer';
import ClinicalNoteDrawerBody from '@/components/ClinicalNoteDrawerBody';

// ----------------------------------------
// helpers to read values from note safely
// ----------------------------------------

function getPatientName(note: ClinicalNote) {
  const n: any = note;
  if (n.patient_name) return n.patient_name;
  if (n.patient?.full_name) return n.patient.full_name;
  const first = n.patient?.first_name || '';
  const last = n.patient?.last_name || '';
  const full = `${first} ${last}`.trim();
  if (full) return full;
  return '-';
}

function getVisitId(note: ClinicalNote) {
  const n: any = note;
  if (n.visit_id) return n.visit_id;
  if (typeof n.visit === 'number') return n.visit;
  if (n.visit?.id) return n.visit.id;
  return '-';
}

function getNoteDate(note: ClinicalNote) {
  const n: any = note;
  return n.note_date || n.created_at || '-';
}

function getSummary(note: ClinicalNote) {
  const n: any = note;
  if (n.diagnosis) return n.diagnosis;
  if (n.summary) return n.summary;
  if (n.chief_complaint) return n.chief_complaint;
  if (n.notes) return n.notes;
  return '-';
}

function getFollowup(note: ClinicalNote) {
  const n: any = note;
  return n.next_followup_date || '-';
}

export default function ClinicalNotesListPage() {
  const isMobile = useIsMobile();

  // what the user is typing in the search input (uncommitted)
  const [searchQuery, setSearchQuery] = useState('');

  // actual API filter state (committed to hook)
  const [filters, setFilters] = useState<ClinicalNoteListParams>({
    page: 1,
    search: '',
    note_date: undefined,
    visit: undefined,
  });

  // filter drawer state
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // note drawer state (create / edit / view)
  const [noteDrawerOpen, setNoteDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>(
    'view'
  );
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);

  // fetch
  const {
    clinicalNotes,
    count,
    next,
    previous,
    isLoading,
    error,
    mutate,
  } = useClinicalNotes(filters);

  // stats
  const headerStats = useMemo(() => {
    const todayISO = new Date().toISOString().split('T')[0];
    let todayCount = 0;
    let followupCount = 0;

    for (const note of clinicalNotes) {
      const n: any = note;
      if (n.note_date === todayISO) {
        todayCount += 1;
      }
      if (n.next_followup_date) {
        followupCount += 1;
      }
    }

    return {
      todayCount,
      followupCount,
    };
  }, [clinicalNotes]);

  // search commit
  const handleSearchCommit = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchQuery,
      page: 1,
    }));
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchCommit();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilters((prev) => ({
      ...prev,
      search: '',
      page: 1,
    }));
  };

  // filters drawer open/close
  const handleOpenFilters = (open: boolean) => {
    setIsFiltersOpen(open);
  };

  // apply filters from drawer body
  const handleApplyFilters = (newFilters: ClinicalNoteListParams) => {
    setFilters({
      ...newFilters,
      page: 1,
      search: newFilters.search ?? filters.search ?? '',
    });
    setIsFiltersOpen(false);
  };

  // reset filters
  const handleResetFilters = () => {
    setFilters({
      page: 1,
      search: searchQuery || '',
      note_date: undefined,
      visit: undefined,
    });
    setIsFiltersOpen(false);
  };

  // pagination
  const handlePrevPage = () => {
    setFilters((prev) => ({
      ...prev,
      page: (prev.page || 1) - 1,
    }));
  };

  const handleNextPage = () => {
    setFilters((prev) => ({
      ...prev,
      page: (prev.page || 1) + 1,
    }));
  };

  // refresh
  const handleRefresh = () => {
    mutate();
  };

  // open note drawer
  const handleCreateNote = () => {
    setSelectedNoteId(null);
    setDrawerMode('create');
    setNoteDrawerOpen(true);
  };

  const handleEditNote = (note: ClinicalNote) => {
    setSelectedNoteId(note.id);
    setDrawerMode('edit');
    setNoteDrawerOpen(true);
  };

  const handleViewNote = (note: ClinicalNote) => {
    setSelectedNoteId(note.id);
    setDrawerMode('view');
    setNoteDrawerOpen(true);
  };

  // after save
  const handleDrawerSuccess = () => {
    mutate(); // refresh list after create/update
  };

  // ----------------------------------------
  // TABLE CONFIG FOR CLINICAL NOTES
  // ----------------------------------------

  // desktop columns
  const columns = useMemo<DataTableColumn<ClinicalNote>[]>(() => {
    return [
      {
        key: 'patient',
        header: 'Patient',
        cell: (note) => (
          <div className="leading-tight">
            <div className="font-medium">{getPatientName(note)}</div>
            <div className="text-[11px] text-muted-foreground">
              Note ID: {note.id}
            </div>
          </div>
        ),
      },
      {
        key: 'visit',
        header: 'Visit ID',
        cell: (note) => (
          <div className="text-sm leading-tight">{getVisitId(note)}</div>
        ),
      },
      {
        key: 'date',
        header: 'Note Date',
        cell: (note) => (
          <div className="text-sm leading-tight">{getNoteDate(note)}</div>
        ),
      },
      {
        key: 'summary',
        header: 'Summary / Diagnosis',
        className: 'w-[320px]',
        cell: (note) => (
          <div className="text-sm leading-tight">
            <div className="font-medium line-clamp-2">{getSummary(note)}</div>
            {(note as any).notes && (
              <div className="text-[11px] text-muted-foreground leading-tight line-clamp-2 mt-1">
                {(note as any).notes}
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'followup',
        header: 'Next Follow-up',
        cell: (note) => (
          <div className="text-sm leading-tight">{getFollowup(note)}</div>
        ),
      },
    ];
  }, []);

  // mobile card layout
  const renderMobileCard = useCallback(
    (note: ClinicalNote, actions: any) => {
      return (
        <div className="space-y-3 text-sm">
          {/* Header: patient + quick view */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base leading-tight">
                  {getPatientName(note)}
                </h3>

                <Badge
                  variant="outline"
                  className="text-[10px] font-normal flex items-center gap-1"
                >
                  <ClipboardList className="h-3 w-3" />
                  #{note.id}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                <span>{getNoteDate(note)}</span>
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>Visit {getVisitId(note)}</span>
              </div>
            </div>

            {/* View button */}
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

          {/* Summary */}
          <div>
            <div className="text-sm font-medium leading-snug">
              {getSummary(note)}
            </div>
            {(note as any).notes && (
              <div className="text-[11px] text-muted-foreground leading-snug mt-1 line-clamp-3">
                {(note as any).notes}
              </div>
            )}
          </div>

          {/* Follow-up */}
          <div className="flex items-center justify-between pt-2 border-t text-xs">
            <span className="text-muted-foreground">
              Next follow-up:{' '}
              <strong className="text-foreground">
                {getFollowup(note)}
              </strong>
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

  // delete note handler (optional)
  async function handleDeleteNote(note: ClinicalNote) {
    // TODO: call delete API for clinical note if you have it
    console.log('delete note', note.id);
    // mutate();
  }

  // --- Loading state (initial fetch) ---
  if (isLoading && clinicalNotes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading clinical notes...</p>
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Error Loading Clinical Notes
          </h3>
          <p className="text-sm text-destructive/80">
            {error.message || 'Failed to fetch clinical notes'}
          </p>
          <Button onClick={handleRefresh} variant="outline" className="mt-4">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // header + search + stats + table + pagination + drawers
  return (
    <>
      <div className="flex flex-col h-screen bg-background">
        {/* HEADER (sticky) */}
        <div className="border-b bg-background sticky top-0 z-10">
          {/* Top Row: title + actions */}
          <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Button variant="ghost" size="icon" className="md:hidden">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}

              <div>
                <h1 className="text-xl md:text-2xl font-semibold">
                  Clinical Notes
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {count} total notes • {headerStats.todayCount} today •{' '}
                  {headerStats.followupCount} with follow-up
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size={isMobile ? 'icon' : 'sm'}
              >
                <RefreshCcw className="h-4 w-4" />
                {!isMobile && <span className="ml-2">Refresh</span>}
              </Button>

              <Button
                onClick={handleCreateNote}
                size={isMobile ? 'sm' : 'default'}
              >
                <Plus className="h-4 w-4 mr-2" />
                {!isMobile && 'New Note'}
              </Button>
            </div>
          </div>

          {/* Search + Filters Row */}
          <div className="px-4 pb-3 md:px-6 md:pb-4">
            <div className="flex gap-2">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name, diagnosis, visit ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={handleClearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Filters Drawer Trigger */}
              <Button
                variant="outline"
                size={isMobile ? 'icon' : 'default'}
                onClick={() => setIsFiltersOpen(true)}
              >
                <Filter className="h-4 w-4" />
                {!isMobile && <span className="ml-2">Filters</span>}
              </Button>
            </div>

            {/* Active filter chips */}
            <div className="flex flex-wrap gap-2 mt-3 text-xs">
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-md font-medium bg-primary/10 text-primary">
                  Search: {filters.search}
                </span>
              )}

              {filters.note_date && (
                <span className="inline-flex items-center px-2 py-1 rounded-md font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  Date: {filters.note_date}
                </span>
              )}

              {typeof filters.visit !== 'undefined' &&
                filters.visit !== null && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400">
                    Visit ID: {filters.visit}
                  </span>
                )}
            </div>
          </div>
        </div>

        {/* TABLE BODY (scrollable area) */}
        <div className="flex-1 overflow-auto px-4 py-4 md:px-6 md:py-6">
          <DataTable
            rows={clinicalNotes}
            isLoading={isLoading}
            columns={columns}
            getRowId={(n: ClinicalNote) => n.id}
            getRowLabel={(n: ClinicalNote) =>
              `Note ${n.id} for ${getPatientName(n)}`
            }
            onView={handleViewNote}
            onEdit={handleEditNote}
            // remove if you don't want delete yet
            onDelete={handleDeleteNote}
            renderMobileCard={renderMobileCard}
            emptyTitle="No clinical notes found"
            emptySubtitle="Try clearing filters or create a new note"
          />
        </div>

        {/* PAGINATION FOOTER */}
        {(next || previous) && (
          <div className="border-t bg-background px-4 py-3 md:px-6 flex items-center justify-between">
            <Button
              variant="outline"
              disabled={!previous}
              onClick={handlePrevPage}
            >
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {filters.page || 1}
            </span>

            <Button
              variant="outline"
              disabled={!next}
              onClick={handleNextPage}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* FILTERS DRAWER (bottom on mobile / right on desktop) */}
      <SideDrawer
        open={isFiltersOpen}
        onOpenChange={(open) => {
          if (!open) {
            // when closing, just close
            setIsFiltersOpen(false);
          } else {
            setIsFiltersOpen(true);
          }
        }}
        title="Filters"
        subtitle="Refine clinical note search"
        mode="view"
        size={isMobile ? 'lg' : 'md'}
        // Let the footer be Apply / Reset / Close
        footerButtons={[
          {
            label: 'Reset',
            variant: 'outline',
            onClick: handleResetFilters,
          },
          {
            label: 'Apply',
            onClick: () => {
              // ClinicalNotesFiltersDrawer will update draftFilters via callbacks,
              // but the real apply happens here because we pass handlers down.
              // We just call handleApplyFilters using the local state inside that drawer.
              // We'll manage that via render-prop style below.
            },
            // we'll override this via render-prop child below,
            // so this placeholder won't actually render.
          },
        ]}
      >
        <ClinicalNotesFiltersDrawer
          initialFilters={filters}
          onApply={(newFilters) => handleApplyFilters(newFilters)}
          onReset={handleResetFilters}
          onClose={() => setIsFiltersOpen(false)}
        />
      </SideDrawer>

      {/* NOTE DRAWER (create / edit / view) */}
      <SideDrawer
        open={noteDrawerOpen}
        onOpenChange={(open) => {
          if (!open) {
            setNoteDrawerOpen(false);
            setSelectedNoteId(null);
            setDrawerMode('view');
          } else {
            setNoteDrawerOpen(true);
          }
        }}
        title={
          drawerMode === 'create'
            ? 'New Clinical Note'
            : drawerMode === 'edit'
            ? `Edit Clinical Note #${selectedNoteId ?? ''}`
            : `Clinical Note #${selectedNoteId ?? ''}`
        }
        subtitle={
          drawerMode === 'create'
            ? 'Add a new clinical note'
            : drawerMode === 'edit'
            ? 'Update this clinical note'
            : 'View details'
        }
        mode={drawerMode}
        size="xl"
        footerButtons={
          drawerMode === 'view'
            ? [
                {
                  label: 'Close',
                  variant: 'outline',
                  onClick: () => {
                    setNoteDrawerOpen(false);
                    setSelectedNoteId(null);
                    setDrawerMode('view');
                  },
                },
              ]
            : drawerMode === 'edit'
            ? [
                {
                  label: 'Cancel',
                  variant: 'outline',
                  onClick: () => {
                    setNoteDrawerOpen(false);
                    setSelectedNoteId(null);
                    setDrawerMode('view');
                  },
                },
                {
                  label: 'Save Changes',
                  onClick: () => {
                    // ClinicalNoteDrawerBody will actually save
                    // we can trigger save via ref or callback
                    // placeholder for now
                  },
                },
              ]
            : [
                // create
                {
                  label: 'Discard',
                  variant: 'outline',
                  onClick: () => {
                    setNoteDrawerOpen(false);
                    setSelectedNoteId(null);
                    setDrawerMode('view');
                  },
                },
                {
                  label: 'Create Note',
                  onClick: () => {
                    // same story: trigger create in body
                  },
                },
              ]
        }
      >
        <ClinicalNoteDrawerBody
          noteId={selectedNoteId}
          mode={drawerMode}
          onSuccess={() => {
            handleDrawerSuccess();
          }}
        />
      </SideDrawer>
    </>
  );
}

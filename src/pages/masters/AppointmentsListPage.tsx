// src/pages/appointments/AppointmentsListPage.tsx
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useAppointments } from '@/hooks/useAppointments';
import type { AppointmentListParams, AppointmentList } from '@/types/appointment.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Filter,
  Plus,
  Search,
  X,
  ArrowLeft,
  Calendar as CalendarIcon,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-is-mobile';
import AppointmentFiltersDrawer from '@/components/AppointmentFiltersDrawer';
import AppointmentTable from '@/components/AppointmentTable';
import AppointmentDrawer from '@/components/AppointmentDrawer';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import 'react-day-picker/dist/style.css';
import {
  format,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addMonths,
  startOfWeek,
  addDays,
} from 'date-fns';

// --- Small helpers -----------------------------------------------------------
function getApptDate(a: AppointmentList): Date {
  const anyA = a as any;
  const raw =
    anyA.start_time ||
    anyA.start_at ||
    anyA.scheduled_at ||
    anyA.datetime ||
    anyA.date ||
    anyA.appointment_date ||
    anyA.created_at;

  const d = raw ? new Date(raw) : new Date();
  return isNaN(d.getTime()) ? new Date() : d;
}

function dateKey(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

type CalendarCellAppt = {
  id: number;
  title: string;
  timeLabel?: string;
  full: AppointmentList;
};

function timeLabelFor(a: AppointmentList): string | undefined {
  const d = getApptDate(a);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

// Light theme color tokens for chips
type ColorTokens = { bg: string; text: string; ring: string };

function colorFor(a: AppointmentList): ColorTokens {
  const anyA = a as any;
  const s = (anyA.status || '').toString().toLowerCase();
  const p = (anyA.priority || '').toString().toLowerCase();

  if (p === 'high' || s === 'urgent' || s === 'in_progress') {
    return { bg: 'bg-red-100', text: 'text-red-800', ring: 'ring-red-200' };
  }
  if (s === 'completed' || s === 'done') {
    return { bg: 'bg-emerald-100', text: 'text-emerald-800', ring: 'ring-emerald-200' };
  }
  if (s === 'cancelled' || s === 'no_show') {
    return { bg: 'bg-zinc-100', text: 'text-zinc-700', ring: 'ring-zinc-200' };
  }
  if (s === 'rescheduled') {
    return { bg: 'bg-amber-100', text: 'text-amber-900', ring: 'ring-amber-200' };
  }
  return { bg: 'bg-blue-100', text: 'text-blue-800', ring: 'ring-blue-200' };
}

// --- Calendar Grid (custom day content) --------------------------------------
function MonthGrid({
  month,
  appointments,
  onOpenView,
  onOpenCreate,
}: {
  month: Date;
  appointments: AppointmentList[];
  onOpenView: (a: AppointmentList) => void;
  onOpenCreate: (d: Date) => void;
}) {
  // Group appointments by date
  const byDate = useMemo(() => {
    const map = new Map<string, CalendarCellAppt[]>();
    for (const a of appointments) {
      const d = getApptDate(a);
      const key = dateKey(d);
      const list = map.get(key) ?? [];
      list.push({
        id: (a as any).id as number,
        title:
          ((a as any).patient_name as string) ||
          ((a as any).title as string) ||
          ((a as any).patient?.name as string) ||
          'Appointment',
        timeLabel: timeLabelFor(a),
        full: a,
      });
      map.set(key, list);
    }
    // Sort by time
    for (const [k, list] of map) {
      list.sort((x, y) => getApptDate(x.full).getTime() - getApptDate(y.full).getTime());
      map.set(k, list);
    }
    return map;
  }, [appointments]);

  // Build weeks for current month
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const weeks: Date[][] = [];
  let cursor = gridStart;
  while (cursor <= monthEnd || weeks.length < 6) {
    const row: Date[] = [];
    for (let i = 0; i < 7; i++) {
      row.push(cursor);
      cursor = addDays(cursor, 1);
    }
    weeks.push(row);
    if (cursor > monthEnd && weeks.length >= 5) break;
  }

  return (
    <div className="grid grid-cols-7 gap-px rounded-md border bg-border">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((wd) => (
        <div key={wd} className="bg-muted/50 px-2 py-2 text-xs font-medium text-muted-foreground">
          {wd}
        </div>
      ))}

      {weeks.flat().map((day) => {
        const key = dateKey(day);
        const items = byDate.get(key) ?? [];
        const faded = !isSameMonth(day, month);

        return (
          <div
            key={key}
            onClick={() => onOpenCreate(day)} // << open create with this date
            className={cn(
              'min-h-[120px] bg-background p-2 align-top cursor-pointer',
              faded && 'bg-muted/20 text-muted-foreground'
            )}
          >
            <div className="mb-1 flex items-center justify-between">
              <span
                className={cn(
                  'text-xs font-medium',
                  isSameDay(day, new Date()) &&
                    'inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground'
                )}
                title={format(day, 'PPPP')}
              >
                {format(day, 'd')}
              </span>

              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px]"
                onClick={(e) => {
                  e.stopPropagation(); // prevent day click
                  onOpenCreate(day);
                }}
              >
                <Plus className="mr-1 h-3 w-3" /> Add
              </Button>
            </div>

            <div className="space-y-1">
              {items.length === 0 ? (
                <div className="text-[11px] text-muted-foreground/70">No appointments</div>
              ) : (
                items.slice(0, 4).map((it) => {
                  const c = colorFor(it.full);
                  return (
                    <button
                      key={it.id}
                      onClick={(e) => {
                        e.stopPropagation(); // prevent day click
                        onOpenView(it.full);
                      }}
                      className={cn(
                        'w-full truncate rounded-md px-2 py-1 text-left text-[11px] font-medium ring-1 hover:brightness-95',
                        c.bg,
                        c.text,
                        c.ring
                      )}
                      title={`${it.timeLabel ?? ''} ${it.title}`}
                    >
                      <span className="mr-1">{it.timeLabel ?? '--:--'}</span>
                      <span className="truncate">{it.title}</span>
                    </button>
                  );
                })
              )}
              {items.length > 4 && (
                <div className="text-[11px] text-muted-foreground">+{items.length - 4} more</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Main Page ----------------------------------------------------------------
export default function AppointmentsListPage() {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AppointmentListParams>({
    search: '',
    page: 1,
    page_size: 20,
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Appointment Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');

  // Prefill date for create mode
  const [prefillDate, setPrefillDate] = useState<Date | null>(null);

  const { appointments, count, loading: isLoading, error, fetchAppointments } = useAppointments();

  // calendar month state
  const [calendarMonth, setCalendarMonth] = useState<Date>(startOfMonth(new Date()));

  useEffect(() => {
    fetchAppointments(filters);
  }, [filters, fetchAppointments]);

  const handleSearch = () => setFilters({ ...filters, search: searchQuery, page: 1 });
  const handleKeyPress = (e: React.KeyboardEvent) => e.key === 'Enter' && handleSearch();
  const handleClearSearch = () => {
    setSearchQuery('');
    setFilters({ ...filters, search: '', page: 1 });
  };

  const handleApplyFilters = (newFilters: AppointmentListParams) => {
    setFilters(newFilters);
    setIsFiltersOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters: AppointmentListParams = {
      search: searchQuery,
      page: 1,
      page_size: 20,
    };
    setFilters(resetFilters);
    setIsFiltersOpen(false);
  };

  // Drawer actions
  const openCreateWithDate = useCallback((d?: Date) => {
    setSelectedAppointmentId(null);
    setDrawerMode('create');
    if (d) setPrefillDate(d);
    setDrawerOpen(true);
  }, []);

  const handleCreateAppointment = () => openCreateWithDate();

  const handleEditAppointment = (appointment: AppointmentList) => {
    setSelectedAppointmentId((appointment as any).id as number);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleViewAppointment = (appointment: AppointmentList) => {
    setSelectedAppointmentId((appointment as any).id as number);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleDrawerSuccess = () => {
    fetchAppointments(filters);
  };

  // Calendar controls
  const goPrevMonth = () => setCalendarMonth((m) => addMonths(m, -1));
  const goNextMonth = () => setCalendarMonth((m) => addMonths(m, 1));
  const goToday = () => setCalendarMonth(startOfMonth(new Date()));

  if (isLoading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Appointments</h3>
          <p className="text-sm text-destructive/80">{error || 'Failed to fetch appointments'}</p>
          <Button onClick={() => fetchAppointments(filters)} className="mt-4" variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button variant="ghost" size="icon" className="md:hidden">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-semibold">Appointments</h1>
              <p className="text-xs md:text-sm text-muted-foreground">{count} total appointments</p>
            </div>
          </div>

        <Button onClick={handleCreateAppointment} size={isMobile ? 'sm' : 'default'}>
            <Plus className="h-4 w-4 mr-2" />
            {!isMobile && 'New Appointment'}
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="px-4 pb-3 md:px-6 md:pb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by complaint, symptoms, patient name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
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
            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size={isMobile ? 'icon' : 'default'}>
                  <Filter className="h-4 w-4" />
                  {!isMobile && <span className="ml-2">Filters</span>}
                </Button>
              </SheetTrigger>
              <SheetContent
                side={isMobile ? 'bottom' : 'right'}
                className={isMobile ? 'h-[90vh]' : 'w-full sm:max-w-md'}
              >
                <AppointmentFiltersDrawer
                  filters={filters}
                  onApplyFilters={handleApplyFilters}
                  onResetFilters={handleResetFilters}
                  onClose={() => setIsFiltersOpen(false)}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filter Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.search && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Search: {filters.search}
              </Badge>
            )}
          </div>
        </div>

        {/* View Switch Tabs */}
        <div className="px-4 md:px-6 pb-2">
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full max-w-sm grid-cols-2">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" /> List
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" /> Calendar
              </TabsTrigger>
            </TabsList>

            {/* LIST VIEW */}
            <TabsContent value="list" className="mt-4">
              <div className="flex-1 overflow-auto">
                <AppointmentTable
                  appointments={appointments}
                  isLoading={isLoading}
                  onEdit={handleEditAppointment}
                  onView={handleViewAppointment}
                  onRefresh={() => fetchAppointments(filters)}
                />
              </div>
            </TabsContent>

            {/* CALENDAR VIEW */}
            <TabsContent value="calendar" className="mt-4">
              {/* Month header controls */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={goPrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="min-w-[160px] text-center text-sm font-medium">
                    {format(calendarMonth, 'MMMM yyyy')}
                  </div>
                  <Button variant="outline" size="icon" onClick={goNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="ghost" onClick={goToday}>
                  Today
                </Button>
              </div>

              {/* Calendar grid */}
              <MonthGrid
                month={calendarMonth}
                appointments={appointments}
                onOpenView={handleViewAppointment}
                onOpenCreate={(d) => openCreateWithDate(d)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Appointment Drawer */}
      <AppointmentDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setPrefillDate(null);
        }}
        appointmentId={selectedAppointmentId}
        mode={drawerMode}
        onSuccess={handleDrawerSuccess}
        prefillDate={prefillDate ?? undefined}
      />
    </div>
  );
}

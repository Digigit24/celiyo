// src/pages/opd/OpdVisitsListPage.tsx

import { useState, useMemo, useCallback } from 'react';
import {
  useVisits,
  useVisitStatistics,
  useTodayVisits,
  useQueue,
} from '@/hooks/useOPD';
import type { Visit, VisitListParams, VisitStatus } from '@/types/opd.types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import {
  RefreshCcw,
  Plus,
  Search,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  TrendingUp,
  AlertCircle,
  Stethoscope,
  CreditCard,
  Phone,
  MoreVertical,
} from 'lucide-react';

import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-is-mobile';

import VisitQueueBoard from '@/components/opd/VisitQueueBoard';
import VisitDetailDrawer from '@/components/opd/VisitDetailDrawer';
import VisitFormDrawer from '@/components/opd/VisitFormDrawer';

import { formatDistanceToNow } from 'date-fns';

// shared responsive table (desktop cols + mobile cards)
import { DataTable, DataTableColumn } from '@/components/DataTable';

// ----------------------------------------------------
// helper fns (pulled from VisitCard / normalized)
// ----------------------------------------------------

function getStatusConfig(status: VisitStatus) {
  const configs = {
    waiting: {
      color:
        'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
      icon: Clock,
      label: 'Waiting',
    },
    called: {
      color:
        'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800',
      icon: AlertCircle,
      label: 'Called',
    },
    in_consultation: {
      color:
        'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800',
      icon: Stethoscope,
      label: 'In Consultation',
    },
    completed: {
      color:
        'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
      icon: CheckCircle2,
      label: 'Completed',
    },
    cancelled: {
      color:
        'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
      icon: XCircle,
      label: 'Cancelled',
    },
    no_show: {
      color:
        'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800',
      icon: XCircle,
      label: 'No Show',
    },
  } as const;

  return configs[status] || configs.waiting;
}

function getPaymentStatusConfig(status: string | undefined) {
  const configs = {
    paid: {
      color:
        'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
      label: 'Paid',
    },
    partial: {
      color:
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400',
      label: 'Partial',
    },
    unpaid: {
      color:
        'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
      label: 'Unpaid',
    },
  } as const;

  return configs[(status || 'unpaid') as keyof typeof configs] || configs.unpaid;
}

function getVisitTypeConfig(type: string | undefined) {
  const configs = {
    new: {
      color:
        'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
      label: 'New',
    },
    follow_up: {
      color:
        'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
      label: 'Follow-up',
    },
    emergency: {
      color:
        'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
      label: 'Emergency',
    },
  } as const;

  return configs[type as keyof typeof configs] || configs.new;
}

function getWaitingTime(entry_time?: string | null) {
  if (!entry_time) return null;
  return formatDistanceToNow(new Date(entry_time), { addSuffix: true });
}

// safe access helpers
function getPatientName(v: Visit) {
  return (
    v.patient_details?.full_name ||
    v.patient_name ||
    'Unknown Patient'
  );
}

function getDisplayId(v: Visit) {
  return v.patient_details?.patient_id || v.patient_id || '—';
}

function getAgeGender(v: Visit) {
  if (!v.patient_details?.age) return null;
  return `${v.patient_details.age}y, ${v.patient_details.gender}`;
}

function getPhoneNumber(v: Visit) {
  return v.patient_details?.mobile || '';
}

// ----------------------------------------------------
// table columns (desktop)
// ----------------------------------------------------

function useVisitColumns() {
  return useMemo<DataTableColumn<Visit>[]>(() => {
    return [
      {
        key: 'patient',
        header: 'Patient',
        cell: (v) => {
          const statusInfo = getStatusConfig(v.status);
          const StatusIcon = statusInfo.icon;
          return (
            <div className="space-y-1">
              <div className="flex items-start gap-2">
                {/* avatar */}
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-medium text-slate-900 text-[13px]">
                      {getPatientName(v)}
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium flex items-center gap-1 border ${statusInfo.color}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <div className="text-[11px] text-muted-foreground flex flex-wrap gap-1 leading-tight">
                    <span className="font-mono">{v.visit_number}</span>
                    <span>•</span>
                    <span>{getDisplayId(v)}</span>
                    {getAgeGender(v) && (
                      <>
                        <span>•</span>
                        <span>{getAgeGender(v)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        },
      },

      {
        key: 'details',
        header: 'Details',
        className: 'min-w-[200px]',
        cell: (v) => {
          const waitStr = getWaitingTime(v.entry_time);
          return (
            <div className="text-sm leading-tight space-y-1">
              {(v.doctor_details || v.doctor_name) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Stethoscope className="h-3.5 w-3.5" />
                  <span className="text-[13px]">
                    Dr. {v.doctor_details?.full_name || v.doctor_name}
                  </span>
                </div>
              )}

              {waitStr && (
                <div className="flex items-center gap-2 text-muted-foreground text-[12px]">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{waitStr}</span>
                </div>
              )}

              {getPhoneNumber(v) && (
                <div className="flex items-center gap-2 text-muted-foreground text-[12px]">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{getPhoneNumber(v)}</span>
                </div>
              )}
            </div>
          );
        },
      },

      {
        key: 'badges',
        header: 'Tags',
        className: 'min-w-[150px]',
        cell: (v) => {
          const vt = getVisitTypeConfig(v.visit_type);
          const pay = getPaymentStatusConfig(v.payment_status);

          return (
            <div className="flex flex-wrap gap-2 text-[11px]">
              <Badge
                variant="outline"
                className={`border ${vt.color} text-[10px] font-medium`}
              >
                {vt.label}
              </Badge>

              <Badge
                variant="outline"
                className={`flex items-center gap-1 border ${pay.color} text-[10px] font-medium`}
              >
                <CreditCard className="h-3 w-3" />
                {pay.label}
              </Badge>

              {v.is_follow_up && (
                <Badge
                  variant="outline"
                  className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 text-[10px] font-medium"
                >
                  Follow-up
                </Badge>
              )}
            </div>
          );
        },
      },
    ];
  }, []);
}

// ----------------------------------------------------
// mobile card for DataTable
// ----------------------------------------------------

function useVisitMobileCard({
  onGoConsult,
  onGoBilling,
  onStatusChange,
}: {
  onGoConsult: (v: Visit) => void;
  onGoBilling: (v: Visit) => void;
  onStatusChange: (v: Visit, s: VisitStatus) => void;
}) {
  return useCallback(
    (v: Visit, actions: any) => {
      const statusInfo = getStatusConfig(v.status);
      const StatusIcon = statusInfo.icon;

      const pay = getPaymentStatusConfig(v.payment_status);
      const vt = getVisitTypeConfig(v.visit_type);
      const waitStr = getWaitingTime(v.entry_time);

      return (
        <div className="space-y-3 text-sm">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 mb-2">
                {/* Avatar */}
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>

                {/* Patient and status */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base truncate">
                      {getPatientName(v)}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium flex items-center gap-1 border ${statusInfo.color}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                    <span className="font-mono">{v.visit_number}</span>
                    <span>•</span>
                    <span>{getDisplayId(v)}</span>
                    {getAgeGender(v) && (
                      <>
                        <span>•</span>
                        <span>{getAgeGender(v)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Meta info */}
              <div className="space-y-1 text-[13px] text-muted-foreground">
                {(v.doctor_details || v.doctor_name) && (
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-3.5 w-3.5" />
                    <span>
                      Dr. {v.doctor_details?.full_name || v.doctor_name}
                    </span>
                  </div>
                )}

                {waitStr && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{waitStr}</span>
                  </div>
                )}

                {getPhoneNumber(v) && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{getPhoneNumber(v)}</span>
                  </div>
                )}
              </div>

              {/* badges row */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Badge
                  variant="outline"
                  className={`border ${vt.color} text-[10px] font-medium`}
                >
                  {vt.label}
                </Badge>
                <Badge
                  variant="outline"
                  className={`flex items-center gap-1 border ${pay.color} text-[10px] font-medium`}
                >
                  <CreditCard className="h-3 w-3" />
                  {pay.label}
                </Badge>
                {v.is_follow_up && (
                  <Badge
                    variant="outline"
                    className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 text-[10px] font-medium"
                  >
                    Follow-up
                  </Badge>
                )}
              </div>
            </div>

            {/* quick view (open drawer) */}
            <div className="flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.view && actions.view();
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Primary actions row */}
          <div className="flex flex-wrap gap-2 pt-2 border-t text-xs">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onGoConsult(v);
              }}
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              Start Consultation
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onGoBilling(v);
              }}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              OPD Billing
            </Button>
          </div>

          {/* Status quick actions (toast for now) */}
          <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs p-0"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(v, 'waiting');
              }}
            >
              Mark Waiting
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs p-0"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(v, 'in_consultation');
              }}
            >
              In Consultation
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs p-0 text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(v, 'cancelled');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      );
    },
    [onGoBilling, onGoConsult, onStatusChange]
  );
}

// ----------------------------------------------------
// main
// ----------------------------------------------------

export default function OpdVisitsListPage() {
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState<'queue' | 'today' | 'all'>('queue');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);

  // stats / queue / today / all
  const {
    statistics,
    isLoading: statsLoading,
    mutate: mutateStats,
  } = useVisitStatistics();

  const {
    todayVisits,
    count: todayCount,
    isLoading: todayLoading,
    mutate: mutateTodayVisits,
  } = useTodayVisits();

  const {
    waiting,
    called,
    inConsultation,
    isLoading: queueLoading,
    mutate: mutateQueue,
  } = useQueue();

  // All visits (basic list w/ just search)
  const [allVisitsFilters] = useState<VisitListParams>({
    page: 1,
    search: searchQuery,
  });
  const {
    visits: allVisits,
    isLoading: allVisitsLoading,
    mutate: mutateAllVisits,
  } = useVisits(allVisitsFilters);

  // refresh all blocks
  const handleRefreshAll = () => {
    mutateStats();
    mutateTodayVisits();
    mutateQueue();
    mutateAllVisits();
    toast.success('Data refreshed');
  };

  // open row detail drawer
  const openVisitDetails = (visit: Visit) => {
    setSelectedVisitId(visit.id);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedVisitId(null);
  };

  // after anything mutating (new visit, status change, etc)
  const handleVisitUpdateSuccess = () => {
    mutateStats();
    mutateQueue();
    mutateTodayVisits();
    mutateAllVisits();
  };

  // nav actions
  const goToConsultation = (visit: Visit) => {
    console.log('goToConsultation', visit.id);
    // navigate(`/consultation/${visit.id}`)
  };

  const goToBilling = (visit: Visit) => {
    console.log('goToBilling', visit.id);
    // navigate(`/opdbilling/${visit.id}`)
  };

  // status change (TODO: wire real API call here safely, not via hooks-in-callback)
  const changeVisitStatus = (visit: Visit, newStatus: VisitStatus) => {
    toast.message(`(TODO) Set visit ${visit.id} -> ${newStatus}`);
    // Here you’d call a plain service like updateVisitById(visit.id, { status: newStatus })
    // then handleVisitUpdateSuccess() on success
  };

  // apply search filter to today's list
  const filteredTodayVisits = useMemo(() => {
    if (!searchQuery.trim()) return todayVisits;
    const q = searchQuery.toLowerCase();
    return todayVisits.filter((v) => {
      return (
        getPatientName(v).toLowerCase().includes(q) ||
        (getDisplayId(v) || '').toLowerCase().includes(q) ||
        (v.visit_number || '').toLowerCase().includes(q)
      );
    });
  }, [todayVisits, searchQuery]);

  // table config
  const visitColumns = useVisitColumns();
  const visitMobileCard = useVisitMobileCard({
    onGoConsult: goToConsultation,
    onGoBilling: goToBilling,
    onStatusChange: changeVisitStatus,
  });

  // row action handlers consumed by DataTable
  const rowHandlers = {
    onView: (v: Visit) => openVisitDetails(v),
    onEdit: (v: Visit) => goToConsultation(v),
    onDelete: (v: Visit) => changeVisitStatus(v, 'cancelled'),
  };

  // first-load skeleton for stats
  if (statsLoading && !statistics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading OPD visits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Sticky header */}
      <div className="border-b bg-background sticky top-0 z-10">
        {/* title + actions */}
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">OPD Queue</h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Manage patient visits and consultations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefreshAll}
              variant="outline"
              size={isMobile ? 'sm' : 'default'}
            >
              <RefreshCcw className="h-4 w-4 md:mr-2" />
              {!isMobile && 'Refresh'}
            </Button>
            <Button
              size={isMobile ? 'sm' : 'default'}
              onClick={() => setFormDrawerOpen(true)}
            >
              <Plus className="h-4 w-4 md:mr-2" />
              {!isMobile && 'New Visit'}
            </Button>
          </div>
        </div>

        {/* stats cards */}
        {statistics && (
          <div className="px-4 pb-3 md:px-6 md:pb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Waiting
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {statistics.waiting}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500/20" />
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                      In Progress
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {statistics.in_consultation}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-yellow-500/20" />
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Completed
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-green-700 dark:text-green-300">
                      {statistics.completed}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500/20" />
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                      Total Today
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {todayCount}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-500/20" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* search bar */}
        <div className="px-4 pb-3 md:px-6 md:pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name, ID, or visit number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* main content tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="h-full flex flex-col"
        >
          <div className="border-b px-4 md:px-6">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="queue" className="flex-1 md:flex-initial">
                <Clock className="h-4 w-4 mr-2" />
                Queue View
              </TabsTrigger>
              <TabsTrigger value="today" className="flex-1 md:flex-initial">
                <Calendar className="h-4 w-4 mr-2" />
                Today ({todayCount})
              </TabsTrigger>
              <TabsTrigger value="all" className="flex-1 md:flex-initial">
                <TrendingUp className="h-4 w-4 mr-2" />
                All Visits
              </TabsTrigger>
            </TabsList>
          </div>

          {/* QUEUE VIEW stays as board */}
          <TabsContent value="queue" className="flex-1 overflow-auto m-0 p-0">
            <VisitQueueBoard
              waiting={waiting}
              called={called}
              inConsultation={inConsultation}
              isLoading={queueLoading}
              onVisitClick={openVisitDetails}
              onRefresh={mutateQueue}
            />
          </TabsContent>

          {/* TODAY TAB: TABLE VIEW */}
          <TabsContent value="today" className="flex-1 overflow-auto m-0 p-0">
            <div className="p-4 md:p-6 space-y-4">
              <div className="bg-white border rounded-lg p-4 md:p-6">
                {/* header above table */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-semibold leading-none">
                        Today&apos;s Visits
                      </h2>
                      <Badge
                        variant="outline"
                        className="text-[11px] font-normal"
                      >
                        {filteredTodayVisits.length} shown / {todayCount} total
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {todayLoading ? 'Loading...' : 'Live for today'}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => mutateTodayVisits()}
                    >
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setFormDrawerOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Visit
                    </Button>
                  </div>
                </div>

                {/* table for today's visits */}
                <DataTable
                  rows={filteredTodayVisits}
                  columns={visitColumns}
                  isLoading={todayLoading && filteredTodayVisits.length === 0}
                  getRowId={(v: Visit) => v.id}
                  getRowLabel={(v: Visit) =>
                    `${getPatientName(v)} (${v.visit_number})`
                  }
                  onView={rowHandlers.onView}
                  onEdit={rowHandlers.onEdit}
                  onDelete={rowHandlers.onDelete}
                  renderMobileCard={visitMobileCard}
                  emptyTitle="No visits found"
                  emptySubtitle={
                    searchQuery
                      ? 'Try adjusting your search criteria'
                      : 'No visits registered for today'
                  }
                />
              </div>
            </div>
          </TabsContent>

          {/* ALL TAB: TABLE VIEW */}
          <TabsContent value="all" className="flex-1 overflow-auto m-0 p-0">
            <div className="p-4 md:p-6 space-y-4">
              <div className="bg-white border rounded-lg p-4 md:p-6">
                {/* header above table */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-semibold leading-none">
                        All Visits
                      </h2>
                      <Badge
                        variant="outline"
                        className="text-[11px] font-normal"
                      >
                        {allVisits.length} shown
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recent OPD visit history
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => mutateAllVisits()}
                    >
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setFormDrawerOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Visit
                    </Button>
                  </div>
                </div>

                {/* table for all visits */}
                <DataTable
                  rows={allVisits}
                  columns={visitColumns}
                  isLoading={allVisitsLoading && allVisits.length === 0}
                  getRowId={(v: Visit) => v.id}
                  getRowLabel={(v: Visit) =>
                    `${getPatientName(v)} (${v.visit_number})`
                  }
                  onView={rowHandlers.onView}
                  onEdit={rowHandlers.onEdit}
                  onDelete={rowHandlers.onDelete}
                  renderMobileCard={visitMobileCard}
                  emptyTitle="No visits found"
                  emptySubtitle="Start by registering a new patient visit"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Visit Detail Drawer (view / actions) */}
      <VisitDetailDrawer
        visitId={selectedVisitId}
        open={drawerOpen}
        onOpenChange={handleDrawerClose}
        onSuccess={handleVisitUpdateSuccess}
      />

      {/* Visit Form Drawer (create new visit) */}
      <VisitFormDrawer
        open={formDrawerOpen}
        onOpenChange={setFormDrawerOpen}
        mode="create"
        onSuccess={handleVisitUpdateSuccess}
      />
    </div>
  );
}

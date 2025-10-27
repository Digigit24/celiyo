// src/pages/opd/OpdVisitsListPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-is-mobile';
import type { Visit, VisitListParams, VisitStatistics } from '@/types/opd.types';
import { getVisits, getTodayVisits, getVisitQueue, getVisitStatistics } from '@/services/opd/visit.service';
import { getPatients } from '@/services/patient.service';
import type { PatientProfile as Patient } from '@/types/patient.types';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Icons
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Stethoscope,
  UserPlus,
  CalendarPlus,
  X,
  Eye,
  Edit,
  MoreHorizontal,
  ArrowRight,
  Activity,
  DollarSign,
} from 'lucide-react';

// Custom Components
import { DataTable, DataTableColumn } from '@/components/DataTable';
import VisitQueueBoard from '@/components/opd/VisitQueueBoard';
import VisitFormDrawer from '@/components/opd/VisitFormDrawer';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function OpdVisitsListPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view');

  // State
  const [activeTab, setActiveTab] = useState<'list' | 'queue'>('list');
  const [visits, setVisits] = useState<Visit[]>([]);
  const [todayVisits, setTodayVisits] = useState<Visit[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [statistics, setStatistics] = useState<VisitStatistics | null>(null);
  const [queueData, setQueueData] = useState<{
    waiting: Visit[];
    called: Visit[];
    in_consultation: Visit[];
  }>({ waiting: [], called: [], in_consultation: [] });

  const [isLoading, setIsLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [filters, setFilters] = useState<VisitListParams>({
    page: 1,
    search: '',
    status: undefined,
    visit_type: undefined,
    payment_status: undefined,
  });

  // Active filter chips
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [visitsRes, todayRes, queueRes, statsRes, patientsRes] = await Promise.all([
        getVisits(filters),
        getTodayVisits(),
        getVisitQueue(),
        getVisitStatistics('day'),
        getPatients({ status: 'active', page: 1 }),
      ]);

      setVisits(visitsRes.results);
      setCount(visitsRes.count);
      setTodayVisits(todayRes);
      setQueueData(queueRes);
      setStatistics(statsRes);
      setPatients(patientsRes.results);
    } catch (error: any) {
      toast.error('Failed to load visits', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Handle search
  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value, page: 1 });
  };

  // Handle filter chips
  const addFilterChip = (type: string, value: string) => {
    setActiveFilters([...activeFilters, `${type}:${value}`]);
    setFilters({ ...filters, [type]: value, page: 1 });
  };

  const removeFilterChip = (chip: string) => {
    const [type] = chip.split(':');
    setActiveFilters(activeFilters.filter((f) => f !== chip));
    setFilters({ ...filters, [type]: undefined, page: 1 });
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setFilters({ page: 1, search: '' });
  };

  // Visit actions
  const handleViewVisit = (visit: Visit) => {
    setSelectedVisitId(visit.id);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleEditVisit = (visit: Visit) => {
    setSelectedVisitId(visit.id);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleDeleteVisit = async (visit: Visit) => {
    // Delete will be handled by the drawer
    toast.success('Visit deleted', {
      description: `${visit.visit_number} has been removed`,
    });
    fetchData();
  };

  const handleCreateVisit = () => {
    setSelectedVisitId(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleDrawerSuccess = () => {
    fetchData(); // Refresh data after create/update
  };

  const handleDrawerDelete = (id: number) => {
    fetchData(); // Refresh data after delete
  };

  // Calculate queue stats
  const queueStats = {
    waiting: queueData.waiting.length,
    called: queueData.called.length,
    in_consultation: queueData.in_consultation.length,
    total: queueData.waiting.length + queueData.called.length + queueData.in_consultation.length,
  };

  // DataTable columns
  const columns: DataTableColumn<Visit>[] = [
    {
      header: 'Visit #',
      key: 'visit_number',
      cell: (visit) => (
        <div>
          <p className="font-mono text-sm font-medium">{visit.visit_number}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(visit.visit_date), 'MMM dd, yyyy')}
          </p>
        </div>
      ),
    },
    {
      header: 'Patient',
      key: 'patient',
      cell: (visit) => (
        <div>
          <p className="font-medium">{visit.patient_name}</p>
          <p className="text-xs text-muted-foreground font-mono">{visit.patient_id}</p>
        </div>
      ),
    },
    {
      header: 'Doctor',
      key: 'doctor',
      cell: (visit) => (
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Dr. {visit.doctor_name || 'Not assigned'}</span>
        </div>
      ),
    },
    {
      header: 'Type',
      key: 'visit_type',
      cell: (visit) => (
        <Badge
          variant="outline"
          className={
            visit.visit_type === 'emergency'
              ? 'bg-red-100 text-red-700 border-red-200'
              : visit.visit_type === 'follow_up'
              ? 'bg-blue-100 text-blue-700 border-blue-200'
              : 'bg-purple-100 text-purple-700 border-purple-200'
          }
        >
          {visit.visit_type === 'new' && 'New'}
          {visit.visit_type === 'follow_up' && 'Follow-up'}
          {visit.visit_type === 'emergency' && 'Emergency'}
        </Badge>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      cell: (visit) => {
        const statusConfig = {
          waiting: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
          called: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertCircle },
          in_consultation: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Activity },
          completed: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
          cancelled: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: X },
          no_show: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
        };
        const config = statusConfig[visit.status];
        const Icon = config.icon;
        return (
          <Badge variant="outline" className={config.color}>
            <Icon className="h-3 w-3 mr-1" />
            {visit.status.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      header: 'Payment',
      key: 'payment_status',
      cell: (visit) => (
        <div>
          <Badge
            variant="outline"
            className={
              visit.payment_status === 'paid'
                ? 'bg-green-100 text-green-700 border-green-200'
                : visit.payment_status === 'partial'
                ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                : 'bg-red-100 text-red-700 border-red-200'
            }
          >
            {visit.payment_status}
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">₹{visit.total_amount}</p>
        </div>
      ),
    },
  ];

  // Mobile card renderer
  const renderMobileCard = (visit: Visit, actions: any) => (
    <>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-mono text-sm font-medium">{visit.visit_number}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(visit.visit_date), 'MMM dd, yyyy')}
          </p>
        </div>
        <div className="flex gap-1">
          {actions.view && (
            <Button size="icon" variant="ghost" onClick={actions.view}>
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {actions.edit && (
            <Button size="icon" variant="ghost" onClick={actions.edit}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium">{visit.patient_name}</p>
          <p className="text-xs text-muted-foreground font-mono">{visit.patient_id}</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Stethoscope className="h-4 w-4" />
          <span>Dr. {visit.doctor_name || 'Not assigned'}</span>
        </div>

        <div className="flex gap-2">
          <Badge
            variant="outline"
            className={
              visit.visit_type === 'emergency'
                ? 'bg-red-100 text-red-700 border-red-200'
                : visit.visit_type === 'follow_up'
                ? 'bg-blue-100 text-blue-700 border-blue-200'
                : 'bg-purple-100 text-purple-700 border-purple-200'
            }
          >
            {visit.visit_type}
          </Badge>
          <Badge
            variant="outline"
            className={
              visit.status === 'completed'
                ? 'bg-green-100 text-green-700 border-green-200'
                : visit.status === 'waiting'
                ? 'bg-blue-100 text-blue-700 border-blue-200'
                : 'bg-orange-100 text-orange-700 border-orange-200'
            }
          >
            {visit.status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-muted-foreground">Payment</div>
          <Badge
            variant="outline"
            className={
              visit.payment_status === 'paid'
                ? 'bg-green-100 text-green-700 border-green-200'
                : 'bg-red-100 text-red-700 border-red-200'
            }
          >
            {visit.payment_status} - ₹{visit.total_amount}
          </Badge>
        </div>
      </div>
    </>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="border-b bg-background p-4 md:p-6 space-y-4">
        {/* Title & Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">OPD Visits</h1>
            <p className="text-sm text-muted-foreground">
              Manage patient visits and appointments
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size={isMobile ? 'sm' : 'default'}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Add Appointment
            </Button>
            <Button size={isMobile ? 'sm' : 'default'} onClick={handleCreateVisit}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Visit
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Visits</p>
                <p className="text-2xl font-bold mt-1">{statistics?.total_visits || 0}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Waiting</p>
                <p className="text-2xl font-bold mt-1">{queueStats.waiting}</p>
              </div>
              <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">In Progress</p>
                <p className="text-2xl font-bold mt-1">{queueStats.in_consultation}</p>
              </div>
              <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Revenue</p>
                <p className="text-2xl font-bold mt-1">₹{statistics?.total_revenue || 0}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Queue Pipeline Visualization */}
        {queueStats.total > 0 && (
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Patient Flow Pipeline</h3>
                <Badge variant="secondary" className="font-mono">
                  {queueStats.total} Active
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {/* Waiting */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                      Waiting
                    </span>
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                      {queueStats.waiting}
                    </span>
                  </div>
                  <div className="h-2 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all"
                      style={{
                        width: queueStats.total > 0 ? `${(queueStats.waiting / queueStats.total) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                {/* Called */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-orange-700 dark:text-orange-400">
                      Called
                    </span>
                    <span className="text-xs font-bold text-orange-700 dark:text-orange-400">
                      {queueStats.called}
                    </span>
                  </div>
                  <div className="h-2 bg-orange-200 dark:bg-orange-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-600 dark:bg-orange-500 rounded-full transition-all"
                      style={{
                        width: queueStats.total > 0 ? `${(queueStats.called / queueStats.total) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                {/* In Consultation */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                      Consulting
                    </span>
                    <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">
                      {queueStats.in_consultation}
                    </span>
                  </div>
                  <div className="h-2 bg-yellow-200 dark:bg-yellow-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-600 dark:bg-yellow-500 rounded-full transition-all"
                      style={{
                        width:
                          queueStats.total > 0
                            ? `${(queueStats.in_consultation / queueStats.total) * 100}%`
                            : '0%',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Search & Filter Chips */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by visit #, patient name, or ID..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {/* Quick Filters */}
            <Button
              variant={activeFilters.includes('status:waiting') ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                activeFilters.includes('status:waiting')
                  ? removeFilterChip('status:waiting')
                  : addFilterChip('status', 'waiting')
              }
            >
              <Clock className="h-3 w-3 mr-1" />
              Waiting
            </Button>

            <Button
              variant={activeFilters.includes('status:in_consultation') ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                activeFilters.includes('status:in_consultation')
                  ? removeFilterChip('status:in_consultation')
                  : addFilterChip('status', 'in_consultation')
              }
            >
              <Activity className="h-3 w-3 mr-1" />
              In Progress
            </Button>

            <Button
              variant={activeFilters.includes('visit_type:new') ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                activeFilters.includes('visit_type:new')
                  ? removeFilterChip('visit_type:new')
                  : addFilterChip('visit_type', 'new')
              }
            >
              New Visits
            </Button>

            <Button
              variant={activeFilters.includes('visit_type:follow_up') ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                activeFilters.includes('visit_type:follow_up')
                  ? removeFilterChip('visit_type:follow_up')
                  : addFilterChip('visit_type', 'follow_up')
              }
            >
              Follow-ups
            </Button>

            <Button
              variant={activeFilters.includes('payment_status:unpaid') ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                activeFilters.includes('payment_status:unpaid')
                  ? removeFilterChip('payment_status:unpaid')
                  : addFilterChip('payment_status', 'unpaid')
              }
            >
              <DollarSign className="h-3 w-3 mr-1" />
              Unpaid
            </Button>

            {activeFilters.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: List View vs Queue Board */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
        <div className="border-b px-4 md:px-6">
          <TabsList>
            <TabsTrigger value="list">
              <Users className="h-4 w-4 mr-2" />
              List View ({count})
            </TabsTrigger>
            <TabsTrigger value="queue">
              <Activity className="h-4 w-4 mr-2" />
              Queue Board ({queueStats.total})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="flex-1 m-0 p-0">
          <ScrollArea className="h-full">
            <DataTable
              rows={visits}
              isLoading={isLoading}
              columns={columns}
              renderMobileCard={renderMobileCard}
              getRowId={(visit) => visit.id}
              getRowLabel={(visit) => visit.visit_number}
              onView={handleViewVisit}
              onEdit={handleEditVisit}
              onDelete={handleDeleteVisit}
              emptyTitle="No visits found"
              emptySubtitle="Start by adding a new visit or adjust your filters"
            />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="queue" className="flex-1 m-0 p-0">
          <VisitQueueBoard
            waiting={queueData.waiting}
            called={queueData.called}
            inConsultation={queueData.in_consultation}
            isLoading={isLoading}
            onVisitClick={handleViewVisit}
            onRefresh={fetchData}
          />
        </TabsContent>
      </Tabs>

      {/* Visit Form Drawer */}
      <VisitFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        visitId={selectedVisitId}
        mode={drawerMode}
        onSuccess={handleDrawerSuccess}
        onDelete={handleDrawerDelete}
        onModeChange={setDrawerMode}
      />
    </div>
  );
}
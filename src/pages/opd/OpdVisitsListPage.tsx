// src/pages/opd/OpdVisitsListPage.tsx
import { useState, useMemo } from 'react';
import { useVisits, useVisitStatistics, useTodayVisits, useQueue, useUpdateVisit } from '@/hooks/useOPD';
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
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-is-mobile';
import VisitQueueBoard from '@/components/opd/VisitQueueBoard';
import VisitCard from '@/components/opd/VisitCard';
import VisitDetailDrawer from '@/components/opd/VisitDetailDrawer';
import VisitFormDrawer from '@/components/opd/VisitFormDrawer';
import { formatDistanceToNow } from 'date-fns';

export default function OpdVisitsListPage() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'queue' | 'today' | 'all'>('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);

  // Fetch data
  const { statistics, isLoading: statsLoading, mutate: mutateStats } = useVisitStatistics();
  const { todayVisits, count: todayCount, isLoading: todayLoading, mutate: mutateTodayVisits } = useTodayVisits();
  const { waiting, called, inConsultation, isLoading: queueLoading, mutate: mutateQueue } = useQueue();

  // All visits with filters
  const [allVisitsFilters] = useState<VisitListParams>({
    page: 1,
    search: searchQuery,
  });
  const { visits: allVisits, isLoading: allVisitsLoading, mutate: mutateAllVisits } = useVisits(allVisitsFilters);

  // Refresh all data
  const handleRefreshAll = () => {
    mutateStats();
    mutateTodayVisits();
    mutateQueue();
    mutateAllVisits();
    toast.success('Data refreshed');
  };

  // Handle visit click
  const handleVisitClick = (visit: Visit) => {
    setSelectedVisitId(visit.id);
    setDrawerOpen(true);
  };

  // Handle drawer close
  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedVisitId(null);
  };

  // Handle visit update success
  const handleVisitUpdateSuccess = () => {
    mutateQueue();
    mutateTodayVisits();
    mutateAllVisits();
    mutateStats();
  };

  // Filter today's visits by search
  const filteredTodayVisits = useMemo(() => {
    if (!searchQuery.trim()) return todayVisits;
    
    const query = searchQuery.toLowerCase();
    return todayVisits.filter(visit => 
      visit.patient_name?.toLowerCase().includes(query) ||
      visit.patient_id?.toLowerCase().includes(query) ||
      visit.visit_number?.toLowerCase().includes(query)
    );
  }, [todayVisits, searchQuery]);

  if (statsLoading && !statistics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading OPD visits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">OPD Queue</h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Manage patient visits and consultations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleRefreshAll} variant="outline" size={isMobile ? 'sm' : 'default'}>
              <RefreshCcw className="h-4 w-4 md:mr-2" />
              {!isMobile && 'Refresh'}
            </Button>
            <Button size={isMobile ? 'sm' : 'default'} onClick={() => setFormDrawerOpen(true)}>
              <Plus className="h-4 w-4 md:mr-2" />
              {!isMobile && 'New Visit'}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="px-4 pb-3 md:px-6 md:pb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Waiting</p>
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
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">In Progress</p>
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
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">Completed</p>
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
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Total Today</p>
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

        {/* Search Bar */}
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

      {/* Main Content - Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full flex flex-col">
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

          {/* Queue View */}
          <TabsContent value="queue" className="flex-1 overflow-auto m-0 p-0">
            <VisitQueueBoard
              waiting={waiting}
              called={called}
              inConsultation={inConsultation}
              isLoading={queueLoading}
              onVisitClick={handleVisitClick}
              onRefresh={mutateQueue}
            />
          </TabsContent>

          {/* Today's Visits */}
          <TabsContent value="today" className="flex-1 overflow-auto m-0 p-0">
            <div className="p-4 md:p-6 space-y-3">
              {todayLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredTodayVisits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No visits found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'Try adjusting your search criteria' : 'No visits registered for today'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTodayVisits.map((visit) => (
                    <VisitCard
                      key={visit.id}
                      visit={visit}
                      onClick={() => handleVisitClick(visit)}
                      onStatusChange={handleVisitUpdateSuccess}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* All Visits */}
          <TabsContent value="all" className="flex-1 overflow-auto m-0 p-0">
            <div className="p-4 md:p-6 space-y-3">
              {allVisitsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : allVisits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No visits found</h3>
                  <p className="text-sm text-muted-foreground">
                    Start by registering a new patient visit
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allVisits.map((visit) => (
                    <VisitCard
                      key={visit.id}
                      visit={visit}
                      onClick={() => handleVisitClick(visit)}
                      onStatusChange={handleVisitUpdateSuccess}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Visit Detail Drawer */}
      <VisitDetailDrawer
        visitId={selectedVisitId}
        open={drawerOpen}
        onOpenChange={handleDrawerClose}
        onSuccess={handleVisitUpdateSuccess}
      />

      {/* Visit Form Drawer */}
      <VisitFormDrawer
        open={formDrawerOpen}
        onOpenChange={setFormDrawerOpen}
        mode="create"
        onSuccess={handleVisitUpdateSuccess}
      />
    </div>
  );
}
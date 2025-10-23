// src/pages/patients/PatientsListPage.tsx
import { useState } from 'react';
import { usePatients } from '@/hooks/usePatients';
import type { PatientListParams, PatientProfile } from '@/types/patient.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Filter, Plus, Search, X, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-is-mobile';
import PatientFiltersDrawer from '@/components/PatientFiltersDrawer';
import PatientTable from '@/components/PatientTable';
import PatientDrawer from '@/components/PatientFormDrawer';

export default function PatientsListPage() {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PatientListParams>({
    status: 'active',
    search: '',
    page: 1,
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Patient Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');

  const { patients, count, isLoading, error, mutate } = usePatients(filters);

  // Handle search
  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery, page: 1 });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilters({ ...filters, search: '', page: 1 });
  };

  const handleApplyFilters = (newFilters: PatientListParams) => {
    setFilters(newFilters);
    setIsFiltersOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters: PatientListParams = {
      status: 'active',
      search: searchQuery,
      page: 1,
    };
    setFilters(resetFilters);
    setIsFiltersOpen(false);
  };

  // Patient Drawer handlers
  const handleCreatePatient = () => {
    setSelectedPatientId(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEditPatient = (patient: PatientProfile) => {
    setSelectedPatientId(patient.id);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleViewPatient = (patient: PatientProfile) => {
    setSelectedPatientId(patient.id);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleDrawerSuccess = () => {
    mutate(); // Refresh the list
  };

  if (isLoading && patients.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading patients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Patients</h3>
          <p className="text-sm text-destructive/80">{error.message || 'Failed to fetch patient data'}</p>
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
              <h1 className="text-xl md:text-2xl font-semibold">Patients</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                {count} total patients
              </p>
            </div>
          </div>

          <Button onClick={handleCreatePatient} size={isMobile ? 'sm' : 'default'}>
            <Plus className="h-4 w-4 mr-2" />
            {!isMobile && 'Add Patient'}
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="px-4 pb-3 md:px-6 md:pb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name, ID, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
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
                <PatientFiltersDrawer
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
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                Search: {filters.search}
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                Status: {filters.status}
              </span>
            )}
            {filters.gender && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400">
                Gender: {filters.gender}
              </span>
            )}
            {filters.blood_group && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                Blood: {filters.blood_group}
              </span>
            )}
            {filters.has_insurance !== undefined && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                Insurance: {filters.has_insurance ? 'Yes' : 'No'}
              </span>
            )}
            {(filters.age_min || filters.age_max) && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                Age: {filters.age_min || 0}-{filters.age_max || '∞'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-auto">
        <PatientTable
          patients={patients}
          isLoading={isLoading}
          onEdit={handleEditPatient}
          onView={handleViewPatient}
          onRefresh={mutate}
        />
      </div>

      {/* Patient Drawer - NEW: Uses PatientDrawer component */}
      <PatientDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        patientId={selectedPatientId}
        mode={drawerMode}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  );
}
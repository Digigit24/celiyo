// src/pages/doctors/DoctorsListPage.tsx
import { useState } from 'react';
import { useDoctors } from '@/hooks/useDoctors';
import type { DoctorListParams, Doctor } from '@/types/doctor.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Filter, Plus, Search, X, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-is-mobile';
import DoctorFiltersDrawer from '@/components/DoctorFiltersDrawer';
import DoctorsTable from '@/components/DoctorsTable';
import DoctorFormDrawer from '@/components/DoctorFormDrawer';

export default function DoctorsListPage() {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<DoctorListParams>({
    status: 'active',
    search: '',
    page: 1,
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Doctor Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');

  const { doctors, count, isLoading, error, mutate } = useDoctors(filters);

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

  const handleApplyFilters = (newFilters: DoctorListParams) => {
    setFilters(newFilters);
    setIsFiltersOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters: DoctorListParams = {
      status: 'active',
      search: searchQuery,
      page: 1,
    };
    setFilters(resetFilters);
    setIsFiltersOpen(false);
  };

  // Doctor Drawer handlers
  const handleCreateDoctor = () => {
    setSelectedDoctorId(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctorId(doctor.id);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleViewDoctor = (doctor: Doctor) => {
    setSelectedDoctorId(doctor.id);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleDrawerSuccess = () => {
    mutate(); // Refresh the list
  };

  if (isLoading && doctors.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Doctors</h3>
          <p className="text-sm text-destructive/80">{error.message || 'Failed to fetch doctor data'}</p>
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
              <h1 className="text-xl md:text-2xl font-semibold">Doctors</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                {count} total doctors
              </p>
            </div>
          </div>

          <Button onClick={handleCreateDoctor} size={isMobile ? 'sm' : 'default'}>
            <Plus className="h-4 w-4 mr-2" />
            {!isMobile && 'Add Doctor'}
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="px-4 pb-3 md:px-6 md:pb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors by name, license, or specialty..."
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
                <DoctorFiltersDrawer
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
                Status: {filters.status.replace('_', ' ')}
              </span>
            )}
            {filters.specialty && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400">
                Specialty ID: {filters.specialty}
              </span>
            )}
            {filters.available !== undefined && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                Available: {filters.available ? 'Yes' : 'No'}
              </span>
            )}
            {filters.min_rating && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                Min Rating: {filters.min_rating}⭐
              </span>
            )}
            {(filters.min_fee || filters.max_fee) && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                Fee: ₹{filters.min_fee || 0} - ₹{filters.max_fee || '∞'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-auto">
        <DoctorsTable
          doctors={doctors}
          isLoading={isLoading}
          onEdit={handleEditDoctor}
          onView={handleViewDoctor}
          onRefresh={mutate}
        />
      </div>

      {/* Doctor Drawer */}
      <DoctorFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        doctorId={selectedDoctorId}
        mode={drawerMode}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  );
}
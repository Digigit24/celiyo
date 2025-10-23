// src/pages/specialties/SpecialtiesListPage.tsx
import { useState } from 'react';
import { useSpecialties } from '@/hooks/useDoctors';
import type { SpecialtyListParams, Specialty } from '@/types/doctor.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Filter, Plus, Search, X, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-is-mobile';
import SpecialtyFiltersDrawer from '@/components/SpecialtyFiltersDrawer';
import SpecialtiesTable from '@/components/SpecialtiesTable';
import SpecialtyFormDrawer from '@/components/SpecialtyFormDrawer';

export default function SpecialtiesListPage() {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SpecialtyListParams>({
    is_active: true,
    search: '',
    page: 1,
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Specialty Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number | null>(null);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');

  const { specialties, count, isLoading, error, mutate } = useSpecialties(filters);

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

  const handleApplyFilters = (newFilters: SpecialtyListParams) => {
    setFilters(newFilters);
    setIsFiltersOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters: SpecialtyListParams = {
      is_active: true,
      search: searchQuery,
      page: 1,
    };
    setFilters(resetFilters);
    setIsFiltersOpen(false);
  };

  // Specialty Drawer handlers
  const handleCreateSpecialty = () => {
    setSelectedSpecialtyId(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEditSpecialty = (specialty: Specialty) => {
    setSelectedSpecialtyId(specialty.id);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleViewSpecialty = (specialty: Specialty) => {
    setSelectedSpecialtyId(specialty.id);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleDrawerSuccess = () => {
    mutate(); // Refresh the list
  };

  if (isLoading && specialties.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading specialties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Specialties</h3>
          <p className="text-sm text-destructive/80">{error.message || 'Failed to fetch specialty data'}</p>
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
              <h1 className="text-xl md:text-2xl font-semibold">Medical Specialties</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                {count} total specialties
              </p>
            </div>
          </div>

          <Button onClick={handleCreateSpecialty} size={isMobile ? 'sm' : 'default'}>
            <Plus className="h-4 w-4 mr-2" />
            {!isMobile && 'Add Specialty'}
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="px-4 pb-3 md:px-6 md:pb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search specialties by name, code, or department..."
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
                <SpecialtyFiltersDrawer
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
            {filters.is_active !== undefined && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                Status: {filters.is_active ? 'Active' : 'Inactive'}
              </span>
            )}
            {(filters as any).department && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400">
                Department: {(filters as any).department}
              </span>
            )}
            {filters.ordering && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                Sort: {filters.ordering.replace(/^-/, '').replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-auto">
        <SpecialtiesTable
          specialties={specialties}
          isLoading={isLoading}
          onEdit={handleEditSpecialty}
          onView={handleViewSpecialty}
          onRefresh={mutate}
        />
      </div>

      {/* Specialty Drawer */}
      <SpecialtyFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        specialtyId={selectedSpecialtyId}
        mode={drawerMode}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  );
}
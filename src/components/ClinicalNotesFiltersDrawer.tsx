// src/components/ClinicalNotesFiltersDrawer.tsx
import { useState, useEffect } from 'react';
import type { ClinicalNoteListParams } from '@/types/opd.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ClinicalNotesFiltersDrawerProps {
  // whatever is currently applied in the page
  initialFilters: ClinicalNoteListParams;

  // parent wants the new filters committed
  onApply: (f: ClinicalNoteListParams) => void;

  // parent reset handler (clears filters in page)
  onReset: () => void;

  // parent close handler (to close the SideDrawer)
  onClose: () => void;
}

export default function ClinicalNotesFiltersDrawer({
  initialFilters,
  onApply,
  onReset,
  onClose,
}: ClinicalNotesFiltersDrawerProps) {
  // we edit a local draft that isn't applied until user taps "Apply"
  const [localFilters, setLocalFilters] = useState<ClinicalNoteListParams>(
    initialFilters
  );

  // if parent updates filters (for example after Reset),
  // sync those into local
  useEffect(() => {
    setLocalFilters(initialFilters);
  }, [initialFilters]);

  const handleApplyClick = () => {
    // force page=1 on apply (like you already do)
    onApply({
      ...localFilters,
      page: 1,
    });
    onClose();
  };

  const handleResetClick = () => {
    onReset();
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Body (scrollable) */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Patient, diagnosis, complaint..."
            value={localFilters.search || ''}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                search: e.target.value,
              }))
            }
          />
          <p className="text-xs text-muted-foreground">
            This matches across patient name, diagnosis, visit etc.
          </p>
        </div>

        {/* Note Date */}
        <div className="space-y-2">
          <Label htmlFor="note_date">Note Date</Label>
          <Input
            id="note_date"
            type="date"
            value={localFilters.note_date || ''}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                note_date: e.target.value || undefined,
              }))
            }
          />
        </div>

        {/* Visit ID */}
        <div className="space-y-2">
          <Label htmlFor="visit">Visit ID</Label>
          <Input
            id="visit"
            type="number"
            placeholder="Filter by visit ID"
            value={localFilters.visit || ''}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                visit: parseInt(e.target.value, 10) || undefined,
              }))
            }
          />
        </div>
      </div>

      {/* Footer actions */}
      <div className="pt-4 mt-6 border-t flex flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          className="w-full sm:flex-1"
          onClick={handleResetClick}
        >
          Reset
        </Button>

        <Button
          className="w-full sm:flex-1"
          onClick={handleApplyClick}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}

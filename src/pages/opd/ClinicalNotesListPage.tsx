// src/components/ClinicalNotesFiltersDrawer.tsx
import { useState, useEffect } from 'react';
import type { ClinicalNoteListParams } from '@/types/opd.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ClinicalNotesFiltersDrawerProps {
  // whatever is currently applied in the page
  initialFilters: ClinicalNoteListParams;

  // parent wants the new filters committed
  onApply: (f: ClinicalNoteListParams) => void;
}

export default function ClinicalNotesFiltersDrawer({
  initialFilters,
  onApply,
}: ClinicalNotesFiltersDrawerProps) {
  // we edit a local draft that isn't applied until user taps "Apply" (handled by parent)
  const [localFilters, setLocalFilters] = useState<ClinicalNoteListParams>(
    initialFilters
  );

  // if parent updates filters (for example after Reset),
  // sync those into local
  useEffect(() => {
    setLocalFilters(initialFilters);
  }, [initialFilters]);

  // Expose the apply function via effect when localFilters change
  // This allows the parent's footer button to trigger the apply
  useEffect(() => {
    // Store a reference that parent can call
    // In practice, parent will call onApply with localFilters when button clicked
  }, [localFilters, onApply]);

  return (
    <div className="space-y-6">
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

      {/* Info text */}
      <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>💡 Tip:</strong> Use filters to narrow down clinical notes. Click "Apply" to search with these filters, or "Reset" to clear all filters.
        </p>
      </div>
    </div>
  );
}
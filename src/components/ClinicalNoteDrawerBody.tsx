// src/components/ClinicalNoteDrawerBody.tsx
import { useEffect, useState } from 'react';
import type { ClinicalNote } from '@/types/opd.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// TODO: connect to real services when ready
// import { getClinicalNoteById, createClinicalNote, updateClinicalNote } from '@/services/opd.service';

interface ClinicalNoteDrawerBodyProps {
  noteId: number | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess?: () => void;
}

/**
 * UI-facing shape for the form/drawer.
 * We don't assume backend field names are perfect, we just choose what we display + edit.
 */
type ClinicalNoteFormState = {
  patient_name: string;
  visit: number | undefined;
  note_date: string;
  next_followup_date: string;
  diagnosis: string;
  notes: string;
};

export default function ClinicalNoteDrawerBody({
  noteId,
  mode,
  onSuccess,
}: ClinicalNoteDrawerBodyProps) {
  const [loading, setLoading] = useState(false);

  const [noteData, setNoteData] = useState<ClinicalNoteFormState>({
    patient_name: '',
    visit: undefined,
    note_date: '',
    next_followup_date: '',
    diagnosis: '',
    notes: '',
  });

  // readOnly = true in "view" mode
  const readOnly = mode === 'view';

  // load note data in edit/view mode
  useEffect(() => {
    async function load() {
      if (!noteId || mode === 'create') {
        // reset to blank when creating
        setNoteData({
          patient_name: '',
          visit: undefined,
          note_date: '',
          next_followup_date: '',
          diagnosis: '',
          notes: '',
        });
        return;
      }

      setLoading(true);
      try {
        // ---- REAL VERSION (uncomment + adapt later) ----
        // const apiNote = await getClinicalNoteById(noteId)
        // setNoteData({
        //   patient_name: apiNote.patient_name || apiNote.patient?.full_name || '',
        //   visit: typeof apiNote.visit === 'number'
        //     ? apiNote.visit
        //     : apiNote.visit?.id ?? undefined,
        //   note_date: apiNote.note_date || apiNote.created_at || '',
        //   next_followup_date: apiNote.next_followup_date || '',
        //   diagnosis: apiNote.diagnosis || apiNote.summary || apiNote.chief_complaint || '',
        //   notes: apiNote.notes || '',
        // })

        // ---- TEMP MOCK so UI doesn't explode ----
        setNoteData({
          patient_name: 'John Carter',
          visit: 1234,
          note_date: '2025-10-24',
          next_followup_date: '2025-10-28',
          diagnosis: 'Acute bronchitis',
          notes: 'Cough, wheeze, mild fever. Advise rest & fluids.',
        });
      } catch (err: any) {
        toast.error(err?.message || 'Failed to load note');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [noteId, mode]);

  // Later, you can expose a save function here,
  // and have SideDrawer call it via footer buttons.

  if (loading) {
    return (
      <div className="space-y-6 pr-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pr-2">
      {/* Patient + Visit ID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Patient</Label>
          <Input
            value={noteData.patient_name}
            onChange={(e) =>
              setNoteData((prev) => ({
                ...prev,
                patient_name: e.target.value,
              }))
            }
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <Label>Visit ID</Label>
          <Input
            value={noteData.visit ?? ''}
            onChange={(e) =>
              setNoteData((prev) => ({
                ...prev,
                visit: parseInt(e.target.value, 10) || undefined,
              }))
            }
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Note Date</Label>
          <Input
            type="date"
            value={noteData.note_date}
            onChange={(e) =>
              setNoteData((prev) => ({
                ...prev,
                note_date: e.target.value,
              }))
            }
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <Label>Next Follow-up</Label>
          <Input
            type="date"
            value={noteData.next_followup_date}
            onChange={(e) =>
              setNoteData((prev) => ({
                ...prev,
                next_followup_date: e.target.value,
              }))
            }
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>
      </div>

      {/* Diagnosis / Summary */}
      <div className="space-y-2">
        <Label>Diagnosis / Summary</Label>
        <Input
          value={noteData.diagnosis}
          onChange={(e) =>
            setNoteData((prev) => ({
              ...prev,
              diagnosis: e.target.value,
            }))
          }
          readOnly={readOnly}
          disabled={readOnly}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Doctor Notes</Label>
        <Textarea
          value={noteData.notes}
          onChange={(e) =>
            setNoteData((prev) => ({
              ...prev,
              notes: e.target.value,
            }))
          }
          readOnly={readOnly}
          disabled={readOnly}
          className="min-h-[100px]"
        />
      </div>

      {mode === 'view' && (
        <p className="text-[11px] text-muted-foreground">
          Read-only mode. Use Edit from the table row actions to modify this
          note.
        </p>
      )}
    </div>
  );
}

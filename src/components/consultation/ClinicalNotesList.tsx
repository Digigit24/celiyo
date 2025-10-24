// src/components/consultation/ClinicalNotesList.tsx
import { useState } from 'react';
import { format } from 'date-fns';
import type { ClinicalNote } from '@/types/opd.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, FileText } from 'lucide-react';
import { useUpdateClinicalNote, useDeleteClinicalNote } from '@/hooks/useOPD';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface ClinicalNotesListProps {
  notes: ClinicalNote[];
  loading: boolean;
  onUpdate: () => void;
}

export default function ClinicalNotesList({ notes, loading, onUpdate }: ClinicalNotesListProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { deleteClinicalNote } = useDeleteClinicalNote();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteClinicalNote(deleteId);
      onUpdate();
      toast.success('Clinical note deleted');
      setDeleteId(null);
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading notes...</p>;
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
        <p>No clinical notes recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <Card key={note.id} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{format(new Date(note.note_date), 'PP')}</Badge>
                {note.created_by_name && (
                  <span className="text-sm text-muted-foreground">by {note.created_by_name}</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost">
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setDeleteId(note.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            {note.present_complaints && (
              <div>
                <p className="font-semibold mb-1">Chief Complaints:</p>
                <p className="text-muted-foreground">{note.present_complaints}</p>
              </div>
            )}

            {note.observation && (
              <div>
                <p className="font-semibold mb-1">Observation:</p>
                <p className="text-muted-foreground">{note.observation}</p>
              </div>
            )}

            {note.diagnosis && (
              <div>
                <p className="font-semibold mb-1">Diagnosis:</p>
                <p className="text-muted-foreground">{note.diagnosis}</p>
              </div>
            )}

            {note.investigation && (
              <div>
                <p className="font-semibold mb-1">Investigations:</p>
                <p className="text-muted-foreground">{note.investigation}</p>
              </div>
            )}

            {note.treatment_plan && (
              <div>
                <p className="font-semibold mb-1">Treatment Plan:</p>
                <p className="text-muted-foreground">{note.treatment_plan}</p>
              </div>
            )}

            {note.medicines_prescribed && (
              <div>
                <p className="font-semibold mb-1">Medicines:</p>
                <p className="text-muted-foreground whitespace-pre-line">{note.medicines_prescribed}</p>
              </div>
            )}

            {note.doctor_advice && (
              <div>
                <p className="font-semibold mb-1">Doctor's Advice:</p>
                <p className="text-muted-foreground">{note.doctor_advice}</p>
              </div>
            )}

            {note.suggested_surgery_name && (
              <div>
                <p className="font-semibold mb-1">Suggested Surgery:</p>
                <p className="text-muted-foreground">
                  {note.suggested_surgery_name}
                  {note.suggested_surgery_reason && ` - ${note.suggested_surgery_reason}`}
                </p>
              </div>
            )}

            {note.next_followup_date && (
              <div>
                <p className="font-semibold mb-1">Next Follow-up:</p>
                <Badge>{format(new Date(note.next_followup_date), 'PP')}</Badge>
              </div>
            )}
          </div>
        </Card>
      ))}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Clinical Note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the clinical note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
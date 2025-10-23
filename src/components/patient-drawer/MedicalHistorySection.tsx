// src/components/patient-drawer/MedicalHistorySection.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  usePatientMedicalHistory,
  useAddMedicalHistory,
} from '@/hooks/usePatients';
import {
  deletePatientMedicalHistory,
  updatePatientMedicalHistory,
} from '@/services/patient.service';
import MedicalHistoryForm from './MedicalHistoryForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import type {
  PatientMedicalHistory,
  MedicalHistoryCreateData,
} from '@/types/patient.types';

interface MedicalHistorySectionProps {
  patientId: number;
  readOnly: boolean;
}

export default function MedicalHistorySection({
  patientId,
  readOnly,
}: MedicalHistorySectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingHistory, setEditingHistory] =
    useState<PatientMedicalHistory | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { medicalHistory, count, isLoading, mutate } =
    usePatientMedicalHistory(patientId);
  const { trigger: addHistory, isMutating } = useAddMedicalHistory(patientId);

  const handleAddHistory = async (data: MedicalHistoryCreateData) => {
    try {
      if (editingHistory) {
        await updatePatientMedicalHistory(editingHistory.id, data);
        toast.success('Medical history updated successfully');
      } else {
        await addHistory(data);
        toast.success('Medical history added successfully');
      }
      mutate();
      setShowForm(false);
      setEditingHistory(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (history: PatientMedicalHistory) => {
    setEditingHistory(history);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deletePatientMedicalHistory(deleteId);
      toast.success('Medical history deleted successfully');
      mutate();
      setDeleteId(null);
    } catch (error: any) {
      toast.error('Failed to delete medical history');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800';
      case 'chronic':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Past Medical Conditions</h3>
        {!readOnly && (
          <Button
            size="sm"
            onClick={() => {
              setEditingHistory(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Condition
          </Button>
        )}
      </div>

      {showForm && (
        <MedicalHistoryForm
          patientId={patientId}
          history={editingHistory}
          onSubmit={handleAddHistory}
          onCancel={() => {
            setShowForm(false);
            setEditingHistory(null);
          }}
          saving={isMutating}
        />
      )}

      {medicalHistory.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No medical history recorded
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Condition</TableHead>
                <TableHead>Diagnosed Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Recorded On</TableHead>
                {!readOnly && <TableHead className="w-24">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicalHistory.map((history) => (
                <TableRow key={history.id}>
                  <TableCell className="font-medium">
                    {history.condition}
                  </TableCell>
                  <TableCell>
                    {history.diagnosed_date
                      ? format(new Date(history.diagnosed_date), 'dd MMM yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${getStatusColor(
                        history.status
                      )}`}
                    >
                      {history.status.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={history.notes || ''}>
                      {history.notes || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(history.created_at), 'dd MMM yyyy')}
                  </TableCell>
                  {!readOnly && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(history)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(history.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        Total Records: {count}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medical History</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this medical history record? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
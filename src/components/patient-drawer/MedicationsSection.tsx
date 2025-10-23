// src/components/patient-drawer/MedicationsSection.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  usePatientMedications,
  useAddMedication,
} from '@/hooks/usePatients';
import {
  deletePatientMedication,
  updatePatientMedication,
} from '@/services/patient.service';
import MedicationForm from './MedicationForm';
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
  PatientMedication,
  MedicationCreateData,
} from '@/types/patient.types';

interface MedicationsSectionProps {
  patientId: number;
  readOnly: boolean;
}

export default function MedicationsSection({
  patientId,
  readOnly,
}: MedicationsSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] =
    useState<PatientMedication | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { medications, count, isLoading, mutate } =
    usePatientMedications(patientId);
  const { trigger: addMedication, isMutating } = useAddMedication(patientId);

  const handleAddMedication = async (data: MedicationCreateData) => {
    try {
      if (editingMedication) {
        await updatePatientMedication(editingMedication.id, data);
        toast.success('Medication updated successfully');
      } else {
        await addMedication(data);
        toast.success('Medication added successfully');
      }
      mutate();
      setShowForm(false);
      setEditingMedication(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (medication: PatientMedication) => {
    setEditingMedication(medication);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deletePatientMedication(deleteId);
      toast.success('Medication deleted successfully');
      mutate();
      setDeleteId(null);
    } catch (error: any) {
      toast.error('Failed to delete medication');
    } finally {
      setDeleting(false);
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
        <h3 className="text-lg font-semibold">Current Medications</h3>
        {!readOnly && (
          <Button
            size="sm"
            onClick={() => {
              setEditingMedication(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Medication
          </Button>
        )}
      </div>

      {showForm && (
        <MedicationForm
          patientId={patientId}
          medication={editingMedication}
          onSubmit={handleAddMedication}
          onCancel={() => {
            setShowForm(false);
            setEditingMedication(null);
          }}
          saving={isMutating}
        />
      )}

      {medications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No medications recorded
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Prescribed By</TableHead>
                <TableHead>Status</TableHead>
                {!readOnly && <TableHead className="w-24">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {medications.map((medication) => (
                <TableRow key={medication.id}>
                  <TableCell className="font-medium">
                    {medication.medication_name}
                  </TableCell>
                  <TableCell>{medication.dosage || '-'}</TableCell>
                  <TableCell>{medication.frequency || '-'}</TableCell>
                  <TableCell>
                    {medication.start_date
                      ? format(new Date(medication.start_date), 'dd MMM yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {medication.end_date
                      ? format(new Date(medication.end_date), 'dd MMM yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>{medication.prescribed_by || '-'}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        medication.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {medication.is_active ? 'Active' : 'Stopped'}
                    </span>
                  </TableCell>
                  {!readOnly && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(medication)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(medication.id)}
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
        Total Medications: {count}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medication</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this medication record? This
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
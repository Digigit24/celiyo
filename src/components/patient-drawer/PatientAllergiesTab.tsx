// src/components/patient-drawer/PatientAllergiesTab.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  usePatientAllergies,
  useAddAllergy,
} from '@/hooks/usePatients';
import {
  deletePatientAllergy,
  updatePatientAllergy,
} from '@/services/patient.service';
import AllergyForm from './AllergyForm';
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
import type { PatientAllergy, AllergyCreateData } from '@/types/patient.types';

interface PatientAllergiesTabProps {
  patientId: number;
  readOnly: boolean;
}

export default function PatientAllergiesTab({
  patientId,
  readOnly,
}: PatientAllergiesTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState<PatientAllergy | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const { allergies, count, isLoading, mutate } = usePatientAllergies(patientId);
  const { trigger: addAllergy, isMutating } = useAddAllergy(patientId);

  const handleAddAllergy = async (data: AllergyCreateData) => {
    try {
      if (editingAllergy) {
        await updatePatientAllergy(editingAllergy.id, data);
        toast.success('Allergy updated successfully');
      } else {
        await addAllergy(data);
        toast.success('Allergy added successfully');
      }
      mutate();
      setShowForm(false);
      setEditingAllergy(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (allergy: PatientAllergy) => {
    setEditingAllergy(allergy);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deletePatientAllergy(deleteId);
      toast.success('Allergy deleted successfully');
      mutate();
      setDeleteId(null);
    } catch (error: any) {
      toast.error('Failed to delete allergy');
    } finally {
      setDeleting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-yellow-100 text-yellow-800';
      case 'moderate':
        return 'bg-orange-100 text-orange-800';
      case 'severe':
        return 'bg-red-100 text-red-800';
      case 'life_threatening':
        return 'bg-red-200 text-red-900 font-bold';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      drug: 'Drug',
      food: 'Food',
      environmental: 'Environmental',
      contact: 'Contact',
      other: 'Other',
    };
    return labels[type] || type;
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
        <h3 className="text-lg font-semibold">Allergy History</h3>
        {!readOnly && (
          <Button
            size="sm"
            onClick={() => {
              setEditingAllergy(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Allergy
          </Button>
        )}
      </div>

      {showForm && (
        <AllergyForm
          patientId={patientId}
          allergy={editingAllergy}
          onSubmit={handleAddAllergy}
          onCancel={() => {
            setShowForm(false);
            setEditingAllergy(null);
          }}
          saving={isMutating}
        />
      )}

      {allergies.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No allergies recorded
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Allergen</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Symptoms</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recorded</TableHead>
                {!readOnly && <TableHead className="w-24">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allergies.map((allergy) => (
                <TableRow key={allergy.id}>
                  <TableCell>
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                      {getTypeLabel(allergy.allergy_type)}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {allergy.allergen}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${getSeverityColor(
                        allergy.severity
                      )}`}
                    >
                      {allergy.severity.replace('_', ' ').toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={allergy.symptoms}>
                      {allergy.symptoms}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={allergy.treatment || ''}>
                      {allergy.treatment || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        allergy.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {allergy.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(allergy.created_at), 'dd MMM yyyy')}
                  </TableCell>
                  {!readOnly && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(allergy)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(allergy.id)}
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
        Total Allergies: {count}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Allergy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this allergy record? This action
              cannot be undone.
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
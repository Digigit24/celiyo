import { useState } from 'react';
import type { PatientProfile } from '@/types/patient.types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Eye, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { deletePatient } from '@/services/patient.service';
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

interface PatientTableProps {
  patients: PatientProfile[];
  isLoading: boolean;
  onEdit: (patient: PatientProfile) => void;
  onView: (patient: PatientProfile) => void;
  onRefresh: () => void;
}

export default function PatientTable({ patients, isLoading, onEdit, onView, onRefresh }: PatientTableProps) {
  const isMobile = useIsMobile();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<PatientProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (patient: PatientProfile) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return;

    setIsDeleting(true);
    try {
      await deletePatient(patientToDelete.id);
      toast.success('Patient deleted successfully');
      onRefresh();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete patient');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'deceased':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'male':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'female':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return '-';
    }
  };



  

  if (patients.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-foreground mb-1">No patients found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your filters or search criteria</p>
        </div>
      </div>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="p-4 space-y-3">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className="bg-card border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base">{patient.full_name}</h3>
                  <Badge className={getStatusColor(patient.status)} variant="secondary">
                    {patient.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{patient.patient_id}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onView(patient)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(patient)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(patient)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge className={getGenderColor(patient.gender)} variant="secondary">
                  {patient.gender}
                </Badge>
                <span className="text-muted-foreground">{patient.age} years</span>
                {patient.blood_group && (
                  <Badge variant="outline" className="text-rose-600 border-rose-200">
                    {patient.blood_group}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{patient.mobile_primary}</span>
              </div>

              {patient.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{patient.email}</span>
                </div>
              )}

              {patient.city && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{patient.city}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t text-xs">
                <span className="text-muted-foreground">
                  Registered: {formatDate(patient.registration_date)}
                </span>
                {patient.is_insurance_valid && (
                  <Badge variant="outline" className="text-xs">
                    Insured
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Patient</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {patientToDelete?.full_name}? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Desktop Table View - Notion-like
  return (
    <div className="w-full">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow className="hover:bg-transparent border-b">
            <TableHead className="font-medium">Patient</TableHead>
            <TableHead className="font-medium">Contact</TableHead>
            <TableHead className="font-medium">Details</TableHead>
            <TableHead className="font-medium">Location</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">Visits</TableHead>
            <TableHead className="font-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow
              key={patient.id}
              className="group hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onView(patient)}
            >
              <TableCell>
                <div>
                  <div className="font-medium">{patient.full_name}</div>
                  <div className="text-xs text-muted-foreground">{patient.patient_id}</div>
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{patient.mobile_primary}</span>
                  </div>
                  {patient.email && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="truncate max-w-[150px]">{patient.email}</span>
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className={getGenderColor(patient.gender)} variant="secondary">
                    {patient.gender}
                  </Badge>
                  <Badge variant="outline">{patient.age}y</Badge>
                  {patient.blood_group && (
                    <Badge variant="outline" className="text-rose-600 border-rose-200">
                      {patient.blood_group}
                    </Badge>
                  )}
                  {patient.is_insurance_valid && (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                      Insured
                    </Badge>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="text-sm">
                  {patient.city && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{patient.city}</span>
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <Badge className={getStatusColor(patient.status)} variant="secondary">
                  {patient.status}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">{patient.total_visits} visits</div>
                  <div className="text-xs text-muted-foreground">
                    {patient.last_visit_date ? formatDate(patient.last_visit_date) : 'No visits yet'}
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(patient); }}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(patient); }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(patient); }}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {patientToDelete?.full_name}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
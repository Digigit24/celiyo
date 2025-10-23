// src/components/DoctorsTable.tsx
import { useState } from 'react';
import type { Doctor } from '@/types/doctor.types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Eye, Edit, Trash2, Phone, Mail, Calendar, Award } from 'lucide-react';
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
import { deleteDoctor } from '@/services/doctor.service';
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

interface DoctorsTableProps {
  doctors: Doctor[];
  isLoading: boolean;
  onEdit: (doctor: Doctor) => void;
  onView: (doctor: Doctor) => void;
  onRefresh: () => void;
}

export default function DoctorsTable({ doctors, isLoading, onEdit, onView, onRefresh }: DoctorsTableProps) {
  const isMobile = useIsMobile();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!doctorToDelete) return;

    setIsDeleting(true);
    try {
      await deleteDoctor(doctorToDelete.id);
      toast.success('Doctor deleted successfully');
      onRefresh();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete doctor');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'on_leave':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getLicenseStatusColor = (isValid: boolean | null) => {
    if (isValid === null) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
    return isValid
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return '-';
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return `₹${num.toLocaleString('en-IN')}`;
  };

  if (doctors.length === 0 && !isLoading) {
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-foreground mb-1">No doctors found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your filters or search criteria</p>
        </div>
      </div>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="p-4 space-y-3">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-card border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base">Dr. {doctor.full_name}</h3>
                  <Badge className={getStatusColor(doctor.status)} variant="secondary">
                    {doctor.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{doctor.medical_license_number}</p>
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
                  <DropdownMenuItem onClick={() => onView(doctor)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(doctor)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(doctor)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2 text-sm">
              {/* Specialties */}
              <div className="flex flex-wrap gap-1.5">
                {doctor.specialties.map((specialty) => (
                  <Badge key={specialty.id} variant="outline" className="text-xs">
                    {specialty.name}
                  </Badge>
                ))}
              </div>

              {/* User Info */}
              {doctor.user.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{doctor.user.email}</span>
                </div>
              )}

              {/* Experience & Fees */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Award className="h-3.5 w-3.5" />
                <span>{doctor.years_of_experience} years exp</span>
                <span className="text-xs">• {formatCurrency(doctor.consultation_fee)}</span>
              </div>

              {/* Availability */}
              <div className="flex flex-wrap gap-1.5">
                {doctor.is_available_online && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    Online
                  </Badge>
                )}
                {doctor.is_available_offline && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    Offline
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-2 border-t text-xs">
                <span className="text-muted-foreground">
                  {doctor.total_consultations} consultations
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-amber-500">⭐</span>
                  <span>{parseFloat(doctor.average_rating).toFixed(1)}</span>
                  <span className="text-muted-foreground">({doctor.total_reviews})</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Doctor</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete Dr. {doctorToDelete?.full_name}? This action cannot be
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
            <TableHead className="font-medium">Doctor</TableHead>
            <TableHead className="font-medium">Specialties</TableHead>
            <TableHead className="font-medium">Contact</TableHead>
            <TableHead className="font-medium">Experience</TableHead>
            <TableHead className="font-medium">Fees</TableHead>
            <TableHead className="font-medium">Availability</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map((doctor) => (
            <TableRow
              key={doctor.id}
              className="group hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onView(doctor)}
            >
              <TableCell>
                <div>
                  <div className="font-medium">Dr. {doctor.full_name}</div>
                  <div className="text-xs text-muted-foreground">{doctor.medical_license_number}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-amber-400 text-xs">⭐</span>
                    <span className="text-xs font-medium">{parseFloat(doctor.average_rating).toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({doctor.total_reviews})</span>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {doctor.specialties.map((specialty) => (
                    <Badge key={specialty.id} variant="outline" className="text-xs">
                      {specialty.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  {doctor.user.email && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="truncate max-w-[150px]">{doctor.user.email}</span>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {doctor.consultation_duration} min slots
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="text-sm">
                  <div className="flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{doctor.years_of_experience} years</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {doctor.total_consultations} consultations
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">{formatCurrency(doctor.consultation_fee)}</div>
                  <div className="text-xs text-muted-foreground">
                    Follow-up: {formatCurrency(doctor.follow_up_fee)}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {doctor.is_available_online && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      Online
                    </Badge>
                  )}
                  {doctor.is_available_offline && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      Offline
                    </Badge>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  <Badge className={getStatusColor(doctor.status)} variant="secondary">
                    {doctor.status.replace('_', ' ')}
                  </Badge>
                  {doctor.is_license_valid !== null && (
                    <Badge className={getLicenseStatusColor(doctor.is_license_valid)} variant="outline">
                      {doctor.is_license_valid ? 'Valid License' : 'Expired License'}
                    </Badge>
                  )}
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
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(doctor); }}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(doctor); }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(doctor); }}
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
            <AlertDialogTitle>Delete Doctor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete Dr. {doctorToDelete?.full_name}? This action cannot be
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
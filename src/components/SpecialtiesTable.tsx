// src/components/SpecialtiesTable.tsx
import { useState } from 'react';
import type { Specialty } from '@/types/doctor.types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Eye, Edit, Trash2, Users, Calendar } from 'lucide-react';
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
import { deleteSpecialty } from '@/services/doctor.service';
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

interface SpecialtiesTableProps {
  specialties: Specialty[];
  isLoading: boolean;
  onEdit: (specialty: Specialty) => void;
  onView: (specialty: Specialty) => void;
  onRefresh: () => void;
}

export default function SpecialtiesTable({ 
  specialties, 
  isLoading, 
  onEdit, 
  onView, 
  onRefresh 
}: SpecialtiesTableProps) {
  const isMobile = useIsMobile();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [specialtyToDelete, setSpecialtyToDelete] = useState<Specialty | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (specialty: Specialty) => {
    setSpecialtyToDelete(specialty);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!specialtyToDelete) return;

    setIsDeleting(true);
    try {
      await deleteSpecialty(specialtyToDelete.id);
      toast.success('Specialty deleted successfully');
      onRefresh();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete specialty');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return '-';
    }
  };

  if (specialties.length === 0 && !isLoading) {
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-foreground mb-1">No specialties found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your filters or create a new specialty</p>
        </div>
      </div>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="p-4 space-y-3">
        {specialties.map((specialty) => (
          <div
            key={specialty.id}
            className="bg-card border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base">{specialty.name}</h3>
                  <Badge className={getStatusColor(specialty.is_active)} variant="secondary">
                    {specialty.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{specialty.code}</p>
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
                  <DropdownMenuItem onClick={() => onView(specialty)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(specialty)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(specialty)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2 text-sm">
              {specialty.description && (
                <p className="text-muted-foreground line-clamp-2">{specialty.description}</p>
              )}

              {specialty.department && (
                <div className="text-muted-foreground">
                  Department: {specialty.department}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {specialty.doctors_count || 0} doctors
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2 border-t text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(specialty.created_at)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Specialty</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {specialtyToDelete?.name}? This action cannot be
                undone. All doctors linked to this specialty will be unlinked.
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

  // Desktop Table View
  return (
    <div className="w-full">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow className="hover:bg-transparent border-b">
            <TableHead className="font-medium">Specialty</TableHead>
            <TableHead className="font-medium">Code</TableHead>
            <TableHead className="font-medium">Department</TableHead>
            <TableHead className="font-medium">Description</TableHead>
            <TableHead className="font-medium">Doctors</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">Created</TableHead>
            <TableHead className="font-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {specialties.map((specialty) => (
            <TableRow
              key={specialty.id}
              className="group hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onView(specialty)}
            >
              <TableCell>
                <div className="font-medium">{specialty.name}</div>
              </TableCell>

              <TableCell>
                <Badge variant="outline" className="font-mono text-xs">
                  {specialty.code}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {specialty.department || '-'}
                </div>
              </TableCell>

              <TableCell>
                <div className="text-sm text-muted-foreground max-w-xs truncate">
                  {specialty.description || '-'}
                </div>
              </TableCell>

              <TableCell>
                <Badge variant="outline" className="gap-1">
                  <Users className="h-3 w-3" />
                  {specialty.doctors_count || 0}
                </Badge>
              </TableCell>

              <TableCell>
                <Badge className={getStatusColor(specialty.is_active)} variant="secondary">
                  {specialty.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {formatDate(specialty.created_at)}
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
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(specialty); }}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(specialty); }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(specialty); }}
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
            <AlertDialogTitle>Delete Specialty</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {specialtyToDelete?.name}? This action cannot be
              undone. All doctors linked to this specialty will be unlinked.
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
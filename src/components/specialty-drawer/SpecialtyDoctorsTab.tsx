// src/components/specialty-drawer/SpecialtyDoctorsTab.tsx
import { useEffect, useState } from 'react';
import { Loader2, UserPlus, Trash2, Mail, Phone, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { getDoctorsBySpecialty } from '@/services/doctor.service';
import type { Doctor } from '@/types/doctor.types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SpecialtyDoctorsTabProps {
  specialtyId: number;
  specialtyName: string;
  readOnly?: boolean;
  onUpdate?: () => void;
}

export default function SpecialtyDoctorsTab({
  specialtyId,
  specialtyName,
  readOnly = false,
  onUpdate,
}: SpecialtyDoctorsTabProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorToRemove, setDoctorToRemove] = useState<Doctor | null>(null);

  // Fetch doctors for this specialty
  useEffect(() => {
    fetchDoctors();
  }, [specialtyId]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await getDoctorsBySpecialty(specialtyId);
      setDoctors(data);
    } catch (error: any) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors for this specialty');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDoctor = async () => {
    if (!doctorToRemove) return;

    try {
      // TODO: Implement API call to remove doctor from specialty
      // await removeDoctorFromSpecialty(doctorToRemove.id, specialtyId);
      
      toast.success(`${doctorToRemove.full_name} removed from ${specialtyName}`);
      setDoctorToRemove(null);
      fetchDoctors();
      onUpdate?.();
    } catch (error: any) {
      console.error('Error removing doctor:', error);
      toast.error('Failed to remove doctor from specialty');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Stethoscope className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Doctors Found</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            There are no doctors currently assigned to the {specialtyName} specialty.
          </p>
          {!readOnly && (
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Doctor
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Doctors in {specialtyName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {doctors.length} {doctors.length === 1 ? 'doctor' : 'doctors'} found
          </p>
        </div>
        {!readOnly && (
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Doctor
          </Button>
        )}
      </div>

      {/* Doctors List */}
      <div className="space-y-3">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <Avatar className="h-16 w-16">
                  <AvatarImage 
                    src={doctor.user.profile_picture || undefined} 
                    alt={doctor.full_name}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {getInitials(doctor.full_name)}
                  </AvatarFallback>
                </Avatar>

                {/* Doctor Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-semibold text-lg">
                        Dr. {doctor.full_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {doctor.qualifications || 'No qualifications listed'}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(doctor.status)}
                    >
                      {formatStatus(doctor.status)}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-4 mb-3 text-sm">
                    {doctor.user.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{doctor.user.email}</span>
                      </div>
                    )}
                    {doctor.user.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{doctor.user.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Experience: </span>
                      <span className="font-medium">
                        {doctor.years_of_experience} years
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fee: </span>
                      <span className="font-medium">₹{doctor.consultation_fee}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rating: </span>
                      <span className="font-medium">
                        {parseFloat(doctor.average_rating).toFixed(1)} ⭐
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Consultations: </span>
                      <span className="font-medium">
                        {doctor.total_consultations}
                      </span>
                    </div>
                  </div>

                  {/* Specialties */}
                  {doctor.specialties.length > 1 && (
                    <div className="mt-3">
                      <span className="text-sm text-muted-foreground">
                        Other Specialties:{' '}
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {doctor.specialties
                          .filter(s => s.id !== specialtyId)
                          .map(specialty => (
                            <Badge 
                              key={specialty.id} 
                              variant="secondary"
                              className="text-xs"
                            >
                              {specialty.name}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Availability Badges */}
                  <div className="flex gap-2 mt-3">
                    {doctor.is_available_online && (
                      <Badge variant="outline" className="text-xs">
                        Online
                      </Badge>
                    )}
                    {doctor.is_available_offline && (
                      <Badge variant="outline" className="text-xs">
                        In-Person
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {!readOnly && (
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDoctorToRemove(doctor)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog 
        open={!!doctorToRemove} 
        onOpenChange={() => setDoctorToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Doctor from Specialty</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove Dr. {doctorToRemove?.full_name} from the{' '}
              {specialtyName} specialty? This action can be undone by adding them back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveDoctor}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
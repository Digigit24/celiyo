// src/components/opd/visit-drawer/VisitBasicInfo.tsx
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Search, User, Calendar, Phone, Mail, MapPin, Loader2, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { getPatients, createPatient } from '@/services/patient.service';
import { getDoctors } from '@/services/doctor.service';
import { createVisit, updateVisit } from '@/services/opd/visit.service';
import type { Visit, VisitType, VisitStatus, VisitCreateData } from '@/types/opd/visit.types';
import type { PatientProfile, PatientGender, PatientCreateData } from '@/types/patient.types';
import type { Doctor } from '@/types/doctor.types';

// ==================== SCHEMAS ====================
const visitFormSchema = z.object({
  patient: z.number().min(1, 'Patient is required'),
  visit_type: z.enum(['new', 'follow_up', 'emergency']),
  doctor: z.number().optional().nullable(),
  appointment: z.number().optional().nullable(),
  is_follow_up: z.boolean().optional(),
  referred_by: z.number().optional().nullable(),
  status: z.enum(['waiting', 'called', 'in_consultation', 'completed', 'cancelled', 'no_show']).optional(),
  queue_position: z.number().optional().nullable(),
});

const quickPatientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  mobile_primary: z.string().min(10, 'Valid mobile number is required'),
  email: z.string().email().optional().or(z.literal('')),
  city: z.string().optional(),
});

type VisitFormData = z.infer<typeof visitFormSchema>;
type QuickPatientFormData = z.infer<typeof quickPatientSchema>;

export interface VisitBasicInfoRef {
  submitForm: () => Promise<void>;
}

interface VisitBasicInfoProps {
  visit: Visit | null;
  mode: 'view' | 'edit' | 'create';
  onSuccess: () => void;
  onSaveStart?: () => void;
  onSaveEnd?: () => void;
}

const VisitBasicInfo = forwardRef<VisitBasicInfoRef, VisitBasicInfoProps>(
  ({ visit, mode, onSuccess, onSaveStart, onSaveEnd }, ref) => {
    // ==================== STATE ====================
    const [patients, setPatients] = useState<PatientProfile[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
    const [isLoadingPatients, setIsLoadingPatients] = useState(false);
    const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
    const [patientSearchOpen, setPatientSearchOpen] = useState(false);
    const [showQuickCreate, setShowQuickCreate] = useState(false);
    const [isCreatingPatient, setIsCreatingPatient] = useState(false);

    // ==================== FORMS ====================
    const visitForm = useForm<VisitFormData>({
      resolver: zodResolver(visitFormSchema),
      defaultValues: {
        patient: visit?.patient || 0,
        visit_type: visit?.visit_type || 'new',
        doctor: visit?.doctor || null,
        appointment: visit?.appointment || null,
        is_follow_up: visit?.is_follow_up || false,
        referred_by: visit?.referred_by || null,
        status: visit?.status || 'waiting',
        queue_position: visit?.queue_position || null,
      },
    });

    const quickPatientForm = useForm<QuickPatientFormData>({
      resolver: zodResolver(quickPatientSchema),
      defaultValues: {
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: 'male',
        mobile_primary: '',
        email: '',
        city: '',
      },
    });

    // ==================== EFFECTS ====================
    useEffect(() => {
      if (mode === 'create' && !visit) {
        loadPatients();
        loadDoctors();
      }
    }, [mode, visit]);

    useEffect(() => {
      if (visit?.patient) {
        // Find and set the selected patient
        loadPatients(visit.patient);
      }
    }, [visit]);

    // ==================== PATIENT LOADING ====================
    const loadPatients = async (selectedPatientId?: number) => {
      setIsLoadingPatients(true);
      try {
        const response = await getPatients({ page_size: 100 });
        setPatients(response.results);
        
        if (selectedPatientId) {
          const patient = response.results.find(p => p.id === selectedPatientId);
          if (patient) {
            setSelectedPatient(patient);
          }
        }
      } catch (error: any) {
        console.error('Error loading patients:', error);
      } finally {
        setIsLoadingPatients(false);
      }
    };

    // ==================== DOCTOR LOADING ====================
    const loadDoctors = async () => {
      setIsLoadingDoctors(true);
      try {
        const response = await getDoctors({ is_active: true, page_size: 100 });
        setDoctors(response.results || []);
      } catch (error: any) {
        console.error('Error loading doctors:', error);
        toast.error('Failed to load doctors');
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    // ==================== PATIENT SELECTION ====================
    const handlePatientSelect = (patient: PatientProfile) => {
      setSelectedPatient(patient);
      visitForm.setValue('patient', patient.id);
      setPatientSearchOpen(false);
    };

    // ==================== QUICK PATIENT CREATE ====================
    const handleQuickPatientCreate = async (data: QuickPatientFormData) => {
      setIsCreatingPatient(true);
      onSaveStart?.();
      
      try {
        const patientData: PatientCreateData = {
          first_name: data.first_name,
          last_name: data.last_name,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          mobile_primary: data.mobile_primary,
          email: data.email,
          city: data.city,
          country: 'India',
        };
        
        const newPatient = await createPatient(patientData);
        
        toast.success('Patient registered successfully', {
          description: `${newPatient.full_name} has been added to the system`,
        });

        // Add to patients list and select
        setPatients(prev => [newPatient, ...prev]);
        setSelectedPatient(newPatient);
        visitForm.setValue('patient', newPatient.id);
        
        // Close quick create form
        setShowQuickCreate(false);
        quickPatientForm.reset();
        
      } catch (error: any) {
        toast.error('Failed to register patient', {
          description: error?.response?.data?.message || error?.message || 'Please try again',
        });
        throw error;
      } finally {
        setIsCreatingPatient(false);
        onSaveEnd?.();
      }
    };

    // ==================== VISIT SUBMISSION ====================
    const handleSubmit = async (data: VisitFormData) => {
      onSaveStart?.();
      
      try {
        // Convert form data to API format
        const apiData: VisitCreateData = {
          patient: data.patient,
          visit_type: data.visit_type,
          is_follow_up: data.is_follow_up,
          doctor: data.doctor || undefined,
          appointment: data.appointment || undefined,
          referred_by: data.referred_by || undefined,
          status: data.status,
          queue_position: data.queue_position || undefined,
        };

        if (mode === 'create') {
          await createVisit(apiData);
          toast.success('Visit created successfully');
        } else if (mode === 'edit' && visit?.id) {
          await updateVisit(visit.id, apiData);
          toast.success('Visit updated successfully');
        }
        
        onSuccess();
      } catch (error: any) {
        toast.error(`Failed to ${mode === 'create' ? 'create' : 'update'} visit`, {
          description: error?.response?.data?.message || error?.message || 'Please try again',
        });
        throw error;
      } finally {
        onSaveEnd?.();
      }
    };

    // Expose submit method via ref
    useImperativeHandle(ref, () => ({
      submitForm: async () => {
        await visitForm.handleSubmit(handleSubmit)();
      },
    }));

    const isReadOnly = mode === 'view';

    // ==================== RENDER ====================
    return (
      <div className="space-y-6">
        {/* Patient Selection Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === 'create' 
                  ? 'Select or register a patient for this visit'
                  : 'Patient details for this visit'
                }
              </p>
            </div>
          </div>

          {mode === 'create' && !showQuickCreate && (
            <>
              {/* Patient Search/Select */}
              <div className="space-y-3">
                <Label>Select Patient *</Label>
                <Popover open={patientSearchOpen} onOpenChange={setPatientSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={patientSearchOpen}
                      className="w-full justify-between h-auto min-h-[44px] py-2"
                    >
                      {selectedPatient ? (
                        <div className="flex items-start gap-3 text-left flex-1">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{selectedPatient.full_name}</div>
                            <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {selectedPatient.mobile_primary}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {selectedPatient.age}y • {selectedPatient.gender}
                              </span>
                              {selectedPatient.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {selectedPatient.city}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Search className="h-4 w-4" />
                          Search for a patient...
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search by name, phone, or ID..." />
                      <CommandList>
                        {/* Register New Patient - Always at Top */}
                        <div className="border-b p-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              setPatientSearchOpen(false);
                              setShowQuickCreate(true);
                            }}
                            className="w-full gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Register New Patient
                          </Button>
                        </div>

                        <CommandEmpty>
                          <div className="py-6 text-center">
                            <p className="text-sm text-muted-foreground mb-3">
                              No patients found matching your search
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Try adjusting your search or register a new patient above
                            </p>
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          {patients.map((patient) => (
                            <CommandItem
                              key={patient.id}
                              value={`${patient.full_name} ${patient.mobile_primary} ${patient.patient_id}`}
                              onSelect={() => handlePatientSelect(patient)}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-3 py-2 w-full">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                                  <User className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{patient.full_name}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {patient.patient_id}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                                    <span>{patient.mobile_primary}</span>
                                    <span>•</span>
                                    <span>{patient.age}y • {patient.gender}</span>
                                    {patient.city && (
                                      <>
                                        <span>•</span>
                                        <span>{patient.city}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {visitForm.formState.errors.patient && (
                  <p className="text-sm text-destructive">
                    {visitForm.formState.errors.patient.message}
                  </p>
                )}
              </div>

              {selectedPatient && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPatient(null);
                    visitForm.setValue('patient', 0);
                  }}
                >
                  Change Patient
                </Button>
              )}
            </>
          )}

          {/* Quick Patient Creation Form */}
          {showQuickCreate && mode === 'create' && (
            <div className="border rounded-lg p-6 space-y-6 bg-muted/30">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Quick Patient Registration
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Register a new patient to create this visit
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowQuickCreate(false);
                    quickPatientForm.reset();
                  }}
                >
                  Cancel
                </Button>
              </div>

              <form onSubmit={quickPatientForm.handleSubmit(handleQuickPatientCreate)} className="space-y-6">
                {/* Personal Info */}
                <div>
                  <h5 className="text-sm font-medium mb-3">Personal Information</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="qp_first_name">First Name *</Label>
                      <Input
                        id="qp_first_name"
                        {...quickPatientForm.register('first_name')}
                        placeholder="Enter first name"
                        disabled={isCreatingPatient}
                      />
                      {quickPatientForm.formState.errors.first_name && (
                        <p className="text-sm text-destructive mt-1">
                          {quickPatientForm.formState.errors.first_name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="qp_last_name">Last Name *</Label>
                      <Input
                        id="qp_last_name"
                        {...quickPatientForm.register('last_name')}
                        placeholder="Enter last name"
                        disabled={isCreatingPatient}
                      />
                      {quickPatientForm.formState.errors.last_name && (
                        <p className="text-sm text-destructive mt-1">
                          {quickPatientForm.formState.errors.last_name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="qp_dob">Date of Birth *</Label>
                      <Input
                        id="qp_dob"
                        type="date"
                        {...quickPatientForm.register('date_of_birth')}
                        disabled={isCreatingPatient}
                      />
                      {quickPatientForm.formState.errors.date_of_birth && (
                        <p className="text-sm text-destructive mt-1">
                          {quickPatientForm.formState.errors.date_of_birth.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="qp_gender">Gender *</Label>
                      <Select
                        value={quickPatientForm.watch('gender')}
                        onValueChange={(value: PatientGender) =>
                          quickPatientForm.setValue('gender', value)
                        }
                        disabled={isCreatingPatient}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h5 className="text-sm font-medium mb-3">Contact Information</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="qp_mobile">Mobile Number *</Label>
                      <Input
                        id="qp_mobile"
                        {...quickPatientForm.register('mobile_primary')}
                        placeholder="10-digit mobile number"
                        disabled={isCreatingPatient}
                      />
                      {quickPatientForm.formState.errors.mobile_primary && (
                        <p className="text-sm text-destructive mt-1">
                          {quickPatientForm.formState.errors.mobile_primary.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="qp_email">Email (Optional)</Label>
                      <Input
                        id="qp_email"
                        type="email"
                        {...quickPatientForm.register('email')}
                        placeholder="email@example.com"
                        disabled={isCreatingPatient}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="qp_city">City (Optional)</Label>
                      <Input
                        id="qp_city"
                        {...quickPatientForm.register('city')}
                        placeholder="Enter city"
                        disabled={isCreatingPatient}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={isCreatingPatient}
                    className="gap-2"
                  >
                    {isCreatingPatient ? 'Registering...' : (
                      <>
                        <Plus className="h-4 w-4" />
                        Register & Continue
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowQuickCreate(false);
                      quickPatientForm.reset();
                    }}
                    disabled={isCreatingPatient}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Display selected patient in view/edit mode */}
          {mode !== 'create' && visit && (
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{visit.patient_name}</div>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                    {visit.patient_details && (
                      <>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {visit.patient_details.mobile}
                        </span>
                        <span>{visit.patient_details.age}y • {visit.patient_details.gender}</span>
                        {visit.patient_details.blood_group && (
                          <Badge variant="secondary">{visit.patient_details.blood_group}</Badge>
                        )}
                      </>
                    )}
                    {visit.patient_id && (
                      <Badge variant="outline">{visit.patient_id}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Visit Details Form */}
        <form onSubmit={visitForm.handleSubmit(handleSubmit)} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Visit Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Visit Type */}
              <div>
                <Label htmlFor="visit_type">Visit Type *</Label>
                <Select
                  value={visitForm.watch('visit_type')}
                  onValueChange={(value: VisitType) =>
                    visitForm.setValue('visit_type', value)
                  }
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Visit</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Doctor Selection */}
              <div>
                <Label htmlFor="doctor">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Assigned Doctor
                  </div>
                </Label>
                <Select
                  disabled={isLoadingDoctors || isReadOnly}
                  value={visitForm.watch('doctor')?.toString() || 'none'}
                  onValueChange={(value) => visitForm.setValue('doctor', value === 'none' ? null : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingDoctors ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <SelectItem value="none">
                          <span className="text-muted-foreground">No doctor assigned</span>
                        </SelectItem>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">Dr. {doctor.full_name}</span>
                              {doctor.specialties && doctor.specialties.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {doctor.specialties.join(', ')}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Status - Only in Edit/View mode */}
              {mode !== 'create' && (
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={visitForm.watch('status')}
                    onValueChange={(value: VisitStatus) =>
                      visitForm.setValue('status', value)
                    }
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="waiting">Waiting</SelectItem>
                      <SelectItem value="called">Called</SelectItem>
                      <SelectItem value="in_consultation">In Consultation</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no_show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Visit Metadata - Show in view/edit mode */}
          {visit && mode !== 'create' && (
            <div className="border rounded-lg p-4 bg-muted/30 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Visit Number:</span>
                  <p className="font-medium">{visit.visit_number}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Visit Date:</span>
                  <p className="font-medium">{new Date(visit.visit_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Entry Time:</span>
                  <p className="font-medium">{new Date(visit.entry_time).toLocaleTimeString()}</p>
                </div>
                {visit.doctor_name && (
                  <div>
                    <span className="text-muted-foreground">Doctor:</span>
                    <p className="font-medium flex items-center gap-1">
                      <Stethoscope className="h-3.5 w-3.5" />
                      Dr. {visit.doctor_name}
                    </p>
                  </div>
                )}
                {visit.doctor_details && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Specialties:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {visit.doctor_details.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {visit.queue_position && (
                  <div>
                    <span className="text-muted-foreground">Queue Position:</span>
                    <p className="font-medium">#{visit.queue_position}</p>
                  </div>
                )}
                {visit.doctor_name && (
                  <div>
                    <span className="text-muted-foreground">Doctor:</span>
                    <p className="font-medium">{visit.doctor_name}</p>
                  </div>
                )}
                {visit.referred_by_name && (
                  <div>
                    <span className="text-muted-foreground">Referred By:</span>
                    <p className="font-medium">{visit.referred_by_name}</p>
                  </div>
                )}
              </div>

              {/* Payment Info */}
              {(visit.total_amount || visit.payment_status) && (
                <>
                  <Separator className="my-3" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Amount:</span>
                      <p className="font-medium">₹{visit.total_amount}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Payment Status:</span>
                      <Badge 
                        variant={
                          visit.payment_status === 'paid' ? 'default' :
                          visit.payment_status === 'partial' ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {visit.payment_status}
                      </Badge>
                    </div>
                    {visit.balance_amount && parseFloat(visit.balance_amount) > 0 && (
                      <div>
                        <span className="text-muted-foreground">Balance:</span>
                        <p className="font-medium text-destructive">₹{visit.balance_amount}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </form>
      </div>
    );
  }
);

VisitBasicInfo.displayName = 'VisitBasicInfo';

export default VisitBasicInfo;
// src/components/opd/VisitFormDrawer.tsx
import { useState, useEffect } from 'react';
import { useCreateVisit, useUpdateVisit } from '@/hooks/useOPD';
import { usePatients } from '@/hooks/usePatients';
import type { Visit, VisitCreateData, VisitType } from '@/types/opd.types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Loader2, Search, User, Plus, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VisitFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visit?: Visit | null;
  mode?: 'create' | 'edit';
  onSuccess?: () => void;
}

export default function VisitFormDrawer({
  open,
  onOpenChange,
  visit,
  mode = 'create',
  onSuccess,
}: VisitFormDrawerProps) {
  const [activeTab, setActiveTab] = useState('patient');
  const [searchQuery, setSearchQuery] = useState('');
  const [patientOpen, setPatientOpen] = useState(false);
  
  // Form state
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    visit?.patient || null
  );
  const [doctorId, setDoctorId] = useState<number | null>(visit?.doctor || null);
  const [visitType, setVisitType] = useState<VisitType>(visit?.visit_type || 'new');
  const [isFollowUp, setIsFollowUp] = useState(visit?.is_follow_up || false);

  // Fetch patients for selection
  const { patients, isLoading: loadingPatients } = usePatients({
    search: searchQuery,
    status: 'active',
    page: 1,
  });

  // Mutations
  const { createVisit, isCreating } = useCreateVisit();
  const { updateVisit, isUpdating } = useUpdateVisit(visit?.id || 0);

  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (open && visit) {
      setSelectedPatientId(visit.patient);
      setDoctorId(visit.doctor);
      setVisitType(visit.visit_type);
      setIsFollowUp(visit.is_follow_up);
    } else if (open && !visit) {
      // Reset form for new visit
      setSelectedPatientId(null);
      setDoctorId(null);
      setVisitType('new');
      setIsFollowUp(false);
    }
  }, [open, visit]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const handleSubmit = async () => {
    if (!selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }

    try {
      const data: VisitCreateData = {
        patient: selectedPatientId,
        visit_type: visitType,
        is_follow_up: isFollowUp,
        ...(doctorId && { doctor: doctorId }),
      };

      if (mode === 'create') {
        await createVisit(data);
        toast.success('Visit created successfully');
      } else if (visit) {
        await updateVisit(data);
        toast.success('Visit updated successfully');
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save visit');
    }
  };

  const handleClose = () => {
    setActiveTab('patient');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>
            {mode === 'create' ? 'Register New Visit' : 'Edit Visit'}
          </SheetTitle>
          <SheetDescription>
            {mode === 'create'
              ? 'Select a patient and configure visit details'
              : 'Update visit information'}
          </SheetDescription>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="patient">Patient Selection</TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedPatientId}>
              Visit Details
            </TabsTrigger>
          </TabsList>

          {/* Patient Selection Tab */}
          <TabsContent value="patient" className="mt-6 space-y-6">
            {/* Selected Patient Display */}
            {selectedPatient && (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {selectedPatient.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground font-mono">
                        {selectedPatient.patient_id}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">
                          {selectedPatient.age}y, {selectedPatient.gender}
                        </Badge>
                        {selectedPatient.blood_group && (
                          <Badge variant="outline" className="text-rose-600">
                            {selectedPatient.blood_group}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        📞 {selectedPatient.mobile_primary}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPatientId(null)}
                  >
                    Change
                  </Button>
                </div>
              </Card>
            )}

            {/* Patient Search */}
            {!selectedPatient && (
              <div className="space-y-4">
                <div>
                  <Label>Search Patient</Label>
                  <Popover open={patientOpen} onOpenChange={setPatientOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={patientOpen}
                        className="w-full justify-between"
                      >
                        {selectedPatientId
                          ? patients.find((p) => p.id === selectedPatientId)?.full_name
                          : 'Select patient...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Search by name, ID, or phone..."
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                        />
                        <CommandEmpty>
                          {loadingPatients ? (
                            <div className="flex items-center justify-center py-6">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : (
                            'No patient found.'
                          )}
                        </CommandEmpty>
                        <CommandGroup>
                          <ScrollArea className="h-[300px]">
                            {patients.map((patient) => (
                              <CommandItem
                                key={patient.id}
                                value={`${patient.full_name} ${patient.patient_id} ${patient.mobile_primary}`}
                                onSelect={() => {
                                  setSelectedPatientId(patient.id);
                                  setPatientOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    selectedPatientId === patient.id
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                <div className="flex-1">
                                  <div className="font-medium">{patient.full_name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {patient.patient_id} • {patient.mobile_primary}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Badge variant="outline" className="text-xs">
                                    {patient.age}y
                                  </Badge>
                                  {patient.blood_group && (
                                    <Badge variant="outline" className="text-xs text-rose-600">
                                      {patient.blood_group}
                                    </Badge>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </ScrollArea>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={() => {
                  // TODO: Open patient registration drawer
                  toast.info('Patient registration coming soon');
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Register New Patient
                </Button>
              </div>
            )}

            {selectedPatient && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={() => setActiveTab('details')}>
                  Next: Visit Details
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Visit Details Tab */}
          <TabsContent value="details" className="mt-6 space-y-6">
            {/* Visit Type */}
            <div className="space-y-2">
              <Label htmlFor="visit_type">Visit Type *</Label>
              <Select
                value={visitType}
                onValueChange={(value) => setVisitType(value as VisitType)}
              >
                <SelectTrigger id="visit_type">
                  <SelectValue placeholder="Select visit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Visit</SelectItem>
                  <SelectItem value="follow_up">Follow-up Visit</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Doctor Selection */}
            <div className="space-y-2">
              <Label htmlFor="doctor">Assign Doctor (Optional)</Label>
              <Select
                value={doctorId?.toString() || 'none'}
                onValueChange={(value) => setDoctorId(value === 'none' ? null : parseInt(value))}
              >
                <SelectTrigger id="doctor">
                  <SelectValue placeholder="Select doctor (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Doctor Assigned</SelectItem>
                  {/* TODO: Load from doctors API */}
                  <SelectItem value="1">Dr. Rajesh Sharma</SelectItem>
                  <SelectItem value="2">Dr. Priya Patel</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                You can assign a doctor now or later
              </p>
            </div>

            {/* Follow-up checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_follow_up"
                checked={isFollowUp}
                onChange={(e) => setIsFollowUp(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_follow_up" className="text-sm font-normal cursor-pointer">
                This is a follow-up visit for a previous consultation
              </Label>
            </div>

            {/* Summary */}
            <Card className="p-4 bg-muted/50">
              <h3 className="font-semibold mb-3">Visit Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient:</span>
                  <span className="font-medium">{selectedPatient?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visit Type:</span>
                  <Badge variant="outline">
                    {visitType === 'new' && 'New Visit'}
                    {visitType === 'follow_up' && 'Follow-up'}
                    {visitType === 'emergency' && 'Emergency'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Follow-up:</span>
                  <span>{isFollowUp ? 'Yes' : 'No'}</span>
                </div>
                {doctorId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Doctor:</span>
                    <span>Assigned</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Register Visit' : 'Update Visit'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
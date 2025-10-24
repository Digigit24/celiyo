// src/components/consultation/ConsultationTab.tsx
import { useState, useEffect } from 'react';
import type { Visit } from '@/types/opd.types';
import type { PatientDetail, PatientVitals, PatientAllergy } from '@/types/patient.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { AlertCircle, Activity, Pill, Plus, FileText, Stethoscope, Paperclip } from 'lucide-react';
import { getPatientVitals, getPatientAllergies } from '@/services/patient.service';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useClinicalNotes, useVisitFindings, useVisitAttachments } from '@/hooks/useOPD';

// Sub-components
import ClinicalNotesList from './ClinicalNotesList';
import ClinicalNoteForm from './ClinicalNoteForm';
import VisitFindingsList from './VisitFindingsList';
import VisitFindingForm from './VisitFindingForm';
import AttachmentsList from './AttachmentsList';
import AttachmentUploadForm from './AttachmentUploadForm';

interface ConsultationTabProps {
  visit: Visit;
  patient: PatientDetail;
}

export default function ConsultationTab({ visit, patient }: ConsultationTabProps) {
  const [vitals, setVitals] = useState<PatientVitals[]>([]);
  const [allergies, setAllergies] = useState<PatientAllergy[]>([]);
  const [loadingVitals, setLoadingVitals] = useState(false);
  const [loadingAllergies, setLoadingAllergies] = useState(false);

  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showFindingForm, setShowFindingForm] = useState(false);
  const [showAttachmentForm, setShowAttachmentForm] = useState(false);

  // Fetch clinical notes for this visit
  const { clinicalNotes, isLoading: notesLoading, mutate: mutateNotes } = useClinicalNotes({ 
    visit: visit.id 
  });

  // Fetch visit findings
  const { visitFindings, isLoading: findingsLoading, mutate: mutateFindings } = useVisitFindings({ 
    visit: visit.id 
  });

  // Fetch visit attachments
  const { visitAttachments, isLoading: attachmentsLoading, mutate: mutateAttachments } = useVisitAttachments({ 
    visit: visit.id 
  });

  // Load patient vitals
  useEffect(() => {
    setLoadingVitals(true);
    getPatientVitals(patient.id)
      .then((response) => setVitals(response.results.slice(0, 1))) // Get latest vitals only
      .catch((err) => {
        console.error('Failed to load vitals:', err);
        toast.error('Failed to load vitals');
      })
      .finally(() => setLoadingVitals(false));
  }, [patient.id]);

  // Load patient allergies
  useEffect(() => {
    setLoadingAllergies(true);
    getPatientAllergies(patient.id)
      .then((response) => setAllergies(response.results.filter(a => a.is_active)))
      .catch((err) => {
        console.error('Failed to load allergies:', err);
        toast.error('Failed to load allergies');
      })
      .finally(() => setLoadingAllergies(false));
  }, [patient.id]);

  const latestVitals = vitals[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT PANEL - 30% */}
      <div className="lg:col-span-4 space-y-6">
        {/* Patient Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Patient Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{patient.full_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Age/Gender:</span>
                <span className="font-medium">{patient.age}Y / {patient.gender.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Blood Group:</span>
                <span className="font-medium">{patient.blood_group || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">BMI:</span>
                <span className="font-medium">{patient.bmi || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vital Signs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingVitals ? (
              <p className="text-sm text-muted-foreground">Loading vitals...</p>
            ) : latestVitals ? (
              <div className="space-y-2">
                {latestVitals.blood_pressure && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">BP:</span>
                    <span className="font-medium">{latestVitals.blood_pressure}</span>
                  </div>
                )}
                {latestVitals.heart_rate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pulse:</span>
                    <span className="font-medium">{latestVitals.heart_rate} bpm</span>
                  </div>
                )}
                {latestVitals.temperature && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Temp:</span>
                    <span className="font-medium">{latestVitals.temperature}°F</span>
                  </div>
                )}
                {latestVitals.oxygen_saturation && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SpO2:</span>
                    <span className="font-medium">{latestVitals.oxygen_saturation}%</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Recorded: {format(new Date(latestVitals.recorded_at), 'PP p')}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No vitals recorded</p>
            )}
          </CardContent>
        </Card>

        {/* Allergies Alert */}
        <Card className={allergies.length > 0 ? 'border-destructive' : ''}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Allergies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAllergies ? (
              <p className="text-sm text-muted-foreground">Loading allergies...</p>
            ) : allergies.length > 0 ? (
              <div className="space-y-2">
                {allergies.map((allergy) => (
                  <div key={allergy.id} className="p-2 bg-destructive/10 rounded-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{allergy.allergen}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {allergy.allergy_type} • {allergy.severity}
                        </p>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        {allergy.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No known allergies</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RIGHT PANEL - 70% */}
      <div className="lg:col-span-8 space-y-6">
        {/* Current Visit Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Visit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Visit ID</p>
                <p className="font-medium font-mono">{visit.visit_number}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">{format(new Date(visit.visit_date), 'PP')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Doctor</p>
                <p className="font-medium">{visit.doctor_name || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <Badge variant="outline" className="capitalize">{visit.visit_type}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Notes Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Clinical Notes
            </CardTitle>
            <Button 
              size="sm" 
              onClick={() => setShowNoteForm(!showNoteForm)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Note
            </Button>
          </CardHeader>
          <CardContent>
            {showNoteForm && (
              <div className="mb-4">
                <ClinicalNoteForm 
                  visitId={visit.id} 
                  onSuccess={() => {
                    mutateNotes();
                    setShowNoteForm(false);
                    toast.success('Clinical note added');
                  }}
                  onCancel={() => setShowNoteForm(false)}
                />
              </div>
            )}
            <ClinicalNotesList 
              notes={clinicalNotes}
              loading={notesLoading}
              onUpdate={mutateNotes}
            />
          </CardContent>
        </Card>

        {/* Findings & Examination */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Findings & Examination
            </CardTitle>
            <Button 
              size="sm" 
              onClick={() => setShowFindingForm(!showFindingForm)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Finding
            </Button>
          </CardHeader>
          <CardContent>
            {showFindingForm && (
              <div className="mb-4">
                <VisitFindingForm 
                  visitId={visit.id}
                  onSuccess={() => {
                    mutateFindings();
                    setShowFindingForm(false);
                    toast.success('Finding added');
                  }}
                  onCancel={() => setShowFindingForm(false)}
                />
              </div>
            )}
            <VisitFindingsList 
              findings={visitFindings}
              loading={findingsLoading}
              onUpdate={mutateFindings}
            />
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Paperclip className="h-5 w-5" />
              Attachments
            </CardTitle>
            <Button 
              size="sm" 
              onClick={() => setShowAttachmentForm(!showAttachmentForm)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Upload
            </Button>
          </CardHeader>
          <CardContent>
            {showAttachmentForm && (
              <div className="mb-4">
                <AttachmentUploadForm 
                  visitId={visit.id}
                  onSuccess={() => {
                    mutateAttachments();
                    setShowAttachmentForm(false);
                    toast.success('Attachment uploaded');
                  }}
                  onCancel={() => setShowAttachmentForm(false)}
                />
              </div>
            )}
            <AttachmentsList 
              attachments={visitAttachments}
              loading={attachmentsLoading}
              onUpdate={mutateAttachments}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
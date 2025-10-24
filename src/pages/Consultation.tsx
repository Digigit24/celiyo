// src/pages/Consultation.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useVisit } from '@/hooks/useOPD';
import { getPatientById } from '@/services/patient.service';
import type { PatientDetail } from '@/types/patient.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Import tab components
import ConsultationTab from '@/components/consultation/ConsultationTab';
import BillingTab from '@/components/consultation/BillingTab';
import HistoryTab from '@/components/consultation/HistoryTab';
import ProfileTab from '@/components/consultation/ProfileTab';

export default function Consultation() {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const { visit, isLoading: visitLoading, error: visitError } = useVisit(Number(visitId));
  
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [patientLoading, setPatientLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('consultation');

  // Fetch patient details when visit is loaded
  useEffect(() => {
    if (visit?.patient) {
      setPatientLoading(true);
      getPatientById(visit.patient)
        .then((data) => setPatient(data as unknown as PatientDetail))
        .catch((err) => {
          toast.error('Failed to load patient details');
          console.error(err);
        })
        .finally(() => setPatientLoading(false));
    }
  }, [visit?.patient]);

  const isLoading = visitLoading || patientLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading consultation...</p>
        </div>
      </div>
    );
  }

  if (visitError || !visit) {
    return (
      <div className="p-8">
        <Card className="border-destructive p-6">
          <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Consultation</h3>
          <p className="text-muted-foreground mb-4">
            {visitError?.message || 'Visit not found'}
          </p>
          <Button onClick={() => navigate('/opd/visits')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Visits
          </Button>
        </Card>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8">
        <Card className="p-6">
          <p className="text-muted-foreground">Patient information not available</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/opd/visits')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Patient Profile</h1>
                <p className="text-sm text-muted-foreground">
                  Visit #{visit.visit_number}
                </p>
              </div>
            </div>
          </div>

          {/* Patient Summary Card */}
          <Card className="p-4 mb-4">
            <div className="flex items-start gap-4">
              {/* Patient Avatar */}
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
              </div>

              {/* Patient Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-xl font-bold">{patient.full_name}</h2>
                    <p className="text-sm text-muted-foreground font-mono">
                      {patient.patient_id}
                    </p>
                  </div>
                  <Badge variant={visit.status === 'in_consultation' ? 'default' : 'secondary'}>
                    {visit.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Age:</span>
                    <span className="ml-2 font-medium">{patient.age} years</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gender:</span>
                    <span className="ml-2 font-medium capitalize">{patient.gender}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Blood:</span>
                    <span className="ml-2 font-medium">{patient.blood_group || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">BMI:</span>
                    <span className="ml-2 font-medium">{patient.bmi || 'N/A'}</span>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.mobile_primary}</span>
                  </div>
                  {patient.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{patient.email}</span>
                    </div>
                  )}
                  {patient.last_visit_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Last Visit: {format(new Date(patient.last_visit_date), 'PP')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start">
              <TabsTrigger value="consultation">Consultation</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="consultation" className="mt-0">
            <ConsultationTab visit={visit} patient={patient} />
          </TabsContent>
          
          <TabsContent value="billing" className="mt-0">
            <BillingTab visit={visit} patient={patient} />
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <HistoryTab patient={patient} />
          </TabsContent>
          
          <TabsContent value="profile" className="mt-0">
            <ProfileTab patient={patient} onUpdate={(updated) => setPatient(updated)} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
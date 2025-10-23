// src/components/DoctorFormDrawer.tsx
import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getDoctorById } from '@/services/doctor.service';
import type { Doctor } from '@/types/doctor.types';
import DoctorBasicInfo from './doctor-drawer/DoctorBasicInfo';
import DoctorAvailabilityTab from './doctor-drawer/DoctorAvailabilityTab';
import DoctorStatsTab from './doctor-drawer/DoctorStatsTab';

interface DoctorFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: number | null;
  mode: 'view' | 'edit' | 'create';
  onSuccess?: () => void;
}

export default function DoctorFormDrawer({
  open,
  onOpenChange,
  doctorId,
  mode,
  onSuccess,
}: DoctorFormDrawerProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch doctor data when drawer opens
  useEffect(() => {
    if (open && doctorId && mode !== 'create') {
      fetchDoctorData();
    } else if (mode === 'create') {
      setDoctor(null);
    }
  }, [open, doctorId, mode]);

  const fetchDoctorData = async () => {
    if (!doctorId) return;
    
    setLoading(true);
    try {
      const data = await getDoctorById(doctorId);
      setDoctor(data);
    } catch (error: any) {
      toast.error('Failed to load doctor data');
      console.error('Error fetching doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    fetchDoctorData();
    onSuccess?.();
  };

  const handleClose = () => {
    setActiveTab('basic');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>
            {mode === 'create' 
              ? 'Register New Doctor' 
              : mode === 'edit'
              ? `Edit Doctor - Dr. ${doctor?.full_name || ''}`
              : `Doctor Details - Dr. ${doctor?.full_name || ''}`
            }
          </SheetTitle>
          {doctor && (
            <div className="text-sm text-muted-foreground">
              License: {doctor.medical_license_number}
            </div>
          )}
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="availability" disabled={mode === 'create'}>
                Availability
              </TabsTrigger>
              <TabsTrigger value="stats" disabled={mode === 'create'}>
                Statistics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-6">
              <DoctorBasicInfo
                doctor={doctor}
                mode={mode}
                onSuccess={handleSuccess}
                onClose={handleClose}
              />
            </TabsContent>

            <TabsContent value="availability" className="mt-6">
              {doctorId && (
                <DoctorAvailabilityTab
                  doctorId={doctorId}
                  readOnly={mode === 'view'}
                />
              )}
            </TabsContent>

            <TabsContent value="stats" className="mt-6">
              {doctor && (
                <DoctorStatsTab
                  doctor={doctor}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}
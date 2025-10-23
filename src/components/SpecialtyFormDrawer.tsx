// src/components/SpecialtyFormDrawer.tsx
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
import { getSpecialties } from '@/services/doctor.service';
import type { Specialty } from '@/types/doctor.types';
import SpecialtyBasicInfo from './specialty-drawer/SpecialtyBasicInfo';
import SpecialtyDoctorsTab from './specialty-drawer/SpecialtyDoctorsTab';

interface SpecialtyFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  specialtyId: number | null;
  mode: 'view' | 'edit' | 'create';
  onSuccess?: () => void;
}

export default function SpecialtyFormDrawer({
  open,
  onOpenChange,
  specialtyId,
  mode,
  onSuccess,
}: SpecialtyFormDrawerProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch specialty data when drawer opens
  useEffect(() => {
    if (open && specialtyId && mode !== 'create') {
      fetchSpecialtyData();
    } else if (mode === 'create') {
      setSpecialty(null);
    }
  }, [open, specialtyId, mode]);

  const fetchSpecialtyData = async () => {
    if (!specialtyId) return;
    
    setLoading(true);
    try {
      // Fetch all specialties and find the one we need
      const response = await getSpecialties();
      const foundSpecialty = response.find(s => s.id === specialtyId);
      if (foundSpecialty) {
        setSpecialty(foundSpecialty);
      } else {
        toast.error('Specialty not found');
      }
    } catch (error: any) {
      toast.error('Failed to load specialty data');
      console.error('Error fetching specialty:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    fetchSpecialtyData();
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
              ? 'Create New Specialty' 
              : mode === 'edit'
              ? `Edit Specialty - ${specialty?.name || ''}`
              : `Specialty Details - ${specialty?.name || ''}`
            }
          </SheetTitle>
          {specialty && (
            <div className="text-sm text-muted-foreground">
              Code: {specialty.code} • {specialty.doctors_count || 0} doctors
            </div>
          )}
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="doctors" disabled={mode === 'create'}>
                Doctors ({specialty?.doctors_count || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-6">
              <SpecialtyBasicInfo
                specialty={specialty}
                mode={mode}
                onSuccess={handleSuccess}
                onClose={handleClose}
              />
            </TabsContent>

            <TabsContent value="doctors" className="mt-6">
              {specialtyId && (
                <SpecialtyDoctorsTab
                  specialtyId={specialtyId}
                  specialtyName={specialty?.name || ''}
                  readOnly={mode === 'view'}
                  onUpdate={handleSuccess}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}
// src/components/SpecialtyFormDrawer.tsx
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { getSpecialties } from '@/services/doctor.service';
import type { Specialty } from '@/types/doctor.types';

import SpecialtyBasicInfo from './specialty-drawer/SpecialtyBasicInfo';
import SpecialtyDoctorsTab from './specialty-drawer/SpecialtyDoctorsTab';

// ✅ import the new global drawer
import { SideDrawer } from '@/components/SideDrawer';

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

  // optional: if you want to show saving spinner on footer button later
  const [saving, setSaving] = useState(false);

  //
  // Fetch specialty data when drawer opens
  //
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
      const foundSpecialty = response.find((s) => s.id === specialtyId);
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
    // re-fetch so drawer shows updated data
    fetchSpecialtyData();
    onSuccess?.();
  };

  // this replaces your old handleClose
  const handleDrawerOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      // drawer is closing -> reset tabs
      setActiveTab('basic');
    }
    onOpenChange(nextOpen);
  };

  //
  // Drawer header text
  //
  const headerTitle =
    mode === 'create'
      ? 'Create New Specialty'
      : mode === 'edit'
      ? `Edit Specialty - ${specialty?.name || ''}`
      : `Specialty Details - ${specialty?.name || ''}`;

  const headerSubtitle =
    mode === 'create'
      ? 'Create new specialty record'
      : specialty
      ? `Code: ${specialty.code} • ${specialty.doctors_count || 0} doctors`
      : undefined;

  //
  // Drawer footer buttons
  // (You can tune these per mode. This is just a consistent pattern.)
  //
  const footerButtons =
    mode === 'view'
      ? [
          {
            label: 'Close',
            variant: 'outline' as const,
            onClick: () => handleDrawerOpenChange(false),
          },
        ]
      : mode === 'edit'
      ? [
          {
            label: 'Cancel',
            variant: 'outline' as const,
            onClick: () => handleDrawerOpenChange(false),
          },
          {
            label: 'Save Changes',
            onClick: async () => {
              // You can trigger save from SpecialtyBasicInfo instead,
              // or lift save handler up here.
              // For now, just demo structure:
              setSaving(true);
              try {
                // await saveSpecialty(...)
                toast.success('Specialty updated');
                handleSuccess();
              } catch (e: any) {
                toast.error(e?.message || 'Failed to save');
              } finally {
                setSaving(false);
              }
            },
            loading: saving,
          },
        ]
      : [
          // create mode
          {
            label: 'Discard',
            variant: 'outline' as const,
            onClick: () => handleDrawerOpenChange(false),
          },
          {
            label: 'Create Specialty',
            onClick: async () => {
              setSaving(true);
              try {
                // await createSpecialty(...)
                toast.success('Specialty created');
                handleSuccess();
              } catch (e: any) {
                toast.error(e?.message || 'Failed to create');
              } finally {
                setSaving(false);
              }
            },
            loading: saving,
          },
        ];

  //
  // Drawer body content
  //
  const bodyContent = loading ? (
    <div className="flex items-center justify-center py-12 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin mr-2" />
      <span>Loading...</span>
    </div>
  ) : (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
          onClose={() => handleDrawerOpenChange(false)}
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
  );

  //
  // Render the shared global drawer
  //
  return (
    <SideDrawer
      open={open}
      onOpenChange={handleDrawerOpenChange}
      title={headerTitle}
      subtitle={headerSubtitle}
      mode={mode}
      // we already handle "loading" inside bodyContent,
      // so keep isLoading={false} here so header/footer don't disappear
      isLoading={false}
      size="xl"
      footerButtons={footerButtons}
    >
      {bodyContent}
    </SideDrawer>
  );
}

// src/components/doctor-drawer/DoctorAvailabilityTab.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Calendar, Clock, Save } from 'lucide-react';
import { getDoctorAvailability, setDoctorAvailability } from '@/services/doctor.service';
import type { DoctorAvailability, SetAvailabilityData } from '@/types/doctor.types';

interface DoctorAvailabilityTabProps {
  doctorId: number;
  readOnly: boolean;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export default function DoctorAvailabilityTab({ doctorId, readOnly }: DoctorAvailabilityTabProps) {
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [formData, setFormData] = useState<SetAvailabilityData>({
    day_of_week: '',
    start_time: '',
    end_time: '',
    is_available: true,
    max_appointments: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, [doctorId]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const data = await getDoctorAvailability(doctorId);
      setAvailability(data);
    } catch (error: any) {
      toast.error('Failed to load availability');
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDay = (day: string) => {
    if (readOnly) return;
    
    const existingSlot = availability.find(a => a.day_of_week === day);
    if (existingSlot) {
      setFormData({
        day_of_week: day,
        start_time: existingSlot.start_time,
        end_time: existingSlot.end_time,
        is_available: existingSlot.is_available,
        max_appointments: existingSlot.max_appointments,
      });
    } else {
      setFormData({
        day_of_week: day,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true,
        max_appointments: 20,
      });
    }
    setEditingDay(day);
  };

  const handleSaveAvailability = async () => {
    if (!formData.day_of_week) return;
    
    setIsSaving(true);
    try {
      await setDoctorAvailability(doctorId, formData);
      toast.success('Availability updated successfully');
      fetchAvailability();
      setEditingDay(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update availability');
    } finally {
      setIsSaving(false);
    }
  };

  const getDayAvailability = (day: string) => {
    return availability.find(a => a.day_of_week === day);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground mb-4">
        <Calendar className="h-5 w-5" />
        <p className="text-sm">
          {readOnly 
            ? "View doctor's weekly availability schedule" 
            : "Configure weekly availability schedule for appointments"
          }
        </p>
      </div>

      <div className="space-y-3">
        {DAYS_OF_WEEK.map(({ value, label }) => {
          const dayAvailability = getDayAvailability(value);
          const isEditing = editingDay === value;

          return (
            <Card key={value}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base font-medium">{label}</CardTitle>
                    {dayAvailability && (
                      <Badge
                        variant={dayAvailability.is_available ? 'default' : 'secondary'}
                        className={dayAvailability.is_available ? 'bg-emerald-500' : ''}
                      >
                        {dayAvailability.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    )}
                  </div>
                  {!readOnly && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditDay(value)}
                    >
                      {dayAvailability ? 'Edit' : 'Set'}
                    </Button>
                  )}
                </div>
              </CardHeader>

              {(dayAvailability || isEditing) && (
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`available-${value}`}>Available</Label>
                        <Switch
                          id={`available-${value}`}
                          checked={formData.is_available}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, is_available: checked })
                          }
                        />
                      </div>

                      {formData.is_available && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`start-${value}`}>Start Time</Label>
                              <Input
                                id={`start-${value}`}
                                type="time"
                                value={formData.start_time}
                                onChange={(e) =>
                                  setFormData({ ...formData, start_time: e.target.value })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`end-${value}`}>End Time</Label>
                              <Input
                                id={`end-${value}`}
                                type="time"
                                value={formData.end_time}
                                onChange={(e) =>
                                  setFormData({ ...formData, end_time: e.target.value })
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`max-${value}`}>Max Appointments (0 = unlimited)</Label>
                            <Input
                              id={`max-${value}`}
                              type="number"
                              min="0"
                              value={formData.max_appointments}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  max_appointments: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                        </>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveAvailability}
                          disabled={isSaving}
                          size="sm"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingDay(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : dayAvailability ? (
                    <div className="space-y-2 text-sm">
                      {dayAvailability.is_available ? (
                        <>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                              {dayAvailability.start_time} - {dayAvailability.end_time}
                            </span>
                          </div>
                          <div className="text-muted-foreground">
                            Max Appointments:{' '}
                            {dayAvailability.max_appointments === 0
                              ? 'Unlimited'
                              : dayAvailability.max_appointments}
                          </div>
                        </>
                      ) : (
                        <p className="text-muted-foreground">Not available on this day</p>
                      )}
                    </div>
                  ) : null}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {!readOnly && (
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            💡 Tip: Set max appointments to 0 for unlimited slots or specify a number to limit daily bookings.
          </p>
        </div>
      )}
    </div>
  );
}
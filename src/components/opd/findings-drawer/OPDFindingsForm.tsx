// src/components/opd/findings-drawer/OPDFindingsForm.tsx
import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { createFinding, updateFinding } from '@/services/opd/findings.service';
import type { Finding, FindingCreateData, FindingUpdateData, FindingType } from '@/types/opd.types';
import type { 
  VisitFindingCreateData, 
  VisitFindingUpdateData 
} from '@/types/opd/visitFinding.types';

export interface OPDFindingsFormRef {
  submitForm: () => Promise<void>;
}

interface OPDFindingsFormProps {
  finding: Finding | null;
  visitId?: number;
  mode: 'view' | 'edit' | 'create';
  onSuccess: (createdFindingId?: number) => void;
  onSaveStart?: () => void;
  onSaveEnd?: () => void;
  onChange?: () => void;
}

const FINDING_TYPES: { value: FindingType; label: string }[] = [
  { value: 'vital_signs', label: 'Vital Signs' },
  { value: 'physical_examination', label: 'Physical Examination' },
  { value: 'symptoms', label: 'Symptoms' },
  { value: 'general_observation', label: 'General Observation' },
  { value: 'system_examination', label: 'System Examination' },
];

// Helper function to map form data to API format
const mapFormDataToAPIFormat = (
  formData: Partial<FindingCreateData | FindingUpdateData>,
  isCreateMode: boolean
): VisitFindingCreateData | VisitFindingUpdateData => {
  // Map finding type from form to API enum
  const findingType = formData.finding_type || 'vital_signs';
  const apiType: 'examination' | 'systemic' = 
    findingType === 'vital_signs' || findingType === 'general_observation' 
      ? 'examination' 
      : 'systemic';

  const mapped: any = {
    finding_type: apiType,
  };

  // Add visit ID for create operations only
  if (isCreateMode && formData.visit_id) {
    mapped.visit = formData.visit_id;
  }

  // Map vital signs fields (convert to appropriate types)
  if (formData.temperature) {
    mapped.temperature = formData.temperature.toString();
  }
  if (formData.pulse_rate) {
    mapped.pulse = parseInt(formData.pulse_rate as string);
  }
  if (formData.blood_pressure_systolic) {
    mapped.bp_systolic = parseInt(formData.blood_pressure_systolic as string);
  }
  if (formData.blood_pressure_diastolic) {
    mapped.bp_diastolic = parseInt(formData.blood_pressure_diastolic as string);
  }
  if (formData.weight) {
    mapped.weight = formData.weight.toString();
  }
  if (formData.height) {
    mapped.height = formData.height.toString();
  }
  if (formData.oxygen_saturation) {
    mapped.spo2 = parseInt(formData.oxygen_saturation as string);
  }
  if (formData.respiratory_rate) {
    mapped.respiratory_rate = parseInt(formData.respiratory_rate as string);
  }

  // Map physical examination fields to systemic examination fields
  if (formData.head_neck) {
    mapped.throat = formData.head_neck;
  }
  if (formData.neurological) {
    mapped.cns = formData.neurological;
  }
  if (formData.respiratory) {
    mapped.rs = formData.respiratory;
  }
  if (formData.cardiovascular) {
    mapped.cvs = formData.cardiovascular;
  }
  if (formData.abdomen) {
    mapped.pa = formData.abdomen;
  }
  
  // Map additional fields that might exist
  if (formData.general_appearance) {
    mapped.tongue = formData.general_appearance;
  }

  return mapped;
};

const OPDFindingsForm = forwardRef<OPDFindingsFormRef, OPDFindingsFormProps>(
  ({ finding, visitId, mode, onSuccess, onSaveStart, onSaveEnd, onChange }, ref) => {
    const isReadOnly = mode === 'view';
    const isCreateMode = mode === 'create';

    // Form state
    const [formData, setFormData] = useState<Partial<FindingCreateData | FindingUpdateData>>({
      visit_id: finding?.visit_id || visitId || undefined,
      finding_type: finding?.finding_type || 'vital_signs',
      recorded_at: finding?.recorded_at || format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      
      // Vital Signs
      temperature: finding?.temperature || '',
      blood_pressure_systolic: finding?.blood_pressure_systolic || '',
      blood_pressure_diastolic: finding?.blood_pressure_diastolic || '',
      pulse_rate: finding?.pulse_rate || '',
      respiratory_rate: finding?.respiratory_rate || '',
      oxygen_saturation: finding?.oxygen_saturation || '',
      weight: finding?.weight || '',
      height: finding?.height || '',
      bmi: finding?.bmi || '',
      
      // Physical Examination
      general_appearance: finding?.general_appearance || '',
      consciousness_level: finding?.consciousness_level || '',
      skin_condition: finding?.skin_condition || '',
      head_neck: finding?.head_neck || '',
      cardiovascular: finding?.cardiovascular || '',
      respiratory: finding?.respiratory || '',
      abdomen: finding?.abdomen || '',
      extremities: finding?.extremities || '',
      neurological: finding?.neurological || '',
      
      // Additional Fields
      findings_notes: finding?.findings_notes || '',
      abnormalities: finding?.abnormalities || '',
      pain_scale: finding?.pain_scale || '',
    });

    // Auto-calculate BMI when height and weight change
    useEffect(() => {
      const weight = parseFloat(formData.weight as string);
      const height = parseFloat(formData.height as string);
      
      if (weight && height && height > 0) {
        // BMI = weight(kg) / height(m)²
        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
        setFormData(prev => ({ ...prev, bmi }));
      }
    }, [formData.weight, formData.height]);

    const handleInputChange = (field: string, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      onChange?.();
    };

    const validateForm = (): boolean => {
      if (!formData.visit_id && isCreateMode) {
        toast.error('Visit ID is required');
        return false;
      }

      if (!formData.finding_type) {
        toast.error('Please select a finding type');
        return false;
      }

      if (!formData.recorded_at) {
        toast.error('Please select date and time');
        return false;
      }

      // Validate vital signs if type is vital_signs
      if (formData.finding_type === 'vital_signs') {
        if (!formData.temperature && !formData.blood_pressure_systolic && !formData.pulse_rate) {
          toast.error('Please record at least one vital sign');
          return false;
        }
      }

      return true;
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        throw new Error('Validation failed');
      }

      onSaveStart?.();
      try {
        // Map form data to API format
        const apiData = mapFormDataToAPIFormat(formData, isCreateMode);

        if (isCreateMode) {
          const response = await createFinding(apiData as VisitFindingCreateData);
          toast.success('Finding recorded successfully');
          onSuccess(response.id);
        } else {
          if (!finding?.id) {
            throw new Error('Finding ID is required for update');
          }
          await updateFinding(finding.id, apiData as VisitFindingUpdateData);
          toast.success('Finding updated successfully');
          onSuccess();
        }
      } catch (error: any) {
        toast.error(isCreateMode ? 'Failed to record finding' : 'Failed to update finding', {
          description: error?.response?.data?.message || error?.message || 'Please try again',
        });
        throw error;
      } finally {
        onSaveEnd?.();
      }
    };

    useImperativeHandle(ref, () => ({
      submitForm: handleSubmit,
    }));

    return (
      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Finding Type */}
            <div>
              <Label>
                Finding Type <span className="text-red-500">*</span>
              </Label>
              {isReadOnly ? (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  {FINDING_TYPES.find((t) => t.value === formData.finding_type)?.label}
                </div>
              ) : (
                <Select
                  value={formData.finding_type}
                  onValueChange={(value: FindingType) => handleInputChange('finding_type', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FINDING_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Recorded At */}
            <div>
              <Label>
                Date & Time <span className="text-red-500">*</span>
              </Label>
              {isReadOnly ? (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  {formData.recorded_at && new Date(formData.recorded_at).toLocaleString()}
                </div>
              ) : (
                <Input
                  type="datetime-local"
                  value={formData.recorded_at}
                  onChange={(e) => handleInputChange('recorded_at', e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
          </div>
        </div>

        {/* Vital Signs Section */}
        {(formData.finding_type === 'vital_signs' || formData.finding_type === 'general_observation') && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Vital Signs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Temperature */}
              <div>
                <Label htmlFor="temperature">Temperature (°F)</Label>
                {isReadOnly ? (
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    {formData.temperature || '—'}
                  </div>
                ) : (
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => handleInputChange('temperature', e.target.value)}
                    placeholder="98.6"
                    className="mt-2"
                  />
                )}
              </div>

              {/* Blood Pressure Systolic */}
              <div>
                <Label htmlFor="bp_systolic">BP Systolic (mmHg)</Label>
                {isReadOnly ? (
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    {formData.blood_pressure_systolic || '—'}
                  </div>
                ) : (
                  <Input
                    id="bp_systolic"
                    type="number"
                    value={formData.blood_pressure_systolic}
                    onChange={(e) => handleInputChange('blood_pressure_systolic', e.target.value)}
                    placeholder="120"
                    className="mt-2"
                  />
                )}
              </div>

              {/* Blood Pressure Diastolic */}
              <div>
                <Label htmlFor="bp_diastolic">BP Diastolic (mmHg)</Label>
                {isReadOnly ? (
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    {formData.blood_pressure_diastolic || '—'}
                  </div>
                ) : (
                  <Input
                    id="bp_diastolic"
                    type="number"
                    value={formData.blood_pressure_diastolic}
                    onChange={(e) => handleInputChange('blood_pressure_diastolic', e.target.value)}
                    placeholder="80"
                    className="mt-2"
                  />
                )}
              </div>

              {/* Pulse Rate */}
              <div>
                <Label htmlFor="pulse_rate">Pulse Rate (bpm)</Label>
                {isReadOnly ? (
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    {formData.pulse_rate || '—'}
                  </div>
                ) : (
                  <Input
                    id="pulse_rate"
                    type="number"
                    value={formData.pulse_rate}
                    onChange={(e) => handleInputChange('pulse_rate', e.target.value)}
                    placeholder="72"
                    className="mt-2"
                  />
                )}
              </div>

              {/* Respiratory Rate */}
              <div>
                <Label htmlFor="respiratory_rate">Respiratory Rate (per min)</Label>
                {isReadOnly ? (
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    {formData.respiratory_rate || '—'}
                  </div>
                ) : (
                  <Input
                    id="respiratory_rate"
                    type="number"
                    value={formData.respiratory_rate}
                    onChange={(e) => handleInputChange('respiratory_rate', e.target.value)}
                    placeholder="16"
                    className="mt-2"
                  />
                )}
              </div>

              {/* Oxygen Saturation */}
              <div>
                <Label htmlFor="oxygen_saturation">Oxygen Saturation (%)</Label>
                {isReadOnly ? (
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    {formData.oxygen_saturation || '—'}
                  </div>
                ) : (
                  <Input
                    id="oxygen_saturation"
                    type="number"
                    step="0.1"
                    value={formData.oxygen_saturation}
                    onChange={(e) => handleInputChange('oxygen_saturation', e.target.value)}
                    placeholder="98"
                    className="mt-2"
                  />
                )}
              </div>

              {/* Weight */}
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                {isReadOnly ? (
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    {formData.weight || '—'}
                  </div>
                ) : (
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="70"
                    className="mt-2"
                  />
                )}
              </div>

              {/* Height */}
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                {isReadOnly ? (
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    {formData.height || '—'}
                  </div>
                ) : (
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder="170"
                    className="mt-2"
                  />
                )}
              </div>

              {/* BMI (Auto-calculated) */}
              <div>
                <Label htmlFor="bmi">BMI (Auto-calculated)</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  {formData.bmi || '—'}
                </div>
              </div>

              {/* Pain Scale */}
              <div>
                <Label htmlFor="pain_scale">Pain Scale (0-10)</Label>
                {isReadOnly ? (
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    {formData.pain_scale || '—'}
                  </div>
                ) : (
                  <Input
                    id="pain_scale"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.pain_scale}
                    onChange={(e) => handleInputChange('pain_scale', e.target.value)}
                    placeholder="0"
                    className="mt-2"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Physical Examination Section */}
        {(formData.finding_type === 'physical_examination' || formData.finding_type === 'system_examination') && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Physical Examination</h3>
            <div className="space-y-4">
              {/* General Appearance */}
              <div>
                <Label htmlFor="general_appearance">General Appearance</Label>
                {isReadOnly ? (
                  <div className="mt-2 p-3 bg-muted rounded-lg min-h-[60px]">
                    {formData.general_appearance || 'Not recorded'}
                  </div>
                ) : (
                  <Textarea
                    id="general_appearance"
                    value={formData.general_appearance || ''}
                    onChange={(e) => handleInputChange('general_appearance', e.target.value)}
                    placeholder="Describe patient's general appearance..."
                    rows={2}
                    className="mt-2"
                  />
                )}
              </div>

              {/* Consciousness Level */}
              <div>
                <Label htmlFor="consciousness_level">Consciousness Level</Label>
                {isReadOnly ? (
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    {formData.consciousness_level || 'Not recorded'}
                  </div>
                ) : (
                  <Input
                    id="consciousness_level"
                    value={formData.consciousness_level || ''}
                    onChange={(e) => handleInputChange('consciousness_level', e.target.value)}
                    placeholder="Alert, Drowsy, Confused, etc."
                    className="mt-2"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Skin Condition */}
                <div>
                  <Label htmlFor="skin_condition">Skin</Label>
                  {isReadOnly ? (
                    <div className="mt-2 p-3 bg-muted rounded-lg min-h-[60px]">
                      {formData.skin_condition || 'Not recorded'}
                    </div>
                  ) : (
                    <Textarea
                      id="skin_condition"
                      value={formData.skin_condition || ''}
                      onChange={(e) => handleInputChange('skin_condition', e.target.value)}
                      placeholder="Skin findings..."
                      rows={2}
                      className="mt-2"
                    />
                  )}
                </div>

                {/* Head & Neck */}
                <div>
                  <Label htmlFor="head_neck">Head & Neck</Label>
                  {isReadOnly ? (
                    <div className="mt-2 p-3 bg-muted rounded-lg min-h-[60px]">
                      {formData.head_neck || 'Not recorded'}
                    </div>
                  ) : (
                    <Textarea
                      id="head_neck"
                      value={formData.head_neck || ''}
                      onChange={(e) => handleInputChange('head_neck', e.target.value)}
                      placeholder="Head & neck findings..."
                      rows={2}
                      className="mt-2"
                    />
                  )}
                </div>

                {/* Cardiovascular */}
                <div>
                  <Label htmlFor="cardiovascular">Cardiovascular</Label>
                  {isReadOnly ? (
                    <div className="mt-2 p-3 bg-muted rounded-lg min-h-[60px]">
                      {formData.cardiovascular || 'Not recorded'}
                    </div>
                  ) : (
                    <Textarea
                      id="cardiovascular"
                      value={formData.cardiovascular || ''}
                      onChange={(e) => handleInputChange('cardiovascular', e.target.value)}
                      placeholder="Cardiovascular findings..."
                      rows={2}
                      className="mt-2"
                    />
                  )}
                </div>

                {/* Respiratory */}
                <div>
                  <Label htmlFor="respiratory">Respiratory</Label>
                  {isReadOnly ? (
                    <div className="mt-2 p-3 bg-muted rounded-lg min-h-[60px]">
                      {formData.respiratory || 'Not recorded'}
                    </div>
                  ) : (
                    <Textarea
                      id="respiratory"
                      value={formData.respiratory || ''}
                      onChange={(e) => handleInputChange('respiratory', e.target.value)}
                      placeholder="Respiratory findings..."
                      rows={2}
                      className="mt-2"
                    />
                  )}
                </div>

                {/* Abdomen */}
                <div>
                  <Label htmlFor="abdomen">Abdomen</Label>
                  {isReadOnly ? (
                    <div className="mt-2 p-3 bg-muted rounded-lg min-h-[60px]">
                      {formData.abdomen || 'Not recorded'}
                    </div>
                  ) : (
                    <Textarea
                      id="abdomen"
                      value={formData.abdomen || ''}
                      onChange={(e) => handleInputChange('abdomen', e.target.value)}
                      placeholder="Abdominal findings..."
                      rows={2}
                      className="mt-2"
                    />
                  )}
                </div>

                {/* Extremities */}
                <div>
                  <Label htmlFor="extremities">Extremities</Label>
                  {isReadOnly ? (
                    <div className="mt-2 p-3 bg-muted rounded-lg min-h-[60px]">
                      {formData.extremities || 'Not recorded'}
                    </div>
                  ) : (
                    <Textarea
                      id="extremities"
                      value={formData.extremities || ''}
                      onChange={(e) => handleInputChange('extremities', e.target.value)}
                      placeholder="Extremities findings..."
                      rows={2}
                      className="mt-2"
                    />
                  )}
                </div>

                {/* Neurological */}
                <div>
                  <Label htmlFor="neurological">Neurological</Label>
                  {isReadOnly ? (
                    <div className="mt-2 p-3 bg-muted rounded-lg min-h-[60px]">
                      {formData.neurological || 'Not recorded'}
                    </div>
                  ) : (
                    <Textarea
                      id="neurological"
                      value={formData.neurological || ''}
                      onChange={(e) => handleInputChange('neurological', e.target.value)}
                      placeholder="Neurological findings..."
                      rows={2}
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Notes Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
          <div className="space-y-4">
            {/* Abnormalities */}
            <div>
              <Label htmlFor="abnormalities">Abnormalities Found</Label>
              {isReadOnly ? (
                <div className="mt-2 p-3 bg-muted rounded-lg min-h-[60px]">
                  {formData.abnormalities || 'No abnormalities recorded'}
                </div>
              ) : (
                <Textarea
                  id="abnormalities"
                  value={formData.abnormalities || ''}
                  onChange={(e) => handleInputChange('abnormalities', e.target.value)}
                  placeholder="Describe any abnormal findings..."
                  rows={3}
                  className="mt-2"
                />
              )}
            </div>

            {/* Findings Notes */}
            <div>
              <Label htmlFor="findings_notes">Clinical Notes</Label>
              {isReadOnly ? (
                <div className="mt-2 p-3 bg-muted rounded-lg min-h-[80px]">
                  {formData.findings_notes || 'No additional notes'}
                </div>
              ) : (
                <Textarea
                  id="findings_notes"
                  value={formData.findings_notes || ''}
                  onChange={(e) => handleInputChange('findings_notes', e.target.value)}
                  placeholder="Additional clinical observations and notes..."
                  rows={4}
                  className="mt-2"
                />
              )}
            </div>
          </div>
        </div>

        {/* Metadata (in view/edit mode) */}
        {!isCreateMode && finding && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">Record Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Recorded By:</span>
                <p className="font-medium">{finding.recorded_by || 'System'}</p>
              </div>
              {finding.updated_at && (
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <p className="font-medium">
                    {format(new Date(finding.updated_at), 'PPp')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

OPDFindingsForm.displayName = 'OPDFindingsForm';

export default OPDFindingsForm;
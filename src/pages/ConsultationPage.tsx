// src/pages/ConsultationPage.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Stethoscope, Printer } from 'lucide-react';

// Simple types
interface Field {
  checked: boolean;
  value: string;
  notes?: string;
}

interface SideField extends Field {
  side: 'L' | 'R' | 'bilateral';
}

export default function ConsultationPage() {
  // Chief Complaint State
  const [complaints, setComplaints] = useState({
    site: { checked: false, value: '', notes: '' },
    type: { checked: false, value: '', notes: '' },
    duration: { checked: false, value: '', notes: '' },
    radiation: { checked: false, value: '', notes: '' },
    aggravatedOn: { checked: false, value: '', notes: '' },
    relievedOn: { checked: false, value: '', notes: '' },
    tingling: { checked: false, value: '', notes: '' },
    numbness: { checked: false, value: '', notes: '' },
    burning: { checked: false, value: '', notes: '' },
    weakness: { checked: false, value: '', notes: '' },
    ems: { checked: false, value: '', notes: '' },
    associatedFeatures: { checked: false, value: '', notes: '' },
  });

  // Medical History State
  const [medicalHistory, setMedicalHistory] = useState({
    dm: false,
    dmNotes: '',
    htn: false,
    htnNotes: '',
    tb: false,
    tbNotes: '',
    thyroid: false,
    thyroidNotes: '',
    allergies: false,
    allergiesNotes: '',
    addiction: false,
    addictionNotes: '',
    occupation: '',
    diet: 'veg' as 'veg' | 'non-veg' | 'eggetarian',
  });

  // L/S Spine Examination
  const [lsSpine, setLsSpine] = useState({
    slr: { checked: false, side: 'L' as 'L' | 'R' | 'bilateral', value: '', notes: '' },
    patricks: { checked: false, side: 'L' as 'L' | 'R' | 'bilateral', value: '', notes: '' },
    fair: { checked: false, side: 'L' as 'L' | 'R' | 'bilateral', value: '', notes: '' },
    spTenderness: { checked: false, value: '', notes: '' },
    pisTenderness: { checked: false, value: '', notes: '' },
    flexExt: { checked: false, value: '', notes: '' },
  });

  // C Spine Examination
  const [cSpine, setCSpine] = useState({
    axial: { checked: false, value: '', notes: '' },
    spurling: { checked: false, value: '', notes: '' },
    spTenderness: { checked: false, value: '', notes: '' },
    pisTenderness: { checked: false, value: '', notes: '' },
    flexExtRot: { checked: false, value: '', notes: '' },
    trapTp: { checked: false, value: '', notes: '' },
  });

  // Knee Examination
  const [knee, setKnee] = useState({
    crepitus: { checked: false, side: 'L' as 'L' | 'R' | 'bilateral', notes: '' },
    tender: { checked: false, side: 'L' as 'L' | 'R' | 'bilateral', notes: '' },
    appleys: { checked: false, side: 'L' as 'L' | 'R' | 'bilateral', notes: '' },
    drawyer: { checked: false, side: 'L' as 'L' | 'R' | 'bilateral', notes: '' },
    rom: { checked: false, side: 'L' as 'L' | 'R' | 'bilateral', value: '', notes: '' },
  });

  // Shoulder Examination
  const [shoulder, setShoulder] = useState({
    rom: { checked: false, active: '', passive: '', notes: '' },
    neers: { checked: false, value: '', notes: '' },
    oBrien: { checked: false, value: '', notes: '' },
    rotatorCuff: { checked: false, value: '', notes: '' },
  });

  // Diagnosis & Treatment
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [plan, setPlan] = useState('');
  const [physiotherapy, setPhysiotherapy] = useState('');
  const [followUp, setFollowUp] = useState('');

  // Active view
  const [activeView, setActiveView] = useState<'forms' | 'preview'>('forms');

  // Helper to update complaint
  const updateComplaint = (key: string, updates: Partial<Field>) => {
    setComplaints(prev => ({
      ...prev,
      [key]: { ...prev[key as keyof typeof prev], ...updates }
    }));
  };

  // Helper to update medical history
  const updateMedicalHistory = (updates: Partial<typeof medicalHistory>) => {
    setMedicalHistory(prev => ({ ...prev, ...updates }));
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Consultation Documentation</h1>
            <p className="text-muted-foreground">Patient consultation and examination</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeView === 'forms' ? 'default' : 'outline'}
              onClick={() => setActiveView('forms')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Data Entry
            </Button>
            <Button
              variant={activeView === 'preview' ? 'default' : 'outline'}
              onClick={() => setActiveView('preview')}
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>

        {/* Main Content */}
        {activeView === 'forms' ? (
          <div className="space-y-6">
            {/* Chief Complaint Form */}
            <Card>
              <CardHeader>
                <CardTitle>Chief Complaint (C/O Pain)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {(['site', 'type', 'duration', 'radiation', 'aggravatedOn', 'relievedOn'] as const).map((field) => (
                      <div key={field} className="space-y-2 p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={field}
                            checked={complaints[field].checked}
                            onCheckedChange={(checked) => 
                              updateComplaint(field, { checked: checked as boolean })
                            }
                          />
                          <Label htmlFor={field} className="capitalize">
                            {field.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                        </div>
                        {complaints[field].checked && (
                          <div className="ml-6 space-y-2">
                            <Input
                              placeholder={`Enter ${field}...`}
                              value={complaints[field].value}
                              onChange={(e) => updateComplaint(field, { value: e.target.value })}
                            />
                            <Textarea
                              placeholder="Notes..."
                              value={complaints[field].notes}
                              onChange={(e) => updateComplaint(field, { notes: e.target.value })}
                              className="min-h-[60px]"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {(['tingling', 'numbness', 'burning', 'weakness', 'ems', 'associatedFeatures'] as const).map((field) => (
                      <div key={field} className="space-y-2 p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={field}
                            checked={complaints[field].checked}
                            onCheckedChange={(checked) => 
                              updateComplaint(field, { checked: checked as boolean })
                            }
                          />
                          <Label htmlFor={field} className="capitalize">
                            {field.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                        </div>
                        {complaints[field].checked && (
                          <div className="ml-6 space-y-2">
                            <Input
                              placeholder={`Enter ${field}...`}
                              value={complaints[field].value}
                              onChange={(e) => updateComplaint(field, { value: e.target.value })}
                            />
                            <Textarea
                              placeholder="Notes..."
                              value={complaints[field].notes}
                              onChange={(e) => updateComplaint(field, { notes: e.target.value })}
                              className="min-h-[60px]"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical History */}
            <Card>
              <CardHeader>
                <CardTitle>Past Medical History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* DM */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dm"
                        checked={medicalHistory.dm}
                        onCheckedChange={(checked) => updateMedicalHistory({ dm: checked as boolean })}
                      />
                      <Label htmlFor="dm">DM (Diabetes)</Label>
                    </div>
                    {medicalHistory.dm && (
                      <Textarea
                        placeholder="Notes..."
                        value={medicalHistory.dmNotes}
                        onChange={(e) => updateMedicalHistory({ dmNotes: e.target.value })}
                        className="min-h-[60px]"
                      />
                    )}
                  </div>

                  {/* HTN */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="htn"
                        checked={medicalHistory.htn}
                        onCheckedChange={(checked) => updateMedicalHistory({ htn: checked as boolean })}
                      />
                      <Label htmlFor="htn">HTN</Label>
                    </div>
                    {medicalHistory.htn && (
                      <Textarea
                        placeholder="Notes..."
                        value={medicalHistory.htnNotes}
                        onChange={(e) => updateMedicalHistory({ htnNotes: e.target.value })}
                        className="min-h-[60px]"
                      />
                    )}
                  </div>

                  {/* TB */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tb"
                        checked={medicalHistory.tb}
                        onCheckedChange={(checked) => updateMedicalHistory({ tb: checked as boolean })}
                      />
                      <Label htmlFor="tb">TB</Label>
                    </div>
                    {medicalHistory.tb && (
                      <Textarea
                        placeholder="Notes..."
                        value={medicalHistory.tbNotes}
                        onChange={(e) => updateMedicalHistory({ tbNotes: e.target.value })}
                        className="min-h-[60px]"
                      />
                    )}
                  </div>

                  {/* Thyroid */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="thyroid"
                        checked={medicalHistory.thyroid}
                        onCheckedChange={(checked) => updateMedicalHistory({ thyroid: checked as boolean })}
                      />
                      <Label htmlFor="thyroid">Thyroid</Label>
                    </div>
                    {medicalHistory.thyroid && (
                      <Textarea
                        placeholder="Notes..."
                        value={medicalHistory.thyroidNotes}
                        onChange={(e) => updateMedicalHistory({ thyroidNotes: e.target.value })}
                        className="min-h-[60px]"
                      />
                    )}
                  </div>

                  {/* Allergies */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allergies"
                        checked={medicalHistory.allergies}
                        onCheckedChange={(checked) => updateMedicalHistory({ allergies: checked as boolean })}
                      />
                      <Label htmlFor="allergies">Allergies</Label>
                    </div>
                    {medicalHistory.allergies && (
                      <Textarea
                        placeholder="Specify..."
                        value={medicalHistory.allergiesNotes}
                        onChange={(e) => updateMedicalHistory({ allergiesNotes: e.target.value })}
                        className="min-h-[60px]"
                      />
                    )}
                  </div>

                  {/* Addiction */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="addiction"
                        checked={medicalHistory.addiction}
                        onCheckedChange={(checked) => updateMedicalHistory({ addiction: checked as boolean })}
                      />
                      <Label htmlFor="addiction">Addiction</Label>
                    </div>
                    {medicalHistory.addiction && (
                      <Textarea
                        placeholder="Specify..."
                        value={medicalHistory.addictionNotes}
                        onChange={(e) => updateMedicalHistory({ addictionNotes: e.target.value })}
                        className="min-h-[60px]"
                      />
                    )}
                  </div>

                  {/* Occupation */}
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      placeholder="Enter..."
                      value={medicalHistory.occupation}
                      onChange={(e) => updateMedicalHistory({ occupation: e.target.value })}
                    />
                  </div>

                  {/* Diet */}
                  <div className="space-y-2">
                    <Label htmlFor="diet">Diet</Label>
                    <Select
                      value={medicalHistory.diet}
                      onValueChange={(value) => updateMedicalHistory({ diet: value as any })}
                    >
                      <SelectTrigger id="diet">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="veg">Vegetarian</SelectItem>
                        <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                        <SelectItem value="eggetarian">Eggetarian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Examination - L/S Spine */}
            <Card>
              <CardHeader>
                <CardTitle>Physical Examination - L/S Spine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* SLR */}
                <div className="space-y-2 p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="slr"
                      checked={lsSpine.slr.checked}
                      onCheckedChange={(checked) => 
                        setLsSpine(prev => ({ ...prev, slr: { ...prev.slr, checked: checked as boolean } }))
                      }
                    />
                    <Label htmlFor="slr">SLR (Straight Leg Raise)</Label>
                  </div>
                  {lsSpine.slr.checked && (
                    <div className="ml-6 space-y-2">
                      <Select
                        value={lsSpine.slr.side}
                        onValueChange={(value) => 
                          setLsSpine(prev => ({ ...prev, slr: { ...prev.slr, side: value as any } }))
                        }
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">Left</SelectItem>
                          <SelectItem value="R">Right</SelectItem>
                          <SelectItem value="bilateral">Bilateral</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Value (e.g., 45°)"
                        value={lsSpine.slr.value}
                        onChange={(e) => 
                          setLsSpine(prev => ({ ...prev, slr: { ...prev.slr, value: e.target.value } }))
                        }
                      />
                      <Textarea
                        placeholder="Notes..."
                        value={lsSpine.slr.notes}
                        onChange={(e) => 
                          setLsSpine(prev => ({ ...prev, slr: { ...prev.slr, notes: e.target.value } }))
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Add similar blocks for other L/S Spine tests */}
              </CardContent>
            </Card>

            {/* Diagnosis & Treatment */}
            <Card>
              <CardHeader>
                <CardTitle>Diagnosis & Treatment Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Provisional Diagnosis</Label>
                  <Textarea
                    placeholder="Enter diagnosis..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <Label>Treatment</Label>
                  <Textarea
                    placeholder="Enter treatment..."
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <div>
                  <Label>Plan</Label>
                  <Textarea
                    placeholder="Enter plan..."
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <Label>Physiotherapy</Label>
                  <Textarea
                    placeholder="Enter physiotherapy..."
                    value={physiotherapy}
                    onChange={(e) => setPhysiotherapy(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <Label>Follow Up</Label>
                  <Textarea
                    placeholder="Enter follow up..."
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* PREVIEW */
          <Card className="print:shadow-none">
            <CardHeader className="border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold">JEEVISHA</h2>
                  <p className="text-xs text-muted-foreground">SPINE | PAIN | REGENERATIVE HOSPITAL</p>
                </div>
                <Button onClick={handlePrint} variant="outline" size="sm" className="print:hidden">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Chief Complaint */}
              <div>
                <h3 className="font-bold mb-3">C/O Pain:</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  <div className="space-y-1">
                    {complaints.site.checked && (
                      <p className="text-sm"><span className="font-medium">Site:</span> {complaints.site.value}</p>
                    )}
                    {complaints.type.checked && (
                      <p className="text-sm"><span className="font-medium">Type:</span> {complaints.type.value}</p>
                    )}
                    {complaints.duration.checked && (
                      <p className="text-sm"><span className="font-medium">Duration:</span> {complaints.duration.value}</p>
                    )}
                    {complaints.radiation.checked && (
                      <p className="text-sm"><span className="font-medium">Radiation:</span> {complaints.radiation.value}</p>
                    )}
                    {complaints.aggravatedOn.checked && (
                      <p className="text-sm"><span className="font-medium">Aggravated on:</span> {complaints.aggravatedOn.value}</p>
                    )}
                    {complaints.relievedOn.checked && (
                      <p className="text-sm"><span className="font-medium">Relieved on:</span> {complaints.relievedOn.value}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    {complaints.tingling.checked && (
                      <p className="text-sm"><span className="font-medium">Tingling:</span> {complaints.tingling.value || 'Yes'}</p>
                    )}
                    {complaints.numbness.checked && (
                      <p className="text-sm"><span className="font-medium">Numbness:</span> {complaints.numbness.value || 'Yes'}</p>
                    )}
                    {complaints.burning.checked && (
                      <p className="text-sm"><span className="font-medium">Burning:</span> {complaints.burning.value || 'Yes'}</p>
                    )}
                    {complaints.weakness.checked && (
                      <p className="text-sm"><span className="font-medium">Weakness:</span> {complaints.weakness.value || 'Yes'}</p>
                    )}
                    {complaints.ems.checked && (
                      <p className="text-sm"><span className="font-medium">EMS:</span> {complaints.ems.value}</p>
                    )}
                    {complaints.associatedFeatures.checked && (
                      <p className="text-sm"><span className="font-medium">Associated Features:</span> {complaints.associatedFeatures.value}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Medical History */}
              <div>
                <h3 className="font-bold mb-2">Past Medical History:</h3>
                <div className="flex flex-wrap gap-6 text-sm">
                  {medicalHistory.dm && <span>✓ DM</span>}
                  {medicalHistory.htn && <span>✓ HTN</span>}
                  {medicalHistory.tb && <span>✓ TB</span>}
                  {medicalHistory.thyroid && <span>✓ THYROID</span>}
                  {medicalHistory.allergies && <span>✓ Allergies</span>}
                  {medicalHistory.addiction && <span>✓ Addiction</span>}
                  {medicalHistory.occupation && <span>Occupation: {medicalHistory.occupation}</span>}
                  <span>Diet: {medicalHistory.diet.toUpperCase()}</span>
                </div>
              </div>

              {/* Examination */}
              <div>
                <h3 className="font-bold mb-3">Examination:</h3>
                <div className="space-y-2">
                  <p className="font-medium text-sm">L/S Spine:</p>
                  <div className="ml-4 space-y-1 text-sm">
                    {lsSpine.slr.checked && (
                      <p>SLR ({lsSpine.slr.side}): {lsSpine.slr.value}</p>
                    )}
                    {/* Add other examination findings */}
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              {diagnosis && (
                <div>
                  <p className="font-medium text-sm">Provisional Diagnosis:</p>
                  <p className="text-sm ml-4">{diagnosis}</p>
                </div>
              )}

              {/* Treatment */}
              {treatment && (
                <div>
                  <p className="font-medium text-sm">Treatment:</p>
                  <p className="text-sm ml-4 whitespace-pre-wrap">{treatment}</p>
                </div>
              )}

              {/* Plan */}
              {plan && (
                <div>
                  <p className="font-medium text-sm">Plan:</p>
                  <p className="text-sm ml-4 whitespace-pre-wrap">{plan}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
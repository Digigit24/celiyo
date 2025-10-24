// src/components/consultation/VisitFindingsList.tsx
import { format } from 'date-fns';
import type { VisitFinding } from '@/types/opd.types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';

interface VisitFindingsListProps {
  findings: VisitFinding[];
  loading: boolean;
  onUpdate: () => void;
}

export default function VisitFindingsList({ findings, loading, onUpdate }: VisitFindingsListProps) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading findings...</p>;
  }

  if (findings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Stethoscope className="h-12 w-12 mx-auto mb-2 opacity-20" />
        <p>No findings recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {findings.map((finding) => (
        <Card key={finding.id} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline">{format(new Date(finding.finding_date), 'PP')}</Badge>
            <Badge className="capitalize">{finding.finding_type}</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            {finding.temperature && (
              <div>
                <span className="text-muted-foreground">Temp:</span>
                <span className="ml-2 font-medium">{finding.temperature}°F</span>
              </div>
            )}
            {finding.pulse && (
              <div>
                <span className="text-muted-foreground">Pulse:</span>
                <span className="ml-2 font-medium">{finding.pulse} bpm</span>
              </div>
            )}
            {finding.blood_pressure && (
              <div>
                <span className="text-muted-foreground">BP:</span>
                <span className="ml-2 font-medium">{finding.blood_pressure}</span>
              </div>
            )}
            {finding.spo2 && (
              <div>
                <span className="text-muted-foreground">SpO2:</span>
                <span className="ml-2 font-medium">{finding.spo2}%</span>
              </div>
            )}
            {finding.weight && (
              <div>
                <span className="text-muted-foreground">Weight:</span>
                <span className="ml-2 font-medium">{finding.weight} kg</span>
              </div>
            )}
            {finding.height && (
              <div>
                <span className="text-muted-foreground">Height:</span>
                <span className="ml-2 font-medium">{finding.height} cm</span>
              </div>
            )}
            {finding.bmi && (
              <div>
                <span className="text-muted-foreground">BMI:</span>
                <span className="ml-2 font-medium">{finding.bmi}</span>
              </div>
            )}
          </div>

          {(finding.tongue || finding.throat || finding.cns || finding.rs || finding.cvs || finding.pa) && (
            <div className="space-y-2 text-sm">
              {finding.tongue && (
                <div>
                  <span className="font-semibold">Tongue:</span>
                  <span className="ml-2 text-muted-foreground">{finding.tongue}</span>
                </div>
              )}
              {finding.throat && (
                <div>
                  <span className="font-semibold">Throat:</span>
                  <span className="ml-2 text-muted-foreground">{finding.throat}</span>
                </div>
              )}
              {finding.cns && (
                <div>
                  <span className="font-semibold">CNS:</span>
                  <span className="ml-2 text-muted-foreground">{finding.cns}</span>
                </div>
              )}
              {finding.rs && (
                <div>
                  <span className="font-semibold">RS:</span>
                  <span className="ml-2 text-muted-foreground">{finding.rs}</span>
                </div>
              )}
              {finding.cvs && (
                <div>
                  <span className="font-semibold">CVS:</span>
                  <span className="ml-2 text-muted-foreground">{finding.cvs}</span>
                </div>
              )}
              {finding.pa && (
                <div>
                  <span className="font-semibold">PA:</span>
                  <span className="ml-2 text-muted-foreground">{finding.pa}</span>
                </div>
              )}
            </div>
          )}

          {finding.recorded_by_name && (
            <p className="text-xs text-muted-foreground mt-2">
              Recorded by: {finding.recorded_by_name}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}

// src/components/opd/visit-drawer/VisitClinicalNoteTab.tsx
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface VisitClinicalNoteTabProps {
  visitId: number;
  visitNumber: string;
  readOnly: boolean;
  onUpdate?: () => void;
}

export default function VisitClinicalNoteTab({
  visitId,
  visitNumber,
  readOnly,
  onUpdate,
}: VisitClinicalNoteTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Clinical Notes</h3>
      </div>

      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No clinical notes available</p>
          {!readOnly && (
            <p className="text-xs mt-1">Doctor's observations and treatment plans will appear here</p>
          )}
        </div>
      </Card>
    </div>
  );
}
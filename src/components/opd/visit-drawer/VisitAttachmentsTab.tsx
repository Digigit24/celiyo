// src/components/opd/visit-drawer/VisitAttachmentsTab.tsx
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Paperclip, Upload } from 'lucide-react';

interface VisitAttachmentsTabProps {
  visitId: number;
  visitNumber: string;
  readOnly: boolean;
  onUpdate?: () => void;
}

export default function VisitAttachmentsTab({
  visitId,
  visitNumber,
  readOnly,
  onUpdate,
}: VisitAttachmentsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Attachments</h3>
        </div>
        {!readOnly && (
          <Button size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        )}
      </div>

      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <Paperclip className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No files attached yet</p>
          {!readOnly && (
            <p className="text-xs mt-1">Upload X-rays, reports, prescriptions and other documents</p>
          )}
        </div>
      </Card>
    </div>
  );
}
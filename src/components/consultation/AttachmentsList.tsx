// src/components/consultation/AttachmentsList.tsx
import { format } from 'date-fns';
import type { VisitAttachment } from '@/types/opd.types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Paperclip } from 'lucide-react';

interface AttachmentsListProps {
  attachments: VisitAttachment[];
  loading: boolean;
  onUpdate: () => void;
}

export default function AttachmentsList({ attachments, loading, onUpdate }: AttachmentsListProps) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading attachments...</p>;
  }

  if (attachments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Paperclip className="h-12 w-12 mx-auto mb-2 opacity-20" />
        <p>No attachments uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {attachments.map((attachment) => (
        <Card key={attachment.id} className="p-4">
          <div className="flex items-start gap-3">
            <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{attachment.file_name}</p>
                  <p className="text-sm text-muted-foreground">{attachment.description}</p>
                </div>
                <Button size="sm" variant="ghost" asChild>
                  <a href={attachment.file} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="capitalize">{attachment.file_type}</Badge>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(attachment.uploaded_at), 'PP p')}
                </span>
                {attachment.uploaded_by_name && (
                  <span className="text-xs text-muted-foreground">
                    by {attachment.uploaded_by_name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
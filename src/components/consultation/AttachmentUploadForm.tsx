// src/components/consultation/AttachmentUploadForm.tsx
import { useState } from 'react';
import { useCreateVisitAttachment } from '@/hooks/useOPD';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FileType } from '@/types/opd.types';
import { Upload } from 'lucide-react';

interface AttachmentUploadFormProps {
  visitId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AttachmentUploadForm({ visitId, onSuccess, onCancel }: AttachmentUploadFormProps) {
  const { createVisitAttachment, isCreating } = useCreateVisitAttachment();
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType>('document');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      await createVisitAttachment({
        visit: visitId,
        file: file,
        file_type: fileType,
        description: description,
      });
      onSuccess();
    } catch (error: any) {
      console.error('Failed to upload attachment:', error);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="file">File *</Label>
          <Input
            id="file"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
        </div>

        <div>
          <Label htmlFor="file_type">File Type *</Label>
          <Select
            value={fileType}
            onValueChange={(value: FileType) => setFileType(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xray">X-Ray</SelectItem>
              <SelectItem value="report">Report</SelectItem>
              <SelectItem value="prescription">Prescription</SelectItem>
              <SelectItem value="scan">Scan</SelectItem>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the file..."
            rows={2}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating || !file}>
            <Upload className="h-4 w-4 mr-2" />
            {isCreating ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
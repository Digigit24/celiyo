// src/components/opd/visit-drawer/VisitFindingsTab.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface VisitFindingsTabProps {
  visitId: number;
  visitNumber: string;
  readOnly: boolean;
  onUpdate?: () => void;
}

export default function VisitFindingsTab({
  visitId,
  visitNumber,
  readOnly,
  onUpdate,
}: VisitFindingsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Visit Findings</h3>
        </div>
        {!readOnly && (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Finding
          </Button>
        )}
      </div>

      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No findings recorded yet</p>
          {!readOnly && (
            <p className="text-xs mt-1">Click "Add Finding" to record vital signs and examination notes</p>
          )}
        </div>
      </Card>
    </div>
  );
}
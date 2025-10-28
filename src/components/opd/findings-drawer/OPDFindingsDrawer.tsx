// src/components/opd/findings-drawer/OPDFindingsDrawer.tsx

import { useState, useEffect, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import * as OPDFindingsFormModule from './OPDFindingsForm';
import { getFindingById } from '@/services/opd/findings.service';
import type { Finding } from '@/types/opd.types';
import { Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Extract the default export and type
const OPDFindingsForm = OPDFindingsFormModule.default;
type OPDFindingsFormRef = OPDFindingsFormModule.OPDFindingsFormRef;

export interface OPDFindingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  findingId?: number;
  visitId?: number;
  mode?: 'create' | 'edit' | 'view';
  onSuccess?: () => void;
  onDelete?: (id: number) => Promise<void>;
  onModeChange?: (mode: 'create' | 'edit' | 'view') => void;
}

export default function OPDFindingsDrawer({
  open,
  onOpenChange,
  findingId,
  visitId,
  mode = 'create',
  onSuccess,
  onDelete,
  onModeChange,
}: OPDFindingsDrawerProps) {
  const formRef = useRef<OPDFindingsFormRef>(null);
  const [finding, setFinding] = useState<Finding | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentMode, setCurrentMode] = useState<'create' | 'edit' | 'view'>(mode);

  // Sync mode with prop
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  // Fetch finding data when in edit/view mode
  useEffect(() => {
    if (open && findingId && (currentMode === 'edit' || currentMode === 'view')) {
      setIsLoading(true);
      setError(null);
      
      getFindingById(findingId)
        .then((data) => {
          setFinding(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Failed to fetch finding:', err);
          setError('Failed to load finding data');
          setIsLoading(false);
        });
    } else if (currentMode === 'create') {
      setFinding(null);
      setError(null);
    }
  }, [open, findingId, currentMode]);

  // Reset state when drawer closes
  useEffect(() => {
    if (!open) {
      setFinding(null);
      setError(null);
      setIsLoading(false);
      setIsSaving(false);
      setCurrentMode(mode);
    }
  }, [open, mode]);

  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  const handleSaveClick = async () => {
    if (formRef.current) {
      try {
        setIsSaving(true);
        await formRef.current.submitForm();
        // handleSuccess is called by the form's onSuccess callback
      } catch (error) {
        // Error is handled by the form
        setIsSaving(false);
      }
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (onDelete && findingId) {
      setIsDeleting(true);
      try {
        await onDelete(findingId);
        setShowDeleteDialog(false);
        onOpenChange(false);
      } catch (error) {
        console.error('Failed to delete finding:', error);
        setIsDeleting(false);
      }
    }
  };

  const handleModeChange = (newMode: 'create' | 'edit' | 'view') => {
    setCurrentMode(newMode);
    onModeChange?.(newMode);
  };

  const getTitle = () => {
    switch (currentMode) {
      case 'create':
        return 'Record Clinical Finding';
      case 'edit':
        return 'Edit Clinical Finding';
      case 'view':
        return 'View Clinical Finding';
      default:
        return 'Clinical Finding';
    }
  };

  const getDescription = () => {
    switch (currentMode) {
      case 'create':
        return 'Record vital signs, physical examination, or other clinical observations';
      case 'edit':
        return 'Update the clinical finding information';
      case 'view':
        return 'Review the clinical finding details';
      default:
        return '';
    }
  };

  const canEdit = currentMode === 'view' && findingId;
  const canDelete = (currentMode === 'edit' || currentMode === 'view') && findingId && onDelete;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto flex flex-col">
          <SheetHeader>
            <SheetTitle>{getTitle()}</SheetTitle>
            <SheetDescription>{getDescription()}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            ) : (
              <OPDFindingsForm
                ref={formRef}
                finding={finding}
                visitId={visitId}
                mode={currentMode}
                onSuccess={handleSuccess}
                onSaveStart={() => setIsSaving(true)}
                onSaveEnd={() => setIsSaving(false)}
              />
            )}
          </div>

          {/* Footer with action buttons */}
          {!isLoading && !error && (
            <SheetFooter className="border-t pt-4 flex-row justify-between sm:justify-between">
              <div className="flex gap-2">
                {canDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteClick}
                    disabled={isSaving || isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleModeChange('edit')}
                  >
                    Edit
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  disabled={isSaving}
                >
                  {currentMode === 'view' ? 'Close' : 'Cancel'}
                </Button>

                {currentMode !== 'view' && (
                  <Button
                    size="sm"
                    onClick={handleSaveClick}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      currentMode === 'create' ? 'Record Finding' : 'Save Changes'
                    )}
                  </Button>
                )}
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Finding</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this clinical finding? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
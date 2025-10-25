// src/components/SideDrawer.tsx
import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type DrawerMode = 'view' | 'edit' | 'create';

type DrawerActionButton = {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  // optional icon component like Lucide icons
  iconLeft?: React.ComponentType<{ className?: string }>;
  iconRight?: React.ComponentType<{ className?: string }>;
};

export interface SideDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: string;
  subtitle?: string;

  mode?: DrawerMode;

  // when true, we'll show a centered spinner instead of children
  isLoading?: boolean;

  // main content (form, tabs, etc.)
  children: React.ReactNode;

  // footer actions, pass [] to hide footer
  footerButtons?: DrawerActionButton[];

  // width behavior (defaults to 3xl-ish like your SpecialtyFormDrawer)
  size?: 'sm' | 'md' | 'lg' | 'xl';

  // if you want to hide the X button for strict flows
  hideCloseIcon?: boolean;
}

/**
 * Global reusable side drawer
 * - sticky header with title/subtitle
 * - scrollable content body
 * - optional footer with actions
 * - handles loading state
 */
export function SideDrawer({
  open,
  onOpenChange,
  title,
  subtitle,
  mode = 'view',
  isLoading = false,
  children,
  footerButtons,
  size = 'lg',
  hideCloseIcon = false,
}: SideDrawerProps) {
  // map our size prop to Tailwind widths
  const sizeClass = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-3xl',
  }[size];

  const handleClose = React.useCallback(
    (nextOpen: boolean) => {
      // Sheet passes nextOpen=false when user hits ESC or clicks outside
      if (!nextOpen) onOpenChange(false);
      else onOpenChange(true);
    },
    [onOpenChange]
  );

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        className={cn(
          'w-full flex flex-col p-0', // we’ll do our own padding inside
          sizeClass
        )}
      >
        {/* HEADER */}
        <div className="border-b px-6 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <SheetHeader className="text-left space-y-1">
              <SheetTitle className="text-base font-semibold leading-tight break-words">
                {title}
              </SheetTitle>

              {(subtitle || mode) && (
                <SheetDescription className="text-xs leading-snug text-muted-foreground break-words">
                  {subtitle
                    ? subtitle
                    : mode === 'create'
                    ? 'Create new record'
                    : mode === 'edit'
                    ? 'Edit details'
                    : 'View details'}
                </SheetDescription>
              )}
            </SheetHeader>
          </div>

          {!hideCloseIcon && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* BODY */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full px-6 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <div className="text-sm">Loading...</div>
                </div>
              </div>
            ) : (
              children
            )}
          </ScrollArea>
        </div>

        {/* FOOTER */}
        {footerButtons && footerButtons.length > 0 && (
          <div className="border-t bg-background px-6 py-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {footerButtons.map((btn, idx) => {
                const LeftIcon = btn.iconLeft;
                const RightIcon = btn.iconRight;
                return (
                  <Button
                    key={idx}
                    variant={btn.variant || 'default'}
                    disabled={btn.disabled || btn.loading}
                    onClick={btn.onClick}
                    className="sm:min-w-[110px]"
                  >
                    {btn.loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : LeftIcon ? (
                      <LeftIcon className="h-4 w-4 mr-2" />
                    ) : null}
                    <span className="truncate">{btn.label}</span>
                    {RightIcon ? (
                      <RightIcon className="h-4 w-4 ml-2" />
                    ) : null}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

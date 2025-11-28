'use client';

import { useCallback } from 'react';

import { trackDialog } from '@/lib/utils/sentry-breadcrumbs';

type UseDialogTrackingOptions = {
  /** Name of the dialog for tracking purposes (e.g., 'confirm-delete', 'edit-bobblehead') */
  dialogName: string;
};

/**
 * Hook to create a tracked onOpenChange handler for dialogs
 * Automatically tracks dialog open/close events with Sentry breadcrumbs
 *
 * @example
 * ```tsx
 * const { trackedOnOpenChange } = useDialogTracking({ dialogName: 'confirm-delete' });
 *
 * return (
 *   <Dialog open={isOpen} onOpenChange={trackedOnOpenChange(setIsOpen)}>
 *     ...
 *   </Dialog>
 * );
 * ```
 */
export function useDialogTracking({ dialogName }: UseDialogTrackingOptions) {
  /**
   * Creates a tracked onOpenChange handler that wraps your state setter
   * Tracks open/close events before calling your handler
   */
  const trackedOnOpenChange = useCallback(
    (onOpenChange: (open: boolean) => void) => {
      return (open: boolean) => {
        trackDialog(dialogName, open ? 'opened' : 'closed');
        onOpenChange(open);
      };
    },
    [dialogName],
  );

  /**
   * Track dialog confirmation action manually
   * Call this when the user confirms/accepts the dialog action
   */
  const trackConfirm = useCallback(() => {
    trackDialog(dialogName, 'confirmed');
  }, [dialogName]);

  /**
   * Track dialog cancellation action manually
   * Call this when the user cancels/dismisses the dialog
   */
  const trackCancel = useCallback(() => {
    trackDialog(dialogName, 'cancelled');
  }, [dialogName]);

  return {
    trackCancel,
    trackConfirm,
    trackedOnOpenChange,
  };
}

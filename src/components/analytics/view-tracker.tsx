'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { ENUMS } from '@/lib/constants';
import type { ComponentTestIdProps } from '@/lib/test-ids';
import type { RecordViewInput } from '@/lib/validations/analytics.validation';

import { useServerAction } from '@/hooks/use-server-action';
import { recordViewAction } from '@/lib/actions/analytics/view-tracking.actions';
import { generateTestId } from '@/lib/test-ids';

type ViewTrackerProps = ClassName<
  Children<{
    metadata?: Record<string, unknown>;
    onViewRecorded?: (viewData: { isDuplicate: boolean; totalViews: number; viewId: string }) => void;
    sessionId?: string;
    targetId: string;
    targetType: ViewTrackerTarget;
    viewThreshold?: number; // percentage (0-1) of the element that must be visible
    viewTimeThreshold?: number; // milliseconds element must be visible before recording
  }>
> &
  ComponentTestIdProps;

type ViewTrackerTarget = (typeof ENUMS.CONTENT_VIEWS.TARGET_TYPE)[number];

export const ViewTracker = ({
  children,
  className,
  metadata,
  onViewRecorded,
  sessionId,
  targetId,
  targetType,
  testId,
  viewThreshold = 0.5,
  viewTimeThreshold = 1000,
}: ViewTrackerProps) => {
  const [sessionDuration, setSessionDuration] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewStartTimeRef = useRef<null | number>(null);
  const visibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasRecordedViewRef = useRef(false);

  const { userId } = useAuth();

  const viewTrackerTestId = testId || generateTestId('feature', 'view-details-button', targetType);

  const { execute: recordView, isExecuting } = useServerAction(recordViewAction, {
    isDisableToast: true,
    onAfterSuccess: () => {
      hasRecordedViewRef.current = true;
    },
    onSuccess: ({ data }) => {
      onViewRecorded?.(data.data);
    },
  });

  const recordViewCallback = useCallback(
    (duration: number) => {
      if (hasRecordedViewRef.current || isExecuting) return;

      const viewData: RecordViewInput = {
        ipAddress: undefined, // will be determined server-side
        metadata,
        referrerUrl: typeof window !== 'undefined' ? window.document.referrer || undefined : undefined,
        sessionId,
        targetId,
        targetType,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        viewDuration: Math.round(duration / 1000),
        viewerId: userId || null,
      };

      recordView(viewData);
    },
    [targetId, targetType, userId, sessionId, metadata, recordView, isExecuting],
  );

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // the page is hidden, stop tracking view duration
      if (viewStartTimeRef.current) {
        const currentDuration = Date.now() - viewStartTimeRef.current;
        setSessionDuration((prev) => prev + currentDuration);
        viewStartTimeRef.current = null;
      }
    } else {
      // page is visible again, restart tracking
      if (!hasRecordedViewRef.current) {
        viewStartTimeRef.current = Date.now();
      }
    }
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting && entry.intersectionRatio >= viewThreshold) {
          // element entered the viewport with sufficient visibility
          if (!viewStartTimeRef.current && !hasRecordedViewRef.current) {
            viewStartTimeRef.current = Date.now();

            // set timeout to record view after threshold time
            visibilityTimeoutRef.current = setTimeout(() => {
              if (viewStartTimeRef.current && !hasRecordedViewRef.current) {
                const duration = Date.now() - viewStartTimeRef.current;
                setSessionDuration((prev) => prev + duration);
                void recordViewCallback(duration + sessionDuration);
              }
            }, viewTimeThreshold);
          }
        } else {
          // element left viewport or insufficient visibility
          if (viewStartTimeRef.current) {
            const currentDuration = Date.now() - viewStartTimeRef.current;
            setSessionDuration((prev) => prev + currentDuration);
            viewStartTimeRef.current = null;
          }

          // clear timeout if the element is no longer visible
          if (visibilityTimeoutRef.current) {
            clearTimeout(visibilityTimeoutRef.current);
            visibilityTimeoutRef.current = null;
          }
        }
      },
      {
        root: null, // use viewport as the root
        rootMargin: '0px',
        threshold: [0, viewThreshold, 1],
      },
    );

    observer.observe(element);

    // listen for page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }

      // record final view duration if needed
      if (viewStartTimeRef.current && !hasRecordedViewRef.current) {
        const finalDuration = Date.now() - viewStartTimeRef.current + sessionDuration;
        if (finalDuration >= viewTimeThreshold) {
          void recordViewCallback(finalDuration);
        }
      }
    };
  }, [
    targetId,
    targetType,
    viewThreshold,
    viewTimeThreshold,
    recordViewCallback,
    handleVisibilityChange,
    sessionDuration,
  ]);

  return (
    <div className={className} data-testid={viewTrackerTestId} ref={containerRef}>
      {children}
    </div>
  );
};

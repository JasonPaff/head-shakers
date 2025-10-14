'use client';

import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
  FeatureType,
  PriorityLevel,
  SuggestionResult,
} from '@/lib/validations/feature-planner.validation';

import { useToggle } from '@/hooks/use-toggle';
import { startFeatureSuggestionAction } from '@/lib/actions/feature-planner/feature-planner.actions';
import {
  sseCompleteEventSchema,
  sseConnectedEventSchema,
  sseDeltaEventSchema,
  sseErrorEventSchema,
} from '@/lib/validations/feature-planner.validation';

/**
 * Status type for the suggestion workflow state machine
 */
type Status = 'complete' | 'connecting' | 'creating' | 'error' | 'idle' | 'streaming';

interface UseSuggestFeatureReturn {
  cancelSuggestion: () => void;
  clearResults: () => void;
  closeDialog: () => void;
  error: null | string;
  invokeSuggestion: (input: {
    additionalContext?: string;
    customModel?: string;
    featureType: FeatureType;
    pageOrComponent: string;
    priorityLevel: PriorityLevel;
  }) => Promise<void>;
  isDialogOpen: boolean;
  openDialog: () => void;
  partialText: string;
  progress: number;
  resetState: () => void;
  status: Status;
  suggestions: Array<SuggestionResult> | null;
}

export const useSuggestFeature = (): UseSuggestFeatureReturn => {
  // 1. useState hooks
  const [suggestions, setSuggestions] = useState<Array<SuggestionResult> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useToggle();
  const [error, setError] = useState<null | string>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [partialText, setPartialText] = useState<string>('');
  const [accumulatedLength, setAccumulatedLength] = useState<number>(0);

  // 2. Other hooks - useRef for stream reader
  const readerRef = useRef<null | ReadableStreamDefaultReader<Uint8Array>>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 3. useMutation for both Phase 1 (job creation) and Phase 2 (SSE connection)
  const { mutateAsync } = useMutation({
    mutationFn: async (input: {
      additionalContext?: string;
      customModel?: string;
      featureType: FeatureType;
      pageOrComponent: string;
      priorityLevel: PriorityLevel;
    }) => {
      // Phase 1: Create job
      const result = await startFeatureSuggestionAction(input);
      if (!result.data) {
        throw new Error(result.serverError || 'Failed to create suggestion job');
      }

      // Phase 2: Connect to SSE stream
      const jobId: string = result.data.data.jobId;
      await connectToStream(jobId);

      return result.data;
    },
    onError: (err: Error) => {
      const errorMessage = err.message || 'Failed to create or stream feature suggestion';
      setError(errorMessage);
      setStatus('error');
    },
  });

  // 4. useEffect for timeout handling
  useEffect(() => {
    if (status !== 'streaming') return;

    // set a 2-minute timeout
    timeoutRef.current = setTimeout(() => {
      void readerRef.current?.cancel();
      setError('Request timed out after 2 minutes');
      setStatus('error');
    }, 120000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [status]);

  // 5. Utility functions

  /**
   * Parse SSE message format
   */
  const parseSSEMessage = (message: string): null | { data: string; event: string } => {
    const lines = message.split('\n');
    let event = '';
    let data = '';

    for (const line of lines) {
      if (line.startsWith('event:')) {
        event = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        data = line.slice(5).trim();
      }
    }

    if (event && data) {
      return { data, event };
    }
    return null;
  };

  /**
   * Handle SSE events with runtime validation
   */
  const handleSSEEvent = useCallback((event: string, data: string) => {
    try {
      const jsonData: unknown = JSON.parse(data);

      switch (event) {
        case 'complete': {
          const parsed = sseCompleteEventSchema.parse(jsonData);
          setSuggestions(parsed.suggestions);
          setStatus('complete');
          setError(null);
          break;
        }

        case 'connected': {
          const parsed = sseConnectedEventSchema.parse(jsonData);
          console.log('[SSE] Connected:', parsed);
          break;
        }

        case 'delta': {
          const parsed = sseDeltaEventSchema.parse(jsonData);
          setPartialText((prev) => prev + parsed.text);
          setAccumulatedLength(parsed.totalLength);
          break;
        }

        case 'error': {
          const parsed = sseErrorEventSchema.parse(jsonData);
          setError(parsed.error);
          setStatus('error');
          break;
        }

        default:
          console.warn('[SSE] Unknown event type:', event);
      }
    } catch (err) {
      console.error('[SSE] Failed to parse or validate event data:', err);
      setError('Failed to parse server response');
      setStatus('error');
    }
  }, []);

  /**
   * Connect to SSE stream for Phase 2
   */
  const connectToStream = useCallback(
    async (jobId: string) => {
      try {
        setStatus('connecting');
        setError(null);

        const response = await fetch(`/api/feature-planner/suggest-feature/${jobId}`, {
          headers: { Accept: 'text/event-stream' },
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(`Failed to connect to stream: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        setStatus('streaming');
        const reader = response.body.getReader();
        readerRef.current = reader;

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          // Decode the chunk and add to buffer
          buffer += decoder.decode(value, { stream: true });

          // Split by double newline (SSE message separator)
          const messages = buffer.split('\n\n');

          // Keep the last incomplete message in the buffer
          buffer = messages.pop() || '';

          // Process complete messages
          for (const message of messages) {
            if (message.trim()) {
              const parsed = parseSSEMessage(message);
              if (parsed) {
                handleSSEEvent(parsed.event, parsed.data);
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // User cancelled - don't set error
          setStatus('idle');
        } else {
          const errorMessage = err instanceof Error ? err.message : 'Failed to connect to stream';
          setError(errorMessage);
          setStatus('error');
        }
      } finally {
        readerRef.current = null;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    },
    [handleSSEEvent],
  );

  // 6. Event handlers (prefixed with 'handle')

  const handleOpenDialog = useCallback(() => {
    setIsDialogOpen.on();
    setError(null);
    setSuggestions(null);
    setPartialText('');
    setAccumulatedLength(0);
    setStatus('idle');
  }, [setIsDialogOpen]);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen.off();
  }, [setIsDialogOpen]);

  const handleClearResults = useCallback(() => {
    setSuggestions(null);
    setError(null);
    setPartialText('');
    setAccumulatedLength(0);
  }, []);

  const handleResetState = useCallback(() => {
    setSuggestions(null);
    setError(null);
    setPartialText('');
    setAccumulatedLength(0);
    setStatus('idle');
    setIsDialogOpen.off();
  }, [setIsDialogOpen]);

  const handleCancelSuggestion = useCallback(() => {
    if (readerRef.current) {
      void readerRef.current.cancel();
      readerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setStatus('idle');
  }, []);

  const handleInvokeSuggestion = useCallback(
    async (input: {
      additionalContext?: string;
      customModel?: string;
      featureType: FeatureType;
      pageOrComponent: string;
      priorityLevel: PriorityLevel;
    }) => {
      // Reset state
      setSuggestions(null);
      setError(null);
      setPartialText('');
      setAccumulatedLength(0);
      setStatus('creating');

      // Start Phase 1: Create job
      await mutateAsync(input);
    },
    [mutateAsync],
  );

  // 7. Derived values for conditional rendering (prefixed with '_')
  const _estimatedProgress = useMemo(() => {
    // Typical suggestion is ~2000 characters
    // Cap at 95% until we get completion event
    return Math.min(95, Math.floor((accumulatedLength / 2000) * 100));
  }, [accumulatedLength]);

  return {
    cancelSuggestion: handleCancelSuggestion,
    clearResults: handleClearResults,
    closeDialog: handleCloseDialog,
    error,
    invokeSuggestion: handleInvokeSuggestion,
    isDialogOpen,
    openDialog: handleOpenDialog,
    partialText,
    progress: _estimatedProgress,
    resetState: handleResetState,
    status,
    suggestions,
  };
};

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import type { FileDiscoverySession } from '@/lib/db/schema/feature-planner.schema';
import type { StepData } from '@/lib/validations/feature-planner.validation';

interface UseFileDiscoveryOptions {
  customModel?: string;
  onStepDataUpdate: (stepData: Partial<StepData>) => void;
  planId: null | string;
  stepData: StepData;
}

interface UseFileDiscoveryReturn {
  discoverySession: FileDiscoverySession | null;
  isDiscoveringFiles: boolean;
  onFileDiscovery: () => Promise<void>;
  onFileSelection: (selectedFiles: Array<string>) => void;
}

export const useFileDiscovery = ({
  customModel,
  onStepDataUpdate,
  planId,
  stepData,
}: UseFileDiscoveryOptions): UseFileDiscoveryReturn => {
  // useState hooks
  const [isDiscoveringFiles, setIsDiscoveringFiles] = useState(false);
  const [discoverySession, setDiscoverySession] = useState<FileDiscoverySession | null>(null);

  // Event handlers
  const handleFileDiscovery = useCallback(async () => {
    if (!planId) {
      toast.error('Please complete step 1 first - plan ID is missing');
      return;
    }

    if (!stepData.step1?.originalRequest) {
      toast.error('Please complete step 1 first');
      return;
    }

    setIsDiscoveringFiles(true);
    toast.loading('Analyzing codebase and discovering relevant files...', { id: 'file-discovery' });

    try {
      const response = await fetch('/api/feature-planner/discover', {
        body: JSON.stringify({
          customModel,
          planId,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        signal: AbortSignal.timeout(620000), // 12-minute timeout
      });

      const data = (await response.json()) as {
        data?: FileDiscoverySession;
        isSuccess: boolean;
        message: string;
      };

      toast.dismiss('file-discovery');

      if (response.ok && data.isSuccess) {
        toast.success(data.message);

        if (data.data) {
          setDiscoverySession(data.data);
          setIsDiscoveringFiles(false);

          onStepDataUpdate({
            step2: {
              discoveredFiles: data.data.discoveredFiles || [],
              selectedFiles: [],
            },
          });
        } else {
          setIsDiscoveringFiles(false);
        }
      } else {
        toast.error(data.message || 'Failed to discover files');
        setIsDiscoveringFiles(false);
      }
    } catch (error) {
      console.error('File discovery error:', error);
      toast.dismiss('file-discovery');
      toast.error('Failed to discover files');
      setIsDiscoveringFiles(false);
    }
  }, [customModel, onStepDataUpdate, planId, stepData.step1?.originalRequest]);

  const handleFileSelection = useCallback(
    (selectedFiles: Array<string>) => {
      onStepDataUpdate({
        step2: {
          ...stepData.step2,
          discoveredFiles: stepData.step2?.discoveredFiles || [],
          selectedFiles,
        },
      });
    },
    [onStepDataUpdate, stepData.step2],
  );

  return {
    discoverySession,
    isDiscoveringFiles,
    onFileDiscovery: handleFileDiscovery,
    onFileSelection: handleFileSelection,
  };
};

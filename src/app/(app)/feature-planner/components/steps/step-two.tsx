'use client';

import type { ComponentProps } from 'react';

import { SearchIcon } from 'lucide-react';

import type { FileDiscoverySession } from '@/lib/db/schema/feature-planner.schema';

import { ExecutionMetrics } from '@/app/(app)/feature-planner/components/execution-metrics';
import { FileAutocomplete } from '@/app/(app)/feature-planner/components/file-autocomplete';
import { FileDiscoveryResults } from '@/app/(app)/feature-planner/components/file-discovery-results';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface StepTwoProps extends ComponentProps<'div'> {
  discoverySession?: FileDiscoverySession | null;
  isDiscoveringFiles?: boolean;
  manualFiles?: Array<{
    description: string;
    filePath: string;
    priority: 'critical' | 'high' | 'low' | 'medium';
  }>;
  onFileAdded: (file: {
    description: string;
    filePath: string;
    priority: 'critical' | 'high' | 'low' | 'medium';
  }) => void;
  onFileDiscovery?: () => void;
  onFileSelection?: (files: Array<string>) => void;
  onRemoveManualFile?: (filePath: string) => void;
  selectedFiles?: Array<string>;
}

export const StepTwo = ({
  className,
  discoverySession,
  isDiscoveringFiles = false,
  manualFiles = [],
  onFileAdded,
  onFileDiscovery,
  onFileSelection,
  onRemoveManualFile,
  selectedFiles = [],
  ...props
}: StepTwoProps) => {
  const stepTwoTestId = generateTestId('feature', 'card');

  // if currently discovering files, show a loading state
  if (isDiscoveringFiles) {
    return (
      <div className={cn('space-y-6', className)} data-testid={stepTwoTestId} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2'}>
              <SearchIcon aria-hidden className={'size-5 text-primary'} />
              Step 2: File Discovery
            </CardTitle>
          </CardHeader>
          <CardContent className={'space-y-4'}>
            <div className={'rounded-lg bg-muted p-6'}>
              <div className={'flex items-center gap-3'}>
                <div
                  className={'size-5 animate-spin rounded-full border-2 border-primary border-t-transparent'}
                />
                <div>
                  <h3 className={'font-medium'}>Discovering files...</h3>
                  <p className={'text-sm text-muted-foreground'}>
                    Analyzing your codebase with specialized agents. This may take 30-60 seconds.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // if no discovery session, show start discovery message
  if (!discoverySession) {
    return (
      <div className={cn('space-y-6', className)} data-testid={stepTwoTestId} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2'}>
              <SearchIcon aria-hidden className={'size-5 text-primary'} />
              Step 2: File Discovery
            </CardTitle>
          </CardHeader>
          <CardContent className={'space-y-4'}>
            <div className={'rounded-lg bg-muted p-4'}>
              <h3 className={'mb-2 font-medium'}>Run File Discovery</h3>
              <p className={'mb-4 text-sm text-muted-foreground'}>
                This step will automatically analyze your codebase to identify relevant files for implementing
                the feature request.
              </p>
              <Conditional isCondition={!!onFileDiscovery}>
                <button
                  className={
                    'rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
                  }
                  onClick={onFileDiscovery}
                  type={'button'}
                >
                  Start File Discovery
                </button>
              </Conditional>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const _hasDiscoveryFiles = (discoverySession.discoveredFiles || []).length > 0;

  return (
    <div className={cn('space-y-6', className)} data-testid={stepTwoTestId} {...props}>
      {/* Execution Metrics */}
      <ExecutionMetrics
        completionTokens={discoverySession.completionTokens ?? 0}
        executionTimeMs={discoverySession.executionTimeMs ?? 0}
        promptTokens={discoverySession.promptTokens ?? 0}
        status={discoverySession.status}
        totalTokens={discoverySession.totalTokens ?? 0}
      />

      {/* File Discovery Results */}
      <Conditional isCondition={_hasDiscoveryFiles}>
        <FileDiscoveryResults
          manualFiles={manualFiles}
          onRemoveManualFile={onRemoveManualFile}
          onRunDiscovery={() => {}}
          onSelectFiles={onFileSelection}
          selectedFiles={selectedFiles}
          session={discoverySession}
        />
      </Conditional>

      {/* Manual File Addition */}
      <FileAutocomplete onFileAdded={onFileAdded} />
    </div>
  );
};

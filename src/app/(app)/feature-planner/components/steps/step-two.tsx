'use client';

import type { ComponentProps } from 'react';

import { SearchIcon } from 'lucide-react';

import type { FileDiscoverySession } from '@/lib/db/schema/feature-planner.schema';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { ExecutionMetrics } from '@/app/(app)/feature-planner/components/execution-metrics';
import { FileAutocomplete } from '@/app/(app)/feature-planner/components/file-autocomplete';
import { FileDiscoveryResults } from '@/app/(app)/feature-planner/components/file-discovery-results';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface StepTwoProps extends ComponentProps<'div'>, ComponentTestIdProps {
  discoverySession?: FileDiscoverySession | null;
  onFileAdded: (file: {
    description: string;
    filePath: string;
    priority: 'critical' | 'high' | 'low' | 'medium';
  }) => void;
  onFileSelection?: (files: Array<string>) => void;
  selectedFiles?: Array<string>;
}

/**
 * Step 2: File Discovery
 * Analyzes codebase to identify relevant files for feature implementation
 */
export const StepTwo = ({
  className,
  discoverySession,
  onFileAdded,
  onFileSelection,
  selectedFiles = [],
  testId,
  ...props
}: StepTwoProps) => {
  const stepTwoTestId = testId || generateTestId('feature', 'card');

  // If no discovery session, show coming soon message
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
              <p className={'text-sm text-muted-foreground'}>
                This step will automatically analyze your codebase to identify relevant files for implementing
                the feature request. Click the button above to start file discovery.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const discoveredFiles = discoverySession.discoveredFiles || [];

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
      {discoveredFiles.length > 0 && (
        <FileDiscoveryResults
          onRunDiscovery={() => {}}
          onSelectFiles={onFileSelection}
          selectedFiles={selectedFiles}
          session={discoverySession}
        />
      )}

      {/* Manual File Addition */}
      <FileAutocomplete onFileAdded={onFileAdded} />
    </div>
  );
};

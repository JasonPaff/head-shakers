'use client';

import type { ComponentProps } from 'react';

import { SearchIcon } from 'lucide-react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface StepTwoProps extends ComponentProps<'div'>, ComponentTestIdProps {
  // Future props for file discovery functionality
  discoveredFiles?: Array<{
    description: string;
    filePath: string;
    priority: 'high' | 'low' | 'medium';
    relevanceScore: number;
  }>;
  onFileSelection?: (files: Array<string>) => void;
  selectedFiles?: Array<string>;
}

/**
 * Step 2: File Discovery
 * Analyzes codebase to identify relevant files for feature implementation
 */
export const StepTwo = ({
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  discoveredFiles: _discoveredFiles = [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFileSelection: _onFileSelection,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedFiles: _selectedFiles = [],
  testId,
  ...props
}: StepTwoProps) => {
  const stepTwoTestId = testId || generateTestId('feature', 'card');

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
            <h3 className={'mb-2 font-medium'}>Coming in Phase 2</h3>
            <p className={'text-sm text-muted-foreground'}>
              This step will automatically analyze your codebase to identify relevant files for implementing the
              feature request. It will use advanced static analysis and AI-powered code understanding to suggest
              files that need modification or can serve as implementation patterns.
            </p>
          </div>

          <div className={'space-y-3'}>
            <h4 className={'font-medium'}>Planned Features:</h4>
            <ul className={'space-y-1 text-sm text-muted-foreground'}>
              <li>• Automatic file relevance scoring</li>
              <li>• Priority-based file categorization</li>
              <li>• Pattern matching for similar implementations</li>
              <li>• Dependency analysis and impact assessment</li>
              <li>• Interactive file selection interface</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
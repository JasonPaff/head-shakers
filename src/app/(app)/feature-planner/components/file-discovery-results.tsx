'use client';

import { FolderOpen } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import type { FileDiscoverySession } from '@/lib/db/schema/feature-planner.schema';

import { FileSelectionControls } from '@/app/(app)/feature-planner/components/file-discovery/file-selection-controls';
import { PriorityGroup } from '@/app/(app)/feature-planner/components/file-discovery/priority-group';
import { PriorityStatsGrid } from '@/app/(app)/feature-planner/components/file-discovery/priority-stats-grid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';

interface FileDiscoveryResultsProps {
  manualFiles?: Array<{
    description: string;
    filePath: string;
    priority: 'critical' | 'high' | 'low' | 'medium';
  }>;
  onRemoveManualFile?: (filePath: string) => void;
  onRunDiscovery: () => void;
  onSelectFiles?: (fileIds: Array<string>) => void;
  selectedFiles?: Array<string>;
  session: FileDiscoverySession | null;
}

export const FileDiscoveryResults = ({
  manualFiles = [],
  onRemoveManualFile,
  onRunDiscovery,
  onSelectFiles,
  selectedFiles = [],
  session,
}: FileDiscoveryResultsProps) => {
  // useMemo hooks
  const files = useMemo(() => session?.discoveredFiles || [], [session]);

  const groupedFiles = useMemo(() => {
    return {
      critical: files.filter((f) => f.priority === 'critical'),
      high: files.filter((f) => f.priority === 'high'),
      low: files.filter((f) => f.priority === 'low'),
      medium: files.filter((f) => f.priority === 'medium'),
    };
  }, [files]);

  const groupedManualFiles = useMemo(() => {
    return {
      critical: manualFiles.filter((f) => f.priority === 'critical'),
      high: manualFiles.filter((f) => f.priority === 'high'),
      low: manualFiles.filter((f) => f.priority === 'low'),
      medium: manualFiles.filter((f) => f.priority === 'medium'),
    };
  }, [manualFiles]);

  const allFileKeys = useMemo((): Array<string> => {
    const discoveredKeys = files.map((file, index) => `${file.filePath}-${index}`);
    const manualKeys = manualFiles.map((file) => `manual-${file.filePath}`);
    return [...discoveredKeys, ...manualKeys];
  }, [files, manualFiles]);

  // Event handlers
  const handleSelectAll = useCallback(() => {
    if (onSelectFiles) {
      onSelectFiles(allFileKeys);
    }
  }, [allFileKeys, onSelectFiles]);

  const handleDeselectAll = useCallback(() => {
    if (onSelectFiles) {
      onSelectFiles([]);
    }
  }, [onSelectFiles]);

  // Derived variables
  const _isAllSelected = allFileKeys.length > 0 && allFileKeys.every((key) => selectedFiles.includes(key));
  const _isFilesSelectable = onSelectFiles && allFileKeys.length > 0;
  const _hasManualFiles = manualFiles.length > 0;
  const _manualFilesText =
    _hasManualFiles ? ` + ${manualFiles.length} manual file${manualFiles.length !== 1 ? 's' : ''}` : '';
  const _hasArchitectureInsights = !!session?.architectureInsights;

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <FolderOpen aria-hidden className={'size-5'} />
            File Discovery
          </CardTitle>
          <CardDescription>Run file discovery to identify relevant files for implementation</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRunDiscovery}>
            <FolderOpen aria-hidden className={'mr-2 size-4'} />
            Run File Discovery
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {/* Header Section */}
      <CardHeader>
        <CardTitle className={'flex items-center gap-2'}>
          <FolderOpen aria-hidden className={'size-5'} />
          File Discovery Results
        </CardTitle>
        <CardDescription>
          Found {session.totalFilesFound} relevant file{session.totalFilesFound !== 1 ? 's' : ''} in{' '}
          {session.executionTimeMs ? `${Math.round(session.executionTimeMs / 1000)}s` : 'N/A'}
          {_manualFilesText}
        </CardDescription>
      </CardHeader>

      <CardContent className={'space-y-6'}>
        {/* Summary Stats Section */}
        <PriorityStatsGrid
          criticalCount={session.criticalPriorityCount}
          highCount={session.highPriorityCount}
          lowCount={session.lowPriorityCount}
          manualCriticalCount={groupedManualFiles.critical.length}
          manualHighCount={groupedManualFiles.high.length}
          manualLowCount={groupedManualFiles.low.length}
          manualMediumCount={groupedManualFiles.medium.length}
          mediumCount={session.mediumPriorityCount}
        />

        {/* File Selection Controls Section */}
        <Conditional isCondition={_isFilesSelectable}>
          <FileSelectionControls
            isAllSelected={_isAllSelected}
            onDeselectAll={handleDeselectAll}
            onSelectAll={handleSelectAll}
            selectedCount={selectedFiles.length}
          />
        </Conditional>

        {/* Architecture Insights Section */}
        <Conditional isCondition={_hasArchitectureInsights}>
          <div className={'rounded-lg border bg-blue-50 p-4'}>
            <h4 className={'mb-2 font-medium text-blue-900'}>Architecture Insights</h4>
            <p className={'text-sm text-blue-800'}>{session.architectureInsights}</p>
          </div>
        </Conditional>

        {/* Files by Priority Section */}
        <div className={'space-y-4'}>
          <PriorityGroup
            files={groupedFiles.critical}
            label={'Critical'}
            manualFiles={groupedManualFiles.critical}
            onRemoveManualFile={onRemoveManualFile}
            onSelectFiles={onSelectFiles || (() => {})}
            selectedFiles={selectedFiles}
            variant={'destructive'}
          />

          <PriorityGroup
            files={groupedFiles.high}
            label={'High'}
            manualFiles={groupedManualFiles.high}
            onRemoveManualFile={onRemoveManualFile}
            onSelectFiles={onSelectFiles || (() => {})}
            selectedFiles={selectedFiles}
            variant={'default'}
          />

          <PriorityGroup
            files={groupedFiles.medium}
            label={'Medium'}
            manualFiles={groupedManualFiles.medium}
            onRemoveManualFile={onRemoveManualFile}
            onSelectFiles={onSelectFiles || (() => {})}
            selectedFiles={selectedFiles}
            variant={'secondary'}
          />

          <PriorityGroup
            files={groupedFiles.low}
            label={'Low'}
            manualFiles={groupedManualFiles.low}
            onRemoveManualFile={onRemoveManualFile}
            onSelectFiles={onSelectFiles || (() => {})}
            selectedFiles={selectedFiles}
            variant={'outline'}
          />
        </div>
      </CardContent>
    </Card>
  );
};

'use client';

import { CheckCircle2, ChevronDown, ChevronRight, File, FolderOpen, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { FileDiscoverySession } from '@/lib/db/schema/feature-planner.schema';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/utils/tailwind-utils';

interface FileDiscoveryResultsProps {
  manualFiles?: Array<{
    description: string;
    filePath: string;
    priority: 'critical' | 'high' | 'low' | 'medium';
  }>;
  onRemoveManualFile?: (filePath: string) => void;
  onRunDiscovery: () => void;
  onSelectFiles?: (fileIds: string[]) => void;
  selectedFiles?: string[];
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
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    critical: false,
    high: false,
    low: false,
    manual: false,
    medium: false,
  });

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <FolderOpen className={'size-5'} />
            File Discovery
          </CardTitle>
          <CardDescription>Run file discovery to identify relevant files for implementation</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRunDiscovery}>
            <FolderOpen className={'mr-2 size-4'} />
            Run File Discovery
          </Button>
        </CardContent>
      </Card>
    );
  }

  const files = session.discoveredFiles || [];

  // Group files by priority
  const criticalFiles = files.filter((f) => f.priority === 'critical');
  const highFiles = files.filter((f) => f.priority === 'high');
  const mediumFiles = files.filter((f) => f.priority === 'medium');
  const lowFiles = files.filter((f) => f.priority === 'low');

  // Group manual files by priority
  const manualCritical = manualFiles.filter((f) => f.priority === 'critical');
  const manualHigh = manualFiles.filter((f) => f.priority === 'high');
  const manualMedium = manualFiles.filter((f) => f.priority === 'medium');
  const manualLow = manualFiles.filter((f) => f.priority === 'low');

  const priorityGroups = [
    {
      files: criticalFiles,
      label: 'Critical',
      manualFiles: manualCritical,
      sectionKey: 'critical',
      variant: 'destructive' as const,
    },
    {
      files: highFiles,
      label: 'High',
      manualFiles: manualHigh,
      sectionKey: 'high',
      variant: 'default' as const,
    },
    {
      files: mediumFiles,
      label: 'Medium',
      manualFiles: manualMedium,
      sectionKey: 'medium',
      variant: 'secondary' as const,
    },
    { files: lowFiles, label: 'Low', manualFiles: manualLow, sectionKey: 'low', variant: 'outline' as const },
  ];

  // Get all file keys (discovered + manual)
  const getAllFileKeys = (): string[] => {
    const discoveredKeys = files.map((file, index) => `${file.filePath}-${index}`);
    const manualKeys = manualFiles.map((file) => `manual-${file.filePath}`);
    return [...discoveredKeys, ...manualKeys];
  };

  const getGroupFileKeys = (priorityFiles: typeof files, groupManualFiles: typeof manualFiles): string[] => {
    const discoveredKeys = priorityFiles.map((file, index) => `${file.filePath}-${index}`);
    const manualKeys = groupManualFiles.map((file) => `manual-${file.filePath}`);
    return [...discoveredKeys, ...manualKeys];
  };

  const handleSelectAll = () => {
    if (onSelectFiles) {
      onSelectFiles(getAllFileKeys());
    }
  };

  const handleDeselectAll = () => {
    if (onSelectFiles) {
      onSelectFiles([]);
    }
  };

  const handleSelectGroup = (groupFiles: string[]) => {
    if (onSelectFiles) {
      const newSelection = [...new Set([...groupFiles, ...selectedFiles])];
      onSelectFiles(newSelection);
    }
  };

  const handleDeselectGroup = (groupFiles: string[]) => {
    if (onSelectFiles) {
      const newSelection = selectedFiles.filter((key) => !groupFiles.includes(key));
      onSelectFiles(newSelection);
    }
  };

  const allFileKeys = getAllFileKeys();
  const allSelected = allFileKeys.length > 0 && allFileKeys.every((key) => selectedFiles.includes(key));
  const hasManualFiles = manualFiles.length > 0;
  const canSelectFiles = onSelectFiles && allFileKeys.length > 0;
  const manualFilesText =
    hasManualFiles ? ` + ${manualFiles.length} manual file${manualFiles.length !== 1 ? 's' : ''}` : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className={'flex items-center gap-2'}>
          <FolderOpen className={'size-5'} />
          File Discovery Results
        </CardTitle>
        <CardDescription>
          Found {session.totalFilesFound} relevant file{session.totalFilesFound !== 1 ? 's' : ''} in{' '}
          {session.executionTimeMs ? `${Math.round(session.executionTimeMs / 1000)}s` : 'N/A'}
          {manualFilesText}
        </CardDescription>
      </CardHeader>
      <CardContent className={'space-y-6'}>
        {/* Summary Stats */}
        <div className={'grid grid-cols-4 gap-4'}>
          <div className={'rounded-lg border bg-red-50 p-3'}>
            <p className={'text-sm font-medium text-red-900'}>Critical</p>
            <p className={'text-2xl font-bold text-red-600'}>
              {session.criticalPriorityCount}
              {manualCritical.length > 0 && <span className={'text-sm'}> +{manualCritical.length}</span>}
            </p>
          </div>
          <div className={'rounded-lg border bg-orange-50 p-3'}>
            <p className={'text-sm font-medium text-orange-900'}>High</p>
            <p className={'text-2xl font-bold text-orange-600'}>
              {session.highPriorityCount}
              {manualHigh.length > 0 && <span className={'text-sm'}> +{manualHigh.length}</span>}
            </p>
          </div>
          <div className={'rounded-lg border bg-yellow-50 p-3'}>
            <p className={'text-sm font-medium text-yellow-900'}>Medium</p>
            <p className={'text-2xl font-bold text-yellow-600'}>
              {session.mediumPriorityCount}
              {manualMedium.length > 0 && <span className={'text-sm'}> +{manualMedium.length}</span>}
            </p>
          </div>
          <div className={'rounded-lg border bg-gray-50 p-3'}>
            <p className={'text-sm font-medium text-gray-900'}>Low</p>
            <p className={'text-2xl font-bold text-gray-600'}>
              {session.lowPriorityCount}
              {manualLow.length > 0 && <span className={'text-sm'}> +{manualLow.length}</span>}
            </p>
          </div>
        </div>

        {/* Global Select/Deselect All */}
        {canSelectFiles && (
          <div className={'flex items-center gap-2'}>
            <Button
              onClick={allSelected ? handleDeselectAll : handleSelectAll}
              size={'sm'}
              variant={'outline'}
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
            {selectedFiles.length > 0 && (
              <div className={'flex items-center gap-2 rounded-lg border bg-primary/5 px-3 py-2'}>
                <CheckCircle2 className={'size-4 text-primary'} />
                <span className={'text-sm font-medium'}>
                  {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                </span>
              </div>
            )}
          </div>
        )}

        {/* Architecture Insights */}
        {session.architectureInsights && (
          <div className={'rounded-lg border bg-blue-50 p-4'}>
            <h4 className={'mb-2 font-medium text-blue-900'}>Architecture Insights</h4>
            <p className={'text-sm text-blue-800'}>{session.architectureInsights}</p>
          </div>
        )}

        {/* Files by Priority */}
        <div className={'space-y-4'}>
          {priorityGroups.map(
            ({ files: priorityFiles, label, manualFiles: groupManualFiles, sectionKey, variant }) => {
              const totalFiles = priorityFiles.length + groupManualFiles.length;
              if (totalFiles === 0) return null;

              const isCollapsed = collapsedSections[sectionKey];
              const groupFileKeys = getGroupFileKeys(priorityFiles, groupManualFiles);
              const groupAllSelected = groupFileKeys.every((key) => selectedFiles.includes(key));

              return (
                <div className={'space-y-2'} key={label}>
                  <div className={'flex items-center justify-between'}>
                    <div className={'flex items-center gap-2'}>
                      <button
                        className={'text-muted-foreground transition-colors hover:text-foreground'}
                        onClick={() => toggleSection(sectionKey)}
                        type={'button'}
                      >
                        {isCollapsed ?
                          <ChevronRight className={'size-5'} />
                        : <ChevronDown className={'size-5'} />}
                      </button>
                      <h4 className={'font-medium'}>{label} Priority</h4>
                      <Badge variant={variant}>
                        {totalFiles} file{totalFiles !== 1 ? 's' : ''}
                      </Badge>
                      {groupManualFiles.length > 0 && (
                        <Badge variant={'outline'}>{groupManualFiles.length} manual</Badge>
                      )}
                    </div>
                    {onSelectFiles && !isCollapsed && (
                      <Button
                        onClick={() =>
                          groupAllSelected ?
                            handleDeselectGroup(groupFileKeys)
                          : handleSelectGroup(groupFileKeys)
                        }
                        size={'sm'}
                        variant={'ghost'}
                      >
                        {groupAllSelected ? 'Deselect Group' : 'Select Group'}
                      </Button>
                    )}
                  </div>

                  {!isCollapsed && (
                    <div className={'space-y-2 pl-7'}>
                      {/* Discovered Files */}
                      {priorityFiles.map((file, index) => {
                        const fileKey = `${file.filePath}-${index}`;
                        const isSelected = selectedFiles.includes(fileKey);

                        return (
                          <div
                            className={cn(
                              'rounded-lg border p-3 transition-colors',
                              isSelected && 'border-primary bg-primary/5',
                            )}
                            key={fileKey}
                          >
                            <div className={'flex items-start gap-3'}>
                              {onSelectFiles && (
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) => {
                                    const newSelection =
                                      checked ?
                                        [...selectedFiles, fileKey]
                                      : selectedFiles.filter((id) => id !== fileKey);
                                    onSelectFiles(newSelection);
                                  }}
                                />
                              )}

                              <div className={'flex-1 space-y-2'}>
                                <div className={'flex items-start justify-between'}>
                                  <div className={'flex items-center gap-2'}>
                                    <File className={'size-4 text-muted-foreground'} />
                                    <code className={'font-mono text-sm'}>{file.filePath}</code>
                                  </div>
                                  <div className={'flex items-center gap-2'}>
                                    <Badge variant={'outline'}>Score: {file.relevanceScore}</Badge>
                                    {file.fileExists && <CheckCircle2 className={'size-4 text-green-500'} />}
                                  </div>
                                </div>

                                {file.role && (
                                  <div className={'flex items-center gap-2 text-sm'}>
                                    <span className={'font-medium text-muted-foreground'}>Role:</span>
                                    <span>{file.role}</span>
                                  </div>
                                )}

                                {file.description && (
                                  <p className={'text-sm text-muted-foreground'}>{file.description}</p>
                                )}

                                {file.integrationPoint && (
                                  <div className={'flex items-start gap-2 text-sm'}>
                                    <span className={'font-medium text-muted-foreground'}>Integration:</span>
                                    <span className={'text-muted-foreground'}>{file.integrationPoint}</span>
                                  </div>
                                )}

                                {file.reasoning && (
                                  <div className={'rounded bg-muted/50 p-2 text-xs text-muted-foreground'}>
                                    <span className={'font-medium'}>Reasoning:</span> {file.reasoning}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Manual Files */}
                      {groupManualFiles.map((file) => {
                        const fileKey = `manual-${file.filePath}`;
                        const isSelected = selectedFiles.includes(fileKey);

                        return (
                          <div
                            className={cn(
                              'rounded-lg border border-dashed p-3 transition-colors',
                              isSelected && 'border-primary bg-primary/5',
                            )}
                            key={fileKey}
                          >
                            <div className={'flex items-start gap-3'}>
                              {onSelectFiles && (
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) => {
                                    const newSelection =
                                      checked ?
                                        [...selectedFiles, fileKey]
                                      : selectedFiles.filter((id) => id !== fileKey);
                                    onSelectFiles(newSelection);
                                  }}
                                />
                              )}

                              <div className={'flex-1 space-y-2'}>
                                <div className={'flex items-start justify-between'}>
                                  <div className={'flex items-center gap-2'}>
                                    <File className={'size-4 text-muted-foreground'} />
                                    <code className={'font-mono text-sm'}>{file.filePath}</code>
                                    <Badge variant={'outline'}>Manual</Badge>
                                  </div>
                                  {onRemoveManualFile && (
                                    <Button
                                      onClick={() => onRemoveManualFile(file.filePath)}
                                      size={'sm'}
                                      variant={'ghost'}
                                    >
                                      <Trash2 className={'size-4 text-destructive'} />
                                    </Button>
                                  )}
                                </div>

                                {file.description && (
                                  <p className={'text-sm text-muted-foreground'}>{file.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            },
          )}
        </div>
      </CardContent>
    </Card>
  );
};

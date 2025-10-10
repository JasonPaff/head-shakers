'use client';

import { CheckCircle2, File, FolderOpen } from 'lucide-react';

import type { FileDiscoverySession } from '@/lib/db/schema/feature-planner.schema';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/utils/tailwind-utils';

interface FileDiscoveryResultsProps {
  onRunDiscovery: () => void;
  onSelectFiles?: (fileIds: string[]) => void;
  selectedFiles?: string[];
  session: FileDiscoverySession | null;
}

export const FileDiscoveryResults = ({
  onRunDiscovery,
  onSelectFiles,
  selectedFiles = [],
  session,
}: FileDiscoveryResultsProps) => {
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

  const priorityGroups = [
    { files: criticalFiles, label: 'Critical', variant: 'destructive' as const },
    { files: highFiles, label: 'High', variant: 'default' as const },
    { files: mediumFiles, label: 'Medium', variant: 'secondary' as const },
    { files: lowFiles, label: 'Low', variant: 'outline' as const },
  ];

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
        </CardDescription>
      </CardHeader>
      <CardContent className={'space-y-6'}>
        {/* Summary Stats */}
        <div className={'grid grid-cols-4 gap-4'}>
          <div className={'rounded-lg border bg-red-50 p-3'}>
            <p className={'text-sm font-medium text-red-900'}>Critical</p>
            <p className={'text-2xl font-bold text-red-600'}>{session.criticalPriorityCount}</p>
          </div>
          <div className={'rounded-lg border bg-orange-50 p-3'}>
            <p className={'text-sm font-medium text-orange-900'}>High</p>
            <p className={'text-2xl font-bold text-orange-600'}>{session.highPriorityCount}</p>
          </div>
          <div className={'rounded-lg border bg-yellow-50 p-3'}>
            <p className={'text-sm font-medium text-yellow-900'}>Medium</p>
            <p className={'text-2xl font-bold text-yellow-600'}>{session.mediumPriorityCount}</p>
          </div>
          <div className={'rounded-lg border bg-gray-50 p-3'}>
            <p className={'text-sm font-medium text-gray-900'}>Low</p>
            <p className={'text-2xl font-bold text-gray-600'}>{session.lowPriorityCount}</p>
          </div>
        </div>

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
            ({ files: priorityFiles, label, variant }) =>
              priorityFiles.length > 0 && (
                <div className={'space-y-2'} key={label}>
                  <div className={'flex items-center gap-2'}>
                    <h4 className={'font-medium'}>{label} Priority</h4>
                    <Badge variant={variant}>
                      {priorityFiles.length} file{priorityFiles.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  <div className={'space-y-2'}>
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
                                  const newSelection = checked ?
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
                  </div>
                </div>
              ),
          )}
        </div>

        {/* Actions */}
        {selectedFiles.length > 0 && (
          <div className={'flex items-center gap-2 rounded-lg border bg-primary/5 p-3'}>
            <CheckCircle2 className={'size-5 text-primary'} />
            <span className={'text-sm font-medium'}>
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

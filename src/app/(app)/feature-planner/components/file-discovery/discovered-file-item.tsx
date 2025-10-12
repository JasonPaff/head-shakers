'use client';

import { CheckCircle2, File } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Conditional } from '@/components/ui/conditional';
import { cn } from '@/utils/tailwind-utils';

interface DiscoveredFile {
  description?: null | string;
  filePath: string;
  integrationPoint?: null | string;
  isFileExists?: boolean;
  priority: 'critical' | 'high' | 'low' | 'medium';
  reasoning?: null | string;
  relevanceScore: number;
  role?: null | string;
}

interface DiscoveredFileItemProps {
  file: DiscoveredFile;
  isSelected: boolean;
  onToggleSelection: (checked: boolean) => void;
}

export const DiscoveredFileItem = ({ file, isSelected, onToggleSelection }: DiscoveredFileItemProps) => {
  return (
    <div
      className={cn('rounded-lg border p-3 transition-colors', isSelected && 'border-primary bg-primary/5')}
    >
      <div className={'flex items-start gap-3'}>
        {/* Selection Checkbox */}
        <Checkbox checked={isSelected} onCheckedChange={onToggleSelection} />

        <div className={'flex-1 space-y-2'}>
          {/* File Path and Score */}
          <div className={'flex items-start justify-between'}>
            <div className={'flex items-center gap-2'}>
              <File aria-hidden className={'size-4 text-muted-foreground'} />
              <code className={'font-mono text-sm'}>{file.filePath}</code>
            </div>
            <div className={'flex items-center gap-2'}>
              <Badge variant={'outline'}>Score: {file.relevanceScore}</Badge>
              <Conditional isCondition={file.isFileExists}>
                <CheckCircle2 aria-hidden className={'size-4 text-green-500'} />
              </Conditional>
            </div>
          </div>

          {/* Role */}
          <Conditional isCondition={!!file.role}>
            <div className={'flex items-center gap-2 text-sm'}>
              <span className={'font-medium text-muted-foreground'}>Role:</span>
              <span>{file.role}</span>
            </div>
          </Conditional>

          {/* Description */}
          <Conditional isCondition={!!file.description}>
            <p className={'text-sm text-muted-foreground'}>{file.description}</p>
          </Conditional>

          {/* Integration Point */}
          <Conditional isCondition={!!file.integrationPoint}>
            <div className={'flex items-start gap-2 text-sm'}>
              <span className={'font-medium text-muted-foreground'}>Integration:</span>
              <span className={'text-muted-foreground'}>{file.integrationPoint}</span>
            </div>
          </Conditional>

          {/* Reasoning */}
          <Conditional isCondition={!!file.reasoning}>
            <div className={'rounded bg-muted/50 p-2 text-xs text-muted-foreground'}>
              <span className={'font-medium'}>Reasoning:</span> {file.reasoning}
            </div>
          </Conditional>
        </div>
      </div>
    </div>
  );
};

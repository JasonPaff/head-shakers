'use client';

import { File, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Conditional } from '@/components/ui/conditional';
import { cn } from '@/utils/tailwind-utils';

interface ManualFile {
  description: string;
  filePath: string;
  priority: 'critical' | 'high' | 'low' | 'medium';
}

interface ManualFileItemProps {
  file: ManualFile;
  isSelected: boolean;
  onRemove?: () => void;
  onToggleSelection: (checked: boolean) => void;
}

export const ManualFileItem = ({ file, isSelected, onRemove, onToggleSelection }: ManualFileItemProps) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-dashed p-3 transition-colors',
        isSelected && 'border-primary bg-primary/5',
      )}
    >
      <div className={'flex items-start gap-3'}>
        {/* Selection Checkbox */}
        <Checkbox checked={isSelected} onCheckedChange={onToggleSelection} />

        <div className={'flex-1 space-y-2'}>
          {/* File Path and Manual Badge */}
          <div className={'flex items-start justify-between'}>
            <div className={'flex items-center gap-2'}>
              <File aria-hidden className={'size-4 text-muted-foreground'} />
              <code className={'font-mono text-sm'}>{file.filePath}</code>
              <Badge variant={'outline'}>Manual</Badge>
            </div>

            {/* Remove Button */}
            <Conditional isCondition={!!onRemove}>
              <Button onClick={onRemove} size={'sm'} variant={'ghost'}>
                <Trash2 aria-hidden className={'size-4 text-destructive'} />
              </Button>
            </Conditional>
          </div>

          {/* Description */}
          <Conditional isCondition={!!file.description}>
            <p className={'text-sm text-muted-foreground'}>{file.description}</p>
          </Conditional>
        </div>
      </div>
    </div>
  );
};

'use client';

import { CheckCircle2, Edit2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Conditional } from '@/components/ui/conditional';

interface RefinementMetadataProps {
  executionTimeMs: null | number | undefined;
  isEdited: boolean;
  isSelected: boolean;
  totalTokens: null | number | undefined;
  wordCount: null | number | undefined;
}

export const RefinementMetadata = ({
  executionTimeMs,
  isEdited,
  isSelected,
  totalTokens,
  wordCount,
}: RefinementMetadataProps) => {
  const _wordCount = wordCount ?? 0;
  const _executionTime = executionTimeMs ? `${Math.round(executionTimeMs / 1000)}s` : 'N/A';

  return (
    <div className={'flex items-center gap-2 text-sm'}>
      {/* Word Count */}
      <Badge variant={'secondary'}>
        {_wordCount} word{_wordCount !== 1 ? 's' : ''}
      </Badge>

      {/* Execution Time */}
      <Badge variant={'outline'}>{_executionTime}</Badge>

      {/* Token Count */}
      <Conditional isCondition={!!totalTokens}>
        <Badge variant={'outline'}>{totalTokens?.toLocaleString()} tokens</Badge>
      </Conditional>

      {/* Selected Badge */}
      <Conditional isCondition={isSelected}>
        <Badge className={'bg-green-500'}>
          <CheckCircle2 aria-hidden className={'mr-1 size-3'} />
          Selected
        </Badge>
      </Conditional>

      {/* Edited Badge */}
      <Conditional isCondition={isEdited}>
        <Badge variant={'outline'}>
          <Edit2 aria-hidden className={'mr-1 size-3'} />
          Edited
        </Badge>
      </Conditional>
    </div>
  );
};

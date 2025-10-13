'use client';

import { CheckCircle2, Edit2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Conditional } from '@/components/ui/conditional';

interface RefinementMetadataProps {
  agentName?: null | string;
  agentRole?: null | string;
  confidence?: 'high' | 'low' | 'medium' | null;
  estimatedScope?: 'large' | 'medium' | 'small' | null;
  executionTimeMs: null | number | undefined;
  isEdited: boolean;
  isSelected: boolean;
  technicalComplexity?: 'high' | 'low' | 'medium' | null;
  totalTokens: null | number | undefined;
  wordCount: null | number | undefined;
}

export const RefinementMetadata = ({
  agentName,
  agentRole,
  confidence,
  estimatedScope,
  executionTimeMs,
  isEdited,
  isSelected,
  technicalComplexity,
  totalTokens,
  wordCount,
}: RefinementMetadataProps) => {
  const _wordCount = wordCount ?? 0;
  const _executionTime = executionTimeMs ? `${Math.round(executionTimeMs / 1000)}s` : 'N/A';

  const getConfidenceBadgeVariant = (level?: 'high' | 'low' | 'medium' | null) => {
    if (!level) return 'outline';
    switch (level) {
      case 'high':
        return 'default';
      case 'low':
        return 'outline';
      case 'medium':
        return 'secondary';
    }
  };

  const getComplexityBadgeVariant = (level?: 'high' | 'low' | 'medium' | null) => {
    if (!level) return 'outline';
    switch (level) {
      case 'high':
        return 'destructive';
      case 'low':
        return 'default';
      case 'medium':
        return 'secondary';
    }
  };

  return (
    <div className={'space-y-3'}>
      {/* Agent Info */}
      <Conditional isCondition={!!(agentName || agentRole)}>
        <div className={'flex items-center gap-2'}>
          <Conditional isCondition={!!agentName}>
            <span className={'text-sm font-semibold'}>{agentName}</span>
          </Conditional>
          <Conditional isCondition={!!agentRole}>
            <span className={'text-xs text-muted-foreground'}>• {agentRole}</span>
          </Conditional>
        </div>
      </Conditional>

      {/* Primary Metadata Row */}
      <div className={'flex flex-wrap items-center gap-2 text-sm'}>
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

        {/* Confidence Level */}
        <Conditional isCondition={!!confidence}>
          <Badge variant={getConfidenceBadgeVariant(confidence)}>Confidence: {confidence}</Badge>
        </Conditional>

        {/* Technical Complexity */}
        <Conditional isCondition={!!technicalComplexity}>
          <Badge variant={getComplexityBadgeVariant(technicalComplexity)}>
            Complexity: {technicalComplexity}
          </Badge>
        </Conditional>

        {/* Estimated Scope */}
        <Conditional isCondition={!!estimatedScope}>
          <Badge variant={'outline'}>Scope: {estimatedScope}</Badge>
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
    </div>
  );
};

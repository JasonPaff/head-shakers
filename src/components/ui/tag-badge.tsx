'use client';

import type { ComponentProps, CSSProperties } from 'react';

import type { TagRecord } from '@/lib/queries/tags/tags.query';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Badge } from '@/components/ui/badge';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface TagBadgeProps extends ComponentTestIdProps, Omit<ComponentProps<typeof Badge>, 'children'> {
  isShowUsageCount?: boolean;
  size?: 'default' | 'lg' | 'sm';
  tag: TagRecord;
}

export const TagBadge = ({
  className,
  isShowUsageCount = false,
  size = 'default',
  tag,
  testId,
  ...props
}: TagBadgeProps) => {
  const sizeClasses = {
    default: 'px-2 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
    sm: 'px-1.5 py-0.5 text-xs',
  };

  const tagBadgeTestId = testId || generateTestId('ui', 'tag-badge');
  const _shouldShowUsageCount = isShowUsageCount && tag.usageCount > 0;

  return (
    <Badge
      className={cn('border-0 font-medium text-white', sizeClasses[size], className)}
      style={
        {
          '--tag-color': tag.color,
          backgroundColor: 'var(--tag-color)',
        } as CSSProperties
      }
      testId={tagBadgeTestId}
      variant={'secondary'}
      {...props}
    >
      {tag.name}
      <Conditional isCondition={_shouldShowUsageCount}>
        <span className={'ml-1 text-xs opacity-75'}>{tag.usageCount}</span>{' '}
      </Conditional>
    </Badge>
  );
};

interface TagListProps extends ComponentProps<'div'>, ComponentTestIdProps {
  isShowUsageCount?: boolean;
  limit?: number;
  size?: 'default' | 'lg' | 'sm';
  tags: Array<TagRecord>;
}

export const TagList = ({
  className,
  isShowUsageCount = false,
  limit,
  size = 'default',
  tags,
  testId,
  ...props
}: TagListProps) => {
  const displayTags = limit ? tags.slice(0, limit) : tags;
  const remainingCount = limit && tags.length > limit ? tags.length - limit : 0;
  const _shouldShowRemainingCount = remainingCount > 0;
  const tagListTestId = testId || generateTestId('ui', 'tag-list');

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap gap-1', className)} data-testid={tagListTestId} {...props}>
      {displayTags.map((tag) => (
        <TagBadge isShowUsageCount={isShowUsageCount} key={tag.id} size={size} tag={tag} />
      ))}

      <Conditional isCondition={_shouldShowRemainingCount}>
        <Badge
          className={cn(
            'bg-muted text-muted-foreground',
            size === 'sm' && 'px-1.5 py-0.5 text-xs',
            size === 'lg' && 'px-3 py-1 text-sm',
          )}
          variant={'outline'}
        >
          +{remainingCount}
        </Badge>
      </Conditional>
    </div>
  );
};

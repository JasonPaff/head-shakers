import type { BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads.query';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Badge } from '@/components/ui/badge';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

import { FeatureCardDetailItem } from './feature-card-detail-item';

// Helper function to validate hex colors for XSS prevention
const isValidHexColor = (color: null | string | undefined): boolean => {
  if (!color) return false;
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};

type FeatureCardQuickInfoProps = ComponentTestIdProps & {
  bobblehead: BobbleheadWithRelations;
};

const MAX_VISIBLE_TAGS = 3;

export const FeatureCardQuickInfo = ({ bobblehead, testId }: FeatureCardQuickInfoProps) => {
  const quickInfoTestId = testId || generateTestId('feature', 'bobblehead-details', 'quick-info');

  // Derived values
  const _hasCharacterName = bobblehead.characterName !== null && bobblehead.characterName !== '';
  const _hasSeries = bobblehead.series !== null && bobblehead.series !== '';
  const _hasCategory = bobblehead.category !== null && bobblehead.category !== '';
  const _hasTags = bobblehead.tags.length > 0;
  const _visibleTags = bobblehead.tags.slice(0, MAX_VISIBLE_TAGS);
  const _remainingTagsCount = bobblehead.tags.length - MAX_VISIBLE_TAGS;
  const _hasMoreTags = _remainingTagsCount > 0;

  return (
    <div className={'space-y-4'} data-slot={'feature-card-quick-info'} data-testid={quickInfoTestId}>
      {/* Character and Series Section */}
      <div className={'space-y-1'}>
        <Conditional
          fallback={
            <span className={'text-lg font-medium text-muted-foreground/60 italic'}>
              No character specified
            </span>
          }
          isCondition={_hasCharacterName}
        >
          <h3
            className={'text-lg font-medium text-primary'}
            data-slot={'feature-card-quick-info-character'}
            data-testid={`${quickInfoTestId}-character`}
          >
            {bobblehead.characterName}
          </h3>
        </Conditional>

        <Conditional isCondition={_hasSeries}>
          <p
            className={'text-sm text-muted-foreground'}
            data-slot={'feature-card-quick-info-series'}
            data-testid={`${quickInfoTestId}-series`}
          >
            {bobblehead.series}
          </p>
        </Conditional>
      </div>

      {/* Manufacturer and Year Row */}
      <div className={'flex justify-between gap-4'}>
        <FeatureCardDetailItem
          className={'flex-1'}
          label={'Manufacturer'}
          testId={`${quickInfoTestId}-manufacturer`}
          value={bobblehead.manufacturer}
        />
        <FeatureCardDetailItem
          className={'flex-1'}
          label={'Year'}
          testId={`${quickInfoTestId}-year`}
          value={bobblehead.year}
        />
      </div>

      {/* Category Section */}
      <Conditional isCondition={_hasCategory}>
        <div
          className={'flex items-center gap-2'}
          data-slot={'feature-card-quick-info-category'}
          data-testid={`${quickInfoTestId}-category`}
        >
          <span className={'text-sm text-muted-foreground'}>Category:</span>
          <Badge testId={`${quickInfoTestId}-category-badge`} variant={'secondary'}>
            {bobblehead.category}
          </Badge>
        </div>
      </Conditional>

      {/* Tags Section */}
      <Conditional isCondition={_hasTags}>
        <div
          className={'flex flex-wrap items-center gap-2'}
          data-slot={'feature-card-quick-info-tags'}
          data-testid={`${quickInfoTestId}-tags`}
        >
          <span className={'text-sm text-muted-foreground'}>Tags:</span>
          {_visibleTags.map((tag) => (
            <Badge
              className={cn('text-xs')}
              key={tag.id}
              style={{ backgroundColor: isValidHexColor(tag.color) ? tag.color : undefined }}
              testId={`${quickInfoTestId}-tag-${tag.id}`}
              variant={'default'}
            >
              {tag.name}
            </Badge>
          ))}
          <Conditional isCondition={_hasMoreTags}>
            <span
              className={'text-xs text-muted-foreground'}
              data-slot={'feature-card-quick-info-tags-more'}
              data-testid={`${quickInfoTestId}-tags-more`}
            >
              +{_remainingTagsCount} more
            </span>
          </Conditional>
        </div>
      </Conditional>
    </div>
  );
};

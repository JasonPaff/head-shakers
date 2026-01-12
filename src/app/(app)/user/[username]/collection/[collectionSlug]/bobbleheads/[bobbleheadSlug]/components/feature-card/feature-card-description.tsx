import type { ComponentProps } from 'react';

import { FileTextIcon } from 'lucide-react';

import type { BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads.query';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

import { FeatureCardSection } from './feature-card-section';

type FeatureCardDescriptionProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    bobblehead: BobbleheadWithRelations;
  };

export const FeatureCardDescription = ({
  bobblehead,
  className,
  testId,
  ...props
}: FeatureCardDescriptionProps) => {
  const descriptionTestId = testId || generateTestId('feature', 'bobblehead-details', 'description');

  const _hasDescription = !!bobblehead.description && bobblehead.description.trim().length > 0;

  // Don't render the section if there's no description
  if (!_hasDescription) {
    return null;
  }

  return (
    <div
      className={cn(className)}
      data-slot={'feature-card-description'}
      data-testid={descriptionTestId}
      {...props}
    >
      <FeatureCardSection isDefaultOpen title={'Description'}>
        <Conditional
          fallback={
            <p
              className={'text-sm text-muted-foreground/60 italic'}
              data-testid={`${descriptionTestId}-empty`}
            >
              No description has been added for this bobblehead.
            </p>
          }
          isCondition={_hasDescription}
        >
          <div className={'flex items-start gap-3'}>
            <FileTextIcon aria-hidden className={'mt-0.5 size-4 shrink-0 text-muted-foreground'} />
            <p
              className={'text-sm leading-relaxed text-pretty text-foreground'}
              data-testid={`${descriptionTestId}-content`}
            >
              {bobblehead.description}
            </p>
          </div>
        </Conditional>
      </FeatureCardSection>
    </div>
  );
};

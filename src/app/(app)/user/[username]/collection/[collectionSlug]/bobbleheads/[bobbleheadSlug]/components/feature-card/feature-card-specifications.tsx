import { Palette, Ruler, Scale } from 'lucide-react';
import { useMemo } from 'react';

import type { BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads.query';

import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';

import { FeatureCardDetailItem } from './feature-card-detail-item';
import { FeatureCardSection } from './feature-card-section';

type FeatureCardSpecificationsProps = {
  bobblehead: BobbleheadWithRelations;
};

export const FeatureCardSpecifications = ({ bobblehead }: FeatureCardSpecificationsProps) => {
  const specsTestId = generateTestId('feature', 'bobblehead-details', 'specifications');

  const _specificationItems = useMemo(() => {
    const items: Array<{
      icon: typeof Ruler;
      label: string;
      value: null | number | string;
    }> = [
      {
        icon: Ruler,
        label: 'Height',
        value: bobblehead.height ? `${bobblehead.height} inches` : null,
      },
      {
        icon: Scale,
        label: 'Weight',
        value: bobblehead.weight ? `${bobblehead.weight} oz` : null,
      },
      {
        icon: Palette,
        label: 'Material',
        value: bobblehead.material,
      },
    ];

    return items;
  }, [bobblehead.height, bobblehead.weight, bobblehead.material]);

  const _populatedSpecsCount = useMemo(() => {
    return _specificationItems.filter((item) => item.value !== null && item.value !== '').length;
  }, [_specificationItems]);

  const _hasAnySpecs = _populatedSpecsCount > 0;

  return (
    <FeatureCardSection
      isDefaultOpen
      itemCount={_populatedSpecsCount}
      testId={specsTestId}
      title={'Specifications'}
    >
      {/* Specifications List */}
      <Conditional
        fallback={
          <p
            className={'text-sm text-muted-foreground/60 italic'}
            data-slot={'feature-card-specifications-empty'}
            data-testid={generateTestId('feature', 'bobblehead-details', 'specifications-empty')}
          >
            {'No specification details have been added for this bobblehead.'}
          </p>
        }
        isCondition={_hasAnySpecs}
      >
        <div className={'space-y-3'} data-slot={'feature-card-specifications-list'}>
          {_specificationItems.map((spec) => (
            <FeatureCardDetailItem
              icon={spec.icon}
              key={spec.label}
              label={spec.label}
              testId={generateTestId('feature', 'bobblehead-details', `spec-${spec.label.toLowerCase()}`)}
              value={spec.value}
            />
          ))}
        </div>
      </Conditional>
    </FeatureCardSection>
  );
};

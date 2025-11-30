import type { ComponentProps } from 'react';

import { format } from 'date-fns';
import { CalendarIcon, DollarSignIcon, MapPinIcon, ShoppingCartIcon } from 'lucide-react';

import type { BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads-query';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { formatCurrency } from '@/lib/utils/currency.utils';
import { cn } from '@/utils/tailwind-utils';

import { FeatureCardDetailItem } from './feature-card-detail-item';
import { FeatureCardSection } from './feature-card-section';

type FeatureCardAcquisitionProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    bobblehead: BobbleheadWithRelations;
  };

/**
 * Formats a date value as "MMM d, yyyy" (e.g., "Dec 15, 2024")
 */
const formatDate = (value: Date | null | string | undefined): null | string => {
  if (value === null || value === undefined) return null;

  const dateValue = value instanceof Date ? value : new Date(value);

  if (isNaN(dateValue.getTime())) return null;

  return format(dateValue, 'MMM d, yyyy');
};

/**
 * Counts the number of non-null acquisition fields
 */
const countAcquisitionFields = (bobblehead: BobbleheadWithRelations): number => {
  let count = 0;

  if (bobblehead.purchasePrice !== null && bobblehead.purchasePrice !== undefined) count++;
  if (bobblehead.acquisitionDate !== null && bobblehead.acquisitionDate !== undefined) count++;
  if (bobblehead.purchaseLocation !== null && bobblehead.purchaseLocation !== undefined) count++;
  if (bobblehead.acquisitionMethod !== null && bobblehead.acquisitionMethod !== undefined) count++;

  return count;
};

export const FeatureCardAcquisition = ({
  bobblehead,
  className,
  testId,
  ...props
}: FeatureCardAcquisitionProps) => {
  const acquisitionTestId = testId || generateTestId('feature', 'bobblehead-details', 'acquisition');

  const _itemCount = countAcquisitionFields(bobblehead);
  const _hasAcquisitionData = _itemCount > 0;

  const _formattedPrice = formatCurrency(bobblehead.purchasePrice);
  const _formattedDate = formatDate(bobblehead.acquisitionDate);

  return (
    <div
      className={cn(className)}
      data-slot={'feature-card-acquisition'}
      data-testid={acquisitionTestId}
      {...props}
    >
      <FeatureCardSection isDefaultOpen={false} itemCount={_itemCount} title={'Acquisition Details'}>
        {/* Empty State */}
        <Conditional isCondition={!_hasAcquisitionData}>
          <div className={'py-4 text-center'}>
            <div className={'mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-muted/50'}>
              <ShoppingCartIcon aria-hidden className={'size-5 text-muted-foreground'} />
            </div>
            <p className={'text-sm text-muted-foreground'}>No acquisition information has been added yet.</p>
          </div>
        </Conditional>

        {/* Acquisition Details */}
        <Conditional isCondition={_hasAcquisitionData}>
          <div className={'space-y-3'}>
            {/* Purchase Price */}
            <FeatureCardDetailItem
              icon={DollarSignIcon}
              label={'Purchase Price'}
              testId={`${acquisitionTestId}-price`}
              value={_formattedPrice}
            />

            {/* Acquisition Date */}
            <FeatureCardDetailItem
              icon={CalendarIcon}
              label={'Acquisition Date'}
              testId={`${acquisitionTestId}-date`}
              value={_formattedDate}
            />

            {/* Purchase Location */}
            <FeatureCardDetailItem
              icon={MapPinIcon}
              label={'Purchase Location'}
              testId={`${acquisitionTestId}-location`}
              value={bobblehead.purchaseLocation}
            />

            {/* Acquisition Method */}
            <FeatureCardDetailItem
              icon={ShoppingCartIcon}
              label={'Acquisition Method'}
              testId={`${acquisitionTestId}-method`}
              value={bobblehead.acquisitionMethod}
            />
          </div>
        </Conditional>
      </FeatureCardSection>
    </div>
  );
};

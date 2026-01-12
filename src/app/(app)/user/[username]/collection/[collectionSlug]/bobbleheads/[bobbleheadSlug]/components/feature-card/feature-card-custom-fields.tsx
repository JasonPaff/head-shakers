import type { ComponentProps } from 'react';

import { SettingsIcon, TagIcon } from 'lucide-react';

import type { BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads.query';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Badge } from '@/components/ui/badge';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

import { FeatureCardSection } from './feature-card-section';

type FeatureCardCustomFieldsProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    bobblehead: BobbleheadWithRelations;
  };

const renderFieldValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return <span className={'text-sm text-muted-foreground/60 italic'}>Not set</span>;
  }

  if (typeof value === 'boolean') {
    return <Badge variant={value ? 'default' : 'secondary'}>{value ? 'Yes' : 'No'}</Badge>;
  }

  if (typeof value === 'number') {
    return <span className={'text-sm font-medium'}>{value.toLocaleString()}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className={'text-sm text-muted-foreground/60 italic'}>None</span>;
    }
    return (
      <div className={'flex flex-wrap gap-1'}>
        {value.map((item, index) => (
          <Badge className={'text-xs'} key={index} variant={'outline'}>
            {String(item)}
          </Badge>
        ))}
      </div>
    );
  }

  const stringValue = String(value as string);
  if (stringValue.length > 50) {
    return <span className={'text-sm font-medium text-pretty'}>{stringValue.substring(0, 50)}...</span>;
  }

  return <span className={'text-sm font-medium'}>{stringValue}</span>;
};

const formatFieldLabel = (key: string): string => {
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
};

export const FeatureCardCustomFields = ({
  bobblehead,
  className,
  testId,
  ...props
}: FeatureCardCustomFieldsProps) => {
  const customFieldsTestId = testId || generateTestId('feature', 'bobblehead-details', 'custom-fields');

  const customFields = bobblehead.customFields;

  // Parse custom fields
  let fieldEntries: Array<[string, unknown]> = [];

  if (Array.isArray(customFields)) {
    customFields.forEach((fieldObj) => {
      if (fieldObj && typeof fieldObj === 'object') {
        fieldEntries.push(
          ...Object.entries(fieldObj).filter(
            ([, value]) => value !== null && value !== undefined && value !== '',
          ),
        );
      }
    });
  } else if (customFields && typeof customFields === 'object') {
    fieldEntries = Object.entries(customFields).filter(
      ([, value]) => value !== null && value !== undefined && value !== '',
    );
  }

  const _hasCustomFields = fieldEntries.length > 0;

  // Don't render if no custom fields
  if (!_hasCustomFields) {
    return null;
  }

  return (
    <div
      className={cn(className)}
      data-slot={'feature-card-custom-fields'}
      data-testid={customFieldsTestId}
      {...props}
    >
      <FeatureCardSection isDefaultOpen itemCount={fieldEntries.length} title={'Custom Fields'}>
        <Conditional
          fallback={
            <div className={'flex items-center gap-3 py-2'}>
              <SettingsIcon aria-hidden className={'size-4 text-muted-foreground'} />
              <p className={'text-sm text-muted-foreground/60 italic'}>
                No custom fields have been defined for this bobblehead.
              </p>
            </div>
          }
          isCondition={_hasCustomFields}
        >
          <div className={'space-y-3'}>
            {fieldEntries.map(([key, value]) => (
              <div
                className={'flex items-start gap-3'}
                data-testid={`${customFieldsTestId}-${key}`}
                key={key}
              >
                <TagIcon aria-hidden className={'mt-0.5 size-4 shrink-0 text-muted-foreground'} />
                <div className={'flex-1 space-y-1'}>
                  <span className={'text-sm text-muted-foreground'}>{formatFieldLabel(key)}</span>
                  <div>{renderFieldValue(value)}</div>
                </div>
              </div>
            ))}
          </div>
        </Conditional>
      </FeatureCardSection>
    </div>
  );
};

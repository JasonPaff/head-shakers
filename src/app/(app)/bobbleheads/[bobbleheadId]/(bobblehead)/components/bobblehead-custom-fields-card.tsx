import { TagIcon } from 'lucide-react';

import type { BobbleheadsFacade } from '@/lib/queries/bobbleheads/bobbleheads-facade';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';

interface BobbleheadCustomFieldsCardProps {
  bobblehead: NonNullable<Awaited<ReturnType<typeof BobbleheadsFacade.getBobbleheadWithRelations>>>;
}

const CustomFieldItem = ({ label, value }: { label: string; value: unknown }) => {
  const renderValue = (value: unknown) => {
    if (value === null || value === undefined) {
      return <span className={'text-sm text-muted-foreground italic'}>Not set</span>;
    }

    if (typeof value === 'boolean') {
      return <Badge variant={value ? 'default' : 'secondary'}>{value ? 'Yes' : 'No'}</Badge>;
    }

    if (typeof value === 'number') {
      return <span className={'font-medium'}>{value.toLocaleString()}</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className={'text-sm text-muted-foreground italic'}>None</span>;
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

    if (typeof value === 'object') {
      try {
        return (
          <pre className={'max-h-32 overflow-auto rounded border bg-muted p-2 text-xs'}>
            {JSON.stringify(value, null, 2)}
          </pre>
        );
      } catch {
        return <span className={'font-medium'}>{String(value as unknown as string)}</span>;
      }
    }

    const stringValue = String(value as string);
    if (stringValue.length > 100) {
      return (
        <div className={'font-medium text-pretty'}>
          <p>{stringValue.substring(0, 100)}...</p>
          <details className={'mt-2'}>
            <summary className={'cursor-pointer text-xs text-muted-foreground hover:underline'}>
              Show full text
            </summary>
            <p className={'mt-2 text-sm'}>{stringValue}</p>
          </details>
        </div>
      );
    }

    return <span className={'font-medium text-pretty'}>{stringValue}</span>;
  };

  return (
    <div className={'space-y-2'}>
      <div className={'flex items-center gap-2'}>
        <TagIcon className={'size-4 text-muted-foreground'} />
        <span className={'text-sm font-medium text-muted-foreground'}>{label}</span>
      </div>
      <div className={'ml-6'}>{renderValue(value)}</div>
    </div>
  );
};

export const BobbleheadCustomFieldsCard = ({ bobblehead }: BobbleheadCustomFieldsCardProps) => {
  const customFields = bobblehead.customFields;

  // don't render if no custom fields
  if (!customFields || (Array.isArray(customFields) && customFields.length === 0)) {
    return null;
  }

  // handle both array and object formats
  let fieldEntries: Array<[string, unknown]> = [];

  if (Array.isArray(customFields)) {
    // if it's an array of objects, flatten them
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
    // if it's a single object
    fieldEntries = Object.entries(customFields).filter(
      ([, value]) => value !== null && value !== undefined && value !== '',
    );
  }

  const _hasFieldEntries = !!fieldEntries && fieldEntries.length > 0;

  return (
    <Conditional isCondition={_hasFieldEntries}>
      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <div className={'size-2 rounded-full bg-violet-500'}></div>
            Custom Fields
          </CardTitle>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          {fieldEntries?.map(([key, value]) => (
            <CustomFieldItem
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              value={value}
            />
          ))}

          <Conditional isCondition={_hasFieldEntries}>
            <div className={'border-t pt-3 text-xs text-muted-foreground'}>
              {fieldEntries.length} custom field{fieldEntries.length !== 1 ? 's' : ''} defined
            </div>
          </Conditional>
        </CardContent>
      </Card>
    </Conditional>
  );
};

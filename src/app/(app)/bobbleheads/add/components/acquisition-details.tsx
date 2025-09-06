'use client';

import { addItemFormOptions } from '@/app/(app)/bobbleheads/add/components/add-item-form-options';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withForm } from '@/components/ui/form';

export const AcquisitionDetails = withForm({
  ...addItemFormOptions,
  render: ({ form }) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acquisition Details</CardTitle>
          <CardDescription>How and when you acquired this bobblehead</CardDescription>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
            {/* Acquisition Date */}
            <form.AppField name={'acquisitionDate'}>
              {(field) => (
                <field.TextField label={'Acquisition Date'} placeholder={'Pick a date'} type={'date'} />
              )}
            </form.AppField>

            {/* Acquisition Method */}
            <form.AppField name={'acquisitionMethod'}>
              {(field) => (
                <field.TextField label={'Acquisition Method'} placeholder={'Purchase, Gift, Trade, etc.'} />
              )}
            </form.AppField>
          </div>

          <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
            {/* Purchase Location */}
            <form.AppField name={'purchaseLocation'}>
              {(field) => (
                <field.TextField label={'Purchase Location'} placeholder={'Store, website, event, etc.'} />
              )}
            </form.AppField>

            {/* Purchase Price */}
            <form.AppField name={'purchasePrice'}>
              {(field) => (
                <field.TextField label={'Purchase Price ($)'} placeholder={'25.99'} type={'number'} />
              )}
            </form.AppField>
          </div>
        </CardContent>
      </Card>
    );
  },
});

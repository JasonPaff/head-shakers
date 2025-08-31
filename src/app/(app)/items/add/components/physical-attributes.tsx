'use client';

import { addItemFormOptions } from '@/app/(app)/items/add/components/add-item-form-options';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withForm } from '@/components/ui/form';
import { ENUMS } from '@/lib/constants';

const conditionOptions = ENUMS.BOBBLEHEAD.CONDITION.map((condition) => ({
  label: condition,
  value: condition,
}));

export const PhysicalAttributes = withForm({
  ...addItemFormOptions,
  render: ({ form }) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Physical Attributes</CardTitle>
          <CardDescription>Physical characteristics and condition</CardDescription>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          <div className={'grid grid-cols-1 gap-4 md:grid-cols-3'}>
            {/* Height */}
            <form.AppField name={'height'}>
              {(field) => (
                <field.TextField label={'Height (centimeters)'} placeholder={'7.5'} type={'number'} />
              )}
            </form.AppField>

            {/* Weight */}
            <form.AppField name={'weight'}>
              {(field) => <field.TextField label={'Weight (grams)'} placeholder={'5.2'} type={'number'} />}
            </form.AppField>

            {/* Material */}
            <form.AppField name={'material'}>
              {(field) => <field.TextField label={'Material'} placeholder={'Resin, Ceramic, etc.'} />}
            </form.AppField>
          </div>

          <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
            {/* Manufacturer */}
            <form.AppField name={'manufacturer'}>
              {(field) => <field.TextField label={'Manufacturer'} placeholder={'Company name'} />}
            </form.AppField>

            {/* Condition */}
            <form.AppField name={'currentCondition'}>
              {(field) => (
                <field.SelectField
                  label={'Current Condition'}
                  options={conditionOptions}
                  placeholder={'Select the current condition'}
                />
              )}
            </form.AppField>
          </div>
        </CardContent>
      </Card>
    );
  },
});

'use client';

import { addItemFormOptions } from '@/app/(app)/items/add/components/add-item-form-options';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withForm } from '@/components/ui/form';
import { ENUMS } from '@/lib/constants';

const statusOptions = ENUMS.BOBBLEHEAD.STATUS.map((status) => ({
  label: status,
  value: status,
}));

export const ItemSettings = withForm({
  ...addItemFormOptions,
  render: ({ form }) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Visibility and status settings</CardDescription>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          <div className={'grid grid-cols-1 gap-4'}>
            {/* Status */}
            <form.AppField name={'status'}>
              {(field) => (
                <field.SelectField label={'Status'} options={statusOptions} placeholder={'Select a status'} />
              )}
            </form.AppField>

            {/* Is Public */}
            <form.AppField name={'isPublic'}>
              {(field) => <field.SwitchField label={'Make this bobblehead public'} />}
            </form.AppField>

            {/* Is Featured */}
            <form.AppField name={'isFeatured'}>
              {(field) => <field.SwitchField label={'Feature this bobblehead'} />}
            </form.AppField>
          </div>
        </CardContent>
      </Card>
    );
  },
});

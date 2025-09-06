'use client';

import { addItemFormOptions } from '@/app/(app)/bobbleheads/add/components/add-item-form-options';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withForm } from '@/components/ui/form';
import { insertBobbleheadSchema } from '@/lib/validations/bobbleheads.validation';

export const ImageUpload = withForm({
  ...addItemFormOptions,
  render: ({ form }) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
          <CardDescription>Upload photos of your bobblehead</CardDescription>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
            {/* Tag Name */}
            <form.AppField name={'name'} validators={{ onChange: insertBobbleheadSchema.shape.name }}>
              {(field) => <field.TextField isRequired label={'Name'} placeholder={'Enter bobblehead name'} />}
            </form.AppField>

            {/* Character Name */}
            <form.AppField name={'characterName'}>
              {(field) => (
                <field.TextField label={'Character Name'} placeholder={'Character or person name'} />
              )}
            </form.AppField>
          </div>
        </CardContent>
      </Card>
    );
  },
});

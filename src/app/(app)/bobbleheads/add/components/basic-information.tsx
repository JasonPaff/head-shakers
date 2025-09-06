'use client';

import { addItemFormOptions } from '@/app/(app)/bobbleheads/add/components/add-item-form-options';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withForm } from '@/components/ui/form';

export const BasicInformation = withForm({
  ...addItemFormOptions,
  render: ({ form }) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Essential details about your bobblehead</CardDescription>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
            {/* Name */}
            <form.AppField name={'name'}>
              {(field) => <field.TextField isRequired label={'Name'} placeholder={'Enter bobblehead name'} />}
            </form.AppField>

            {/* Character Name */}
            <form.AppField name={'characterName'}>
              {(field) => (
                <field.TextField label={'Character Name'} placeholder={'Character or person name'} />
              )}
            </form.AppField>
          </div>

          {/* Description */}
          <form.AppField name={'description'}>
            {(field) => (
              <field.TextareaField label={'Description'} placeholder={'Describe your bobblehead...'} />
            )}
          </form.AppField>

          <div className={'grid grid-cols-1 gap-4 md:grid-cols-3'}>
            {/* Category */}
            <form.AppField name={'category'}>
              {(field) => <field.TextField label={'Category'} placeholder={'Sports, Movies, etc.'} />}
            </form.AppField>

            {/* Series */}
            <form.AppField name={'series'}>
              {(field) => <field.TextField label={'Series'} placeholder={'Series name'} />}
            </form.AppField>

            {/* Year */}
            <form.AppField name={'year'}>
              {(field) => <field.TextField label={'Year'} placeholder={'Release year'} type={'number'} />}
            </form.AppField>
          </div>
        </CardContent>
      </Card>
    );
  },
});

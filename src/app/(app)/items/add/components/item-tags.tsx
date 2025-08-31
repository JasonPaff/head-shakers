'use client';

import { Tag } from 'lucide-react';

import { addItemFormOptions } from '@/app/(app)/items/add/components/add-item-form-options';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withForm } from '@/components/ui/form';
import {} from '@/lib/validations/bobbleheads.validation';

export const ItemTags = withForm({
  ...addItemFormOptions,
  render: ({ form }) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <Tag aria-hidden className={'size-5'} />
            Tags
          </CardTitle>
          <CardDescription>Add custom tags to organize and categorize your bobblehead</CardDescription>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
            {/* Tag Name */}
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
        </CardContent>
      </Card>
    );
  },
});

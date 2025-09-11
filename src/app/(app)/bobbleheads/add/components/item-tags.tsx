'use client';

import { Tag } from 'lucide-react';

import { addItemFormOptions } from '@/app/(app)/bobbleheads/add/components/add-item-form-options';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withForm } from '@/components/ui/form';

export const ItemTags = withForm({
  ...addItemFormOptions,
  render: () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <Tag aria-hidden className={'size-5'} />
            Tags
          </CardTitle>
          <CardDescription>Add custom tags to organize and categorize your bobblehead</CardDescription>
        </CardHeader>
        <CardContent className={'space-y-4'}></CardContent>
      </Card>
    );
  },
});

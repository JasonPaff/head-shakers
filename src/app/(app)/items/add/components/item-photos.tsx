'use client';

import { Tag } from 'lucide-react';

import { addItemFormOptions } from '@/app/(app)/items/add/components/add-item-form-options';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withForm } from '@/components/ui/form';

export const ItemPhotos = withForm({
  ...addItemFormOptions,
  render: () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <Tag aria-hidden className={'size-5'} />
            Photos
          </CardTitle>
          <CardDescription>Upload photos of your bobblehead</CardDescription>
        </CardHeader>
        <CardContent className={'space-y-4'}>COMING SOON!</CardContent>
      </Card>
    );
  },
});

'use client';

import type React from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

export const AddItemHeader = () => {
  const router = useRouter();

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className={'flex items-center justify-between'}>
      <div>
        <h1 className={'text-3xl font-bold text-foreground'}>Add New Bobblehead</h1>
        <p className={'text-muted-foreground'}>Add a new bobblehead to your collection</p>
      </div>
      <Button onClick={handleCancel} variant={'outline'}>
        Cancel
      </Button>
    </div>
  );
};

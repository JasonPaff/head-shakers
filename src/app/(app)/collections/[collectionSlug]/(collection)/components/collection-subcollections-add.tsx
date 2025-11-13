'use client';

import { PlusIcon } from 'lucide-react';
import { useRouteParams } from 'next-typesafe-url/app';
import { Fragment } from 'react';

import { Route } from '@/app/(app)/collections/[collectionSlug]/(collection)/route-type';
import { SubcollectionCreateDialog } from '@/components/feature/subcollections/subcollection-create-dialog';
import { Button } from '@/components/ui/button';
import { useToggle } from '@/hooks/use-toggle';

export const CollectionSubcollectionsAdd = () => {
  const [isOpen, setIsOpen] = useToggle();
  const { data, isLoading } = useRouteParams(Route.routeParams);

  if (isLoading) return null;

  return (
    <Fragment>
      <Button onClick={setIsOpen.on} size={'sm'} variant={'outline'}>
        <PlusIcon aria-hidden className={'mr-2 size-4'} />
        Add Subcollection
      </Button>

      <SubcollectionCreateDialog collectionId={data!.collectionId} isOpen={isOpen} onClose={setIsOpen.off} />
    </Fragment>
  );
};

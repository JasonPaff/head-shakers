'use client';

import { FolderIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Fragment } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { generateTestId } from '@/lib/test-ids';

type SubcollectionsEmptyStateProps = ComponentTestIdProps;

export const SubcollectionsEmptyState = ({ testId }: SubcollectionsEmptyStateProps) => {
  const emptyStateTestId = testId || generateTestId('feature', 'subcollections-empty-state');
  const ctaButtonTestId = generateTestId('feature', 'subcollections-empty-state-cta');

  // Derived variables
  const _title = 'No Subcollections Yet';
  const _description =
    'Subcollections are created within your collections to help organize your bobbleheads into smaller groups. ' +
    'Head to the Collections tab to create a collection, then add subcollections from there.';

  return (
    <Fragment>
      <EmptyState
        action={
          <Button asChild size={'lg'} testId={ctaButtonTestId}>
            <Link href={$path({ route: '/dashboard/collection' })}>Go to Collections</Link>
          </Button>
        }
        className={'mx-auto max-w-lg'}
        description={_description}
        icon={FolderIcon}
        testId={emptyStateTestId}
        title={_title}
      />
    </Fragment>
  );
};

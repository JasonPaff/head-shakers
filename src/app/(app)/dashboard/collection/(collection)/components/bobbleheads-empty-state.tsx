'use client';

import { PackageIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Fragment } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { generateTestId } from '@/lib/test-ids';

type BobbleheadsEmptyStateProps = ComponentTestIdProps;

export const BobbleheadsEmptyState = ({ testId }: BobbleheadsEmptyStateProps) => {
  const emptyStateTestId = testId || generateTestId('feature', 'bobbleheads-empty-state');
  const ctaButtonTestId = generateTestId('feature', 'bobbleheads-empty-state-cta');

  // Derived variables
  const _title = 'No Bobbleheads Yet';
  const _description =
    'Bobbleheads are added to subcollections within your collections. ' +
    'Start by creating a collection, add some subcollections, then fill them with your bobblehead treasures!';

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
        icon={PackageIcon}
        testId={emptyStateTestId}
        title={_title}
      />
    </Fragment>
  );
};

'use client';

import { LayoutGridIcon } from 'lucide-react';
import { Fragment } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { CollectionCreateDialog } from '@/components/feature/collections/collection-create-dialog';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useToggle } from '@/hooks/use-toggle';
import { generateTestId } from '@/lib/test-ids';

type CollectionsEmptyStateProps = ComponentTestIdProps & {
  userName?: string;
};

export const CollectionsEmptyState = ({ testId, userName }: CollectionsEmptyStateProps) => {
  const emptyStateTestId = testId || generateTestId('feature', 'collections-empty-state');
  const ctaButtonTestId = generateTestId('feature', 'collections-empty-state-cta');

  // useState hooks (via useToggle)
  const [isDialogOpen, { off: handleCloseDialog, on: handleOpenDialog }] = useToggle(false);

  // Derived variables
  const _title = userName ? `Welcome, ${userName}!` : 'Start Your Collection';
  const _description =
    'Collections help you organize your bobbleheads into meaningful groups. ' +
    'Create collections for different themes, series, or categories to keep your catalog neat and easily browsable.';

  return (
    <Fragment>
      {/* Empty State Display */}
      <EmptyState
        action={
          <Button onClick={handleOpenDialog} size={'lg'} testId={ctaButtonTestId}>
            Create Your First Collection
          </Button>
        }
        className={'mx-auto max-w-lg'}
        description={_description}
        icon={LayoutGridIcon}
        testId={emptyStateTestId}
        title={_title}
      />

      {/* Create Collection Dialog */}
      <CollectionCreateDialog isOpen={isDialogOpen} onClose={handleCloseDialog} />
    </Fragment>
  );
};

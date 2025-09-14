import 'server-only';

import { CollectionCard } from '@/app/(app)/dashboard/collection/(collection)/components/collection-card';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { getUserId } from '@/utils/user-utils';

export const CollectionsTabContent = async () => {
  const userId = await getUserId();
  const collections = await CollectionsFacade.getUserCollectionsForDashboard(userId);

  if (collections.length === 0) {
    return (
      <div className={'py-16 text-center'}>
        <h3 className={'text-lg font-medium text-muted-foreground'}>No collections yet</h3>
        <p className={'mt-2 text-sm text-muted-foreground'}>
          Create your first collection to get started managing your bobbleheads.
        </p>
      </div>
    );
  }

  return (
    <div className={'mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3'}>
      {collections.map((collection) => (
        <CollectionCard collection={collection} key={collection.id} />
      ))}
    </div>
  );
};

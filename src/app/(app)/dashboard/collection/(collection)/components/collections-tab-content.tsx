import 'server-only';

import { CollectionCard } from '@/app/(app)/dashboard/collection/(collection)/components/collection-card';
import { CollectionsEmptyState } from '@/app/(app)/dashboard/collection/(collection)/components/collections-empty-state';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { UsersFacade } from '@/lib/facades/users/users.facade';
import { getRequiredUserIdAsync } from '@/utils/auth-utils';

export const CollectionsTabContent = async () => {
  const userId = await getRequiredUserIdAsync();

  const [collections, user] = await Promise.all([
    CollectionsFacade.getUserCollectionsForDashboard(userId),
    UsersFacade.getUserByIdAsync(userId),
  ]);

  const _username = user?.username ?? undefined;

  if (collections.length === 0) {
    return <CollectionsEmptyState userName={_username} />;
  }

  return (
    <div className={'mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3'}>
      {collections.map((collection) => (
        <CollectionCard collection={collection} key={collection.id} />
      ))}
    </div>
  );
};

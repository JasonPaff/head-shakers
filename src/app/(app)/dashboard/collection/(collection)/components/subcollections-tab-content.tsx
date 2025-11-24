import 'server-only';

import { SubcollectionsEmptyState } from '@/app/(app)/dashboard/collection/(collection)/components/subcollections-empty-state';
import { SubcollectionsList } from '@/app/(app)/dashboard/collection/(collection)/components/subcollections-list';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { getUserId } from '@/utils/user-utils';

export const SubcollectionsTabContent = async () => {
  const userId = await getUserId();
  const collections = await CollectionsFacade.getUserCollectionsForDashboard(userId);

  const subcollections = collections
    .flatMap((collection) =>
      collection.subCollections.map((sub) => ({
        ...sub,
        collectionDescription: collection.description,
        collectionId: collection.id,
        collectionName: collection.name,
        collectionSlug: collection.slug,
        isCollectionPublic: collection.isPublic,
      })),
    )
    .sort((a, b) => a.collectionName.localeCompare(b.collectionName));

  if (subcollections.length === 0) {
    return <SubcollectionsEmptyState />;
  }

  const groupedSubcollections = subcollections.reduce(
    (acc, sub) => {
      if (!acc[sub.collectionId]) {
        acc[sub.collectionId] = {
          collectionDescription: sub.collectionDescription,
          collectionName: sub.collectionName,
          isCollectionPublic: sub.isCollectionPublic,
          subcollections: [],
        };
      }
      acc[sub.collectionId]!.subcollections.push(sub);
      return acc;
    },
    {} as Record<
      string,
      {
        collectionDescription: null | string;
        collectionName: string;
        isCollectionPublic: boolean;
        subcollections: typeof subcollections;
      }
    >,
  );

  return (
    <div className={'mt-6'}>
      <SubcollectionsList groupedSubcollections={groupedSubcollections} />
    </div>
  );
};

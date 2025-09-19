import { CollectionCardSkeleton } from '@/app/(app)/dashboard/collection/(collection)/components/skeletons/collection-card-skeleton';

export const CollectionsTabSkeleton = () => {
  return (
    <div className={'mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3'}>
      {Array.from({ length: 6 }).map((_, i) => (
        <CollectionCardSkeleton key={i} />
      ))}
    </div>
  );
};

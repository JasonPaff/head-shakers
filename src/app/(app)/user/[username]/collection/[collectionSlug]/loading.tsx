import { CollectionBobbleheadsSkeleton } from './components/skeletons/collection-bobbleheads-skeleton';
import { CollectionHeaderSkeleton } from './components/skeletons/collection-header-skeleton';

export default function Loading() {
  return (
    <div className={'container mx-auto max-w-7xl px-4 py-8'}>
      {/* Header Skeleton */}
      <CollectionHeaderSkeleton />

      {/* Bobbleheads Section Skeleton */}
      <div className={'mt-8'}>
        <CollectionBobbleheadsSkeleton />
      </div>
    </div>
  );
}

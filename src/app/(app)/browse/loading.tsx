import { BrowseCollectionsSkeleton } from '@/app/(app)/browse/components/skeletons/browse-collections-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function BrowseLoadingPage() {
  return (
    <div className={'container mx-auto space-y-6 py-8'}>
      {/* Page Header Skeleton */}
      <div className={'space-y-2'}>
        <Skeleton className={'h-9 w-64'} />
        <Skeleton className={'h-5 w-96'} />
      </div>

      {/* Content Loading */}
      <BrowseCollectionsSkeleton />
    </div>
  );
}

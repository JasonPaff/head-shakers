import { BobbleheadCardSkeleton } from '@/app/(app)/collections/[collectionId]/(collection)/components/skeletons/bobblehead-card-skeleton';

export const BobbleheadsTabSkeleton = () => {
  return (
    <div className={'mt-6'}>
      {/* Filter and Search Controls */}
      <div className={'mb-6 flex items-center justify-between'}>
        <div className={'flex gap-2'}>
          <div className={'h-10 w-32 animate-pulse rounded-md bg-muted'} />
          <div className={'h-10 w-32 animate-pulse rounded-md bg-muted'} />
        </div>
        <div className={'flex gap-2'}>
          <div className={'h-10 w-64 animate-pulse rounded-md bg-muted'} />
          <div className={'h-10 w-48 animate-pulse rounded-md bg-muted'} />
        </div>
      </div>

      {/* Bobbleheads Grid */}
      <div className={'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}>
        {Array.from({ length: 8 }).map((_, i) => (
          <BobbleheadCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

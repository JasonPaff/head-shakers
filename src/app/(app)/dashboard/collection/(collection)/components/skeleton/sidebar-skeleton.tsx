import { Skeleton } from '@/components/ui/skeleton';

export const SidebarSkeleton = () => {
  return (
    <div
      aria-busy={'true'}
      aria-label={'Loading collections sidebar'}
      data-slot={'sidebar-skeleton'}
      role={'status'}
    >
      <span className={'sr-only'}>Loading collections...</span>

      {/* Header Skeleton */}
      <div className={'flex items-center justify-between border-b bg-background/50 p-4'}>
        <Skeleton className={'h-7 w-28'} />
        <Skeleton className={'h-8 w-16'} />
      </div>

      {/* Search Skeleton */}
      <div className={'space-y-2 border-b bg-background/30 p-3'}>
        <Skeleton className={'h-9 w-full'} />
        <Skeleton className={'h-8 w-full'} />
      </div>

      {/* Collection Cards Skeleton */}
      <div className={'flex-1 space-y-2 p-3'}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div className={'flex items-start gap-3 rounded-lg border p-3'} key={index}>
            <Skeleton className={'size-12 rounded-md'} />
            <div className={'flex-1 space-y-2'}>
              <Skeleton className={'h-4 w-32'} />
              <Skeleton className={'h-3 w-24'} />
            </div>
          </div>
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className={'border-t bg-background/30 p-3'}>
        <Skeleton className={'h-4 w-28'} />
      </div>
    </div>
  );
};

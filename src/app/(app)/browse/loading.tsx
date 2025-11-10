import { Spinner } from '@/components/ui/spinner';

export default function BrowseLoadingPage() {
  return (
    <div className={'container mx-auto space-y-6 py-8'}>
      {/* Page Header Skeleton */}
      <div className={'space-y-2'}>
        <div className={'h-9 w-64 animate-pulse rounded-lg bg-muted'} />
        <div className={'h-5 w-96 animate-pulse rounded-lg bg-muted'} />
      </div>

      {/* Search Bar Skeleton */}
      <div className={'h-10 w-full animate-pulse rounded-lg bg-muted'} />

      {/* Content Loading */}
      <div className={'flex min-h-[400px] items-center justify-center'}>
        <Spinner className={'size-16'} />
      </div>
    </div>
  );
}

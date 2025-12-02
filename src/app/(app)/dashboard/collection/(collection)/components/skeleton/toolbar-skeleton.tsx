import { Skeleton } from '@/components/ui/skeleton';

export const ToolbarSkeleton = () => {
  return (
    <div
      aria-busy={'true'}
      aria-label={'Loading toolbar'}
      className={`sticky top-[var(--header-height)] z-10 flex flex-col gap-4 border-b bg-background/95 p-4
        backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between`}
      data-slot={'toolbar-skeleton'}
      role={'status'}
    >
      <span className={'sr-only'}>Loading toolbar...</span>

      {/* Left Side - Search and Filters */}
      <div className={'flex flex-1 items-center gap-2'}>
        <Skeleton className={'h-9 w-full max-w-sm'} />
        <Skeleton className={'h-8 w-20'} />
        <Skeleton className={'h-8 w-16'} />
      </div>

      {/* Right Side - Actions (Desktop) */}
      <div className={'hidden items-center gap-2 lg:flex'}>
        <Skeleton className={'size-8'} />
        <Skeleton className={'h-8 w-20'} />
        <Skeleton className={'h-8 w-32'} />
      </div>

      {/* Mobile Actions Row */}
      <div className={'flex items-center gap-2 lg:hidden'}>
        <Skeleton className={'h-8 w-20'} />
      </div>
    </div>
  );
};

import { Skeleton } from '@/components/ui/skeleton';

export const PhotoUploadSkeleton = () => (
  <div className={'space-y-4'}>
    {/* Upload area */}
    <div className={'rounded-lg border-2 border-dashed border-border p-8'}>
      <div className={'flex flex-col items-center text-center'}>
        <Skeleton className={'mb-4 h-12 w-12 rounded-full'} />
        <Skeleton className={'mb-2 h-5 w-48'} />
        <Skeleton className={'h-4 w-64'} />
        <Skeleton className={'mt-4 h-10 w-32'} />
      </div>
    </div>

    {/* Photo preview grid placeholder */}
    <div className={'grid grid-cols-2 gap-4 md:grid-cols-4'}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div className={'aspect-square'} key={i}>
          <Skeleton className={'h-full w-full rounded'} />
        </div>
      ))}
    </div>
  </div>
);

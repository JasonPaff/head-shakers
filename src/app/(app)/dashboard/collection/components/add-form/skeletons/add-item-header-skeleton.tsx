import { Skeleton } from '@/components/ui/skeleton';

export const AddItemHeaderSkeleton = () => (
  <div className={'flex items-center justify-between'}>
    <div>
      <Skeleton className={'mb-2 h-9 w-64'} />
      <Skeleton className={'h-5 w-80'} />
    </div>
    <Skeleton className={'h-10 w-20'} />
  </div>
);

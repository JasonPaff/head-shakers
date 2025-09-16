import { Skeleton } from '@/components/ui/skeleton';

interface FormFieldSkeletonProps {
  isCheckbox?: boolean;
  isRequired?: boolean;
  isTextarea?: boolean;
}

export const FormFieldSkeleton = ({
  isCheckbox = false,
  isRequired = false,
  isTextarea = false
}: FormFieldSkeletonProps) => (
  <div className={'space-y-2'}>
    <div className={'flex items-center gap-1'}>
      <Skeleton className={'h-4 w-16'} />
      {isRequired && <Skeleton className={'h-3 w-3 rounded-full'} />}
    </div>
    {isCheckbox ? (
      <div className={'flex items-center gap-2'}>
        <Skeleton className={'h-4 w-4 rounded'} />
        <Skeleton className={'h-4 w-24'} />
      </div>
    ) : (
      <Skeleton
        className={isTextarea ? 'h-20 w-full' : 'h-10 w-full'}
      />
    )}
  </div>
);
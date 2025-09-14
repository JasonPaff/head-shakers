import { cn } from '@/utils/tailwind-utils';

type SpinnerProps = ClassName;

export const Spinner = ({ className }: SpinnerProps) => {
  return (
    <div className={cn('relative size-12', className)}>
      <div className={'absolute inset-0 rounded-full border-2 border-muted'}></div>
      <div
        className={cn(
          'absolute inset-0 animate-spin rounded-full',
          'border-2 border-primary border-t-transparent',
        )}
      ></div>
    </div>
  );
};

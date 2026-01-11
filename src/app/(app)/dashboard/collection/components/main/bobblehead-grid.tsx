import { cn } from '@/utils/tailwind-utils';

type BobbleheadGridProps = Children<{
  gridDensity: 'comfortable' | 'compact';
  isEmpty?: boolean;
}>;

export const BobbleheadGrid = ({ children, gridDensity, isEmpty }: BobbleheadGridProps) => {
  const gridCols =
    gridDensity === 'compact' ?
      'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7'
    : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

  return (
    <div className={'p-4 pb-8'} data-slot={'bobblehead-grid-container'}>
      {isEmpty ?
        <div className={'flex h-full items-center justify-center'}>{children}</div>
      : <div className={cn('grid gap-4', gridCols)} data-slot={'bobblehead-grid'}>
          {children}
        </div>
      }
    </div>
  );
};

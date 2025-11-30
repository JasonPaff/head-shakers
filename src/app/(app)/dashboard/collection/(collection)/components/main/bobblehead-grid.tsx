import { cn } from '@/utils/tailwind-utils';

type BobbleheadGridProps = Children<{
  gridDensity: 'comfortable' | 'compact';
}>;

export const BobbleheadGrid = ({ children, gridDensity }: BobbleheadGridProps) => {
  const gridCols =
    gridDensity === 'compact' ?
      'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4';

  return (
    <div className={'flex-1 overflow-y-auto px-4 pb-4'} data-slot={'bobblehead-grid-container'}>
      <div className={cn('grid gap-4', gridCols)} data-slot={'bobblehead-grid'}>
        {children}
      </div>
    </div>
  );
};

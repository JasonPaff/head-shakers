import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { generateTestId } from '@/lib/test-ids';

export const FeaturedCollectionsSkeleton = () => {
  return (
    <div
      aria-busy={'true'}
      aria-label={'Loading featured collections'}
      className={'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'}
      data-slot={'featured-collections-skeleton'}
      data-testid={generateTestId('ui', 'skeleton', 'featured-collections')}
      role={'status'}
    >
      {/* Screen reader announcement */}
      <span className={'sr-only'}>Loading featured collections...</span>

      {Array.from({ length: 6 }).map((_, index) => (
        <Card
          aria-hidden={'true'}
          className={'overflow-hidden'}
          data-slot={'featured-collection-skeleton-card'}
          data-testid={generateTestId('ui', 'skeleton', `collection-${index}`)}
          key={index}
        >
          <Skeleton className={'aspect-[4/3] w-full rounded-none'} />
          <CardContent className={'p-4'}>
            {/* Title and Owner Section */}
            <div className={'mb-3'}>
              <Skeleton className={'mb-2 h-6 w-3/4'} />
              <Skeleton className={'h-4 w-1/2'} />
            </div>
            {/* Description Section */}
            <div className={'mb-4 space-y-2'}>
              <Skeleton className={'h-4 w-full'} />
              <Skeleton className={'h-4 w-5/6'} />
            </div>
            {/* Metrics Section */}
            <div className={'flex items-center justify-between'}>
              <Skeleton className={'h-8 w-16'} />
              <Skeleton className={'h-9 w-32'} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

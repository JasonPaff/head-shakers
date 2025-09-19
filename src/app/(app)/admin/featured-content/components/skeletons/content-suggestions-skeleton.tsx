import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const ContentSuggestionsSkeleton = () => (
  <div className={'space-y-4'}>
    {/* Header card */}
    <Card>
      <CardHeader>
        <div className={'flex items-center gap-2'}>
          <Skeleton className={'h-5 w-5'} />
          <Skeleton className={'h-6 w-56'} />
        </div>
        <Skeleton className={'h-4 w-[500px]'} />
      </CardHeader>
    </Card>

    {/* Suggestion cards */}
    <div className={'grid gap-4'}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className={'p-6'}>
            <div className={'flex items-start justify-between'}>
              <div className={'flex-1'}>
                <div className={'mb-2 flex items-center gap-2'}>
                  <Skeleton className={'h-5 w-48'} />
                  <Skeleton className={'h-4 w-20'} />
                  <Skeleton className={'h-4 w-8'} />
                </div>
                <Skeleton className={'mb-2 h-4 w-16'} />
                <Skeleton className={'mb-3 h-4 w-80'} />
                <div className={'flex items-center gap-4'}>
                  <Skeleton className={'h-3 w-16'} />
                  <Skeleton className={'h-3 w-12'} />
                  <Skeleton className={'h-3 w-20'} />
                </div>
              </div>
              <div className={'flex flex-col gap-2'}>
                <Skeleton className={'h-8 w-24'} />
                <Skeleton className={'h-8 w-24'} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

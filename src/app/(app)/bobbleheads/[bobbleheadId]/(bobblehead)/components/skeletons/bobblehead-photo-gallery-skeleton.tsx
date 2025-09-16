import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const BobbleheadPhotoGallerySkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className={'h-6 w-40'} /> {/* Title */}
    </CardHeader>
    <CardContent>
      <div className={'grid grid-cols-2 gap-4 md:grid-cols-4'}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton className={'aspect-square rounded-lg'} key={i} />
        ))}
      </div>
    </CardContent>
  </Card>
);
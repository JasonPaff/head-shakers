import type { GetBobbleheadById } from '@/lib/queries/bobbleheads.queries';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/tailwind-utils';

interface BobbleheadPhotoGalleryCardProps {
  bobblehead: NonNullable<GetBobbleheadById>;
}

export const BobbleheadPhotoGalleryCard = ({ bobblehead }: BobbleheadPhotoGalleryCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Photo Gallery</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={'grid grid-cols-2 gap-4 md:grid-cols-4'}>
          {bobblehead.photos.map((photo) => (
            <div
              className={cn(
                'group relative aspect-square cursor-pointer overflow-hidden',
                'rounded-lg bg-muted transition-opacity hover:opacity-80',
              )}
              key={photo.id}
            >
              <img
                alt={photo.altText ?? bobblehead.name}
                className={'object-cover transition-transform group-hover:scale-105'}
                src={photo.url || '/placeholder.svg'}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

'use client';

import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LikeCompactButton } from '@/components/ui/like-button';
import { CLOUDINARY_PATHS } from '@/lib/constants/cloudinary-paths';

export interface FeaturedCollection {
  comments: number;
  contentId: string;
  description: string;
  id: string;
  imageUrl: null | string;
  isLiked: boolean;
  likeId: null | string;
  likes: number;
  ownerDisplayName: string;
  title: string;
  viewCount: number;
}

export interface FeaturedCollectionsDisplayProps {
  collections: Array<FeaturedCollection>;
}

export const FeaturedCollectionsDisplay = ({ collections }: FeaturedCollectionsDisplayProps) => {
  if (collections.length === 0) {
    return (
      <div className={'py-12 text-center'}>
        <p className={'text-muted-foreground'}>No featured collections available at this time.</p>
      </div>
    );
  }

  return (
    <div className={'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'}>
      {collections.map((collection) => {
        const hasImage = collection.imageUrl && collection.imageUrl !== '/placeholder.jpg';

        return (
          <Card className={'group overflow-hidden transition-all hover:shadow-lg'} key={collection.id}>
            <Link className={'block'} href={`/collections/${collection.contentId}`}>
              <div className={'relative aspect-[4/3] w-full overflow-hidden bg-muted'}>
                {hasImage ?
                  <CldImage
                    alt={collection.title}
                    className={
                      'size-full object-cover transition-transform duration-300 group-hover:scale-105'
                    }
                    crop={'fill'}
                    format={'auto'}
                    gravity={'auto'}
                    height={400}
                    quality={'auto:good'}
                    src={collection.imageUrl ?? ''}
                    width={533}
                  />
                : <Image
                    alt={'Collection placeholder'}
                    className={'size-full object-cover'}
                    height={400}
                    src={CLOUDINARY_PATHS.PLACEHOLDERS.COLLECTION_COVER}
                    width={533}
                  />
                }
              </div>
            </Link>

            <CardContent className={'p-4'}>
              <div className={'mb-3'}>
                <Link href={`/collections/${collection.contentId}`}>
                  <h3 className={'mb-1 line-clamp-1 font-semibold transition-colors hover:text-primary'}>
                    {collection.title}
                  </h3>
                </Link>
                <p className={'text-sm text-muted-foreground'}>by {collection.ownerDisplayName}</p>
              </div>

              <p className={'mb-4 line-clamp-2 text-sm text-muted-foreground'}>{collection.description}</p>

              <div className={'flex items-center justify-between'}>
                <LikeCompactButton
                  initialLikeCount={collection.likes}
                  isInitiallyLiked={collection.isLiked}
                  targetId={collection.contentId}
                  targetType={'collection'}
                />

                <Button asChild size={'sm'} variant={'outline'}>
                  <Link href={`/collections/${collection.contentId}`}>View Collection</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

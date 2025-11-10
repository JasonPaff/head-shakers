'use client';

import type { Route } from 'next';

import { Heart, ImageIcon, User, Users } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Image from 'next/image';
import Link from 'next/link';

import type { BrowseCollectionRecord } from '@/lib/queries/collections/collections.query';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';

interface BrowseCollectionsTableProps {
  collections: Array<BrowseCollectionRecord>;
}

export function BrowseCollectionsTable({ collections }: BrowseCollectionsTableProps) {
  if (collections.length === 0) {
    return (
      <EmptyState
        description={'Try adjusting your filters or search query'}
        icon={ImageIcon}
        title={'No Collections Found'}
      />
    );
  }

  return (
    <div className={'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}>
      {collections.map((record) => {
        const collectionPath = $path({
          route: '/collections/[collectionId]',
          routeParams: { collectionId: record.collection.id },
        }) as Route;
        return (
          <Link href={collectionPath} key={record.collection.id}>
            <Card className={'group h-full transition-all hover:shadow-lg'}>
              {/* Collection Image */}
              <div className={'relative aspect-square w-full overflow-hidden rounded-t-lg bg-muted'}>
                {record.firstBobbleheadPhoto ?
                  <Image
                    alt={record.collection.name}
                    className={'object-cover transition-transform group-hover:scale-105'}
                    fill
                    sizes={
                      '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw'
                    }
                    src={record.firstBobbleheadPhoto}
                  />
                : <div className={'flex h-full items-center justify-center'}>
                    <ImageIcon className={'size-16 text-muted-foreground'} />
                  </div>
                }
              </div>

              {/* Collection Info */}
              <CardHeader className={'space-y-2'}>
                <CardTitle className={'line-clamp-1 text-lg'}>{record.collection.name}</CardTitle>
                {record.collection.description && (
                  <CardDescription className={'line-clamp-2'}>
                    {record.collection.description}
                  </CardDescription>
                )}
              </CardHeader>

              {/* Owner Info */}
              <CardContent className={'space-y-4'}>
                <div className={'flex items-center gap-2'}>
                  <Avatar className={'size-6'}>
                    {record.owner.avatarUrl && (
                      <AvatarImage alt={record.owner.displayName} src={record.owner.avatarUrl} />
                    )}
                    <AvatarFallback className={'text-xs'}>
                      <User className={'size-3'} />
                    </AvatarFallback>
                  </Avatar>
                  <span className={'text-sm text-muted-foreground'}>
                    by <span className={'font-medium text-foreground'}>{record.owner.displayName}</span>
                  </span>
                </div>

                {/* Stats */}
                <div className={'flex items-center justify-between text-sm text-muted-foreground'}>
                  <div className={'flex items-center gap-1'}>
                    <ImageIcon className={'size-4'} />
                    <span>{record.collection.totalItems || 0}</span>
                  </div>
                  <div className={'flex items-center gap-3'}>
                    <div className={'flex items-center gap-1'}>
                      <Heart className={'size-4'} />
                      <span>{record.collection.likeCount || 0}</span>
                    </div>
                    <div className={'flex items-center gap-1'}>
                      <Users className={'size-4'} />
                      <span>{record.followerCount}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

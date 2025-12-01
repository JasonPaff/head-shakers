import { EditIcon, HeartIcon, MoreVerticalIcon, ShareIcon, TrashIcon } from 'lucide-react';

import { CollectionShareMenu } from '@/components/feature/collections/collection-share-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils/currency.utils';

export type CollectionHeaderCardProps = {
  bobbleheadCount: number;
  collectionSlug: string;
  coverImageUrl: null | string;
  description: null | string;
  featuredCount: number;
  likeCount: number;
  name: string;
  onDelete?: () => void;
  onEdit?: () => void;
  totalValue: null | number;
  viewCount: number;
};

export const CollectionHeaderCard = ({
  bobbleheadCount,
  collectionSlug,
  coverImageUrl,
  description,
  featuredCount,
  likeCount,
  name,
  onDelete,
  onEdit,
  totalValue,
  viewCount,
}: CollectionHeaderCardProps) => {
  const formattedValue = formatCurrency(totalValue);

  return (
    <Card className={'m-4 mb-0 hidden lg:block'} data-slot={'collection-header-card'}>
      <CardHeader className={'border-b'}>
        <div className={'flex items-start justify-between'}>
          <div className={'flex items-start gap-4'}>
            {/* Cover Image */}
            <Avatar className={'size-20 rounded-lg'}>
              <AvatarImage alt={name} src={coverImageUrl ?? undefined} />
              <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
            </Avatar>

            {/* Collection Info */}
            <div className={'flex-1 space-y-2'}>
              <CardTitle className={'text-2xl'}>{name}</CardTitle>
              <CardDescription>{description}</CardDescription>

              {/* Quick Stats */}
              <div className={'flex items-center gap-4 text-sm text-muted-foreground'}>
                <span className={'font-medium'}>{bobbleheadCount} items</span>
                <span>{featuredCount} featured</span>
                <span className={'font-semibold text-primary'}>{formattedValue} total value</span>
                <Separator className={'h-4'} orientation={'vertical'} />
                <span>
                  <HeartIcon aria-hidden className={'inline size-3.5'} /> {likeCount}
                </span>
                <span>{viewCount} views</span>
              </div>
            </div>
          </div>

          {/* Collection Actions */}
          <div className={'flex items-center gap-2'}>
            <Button onClick={onEdit} size={'sm'} variant={'outline'}>
              <EditIcon aria-hidden className={'size-4'} />
              Edit
            </Button>
            <CollectionShareMenu collectionSlug={collectionSlug}>
              <Button size={'sm'} variant={'outline'}>
                <ShareIcon aria-hidden className={'size-4'} />
                Share
              </Button>
            </CollectionShareMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size={'icon'} variant={'ghost'}>
                  <MoreVerticalIcon aria-hidden className={'size-4'} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={'end'}>
                <DropdownMenuItem onClick={onDelete} variant={'destructive'}>
                  <TrashIcon aria-hidden className={'size-4'} />
                  Delete Collection
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

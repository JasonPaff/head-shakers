import { EditIcon, HeartIcon, MoreVerticalIcon, TrashIcon } from 'lucide-react';

import type { CollectionDashboardHeaderRecord } from '@/lib/queries/collections/collections-dashboard.query';

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
  collection: CollectionDashboardHeaderRecord;
  onDelete: () => void;
  onEdit: () => void;
};

export const CollectionHeaderCard = ({ collection, onDelete, onEdit }: CollectionHeaderCardProps) => {
  const formattedValue = formatCurrency(collection.totalValue);

  return (
    <Card className={'m-4 mb-0 hidden lg:block'} data-slot={'collection-header-card'}>
      <CardHeader className={'border-b'}>
        <div className={'flex items-start justify-between'}>
          <div className={'flex items-start gap-4'}>
            {/* Cover Image */}
            <Avatar className={'size-20 rounded-md'}>
              <AvatarImage alt={collection.name} src={collection.coverImageUrl ?? undefined} />
              <AvatarFallback>{collection.name?.charAt(0)}</AvatarFallback>
            </Avatar>

            {/* Collection Info */}
            <div className={'flex-1 space-y-2'}>
              <CardTitle className={'text-2xl'}>{collection.name}</CardTitle>
              <CardDescription>{collection.description}</CardDescription>

              {/* Quick Stats */}
              <div className={'flex items-center gap-4 text-sm text-muted-foreground'}>
                <span className={'font-medium'}>{collection.bobbleheadCount} items</span>
                <span>{collection.featuredCount} featured</span>
                <span className={'font-semibold text-primary'}>{formattedValue} total value</span>
                <Separator className={'h-4'} orientation={'vertical'} />
                <span>
                  <HeartIcon aria-hidden className={'inline size-3.5'} /> {collection.likeCount}
                </span>
                <span>{collection.viewCount} views</span>
                <span>
                  {collection.commentCount} {collection.commentCount === 1 ? 'comment' : 'comments'}
                </span>
              </div>
            </div>
          </div>

          {/* Collection Actions */}
          <div className={'flex items-center gap-2'}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size={'icon'} variant={'ghost'}>
                  <MoreVerticalIcon aria-hidden className={'size-4'} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={'end'}>
                <DropdownMenuItem onClick={onEdit}>
                  <EditIcon aria-hidden className={'size-4'} />
                  Edit Collection
                </DropdownMenuItem>
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

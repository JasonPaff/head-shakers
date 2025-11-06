'use client';

import {
  CalendarIcon,
  EyeIcon,
  HeartIcon,
  MessageCircleIcon,
  StarIcon,
  TrendingUpIcon,
  UserIcon,
} from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';
import { Fragment } from 'react';

import type { LikeTargetType } from '@/lib/constants';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { LikeCompactButton } from '@/components/ui/like-button';
import { ENUMS } from '@/lib/constants';

export interface FeaturedContentItem {
  comments: number;
  contentId: string;
  contentType: 'bobblehead' | 'collection' | 'user';
  description: string;
  endDate?: null | string;
  id: string;
  imageUrl: null | string;
  isLiked: boolean;
  likeId: null | string;
  likes: number;
  owner: string;
  ownerDisplayName: string;
  priority: number;
  startDate: string;
  title: string;
  viewCount: number;
}

export interface FeaturedHeroDisplayProps {
  heroData: {
    collection_of_week: Array<FeaturedContentItem>;
    homepage_banner: Array<FeaturedContentItem>;
  };
  onViewContent?: (contentId: string) => Promise<void>;
}

const getContentTypeLabel = (type: string) => {
  switch (type) {
    case 'bobblehead':
      return 'Bobblehead';
    case 'collection':
      return 'Collection';
    case 'user':
      return 'Collector';
    default:
      return type;
  }
};

const getContentTypeIcon = (type: string) => {
  switch (type) {
    case 'bobblehead':
      return <TrendingUpIcon aria-hidden className={'size-4'} />;
    case 'collection':
      return <StarIcon aria-hidden className={'size-4'} />;
    case 'user':
      return <UserIcon aria-hidden className={'size-4'} />;
    default:
      return <StarIcon aria-hidden className={'size-4'} />;
  }
};

const getContentTypeColor = (type: string) => {
  switch (type) {
    case 'bobblehead':
      return 'bg-green-100 text-green-800';
    case 'collection':
      return 'bg-blue-100 text-blue-800';
    case 'user':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const FeaturedHeroDisplay = ({ heroData, onViewContent }: FeaturedHeroDisplayProps) => {
  const handleContentView = async (contentId: string) => {
    if (onViewContent) {
      try {
        await onViewContent(contentId);
      } catch (error) {
        console.error('Failed to track content view:', error);
      }
    }
  };

  const renderFeaturedCard = (content: FeaturedContentItem, isHero = false) => {
    const cardClasses = isHero ? 'col-span-full lg:col-span-2' : 'col-span-1';
    const hasImage = content.imageUrl && content.imageUrl !== '/placeholder.jpg';

    return (
      <Card className={cardClasses} key={content.id}>
        <div className={'relative'}>
          {hasImage ?
            <div className={'relative aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-muted'}>
              <CldImage
                alt={content.title}
                className={'size-full object-contain'}
                crop={'pad'}
                format={'auto'}
                height={isHero ? 600 : 400}
                quality={'auto:good'}
                src={content?.imageUrl ?? ''}
                width={isHero ? 800 : 533}
              />
            </div>
          : <div className={'aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-muted'}>
              <img alt={content.title} className={'size-full object-contain'} src={'/placeholder.jpg'} />
            </div>
          }
          <div className={'absolute top-4 left-4 flex gap-2'}>
            <Badge className={getContentTypeColor(content.contentType)}>
              {getContentTypeIcon(content.contentType)}
              {getContentTypeLabel(content.contentType)}
            </Badge>
            <Conditional isCondition={isHero}>
              <Badge className={'bg-yellow-100 text-yellow-800'} variant={'secondary'}>
                <StarIcon aria-hidden className={'mr-1 size-3'} />
                Featured
              </Badge>
            </Conditional>
          </div>
        </div>

        <CardHeader className={'pb-3'}>
          <CardTitle className={isHero ? 'text-2xl' : 'text-lg'}>{content.title}</CardTitle>
          <div className={'flex items-center gap-2 text-sm text-muted-foreground'}>
            <span>by {content.ownerDisplayName}</span>
            <Conditional isCondition={!!content.endDate}>
              <Fragment>
                <span>•</span>
                <div className={'flex items-center gap-1'}>
                  <CalendarIcon aria-hidden className={'size-3'} />
                  <span>Until {new Date(content.endDate!).toLocaleDateString()}</span>
                </div>
              </Fragment>
            </Conditional>
          </div>
        </CardHeader>

        <CardContent className={'pt-0'}>
          <p className={`mb-4 text-muted-foreground ${isHero ? 'text-base' : 'text-sm'}`}>
            {content.description}
          </p>

          <div className={'flex items-center justify-between'}>
            <div className={'flex items-center gap-4 text-sm text-muted-foreground'}>
              <span className={'flex items-center gap-1'}>
                <EyeIcon aria-hidden className={'size-4'} />
                {content.viewCount.toLocaleString()}
              </span>
              <span className={'flex items-center gap-1'}>
                <MessageCircleIcon aria-hidden className={'size-4'} />
                {content.comments}
              </span>
              <Conditional
                isCondition={ENUMS.LIKE.TARGET_TYPE.includes(content.contentType as LikeTargetType)}
              >
                <LikeCompactButton
                  initialLikeCount={content.likes}
                  isInitiallyLiked={content.isLiked}
                  targetId={content.contentId}
                  targetType={content.contentType as LikeTargetType}
                />
              </Conditional>
              <Conditional
                isCondition={!ENUMS.LIKE.TARGET_TYPE.includes(content.contentType as LikeTargetType)}
              >
                <span className={'flex items-center gap-1'}>
                  <HeartIcon aria-hidden className={'size-4'} />
                  {content.likes}
                </span>
              </Conditional>
            </div>

            <Button
              asChild
              onClick={() => {
                void handleContentView(content.id);
              }}
              size={'sm'}
            >
              <Link href={`/${content.contentType}s/${content.contentId}`}>
                View {getContentTypeLabel(content.contentType)}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <section>
      <div className={'mb-6'}>
        <h2 className={'mb-2 text-2xl font-bold'}>Featured This Week</h2>
        <p className={'text-muted-foreground'}>
          Hand-picked collections and items that showcase the best of our community
        </p>
      </div>
      <div className={'grid grid-cols-1 gap-6 lg:grid-cols-3'}>
        {heroData.homepage_banner.map((content) => renderFeaturedCard(content, true))}
        {heroData.collection_of_week.slice(0, 1).map((content) => renderFeaturedCard(content))}
      </div>
    </section>
  );
};

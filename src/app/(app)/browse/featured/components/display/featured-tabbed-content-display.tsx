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
import { Fragment, useState } from 'react';

import type { LikeTargetType } from '@/lib/constants';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { LikeCompactButton } from '@/components/ui/like-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ENUMS } from '@/lib/constants';
import { extractPublicIdFromCloudinaryUrl } from '@/lib/utils/cloudinary.utils';

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

export interface FeaturedTabbedContentDisplayProps {
  onViewContent?: (contentId: string) => Promise<void>;
  tabbedData: {
    editor_pick: Array<FeaturedContentItem>;
    trending: Array<FeaturedContentItem>;
  };
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

export const FeaturedTabbedContentDisplay = ({
  onViewContent,
  tabbedData,
}: FeaturedTabbedContentDisplayProps) => {
  const [activeTab, setActiveTab] = useState('all');

  const getAllFeaturedContent = () => {
    return [...tabbedData.editor_pick, ...tabbedData.trending].sort((a, b) => a.priority - b.priority);
  };

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
                src={extractPublicIdFromCloudinaryUrl(content?.imageUrl ?? '')}
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
      <Tabs onValueChange={setActiveTab} value={activeTab}>
        <div className={'mb-6 flex items-center justify-between'}>
          <TabsList>
            <TabsTrigger value={'all'}>All Featured</TabsTrigger>
            <TabsTrigger value={'collections'}>Collections</TabsTrigger>
            <TabsTrigger value={'bobbleheads'}>Bobbleheads</TabsTrigger>
            <TabsTrigger value={'collectors'}>Collectors</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent className={'space-y-6'} value={'all'}>
          <div className={'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'}>
            {getAllFeaturedContent().map((content) => renderFeaturedCard(content))}
          </div>
        </TabsContent>

        <TabsContent className={'space-y-6'} value={'collections'}>
          <div className={'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'}>
            {getAllFeaturedContent()
              .filter((content) => content.contentType === 'collection')
              .map((content) => renderFeaturedCard(content))}
          </div>
        </TabsContent>

        <TabsContent className={'space-y-6'} value={'bobbleheads'}>
          <div className={'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'}>
            {getAllFeaturedContent()
              .filter((content) => content.contentType === 'bobblehead')
              .map((content) => renderFeaturedCard(content))}
          </div>
        </TabsContent>

        <TabsContent className={'space-y-6'} value={'collectors'}>
          <div className={'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'}>
            {getAllFeaturedContent()
              .filter((content) => content.contentType === 'user')
              .map((content) => renderFeaturedCard(content))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
};

'use client';

import { SignInButton, SignUpButton } from '@clerk/nextjs';
import {
  CalendarIcon,
  EyeIcon,
  HeartIcon,
  MessageCircleIcon,
  StarIcon,
  TrendingUpIcon,
  UserIcon,
} from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Fragment, useState } from 'react';

import { AuthContent } from '@/components/ui/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface FeaturedContentDisplayProps {
  featuredContentData?: {
    collection_of_week: Array<FeaturedContentItem>;
    editor_pick: Array<FeaturedContentItem>;
    homepage_banner: Array<FeaturedContentItem>;
    trending: Array<FeaturedContentItem>;
  };
  onViewContent?: (contentId: string) => Promise<void>;
}

export interface FeaturedContentItem {
  comments: number;
  contentId: string;
  contentType: 'bobblehead' | 'collection' | 'user';
  description: string;
  endDate?: null | string;
  id: string;
  imageUrl: string;
  likes: number;
  owner: string;
  ownerDisplayName: string;
  priority: number;
  startDate: string;
  title: string;
  viewCount: number;
}

// fallback mock data for development/testing
const mockFeaturedContent = {
  collection_of_week: [
    {
      comments: 67,
      contentId: 'coll-101',
      contentType: 'collection' as const,
      description:
        'An amazing collection of iconic movie characters from the past 50 years, featuring heroes and villains alike.',
      endDate: '2024-01-14',
      id: '4',
      imageUrl: 'https://images.unsplash.com/photo-1489599953984-75afc8b4b1d8?w=600&h=400&fit=crop',
      likes: 298,
      owner: 'cinema_lover',
      ownerDisplayName: 'Chris Brown',
      priority: 1,
      startDate: '2024-01-08',
      title: 'Movie Character Bobbleheads',
      viewCount: 12450,
    },
  ],
  editor_pick: [
    {
      comments: 56,
      contentId: 'bob-456',
      contentType: 'bobblehead' as const,
      description:
        'Rare limited edition Batman bobblehead from the 1989 movie series, only 500 made worldwide.',
      id: '2',
      imageUrl: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=600&h=600&fit=crop',
      likes: 234,
      owner: 'superhero_fan',
      ownerDisplayName: 'Sarah Wilson',
      priority: 2,
      startDate: '2024-01-10',
      title: 'Limited Edition Batman Bobblehead',
      viewCount: 8760,
    },
    {
      comments: 34,
      contentId: 'coll-789',
      contentType: 'collection' as const,
      description:
        'Complete set of Disney Princess bobbleheads featuring all official Disney Princesses in their classic outfits.',
      id: '3',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
      likes: 156,
      owner: 'disney_queen',
      ownerDisplayName: 'Emma Davis',
      priority: 3,
      startDate: '2024-01-05',
      title: 'Disney Princess Collection',
      viewCount: 6890,
    },
  ],
  homepage_banner: [
    {
      comments: 89,
      contentId: 'coll-123',
      contentType: 'collection' as const,
      description:
        'A comprehensive collection of vintage baseball bobbleheads featuring legendary players from the golden era of baseball.',
      endDate: '2024-02-15',
      id: '1',
      imageUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=600&fit=crop',
      likes: 342,
      owner: 'vintage_collector',
      ownerDisplayName: 'Mike Johnson',
      priority: 1,
      startDate: '2024-01-15',
      title: 'Baseball Legends Complete Collection',
      viewCount: 15420,
    },
  ],
  trending: [
    {
      comments: 23,
      contentId: 'user-202',
      contentType: 'user' as const,
      description: 'Featured collector with over 500 bobbleheads and 15 years of collecting experience.',
      id: '5',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      likes: 187,
      owner: 'collector_spotlight',
      ownerDisplayName: 'John Smith',
      priority: 1,
      startDate: '2024-01-12',
      title: 'Collector Spotlight: John Smith',
      viewCount: 5430,
    },
  ],
};

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
export const FeaturedContentDisplay = ({
  featuredContentData = mockFeaturedContent,
  onViewContent,
}: FeaturedContentDisplayProps) => {
  const [activeTab, setActiveTab] = useState('all');

  const getAllFeaturedContent = () => {
    return [
      ...featuredContentData.homepage_banner,
      ...featuredContentData.editor_pick,
      ...featuredContentData.collection_of_week,
      ...featuredContentData.trending,
    ].sort((a, b) => a.priority - b.priority);
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

    return (
      <Card className={cardClasses} key={content.id}>
        <div className={'relative'}>
          <img
            alt={content.title}
            className={`w-full rounded-t-lg object-cover ${isHero ? 'h-64 lg:h-80' : 'h-48'}`}
            src={content.imageUrl}
          />
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
                <HeartIcon aria-hidden className={'size-4'} />
                {content.likes}
              </span>
              <span className={'flex items-center gap-1'}>
                <MessageCircleIcon aria-hidden className={'size-4'} />
                {content.comments}
              </span>
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
    <div className={'space-y-8'}>
      {/* Hero Banner */}
      <section>
        <div className={'mb-6'}>
          <h2 className={'mb-2 text-2xl font-bold'}>Featured This Week</h2>
          <p className={'text-muted-foreground'}>
            Hand-picked collections and items that showcase the best of our community
          </p>
        </div>
        <div className={'grid grid-cols-1 gap-6 lg:grid-cols-3'}>
          {featuredContentData.homepage_banner.map((content) => renderFeaturedCard(content, true))}
          {featuredContentData.collection_of_week.slice(0, 1).map((content) => renderFeaturedCard(content))}
        </div>
      </section>

      {/* Tabbed Content */}
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
              {getAllFeaturedContent()
                .slice(1)
                .map((content) => renderFeaturedCard(content))}
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

      {/* Call to Action */}
      <section className={'rounded-lg bg-muted/30 p-8 text-center'}>
        <h3 className={'mb-2 text-xl font-semibold'}>Want to be featured?</h3>
        <p className={'mb-4 text-muted-foreground'}>
          Share your amazing collections and connect with other collectors to get noticed by our community
        </p>
        <div className={'flex justify-center gap-3'}>
          <AuthContent
            fallback={
              <div className={'space-x-2'}>
                <Button asChild>
                  <SignInButton mode={'modal'}>Sign In</SignInButton>
                </Button>
                <Button asChild>
                  <SignUpButton mode={'modal'}>Sign Up</SignUpButton>
                </Button>
              </div>
            }
          >
            <Button asChild>
              <Link href={$path({ route: '/dashboard/collection' })}>Create Collection</Link>
            </Button>
            <Button asChild variant={'outline'}>
              <Link href={$path({ route: '/bobbleheads/add' })}>Add Bobblehead</Link>
            </Button>
          </AuthContent>
        </div>
      </section>
    </div>
  );
};

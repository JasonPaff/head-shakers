'use client';

import { EyeIcon, HeartIcon, TrendingUpIcon, UsersIcon } from 'lucide-react';
import { Fragment } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';

interface ContentSuggestionsProps {
  onFeature: () => void;
}

// mock suggestions data - would come from analytics in real implementation
const mockSuggestions = [
  {
    id: '1',
    metrics: { comments: 89, likes: 342, views: 15420 },
    name: 'Retro Baseball Collection',
    owner: 'vintage_collector',
    reason: 'High engagement and view growth (+45% this week)',
    trendingScore: 95,
    type: 'collection',
  },
  {
    id: '2',
    metrics: { comments: 56, likes: 234, views: 8760 },
    name: 'Limited Edition Batman Bobblehead',
    owner: 'superhero_fan',
    reason: 'Rare item with consistent high engagement',
    trendingScore: 88,
    type: 'bobblehead',
  },
  {
    id: '3',
    metrics: { collections: 12, followers: 1200, totalItems: 450 },
    name: 'Sarah Mitchell',
    reason: 'Active community member with quality content',
    trendingScore: 82,
    type: 'user',
    username: 'disney_queen',
  },
  {
    id: '4',
    metrics: { comments: 34, likes: 156, views: 6890 },
    name: 'Movie Character Bobbleheads',
    owner: 'cinema_lover',
    reason: 'Growing collection with unique items',
    trendingScore: 76,
    type: 'collection',
  },
];

const getTypeColor = (type: string) => {
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

const getTrendingColor = (score: number) => {
  if (score >= 90) return 'text-red-600';
  if (score >= 80) return 'text-orange-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-gray-600';
};

export const ContentSuggestions = ({ onFeature }: ContentSuggestionsProps) => {
  return (
    <div className={'space-y-4'}>
      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <TrendingUpIcon aria-hidden className={'size-5'} />
            Trending Content Suggestions
          </CardTitle>
          <p className={'text-sm text-muted-foreground'}>
            AI-powered suggestions based on engagement metrics, growth trends, and community activity
          </p>
        </CardHeader>
      </Card>

      <div className={'grid gap-4'}>
        {mockSuggestions.map((suggestion) => (
          <Card key={suggestion.id}>
            <CardContent className={'p-6'}>
              <div className={'flex items-start justify-between'}>
                <div className={'flex-1'}>
                  <div className={'mb-2 flex items-center gap-2'}>
                    <h3 className={'font-semibold'}>{suggestion.name}</h3>
                    <Conditional isCondition={!!suggestion.username}>
                      <span className={'text-sm text-muted-foreground'}>@{suggestion.username}</span>
                    </Conditional>
                    <Badge className={getTypeColor(suggestion.type)}>{suggestion.type}</Badge>
                    <div className={'flex items-center gap-1'}>
                      <TrendingUpIcon aria-hidden className={'size-4'} />
                      <span className={`font-semibold ${getTrendingColor(suggestion.trendingScore)}`}>
                        {suggestion.trendingScore}
                      </span>
                    </div>
                  </div>

                  <Conditional isCondition={!!suggestion.owner}>
                    <p className={'mb-2 text-sm text-muted-foreground'}>by {suggestion.owner}</p>
                  </Conditional>

                  <p className={'mb-3 text-sm'}>{suggestion.reason}</p>

                  <div className={'flex items-center gap-4 text-xs text-muted-foreground'}>
                    {suggestion.type === 'user' ?
                      <Fragment>
                        <span className={'flex items-center gap-1'}>
                          <EyeIcon aria-hidden className={'size-3'} />
                          {suggestion.metrics.collections} collections
                        </span>
                        <span className={'flex items-center gap-1'}>
                          <HeartIcon aria-hidden className={'size-3'} />
                          {suggestion.metrics.totalItems} items
                        </span>
                        <span className={'flex items-center gap-1'}>
                          <UsersIcon aria-hidden className={'size-3'} />
                          {suggestion.metrics.followers} followers
                        </span>
                      </Fragment>
                    : <Fragment>
                        <span className={'flex items-center gap-1'}>
                          <EyeIcon aria-hidden className={'size-3'} />
                          {suggestion.metrics.views?.toLocaleString()} views
                        </span>
                        <span className={'flex items-center gap-1'}>
                          <HeartIcon aria-hidden className={'size-3'} />
                          {suggestion.metrics.likes} likes
                        </span>
                        <span>{suggestion.metrics.comments} comments</span>
                      </Fragment>
                    }
                  </div>
                </div>

                <div className={'flex flex-col gap-2'}>
                  <Button onClick={onFeature} size={'sm'}>
                    Feature This
                  </Button>
                  <Button size={'sm'} variant={'outline'}>
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Conditional isCondition={mockSuggestions.length === 0}>
        <Card>
          <CardContent className={'p-8 text-center'}>
            <TrendingUpIcon className={'mx-auto mb-4 h-12 w-12 text-muted-foreground'} />
            <h3 className={'mb-2 font-semibold'}>No Suggestions Available</h3>
            <p className={'text-sm text-muted-foreground'}>
              Check back later for AI-powered content suggestions based on trending metrics
            </p>
          </CardContent>
        </Card>
      </Conditional>
    </div>
  );
};

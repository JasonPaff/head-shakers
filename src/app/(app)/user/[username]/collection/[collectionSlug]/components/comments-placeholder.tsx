'use client';

import { ChevronDownIcon, ChevronUpIcon, MessageSquareIcon } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMonthDay } from '@/lib/utils/date.utils';
import { cn } from '@/utils/tailwind-utils';

// Mock comments data
const mockComments = [
  {
    author: {
      avatarUrl: 'https://placehold.co/40x40/6366f1/ffffff?text=MT',
      displayName: 'Mike T.',
      username: 'collector_mike',
    },
    content: 'Amazing collection! The Cal Ripken bobblehead is a real treasure. Where did you find it?',
    createdAt: new Date('2024-11-28'),
    id: '1',
    likeCount: 5,
  },
  {
    author: {
      avatarUrl: 'https://placehold.co/40x40/ec4899/ffffff?text=SK',
      displayName: 'Sarah K.',
      username: 'bobble_sarah',
    },
    content:
      'I have the same Brooks Robinson one! Great minds think alike. Such a great piece of Orioles history.',
    createdAt: new Date('2024-11-25'),
    id: '2',
    likeCount: 3,
  },
  {
    author: {
      avatarUrl: 'https://placehold.co/40x40/22c55e/ffffff?text=CL',
      displayName: 'Chris L.',
      username: 'sports_fan_22',
    },
    content: 'Love the mascot bobblehead! The Oriole Bird is iconic. This whole collection is fantastic!',
    createdAt: new Date('2024-11-20'),
    id: '3',
    likeCount: 8,
  },
];

interface CommentsPlaceholderProps {
  commentCount?: number;
}

export const CommentsPlaceholder = ({ commentCount = 12 }: CommentsPlaceholderProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={'mt-8'}>
      <CardHeader className={'cursor-pointer'} onClick={() => setIsExpanded(!isExpanded)}>
        <div className={'flex items-center justify-between'}>
          <CardTitle className={'flex items-center gap-2 text-lg'}>
            <MessageSquareIcon className={'size-5'} />
            Comments ({commentCount})
          </CardTitle>
          <Button size={'icon'} variant={'ghost'}>
            {isExpanded ?
              <ChevronUpIcon className={'size-5'} />
            : <ChevronDownIcon className={'size-5'} />}
          </Button>
        </div>
      </CardHeader>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isExpanded ? 'max-h-[600px]' : 'max-h-0',
        )}
      >
        <CardContent className={'space-y-4 pt-0'}>
          {/* Comment input placeholder */}
          <div className={'flex gap-3'}>
            <Avatar className={'size-8'}>
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
            <div className={'flex-1 rounded-lg border bg-muted/50 px-4 py-2 text-sm text-muted-foreground'}>
              Sign in to leave a comment...
            </div>
          </div>

          {/* Separator */}
          <div className={'border-t'} />

          {/* Comments list */}
          <div className={'space-y-4'}>
            {mockComments.map((comment) => (
              <div className={'flex gap-3'} key={comment.id}>
                <Avatar className={'size-8'}>
                  <AvatarImage alt={comment.author.displayName} src={comment.author.avatarUrl} />
                  <AvatarFallback>{comment.author.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className={'flex-1'}>
                  <div className={'flex items-baseline gap-2'}>
                    <span className={'text-sm font-medium'}>{comment.author.displayName}</span>
                    <span className={'text-xs text-muted-foreground'}>
                      {formatMonthDay(comment.createdAt)}
                    </span>
                  </div>
                  <p className={'mt-1 text-sm text-foreground/90'}>{comment.content}</p>
                  <button className={'mt-1 text-xs text-muted-foreground hover:text-foreground'}>
                    Like ({comment.likeCount})
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Show more button */}
          <Button className={'w-full'} variant={'ghost'}>
            View all {commentCount} comments
          </Button>
        </CardContent>
      </div>
    </Card>
  );
};

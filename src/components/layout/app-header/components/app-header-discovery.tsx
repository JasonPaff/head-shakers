import { SparklesIcon, TagsIcon, TrendingUpIcon, UserIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { AuthContent } from '@/components/ui/auth';
import { Button } from '@/components/ui/button';

export const AppHeaderDiscovery = () => {
  return (
    <div className={'gap-x-2'}>
      {/* Trending */}
      <Button asChild size={'sm'} variant={'ghost'}>
        <Link
          className={'text-sm font-medium transition-colors hover:text-primary'}
          href={$path({ route: '/browse/trending' })}
        >
          <TrendingUpIcon aria-hidden className={'mr-2 size-4'} />
          Trending
        </Link>
      </Button>

      {/* Featured Collections */}
      <Button asChild size={'sm'} variant={'ghost'}>
        <Link
          className={'text-sm font-medium transition-colors hover:text-primary'}
          href={$path({ route: '/browse/featured' })}
        >
          <SparklesIcon aria-hidden className={'mr-2 size-4'} />
          Featured Collections
        </Link>
      </Button>

      {/* Community */}
      <Button asChild size={'sm'} variant={'ghost'}>
        <Link
          className={'text-sm font-medium transition-colors hover:text-primary'}
          href={$path({ route: '/browse/categories' })}
        >
          <TagsIcon aria-hidden className={'mr-2 size-4'} />
          Categories
        </Link>
      </Button>

      {/* Dashboard */}
      <AuthContent>
        <Button asChild size={'sm'} variant={'ghost'}>
          <Link
            className={'text-sm font-medium transition-colors hover:text-primary'}
            href={$path({ route: '/dashboard' })}
          >
            <UserIcon aria-hidden className={'mr-2 size-4'} />
            Dashboard
          </Link>
        </Button>
      </AuthContent>
    </div>
  );
};

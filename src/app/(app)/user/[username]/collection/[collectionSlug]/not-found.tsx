import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function CollectionNotFound() {
  return (
    <div className={'flex min-h-screen items-center justify-center bg-background'}>
      <div className={'text-center'}>
        <h1 className={'mb-4 text-2xl font-bold text-foreground'}>Collection Not Found</h1>
        <p className={'mb-6 text-muted-foreground'}>
          The collection you&rsquo;re looking for doesn&rsquo;t exist or has been removed.
        </p>
        <Button asChild>
          <Link href={$path({ route: '/browse' })}>Browse Collections</Link>
        </Button>
      </div>
    </div>
  );
}

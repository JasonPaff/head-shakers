import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function BobbleheadNotFound() {
  return (
    <div className={'flex min-h-screen items-center justify-center bg-background'}>
      <div className={'text-center'}>
        <h1 className={'mb-4 text-2xl font-bold text-foreground'}>Bobblehead Not Found</h1>
        <Button asChild>
          <Link href={$path({ route: '/dashboard/collection' })}>Back to Collections</Link>
        </Button>
      </div>
    </div>
  );
}

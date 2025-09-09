import type { Metadata } from 'next';

import { FeaturedContentServer } from '@/app/(app)/browse/featured/components/featured-content-server';
import { getCacheStats } from '@/lib/queries/featured-content.queries';

// enable ISR with 5-minute revalidation
export const revalidate = 300;

export default function FeaturedPage() {
  return (
    <div className={'container mx-auto px-4 py-8'}>
      <div className={'mb-8'}>
        <h1 className={'text-3xl font-bold tracking-tight'}>Featured Content</h1>
        <p className={'mt-2 text-muted-foreground'}>
          Discover the best collections, bobbleheads, and collectors from our community
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className={'mt-4 text-xs text-muted-foreground'}>
            <summary className={'cursor-pointer'}>Cache Debug Info</summary>
            <pre className={'mt-2 rounded bg-muted p-2'}>{JSON.stringify(getCacheStats(), null, 2)}</pre>
          </details>
        )}
      </div>
      <FeaturedContentServer isTrackViews={true} />
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    description:
      'Discover featured bobblehead collections, rare items, and top collectors in our community showcase',
    title: 'Featured Collections & Bobbleheads - Head Shakers',
  };
}

import type { Metadata } from 'next';

import { FeaturedContentServer } from '@/components/browse/featured/featured-content-server';

export default function FeaturedPage() {
  return (
    <div className={'container mx-auto px-4 py-8'}>
      <div className={'mb-8'}>
        <h1 className={'text-3xl font-bold tracking-tight'}>Featured Content</h1>
        <p className={'mt-2 text-muted-foreground'}>
          Discover the best collections, bobbleheads, and collectors from our community
        </p>
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

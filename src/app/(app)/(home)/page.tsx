import type { Metadata } from 'next';

import { FeaturedCollectionsSection } from '@/app/(app)/(home)/components/sections/featured-collections-section';
import { JoinCommunitySection } from '@/app/(app)/(home)/components/sections/join-community-section';
import { TrendingBobbleheadsSection } from '@/app/(app)/(home)/components/sections/trending-bobbleheads-section';
import { generatePageMetadata, serializeJsonLd } from '@/lib/seo/metadata.utils';
import { ORGANIZATION_SCHEMA, WEBSITE_SCHEMA } from '@/lib/seo/seo.constants';

import { HeroSection } from './components/sections/hero-section';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return generatePageMetadata('home', {
    title: 'Home',
  });
}

export default function HomePage() {
  return (
    <div className={'min-h-screen'}>
      {/* JSON-LD structured data for homepage */}
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(ORGANIZATION_SCHEMA) }}
        type={'application/ld+json'}
      />

      {/* JSON-LD structured data for homepage */}
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(WEBSITE_SCHEMA) }}
        type={'application/ld+json'}
      />

      <HeroSection />
      <FeaturedCollectionsSection />
      <TrendingBobbleheadsSection />
      <JoinCommunitySection />
    </div>
  );
}

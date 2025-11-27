import type { Metadata } from 'next';

import { FeaturedCollectionsSection } from '@/app/(app)/(home)/components/sections/featured-collections-section';
import { JoinCommunitySection } from '@/app/(app)/(home)/components/sections/join-community-section';
import { TrendingBobbleheadsSection } from '@/app/(app)/(home)/components/sections/trending-bobbleheads-section';
import { serializeJsonLd } from '@/lib/seo/metadata.utils';
import {
  DEFAULT_SITE_METADATA,
  FALLBACK_METADATA,
  ORGANIZATION_SCHEMA,
  WEBSITE_SCHEMA,
} from '@/lib/seo/seo.constants';

import { HeroSection } from './components/sections/hero-section';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return {
    alternates: {
      canonical: DEFAULT_SITE_METADATA.url,
    },
    description: DEFAULT_SITE_METADATA.description,
    openGraph: {
      description: DEFAULT_SITE_METADATA.description,
      images: [
        {
          height: 630,
          url: FALLBACK_METADATA.imageUrl,
          width: 1200,
        },
      ],
      locale: DEFAULT_SITE_METADATA.locale,
      siteName: DEFAULT_SITE_METADATA.siteName,
      title: DEFAULT_SITE_METADATA.title,
      type: 'website',
      url: DEFAULT_SITE_METADATA.url,
    },
    robots: 'index, follow',
    title: 'Home',
    twitter: {
      card: 'summary_large_image',
      creator: DEFAULT_SITE_METADATA.twitterHandle,
      description: DEFAULT_SITE_METADATA.description,
      images: [FALLBACK_METADATA.imageUrl],
      site: DEFAULT_SITE_METADATA.twitterHandle,
      title: DEFAULT_SITE_METADATA.title,
    },
  };
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

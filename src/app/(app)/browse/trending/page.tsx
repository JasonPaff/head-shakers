import type { Metadata } from 'next';

import { Fragment } from 'react';

import { generateCollectionPageSchema } from '@/lib/seo/jsonld.utils';
import { generatePageMetadata, serializeJsonLd } from '@/lib/seo/metadata.utils';
import { DEFAULT_SITE_METADATA } from '@/lib/seo/seo.constants';

// enable ISR with 10-minute revalidation for trending content
export const revalidate = 600;

export function generateMetadata(): Metadata {
  return generatePageMetadata(
    'collection',
    {
      description:
        'Explore the hottest bobblehead collections and trending items from our community. See what collectors are talking about right now.',
      title: 'Trending Bobbleheads & Collections',
      url: `${DEFAULT_SITE_METADATA.url}/browse/trending`,
    },
    {
      isIndexable: true,
      isPublic: true,
      shouldIncludeOpenGraph: true,
      shouldIncludeTwitterCard: true,
      shouldUseTitleTemplate: true,
    },
  );
}

export default function TrendingPage() {
  // Generate JSON-LD schema for the trending content listing page
  const collectionPageSchema = generateCollectionPageSchema({
    description: 'Explore the hottest bobblehead collections and trending items from our community',
    name: 'Trending Bobbleheads & Collections',
    url: `${DEFAULT_SITE_METADATA.url}/browse/trending`,
  });

  return (
    <Fragment>
      {/* JSON-LD Structured Data */}
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionPageSchema) }}
        type={'application/ld+json'}
      />

      <div>Trending Page</div>
    </Fragment>
  );
}

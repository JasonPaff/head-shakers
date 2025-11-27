import { $path } from 'next-typesafe-url';

import { FooterNavLink } from '@/components/layout/app-footer/components/footer-nav-link';
import { FooterNavSection } from '@/components/layout/app-footer/components/footer-nav-section';
import { CONFIG } from '@/lib/constants/config';
import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';

/**
 * Server component that fetches and displays featured collections in the footer
 * Returns null if no featured collections are available
 */
export const FooterFeaturedSection = async () => {
  const featuredContent = await FeaturedContentFacade.getFooterFeaturedContentAsync();

  // Filter for collection content type and limit to configured max items
  const featuredCollections = featuredContent
    .filter((content) => content.contentType === 'collection')
    .slice(0, CONFIG.CONTENT.MAX_FEATURED_FOOTER_ITEMS);

  if (!featuredCollections.length || featuredCollections.length === 0) {
    return null;
  }

  return (
    <FooterNavSection heading={'Featured Collections'}>
      {/* Featured Collection Links */}
      {featuredCollections.map((collection) => {
        const _hasValidSlug = collection.contentSlug !== null;
        if (!_hasValidSlug) return null;

        return (
          <FooterNavLink
            href={$path({
              route: '/collections/[collectionSlug]',
              routeParams: { collectionSlug: collection.contentSlug as string },
            })}
            key={collection.id}
            label={collection.title || collection.contentName || 'Untitled Collection'}
          />
        );
      })}
    </FooterNavSection>
  );
};

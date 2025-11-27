import 'server-only';
import { $path } from 'next-typesafe-url';

import { FooterNavLink } from '@/components/layout/app-footer/components/footer-nav-link';
import { FooterNavSection } from '@/components/layout/app-footer/components/footer-nav-section';
import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';

/**
 * Server component that fetches and displays featured collections in the footer
 * Returns null if no featured collections are available
 */
export const FooterFeaturedSection = async () => {
  const featuredContent = await FeaturedContentFacade.getFooterFeaturedContentAsync();

  if (!featuredContent.length || featuredContent.length === 0) {
    return null;
  }

  return (
    <FooterNavSection heading={'Featured Collections'}>
      {featuredContent.map((collection) => {
        const _hasValidSlug = collection.collectionSlug !== null;
        if (!_hasValidSlug) return null;

        return (
          <FooterNavLink
            href={$path({
              route: '/collections/[collectionSlug]',
              routeParams: { collectionSlug: collection.collectionSlug ?? '' },
            })}
            key={collection.id}
            label={collection.title || collection.collectionName || 'Untitled Collection'}
          />
        );
      })}
    </FooterNavSection>
  );
};

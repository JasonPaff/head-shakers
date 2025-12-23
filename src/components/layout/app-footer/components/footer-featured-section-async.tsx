import 'server-only';
import { $path } from 'next-typesafe-url';

import { FooterNavLink } from '@/components/layout/app-footer/components/footer-nav-link';
import { FooterNavSection } from '@/components/layout/app-footer/components/footer-nav-section';
import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';
import { generateTestId } from '@/lib/test-ids';

/**
 * Server component that fetches and displays featured collections in the footer
 * Returns null if no featured collections are available
 * Caching: Uses CacheService.featured.content() via FeaturedContentFacade.getFooterFeaturedContentAsync()
 * with CACHE_KEYS.FEATURED.CONTENT_TYPES.FOOTER key
 */
export const FooterFeaturedSectionAsync = async () => {
  const featuredContent = await FeaturedContentFacade.getFooterFeaturedContentAsync();
  if (featuredContent.length === 0) return null;

  // Filter out collections without required data for routing (slug and owner username)
  const validCollections = featuredContent.filter(
    (collection) => collection.collectionSlug && collection.ownerUsername,
  );

  return (
    <FooterNavSection
      heading={'Featured Collections'}
      testId={generateTestId('layout', 'app-footer', 'featured-section')}
    >
      {validCollections.map((collection) => {
        const label = collection.title || collection.collectionName || 'Untitled Collection';
        const collectionSlug = collection.collectionSlug!;
        const username = collection.ownerUsername!;

        return (
          <FooterNavLink
            href={$path({
              route: '/user/[username]/collection/[collectionSlug]',
              routeParams: { collectionSlug, username },
            })}
            key={collection.id}
            label={label}
          />
        );
      })}
    </FooterNavSection>
  );
};

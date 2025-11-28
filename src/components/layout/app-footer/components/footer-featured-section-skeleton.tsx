import { FooterNavSection } from '@/components/layout/app-footer/components/footer-nav-section';

/**
 * Skeleton component for FooterFeaturedSection
 * Displays a loading state while featured content is being fetched
 */
export const FooterFeaturedSectionSkeleton = () => {
  return (
    <FooterNavSection heading={'Featured Collections'}>
      {/* Skeleton links - show 3 placeholder items */}
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          className={'h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700'}
          data-slot={'footer-featured-skeleton-item'}
          key={index}
        />
      ))}
    </FooterNavSection>
  );
};

import 'server-only';
import { $path } from 'next-typesafe-url';
import { Suspense } from 'react';

import { FooterContainer } from '@/components/layout/app-footer/components/footer-container';
import { FooterFeaturedSection } from '@/components/layout/app-footer/components/footer-featured-section';
import { FooterLegal } from '@/components/layout/app-footer/components/footer-legal';
import { FooterNavLink } from '@/components/layout/app-footer/components/footer-nav-link';
import { FooterNavSection } from '@/components/layout/app-footer/components/footer-nav-section';
import { FooterNewsletter } from '@/components/layout/app-footer/components/footer-newsletter';
import { FooterSocialLinks } from '@/components/layout/app-footer/components/footer-social-links';
import { generateTestId } from '@/lib/test-ids';

export const AppFooter = () => {
  return (
    <footer
      aria-label={'Site footer'}
      className={'mt-auto w-full border-t bg-background'}
      data-slot={'app-footer'}
      data-testid={generateTestId('layout', 'app-footer')}
    >
      {/* Footer Content */}
      <div className={'px-2 sm:px-4 md:px-6 lg:px-10'}>
        <FooterContainer>
          {/* Brand & Newsletter Section */}
          <div
            className={'col-span-full space-y-6 md:col-span-2'}
            data-slot={'app-footer-brand'}
            data-testid={generateTestId('layout', 'app-footer', 'brand-section')}
          >
            {/* Brand */}
            <div>
              <div className={'flex items-center gap-2 text-lg font-bold'}>
                <div
                  className={
                    'flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'
                  }
                >
                  HS
                </div>
                <span>Head Shakers</span>
              </div>
              <p className={'mt-2 text-sm text-muted-foreground'}>
                Your digital bobblehead collection platform.
              </p>
            </div>

            {/* Social Links */}
            <FooterSocialLinks />

            {/* Newsletter Signup */}
            <FooterNewsletter />
          </div>

          {/* Browse Section */}
          <FooterNavSection heading={'Browse'} testId={'footer-nav-browse'}>
            <FooterNavLink
              href={$path({ route: '/browse' })}
              label={'All Bobbleheads'}
              testId={'footer-nav-link-browse'}
            />
            <FooterNavLink
              href={$path({ route: '/browse/featured' })}
              label={'Featured'}
              testId={'footer-nav-link-featured'}
            />
            <FooterNavLink
              href={$path({ route: '/browse/categories' })}
              label={'Categories'}
              testId={'footer-nav-link-categories'}
            />
            <FooterNavLink
              href={$path({ route: '/browse/trending' })}
              label={'Trending'}
              testId={'footer-nav-link-trending'}
            />
          </FooterNavSection>

          {/* Featured Collections Section (async server component) */}
          <Suspense fallback={null}>
            <FooterFeaturedSection />
          </Suspense>
        </FooterContainer>
      </div>

      {/* Legal Bar */}
      <FooterLegal />
    </footer>
  );
};

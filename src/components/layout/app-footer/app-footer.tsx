import 'server-only';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
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
      className={'mt-auto w-full'}
      data-slot={'app-footer'}
      data-testid={generateTestId('layout', 'app-footer')}
    >
      {/* Main Footer Content */}
      <div
        className={`bg-gradient-to-br from-slate-50 to-slate-100
          dark:from-slate-900 dark:to-slate-800`}
        data-slot={'app-footer-main'}
      >
        <div className={'px-2 sm:px-4 md:px-6 lg:px-10'}>
          <FooterContainer>
            {/* Brand Section */}
            <div
              className={'col-span-full space-y-6 md:col-span-2'}
              data-slot={'app-footer-brand'}
              data-testid={generateTestId('layout', 'app-footer', 'brand-section')}
            >
              {/* Brand */}
              <div>
                <Link
                  className={'flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white'}
                  href={$path({ route: '/' })}
                >
                  <div
                    className={`flex aspect-square size-8 items-center justify-center rounded-lg
                      bg-gradient-to-br from-orange-500 to-amber-500 text-sm font-bold text-white`}
                  >
                    HS
                  </div>
                  <span>Head Shakers</span>
                </Link>
                <p className={'mt-2 text-sm text-slate-600 dark:text-slate-400'}>
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
      </div>

      {/* Legal Bar */}
      <FooterLegal />
    </footer>
  );
};

import type { ComponentProps } from 'react';

import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Fragment } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Separator } from '@/components/ui/separator';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

/**
 * Legal link configuration
 */
type LegalLink = {
  href: string;
  label: string;
  name: string;
};

/**
 * Legal links for footer display
 * Uses $path for type-safe routing
 */
const legalLinks: Array<LegalLink> = [
  {
    href: $path({ route: '/about' }),
    label: 'About',
    name: 'about',
  },
  {
    href: $path({ route: '/terms' }),
    label: 'Terms of Service',
    name: 'terms',
  },
  {
    href: $path({ route: '/privacy' }),
    label: 'Privacy Policy',
    name: 'privacy',
  },
];

type FooterLegalProps = ComponentProps<'div'> & ComponentTestIdProps;

export const FooterLegal = ({ className, testId, ...props }: FooterLegalProps) => {
  const containerTestId = testId || generateTestId('layout', 'app-footer', 'legal');

  const currentYear = new Date().getFullYear();

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 px-2 py-6 sm:px-4 md:px-6 lg:px-10',
        'border-t border-slate-200/50 bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-900/50',
        'md:flex-row md:justify-between',
        className,
      )}
      data-slot={'footer-legal'}
      data-testid={containerTestId}
      {...props}
    >
      {/* Copyright Notice */}
      <p
        className={'text-sm text-slate-500 dark:text-slate-500'}
        data-slot={'footer-legal-copyright'}
        data-testid={generateTestId('layout', 'app-footer', 'legal-copyright')}
      >
        &copy; {currentYear} Head Shakers. All rights reserved.
      </p>

      {/* Legal Links */}
      <nav
        aria-label={'Legal links'}
        className={'flex flex-wrap items-center justify-center gap-2'}
        data-slot={'footer-legal-nav'}
        data-testid={generateTestId('layout', 'app-footer', 'legal-nav')}
      >
        {legalLinks.map((link, index) => {
          const linkTestId = generateTestId('layout', 'app-footer', `legal-link-${link.name}`);
          const _isLastLink = index === legalLinks.length - 1;

          return (
            <Fragment key={link.name}>
              <Link
                className={cn(
                  'text-sm text-slate-500 transition-colors dark:text-slate-500',
                  'hover:text-orange-600 focus:text-orange-600 dark:hover:text-orange-400 dark:focus:text-orange-400',
                  'focus:outline-none focus-visible:underline focus-visible:underline-offset-4',
                )}
                data-slot={'footer-legal-link'}
                data-testid={linkTestId}
                href={link.href}
              >
                {link.label}
              </Link>
              {!_isLastLink && (
                <Separator
                  className={'h-4 bg-slate-300 dark:bg-slate-600'}
                  data-slot={'footer-legal-separator'}
                  orientation={'vertical'}
                  testId={generateTestId('layout', 'app-footer', `legal-separator-${index}`)}
                />
              )}
            </Fragment>
          );
        })}
      </nav>
    </div>
  );
};

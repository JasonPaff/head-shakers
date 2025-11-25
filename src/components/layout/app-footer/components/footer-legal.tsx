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

  // Get current year for copyright notice
  const currentYear = new Date().getFullYear();

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 border-t px-2 py-6 sm:px-4 md:px-6 lg:px-10',
        'md:flex-row md:justify-between',
        className,
      )}
      data-slot={'footer-legal'}
      data-testid={containerTestId}
      {...props}
    >
      {/* Copyright Notice */}
      <p
        className={'text-sm text-muted-foreground'}
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
                  'text-sm text-muted-foreground transition-colors',
                  'hover:text-foreground focus:text-foreground',
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
                  className={'h-4'}
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

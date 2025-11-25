import type { ComponentProps } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type FooterNavSectionProps = ComponentProps<'nav'> &
  ComponentTestIdProps & {
    /**
     * Heading text for the navigation section
     */
    heading: string;
  };

export const FooterNavSection = ({
  children,
  className,
  heading,
  testId,
  ...props
}: FooterNavSectionProps) => {
  const sectionTestId = testId || generateTestId('layout', 'app-footer', 'nav-section');
  const headingTestId = testId
    ? `${testId}-heading`
    : generateTestId('layout', 'app-footer', 'nav-section-heading');

  return (
    <nav
      aria-label={heading}
      className={cn('space-y-4', className)}
      data-slot={'footer-nav-section'}
      data-testid={sectionTestId}
      {...props}
    >
      {/* Section Heading */}
      <h3
        className={'text-sm font-semibold text-foreground'}
        data-slot={'footer-nav-section-heading'}
        data-testid={headingTestId}
      >
        {heading}
      </h3>

      {/* Navigation Links */}
      <ul
        className={'space-y-2'}
        data-slot={'footer-nav-section-list'}
      >
        {children}
      </ul>
    </nav>
  );
};

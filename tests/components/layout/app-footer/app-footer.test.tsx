/**
 * Tests for the AppFooter component and its subcomponents
 *
 * Note: The main AppFooter is a server component with 'server-only' import,
 * so we test the individual client-friendly subcomponents instead.
 * The FooterFeaturedSection is an async server component that needs special handling.
 */
import { describe, expect, it, vi } from 'vitest';

import { FooterContainer } from '@/components/layout/app-footer/components/footer-container';
import { FooterNavLink } from '@/components/layout/app-footer/components/footer-nav-link';
import { FooterNavSection } from '@/components/layout/app-footer/components/footer-nav-section';

import { render, screen } from '../../../setup/test-utils';

// Mock the seoConfig for social links tests
vi.mock('@/lib/config/config', () => ({
  seoConfig: {
    socialProfiles: {
      facebook: 'https://facebook.com/headshakers',
      instagram: 'https://instagram.com/headshakers',
      linkedin: '',
      twitter: 'https://twitter.com/headshakers',
    },
  },
}));

describe('FooterContainer', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(
        <FooterContainer>
          <div data-testid={'test-child'}>Child Content</div>
        </FooterContainer>,
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('renders with default testId', () => {
      render(
        <FooterContainer>
          <div>Content</div>
        </FooterContainer>,
      );

      expect(screen.getByTestId('layout-app-footer-container')).toBeInTheDocument();
    });

    it('renders with custom testId', () => {
      render(
        <FooterContainer testId={'custom-container-id'}>
          <div>Content</div>
        </FooterContainer>,
      );

      expect(screen.getByTestId('custom-container-id')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('has grid layout classes', () => {
      render(
        <FooterContainer>
          <div>Content</div>
        </FooterContainer>,
      );

      const container = screen.getByTestId('layout-app-footer-container');
      expect(container).toHaveClass('grid', 'max-w-7xl', 'grid-cols-2', 'gap-8');
    });
  });

  describe('accessibility', () => {
    it('has correct data-slot attribute', () => {
      render(
        <FooterContainer>
          <div>Content</div>
        </FooterContainer>,
      );

      expect(screen.getByTestId('layout-app-footer-container')).toHaveAttribute(
        'data-slot',
        'footer-container',
      );
    });
  });
});

describe('FooterNavSection', () => {
  describe('rendering', () => {
    it('renders with heading', () => {
      render(
        <FooterNavSection heading={'Test Section'}>
          <li>Item 1</li>
        </FooterNavSection>,
      );

      expect(screen.getByText('Test Section')).toBeInTheDocument();
    });

    it('renders children as navigation items', () => {
      render(
        <FooterNavSection heading={'Browse'}>
          <li>Link 1</li>
          <li>Link 2</li>
        </FooterNavSection>,
      );

      expect(screen.getByText('Link 1')).toBeInTheDocument();
      expect(screen.getByText('Link 2')).toBeInTheDocument();
    });

    it('renders with default testId', () => {
      render(
        <FooterNavSection heading={'Section'}>
          <li>Item</li>
        </FooterNavSection>,
      );

      expect(screen.getByTestId('layout-app-footer-nav-section')).toBeInTheDocument();
    });

    it('renders with custom testId', () => {
      render(
        <FooterNavSection heading={'Section'} testId={'custom-nav-section'}>
          <li>Item</li>
        </FooterNavSection>,
      );

      expect(screen.getByTestId('custom-nav-section')).toBeInTheDocument();
    });

    it('renders heading with derived testId from section testId', () => {
      render(
        <FooterNavSection heading={'Section'} testId={'footer-browse'}>
          <li>Item</li>
        </FooterNavSection>,
      );

      expect(screen.getByTestId('footer-browse-heading')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(
        <FooterNavSection className={'mt-4'} heading={'Section'}>
          <li>Item</li>
        </FooterNavSection>,
      );

      const section = screen.getByTestId('layout-app-footer-nav-section');
      expect(section).toHaveClass('mt-4');
    });

    it('has correct base styles', () => {
      render(
        <FooterNavSection heading={'Section'}>
          <li>Item</li>
        </FooterNavSection>,
      );

      const section = screen.getByTestId('layout-app-footer-nav-section');
      expect(section).toHaveClass('space-y-4');
    });

    it('heading has correct styles', () => {
      render(
        <FooterNavSection heading={'Section'}>
          <li>Item</li>
        </FooterNavSection>,
      );

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveClass('text-sm', 'font-semibold', 'text-foreground');
    });
  });

  describe('accessibility', () => {
    it('renders as nav element', () => {
      render(
        <FooterNavSection heading={'Browse'}>
          <li>Item</li>
        </FooterNavSection>,
      );

      expect(screen.getByRole('navigation', { name: 'Browse' })).toBeInTheDocument();
    });

    it('has correct aria-label from heading', () => {
      render(
        <FooterNavSection heading={'Featured'}>
          <li>Item</li>
        </FooterNavSection>,
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Featured');
    });

    it('has correct data-slot attributes', () => {
      render(
        <FooterNavSection heading={'Section'}>
          <li>Item</li>
        </FooterNavSection>,
      );

      expect(screen.getByTestId('layout-app-footer-nav-section')).toHaveAttribute(
        'data-slot',
        'footer-nav-section',
      );
    });

    it('has heading with correct data-slot', () => {
      render(
        <FooterNavSection heading={'Section'}>
          <li>Item</li>
        </FooterNavSection>,
      );

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveAttribute('data-slot', 'footer-nav-section-heading');
    });
  });
});

describe('Footer Integration', () => {
  describe('navigation section with links', () => {
    it('renders complete navigation section with links', () => {
      render(
        <FooterNavSection heading={'Browse'} testId={'footer-browse'}>
          <FooterNavLink href={'/browse'} label={'All Bobbleheads'} testId={'browse-all'} />
          <FooterNavLink href={'/browse/featured'} label={'Featured'} testId={'browse-featured'} />
          <FooterNavLink
            href={'/browse/categories'}
            label={'Categories'}
            testId={'browse-categories'}
          />
        </FooterNavSection>,
      );

      // Check section renders
      expect(screen.getByRole('navigation', { name: 'Browse' })).toBeInTheDocument();

      // Check all links render with correct hrefs
      expect(screen.getByRole('link', { name: 'All Bobbleheads' })).toHaveAttribute(
        'href',
        '/browse',
      );
      expect(screen.getByRole('link', { name: 'Featured' })).toHaveAttribute(
        'href',
        '/browse/featured',
      );
      expect(screen.getByRole('link', { name: 'Categories' })).toHaveAttribute(
        'href',
        '/browse/categories',
      );
    });

    it('renders links as list items', () => {
      render(
        <FooterNavSection heading={'Browse'}>
          <FooterNavLink href={'/browse'} label={'All'} />
          <FooterNavLink href={'/featured'} label={'Featured'} />
        </FooterNavSection>,
      );

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
    });
  });

  describe('container with sections', () => {
    it('renders multiple sections in container', () => {
      render(
        <FooterContainer>
          <FooterNavSection heading={'Browse'} testId={'footer-browse'}>
            <FooterNavLink href={'/browse'} label={'All'} />
          </FooterNavSection>
          <FooterNavSection heading={'Company'} testId={'footer-company'}>
            <FooterNavLink href={'/about'} label={'About'} />
          </FooterNavSection>
        </FooterContainer>,
      );

      expect(screen.getByRole('navigation', { name: 'Browse' })).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: 'Company' })).toBeInTheDocument();
    });
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FooterSocialLinks } from '@/components/layout/app-footer/components/footer-social-links';

import { render, screen } from '../../../setup/test-utils';

// Mock the seoConfig with active social profiles
vi.mock('@/lib/config/config', () => ({
  seoConfig: {
    socialProfiles: {
      facebook: 'https://facebook.com/headshakers',
      instagram: 'https://instagram.com/headshakers',
      linkedin: 'https://linkedin.com/company/headshakers',
      twitter: 'https://twitter.com/headshakers',
    },
  },
}));

describe('FooterSocialLinks', () => {
  describe('rendering', () => {
    it('renders social links container', () => {
      render(<FooterSocialLinks />);

      expect(screen.getByTestId('layout-app-footer-social-links')).toBeInTheDocument();
    });

    it('renders with custom testId', () => {
      render(<FooterSocialLinks testId={'custom-social-links'} />);

      expect(screen.getByTestId('custom-social-links')).toBeInTheDocument();
    });

    it('renders all active social platform links', () => {
      render(<FooterSocialLinks />);

      // Check that all 4 social links are rendered
      expect(screen.getByTestId('layout-app-footer-social-facebook')).toBeInTheDocument();
      expect(screen.getByTestId('layout-app-footer-social-twitter')).toBeInTheDocument();
      expect(screen.getByTestId('layout-app-footer-social-instagram')).toBeInTheDocument();
      expect(screen.getByTestId('layout-app-footer-social-linkedin')).toBeInTheDocument();
    });
  });

  describe('link attributes', () => {
    it('has correct href for Facebook', () => {
      render(<FooterSocialLinks />);

      const facebookLink = screen.getByTestId('layout-app-footer-social-facebook');
      expect(facebookLink).toHaveAttribute('href', 'https://facebook.com/headshakers');
    });

    it('has correct href for Twitter', () => {
      render(<FooterSocialLinks />);

      const twitterLink = screen.getByTestId('layout-app-footer-social-twitter');
      expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/headshakers');
    });

    it('has correct href for Instagram', () => {
      render(<FooterSocialLinks />);

      const instagramLink = screen.getByTestId('layout-app-footer-social-instagram');
      expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/headshakers');
    });

    it('has correct href for LinkedIn', () => {
      render(<FooterSocialLinks />);

      const linkedinLink = screen.getByTestId('layout-app-footer-social-linkedin');
      expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/company/headshakers');
    });
  });

  describe('external link security', () => {
    it('opens links in new tab with target _blank', () => {
      render(<FooterSocialLinks />);

      const facebookLink = screen.getByTestId('layout-app-footer-social-facebook');
      expect(facebookLink).toHaveAttribute('target', '_blank');
    });

    it('has rel noopener noreferrer for security', () => {
      render(<FooterSocialLinks />);

      const links = [
        screen.getByTestId('layout-app-footer-social-facebook'),
        screen.getByTestId('layout-app-footer-social-twitter'),
        screen.getByTestId('layout-app-footer-social-instagram'),
        screen.getByTestId('layout-app-footer-social-linkedin'),
      ];

      for (const link of links) {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link).toHaveAttribute('target', '_blank');
      }
    });
  });

  describe('accessibility', () => {
    it('has aria-label for Facebook link', () => {
      render(<FooterSocialLinks />);

      const facebookLink = screen.getByTestId('layout-app-footer-social-facebook');
      expect(facebookLink).toHaveAttribute('aria-label', 'Follow us on Facebook');
    });

    it('has aria-label for Twitter link', () => {
      render(<FooterSocialLinks />);

      const twitterLink = screen.getByTestId('layout-app-footer-social-twitter');
      expect(twitterLink).toHaveAttribute('aria-label', 'Follow us on Twitter');
    });

    it('has aria-label for Instagram link', () => {
      render(<FooterSocialLinks />);

      const instagramLink = screen.getByTestId('layout-app-footer-social-instagram');
      expect(instagramLink).toHaveAttribute('aria-label', 'Follow us on Instagram');
    });

    it('has aria-label for LinkedIn link', () => {
      render(<FooterSocialLinks />);

      const linkedinLink = screen.getByTestId('layout-app-footer-social-linkedin');
      expect(linkedinLink).toHaveAttribute('aria-label', 'Connect with us on LinkedIn');
    });

    it('has correct data-slot attribute on container', () => {
      render(<FooterSocialLinks />);

      expect(screen.getByTestId('layout-app-footer-social-links')).toHaveAttribute(
        'data-slot',
        'footer-social-links',
      );
    });

    it('has correct data-slot attribute on links', () => {
      render(<FooterSocialLinks />);

      const facebookLink = screen.getByTestId('layout-app-footer-social-facebook');
      expect(facebookLink).toHaveAttribute('data-slot', 'footer-social-link');
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(<FooterSocialLinks className={'mt-4'} />);

      const container = screen.getByTestId('layout-app-footer-social-links');
      expect(container).toHaveClass('mt-4');
    });

    it('has flex layout styles', () => {
      render(<FooterSocialLinks />);

      const container = screen.getByTestId('layout-app-footer-social-links');
      expect(container).toHaveClass('flex', 'items-center', 'gap-4');
    });
  });
});

describe('FooterSocialLinks with empty config', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns null when no social profiles are configured', async () => {
    vi.doMock('@/lib/config/config', () => ({
      seoConfig: {
        socialProfiles: {
          facebook: '',
          instagram: '',
          linkedin: '',
          twitter: '',
        },
      },
    }));

    // Re-import the component to get fresh mock
    const { FooterSocialLinks: EmptySocialLinks } = await import(
      '@/components/layout/app-footer/components/footer-social-links'
    );

    const { container } = render(<EmptySocialLinks />);

    // Component should render nothing
    expect(container.firstChild).toBeNull();
  });
});

describe('FooterSocialLinks with partial config', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('only renders active social platforms', async () => {
    vi.doMock('@/lib/config/config', () => ({
      seoConfig: {
        socialProfiles: {
          facebook: 'https://facebook.com/headshakers',
          instagram: '',
          linkedin: '',
          twitter: 'https://twitter.com/headshakers',
        },
      },
    }));

    const { FooterSocialLinks: PartialSocialLinks } = await import(
      '@/components/layout/app-footer/components/footer-social-links'
    );

    render(<PartialSocialLinks />);

    // Facebook and Twitter should be rendered
    expect(screen.getByTestId('layout-app-footer-social-facebook')).toBeInTheDocument();
    expect(screen.getByTestId('layout-app-footer-social-twitter')).toBeInTheDocument();

    // Instagram and LinkedIn should not be rendered
    expect(screen.queryByTestId('layout-app-footer-social-instagram')).not.toBeInTheDocument();
    expect(screen.queryByTestId('layout-app-footer-social-linkedin')).not.toBeInTheDocument();
  });
});

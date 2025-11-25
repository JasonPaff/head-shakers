import { describe, expect, it } from 'vitest';

import { FooterLegal } from '@/components/layout/app-footer/components/footer-legal';

import { render, screen } from '../../../setup/test-utils';

describe('FooterLegal', () => {
  describe('rendering', () => {
    it('renders the legal section', () => {
      render(<FooterLegal />);

      expect(screen.getByTestId('layout-app-footer-legal')).toBeInTheDocument();
    });

    it('renders copyright notice with current year', () => {
      render(<FooterLegal />);

      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`${currentYear} Head Shakers`))).toBeInTheDocument();
    });

    it('renders copyright notice with all rights reserved', () => {
      render(<FooterLegal />);

      expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
    });

    it('renders with custom testId', () => {
      render(<FooterLegal testId={'custom-legal-test-id'} />);

      expect(screen.getByTestId('custom-legal-test-id')).toBeInTheDocument();
    });
  });

  describe('legal links', () => {
    it('renders About link with correct href', () => {
      render(<FooterLegal />);

      const aboutLink = screen.getByRole('link', { name: 'About' });
      expect(aboutLink).toBeInTheDocument();
      expect(aboutLink).toHaveAttribute('href', '/about');
    });

    it('renders Terms of Service link with correct href', () => {
      render(<FooterLegal />);

      const termsLink = screen.getByRole('link', { name: 'Terms of Service' });
      expect(termsLink).toBeInTheDocument();
      expect(termsLink).toHaveAttribute('href', '/terms');
    });

    it('renders Privacy Policy link with correct href', () => {
      render(<FooterLegal />);

      const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' });
      expect(privacyLink).toBeInTheDocument();
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });

    it('renders all three legal links', () => {
      render(<FooterLegal />);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3);
    });
  });

  describe('test ids', () => {
    it('renders legal links with correct testids', () => {
      render(<FooterLegal />);

      expect(screen.getByTestId('layout-app-footer-legal-link-about')).toBeInTheDocument();
      expect(screen.getByTestId('layout-app-footer-legal-link-terms')).toBeInTheDocument();
      expect(screen.getByTestId('layout-app-footer-legal-link-privacy')).toBeInTheDocument();
    });

    it('renders copyright with correct testid', () => {
      render(<FooterLegal />);

      expect(screen.getByTestId('layout-app-footer-legal-copyright')).toBeInTheDocument();
    });

    it('renders legal nav with correct testid', () => {
      render(<FooterLegal />);

      expect(screen.getByTestId('layout-app-footer-legal-nav')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(<FooterLegal className={'mt-4'} />);

      const container = screen.getByTestId('layout-app-footer-legal');
      expect(container).toHaveClass('mt-4');
    });

    it('has correct base container styles', () => {
      render(<FooterLegal />);

      const container = screen.getByTestId('layout-app-footer-legal');
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'border-t');
    });
  });

  describe('accessibility', () => {
    it('has correct data-slot attribute on container', () => {
      render(<FooterLegal />);

      expect(screen.getByTestId('layout-app-footer-legal')).toHaveAttribute(
        'data-slot',
        'footer-legal',
      );
    });

    it('has correct data-slot attribute on links', () => {
      render(<FooterLegal />);

      const aboutLink = screen.getByTestId('layout-app-footer-legal-link-about');
      expect(aboutLink).toHaveAttribute('data-slot', 'footer-legal-link');
    });

    it('has correct aria-label on nav element', () => {
      render(<FooterLegal />);

      const nav = screen.getByTestId('layout-app-footer-legal-nav');
      expect(nav).toHaveAttribute('aria-label', 'Legal links');
    });
  });

  describe('separators', () => {
    it('renders separators between links', () => {
      render(<FooterLegal />);

      // There should be 2 separators between 3 links
      const separators = screen.getAllByTestId(/layout-app-footer-legal-separator/);
      expect(separators).toHaveLength(2);
    });

    it('renders separators with correct testids', () => {
      render(<FooterLegal />);

      expect(screen.getByTestId('layout-app-footer-legal-separator-0')).toBeInTheDocument();
      expect(screen.getByTestId('layout-app-footer-legal-separator-1')).toBeInTheDocument();
    });
  });
});

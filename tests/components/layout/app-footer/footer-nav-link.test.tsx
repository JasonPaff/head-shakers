import { describe, expect, it } from 'vitest';

import { FooterNavLink } from '@/components/layout/app-footer/components/footer-nav-link';

import { render, screen } from '../../../setup/test-utils';

describe('FooterNavLink', () => {
  describe('rendering', () => {
    it('renders with correct label text', () => {
      render(<FooterNavLink href={'/test'} label={'Test Link'} />);

      expect(screen.getByText('Test Link')).toBeInTheDocument();
    });

    it('renders as a link element with correct href', () => {
      render(<FooterNavLink href={'/browse'} label={'Browse'} />);

      const link = screen.getByRole('link', { name: 'Browse' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/browse');
    });

    it('renders inside a list item', () => {
      render(<FooterNavLink href={'/test'} label={'Test'} />);

      const listItem = screen.getByRole('listitem');
      expect(listItem).toBeInTheDocument();
      expect(listItem).toHaveAttribute('data-slot', 'footer-nav-link-item');
    });

    it('renders with custom testId', () => {
      render(<FooterNavLink href={'/test'} label={'Test'} testId={'custom-test-id'} />);

      expect(screen.getByTestId('custom-test-id')).toBeInTheDocument();
    });

    it('renders with default testId when not provided', () => {
      render(<FooterNavLink href={'/test'} label={'Test'} />);

      expect(screen.getByTestId('layout-app-footer-nav-link')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(<FooterNavLink className={'mt-2'} href={'/test'} label={'Test'} />);

      const link = screen.getByRole('link', { name: 'Test' });
      expect(link).toHaveClass('mt-2');
    });

    it('has correct base styles', () => {
      render(<FooterNavLink href={'/test'} label={'Test'} />);

      const link = screen.getByRole('link', { name: 'Test' });
      expect(link).toHaveClass('text-sm', 'text-muted-foreground', 'transition-colors');
    });
  });

  describe('accessibility', () => {
    it('has correct data-slot attribute on link', () => {
      render(<FooterNavLink href={'/test'} label={'Test'} />);

      const link = screen.getByRole('link', { name: 'Test' });
      expect(link).toHaveAttribute('data-slot', 'footer-nav-link');
    });
  });

  describe('navigation', () => {
    it('supports external URLs', () => {
      render(<FooterNavLink href={'https://example.com'} label={'External'} />);

      const link = screen.getByRole('link', { name: 'External' });
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('supports relative paths', () => {
      render(<FooterNavLink href={'/collections/featured'} label={'Featured'} />);

      const link = screen.getByRole('link', { name: 'Featured' });
      expect(link).toHaveAttribute('href', '/collections/featured');
    });

    it('supports hash links', () => {
      render(<FooterNavLink href={'#section'} label={'Section'} />);

      const link = screen.getByRole('link', { name: 'Section' });
      expect(link).toHaveAttribute('href', '#section');
    });
  });
});

import { describe, expect, it } from 'vitest';

import { Badge } from '@/components/ui/badge';

import { render, screen } from '../../setup/test-utils';

describe('Badge', () => {
  describe('rendering', () => {
    it('renders with correct text', () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('renders with custom testId', () => {
      render(<Badge testId={'custom-badge'}>Status</Badge>);
      expect(screen.getByTestId('custom-badge')).toBeInTheDocument();
    });

    it('renders as a span by default', () => {
      render(<Badge>Tag</Badge>);
      const badge = screen.getByText('Tag');
      expect(badge.tagName.toLowerCase()).toBe('span');
    });

    it('renders as child element when asChild is true', () => {
      render(
        <Badge asChild>
          <a href={'/link'}>Link Badge</a>
        </Badge>,
      );
      expect(screen.getByRole('link', { name: /link badge/i })).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('applies default variant styles', () => {
      render(<Badge>Default</Badge>);
      const badge = screen.getByText('Default');
      expect(badge).toHaveClass('bg-primary');
    });

    it('applies destructive variant styles', () => {
      render(<Badge variant={'destructive'}>Error</Badge>);
      const badge = screen.getByText('Error');
      expect(badge).toHaveClass('bg-destructive');
    });

    it('applies outline variant styles', () => {
      render(<Badge variant={'outline'}>Outline</Badge>);
      const badge = screen.getByText('Outline');
      expect(badge).toHaveClass('text-foreground');
    });

    it('applies secondary variant styles', () => {
      render(<Badge variant={'secondary'}>Secondary</Badge>);
      const badge = screen.getByText('Secondary');
      expect(badge).toHaveClass('bg-secondary');
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(<Badge className={'p-1'}>Styled</Badge>);
      const badge = screen.getByText('Styled');
      expect(badge).toHaveClass('p-1');
    });

    it('has correct base styles', () => {
      render(<Badge>Base</Badge>);
      const badge = screen.getByText('Base');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-md');
    });
  });

  describe('accessibility', () => {
    it('has correct data-slot attribute', () => {
      render(<Badge>Accessible</Badge>);
      expect(screen.getByText('Accessible')).toHaveAttribute('data-slot', 'badge');
    });

    it('supports aria-label when used as link', () => {
      render(
        <Badge asChild>
          <a aria-label={'New notification'} href={'/notifications'}>
            New
          </a>
        </Badge>,
      );
      expect(screen.getByRole('link', { name: 'New notification' })).toBeInTheDocument();
    });
  });
});

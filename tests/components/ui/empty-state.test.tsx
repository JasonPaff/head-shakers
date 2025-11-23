import { InboxIcon, SearchIcon } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

import { render, screen } from '../../setup/test-utils';

describe('EmptyState', () => {
  const defaultProps = {
    description: 'No items to display',
    title: 'No items found',
  };

  describe('rendering', () => {
    it('renders title', () => {
      render(<EmptyState {...defaultProps} />);
      expect(screen.getByRole('heading', { level: 3, name: 'No items found' })).toBeInTheDocument();
    });

    it('renders description', () => {
      render(<EmptyState {...defaultProps} />);
      expect(screen.getByText('No items to display')).toBeInTheDocument();
    });

    it('renders with custom testId', () => {
      render(<EmptyState {...defaultProps} testId={'custom-empty-state'} />);
      expect(screen.getByTestId('custom-empty-state')).toBeInTheDocument();
    });

    it('renders with default testId pattern', () => {
      render(<EmptyState {...defaultProps} />);
      expect(screen.getByTestId(/empty-state/)).toBeInTheDocument();
    });
  });

  describe('icon', () => {
    it('renders without icon by default', () => {
      render(<EmptyState {...defaultProps} />);
      const svg = screen.getByTestId(/empty-state/).querySelector('svg');
      expect(svg).not.toBeInTheDocument();
    });

    it('renders with icon when provided', () => {
      render(<EmptyState {...defaultProps} icon={InboxIcon} />);
      const svg = screen.getByTestId(/empty-state/).querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('icon has aria-hidden attribute', () => {
      render(<EmptyState {...defaultProps} icon={SearchIcon} />);
      const svg = screen.getByTestId(/empty-state/).querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('icon has correct styling classes', () => {
      render(<EmptyState {...defaultProps} icon={InboxIcon} />);
      const svg = screen.getByTestId(/empty-state/).querySelector('svg');
      expect(svg).toHaveClass('mb-4', 'size-12');
    });
  });

  describe('action', () => {
    it('renders without action by default', () => {
      render(<EmptyState {...defaultProps} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders action button when provided', () => {
      render(<EmptyState {...defaultProps} action={<Button>Add Item</Button>} />);
      expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
    });

    it('action is clickable', async () => {
      const handleClick = vi.fn();
      const { user } = render(
        <EmptyState {...defaultProps} action={<Button onClick={handleClick}>Click Me</Button>} />,
      );

      await user.click(screen.getByRole('button', { name: 'Click Me' }));
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('renders custom action element', () => {
      render(<EmptyState {...defaultProps} action={<a href={'/create'}>Create new item</a>} />);
      expect(screen.getByRole('link', { name: 'Create new item' })).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(<EmptyState {...defaultProps} className={'p-1'} />);
      expect(screen.getByTestId(/empty-state/)).toHaveClass('p-1');
    });

    it('has base styling classes', () => {
      render(<EmptyState {...defaultProps} />);
      const container = screen.getByTestId(/empty-state/);
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });

    it('has border dashed style', () => {
      render(<EmptyState {...defaultProps} />);
      expect(screen.getByTestId(/empty-state/)).toHaveClass('border-dashed');
    });

    it('has minimum height', () => {
      render(<EmptyState {...defaultProps} />);
      expect(screen.getByTestId(/empty-state/)).toHaveClass('min-h-[400px]');
    });

    it('centers text', () => {
      render(<EmptyState {...defaultProps} />);
      expect(screen.getByTestId(/empty-state/)).toHaveClass('text-center');
    });
  });

  describe('composition', () => {
    it('renders complete empty state with all props', () => {
      render(
        <EmptyState
          action={<Button>Create Collection</Button>}
          description={'Start building your collection by adding your first bobblehead.'}
          icon={InboxIcon}
          testId={'complete-empty-state'}
          title={'No Bobbleheads Yet'}
        />,
      );

      expect(screen.getByTestId('complete-empty-state')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'No Bobbleheads Yet' })).toBeInTheDocument();
      expect(screen.getByText(/Start building your collection/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Collection' })).toBeInTheDocument();
      expect(screen.getByTestId('complete-empty-state').querySelector('svg')).toBeInTheDocument();
    });
  });
});

import { describe, expect, it, vi } from 'vitest';

import { Button, buttonVariants } from '@/components/ui/button';

import { render, screen } from '../../setup/test-utils';

describe('Button', () => {
  describe('rendering', () => {
    it('renders with correct text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('renders with custom testId', () => {
      render(<Button testId={'custom-button'}>Click me</Button>);
      expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    });

    it('renders with default type="button"', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('renders as child element when asChild is true', () => {
      render(
        <Button asChild>
          <a href={'/link'}>Link Button</a>
        </Button>,
      );
      expect(screen.getByRole('link', { name: /link button/i })).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('applies default variant styles', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
    });

    it('applies destructive variant styles', () => {
      render(<Button variant={'destructive'}>Delete</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive');
    });

    it('applies outline variant styles', () => {
      render(<Button variant={'outline'}>Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border');
    });

    it('applies ghost variant styles', () => {
      render(<Button variant={'ghost'}>Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-accent');
    });

    it('applies link variant styles', () => {
      render(<Button variant={'link'}>Link</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('underline-offset-4');
    });

    it('applies secondary variant styles', () => {
      render(<Button variant={'secondary'}>Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary');
    });
  });

  describe('sizes', () => {
    it('applies default size', () => {
      render(<Button>Default Size</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9');
    });

    it('applies small size', () => {
      render(<Button size={'sm'}>Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-8');
    });

    it('applies large size', () => {
      render(<Button size={'lg'}>Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10');
    });

    it('applies icon size', () => {
      render(<Button size={'icon'}>Icon</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('size-9');
    });
  });

  describe('interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      const { user } = render(<Button onClick={handleClick}>Click</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const { user } = render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>,
      );

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });
  });

  describe('buttonVariants', () => {
    it('returns correct class string for default variant', () => {
      const classes = buttonVariants();
      expect(classes).toContain('bg-primary');
    });

    it('returns correct class string for custom variant and size', () => {
      const classes = buttonVariants({ size: 'lg', variant: 'destructive' });
      expect(classes).toContain('bg-destructive');
      expect(classes).toContain('h-10');
    });
  });

  describe('accessibility', () => {
    it('has correct data-slot attribute', () => {
      render(<Button>Accessible</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-slot', 'button');
    });

    it('supports aria-label', () => {
      render(<Button aria-label={'Close dialog'}>X</Button>);
      expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
    });

    it('supports aria-disabled', () => {
      render(<Button aria-disabled={'true'}>Aria Disabled</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });
  });
});

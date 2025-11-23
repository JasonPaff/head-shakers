import { Fragment } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Switch } from '@/components/ui/switch';

import { render, screen } from '../../setup/test-utils';

describe('Switch', () => {
  describe('rendering', () => {
    it('renders switch element', () => {
      render(<Switch aria-label={'Toggle feature'} />);
      expect(screen.getByRole('switch', { name: 'Toggle feature' })).toBeInTheDocument();
    });

    it('renders with custom testId', () => {
      render(<Switch aria-label={'Custom'} testId={'custom-switch'} />);
      expect(screen.getByTestId('custom-switch')).toBeInTheDocument();
    });

    it('has correct data-slot attribute', () => {
      render(<Switch aria-label={'Slot test'} />);
      expect(screen.getByRole('switch')).toHaveAttribute('data-slot', 'switch');
    });
  });

  describe('states', () => {
    it('is unchecked by default', () => {
      render(<Switch aria-label={'Unchecked'} />);
      expect(screen.getByRole('switch')).not.toBeChecked();
    });

    it('can be checked by default', () => {
      render(<Switch aria-label={'Checked'} defaultChecked />);
      expect(screen.getByRole('switch')).toBeChecked();
    });

    it('is disabled when disabled prop is true', () => {
      render(<Switch aria-label={'Disabled'} disabled />);
      expect(screen.getByRole('switch')).toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(<Switch aria-label={'Disabled'} disabled />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });
  });

  describe('interactions', () => {
    it('toggles checked state when clicked', async () => {
      const { user } = render(<Switch aria-label={'Toggle'} />);
      const switchEl = screen.getByRole('switch');

      expect(switchEl).not.toBeChecked();
      await user.click(switchEl);
      expect(switchEl).toBeChecked();
    });

    it('toggles unchecked when clicked again', async () => {
      const { user } = render(<Switch aria-label={'Toggle'} defaultChecked />);
      const switchEl = screen.getByRole('switch');

      expect(switchEl).toBeChecked();
      await user.click(switchEl);
      expect(switchEl).not.toBeChecked();
    });

    it('calls onCheckedChange when toggled', async () => {
      const handleChange = vi.fn();
      const { user } = render(<Switch aria-label={'Change'} onCheckedChange={handleChange} />);

      await user.click(screen.getByRole('switch'));
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('does not toggle when disabled', async () => {
      const handleChange = vi.fn();
      const { user } = render(<Switch aria-label={'Disabled'} disabled onCheckedChange={handleChange} />);

      await user.click(screen.getByRole('switch'));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('controlled mode', () => {
    it('respects checked prop', () => {
      render(<Switch aria-label={'Controlled'} checked={true} />);
      expect(screen.getByRole('switch')).toBeChecked();
    });

    it('does not change when checked prop is controlled', async () => {
      const { rerender, user } = render(<Switch aria-label={'Controlled'} checked={false} />);
      const switchEl = screen.getByRole('switch');

      await user.click(switchEl);
      // Re-render with same checked value to simulate controlled component
      rerender(<Switch aria-label={'Controlled'} checked={false} />);
      expect(switchEl).not.toBeChecked();
    });
  });

  describe('accessibility', () => {
    it('has switch role', () => {
      render(<Switch aria-label={'Feature toggle'} />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('supports aria-label', () => {
      render(<Switch aria-label={'Enable notifications'} />);
      expect(screen.getByRole('switch', { name: 'Enable notifications' })).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <Fragment>
          <Switch aria-describedby={'description'} aria-label={'Switch'} />
          <span id={'description'}>This toggles a feature</span>
        </Fragment>,
      );
      expect(screen.getByRole('switch')).toHaveAttribute('aria-describedby', 'description');
    });

    it('can be focused with keyboard', async () => {
      const { user } = render(<Switch aria-label={'Focusable'} />);

      await user.tab();
      expect(screen.getByRole('switch')).toHaveFocus();
    });

    it('can be toggled with space key', async () => {
      const { user } = render(<Switch aria-label={'Keyboard toggle'} />);
      const switchEl = screen.getByRole('switch');

      await user.tab();
      await user.keyboard(' ');
      expect(switchEl).toBeChecked();
    });

    it('can be toggled with Enter key', async () => {
      const { user } = render(<Switch aria-label={'Keyboard toggle'} />);
      const switchEl = screen.getByRole('switch');

      await user.tab();
      await user.keyboard('{Enter}');
      expect(switchEl).toBeChecked();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(<Switch aria-label={'Styled'} className={'p-1'} />);
      expect(screen.getByRole('switch')).toHaveClass('p-1');
    });

    it('has base switch styles', () => {
      render(<Switch aria-label={'Base'} />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveClass('inline-flex', 'rounded-full');
    });

    it('has correct size classes', () => {
      render(<Switch aria-label={'Sized'} />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveClass('h-6', 'w-10');
    });
  });

  describe('thumb element', () => {
    it('has thumb child element', () => {
      render(<Switch aria-label={'With thumb'} testId={'switch'} />);
      const switchEl = screen.getByTestId('switch');
      const thumb = switchEl.querySelector('[data-slot="switch-thumb"]');
      expect(thumb).toBeInTheDocument();
    });
  });
});

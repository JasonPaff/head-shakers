import { Fragment } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Checkbox } from '@/components/ui/checkbox';

import { render, screen } from '../../setup/test-utils';

describe('Checkbox', () => {
  describe('rendering', () => {
    it('renders checkbox', () => {
      render(<Checkbox aria-label={'Accept terms'} />);
      expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toBeInTheDocument();
    });

    it('renders with custom testId', () => {
      render(<Checkbox aria-label={'Custom'} testId={'custom-checkbox'} />);
      expect(screen.getByTestId('custom-checkbox')).toBeInTheDocument();
    });

    it('has correct data-slot attribute', () => {
      render(<Checkbox aria-label={'Slot test'} />);
      expect(screen.getByRole('checkbox')).toHaveAttribute('data-slot', 'checkbox');
    });
  });

  describe('states', () => {
    it('is unchecked by default', () => {
      render(<Checkbox aria-label={'Unchecked'} />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('can be checked by default', () => {
      render(<Checkbox aria-label={'Checked'} defaultChecked />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('is disabled when disabled prop is true', () => {
      render(<Checkbox aria-label={'Disabled'} disabled />);
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(<Checkbox aria-label={'Disabled'} disabled />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });
  });

  describe('interactions', () => {
    it('toggles checked state when clicked', async () => {
      const { user } = render(<Checkbox aria-label={'Toggle'} />);
      const checkbox = screen.getByRole('checkbox');

      expect(checkbox).not.toBeChecked();
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('toggles unchecked when clicked again', async () => {
      const { user } = render(<Checkbox aria-label={'Toggle'} defaultChecked />);
      const checkbox = screen.getByRole('checkbox');

      expect(checkbox).toBeChecked();
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('calls onCheckedChange when toggled', async () => {
      const handleChange = vi.fn();
      const { user } = render(<Checkbox aria-label={'Change'} onCheckedChange={handleChange} />);

      await user.click(screen.getByRole('checkbox'));
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('does not toggle when disabled', async () => {
      const handleChange = vi.fn();
      const { user } = render(<Checkbox aria-label={'Disabled'} disabled onCheckedChange={handleChange} />);

      await user.click(screen.getByRole('checkbox'));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('controlled mode', () => {
    it('respects checked prop', () => {
      render(<Checkbox aria-label={'Controlled'} checked={true} />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('does not change when checked prop is controlled', async () => {
      const { rerender, user } = render(<Checkbox aria-label={'Controlled'} checked={false} />);
      const checkbox = screen.getByRole('checkbox');

      await user.click(checkbox);
      // Re-render with same checked value to simulate controlled component
      rerender(<Checkbox aria-label={'Controlled'} checked={false} />);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('accessibility', () => {
    it('supports aria-label', () => {
      render(<Checkbox aria-label={'Terms and conditions'} />);
      expect(screen.getByRole('checkbox', { name: 'Terms and conditions' })).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <Fragment>
          <Checkbox aria-describedby={'description'} aria-label={'Checkbox'} />
          <span id={'description'}>This is a description</span>
        </Fragment>,
      );
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-describedby', 'description');
    });

    it('can be focused with keyboard', async () => {
      const { user } = render(<Checkbox aria-label={'Focusable'} />);

      await user.tab();
      expect(screen.getByRole('checkbox')).toHaveFocus();
    });

    it('can be toggled with space key', async () => {
      const { user } = render(<Checkbox aria-label={'Keyboard toggle'} />);
      const checkbox = screen.getByRole('checkbox');

      await user.tab();
      await user.keyboard(' ');
      expect(checkbox).toBeChecked();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(<Checkbox aria-label={'Styled'} className={'custom-class'} />);
      expect(screen.getByRole('checkbox')).toHaveClass('custom-class');
    });

    it('has base checkbox styles', () => {
      render(<Checkbox aria-label={'Base'} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('rounded-[4px]', 'border');
    });
  });
});

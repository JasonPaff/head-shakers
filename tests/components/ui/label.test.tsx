import { Fragment } from 'react';
import { describe, expect, it } from 'vitest';

import { Label } from '@/components/ui/label';

import { render, screen } from '../../setup/test-utils';

describe('Label', () => {
  describe('rendering', () => {
    it('renders label text', () => {
      render(<Label>Username</Label>);
      expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('renders with custom testId', () => {
      render(<Label testId={'custom-label'}>Email</Label>);
      expect(screen.getByTestId('custom-label')).toBeInTheDocument();
    });

    it('has correct data-slot attribute', () => {
      render(<Label>Name</Label>);
      expect(screen.getByText('Name')).toHaveAttribute('data-slot', 'label');
    });
  });

  describe('htmlFor association', () => {
    it('associates with input via htmlFor', () => {
      render(
        <Fragment>
          <Label htmlFor={'email-input'}>Email</Label>
          <input id={'email-input'} type={'email'} />
        </Fragment>,
      );

      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('clicking label focuses associated input', async () => {
      const { user } = render(
        <Fragment>
          <Label htmlFor={'name-input'}>Name</Label>
          <input id={'name-input'} type={'text'} />
        </Fragment>,
      );

      await user.click(screen.getByText('Name'));
      expect(screen.getByLabelText('Name')).toHaveFocus();
    });
  });

  describe('variants', () => {
    it('applies required variant styles', () => {
      render(<Label variant={'required'}>Required Field</Label>);
      const label = screen.getByText('Required Field');
      expect(label).toHaveClass('after:content-["*"]');
    });

    it('renders without variant by default', () => {
      render(<Label>Optional Field</Label>);
      const label = screen.getByText('Optional Field');
      expect(label).not.toHaveClass('after:content-["*"]');
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(<Label className={'p-1'}>Styled Label</Label>);
      expect(screen.getByText('Styled Label')).toHaveClass('p-1');
    });

    it('has base styling classes', () => {
      render(<Label>Base Label</Label>);
      const label = screen.getByText('Base Label');
      expect(label).toHaveClass('text-sm', 'font-medium');
    });
  });

  describe('disabled state', () => {
    it('has peer-disabled styles', () => {
      render(<Label>Disabled Label</Label>);
      const label = screen.getByText('Disabled Label');
      expect(label).toHaveClass('peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-50');
    });

    it('works with disabled input', () => {
      render(
        <Fragment>
          <input className={'peer'} disabled id={'disabled-input'} type={'text'} />
          <Label htmlFor={'disabled-input'}>Disabled Input</Label>
        </Fragment>,
      );

      expect(screen.getByLabelText('Disabled Input')).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('renders as label element', () => {
      render(<Label>Accessible Label</Label>);
      expect(screen.getByText('Accessible Label').tagName.toLowerCase()).toBe('label');
    });

    it('supports aria-hidden when decorative', () => {
      render(<Label aria-hidden={'true'}>Decorative</Label>);
      expect(screen.getByText('Decorative')).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('composition', () => {
    it('works with form field structure', () => {
      render(
        <div>
          <Label htmlFor={'username'} variant={'required'}>
            Username
          </Label>
          <input aria-describedby={'username-hint'} id={'username'} type={'text'} />
          <span id={'username-hint'}>Enter your username</span>
        </div>,
      );

      const input = screen.getByLabelText('Username');
      expect(input).toHaveAttribute('aria-describedby', 'username-hint');
      expect(screen.getByText('Username')).toHaveClass('after:content-["*"]');
    });
  });
});

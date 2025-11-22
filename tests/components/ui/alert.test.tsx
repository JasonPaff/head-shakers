import { describe, expect, it } from 'vitest';

import { Alert } from '@/components/ui/alert';

import { render, screen } from '../../setup/test-utils';

describe('Alert', () => {
  describe('rendering', () => {
    it('renders alert with text', () => {
      render(<Alert>This is an alert message</Alert>);
      expect(screen.getByText('This is an alert message')).toBeInTheDocument();
    });

    it('renders with custom testId', () => {
      render(<Alert testId={'custom-alert'}>Alert content</Alert>);
      expect(screen.getByTestId('custom-alert')).toBeInTheDocument();
    });

    it('renders with default testId pattern', () => {
      render(<Alert>Alert</Alert>);
      expect(screen.getByTestId(/alert/)).toBeInTheDocument();
    });

    it('renders icon', () => {
      render(<Alert>Alert with icon</Alert>);
      const svg = screen.getByTestId(/alert/).querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('renders info variant by default', () => {
      render(<Alert>Info alert</Alert>);
      const svg = screen.getByTestId(/alert/).querySelector('svg');
      expect(svg).toHaveClass('text-blue-500');
    });

    it('renders success variant', () => {
      render(<Alert variant={'success'}>Success alert</Alert>);
      const svg = screen.getByTestId(/alert/).querySelector('svg');
      expect(svg).toHaveClass('text-green-500');
    });

    it('renders warning variant', () => {
      render(<Alert variant={'warning'}>Warning alert</Alert>);
      const svg = screen.getByTestId(/alert/).querySelector('svg');
      expect(svg).toHaveClass('text-amber-500');
    });

    it('renders error variant', () => {
      render(<Alert variant={'error'}>Error alert</Alert>);
      const svg = screen.getByTestId(/alert/).querySelector('svg');
      expect(svg).toHaveClass('text-destructive');
    });
  });

  describe('icons', () => {
    it('renders InfoIcon for info variant', () => {
      render(<Alert variant={'info'}>Info</Alert>);
      const svg = screen.getByTestId(/alert/).querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders CheckIcon for success variant', () => {
      render(<Alert variant={'success'}>Success</Alert>);
      const svg = screen.getByTestId(/alert/).querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders TriangleAlertIcon for warning variant', () => {
      render(<Alert variant={'warning'}>Warning</Alert>);
      const svg = screen.getByTestId(/alert/).querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders CircleAlertIcon for error variant', () => {
      render(<Alert variant={'error'}>Error</Alert>);
      const svg = screen.getByTestId(/alert/).querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(<Alert className={'custom-class'}>Styled</Alert>);
      const svg = screen.getByTestId(/alert/).querySelector('svg');
      expect(svg).toHaveClass('custom-class');
    });

    it('has base alert styles', () => {
      render(<Alert>Base</Alert>);
      expect(screen.getByTestId(/alert/)).toHaveClass('rounded-md', 'border');
    });

    it('has correct padding', () => {
      render(<Alert>Padded</Alert>);
      expect(screen.getByTestId(/alert/)).toHaveClass('px-4', 'py-3');
    });
  });

  describe('content', () => {
    it('renders complex children', () => {
      render(
        <Alert>
          <strong>Important:</strong> This is a message with <em>emphasis</em>.
        </Alert>,
      );
      expect(screen.getByText('Important:')).toBeInTheDocument();
      expect(screen.getByText(/This is a message with/)).toBeInTheDocument();
    });

    it('renders multiple lines of text', () => {
      render(<Alert>Line 1. Line 2.</Alert>);
      expect(screen.getByText(/Line 1/)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('icon has aria-hidden attribute', () => {
      render(<Alert>Accessible</Alert>);
      const svg = screen.getByTestId(/alert/).querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('supports role attribute', () => {
      render(<Alert role={'alert'}>Alert role</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('supports aria-live for announcements', () => {
      render(<Alert aria-live={'polite'}>Live region</Alert>);
      expect(screen.getByTestId(/alert/)).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('composition', () => {
    it('can be used as a status message', () => {
      render(
        <Alert role={'status'} variant={'success'}>
          Your changes have been saved successfully.
        </Alert>,
      );
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/Your changes have been saved/)).toBeInTheDocument();
    });

    it('can be used as an error message', () => {
      render(
        <Alert role={'alert'} variant={'error'}>
          There was an error processing your request.
        </Alert>,
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/There was an error/)).toBeInTheDocument();
    });
  });
});

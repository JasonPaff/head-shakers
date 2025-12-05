import { describe, expect, it, vi } from 'vitest';

import { ReportButton } from '@/components/feature/content-reports/report-button';

import { render, screen, waitFor } from '../../setup/test-utils';

// Mock the ReportReasonDialog component
vi.mock('@/components/feature/content-reports/report-reason-dialog', () => ({
  ReportReasonDialog: vi.fn(
    ({
      isOpen,
      onClose,
      targetId,
      targetType,
    }: {
      isOpen: boolean;
      onClose: () => void;
      targetId: string;
      targetType: string;
    }) => (
      <div data-is-open={isOpen} data-testid={'mock-report-dialog'}>
        {isOpen && (
          <div>
            <p>Report Dialog</p>
            <p>Target: {targetType}</p>
            <p>ID: {targetId}</p>
            <button onClick={onClose}>Close Dialog</button>
          </div>
        )}
      </div>
    ),
  ),
}));

describe('ReportButton', () => {
  const defaultProps = {
    targetId: 'target-123',
    targetType: 'bobblehead' as const,
  };

  describe('rendering', () => {
    it('should render button with flag icon', () => {
      render(<ReportButton {...defaultProps} />);

      const button = screen.getByRole('button', { name: /report this bobblehead/i });
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Report')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<ReportButton {...defaultProps} className={'text-red-500'} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-red-500');
    });

    it('should render with custom testId', () => {
      render(<ReportButton {...defaultProps} testId={'custom-report-button'} />);

      expect(screen.getByTestId('custom-report-button')).toBeInTheDocument();
    });

    it('should render with default ghost variant', () => {
      render(<ReportButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-accent');
    });

    it('should render with outline variant', () => {
      render(<ReportButton {...defaultProps} variant={'outline'} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('border');
    });
  });

  describe('dialog integration', () => {
    it('should open ReportReasonDialog when clicked', async () => {
      const { user } = render(<ReportButton {...defaultProps} />);

      // Initially dialog should not be open
      const dialogElement = screen.getByTestId('mock-report-dialog');
      expect(dialogElement).toHaveAttribute('data-is-open', 'false');

      // Click the button
      await user.click(screen.getByRole('button', { name: /report this bobblehead/i }));

      // Dialog should now be open
      await waitFor(() => {
        expect(dialogElement).toHaveAttribute('data-is-open', 'true');
      });

      expect(screen.getByText('Report Dialog')).toBeInTheDocument();
    });

    it('should pass correct targetId to dialog', async () => {
      const { user } = render(<ReportButton {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('ID: target-123')).toBeInTheDocument();
      });
    });

    it('should pass correct targetType to dialog', async () => {
      const { user } = render(<ReportButton {...defaultProps} targetType={'collection'} />);

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Target: collection')).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('should use correct aria-label for bobblehead target', () => {
      render(<ReportButton {...defaultProps} targetType={'bobblehead'} />);

      expect(screen.getByRole('button', { name: 'Report this bobblehead' })).toBeInTheDocument();
    });

    it('should use correct aria-label for collection target', () => {
      render(<ReportButton {...defaultProps} targetType={'collection'} />);

      expect(screen.getByRole('button', { name: 'Report this collection' })).toBeInTheDocument();
    });

    it('should use correct aria-label for comment target', () => {
      render(<ReportButton {...defaultProps} targetType={'comment'} />);

      expect(screen.getByRole('button', { name: 'Report this comment' })).toBeInTheDocument();
    });

    it('should have flag icon with aria-hidden', () => {
      render(<ReportButton {...defaultProps} />);

      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden');
    });
  });

  describe('disabled state', () => {
    it('should be disabled when isDisabled is true', () => {
      render(<ReportButton {...defaultProps} isDisabled={true} />);

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should not open dialog when disabled and clicked', async () => {
      const { user } = render(<ReportButton {...defaultProps} isDisabled={true} />);

      await user.click(screen.getByRole('button'));

      const dialogElement = screen.getByTestId('mock-report-dialog');
      expect(dialogElement).toHaveAttribute('data-is-open', 'false');
    });
  });
});

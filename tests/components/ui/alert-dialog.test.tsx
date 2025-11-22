import { describe, expect, it, vi } from 'vitest';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { render, screen, waitFor } from '../../setup/test-utils';

describe('AlertDialog', () => {
  const renderAlertDialog = (props?: {
    defaultOpen?: boolean;
    onAction?: () => void;
    onCancel?: () => void;
  }) => {
    return render(
      <AlertDialog defaultOpen={props?.defaultOpen}>
        <AlertDialogTrigger>Open Dialog</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={props?.onCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={props?.onAction}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );
  };

  describe('rendering', () => {
    it('renders trigger button', () => {
      renderAlertDialog();
      expect(screen.getByRole('button', { name: 'Open Dialog' })).toBeInTheDocument();
    });

    it('does not render content by default', () => {
      renderAlertDialog();
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('renders content when defaultOpen is true', () => {
      renderAlertDialog({ defaultOpen: true });
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('opens dialog when trigger is clicked', async () => {
      const { user } = renderAlertDialog();

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('closes dialog when cancel is clicked', async () => {
      const { user } = renderAlertDialog({ defaultOpen: true });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('closes dialog when action is clicked', async () => {
      const { user } = renderAlertDialog({ defaultOpen: true });

      await user.click(screen.getByRole('button', { name: 'Continue' }));
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('calls onAction when action button is clicked', async () => {
      const handleAction = vi.fn();
      const { user } = renderAlertDialog({ defaultOpen: true, onAction: handleAction });

      await user.click(screen.getByRole('button', { name: 'Continue' }));
      expect(handleAction).toHaveBeenCalledOnce();
    });

    it('calls onCancel when cancel button is clicked', async () => {
      const handleCancel = vi.fn();
      const { user } = renderAlertDialog({ defaultOpen: true, onCancel: handleCancel });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(handleCancel).toHaveBeenCalledOnce();
    });
  });

  describe('content', () => {
    it('renders title', () => {
      renderAlertDialog({ defaultOpen: true });
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    it('renders description', () => {
      renderAlertDialog({ defaultOpen: true });
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
    });

    it('renders action and cancel buttons', () => {
      renderAlertDialog({ defaultOpen: true });
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('closes dialog when Escape is pressed', async () => {
      const { user } = renderAlertDialog({ defaultOpen: true });

      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('focuses first focusable element when opened', async () => {
      const { user } = renderAlertDialog();

      await user.click(screen.getByRole('button', { name: 'Open Dialog' }));
      await waitFor(() => {
        // Cancel button should be the first focusable element in footer
        expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
      });
    });
  });

  describe('data-slot attributes', () => {
    it('AlertDialogContent has correct data-slot', () => {
      renderAlertDialog({ defaultOpen: true });
      expect(screen.getByRole('alertdialog')).toHaveAttribute('data-slot', 'alert-dialog-content');
    });

    it('AlertDialogTitle has correct data-slot', () => {
      renderAlertDialog({ defaultOpen: true });
      expect(screen.getByText('Are you sure?')).toHaveAttribute('data-slot', 'alert-dialog-title');
    });

    it('AlertDialogDescription has correct data-slot', () => {
      renderAlertDialog({ defaultOpen: true });
      expect(screen.getByText('This action cannot be undone.')).toHaveAttribute(
        'data-slot',
        'alert-dialog-description',
      );
    });

    it('AlertDialogHeader has correct data-slot', () => {
      renderAlertDialog({ defaultOpen: true });
      const header = screen.getByText('Are you sure?').parentElement;
      expect(header).toHaveAttribute('data-slot', 'alert-dialog-header');
    });

    it('AlertDialogFooter has correct data-slot', () => {
      renderAlertDialog({ defaultOpen: true });
      const footer = screen.getByRole('button', { name: 'Cancel' }).parentElement;
      expect(footer).toHaveAttribute('data-slot', 'alert-dialog-footer');
    });
  });

  describe('accessibility', () => {
    it('has alertdialog role', () => {
      renderAlertDialog({ defaultOpen: true });
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('has aria-labelledby pointing to title', () => {
      renderAlertDialog({ defaultOpen: true });
      const dialog = screen.getByRole('alertdialog');
      const titleId = screen.getByText('Are you sure?').getAttribute('id');
      expect(dialog).toHaveAttribute('aria-labelledby', titleId);
    });

    it('has aria-describedby pointing to description', () => {
      renderAlertDialog({ defaultOpen: true });
      const dialog = screen.getByRole('alertdialog');
      const descId = screen.getByText('This action cannot be undone.').getAttribute('id');
      expect(dialog).toHaveAttribute('aria-describedby', descId);
    });
  });

  describe('custom testId', () => {
    it('supports custom testId on trigger', () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger testId={'custom-trigger'}>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Title</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>,
      );
      expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
    });

    it('supports custom testId on content', () => {
      render(
        <AlertDialog defaultOpen>
          <AlertDialogContent testId={'custom-content'}>
            <AlertDialogTitle>Title</AlertDialogTitle>
          </AlertDialogContent>
        </AlertDialog>,
      );
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });
  });
});

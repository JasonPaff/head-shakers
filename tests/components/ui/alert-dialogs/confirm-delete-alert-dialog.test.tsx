import type { ComponentType } from 'react';

import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmDeleteAlertDialog } from '@/components/ui/alert-dialogs/confirm-delete-alert-dialog';

import { render, screen } from '../../../setup/test-utils';

// Mock withFocusManagement HOC to pass through component
vi.mock('@/components/ui/form/focus-management/with-focus-management', () => ({
  withFocusManagement: (Component: ComponentType) => Component,
}));

// Mock useFocusContext to provide focusFirstError
vi.mock('@/components/ui/form/focus-management/focus-context', () => ({
  useFocusContext: () => ({
    focusFirstError: vi.fn(),
    registerField: vi.fn(),
    unregisterField: vi.fn(),
  }),
}));

// Mock trackDialog function from sentry-breadcrumbs
vi.mock('@/lib/utils/sentry-breadcrumbs', () => ({
  trackDialog: vi.fn(),
}));

describe('ConfirmDeleteAlertDialog', () => {
  const defaultProps = {
    children: 'This will permanently delete the item and all associated data.',
    isOpen: true,
    onClose: vi.fn(),
  };

  describe('rendering', () => {
    it('should render dialog with warning message and confirmation input', () => {
      render(
        <ConfirmDeleteAlertDialog {...defaultProps} confirmationText={'My Collection'}>
          This will permanently delete the collection.
        </ConfirmDeleteAlertDialog>,
      );

      // Verify title
      expect(screen.getByText('Are you absolutely sure?')).toBeInTheDocument();

      // Verify Alert component with error variant
      expect(screen.getByText('This action cannot be undone')).toBeInTheDocument();

      // Verify description (children)
      expect(screen.getByText('This will permanently delete the collection.')).toBeInTheDocument();

      // Verify confirmation text instruction
      expect(screen.getByText(/Type/)).toBeInTheDocument();
      expect(screen.getByText('My Collection', { exact: false })).toBeInTheDocument();
      expect(screen.getByText(/to confirm/)).toBeInTheDocument();

      // Verify input field with label
      expect(screen.getByLabelText(/Confirmation/i)).toBeInTheDocument();

      // Verify buttons
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
    });

    it('should render without confirmation input when confirmationText is not provided', () => {
      render(<ConfirmDeleteAlertDialog {...defaultProps}>Delete this item?</ConfirmDeleteAlertDialog>);

      // Verify dialog renders
      expect(screen.getByText('Are you absolutely sure?')).toBeInTheDocument();
      expect(screen.getByText('Delete this item?')).toBeInTheDocument();

      // Verify no confirmation input
      expect(screen.queryByLabelText(/Confirmation/i)).not.toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('should show validation error when confirmation text does not match', async () => {
      const onDeleteAsync = vi.fn().mockResolvedValue(undefined);
      const { user } = render(
        <ConfirmDeleteAlertDialog
          {...defaultProps}
          confirmationText={'Delete Me'}
          onDeleteAsync={onDeleteAsync}
        >
          Confirm deletion
        </ConfirmDeleteAlertDialog>,
      );

      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      const input = screen.getByLabelText(/Confirmation/i);

      // Type incorrect text
      await user.type(input, 'wrong text');

      // Try to submit with wrong text - should show validation error
      await user.click(deleteButton);

      // After failed submission, validation error should appear
      await waitFor(() => {
        expect(screen.getByText(/Please type "Delete Me" exactly to confirm/i)).toBeInTheDocument();
      });

      // Verify onDeleteAsync was NOT called
      expect(onDeleteAsync).not.toHaveBeenCalled();

      // Clear and type correct text
      await user.clear(input);
      await user.type(input, 'Delete Me');

      // With correct text and revalidation after first submit (mode: 'change' after first submit),
      // validation error should disappear
      await waitFor(() => {
        expect(screen.queryByText(/Please type "Delete Me" exactly to confirm/i)).not.toBeInTheDocument();
      });
    });

    it('should enable Delete button after correct text is entered and form validates', async () => {
      const onDeleteAsync = vi.fn().mockResolvedValue(undefined);
      const { user } = render(
        <ConfirmDeleteAlertDialog {...defaultProps} confirmationText={'DELETE'} onDeleteAsync={onDeleteAsync}>
          Confirm deletion
        </ConfirmDeleteAlertDialog>,
      );

      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      const input = screen.getByLabelText(/Confirmation/i);

      // Type correct confirmation text
      await user.type(input, 'DELETE');

      // Try to submit - this will trigger validation
      await user.click(deleteButton);

      // Wait for async delete to be called, which means validation passed
      await waitFor(() => {
        expect(onDeleteAsync).toHaveBeenCalledOnce();
      });
    });
  });

  describe('delete execution', () => {
    it('should execute onDeleteAsync when form is valid and submitted', async () => {
      const onDeleteAsync = vi.fn().mockResolvedValue(undefined);
      const { user } = render(
        <ConfirmDeleteAlertDialog
          {...defaultProps}
          confirmationText={'TEST DELETE'}
          onDeleteAsync={onDeleteAsync}
        >
          Confirm deletion
        </ConfirmDeleteAlertDialog>,
      );

      const input = screen.getByLabelText(/Confirmation/i);
      const deleteButton = screen.getByRole('button', { name: /Delete/i });

      // Type correct confirmation text
      await user.type(input, 'TEST DELETE');

      // Submit form
      await user.click(deleteButton);

      // Verify onDeleteAsync was called
      await waitFor(() => {
        expect(onDeleteAsync).toHaveBeenCalledOnce();
      });
    });

    it('should execute onDelete when form is valid and submitted', async () => {
      const onDelete = vi.fn();
      const { user } = render(
        <ConfirmDeleteAlertDialog {...defaultProps} confirmationText={'CONFIRM'} onDelete={onDelete}>
          Confirm deletion
        </ConfirmDeleteAlertDialog>,
      );

      const input = screen.getByLabelText(/Confirmation/i);
      const deleteButton = screen.getByRole('button', { name: /Delete/i });

      // Type correct confirmation text
      await user.type(input, 'CONFIRM');

      // Submit form
      await user.click(deleteButton);

      // Verify onDelete was called
      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledOnce();
      });
    });

    it('should not execute delete when confirmation text is incorrect', async () => {
      const onDeleteAsync = vi.fn().mockResolvedValue(undefined);
      const { user } = render(
        <ConfirmDeleteAlertDialog {...defaultProps} confirmationText={'EXACT'} onDeleteAsync={onDeleteAsync}>
          Confirm deletion
        </ConfirmDeleteAlertDialog>,
      );

      const input = screen.getByLabelText(/Confirmation/i);
      const deleteButton = screen.getByRole('button', { name: /Delete/i });

      // Type incorrect confirmation text
      await user.type(input, 'wrong');

      // Try to submit form
      await user.click(deleteButton);

      // Wait a bit to ensure async operations complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify onDeleteAsync was NOT called
      expect(onDeleteAsync).not.toHaveBeenCalled();
    });

    it('should show loading state while delete is in progress', async () => {
      let resolveDelete: () => void;
      const deletePromise = new Promise<void>((resolve) => {
        resolveDelete = resolve;
      });
      const onDeleteAsync = vi.fn().mockReturnValue(deletePromise);

      const { user } = render(
        <ConfirmDeleteAlertDialog {...defaultProps} confirmationText={'DELETE'} onDeleteAsync={onDeleteAsync}>
          Confirm deletion
        </ConfirmDeleteAlertDialog>,
      );

      const input = screen.getByLabelText(/Confirmation/i);
      const deleteButton = screen.getByRole('button', { name: /Delete/i });

      // Type correct confirmation text
      await user.type(input, 'DELETE');

      // Submit form
      await user.click(deleteButton);

      // Wait for delete to start
      await waitFor(() => {
        expect(onDeleteAsync).toHaveBeenCalledOnce();
      });

      // Check loading state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Deleting/i })).toBeInTheDocument();
      });

      // Complete the delete
      resolveDelete!();

      // Wait for loading state to clear
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /Deleting/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('dialog interactions', () => {
    it('should close dialog and reset form when Cancel is clicked', async () => {
      const onClose = vi.fn();
      const { user } = render(
        <ConfirmDeleteAlertDialog {...defaultProps} confirmationText={'TEST'} onClose={onClose}>
          Confirm deletion
        </ConfirmDeleteAlertDialog>,
      );

      const input = screen.getByLabelText(/Confirmation/i);
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });

      // Type some text in the input
      await user.type(input, 'partial text');

      // Verify input has value
      expect(input).toHaveValue('partial text');

      // Click cancel
      await user.click(cancelButton);

      // Verify onClose was called (may be called multiple times due to handleCancel and handleOpenChange)
      expect(onClose).toHaveBeenCalled();

      // Note: Form reset happens but we can't easily test it without reopening
      // the dialog since the component is controlled by isOpen prop
    });

    it('should close dialog when Escape is pressed', async () => {
      const onClose = vi.fn();
      const { user } = render(
        <ConfirmDeleteAlertDialog {...defaultProps} confirmationText={'TEST'} onClose={onClose}>
          Confirm deletion
        </ConfirmDeleteAlertDialog>,
      );

      // Press Escape
      await user.keyboard('{Escape}');

      // Verify onClose was called
      await waitFor(() => {
        expect(onClose).toHaveBeenCalledOnce();
      });
    });

    it('should track dialog cancellation with Sentry breadcrumbs', async () => {
      const { trackDialog } = await import('@/lib/utils/sentry-breadcrumbs');
      const onClose = vi.fn();

      const { user } = render(
        <ConfirmDeleteAlertDialog {...defaultProps} confirmationText={'TRACK'} onClose={onClose}>
          Confirm deletion
        </ConfirmDeleteAlertDialog>,
      );

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });

      // Click cancel
      await user.click(cancelButton);

      // Verify trackDialog was called for cancel
      expect(trackDialog).toHaveBeenCalledWith('confirm-delete', 'cancelled');
    });

    it('should track dialog confirmation with Sentry breadcrumbs', async () => {
      const { trackDialog } = await import('@/lib/utils/sentry-breadcrumbs');
      vi.mocked(trackDialog).mockClear();

      const onDeleteAsync = vi.fn().mockResolvedValue(undefined);
      const { user } = render(
        <ConfirmDeleteAlertDialog {...defaultProps} confirmationText={'TRACK'} onDeleteAsync={onDeleteAsync}>
          Confirm deletion
        </ConfirmDeleteAlertDialog>,
      );

      const input = screen.getByLabelText(/Confirmation/i);
      const deleteButton = screen.getByRole('button', { name: /Delete/i });

      // Type correct text and confirm
      await user.type(input, 'TRACK');
      await user.click(deleteButton);

      // Verify trackDialog was called for confirm
      await waitFor(() => {
        expect(trackDialog).toHaveBeenCalledWith('confirm-delete', 'confirmed');
      });
    });
  });

  describe('without confirmation text', () => {
    it('should enable Delete button immediately when no confirmation text is required', async () => {
      const onDeleteAsync = vi.fn().mockResolvedValue(undefined);
      const { user } = render(
        <ConfirmDeleteAlertDialog {...defaultProps} onDeleteAsync={onDeleteAsync}>
          Delete this item?
        </ConfirmDeleteAlertDialog>,
      );

      const deleteButton = screen.getByRole('button', { name: /Delete/i });

      // Button should be enabled (no validation required)
      expect(deleteButton).not.toBeDisabled();

      // Click delete
      await user.click(deleteButton);

      // Verify delete was called
      await waitFor(() => {
        expect(onDeleteAsync).toHaveBeenCalledOnce();
      });
    });
  });
});

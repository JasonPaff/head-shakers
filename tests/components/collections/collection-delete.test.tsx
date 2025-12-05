import type { ReactNode } from 'react';

import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CollectionDelete } from '@/components/feature/collections/collection-delete';

import { render, screen } from '../../setup/test-utils';

// Mock the server action
vi.mock('@/lib/actions/collections/collections.actions', () => ({
  deleteCollectionAction: vi.fn(),
}));

// Mock the useServerAction hook
vi.mock('@/hooks/use-server-action', () => ({
  useServerAction: vi.fn(() => ({
    executeAsync: vi.fn(),
    isExecuting: false,
  })),
}));

// Mock the ConfirmDeleteAlertDialog component
vi.mock('@/components/ui/alert-dialogs/confirm-delete-alert-dialog', () => ({
  ConfirmDeleteAlertDialog: ({
    children,
    isOpen,
    onDeleteAsync,
  }: {
    children: ReactNode;
    isOpen: boolean;
    onDeleteAsync?: () => Promise<void>;
  }) => {
    if (!isOpen) return null;

    return (
      <div data-testid={'confirm-delete-dialog'}>
        <div>{children}</div>
        <button
          data-testid={'confirm-delete-button'}
          onClick={() => {
            void onDeleteAsync?.();
          }}
        >
          Confirm Delete
        </button>
      </div>
    );
  },
}));

describe('CollectionDelete', () => {
  const defaultProps = {
    collectionId: 'collection-123',
    collectionName: 'Test Collection',
  };

  // Get mock references
  let mockUseServerAction: ReturnType<typeof vi.fn>;
  let mockExecuteAsync: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Import the mocked module to get references
    const { useServerAction } = await import('@/hooks/use-server-action');
    mockUseServerAction = vi.mocked(useServerAction);
    mockExecuteAsync = vi.fn();

    // Setup default mock return value
    mockUseServerAction.mockReturnValue({
      executeAsync: mockExecuteAsync,
      isExecuting: false,
    });
  });

  describe('rendering', () => {
    it('should render delete button with trash icon', () => {
      render(<CollectionDelete {...defaultProps} />);

      const deleteButton = screen.getByRole('button');
      expect(deleteButton).toBeInTheDocument();

      // Verify button has destructive variant (checked via class)
      expect(deleteButton).toHaveClass('bg-destructive');

      // Verify TrashIcon is present (it has aria-label)
      // eslint-disable-next-line testing-library/no-node-access
      const trashIcon = deleteButton.querySelector('[aria-label="delete collection"]');
      expect(trashIcon).toBeInTheDocument();
    });

    it('should render delete button with children when provided', () => {
      render(<CollectionDelete {...defaultProps}>Delete Collection</CollectionDelete>);

      const deleteButton = screen.getByRole('button', { name: /delete collection/i });
      expect(deleteButton).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should open confirmation dialog when button is clicked', async () => {
      const { user } = render(<CollectionDelete {...defaultProps} />);

      const deleteButton = screen.getByRole('button');

      // Dialog should not be visible initially
      expect(screen.queryByTestId('confirm-delete-dialog')).not.toBeInTheDocument();

      // Click the delete button
      await user.click(deleteButton);

      // Dialog should now be visible
      await waitFor(() => {
        expect(screen.getByTestId('confirm-delete-dialog')).toBeInTheDocument();
      });

      // Verify dialog content
      expect(
        screen.getByText('This will permanently delete this collection and all bobbleheads within.'),
      ).toBeInTheDocument();
    });

    it('should execute delete action and call onSuccess callback', async () => {
      const onSuccess = vi.fn();
      mockExecuteAsync.mockResolvedValueOnce({ id: 'collection-123' });

      const { user } = render(<CollectionDelete {...defaultProps} onSuccess={onSuccess} />);

      // Open the confirmation dialog
      const deleteButton = screen.getByRole('button');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('confirm-delete-dialog')).toBeInTheDocument();
      });

      // Confirm the deletion
      const confirmButton = screen.getByTestId('confirm-delete-button');
      await user.click(confirmButton);

      // Verify executeAsync was called with correct collectionId
      await waitFor(() => {
        expect(mockExecuteAsync).toHaveBeenCalledWith({ collectionId: 'collection-123' });
      });
      expect(mockExecuteAsync).toHaveBeenCalledTimes(1);

      // Verify onSuccess callback was called
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('loading state', () => {
    it('should disable button while delete action is executing', () => {
      // Mock isExecuting as true
      mockUseServerAction.mockReturnValue({
        executeAsync: mockExecuteAsync,
        isExecuting: true,
      });

      render(<CollectionDelete {...defaultProps} />);

      const deleteButton = screen.getByRole('button');

      // Button should be disabled when isExecuting is true
      expect(deleteButton).toBeDisabled();
    });

    it('should not disable button when not executing', () => {
      render(<CollectionDelete {...defaultProps} />);

      const deleteButton = screen.getByRole('button');

      // Button should be enabled when isExecuting is false
      expect(deleteButton).not.toBeDisabled();
    });
  });
});

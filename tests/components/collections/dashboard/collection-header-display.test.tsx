import type { JSX, ReactNode } from 'react';

import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CollectionHeaderDisplay } from '@/app/(app)/dashboard/collection/(collection)/components/display/collection-header-display';

import { createMockCollectionHeader } from '../../../fixtures/collection-header.factory';
import { render, screen } from '../../../setup/test-utils';

// Mock nuqs
const mockSetParams = vi.fn();
vi.mock('nuqs', () => ({
  useQueryStates: vi.fn(() => [null, mockSetParams]),
}));

// Mock the delete action
vi.mock('@/lib/actions/collections/collections.actions', () => ({
  deleteCollectionAction: vi.fn(),
}));

// Mock useServerAction hook
const mockExecuteAsync = vi.fn();
let onAfterSuccessCallback: (() => void) | undefined;

vi.mock('@/hooks/use-server-action', () => ({
  useServerAction: vi.fn((_action, options?: { onAfterSuccess?: () => void }) => {
    // Capture the onAfterSuccess callback for testing
    onAfterSuccessCallback = options?.onAfterSuccess;
    return {
      executeAsync: mockExecuteAsync,
    };
  }),
}));

// Mock child components to simplify testing orchestration logic
vi.mock('@/components/feature/collections/collection-upsert-dialog', () => ({
  CollectionUpsertDialog: ({
    collection,
    isOpen,
    onClose,
  }: {
    collection?: { name: string };
    isOpen: boolean;
    onClose: () => void;
  }): JSX.Element | null => {
    if (!isOpen) return null;
    return (
      <div data-testid={'collection-upsert-dialog'}>
        <div>Edit Collection: {collection?.name}</div>
        <button onClick={onClose}>Cancel</button>
      </div>
    );
  },
}));

vi.mock('@/components/ui/alert-dialogs/confirm-delete-alert-dialog', () => ({
  ConfirmDeleteAlertDialog: ({
    children,
    isOpen,
    onClose,
    onDeleteAsync,
  }: {
    children: ReactNode;
    isOpen: boolean;
    onClose: () => void;
    onDeleteAsync?: () => Promise<void>;
  }): JSX.Element | null => {
    if (!isOpen) return null;
    return (
      <div data-testid={'confirm-delete-dialog'}>
        <div>{children}</div>
        <button onClick={onClose}>Cancel Delete</button>
        <button
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

describe('CollectionHeaderDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render CollectionHeaderCard with collection data', () => {
      const collection = createMockCollectionHeader({
        description: 'Amazing collection of bobbleheads',
        name: 'My Test Collection',
      });

      render(<CollectionHeaderDisplay collection={collection} />);

      // Verify collection name is displayed
      expect(screen.getByText('My Test Collection')).toBeInTheDocument();

      // Verify collection description is displayed
      expect(screen.getByText('Amazing collection of bobbleheads')).toBeInTheDocument();

      // Verify CollectionHeaderCard is rendered (card component wraps header)
      expect(screen.getByTestId('ui-card-header')).toBeInTheDocument();
    });
  });

  describe('edit dialog', () => {
    it('should open edit dialog when onEdit is triggered', async () => {
      const collection = createMockCollectionHeader({
        name: 'My Collection',
      });

      const { user } = render(<CollectionHeaderDisplay collection={collection} />);

      // Open dropdown menu
      const dropdownTrigger = screen.getByRole('button', { name: '' });
      await user.click(dropdownTrigger);

      // Click Edit menu item
      const editMenuItem = screen.getByRole('menuitem', { name: /edit collection/i });
      await user.click(editMenuItem);

      // Verify edit dialog is now open
      await waitFor(() => {
        expect(screen.getByTestId('collection-upsert-dialog')).toBeInTheDocument();
      });

      // Verify collection data is passed to dialog
      expect(screen.getByText('Edit Collection: My Collection')).toBeInTheDocument();
    });

    it('should close edit dialog and clear editing state on cancel', async () => {
      const collection = createMockCollectionHeader({
        name: 'My Collection',
      });

      const { user } = render(<CollectionHeaderDisplay collection={collection} />);

      // Open dropdown menu and click Edit
      const dropdownTrigger = screen.getByRole('button', { name: '' });
      await user.click(dropdownTrigger);
      const editMenuItem = screen.getByRole('menuitem', { name: /edit collection/i });
      await user.click(editMenuItem);

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByTestId('collection-upsert-dialog')).toBeInTheDocument();
      });

      // Click Cancel button in dialog
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Verify dialog is closed
      await waitFor(() => {
        expect(screen.queryByTestId('collection-upsert-dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('delete confirmation', () => {
    it('should open delete confirmation dialog when onDelete is triggered', async () => {
      const collection = createMockCollectionHeader({
        name: 'My Collection',
      });

      const { user } = render(<CollectionHeaderDisplay collection={collection} />);

      // Open dropdown menu
      const dropdownTrigger = screen.getByRole('button', { name: '' });
      await user.click(dropdownTrigger);

      // Click Delete menu item
      const deleteMenuItem = screen.getByRole('menuitem', { name: /delete collection/i });
      await user.click(deleteMenuItem);

      // Verify confirmation dialog is now open
      await waitFor(() => {
        expect(screen.getByTestId('confirm-delete-dialog')).toBeInTheDocument();
      });

      // Verify warning text is displayed
      expect(screen.getByText(/permanently delete this collection and all bobbleheads/i)).toBeInTheDocument();
    });

    it('should execute delete action and navigate away on confirm', async () => {
      const collection = createMockCollectionHeader({
        id: 'test-collection-id',
        name: 'My Collection',
      });

      // Mock successful delete and invoke onAfterSuccess callback
      mockExecuteAsync.mockImplementation(() => {
        // Simulate successful deletion
        const result = { wasSuccess: true };
        // Invoke the onAfterSuccess callback to trigger navigation
        if (onAfterSuccessCallback) {
          onAfterSuccessCallback();
        }
        return Promise.resolve(result);
      });

      const { user } = render(<CollectionHeaderDisplay collection={collection} />);

      // Open dropdown menu and click Delete
      const dropdownTrigger = screen.getByRole('button', { name: '' });
      await user.click(dropdownTrigger);
      const deleteMenuItem = screen.getByRole('menuitem', { name: /delete collection/i });
      await user.click(deleteMenuItem);

      // Wait for confirmation dialog to open
      await waitFor(() => {
        expect(screen.getByTestId('confirm-delete-dialog')).toBeInTheDocument();
      });

      // Click Confirm Delete button
      const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
      await user.click(confirmButton);

      // Verify delete action was executed with correct collection ID
      await waitFor(() => {
        expect(mockExecuteAsync).toHaveBeenCalledWith({ collectionId: 'test-collection-id' });
      });
      expect(mockExecuteAsync).toHaveBeenCalledTimes(1);

      // Verify navigation occurs (setParams called with null to clear collectionSlug)
      await waitFor(() => {
        expect(mockSetParams).toHaveBeenCalledWith({ collectionSlug: null });
      });
    });
  });
});

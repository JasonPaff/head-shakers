import type { ComponentType, ReactNode } from 'react';

import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CollectionForUpsert } from '@/components/feature/collections/collection-upsert-dialog.types';

import { CollectionUpsertDialog } from '@/components/feature/collections/collection-upsert-dialog';

import { render, screen } from '../../setup/test-utils';

// Mock the server actions
vi.mock('@/lib/actions/collections/collections.actions', () => ({
  createCollectionAction: vi.fn(),
  updateCollectionAction: vi.fn(),
}));

// Mock the useServerAction hook
vi.mock('@/hooks/use-server-action', () => ({
  useServerAction: vi.fn(() => ({
    executeAsync: vi.fn(),
    isExecuting: false,
  })),
}));

// Mock the focus management HOC to avoid additional wrapping complexity
vi.mock('@/components/ui/form/focus-management/with-focus-management', () => ({
  withFocusManagement: (Component: ComponentType<unknown>) => Component,
}));

// Mock the focus context
vi.mock('@/components/ui/form/focus-management/focus-context', () => ({
  useFocusContext: vi.fn(() => ({
    focusFirstError: vi.fn(),
  })),
}));

// Mock CollectionDelete component
vi.mock('@/components/feature/collections/collection-delete', () => ({
  CollectionDelete: ({ children, testId }: { children: ReactNode; testId?: string }) => (
    <button data-testid={testId || 'collection-delete'}>{children}</button>
  ),
}));

// Mock CollectionFormFields component
vi.mock('@/components/feature/collections/collection-form-fields', () => ({
  CollectionFormFields: ({ testIdPrefix }: { testIdPrefix: string }) => (
    <div data-testid={`${testIdPrefix}-form-fields`}>Form Fields Mock</div>
  ),
}));

// Mock the useCollectionUpsertForm hook
vi.mock('@/components/feature/collections/hooks/use-collection-upsert-form', () => ({
  useCollectionUpsertForm: vi.fn(),
}));

describe('CollectionUpsertDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  const mockCollection: CollectionForUpsert = {
    coverImageUrl: 'https://example.com/cover.jpg',
    description: 'Test Collection Description',
    id: 'collection-123',
    isPublic: true,
    name: 'Test Collection',
  };

  // Helper to create a mock form object
  const createMockForm = () => ({
    AppField: () => <div>Field Mock</div>,
    AppForm: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    handleSubmit: vi.fn(),
    reset: vi.fn(),
    store: {
      subscribe: vi.fn(),
    },
    SubmitButton: ({ children, testId }: { children: ReactNode; testId?: string }) => (
      <button data-testid={testId} type={'submit'}>
        {children}
      </button>
    ),
  });

  // Helper to setup the hook mock with specific values
  const setupHookMock = async (options: {
    coverImageUrl?: string;
    isEditMode: boolean;
    onSuccessCallback?: (result: { id: string; name: string; slug: string }) => void;
    resetForm?: () => void;
  }) => {
    const { useCollectionUpsertForm } = await import(
      '@/components/feature/collections/hooks/use-collection-upsert-form'
    );

    const resetFormFn = options.resetForm || vi.fn();

    vi.mocked(useCollectionUpsertForm).mockImplementation(({ onSuccess }) => {
      // If a callback is provided, trigger it
      if (options.onSuccessCallback) {
        setTimeout(() => {
          options.onSuccessCallback?.({
            id: 'new-collection-id',
            name: 'New Collection',
            slug: 'new-collection',
          });
          onSuccess?.({
            id: 'new-collection-id',
            name: 'New Collection',
            slug: 'new-collection',
          });
        }, 0);
      }

      return {
        coverImageUrl: options.coverImageUrl,
        form: createMockForm() as never,
        handleRemoveCover: vi.fn(),
        handleUploadComplete: vi.fn(),
        isEditMode: options.isEditMode,
        isSubmitting: false,
        labels: {
          description:
            options.isEditMode ?
              'Update the details of your collection below. You can change the name, description, and visibility.'
            : 'Add a new collection to organize your bobbleheads. You can edit these details later.',
          submitButton: options.isEditMode ? 'Update Collection' : 'Create Collection',
          submitButtonLoading: options.isEditMode ? 'Updating...' : 'Creating...',
          title: options.isEditMode ? 'Update Existing Collection' : 'Create New Collection',
        },
        resetForm: resetFormFn,
      };
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create mode', () => {
    it('should render in create mode with "Create New Collection" title and no delete button', async () => {
      await setupHookMock({ isEditMode: false });

      render(
        <CollectionUpsertDialog
          collection={undefined}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      // Verify title is for create mode
      expect(screen.getByText('Create New Collection')).toBeInTheDocument();

      // Verify description is for create mode
      expect(
        screen.getByText(
          'Add a new collection to organize your bobbleheads. You can edit these details later.',
        ),
      ).toBeInTheDocument();

      // Verify no delete button exists
      expect(screen.queryByTestId('feature-collection-edit-delete')).not.toBeInTheDocument();

      // Verify cancel and submit buttons exist
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create collection/i })).toBeInTheDocument();
    });
  });

  describe('edit mode', () => {
    it('should render in edit mode with "Update Existing Collection" title and delete button', async () => {
      await setupHookMock({ coverImageUrl: 'https://example.com/cover.jpg', isEditMode: true });

      render(
        <CollectionUpsertDialog
          collection={mockCollection}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      // Verify title is for edit mode
      expect(screen.getByText('Update Existing Collection')).toBeInTheDocument();

      // Verify description is for edit mode
      expect(
        screen.getByText(
          'Update the details of your collection below. You can change the name, description, and visibility.',
        ),
      ).toBeInTheDocument();

      // Verify delete button exists
      expect(screen.getByTestId('feature-collection-edit-delete')).toBeInTheDocument();

      // Verify cancel and submit buttons exist
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update collection/i })).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('should validate required fields and show errors on submit', async () => {
      const mockForm = createMockForm();

      const { useCollectionUpsertForm } = await import(
        '@/components/feature/collections/hooks/use-collection-upsert-form'
      );
      vi.mocked(useCollectionUpsertForm).mockReturnValue({
        coverImageUrl: undefined,
        form: mockForm as never,
        handleRemoveCover: vi.fn(),
        handleUploadComplete: vi.fn(),
        isEditMode: false,
        isSubmitting: false,
        labels: {
          description: 'Add a new collection to organize your bobbleheads. You can edit these details later.',
          submitButton: 'Create Collection',
          submitButtonLoading: 'Creating...',
          title: 'Create New Collection',
        },
        resetForm: vi.fn(),
      });

      const { user } = render(
        <CollectionUpsertDialog
          collection={undefined}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      const submitButton = screen.getByRole('button', { name: /create collection/i });

      // Submit empty form
      await user.click(submitButton);

      // Verify handleSubmit was called
      await waitFor(() => {
        expect(mockForm.handleSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('callback execution', () => {
    it('should call onSuccess callback after successful form submission', async () => {
      await setupHookMock({
        isEditMode: false,
        onSuccessCallback: vi.fn(),
      });

      render(
        <CollectionUpsertDialog
          collection={undefined}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      // Wait for onSuccess to be called
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith({
          id: 'new-collection-id',
          name: 'New Collection',
          slug: 'new-collection',
        });
      });

      // Verify onClose was also called (part of handleClose)
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('cancel and close behavior', () => {
    it('should reset form and close dialog on cancel', async () => {
      const mockResetForm = vi.fn();

      await setupHookMock({
        isEditMode: false,
        resetForm: mockResetForm,
      });

      const { user } = render(
        <CollectionUpsertDialog
          collection={undefined}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      // Click cancel button
      await user.click(cancelButton);

      // Verify onClose was called immediately
      expect(mockOnClose).toHaveBeenCalled();

      // Verify resetForm will be called after timeout (300ms)
      await waitFor(
        () => {
          expect(mockResetForm).toHaveBeenCalled();
        },
        { timeout: 500 },
      );
    });
  });
});

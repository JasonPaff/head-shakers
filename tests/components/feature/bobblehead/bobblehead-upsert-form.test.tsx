import type { ComponentType, ReactNode } from 'react';

import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  BobbleheadForUpsert,
  CollectionSelectorRecord,
} from '@/components/feature/bobblehead/bobblehead-upsert-form.types';

import { BobbleheadUpsertForm } from '@/components/feature/bobblehead/bobblehead-upsert-form';

import { render, screen } from '../../../setup/test-utils';

// Mock the server actions
vi.mock('@/lib/actions/bobbleheads/bobbleheads.actions', () => ({
  createBobbleheadWithPhotosAction: vi.fn(),
  updateBobbleheadWithPhotosAction: vi.fn(),
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

// Mock BobbleheadFormFields component
vi.mock('@/components/feature/bobblehead/bobblehead-form-fields', () => ({
  BobbleheadFormFields: ({ testIdPrefix }: { testIdPrefix: string }) => (
    <div data-testid={`${testIdPrefix}-form-fields`}>Form Fields Mock</div>
  ),
}));

// Mock the useBobbleheadUpsertForm hook
vi.mock('@/components/feature/bobblehead/hooks/use-bobblehead-upsert-form', () => ({
  useBobbleheadUpsertForm: vi.fn(),
}));

describe('BobbleheadUpsertForm', () => {
  const mockOnCancel = vi.fn();
  const mockOnSuccess = vi.fn();

  const mockCollections: Array<CollectionSelectorRecord> = [
    { id: 'collection-1', name: 'Test Collection 1', slug: 'test-collection-1' },
    { id: 'collection-2', name: 'Test Collection 2', slug: 'test-collection-2' },
  ];

  const mockBobblehead: BobbleheadForUpsert = {
    acquisitionDate: new Date('2024-01-15'),
    acquisitionMethod: 'Purchase',
    category: 'Sports',
    characterName: 'Test Character',
    collectionId: 'collection-1',
    commentCount: 0,
    createdAt: new Date('2024-01-01'),
    currentCondition: 'excellent',
    customFields: [{ 'Limited Edition': '#42 of 500' }],
    deletedAt: null,
    description: 'Test Description',
    height: 7.5,
    id: 'bobblehead-123',
    isFeatured: false,
    isPublic: true,
    likeCount: 0,
    manufacturer: 'Test Manufacturer',
    material: 'Resin',
    name: 'Test Bobblehead',
    purchaseLocation: 'eBay',
    purchasePrice: 29.99,
    series: 'MLB Legends',
    slug: 'test-bobblehead',
    status: 'owned',
    tags: [
      { id: 'tag-1', name: 'baseball' },
      { id: 'tag-2', name: 'vintage' },
    ],
    updatedAt: new Date('2024-01-15'),
    userId: 'test-user-id',
    viewCount: 0,
    weight: 12,
    year: 2024,
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
    isEditMode: boolean;
    onSuccessCallback?: (result: { id: string; name: string; slug: string }) => void;
    resetForm?: () => void;
  }) => {
    const { useBobbleheadUpsertForm } =
      await import('@/components/feature/bobblehead/hooks/use-bobblehead-upsert-form');

    const resetFormFn = options.resetForm || vi.fn();

    vi.mocked(useBobbleheadUpsertForm).mockImplementation(({ onSuccess }) => {
      // If a callback is provided, trigger it
      if (options.onSuccessCallback) {
        setTimeout(() => {
          options.onSuccessCallback?.({
            id: 'new-bobblehead-id',
            name: 'New Bobblehead',
            slug: 'new-bobblehead',
          });
          onSuccess?.({
            id: 'new-bobblehead-id',
            name: 'New Bobblehead',
            slug: 'new-bobblehead',
          });
        }, 0);
      }

      return {
        form: createMockForm() as never,
        handlePhotoAdd: vi.fn(),
        handlePhotoRemove: vi.fn(),
        handlePhotosChange: vi.fn(),
        handlePhotosReorder: vi.fn(),
        isEditMode: options.isEditMode,
        isExecuting: false,
        isSubmitting: false,
        labels: {
          description:
            options.isEditMode ?
              'Update the details of your bobblehead below. You can change the name, description, and other attributes.'
            : 'Add a new bobblehead to your collection. Fill in the details below and upload photos.',
          submitButton: options.isEditMode ? 'Update Bobblehead' : 'Create Bobblehead',
          submitButtonLoading: options.isEditMode ? 'Updating...' : 'Creating...',
          title: options.isEditMode ? 'Edit Bobblehead' : 'Add New Bobblehead',
        },
        photos: [],
        resetForm: resetFormFn,
      };
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create mode', () => {
    it('should render in create mode with "Add New Bobblehead" title', async () => {
      await setupHookMock({ isEditMode: false });

      render(
        <BobbleheadUpsertForm
          bobblehead={undefined}
          collectionId={'collection-1'}
          collections={mockCollections}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />,
      );

      // Verify title is for create mode
      expect(screen.getByText('Add New Bobblehead')).toBeInTheDocument();

      // Verify description is for create mode
      expect(
        screen.getByText(
          'Add a new bobblehead to your collection. Fill in the details below and upload photos.',
        ),
      ).toBeInTheDocument();

      // Verify cancel and submit buttons exist
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create bobblehead/i })).toBeInTheDocument();
    });

    it('should render form fields component in create mode', async () => {
      await setupHookMock({ isEditMode: false });

      render(
        <BobbleheadUpsertForm
          bobblehead={undefined}
          collectionId={'collection-1'}
          collections={mockCollections}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />,
      );

      // Verify form fields are rendered with create mode prefix
      expect(screen.getByTestId('bobblehead-create-form-fields')).toBeInTheDocument();
    });
  });

  describe('edit mode', () => {
    it('should render in edit mode with "Edit Bobblehead" title', async () => {
      await setupHookMock({ isEditMode: true });

      render(
        <BobbleheadUpsertForm
          bobblehead={mockBobblehead}
          collectionId={'collection-1'}
          collections={mockCollections}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />,
      );

      // Verify title is for edit mode
      expect(screen.getByText('Edit Bobblehead')).toBeInTheDocument();

      // Verify description is for edit mode
      expect(
        screen.getByText(
          'Update the details of your bobblehead below. You can change the name, description, and other attributes.',
        ),
      ).toBeInTheDocument();

      // Verify cancel and submit buttons exist
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update bobblehead/i })).toBeInTheDocument();
    });

    it('should render form fields component in edit mode', async () => {
      await setupHookMock({ isEditMode: true });

      render(
        <BobbleheadUpsertForm
          bobblehead={mockBobblehead}
          collectionId={'collection-1'}
          collections={mockCollections}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />,
      );

      // Verify form fields are rendered with edit mode prefix
      expect(screen.getByTestId('bobblehead-edit-form-fields')).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('should call handleSubmit when submit button is clicked', async () => {
      const mockForm = createMockForm();

      const { useBobbleheadUpsertForm } =
        await import('@/components/feature/bobblehead/hooks/use-bobblehead-upsert-form');
      vi.mocked(useBobbleheadUpsertForm).mockReturnValue({
        form: mockForm as never,
        handlePhotoAdd: vi.fn(),
        handlePhotoRemove: vi.fn(),
        handlePhotosChange: vi.fn(),
        handlePhotosReorder: vi.fn(),
        isEditMode: false,
        isExecuting: false,
        isSubmitting: false,
        labels: {
          description:
            'Add a new bobblehead to your collection. Fill in the details below and upload photos.',
          submitButton: 'Create Bobblehead',
          submitButtonLoading: 'Creating...',
          title: 'Add New Bobblehead',
        },
        photos: [],
        resetForm: vi.fn(),
      });

      const { user } = render(
        <BobbleheadUpsertForm
          bobblehead={undefined}
          collectionId={'collection-1'}
          collections={mockCollections}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />,
      );

      const submitButton = screen.getByRole('button', { name: /create bobblehead/i });

      // Click submit button
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
        <BobbleheadUpsertForm
          bobblehead={undefined}
          collectionId={'collection-1'}
          collections={mockCollections}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />,
      );

      // Wait for onSuccess to be called
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith({
          id: 'new-bobblehead-id',
          name: 'New Bobblehead',
          slug: 'new-bobblehead',
        });
      });
    });
  });

  describe('cancel behavior', () => {
    it('should reset form and call onCancel when cancel button is clicked', async () => {
      const mockResetForm = vi.fn();

      await setupHookMock({
        isEditMode: false,
        resetForm: mockResetForm,
      });

      const { user } = render(
        <BobbleheadUpsertForm
          bobblehead={undefined}
          collectionId={'collection-1'}
          collections={mockCollections}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />,
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      // Click cancel button
      await user.click(cancelButton);

      // Verify resetForm was called
      expect(mockResetForm).toHaveBeenCalled();

      // Verify onCancel was called
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('test IDs', () => {
    it('should render with correct test IDs in create mode', async () => {
      await setupHookMock({ isEditMode: false });

      render(
        <BobbleheadUpsertForm
          bobblehead={undefined}
          collectionId={'collection-1'}
          collections={mockCollections}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />,
      );

      // Verify create mode test IDs
      expect(screen.getByTestId('bobblehead-create-form')).toBeInTheDocument();
      expect(screen.getByTestId('bobblehead-create-cancel')).toBeInTheDocument();
      expect(screen.getByTestId('bobblehead-create-submit')).toBeInTheDocument();
    });

    it('should render with correct test IDs in edit mode', async () => {
      await setupHookMock({ isEditMode: true });

      render(
        <BobbleheadUpsertForm
          bobblehead={mockBobblehead}
          collectionId={'collection-1'}
          collections={mockCollections}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />,
      );

      // Verify edit mode test IDs
      expect(screen.getByTestId('bobblehead-edit-form')).toBeInTheDocument();
      expect(screen.getByTestId('bobblehead-edit-cancel')).toBeInTheDocument();
      expect(screen.getByTestId('bobblehead-edit-submit')).toBeInTheDocument();
    });

    it('should use custom testId when provided', async () => {
      await setupHookMock({ isEditMode: false });

      render(
        <BobbleheadUpsertForm
          bobblehead={undefined}
          collectionId={'collection-1'}
          collections={mockCollections}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
          testId={'custom-form-test-id'}
        />,
      );

      // Verify custom test ID is used for form
      expect(screen.getByTestId('custom-form-test-id')).toBeInTheDocument();
    });
  });
});

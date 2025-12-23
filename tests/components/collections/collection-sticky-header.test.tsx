import { describe, expect, it, vi } from 'vitest';

import type { PublicCollection } from '@/lib/facades/collections/collections.facade';

import { CollectionStickyHeader } from '@/components/feature/collection/collection-sticky-header';

import { render, screen, waitFor } from '../../setup/test-utils';

// Mock child components
vi.mock('@/components/ui/like-button', () => ({
  LikeCompactButton: vi.fn(({ targetId }) => (
    <button aria-label={'Like'} data-testid={`like-button-${targetId}`}>
      Like
    </button>
  )),
}));

vi.mock('@/components/feature/collections/collection-share-menu', () => ({
  CollectionShareMenu: vi.fn(({ children }) => <div data-testid={'share-menu'}>{children}</div>),
}));

vi.mock('@/components/feature/collections/collection-delete', () => ({
  CollectionDelete: vi.fn(({ collectionId }) => (
    <button aria-label={'Delete collection'} data-testid={`delete-button-${collectionId}`}>
      Delete
    </button>
  )),
}));

vi.mock('@/components/feature/content-reports/report-button', () => ({
  ReportButton: vi.fn(({ targetId }) => (
    <button aria-label={'Report content'} data-testid={`report-button-${targetId}`}>
      Report
    </button>
  )),
}));

vi.mock('@/components/feature/collections/collection-upsert-dialog', () => ({
  CollectionUpsertDialog: vi.fn(({ isOpen }) =>
    isOpen ? <div data-testid={'collection-upsert-dialog'}>Edit Dialog</div> : null,
  ),
}));

describe('CollectionStickyHeader', () => {
  const mockCollection: PublicCollection = {
    coverImageUrl: null,
    createdAt: new Date(),
    description: 'Test description',
    id: 'collection-123',
    isPublic: true,
    lastUpdatedAt: new Date(),
    name: 'Test Collection',
    slug: 'test-collection',
    totalBobbleheadCount: 5,
    userId: 'user-123',
  };

  const defaultProps = {
    canDelete: false,
    canEdit: false,
    collection: mockCollection,
    collectionId: 'collection-123',
    collectionSlug: 'test-collection',
    isLiked: false,
    isOwner: false,
    likeCount: 10,
    title: 'Test Collection',
    username: 'testuser',
  };

  it('should render collection title and like button for all users', () => {
    render(<CollectionStickyHeader {...defaultProps} />);

    // Verify title is rendered
    expect(screen.getByRole('heading', { name: 'Test Collection' })).toBeInTheDocument();

    // Verify like button is present
    expect(screen.getByTestId('like-button-collection-123')).toBeInTheDocument();

    // Verify share menu is present
    expect(screen.getByTestId('share-menu')).toBeInTheDocument();
  });

  it('should show Edit and Delete buttons for owner when canEdit and canDelete are true', () => {
    render(<CollectionStickyHeader {...defaultProps} canDelete={true} canEdit={true} isOwner={true} />);

    // Verify Edit button is present
    expect(screen.getByRole('button', { name: 'Edit collection' })).toBeInTheDocument();

    // Verify Delete button is present
    expect(screen.getByTestId('delete-button-collection-123')).toBeInTheDocument();

    // Verify Report button is NOT present
    expect(screen.queryByTestId('report-button-collection-123')).not.toBeInTheDocument();
  });

  it('should show Report button for non-owner users', () => {
    render(<CollectionStickyHeader {...defaultProps} isOwner={false} />);

    // Verify Report button is present
    expect(screen.getByTestId('report-button-collection-123')).toBeInTheDocument();

    // Verify Edit button is NOT present
    expect(screen.queryByRole('button', { name: 'Edit collection' })).not.toBeInTheDocument();

    // Verify Delete button is NOT present
    expect(screen.queryByTestId('delete-button-collection-123')).not.toBeInTheDocument();
  });

  it('should open edit dialog when Edit button is clicked', async () => {
    const { user } = render(
      <CollectionStickyHeader {...defaultProps} canEdit={true} collection={mockCollection} isOwner={true} />,
    );

    // Initially dialog should not be visible
    expect(screen.queryByTestId('collection-upsert-dialog')).not.toBeInTheDocument();

    // Click Edit button
    await user.click(screen.getByRole('button', { name: 'Edit collection' }));

    // Verify dialog opens
    await waitFor(() => {
      expect(screen.getByTestId('collection-upsert-dialog')).toBeInTheDocument();
    });
  });

  it('should not show Edit/Delete buttons when permissions are false', () => {
    render(<CollectionStickyHeader {...defaultProps} canDelete={false} canEdit={false} isOwner={true} />);

    // Verify Edit button is NOT present
    expect(screen.queryByRole('button', { name: 'Edit collection' })).not.toBeInTheDocument();

    // Verify Delete button is NOT present
    expect(screen.queryByTestId('delete-button-collection-123')).not.toBeInTheDocument();
  });
});

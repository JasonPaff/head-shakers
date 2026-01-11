import { waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CollectionShareMenu } from '@/components/feature/collections/collection-share-menu';

import { mockClipboard, mockWindowOpen, restoreBrowserAPIs } from '../../mocks/browser-api.mocks';
import { setupMockEnvironment, teardownMockEnvironment } from '../../setup/mock-environment';
import { render, screen } from '../../setup/test-utils';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock share utils module
vi.mock('@/lib/utils/share-utils', () => ({
  copyToClipboard: vi.fn(),
  generateAbsoluteUrl: vi.fn(),
  generateSocialShareUrl: vi.fn(),
  openShareWindow: vi.fn(),
}));

describe('CollectionShareMenu', () => {
  const defaultProps = {
    children: <button>Share</button>,
    collectionSlug: 'test-collection',
    username: 'testuser123',
  };

  beforeEach(() => {
    setupMockEnvironment({
      NEXT_PUBLIC_APP_URL: 'https://headshakers.com',
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    teardownMockEnvironment();
    restoreBrowserAPIs();
  });

  it('should render dropdown menu with Copy Link, Twitter, and Facebook options', async () => {
    const { user } = render(<CollectionShareMenu {...defaultProps} />);

    // Click trigger to open menu
    await user.click(screen.getByRole('button', { name: /share/i }));

    // Verify menu items are present
    await waitFor(() => {
      expect(screen.getByText('Copy Link')).toBeInTheDocument();
      expect(screen.getByText('Share on X')).toBeInTheDocument();
      expect(screen.getByText('Share on Facebook')).toBeInTheDocument();
    });
  });

  it('should copy absolute URL to clipboard and show success toast', async () => {
    // Setup mocks
    mockClipboard();
    const { copyToClipboard, generateAbsoluteUrl } = vi.mocked(await import('@/lib/utils/share-utils'));
    generateAbsoluteUrl.mockReturnValue('https://headshakers.com/collections/test-collection');
    copyToClipboard.mockResolvedValue(true);

    const { user } = render(<CollectionShareMenu {...defaultProps} />);

    // Open menu and click Copy Link
    await user.click(screen.getByRole('button', { name: /share/i }));
    await user.click(screen.getByText('Copy Link'));

    // Verify absolute URL was generated with correct path
    await waitFor(() => {
      expect(generateAbsoluteUrl).toHaveBeenCalledWith('/collections/test-collection');
    });

    // Verify clipboard operation
    await waitFor(() => {
      expect(copyToClipboard).toHaveBeenCalledWith('https://headshakers.com/collections/test-collection');
    });

    // Verify success toast was shown
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Link copied to clipboard!');
    });
  });

  it('should open Twitter share window with correct URL', async () => {
    // Setup mocks
    mockWindowOpen();
    const { generateAbsoluteUrl, generateSocialShareUrl, openShareWindow } = vi.mocked(
      await import('@/lib/utils/share-utils'),
    );
    generateAbsoluteUrl.mockReturnValue('https://headshakers.com/collections/test-collection');
    generateSocialShareUrl.mockReturnValue(
      'https://twitter.com/intent/tweet?url=https://headshakers.com/collections/test-collection&text=Check%20out%20this%20collection!',
    );

    const { user } = render(<CollectionShareMenu {...defaultProps} />);

    // Open menu and click Share on X
    await user.click(screen.getByRole('button', { name: /share/i }));
    await user.click(screen.getByText('Share on X'));

    // Verify absolute URL was generated
    await waitFor(() => {
      expect(generateAbsoluteUrl).toHaveBeenCalledWith('/collections/test-collection');
    });

    // Verify Twitter share URL was generated
    await waitFor(() => {
      expect(generateSocialShareUrl).toHaveBeenCalledWith('twitter', {
        title: 'Check out this collection!',
        url: 'https://headshakers.com/collections/test-collection',
      });
    });

    // Verify share window was opened
    await waitFor(() => {
      expect(openShareWindow).toHaveBeenCalledWith(
        'https://twitter.com/intent/tweet?url=https://headshakers.com/collections/test-collection&text=Check%20out%20this%20collection!',
      );
    });
  });

  it('should open Facebook share window with correct URL', async () => {
    // Setup mocks
    mockWindowOpen();
    const { generateAbsoluteUrl, generateSocialShareUrl, openShareWindow } = vi.mocked(
      await import('@/lib/utils/share-utils'),
    );
    generateAbsoluteUrl.mockReturnValue('https://headshakers.com/collections/test-collection');
    generateSocialShareUrl.mockReturnValue(
      'https://www.facebook.com/sharer/sharer.php?u=https://headshakers.com/collections/test-collection',
    );

    const { user } = render(<CollectionShareMenu {...defaultProps} />);

    // Open menu and click Share on Facebook
    await user.click(screen.getByRole('button', { name: /share/i }));
    await user.click(screen.getByText('Share on Facebook'));

    // Verify absolute URL was generated
    await waitFor(() => {
      expect(generateAbsoluteUrl).toHaveBeenCalledWith('/collections/test-collection');
    });

    // Verify Facebook share URL was generated
    await waitFor(() => {
      expect(generateSocialShareUrl).toHaveBeenCalledWith('facebook', {
        url: 'https://headshakers.com/collections/test-collection',
      });
    });

    // Verify share window was opened
    await waitFor(() => {
      expect(openShareWindow).toHaveBeenCalledWith(
        'https://www.facebook.com/sharer/sharer.php?u=https://headshakers.com/collections/test-collection',
      );
    });
  });
});

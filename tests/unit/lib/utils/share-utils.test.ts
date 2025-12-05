/**
 * Unit tests for share utility functions
 * Tests clipboard operations, URL generation, and social media share URLs
 */

import * as Sentry from '@sentry/nextjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  copyToClipboard,
  generateAbsoluteUrl,
  generateSocialShareUrl,
  getBaseUrl,
  type ShareOptions,
} from '@/lib/utils/share-utils';

import { mockClipboard, restoreBrowserAPIs } from '../../../mocks/browser-api.mocks';
import { setupMockEnvironment, teardownMockEnvironment } from '../../../setup/mock-environment';

// Mock Sentry to verify error capture
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

describe('share-utils', () => {
  beforeEach(() => {
    // Set up mock environment with default test URL

    setupMockEnvironment({
      NEXT_PUBLIC_APP_URL: 'https://headshakers.com',
    });

    // Clear all Sentry mock calls
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment

    teardownMockEnvironment();

    // Restore browser APIs

    restoreBrowserAPIs();
  });

  describe('copyToClipboard', () => {
    it('should copy text to clipboard and return true on success', async () => {
      // Arrange

      const clipboardSpy = mockClipboard();
      const textToCopy = 'https://headshakers.com/bobbleheads/123';

      // Act
      const result = await copyToClipboard(textToCopy);

      // Assert
      expect(result).toBe(true);
      expect(clipboardSpy).toHaveBeenCalledWith(textToCopy);
      expect(clipboardSpy).toHaveBeenCalledTimes(1);
      expect(vi.mocked(Sentry.captureException)).not.toHaveBeenCalled();
    });

    it('should return false when clipboard API is unavailable', async () => {
      // Arrange
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: undefined,
        writable: true,
      });

      // Act
      const result = await copyToClipboard('test text');

      // Assert
      expect(result).toBe(false);
      expect(vi.mocked(Sentry.captureException)).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Clipboard API not available',
        }),
        expect.objectContaining({
          extra: { operation: 'copy-to-clipboard' },
          level: 'warning',
        }),
      );
    });
  });

  describe('generateAbsoluteUrl', () => {
    it('should generate absolute URL from relative path with leading slash', () => {
      // Arrange
      const relativePath = '/bobbleheads/123';

      // Act
      const result = generateAbsoluteUrl(relativePath);

      // Assert
      expect(result).toBe('https://headshakers.com/bobbleheads/123');
      expect(vi.mocked(Sentry.captureException)).not.toHaveBeenCalled();
    });

    it('should add leading slash if missing and generate absolute URL', () => {
      // Arrange
      const relativePath = 'collections/456';

      // Act
      const result = generateAbsoluteUrl(relativePath);

      // Assert
      expect(result).toBe('https://headshakers.com/collections/456');
      expect(vi.mocked(Sentry.captureException)).not.toHaveBeenCalled();
    });
  });

  describe('generateSocialShareUrl', () => {
    it('should generate Twitter/X share URL with title and description', () => {
      // Arrange
      const options: ShareOptions = {
        description: 'Amazing collectible',
        title: 'Check out this bobblehead!',
        url: 'https://headshakers.com/bobbleheads/123',
      };

      // Act
      const result = generateSocialShareUrl('twitter', options);

      // Assert
      expect(result).toContain('https://twitter.com/intent/tweet?');
      expect(result).toContain('url=https%3A%2F%2Fheadshakers.com%2Fbobbleheads%2F123');
      expect(result).toContain('text=Check+out+this+bobblehead%21+-+Amazing+collectible');
      expect(vi.mocked(Sentry.captureException)).not.toHaveBeenCalled();
    });

    it('should generate Facebook share URL with just URL', () => {
      // Arrange
      const options: ShareOptions = {
        url: 'https://headshakers.com/collections/789',
      };

      // Act
      const result = generateSocialShareUrl('facebook', options);

      // Assert
      expect(result).toContain('https://www.facebook.com/sharer/sharer.php?');
      expect(result).toContain('u=https%3A%2F%2Fheadshakers.com%2Fcollections%2F789');
      expect(vi.mocked(Sentry.captureException)).not.toHaveBeenCalled();
    });

    it('should generate LinkedIn share URL with URL parameter', () => {
      // Arrange
      const options: ShareOptions = {
        url: 'https://headshakers.com/profile/user123',
      };

      // Act
      const result = generateSocialShareUrl('linkedin', options);

      // Assert
      expect(result).toContain('https://www.linkedin.com/sharing/share-offsite/?');
      expect(result).toContain('url=https%3A%2F%2Fheadshakers.com%2Fprofile%2Fuser123');
      expect(vi.mocked(Sentry.captureException)).not.toHaveBeenCalled();
    });
  });

  describe('getBaseUrl', () => {
    it('should throw error when NEXT_PUBLIC_APP_URL is not configured', () => {
      // Arrange
      delete process.env.NEXT_PUBLIC_APP_URL;

      // Act & Assert
      expect(() => getBaseUrl()).toThrow('NEXT_PUBLIC_APP_URL environment variable is not configured');
      expect(vi.mocked(Sentry.captureException)).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'NEXT_PUBLIC_APP_URL environment variable is not configured',
        }),
        expect.objectContaining({
          extra: { operation: 'get-base-url' },
          level: 'error',
        }),
      );
    });
  });
});

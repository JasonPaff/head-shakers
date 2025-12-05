/**
 * Browser API mocks for component tests.
 * Provides reusable mocks for clipboard, window.open, and screen dimensions.
 */
import { vi } from 'vitest';

interface ScreenDimensions {
  height?: number;
  width?: number;
}

/**
 * Mock clipboard API with writeText tracking.
 * Returns a spy function that can be used to verify clipboard operations.
 *
 * @example
 * ```ts
 * const clipboardSpy = mockClipboard();
 * // ... trigger copy action
 * expect(clipboardSpy).toHaveBeenCalledWith('expected text');
 * ```
 */
export function mockClipboard() {
  const writeTextSpy = vi.fn().mockResolvedValue(undefined);

  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: writeTextSpy,
    },
    writable: true,
  });

  return writeTextSpy;
}

/**
 * Mock window.open to track navigation calls.
 * Returns a spy function that can be used to verify window.open operations.
 *
 * @example
 * ```ts
 * const windowOpenSpy = mockWindowOpen();
 * // ... trigger share action
 * expect(windowOpenSpy).toHaveBeenCalledWith('https://example.com', '_blank');
 * ```
 */
export function mockWindowOpen() {
  const windowOpenSpy = vi.fn();

  Object.defineProperty(window, 'open', {
    configurable: true,
    value: windowOpenSpy,
    writable: true,
  });

  return windowOpenSpy;
}

/**
 * Mock screen dimensions for responsive testing.
 *
 * @example
 * ```ts
 * mockWindowScreen({ width: 768, height: 1024 });
 * // ... test mobile layout
 * ```
 */
export function mockWindowScreen(dimensions: ScreenDimensions = {}) {
  const { height = 1080, width = 1920 } = dimensions;

  Object.defineProperty(window, 'screen', {
    configurable: true,
    value: {
      height,
      width,
    },
    writable: true,
  });
}

/**
 * Original browser API references for restoration.
 */
const originalAPIs = {
  clipboard: navigator.clipboard,
  screen: window.screen,
  windowOpen: window.open,
};

/**
 * Restore original browser APIs.
 * Call this in afterEach to clean up mocks between tests.
 *
 * @example
 * ```ts
 * afterEach(() => {
 *   restoreBrowserAPIs();
 * });
 * ```
 */
export function restoreBrowserAPIs() {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: originalAPIs.clipboard,
    writable: true,
  });

  Object.defineProperty(window, 'open', {
    configurable: true,
    value: originalAPIs.windowOpen,
    writable: true,
  });

  Object.defineProperty(window, 'screen', {
    configurable: true,
    value: originalAPIs.screen,
    writable: true,
  });
}

import type { RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Fragment } from 'react';

/**
 * Wrapper component that provides all necessary providers for testing.
 * Add providers here as needed (e.g., QueryClientProvider, ThemeProvider).
 */
function AllTheProviders({ children }: { children: ReactNode }) {
  return <Fragment>{children}</Fragment>;
}

/**
 * Custom render function that wraps components with necessary providers
 * and sets up userEvent for simulating user interactions.
 *
 * @example
 * ```tsx
 * const { user } = render(<Button onClick={handleClick}>Click me</Button>);
 * await user.click(screen.getByRole('button'));
 * ```
 */
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllTheProviders, ...options }),
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override the render method with our custom one
export { customRender as render };

// Export userEvent for direct use if needed
export { userEvent };

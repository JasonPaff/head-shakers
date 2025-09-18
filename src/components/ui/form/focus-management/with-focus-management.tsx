'use client';

import type { ComponentType } from 'react';

import { FocusProvider } from '@/components/ui/form/focus-management/focus-context';

/**
 * Higher-Order Component that wraps a form component with FocusProvider
 * This enables automatic focus management for form validation errors
 */
export function withFocusManagement<P extends object>(Component: ComponentType<P>) {
  const WithFocusManagementComponent = (props: P) => {
    return (
      <FocusProvider>
        <Component {...props} />
      </FocusProvider>
    );
  };

  WithFocusManagementComponent.displayName = `withFocusManagement(${Component.displayName || Component.name || 'Component'})`;

  return WithFocusManagementComponent;
}

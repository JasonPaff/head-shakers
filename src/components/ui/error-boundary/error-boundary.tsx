'use client';

import type { ErrorInfo, ReactNode } from 'react';

import * as Sentry from '@sentry/nextjs';
import { Component } from 'react';

import { SENTRY_CONTEXTS, SENTRY_TAGS } from '@/lib/constants/sentry';

import { ErrorBoundaryFallback } from './error-boundary-fallback';

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback - receives error and reset function */
  fallback?: ((error: Error, reset: () => void) => ReactNode) | ReactNode;
  /** Section/component name for logging and display */
  name?: string;
  /** Called when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Called when reset/retry is triggered */
  onReset?: () => void;
  /** Enable Sentry reporting (default: true) */
  shouldReportToSentry?: boolean;
}

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null,
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      error,
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { name = 'unknown', onError, shouldReportToSentry = true } = this.props;

    // Report to Sentry
    if (shouldReportToSentry) {
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
          [SENTRY_CONTEXTS.ERROR_DETAILS]: {
            boundaryName: name,
            errorMessage: error.message,
            errorName: error.name,
          },
        },
        extra: {
          componentStack: errorInfo.componentStack,
          errorBoundary: name,
          errorMessage: error.message,
          errorName: error.name,
          errorStack: error.stack,
        },
        level: 'error',
        tags: {
          errorBoundary: 'true',
          [SENTRY_TAGS.COMPONENT]: name,
          [SENTRY_TAGS.FEATURE]: 'error-boundary',
        },
      });
    }

    // Store errorInfo in state
    this.setState({ errorInfo });

    // Call optional error callback
    onError?.(error, errorInfo);
  }

  render(): ReactNode {
    const { children, fallback, name } = this.props;
    const { error, hasError } = this.state;

    if (hasError && error) {
      // Custom fallback (function or ReactNode)
      if (typeof fallback === 'function') {
        return fallback(error, this.resetErrorBoundary);
      }

      if (fallback) {
        return fallback;
      }

      // Default fallback
      return <ErrorBoundaryFallback error={error} name={name} onReset={this.resetErrorBoundary} />;
    }

    return children;
  }

  private resetErrorBoundary = (): void => {
    const { name = 'unknown', onReset, shouldReportToSentry = true } = this.props;

    // Log reset action to Sentry
    if (shouldReportToSentry) {
      Sentry.captureMessage('Error boundary reset', {
        extra: {
          action: 'reset',
          boundaryName: name,
          previousError: this.state.error?.message,
        },
        level: 'info',
      });
    }

    // Reset state
    this.setState({
      error: null,
      errorInfo: null,
      hasError: false,
    });

    // Call optional reset callback
    onReset?.();
  };
}

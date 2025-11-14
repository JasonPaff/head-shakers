'use client';

import type { ErrorInfo, ReactNode } from 'react';

import * as Sentry from '@sentry/nextjs';
import { AlertCircleIcon, RefreshCwIcon, SkipForwardIcon } from 'lucide-react';
import { Component } from 'react';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';

type PhotoErrorType = 'network' | 'permission' | 'storage' | 'unknown' | 'validation';

interface PhotoManagementErrorBoundaryProps {
  children: ReactNode;
  onContinueWithoutPhotos?: () => void;
  onReset?: () => void;
}

interface PhotoManagementErrorBoundaryState {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  hasError: boolean;
}

export class PhotoManagementErrorBoundary extends Component<
  PhotoManagementErrorBoundaryProps,
  PhotoManagementErrorBoundaryState
> {
  constructor(props: PhotoManagementErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null,
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<PhotoManagementErrorBoundaryState> {
    return {
      error,
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // log error to Sentry with component stack trace
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      extra: {
        componentStack: errorInfo.componentStack,
        errorBoundary: 'PhotoManagementErrorBoundary',
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack,
        errorType: this.getErrorType(error),
      },
      level: 'error',
      tags: {
        component: 'photo-management',
        errorBoundary: 'true',
      },
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const errorType = this.getErrorType(this.state.error);
      const userFriendlyMessage = this.getUserFriendlyMessage(errorType);
      const recoverySuggestions = this.getRecoverySuggestions(errorType);

      // derived variables for conditional rendering
      const _isDevelopmentMode = process.env.NODE_ENV === 'development';
      const _shouldShowDevDetails = _isDevelopmentMode && this.state.errorInfo;

      return (
        <Card className={'border-destructive'}>
          <CardHeader>
            <div className={'flex items-center gap-3'}>
              <div
                className={'flex size-10 items-center justify-center rounded-xl bg-destructive/10 shadow-sm'}
              >
                <AlertCircleIcon aria-hidden className={'size-5 text-destructive'} />
              </div>
              <div>
                <CardTitle className={'text-xl font-semibold text-destructive'}>
                  Photo Management Error
                </CardTitle>
                <CardDescription>Unable to load or manage photos at this time</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className={'space-y-4'}>
            {/* Error Message */}
            <Alert variant={'error'}>
              <div className={'space-y-2'}>
                <div className={'font-semibold'}>{userFriendlyMessage}</div>
                <div className={'text-sm text-muted-foreground'}>
                  Error details: {this.state.error.name} - {this.state.error.message}
                </div>
              </div>
            </Alert>

            {/* Recovery Suggestions */}
            <div className={'space-y-2'}>
              <div className={'text-sm font-medium'}>What you can do:</div>
              <ul className={'ml-5 space-y-1 text-sm text-muted-foreground'}>
                {recoverySuggestions.map((suggestion, index) => (
                  <li className={'list-disc'} key={index}>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className={'flex flex-col gap-2 sm:flex-row'}>
              <Button
                className={'flex items-center gap-2'}
                onClick={this.handleRetry}
                type={'button'}
                variant={'default'}
              >
                <RefreshCwIcon aria-hidden className={'size-4'} />
                Retry Photo Management
              </Button>
              <Button
                className={'flex items-center gap-2'}
                onClick={this.handleContinueWithoutPhotos}
                type={'button'}
                variant={'outline'}
              >
                <SkipForwardIcon aria-hidden className={'size-4'} />
                Continue Without Photos
              </Button>
            </div>

            {/* Development Error Details */}
            <Conditional isCondition={_shouldShowDevDetails && !!this.state.errorInfo}>
              <details className={'mt-4 rounded-md border bg-muted p-4 text-xs'}>
                <summary className={'cursor-pointer font-semibold'}>Developer Details</summary>
                <div className={'mt-2 space-y-2'}>
                  <div>
                    <strong>Error Type:</strong> {errorType}
                  </div>
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className={'mt-1 overflow-auto rounded bg-background p-2'}>
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                  <div>
                    <strong>Error Stack:</strong>
                    <pre className={'mt-1 overflow-auto rounded bg-background p-2'}>
                      {this.state.error.stack}
                    </pre>
                  </div>
                </div>
              </details>
            </Conditional>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }

  private getErrorType(error: Error): PhotoErrorType {
    const errorMessage = error.message.toLowerCase();

    if (
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('timeout')
    ) {
      return 'network';
    }

    if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
      return 'permission';
    }

    if (errorMessage.includes('storage') || errorMessage.includes('quota')) {
      return 'storage';
    }

    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return 'validation';
    }

    return 'unknown';
  }

  private getRecoverySuggestions(errorType: PhotoErrorType): Array<string> {
    switch (errorType) {
      case 'network':
        return [
          'Check your internet connection',
          'Try refreshing the page',
          'Wait a few moments and retry',
          'Continue editing without photos',
        ];
      case 'permission':
        return [
          'Verify you are logged in',
          'Contact support for permission issues',
          'Try logging out and back in',
          'Continue editing without photos',
        ];
      case 'storage':
        return [
          'Delete existing photos to free up space',
          'Contact support to increase storage',
          'Continue editing without photos',
        ];
      case 'validation':
        return [
          'Ensure photos are in supported formats (JPG, PNG, WebP)',
          'Check that photo files are under 10MB',
          'Verify photo dimensions are valid',
          'Continue editing without photos',
        ];
      case 'unknown':
      default:
        return [
          'Try refreshing the page',
          'Contact support if the issue persists',
          'Continue editing without photos',
        ];
    }
  }

  private getUserFriendlyMessage(errorType: PhotoErrorType): string {
    switch (errorType) {
      case 'network':
        return 'Unable to connect to photo services. Please check your internet connection and try again.';
      case 'permission':
        return 'You do not have permission to access photo management. Please contact support if this persists.';
      case 'storage':
        return 'Storage quota exceeded. Please delete some photos or contact support to increase your storage limit.';
      case 'validation':
        return 'Photo validation failed. Please ensure your photos meet the required format and size requirements.';
      case 'unknown':
      default:
        return 'An unexpected error occurred while managing photos. You can continue editing other fields.';
    }
  }

  private handleContinueWithoutPhotos = (): void => {
    // reset error state
    this.setState({
      error: null,
      errorInfo: null,
      hasError: false,
    });

    // call optional continue callback
    this.props.onContinueWithoutPhotos?.();

    // log continue action to Sentry
    Sentry.captureMessage('User continued editing without photos', {
      extra: {
        action: 'continue-without-photos',
        previousError: this.state.error?.message,
      },
      level: 'info',
    });
  };

  private handleRetry = (): void => {
    // reset error state
    this.setState({
      error: null,
      errorInfo: null,
      hasError: false,
    });

    // call optional reset callback
    this.props.onReset?.();

    // log retry attempt to Sentry
    Sentry.captureMessage('Photo management error boundary reset', {
      extra: {
        action: 'retry',
        previousError: this.state.error?.message,
      },
      level: 'info',
    });
  };
}

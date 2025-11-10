'use client';

import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export default function BrowseErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Browse page error:', error);
  }, [error]);

  return (
    <div className={'container mx-auto space-y-6 py-8'}>
      <div className={'space-y-2'}>
        <h1 className={'text-3xl font-bold tracking-tight'}>Browse Collections</h1>
      </div>

      <EmptyState
        action={
          <Button onClick={reset} variant={'default'}>
            Try Again
          </Button>
        }
        description={
          error.message || 'An unexpected error occurred while loading collections. Please try again later.'
        }
        icon={AlertCircle}
        title={'Something Went Wrong'}
      />
    </div>
  );
}

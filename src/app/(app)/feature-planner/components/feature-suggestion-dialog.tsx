'use client';

import type { ComponentProps } from 'react';

import { ClipboardCopyIcon, Lightbulb, Loader2Icon, XIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Fragment } from 'react';
import { toast } from 'sonner';

import type { SuggestionResult } from '@/lib/validations/feature-planner.validation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface FeatureSuggestionDialogProps extends Omit<ComponentProps<'div'>, 'onError'> {
  error?: null | string;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  suggestions: Array<SuggestionResult> | null;
}

export const FeatureSuggestionDialog = ({
  className,
  error,
  isLoading,
  isOpen,
  onClose,
  suggestions,
  ...props
}: FeatureSuggestionDialogProps) => {
  const dialogTestId = generateTestId('feature', 'dialog');
  const [copiedIndex, setCopiedIndex] = useState<null | number>(null);

  // Derived state for conditional rendering
  const _hasSuggestions = !isLoading && !error && suggestions && suggestions.length > 0;
  const _hasImplementationConsiderations = (suggestion: SuggestionResult) =>
    !!suggestion.implementationConsiderations && suggestion.implementationConsiderations.length > 0;
  const _hasNoSuggestions = !isLoading && !error && (!suggestions || suggestions.length === 0);

  const handleCopyToClipboard = useCallback(async (suggestion: SuggestionResult, index: number) => {
    const formattedText = `
# ${suggestion.title}

## Rationale
${suggestion.rationale}

## Description
${suggestion.description}

${
  suggestion.implementationConsiderations?.length ?
    `## Implementation Considerations
${suggestion.implementationConsiderations.map((item, i) => `${i + 1}. ${item}`).join('\n')}`
  : ''
}
      `.trim();

    try {
      await navigator.clipboard.writeText(formattedText);
      setCopiedIndex(index);
      toast.success('Copied to clipboard');
      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to copy to clipboard';
      toast.error(errorMessage);
    }
  }, []);

  const handleCopyAll = useCallback(async () => {
    if (!suggestions) return;

    const allSuggestions = suggestions
      .map((suggestion, idx) =>
        `
# Suggestion ${idx + 1}: ${suggestion.title}

## Rationale
${suggestion.rationale}

## Description
${suggestion.description}

${
  suggestion.implementationConsiderations?.length ?
    `## Implementation Considerations
${suggestion.implementationConsiderations.map((item, i) => `${i + 1}. ${item}`).join('\n')}`
  : ''
}

---
      `.trim(),
      )
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(allSuggestions);
      toast.success('All suggestions copied to clipboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to copy suggestions';
      toast.error(errorMessage);
    }
  }, [suggestions]);

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent
        className={cn('flex max-h-[90vh] max-w-4xl flex-col', className)}
        data-testid={dialogTestId}
        {...props}
      >
        <DialogHeader>
          <DialogTitle className={'flex items-center gap-2'}>
            <Lightbulb aria-hidden className={'size-5 text-primary'} />
            AI Feature Suggestions
          </DialogTitle>
          <DialogDescription>
            AI-generated feature ideas based on your context. Review and use these suggestions to enhance your
            planning.
          </DialogDescription>
        </DialogHeader>

        <div className={'flex-1 space-y-4 overflow-y-auto'}>
          {/* Loading State */}
          <Conditional isCondition={isLoading}>
            <Card>
              <CardHeader>
                <CardTitle className={'flex items-center gap-2'}>
                  <Loader2Icon aria-hidden className={'size-5 animate-spin text-primary'} />
                  Generating Suggestions...
                </CardTitle>
                <CardDescription>
                  AI is analyzing your request and generating feature suggestions. This may take a moment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={'space-y-3'}>
                  <div className={'flex items-center gap-2'}>
                    <div className={'size-2 animate-pulse rounded-full bg-blue-500'} />
                    <p className={'text-sm text-muted-foreground'}>Analyzing context...</p>
                  </div>
                  <div className={'flex items-center gap-2'}>
                    <div className={'size-2 animate-pulse rounded-full bg-blue-500'} />
                    <p className={'text-sm text-muted-foreground'}>Generating suggestions...</p>
                  </div>
                  <div className={'flex items-center gap-2'}>
                    <div className={'size-2 animate-pulse rounded-full bg-blue-500'} />
                    <p className={'text-sm text-muted-foreground'}>Processing results...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Conditional>

          {/* Error State */}
          <Conditional isCondition={!isLoading && !!error}>
            <Card className={'border-red-200 bg-red-50'}>
              <CardHeader>
                <CardTitle className={'text-red-900'}>Error Generating Suggestions</CardTitle>
                <CardDescription className={'text-red-700'}>
                  {error || 'An unexpected error occurred while generating suggestions.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={onClose} size={'sm'} variant={'outline'}>
                  Close
                </Button>
              </CardContent>
            </Card>
          </Conditional>

          {/* Success State with Suggestions */}
          <Conditional isCondition={_hasSuggestions}>
            <div className={'space-y-4'}>
              <div className={'flex items-center justify-between'}>
                <div className={'flex items-center gap-2'}>
                  <Badge className={'text-xs'} variant={'secondary'}>
                    {suggestions?.length || 0} {suggestions?.length === 1 ? 'Suggestion' : 'Suggestions'}
                  </Badge>
                </div>
                <Button onClick={handleCopyAll} size={'sm'} variant={'outline'}>
                  <ClipboardCopyIcon aria-hidden className={'mr-2 size-4'} />
                  Copy All
                </Button>
              </div>

              <Separator />

              {suggestions?.map((suggestion, index) => (
                <Card className={'relative'} key={index}>
                  <CardHeader>
                    <div className={'flex items-start justify-between gap-4'}>
                      <div className={'flex-1'}>
                        <CardTitle className={'text-lg'}>
                          <span className={'text-muted-foreground'}>#{index + 1}</span> {suggestion.title}
                        </CardTitle>
                      </div>
                      <Button
                        onClick={() => {
                          void handleCopyToClipboard(suggestion, index);
                        }}
                        size={'sm'}
                        variant={copiedIndex === index ? 'secondary' : 'ghost'}
                      >
                        {copiedIndex === index ?
                          <Fragment>
                            <ClipboardCopyIcon aria-hidden className={'mr-2 size-4'} />
                            Copied!
                          </Fragment>
                        : <Fragment>
                            <ClipboardCopyIcon aria-hidden className={'mr-2 size-4'} />
                            Copy
                          </Fragment>
                        }
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className={'space-y-4'}>
                    {/* Rationale */}
                    <div className={'space-y-2'}>
                      <h4 className={'text-sm font-semibold text-muted-foreground'}>Rationale</h4>
                      <p className={'text-sm leading-relaxed'}>{suggestion.rationale}</p>
                    </div>

                    <Separator />

                    {/* Description */}
                    <div className={'space-y-2'}>
                      <h4 className={'text-sm font-semibold text-muted-foreground'}>Description</h4>
                      <p className={'text-sm leading-relaxed'}>{suggestion.description}</p>
                    </div>

                    {/* Implementation Considerations */}
                    <Conditional isCondition={_hasImplementationConsiderations(suggestion)}>
                      <Separator />
                      <div className={'space-y-2'}>
                        <h4 className={'text-sm font-semibold text-muted-foreground'}>
                          Implementation Considerations
                        </h4>
                        <ul className={'space-y-2 pl-4'}>
                          {suggestion.implementationConsiderations?.map((consideration, idx) => (
                            <li className={'list-disc text-sm leading-relaxed'} key={idx}>
                              {consideration}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Conditional>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Conditional>

          {/* Empty State */}
          <Conditional isCondition={_hasNoSuggestions}>
            <Card>
              <CardHeader>
                <CardTitle>No Suggestions Available</CardTitle>
                <CardDescription>
                  No feature suggestions were generated. Try adjusting your parameters and try again.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={onClose} size={'sm'} variant={'outline'}>
                  Close
                </Button>
              </CardContent>
            </Card>
          </Conditional>
        </div>

        <DialogFooter>
          <Button onClick={onClose} size={'sm'} variant={'outline'}>
            <XIcon aria-hidden className={'mr-2 size-4'} />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

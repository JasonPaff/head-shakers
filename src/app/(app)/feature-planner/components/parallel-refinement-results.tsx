'use client';

import { CheckCircle2, Sparkles } from 'lucide-react';
import { useState } from 'react';

import type { FeatureRefinement } from '@/lib/db/schema/feature-planner.schema';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/utils/tailwind-utils';

interface ParallelRefinementResultsProps {
  onSelectRefinement: (refinementId: string, refinedRequest: string) => void;
  onUseOriginal: () => void;
  refinements: FeatureRefinement[];
  selectedRefinementId?: string;
}

export const ParallelRefinementResults = ({
  onSelectRefinement,
  onUseOriginal,
  refinements,
  selectedRefinementId,
}: ParallelRefinementResultsProps) => {
  // eslint-disable-next-line react-snob/require-boolean-prefix-is
  const [activeTab, setActiveTab] = useState(refinements[0]?.agentId || '');

  const completedRefinements = refinements.filter((r) => r.status === 'completed' && r.refinedRequest);
  const failedRefinements = refinements.filter((r) => r.status === 'failed');
  const _hasCompletedRefinements = completedRefinements.length > 0;
  const _hasFailedRefinements = failedRefinements.length > 0;
  const _hasAnyResults = _hasCompletedRefinements || _hasFailedRefinements;

  if (!_hasAnyResults) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing Refinements...</CardTitle>
          <CardDescription>Please wait while agents refine your request</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const _failureMessage =
    failedRefinements.length > 0 ? ` (${failedRefinements.length} failed)` : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className={'flex items-center gap-2'}>
          <Sparkles className={'size-5'} />
          Parallel Refinement Results
        </CardTitle>
        <CardDescription>
          {completedRefinements.length} of {refinements.length} refinements completed successfully
          {_failureMessage}
        </CardDescription>
      </CardHeader>
      <CardContent className={'space-y-4'}>
        {_hasCompletedRefinements && (
          <Tabs onValueChange={setActiveTab} value={activeTab}>
            <TabsList
              className={'grid w-full'}
              style={{ gridTemplateColumns: `repeat(${completedRefinements.length}, 1fr)` }}
            >
              {completedRefinements.map((refinement) => (
                <TabsTrigger key={refinement.id} value={refinement.agentId}>
                  {refinement.agentId}
                  {selectedRefinementId === refinement.id && (
                    <CheckCircle2 className={'ml-1 size-3 text-green-500'} />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {completedRefinements.map((refinement) => {
              const _hasValidationErrors =
                refinement.validationErrors && refinement.validationErrors.length > 0;
              const _isSelected = selectedRefinementId === refinement.id;

              return (
                <TabsContent className={'space-y-4'} key={refinement.id} value={refinement.agentId}>
                  {/* Metadata */}
                  <div className={'flex items-center gap-2 text-sm'}>
                    <Badge variant={'secondary'}>
                      {refinement.wordCount} word{refinement.wordCount !== 1 ? 's' : ''}
                    </Badge>
                    <Badge variant={'outline'}>
                      {refinement.executionTimeMs ? `${Math.round(refinement.executionTimeMs / 1000)}s` : 'N/A'}
                    </Badge>
                    {refinement.totalTokens && (
                      <Badge variant={'outline'}>{refinement.totalTokens.toLocaleString()} tokens</Badge>
                    )}
                    {_isSelected && (
                      <Badge className={'bg-green-500'}>
                        <CheckCircle2 className={'mr-1 size-3'} />
                        Selected
                      </Badge>
                    )}
                  </div>

                  {/* Refined Request */}
                  <div className={'rounded-lg border bg-muted/50 p-4'}>
                    <p className={'text-sm leading-relaxed whitespace-pre-wrap'}>{refinement.refinedRequest}</p>
                  </div>

                  {/* Validation Errors */}
                  {_hasValidationErrors && (
                    <div className={'rounded-lg border border-yellow-200 bg-yellow-50 p-3'}>
                      <p className={'text-sm font-medium text-yellow-900'}>Validation Issues:</p>
                      <ul className={'mt-1 list-inside list-disc text-sm text-yellow-800'}>
                        {refinement.validationErrors!.map((error, index) => (
                          <li key={index}>{error.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className={'flex gap-2'}>
                    <Button
                      className={cn(_isSelected && 'bg-green-600 hover:bg-green-700')}
                      onClick={() => {
                        if (refinement.refinedRequest) {
                          onSelectRefinement(refinement.id, refinement.refinedRequest);
                        }
                      }}
                      size={'sm'}
                    >
                      {_isSelected ?
                        <>
                          <CheckCircle2 className={'mr-1 size-4'} />
                          Selected
                        </>
                      : 'Use This Refinement'}
                    </Button>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        )}

        {/* Failed Refinements */}
        {_hasFailedRefinements && (
          <div className={'space-y-2'}>
            <p className={'text-sm font-medium text-destructive'}>Failed Refinements:</p>
            {failedRefinements.map((refinement) => (
              <div className={'rounded-lg border border-red-200 bg-red-50 p-3'} key={refinement.id}>
                <p className={'text-sm font-medium text-red-900'}>{refinement.agentId}</p>
                <p className={'text-xs text-red-700'}>{refinement.errorMessage || 'Unknown error'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Use Original Option */}
        <div className={'border-t pt-4'}>
          <Button onClick={onUseOriginal} size={'sm'} variant={'outline'}>
            Use Original Request Instead
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

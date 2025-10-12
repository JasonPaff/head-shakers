'use client';

import { CheckCircle2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useCallback, useState } from 'react';

import type { FeatureRefinement } from '@/lib/db/schema/feature-planner.schema';

import { RefinementCard } from '@/app/(app)/feature-planner/components/refinement/refinement-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RefinementResultsProps {
  isSelectingRefinement: boolean;
  onProceedToNextStep: () => void;
  onSelectRefinement: (refinementId: string, refinedRequest: string) => void;
  onUseOriginal: () => void;
  originalRequest: string;
  refinements: Array<FeatureRefinement>;
  selectedRefinementId?: string;
}

export const RefinementResults = ({
  isSelectingRefinement,
  onProceedToNextStep,
  onSelectRefinement,
  onUseOriginal,
  originalRequest,
  refinements,
  selectedRefinementId,
}: RefinementResultsProps) => {
  // useState hooks
  const [activeTab, setActiveTab] = useState(refinements[0]?.agentId || '');
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
  const [isOriginalCollapsed, setIsOriginalCollapsed] = useState(false);

  // Event handlers
  const handleEditedTextChange = useCallback((refinementId: string, text: string) => {
    setEditedTexts((prev) => ({
      ...prev,
      [refinementId]: text,
    }));
  }, []);

  const handleResetEdit = useCallback((refinementId: string) => {
    setEditedTexts((prev) => {
      const updated = { ...prev };
      delete updated[refinementId];
      return updated;
    });
  }, []);

  const handleOriginalToggle = useCallback(() => {
    setIsOriginalCollapsed((prev) => !prev);
  }, []);

  // Derived variables
  const _completedRefinements = refinements.filter((r) => r.status === 'completed' && r.refinedRequest);
  const _failedRefinements = refinements.filter((r) => r.status === 'failed');
  const _isRefinementsCompleted = _completedRefinements.length > 0;
  const _isRefinementsFailed = _failedRefinements.length > 0;
  const _isAnyResultsPresent = _isRefinementsCompleted || _isRefinementsFailed;
  const _isSingleRefinement = _completedRefinements.length === 1;
  const _isSelectionMade = !!selectedRefinementId;
  const _failureMessage = _failedRefinements.length > 0 ? ` (${_failedRefinements.length} failed)` : '';

  if (!_isAnyResultsPresent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing Refinements...</CardTitle>
          <CardDescription>Please wait while agents refine your request</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      {/* Header Section */}
      <CardHeader>
        <CardTitle className={'flex items-center gap-2'}>
          <Sparkles aria-hidden className={'size-5'} />
          {_isSingleRefinement ? 'Refinement Complete' : 'Parallel Refinement Results'}
        </CardTitle>
        <CardDescription>
          {_completedRefinements.length} of {refinements.length} refinement
          {refinements.length !== 1 ? 's' : ''} completed successfully
          {_failureMessage}
        </CardDescription>
      </CardHeader>

      <CardContent className={'space-y-4'}>
        {/* Original Request Section */}
        <div className={'space-y-2'}>
          <button
            className={'flex w-full items-center justify-between text-left'}
            onClick={handleOriginalToggle}
            type={'button'}
          >
            <span className={'text-sm font-medium text-muted-foreground'}>Original Request</span>
            {isOriginalCollapsed ?
              <ChevronDown aria-hidden className={'size-4 text-muted-foreground'} />
            : <ChevronUp aria-hidden className={'size-4 text-muted-foreground'} />}
          </button>

          <Conditional isCondition={!isOriginalCollapsed}>
            <div className={'rounded-md bg-muted p-3'}>
              <p className={'text-sm'}>{originalRequest}</p>
            </div>
          </Conditional>
        </div>

        <Separator />

        {/* Refinement Results Section */}
        <Conditional isCondition={_isRefinementsCompleted}>
          <Conditional
            fallback={
              <RefinementCard
                editedTexts={editedTexts}
                isSelectingRefinement={isSelectingRefinement}
                key={_completedRefinements[0]!.id}
                onEditedTextChange={handleEditedTextChange}
                onProceedToNextStep={onProceedToNextStep}
                onResetEdit={handleResetEdit}
                refinement={_completedRefinements[0]!}
                selectedRefinementId={selectedRefinementId}
              />
            }
            isCondition={!_isSingleRefinement}
          >
            <Tabs onValueChange={setActiveTab} value={activeTab}>
              <TabsList
                className={'grid w-full'}
                style={{ gridTemplateColumns: `repeat(${_completedRefinements.length}, 1fr)` }}
              >
                {_completedRefinements.map((refinement) => (
                  <TabsTrigger key={refinement.id} value={refinement.agentId}>
                    {refinement.agentId}
                    {selectedRefinementId === refinement.id && (
                      <CheckCircle2 aria-hidden className={'ml-1 size-3 text-green-500'} />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {_completedRefinements.map((refinement) => (
                <TabsContent key={refinement.id} value={refinement.agentId}>
                  <RefinementCard
                    editedTexts={editedTexts}
                    isSelectingRefinement={isSelectingRefinement}
                    onEditedTextChange={handleEditedTextChange}
                    onProceedToNextStep={onProceedToNextStep}
                    onResetEdit={handleResetEdit}
                    onSelectRefinement={onSelectRefinement}
                    refinement={refinement}
                    selectedRefinementId={selectedRefinementId}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </Conditional>
        </Conditional>

        {/* Failed Refinements Section */}
        <Conditional isCondition={_isRefinementsFailed}>
          <div className={'space-y-2'}>
            <p className={'text-sm font-medium text-destructive'}>Failed Refinements:</p>
            {_failedRefinements.map((refinement) => (
              <div className={'rounded-lg border border-red-200 bg-red-50 p-3'} key={refinement.id}>
                <p className={'text-sm font-medium text-red-900'}>{refinement.agentId}</p>
                <p className={'text-xs text-red-700'}>{refinement.errorMessage || 'Unknown error'}</p>
              </div>
            ))}
          </div>
        </Conditional>

        {/* Use Original Option Section */}
        <Conditional isCondition={_isSelectionMade || !_isSingleRefinement}>
          <div className={'border-t pt-4'}>
            <Button onClick={onUseOriginal} size={'sm'} variant={'outline'}>
              Use Original Request Instead
            </Button>
          </div>
        </Conditional>
      </CardContent>
    </Card>
  );
};

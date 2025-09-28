'use client';


import { AlertCircleIcon, CheckCircle2Icon, ClockIcon, SparklesIcon, TrophyIcon } from 'lucide-react';

import type { ComponentTestIdProps } from '@/lib/test-ids';
import type { RefinementResult } from '@/lib/validations/feature-planner.validation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface RefinementComparisonProps extends ComponentTestIdProps {
  className?: string;
  onSelectRefinement: (agentId: string) => void;
  onUseOriginal: () => void;
  originalRequest: string;
  results: RefinementResult[];
  selectedAgentId: null | string;
}

export const RefinementComparison = ({
  className,
  onSelectRefinement,
  onUseOriginal,
  originalRequest,
  results,
  selectedAgentId,
  testId,
}: RefinementComparisonProps) => {
  const comparisonTestId = testId || generateTestId('feature', 'card');

  const successfulResults = results.filter((r) => r.isSuccess);
  const failedResults = results.filter((r) => !r.isSuccess);

  const getBestResult = (): null | RefinementResult => {
    if (successfulResults.length === 0) return null;

    // Sort by word count (closer to ideal range of 100-250 words gets higher score)
    return successfulResults.reduce((best, current) => {
      const currentScore = getQualityScore(current);
      const bestScore = getQualityScore(best);
      return currentScore > bestScore ? current : best;
    });
  };

  const getQualityScore = (result: RefinementResult): number => {
    if (!result.isSuccess) return 0;

    let score = 100;

    // Word count score (ideal range: 100-250 words)
    if (result.wordCount >= 100 && result.wordCount <= 250) {
      score += 50;
    } else if (result.wordCount < 100) {
      score -= (100 - result.wordCount) * 0.5;
    } else {
      score -= (result.wordCount - 250) * 0.3;
    }

    // Execution time bonus (faster is better, but not too fast)
    if (result.executionTimeMs >= 5000 && result.executionTimeMs <= 20000) {
      score += 20;
    } else if (result.executionTimeMs < 5000) {
      score -= 10; // Too fast might indicate poor quality
    }

    return Math.max(0, score);
  };

  const bestResult = getBestResult();

  const getResultVariant = (result: RefinementResult): 'default' | 'destructive' | 'secondary' => {
    if (!result.isSuccess) return 'destructive';
    if (result === bestResult) return 'default';
    return 'secondary';
  };

  const getExecutionTimeBadgeVariant = (timeMs: number): 'default' | 'destructive' | 'secondary' => {
    if (timeMs <= 15000) return 'default';
    if (timeMs <= 30000) return 'secondary';
    return 'destructive';
  };

  const getAgentTypeName = (index: number): string => {
    const agentTypes = [
      'Frontend',
      'Backend',
      'Full-stack',
      'Performance',
      'Security'
    ];
    return agentTypes[index] || `Agent ${index + 1}`;
  };

  return (
    <div className={cn('space-y-6', className)} data-testid={comparisonTestId}>
      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <SparklesIcon aria-hidden className={'size-5 text-primary'} />
            Refinement Results Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className={'space-y-6'}>
          {/* Summary Stats */}
          <div className={'grid grid-cols-2 gap-4 md:grid-cols-4'}>
            <div className={'text-center'}>
              <div className={'text-2xl font-bold text-green-600'}>{successfulResults.length}</div>
              <div className={'text-sm text-muted-foreground'}>Successful</div>
            </div>
            <div className={'text-center'}>
              <div className={'text-2xl font-bold text-destructive'}>{failedResults.length}</div>
              <div className={'text-sm text-muted-foreground'}>Failed</div>
            </div>
            <div className={'text-center'}>
              <div className={'text-2xl font-bold'}>
                {successfulResults.length > 0
                  ? Math.round(successfulResults.reduce((sum, r) => sum + r.wordCount, 0) / successfulResults.length)
                  : 0}
              </div>
              <div className={'text-sm text-muted-foreground'}>Avg Words</div>
            </div>
            <div className={'text-center'}>
              <div className={'text-2xl font-bold'}>
                {successfulResults.length > 0
                  ? Math.round(successfulResults.reduce((sum, r) => sum + r.executionTimeMs, 0) / successfulResults.length / 1000)
                  : 0}s
              </div>
              <div className={'text-sm text-muted-foreground'}>Avg Time</div>
            </div>
          </div>

          <Separator />

          {/* Selection Interface */}
          <div className={'space-y-4'}>
            <Label className={'text-base font-medium'}>Choose the best refinement:</Label>

            {/* Horizontal Layout for Refinements */}
            <div className={'grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3'}>
              {/* Original Option */}
              <Card className={cn('h-fit cursor-pointer transition-colors', {
                'border-primary ring-1 ring-primary': selectedAgentId === 'original',
              })} onClick={() => onSelectRefinement('original')}>
                <CardContent className={'p-4'}>
                  <div className={'mb-2 flex items-center justify-between'}>
                    <Label className={'cursor-pointer font-medium'}>Original Request</Label>
                    <Badge variant={'outline'}>No processing</Badge>
                  </div>
                  <p className={'mb-2 text-xs text-muted-foreground'}>
                    Use the original request without any AI refinement.
                  </p>
                  <div className={'min-h-[120px] overflow-auto rounded-md bg-muted p-3 text-sm'}>
                    {originalRequest}
                  </div>
                </CardContent>
              </Card>

              {/* Successful Results */}
              {successfulResults.map((result, index) => (
                <Card className={cn('h-fit cursor-pointer transition-colors', {
                  'border-primary ring-1 ring-primary': selectedAgentId === result.agentId,
                  'border-yellow-500 ring-1 ring-yellow-500': result === bestResult && selectedAgentId !== result.agentId,
                })} key={result.agentId} onClick={() => onSelectRefinement(result.agentId)}>
                  <CardContent className={'p-4'}>
                    <div className={'mb-2 flex items-center justify-between'}>
                      <Label className={'cursor-pointer text-sm font-medium'}>
                        {getAgentTypeName(index)} ({index + 1})
                        <Conditional isCondition={result === bestResult}>
                          <TrophyIcon aria-hidden className={'ml-1 inline size-4 text-yellow-500'} />
                        </Conditional>
                      </Label>
                      <div className={'flex gap-1'}>
                        <Badge className={"px-1 py-0 text-xs"} variant={getResultVariant(result)}>
                          <CheckCircle2Icon aria-hidden className={'mr-1 size-3'} />
                          Success
                        </Badge>
                        <Conditional isCondition={result === bestResult}>
                          <Badge className={"px-1 py-0 text-xs"} variant={'default'}>Best</Badge>
                        </Conditional>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className={'mb-3 flex flex-wrap gap-2 text-xs'}>
                      <Badge className={"px-1 py-0 text-xs"} variant={'secondary'}>
                        {result.wordCount}w
                      </Badge>
                      <Badge className={"px-1 py-0 text-xs"} variant={getExecutionTimeBadgeVariant(result.executionTimeMs)}>
                        <ClockIcon aria-hidden className={'mr-1 size-3'} />
                        {Math.round(result.executionTimeMs / 1000)}s
                      </Badge>
                      <Badge className={"px-1 py-0 text-xs"} variant={'outline'}>
                        {Math.round(getQualityScore(result))}
                      </Badge>
                    </div>

                    {/* Refined Content */}
                    <div className={'min-h-[120px] overflow-auto rounded-md border border-green-200 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-950'}>
                      {result.refinedRequest}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Failed Results */}
              {failedResults.map((result, index) => (
                <Card className={'h-fit opacity-60'} key={result.agentId}>
                  <CardContent className={'p-4'}>
                    <div className={'mb-2 flex items-center justify-between'}>
                      <Label className={'text-sm font-medium text-muted-foreground'}>
                        {getAgentTypeName(successfulResults.length + index)} ({successfulResults.length + index + 1})
                      </Label>
                      <Badge className={"px-1 py-0 text-xs"} variant={'destructive'}>
                        <AlertCircleIcon aria-hidden className={'mr-1 size-3'} />
                        Failed
                      </Badge>
                    </div>

                    <div className={'mb-3 flex gap-2 text-xs'}>
                      <Badge className={"px-1 py-0 text-xs"} variant={getExecutionTimeBadgeVariant(result.executionTimeMs)}>
                        <ClockIcon aria-hidden className={'mr-1 size-3'} />
                        {Math.round(result.executionTimeMs / 1000)}s
                      </Badge>
                    </div>

                    <div className={'min-h-[120px] overflow-auto rounded-md border border-destructive bg-destructive/5 p-3 text-sm'}>
                      <span className={'font-medium text-destructive'}>Error:</span> {result.error}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className={'flex gap-3'}>
            <Button
              className={'flex-1'}
              disabled={!selectedAgentId}
              onClick={() => {
                if (selectedAgentId === 'original') {
                  onUseOriginal();
                } else if (selectedAgentId) {
                  onSelectRefinement(selectedAgentId);
                }
              }}
              size={'lg'}
            >
              Use Selected Refinement
            </Button>

            <Conditional isCondition={bestResult !== null}>
              <Button
                onClick={() => {
                  if (bestResult) {
                    onSelectRefinement(bestResult.agentId);
                  }
                }}
                size={'lg'}
                variant={'outline'}
              >
                <TrophyIcon aria-hidden className={'mr-2 size-4'} />
                Use Best Quality
              </Button>
            </Conditional>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
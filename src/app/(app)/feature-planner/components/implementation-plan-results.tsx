'use client';

import { AlertCircle, CheckCircle2, ClipboardList, Download } from 'lucide-react';

import type { ImplementationPlanGeneration } from '@/lib/db/schema/feature-planner.schema';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/utils/tailwind-utils';

interface ImplementationPlanResultsProps {
  generation: ImplementationPlanGeneration | null;
  onExportPlan?: () => void;
  onGeneratePlan: () => void;
}

export const ImplementationPlanResults = ({
  generation,
  onExportPlan,
  onGeneratePlan,
}: ImplementationPlanResultsProps) => {
  if (!generation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <ClipboardList className={'size-5'} />
            Implementation Plan
          </CardTitle>
          <CardDescription>Generate a detailed implementation plan for your feature</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onGeneratePlan}>
            <ClipboardList className={'mr-2 size-4'} />
            Generate Implementation Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getComplexityColor = (complexity: null | string) => {
    switch (complexity) {
      case 'high':
        return 'bg-red-500';
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskColor = (risk: null | string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-500';
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className={'flex items-center gap-2'}>
          <ClipboardList className={'size-5'} />
          Implementation Plan
        </CardTitle>
        <CardDescription>
          Generated in{' '}
          {generation.executionTimeMs ? `${Math.round(generation.executionTimeMs / 1000)}s` : 'N/A'}
        </CardDescription>
      </CardHeader>
      <CardContent className={'space-y-6'}>
        {/* Summary Metrics */}
        <div className={'grid grid-cols-2 gap-4 sm:grid-cols-4'}>
          <div className={'rounded-lg border bg-muted/50 p-3'}>
            <p className={'text-sm font-medium text-muted-foreground'}>Complexity</p>
            <div className={'mt-1 flex items-center gap-2'}>
              <div className={cn('size-3 rounded-full', getComplexityColor(generation.complexity))} />
              <p className={'text-lg font-bold capitalize'}>{generation.complexity || 'N/A'}</p>
            </div>
          </div>

          <div className={'rounded-lg border bg-muted/50 p-3'}>
            <p className={'text-sm font-medium text-muted-foreground'}>Risk Level</p>
            <div className={'mt-1 flex items-center gap-2'}>
              <div className={cn('size-3 rounded-full', getRiskColor(generation.riskLevel))} />
              <p className={'text-lg font-bold capitalize'}>{generation.riskLevel || 'N/A'}</p>
            </div>
          </div>

          <div className={'rounded-lg border bg-muted/50 p-3'}>
            <p className={'text-sm font-medium text-muted-foreground'}>Steps</p>
            <p className={'text-lg font-bold'}>{generation.totalSteps}</p>
          </div>

          <div className={'rounded-lg border bg-muted/50 p-3'}>
            <p className={'text-sm font-medium text-muted-foreground'}>Duration</p>
            <p className={'text-lg font-bold'}>{generation.estimatedDuration || 'N/A'}</p>
          </div>
        </div>

        {/* Quality Indicators */}
        <div className={'flex flex-wrap items-center gap-2'}>
          {generation.isValidMarkdown ?
            <Badge className={'bg-green-500'}>
              <CheckCircle2 className={'mr-1 size-3'} />
              Valid Markdown
            </Badge>
          : <Badge variant={'destructive'}>
              <AlertCircle className={'mr-1 size-3'} />
              Invalid Markdown
            </Badge>
          }

          {generation.hasRequiredSections ?
            <Badge className={'bg-green-500'}>
              <CheckCircle2 className={'mr-1 size-3'} />
              Complete Sections
            </Badge>
          : <Badge variant={'destructive'}>
              <AlertCircle className={'mr-1 size-3'} />
              Missing Sections
            </Badge>
          }

          {generation.prerequisitesCount > 0 && (
            <Badge variant={'outline'}>{generation.prerequisitesCount} Prerequisites</Badge>
          )}

          {generation.qualityGatesCount > 0 && (
            <Badge variant={'outline'}>{generation.qualityGatesCount} Quality Gates</Badge>
          )}

          {generation.totalTokens && (
            <Badge variant={'outline'}>{generation.totalTokens.toLocaleString()} tokens</Badge>
          )}
        </div>

        {/* Validation Errors */}
        {(() => {
          const _hasValidationErrors = generation.validationErrors && generation.validationErrors.length > 0;
          return (
            _hasValidationErrors && (
              <div className={'rounded-lg border border-yellow-200 bg-yellow-50 p-4'}>
                <h4 className={'mb-2 flex items-center gap-2 font-medium text-yellow-900'}>
                  <AlertCircle className={'size-4'} />
                  Validation Issues
                </h4>
                <ul className={'list-inside list-disc space-y-1 text-sm text-yellow-800'}>
                  {generation.validationErrors!.map((error, index) => (
                    <li key={index}>
                      {error.field}: {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            )
          );
        })()}

        <Separator />

        {/* Implementation Plan Content */}
        {generation.implementationPlan && (
          <div className={'space-y-4'}>
            <div className={'flex items-center justify-between'}>
              <h3 className={'font-semibold'}>Implementation Plan</h3>
              {onExportPlan && (
                <Button onClick={onExportPlan} size={'sm'} variant={'outline'}>
                  <Download className={'mr-2 size-4'} />
                  Export Plan
                </Button>
              )}
            </div>

            {/* eslint-disable-next-line better-tailwindcss/no-unregistered-classes */}
            <div className={'prose prose-sm max-w-none rounded-lg border bg-muted/30 p-4'}>
              <div className={'font-mono text-sm whitespace-pre-wrap'}>{generation.implementationPlan}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={'flex gap-2 pt-4'}>
          <Button onClick={onGeneratePlan} variant={'outline'}>
            Regenerate Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

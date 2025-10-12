'use client';

import { AlertTriangleIcon, CheckCircle2Icon, ClockIcon, FileTextIcon, ListIcon } from 'lucide-react';

import {
  getComplexityColor,
  getRiskLevelColor,
} from '@/app/(app)/feature-planner/components/plan-viewer/plan-viewer-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { cn } from '@/utils/tailwind-utils';

interface PlanGeneration {
  complexity: null | string;
  estimatedDuration: null | string;
  refinedRequest: null | string;
  riskLevel: null | string;
}

interface PlanMetadataCardProps {
  planGeneration: PlanGeneration;
  totalSteps: number;
}

export const PlanMetadataCard = ({ planGeneration, totalSteps }: PlanMetadataCardProps) => {
  return (
    <Card>
      {/* Card Header */}
      <CardHeader>
        <CardTitle className={'flex items-center gap-2'}>
          <FileTextIcon aria-hidden className={'size-5 text-primary'} />
          Implementation Plan
        </CardTitle>
        <Conditional isCondition={!!planGeneration.refinedRequest}>
          <CardDescription>{planGeneration.refinedRequest}</CardDescription>
        </Conditional>
      </CardHeader>

      {/* Card Content */}
      <CardContent className={'space-y-4'}>
        {/* Metadata Grid */}
        <div className={'grid gap-4 sm:grid-cols-2 lg:grid-cols-4'}>
          {/* Estimated Duration */}
          <Conditional isCondition={!!planGeneration.estimatedDuration}>
            <div className={'flex items-start gap-2'}>
              <ClockIcon aria-hidden className={'mt-0.5 size-4 text-muted-foreground'} />
              <div>
                <p className={'text-sm font-medium'}>Duration</p>
                <p className={'text-sm text-muted-foreground'}>{planGeneration.estimatedDuration}</p>
              </div>
            </div>
          </Conditional>

          {/* Complexity */}
          <Conditional isCondition={!!planGeneration.complexity}>
            <div className={'flex items-start gap-2'}>
              <ListIcon aria-hidden className={'mt-0.5 size-4 text-muted-foreground'} />
              <div>
                <p className={'text-sm font-medium'}>Complexity</p>
                <p className={cn('text-sm capitalize', getComplexityColor(planGeneration.complexity))}>
                  {planGeneration.complexity?.replace('-', ' ')}
                </p>
              </div>
            </div>
          </Conditional>

          {/* Risk Level */}
          <Conditional isCondition={!!planGeneration.riskLevel}>
            <div className={'flex items-start gap-2'}>
              <AlertTriangleIcon aria-hidden className={'mt-0.5 size-4 text-muted-foreground'} />
              <div>
                <p className={'text-sm font-medium'}>Risk Level</p>
                <p className={cn('text-sm capitalize', getRiskLevelColor(planGeneration.riskLevel))}>
                  {planGeneration.riskLevel}
                </p>
              </div>
            </div>
          </Conditional>

          {/* Total Steps */}
          <div className={'flex items-start gap-2'}>
            <CheckCircle2Icon aria-hidden className={'mt-0.5 size-4 text-muted-foreground'} />
            <div>
              <p className={'text-sm font-medium'}>Total Steps</p>
              <p className={'text-sm text-muted-foreground'}>{totalSteps}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

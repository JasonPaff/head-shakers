'use client';

import { AlertTriangleIcon, FileTextIcon, ListIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { PlanMetadataCard } from '@/app/(app)/feature-planner/components/plan-viewer/plan-metadata-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';

import { PlanStepItem } from './plan-viewer/plan-step-item';

interface PlanGeneration {
  complexity: null | string;
  estimatedDuration: null | string;
  id: string;
  refinedRequest: null | string;
  riskLevel: null | string;
  status: string;
}

interface PlanStep {
  category: null | string;
  commands: Array<string> | null;
  confidenceLevel: null | string;
  description: null | string;
  displayOrder: number;
  estimatedDuration: null | string;
  id: string;
  stepNumber: number;
  title: string;
  validationCommands: Array<string> | null;
}

interface PlanViewerClientProps {
  planId: string;
}

/**
 * Client-side Plan Viewer Component
 * Fetches and displays generated implementation plans
 */
export const PlanViewerClient = ({ planId }: PlanViewerClientProps) => {
  // useState hooks
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [planGeneration, setPlanGeneration] = useState<null | PlanGeneration>(null);
  const [planSteps, setPlanSteps] = useState<Array<PlanStep>>([]);

  // useEffect hooks
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/feature-planner/${planId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch plan');
        }

        const data = (await response.json()) as {
          data?: {
            planGeneration?: PlanGeneration;
            planSteps?: Array<PlanStep>;
          };
          success: boolean;
        };

        if (data.data?.planGeneration) {
          setPlanGeneration(data.data.planGeneration);
        }

        if (data.data?.planSteps) {
          setPlanSteps(data.data.planSteps);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPlan();
  }, [planId]);

  // Derived variables
  const _hasSteps = planSteps.length > 0;

  // Loading State
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <FileTextIcon aria-hidden className={'size-5 text-primary'} />
            Loading Implementation Plan...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={'flex items-center gap-3 py-4'}>
            <div
              className={'size-5 animate-spin rounded-full border-2 border-primary border-t-transparent'}
            />
            <p className={'text-sm text-muted-foreground'}>Loading plan details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error State
  if (error) {
    return (
      <Card className={'border-destructive'}>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2 text-destructive'}>
            <AlertTriangleIcon aria-hidden className={'size-5'} />
            Error Loading Plan
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Empty State
  if (!planGeneration) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <FileTextIcon aria-hidden className={'size-5 text-muted-foreground'} />
            Plan Not Found
          </CardTitle>
          <CardDescription>
            No plan generation found. Please generate an implementation plan first.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className={'space-y-6'}>
      {/* Plan Metadata Section */}
      <PlanMetadataCard planGeneration={planGeneration} totalSteps={planSteps.length} />

      {/* Plan Steps Section */}
      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <ListIcon aria-hidden className={'size-5 text-primary'} />
            Implementation Steps
          </CardTitle>
          <CardDescription>Follow these steps to implement the feature</CardDescription>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          {/* Steps List */}
          <Conditional isCondition={!_hasSteps}>
            <div className={'rounded-lg bg-muted p-6 text-center'}>
              <p className={'text-sm text-muted-foreground'}>No steps found for this plan.</p>
            </div>
          </Conditional>

          <Conditional isCondition={_hasSteps}>
            <div className={'space-y-3'}>
              {planSteps.map((step, index) => (
                <PlanStepItem index={index} key={step.id} step={step} />
              ))}
            </div>
          </Conditional>
        </CardContent>
      </Card>
    </div>
  );
};

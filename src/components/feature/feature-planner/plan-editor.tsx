'use client';

import type { ComponentProps } from 'react';

import { EditIcon, PlusIcon, SaveIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

import type { PlanStep } from '@/lib/db/schema/feature-planner.schema';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { PlanStepCard } from '@/components/feature/feature-planner/plan-step-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createPlanStepAction,
  deletePlanStepAction,
  updatePlanStepAction,
} from '@/lib/actions/feature-planner/feature-planner.actions';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface PlanEditorProps extends ComponentProps<'div'>, ComponentTestIdProps {
  initialSteps: PlanStep[];
  planGenerationId: string;
}

/**
 * Plan Editor Component
 * Interactive editor component with state management and CRUD operations for plan steps
 */
export const PlanEditor = ({
  className,
  initialSteps,
  planGenerationId,
  testId,
  ...props
}: PlanEditorProps) => {
  const [steps, setSteps] = useState<PlanStep[]>(initialSteps);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const planEditorTestId = testId || generateTestId('ui', 'plan-editor', 'container');

  // Handle step update
  const handleUpdateStep = async (stepId: string, updates: Partial<PlanStep>) => {
    try {
      setIsDirty(true);

      // Optimistically update local state
      setSteps((prevSteps) => prevSteps.map((step) => (step.id === stepId ? { ...step, ...updates } : step)));

      // Call server action - convert nulls to undefined for the action schema
      const result = await updatePlanStepAction({
        category: updates.category ?? undefined,
        commands: updates.commands ?? undefined,
        confidenceLevel: updates.confidenceLevel ?? undefined,
        description: updates.description,
        displayOrder: updates.displayOrder,
        estimatedDuration: updates.estimatedDuration ?? undefined,
        stepId,
        stepNumber: updates.stepNumber,
        title: updates.title,
        validationCommands: updates.validationCommands ?? undefined,
      });

      if (result.serverError || !result.data) {
        throw new Error(result.serverError || 'Failed to update step');
      }
    } catch (error) {
      console.error('Error updating step:', error);
      // Revert on error
      setSteps(initialSteps);
    }
  };

  // Handle step deletion
  const handleDeleteStep = async (stepId: string) => {
    try {
      setIsDirty(true);

      // Optimistically remove from local state
      setSteps((prevSteps) => prevSteps.filter((step) => step.id !== stepId));

      // Call server action
      const result = await deletePlanStepAction({ stepId });

      if (result.serverError) {
        throw new Error(result.serverError);
      }
    } catch (error) {
      console.error('Error deleting step:', error);
      // Revert on error
      setSteps(initialSteps);
    }
  };

  // Handle step duplication
  const handleDuplicateStep = async (step: PlanStep) => {
    try {
      setIsDirty(true);

      // Create new step with duplicated data
      const newStepNumber = steps.length + 1;
      const newDisplayOrder = steps.length;

      const result = await createPlanStepAction({
        category: step.category ?? undefined,
        commands: step.commands ?? undefined,
        confidenceLevel: step.confidenceLevel ?? undefined,
        description: step.description,
        displayOrder: newDisplayOrder,
        estimatedDuration: step.estimatedDuration ?? undefined,
        planGenerationId,
        stepNumber: newStepNumber,
        title: `${step.title} (Copy)`,
        validationCommands: step.validationCommands ?? undefined,
      });

      if (result.serverError || !result.data) {
        throw new Error(result.serverError || 'Failed to duplicate step');
      }

      // Add to local state - extract the step from the action result
      const createdStep = result.data as unknown as PlanStep;
      setSteps((prevSteps) => [...prevSteps, createdStep]);
    } catch (error) {
      console.error('Error duplicating step:', error);
    }
  };

  // Handle reordering (placeholder for drag-and-drop functionality)
  // This will be implemented in Step 4 when drag-and-drop is added
  // const handleReorder = async (updates: Array<{ displayOrder: number; stepId: string }>) => {
  //   try {
  //     setIsDirty(true);
  //
  //     const result = await reorderPlanStepsAction({ updates });
  //
  //     if (!result.success) {
  //       throw new Error('Failed to reorder steps');
  //     }
  //
  //     // Update local state with new order
  //     setSteps((prevSteps) => {
  //       const newSteps = [...prevSteps];
  //       updates.forEach(({ displayOrder, stepId }) => {
  //         const stepIndex = newSteps.findIndex((s) => s.id === stepId);
  //         if (stepIndex !== -1) {
  //           newSteps[stepIndex] = { ...newSteps[stepIndex], displayOrder };
  //         }
  //       });
  //       return newSteps.sort((a, b) => a.displayOrder - b.displayOrder);
  //     });
  //   } catch (error) {
  //     console.error('Error reordering steps:', error);
  //     // Revert on error
  //     setSteps(initialSteps);
  //   }
  // };

  // Handle save (refresh from server)
  const handleSave = () => {
    setIsSaving(true);
    try {
      // In a real implementation, we would refresh the data from the server here
      // For now, we just mark as not dirty
      setIsDirty(false);
      setIsEditMode(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel (revert changes)
  const handleCancel = () => {
    setSteps(initialSteps);
    setIsDirty(false);
    setIsEditMode(false);
  };

  return (
    <div className={cn('space-y-6', className)} data-testid={planEditorTestId} {...props}>
      {/* Header with Edit Controls */}
      <Card>
        <CardHeader>
          <div className={'flex items-center justify-between'}>
            <div>
              <CardTitle className={'flex items-center gap-2'}>
                <EditIcon aria-hidden className={'size-5 text-primary'} />
                Plan Editor
              </CardTitle>
              <CardDescription>
                {isEditMode ? 'Edit plan steps, add new steps, or reorder existing ones' : 'View plan steps'}
              </CardDescription>
            </div>
            <div className={'flex items-center gap-2'}>
              {!isEditMode ?
                <Button onClick={() => setIsEditMode(true)} type={'button'} variant={'default'}>
                  <EditIcon aria-hidden className={'size-4'} />
                  Edit Plan
                </Button>
              : <>
                  {isDirty && <span className={'mr-2 text-sm text-muted-foreground'}>Unsaved changes</span>}
                  <Button onClick={handleCancel} type={'button'} variant={'outline'}>
                    <XIcon aria-hidden className={'size-4'} />
                    Cancel
                  </Button>
                  <Button disabled={isSaving} onClick={handleSave} type={'button'} variant={'default'}>
                    <SaveIcon aria-hidden className={'size-4'} />
                    {isSaving ? 'Saving...' : 'Done'}
                  </Button>
                </>
              }
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Plan Steps */}
      <div className={'space-y-4'}>
        {steps.length === 0 ?
          <Card>
            <CardContent className={'py-12 text-center'}>
              <p className={'text-sm text-muted-foreground'}>No steps found. Add a step to get started.</p>
            </CardContent>
          </Card>
        : steps.map((step, index) => (
            <PlanStepCard
              isEditMode={isEditMode}
              key={step.id}
              onDelete={handleDeleteStep}
              onDuplicate={handleDuplicateStep}
              onUpdate={handleUpdateStep}
              step={step}
              stepIndex={index}
            />
          ))
        }
      </div>

      {/* Add Step Button */}
      {isEditMode && (
        <Card className={'border-dashed'}>
          <CardContent className={'py-6'}>
            <Button
              className={'w-full'}
              onClick={() => {
                // This would open a form to add a new step
                // For now, just a placeholder
                console.log('Add new step');
              }}
              type={'button'}
              variant={'ghost'}
            >
              <PlusIcon aria-hidden className={'size-4'} />
              Add New Step
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

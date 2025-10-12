'use client';

import type { ComponentProps } from 'react';

import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ClockIcon,
  CopyIcon,
  GripVerticalIcon,
  ListIcon,
  Trash2Icon,
} from 'lucide-react';
import { Fragment } from 'react';
import { useState } from 'react';

import type { PlanStep } from '@/lib/db/schema/feature-planner.schema';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Conditional } from '@/components/ui/conditional';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToggle } from '@/hooks/use-toggle';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface PlanStepCardProps extends ComponentProps<'div'>, ComponentTestIdProps {
  isEditMode?: boolean;
  onDelete?: (stepId: string) => void;
  onDuplicate?: (step: PlanStep) => void;
  onUpdate?: (stepId: string, updates: Partial<PlanStep>) => void;
  step: PlanStep;
  stepIndex: number;
}

/**
 * Plan Step Card Component
 * Reusable card component for displaying and editing individual plan steps
 */
export const PlanStepCard = ({
  className,
  isEditMode = false,
  onDelete,
  onDuplicate,
  onUpdate,
  step,
  stepIndex,
  testId,
  ...props
}: PlanStepCardProps) => {
  const [isOpen, setIsOpen] = useToggle();
  const [isEditing, setIsEditing] = useToggle();

  const [editedTitle, setEditedTitle] = useState(step.title);
  const [editedDescription, setEditedDescription] = useState(step.description);
  // String values, not booleans (linter false positive)
   
  const [categoryText, setCategoryText] = useState(step.category || '');
   
  const [confidenceLevelText, setConfidenceLevelText] = useState(step.confidenceLevel || '');
   
  const [estimatedDurationText, setEstimatedDurationText] = useState(step.estimatedDuration || '');

  const stepCardTestId = testId || generateTestId('ui', 'plan-step-card', 'container');

  const handleSaveEdit = () => {
    if (onUpdate) {
      onUpdate(step.id, {
        category: categoryText || null,
        confidenceLevel: confidenceLevelText || null,
        description: editedDescription,
        estimatedDuration: estimatedDurationText || null,
        title: editedTitle,
      });
    }
    setIsEditing.off();
  };

  const handleCancelEdit = () => {
    // Reset to original values
    setEditedTitle(step.title);
    setEditedDescription(step.description);
    setCategoryText(step.category || '');
    setConfidenceLevelText(step.confidenceLevel || '');
    setEstimatedDurationText(step.estimatedDuration || '');
    setIsEditing.off();
  };

  // Determine confidence level color
  const getConfidenceLevelColor = (level: null | string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'text-green-600';
      case 'low':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const hasValidationCommandsToShow =
    !isEditing && step.validationCommands && step.validationCommands.length > 0;
  const hasCommandsToShow = !isEditing && step.commands && step.commands.length > 0;

  return (
    <Collapsible onOpenChange={setIsOpen.update} open={isOpen}>
      <Card
        className={cn('border transition-all', isEditMode && 'border-primary/50', className)}
        data-testid={stepCardTestId}
        {...props}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className={'cursor-pointer pb-3'}>
            <div className={'flex items-start justify-between gap-4'}>
              <div className={'flex items-start gap-3'}>
                {/* Drag Handle (visual only for now) */}
                <Conditional isCondition={isEditMode}>
                  <div
                    className={
                      'mt-1 flex size-6 shrink-0 cursor-grab items-center justify-center rounded hover:bg-muted active:cursor-grabbing'
                    }
                  >
                    <GripVerticalIcon aria-hidden className={'size-4 text-muted-foreground'} />
                  </div>
                </Conditional>

                {/* Step Number Badge */}
                <div
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                    isEditMode ? 'bg-primary/10 text-primary' : 'bg-primary text-primary-foreground',
                  )}
                >
                  {stepIndex + 1}
                </div>

                {/* Title and Metadata */}
                <div className={'flex-1 text-left'}>
                  <Conditional
                    fallback={<CardTitle className={'text-base'}>{step.title}</CardTitle>}
                    isCondition={isEditing}
                  >
                    <Input
                      className={'mb-2'}
                      onChange={(e) => {
                        setEditedTitle(e.target.value);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      placeholder={'Step title'}
                      value={editedTitle}
                    />
                  </Conditional>

                  <div className={'mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground'}>
                    <Conditional isCondition={!!step.confidenceLevel}>
                      <span className={cn('font-medium', getConfidenceLevelColor(step.confidenceLevel))}>
                        Confidence: <span className={'capitalize'}>{step.confidenceLevel}</span>
                      </span>
                    </Conditional>
                    <Conditional isCondition={!!step.category}>
                      <span>
                        Category: <span className={'capitalize'}>{step.category}</span>
                      </span>
                    </Conditional>
                    <Conditional isCondition={!!step.estimatedDuration}>
                      <span className={'flex items-center gap-1'}>
                        <ClockIcon aria-hidden className={'size-3'} />
                        {step.estimatedDuration}
                      </span>
                    </Conditional>
                  </div>
                </div>
              </div>

              {/* Action Buttons and Chevron */}
              <div className={'flex shrink-0 items-center gap-2'}>
                <Conditional isCondition={isEditMode && !isEditing}>
                  <Fragment>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate?.(step);
                      }}
                      size={'icon'}
                      title={'Duplicate step'}
                      type={'button'}
                      variant={'ghost'}
                    >
                      <CopyIcon aria-hidden className={'size-4'} />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(step.id);
                      }}
                      size={'icon'}
                      title={'Delete step'}
                      type={'button'}
                      variant={'ghost'}
                    >
                      <Trash2Icon aria-hidden className={'size-4 text-destructive'} />
                    </Button>
                  </Fragment>
                </Conditional>
                <ChevronDownIcon
                  aria-hidden
                  className={cn(
                    'size-5 text-muted-foreground transition-transform duration-200',
                    isOpen && 'rotate-180',
                  )}
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className={'space-y-4 pt-0'}>
            {/* Description */}
            <div>
              <Label className={'mb-2 text-sm font-medium'}>Description</Label>
              <Conditional
                fallback={
                  <p className={'text-sm whitespace-pre-wrap text-muted-foreground'}>{step.description}</p>
                }
                isCondition={isEditing}
              >
                <Textarea
                  className={'min-h-[100px]'}
                  onChange={(e) => {
                    setEditedDescription(e.target.value);
                  }}
                  placeholder={'Step description'}
                  value={editedDescription}
                />
              </Conditional>
            </div>

            {/* Editable Fields*/}
            <Conditional isCondition={isEditing}>
              <div className={'grid gap-4 sm:grid-cols-2'}>
                <div>
                  <Label className={'mb-2 text-sm font-medium'} htmlFor={`category-${step.id}`}>
                    Category
                  </Label>
                  <Input
                    id={`category-${step.id}`}
                    onChange={(e) => {
                      setCategoryText(e.target.value);
                    }}
                    placeholder={'e.g., implementation, testing'}
                    value={categoryText}
                  />
                </div>

                <div>
                  <Label className={'mb-2 text-sm font-medium'} htmlFor={`confidence-${step.id}`}>
                    Confidence Level
                  </Label>
                  <Input
                    id={`confidence-${step.id}`}
                    onChange={(e) => {
                      setConfidenceLevelText(e.target.value);
                    }}
                    placeholder={'e.g., high, medium, low'}
                    value={confidenceLevelText}
                  />
                </div>

                <div className={'sm:col-span-2'}>
                  <Label className={'mb-2 text-sm font-medium'} htmlFor={`duration-${step.id}`}>
                    Estimated Duration
                  </Label>
                  <Input
                    id={`duration-${step.id}`}
                    onChange={(e) => {
                      setEstimatedDurationText(e.target.value);
                    }}
                    placeholder={'e.g., 2 hours, 1 day'}
                    value={estimatedDurationText}
                  />
                </div>
              </div>
            </Conditional>

            {/* Commands */}
            <Conditional isCondition={hasCommandsToShow}>
              <div>
                <div className={'mb-2 flex items-center gap-2'}>
                  <ListIcon aria-hidden className={'size-4 text-muted-foreground'} />
                  <Label className={'text-sm font-medium'}>Commands</Label>
                </div>
                <ul className={'list-inside list-disc space-y-1 text-sm text-muted-foreground'}>
                  {step.commands?.map((command, cmdIndex) => (
                    <li className={'font-mono'} key={cmdIndex}>
                      {command}
                    </li>
                  ))}
                </ul>
              </div>
            </Conditional>

            {/* Validation Commands */}
            <Conditional isCondition={hasValidationCommandsToShow}>
              <div>
                <div className={'mb-2 flex items-center gap-2'}>
                  <CheckCircle2Icon aria-hidden className={'size-4 text-muted-foreground'} />
                  <Label className={'text-sm font-medium'}>Validation Commands</Label>
                </div>
                <ul className={'list-inside list-disc space-y-1 text-sm text-muted-foreground'}>
                  {step.validationCommands?.map((command, cmdIndex) => (
                    <li className={'font-mono'} key={cmdIndex}>
                      {command}
                    </li>
                  ))}
                </ul>
              </div>
            </Conditional>

            {/* Edit Mode Actions */}
            <Conditional isCondition={isEditMode}>
              <div className={'flex items-center justify-end gap-2 border-t pt-4'}>
                <Conditional
                  fallback={
                    <Button onClick={setIsEditing.on} size={'sm'} type={'button'} variant={'outline'}>
                      Edit Step
                    </Button>
                  }
                  isCondition={isEditing}
                >
                  <Fragment>
                    <Button onClick={handleCancelEdit} variant={'outline'}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveEdit}>Save Changes</Button>
                  </Fragment>
                </Conditional>
              </div>
            </Conditional>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

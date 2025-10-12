'use client';

import { ChevronDownIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Conditional } from '@/components/ui/conditional';

interface PlanStep {
  category: null | string;
  commands: Array<string> | null;
  confidenceLevel: null | string;
  description: null | string;
  estimatedDuration: null | string;
  id: string;
  title: string;
  validationCommands: Array<string> | null;
}

interface PlanStepItemProps {
  index: number;
  step: PlanStep;
}

export const PlanStepItem = ({ index, step }: PlanStepItemProps) => {
  // Derived variables
  const _hasCommands = Boolean(step.commands && step.commands.length > 0);
  const _hasValidationCommands = Boolean(step.validationCommands && step.validationCommands.length > 0);

  return (
    <Collapsible>
      <Card className={'border'}>
        {/* Collapsible Trigger */}
        <CollapsibleTrigger className={'w-full'}>
          <CardHeader className={'pb-3'}>
            <div className={'flex items-start justify-between gap-4'}>
              <div className={'flex items-start gap-3'}>
                {/* Step Number Badge */}
                <div
                  className={
                    'flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground'
                  }
                >
                  {index + 1}
                </div>

                {/* Step Title and Confidence */}
                <div className={'text-left'}>
                  <CardTitle className={'text-base'}>{step.title}</CardTitle>
                  <Conditional isCondition={!!step.confidenceLevel}>
                    <p className={'mt-1 text-xs text-muted-foreground'}>
                      Confidence: <span className={'capitalize'}>{step.confidenceLevel}</span>
                    </p>
                  </Conditional>
                </div>
              </div>

              {/* Chevron Icon */}
              <ChevronDownIcon
                aria-hidden
                className={'size-5 shrink-0 text-muted-foreground transition-transform duration-200'}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        {/* Collapsible Content */}
        <CollapsibleContent>
          <CardContent className={'space-y-3 pt-0'}>
            {/* Description */}
            <Conditional isCondition={!!step.description}>
              <div>
                <h4 className={'mb-1 text-sm font-medium'}>Description</h4>
                <p className={'text-sm whitespace-pre-wrap text-muted-foreground'}>{step.description}</p>
              </div>
            </Conditional>

            {/* Category */}
            <Conditional isCondition={!!step.category}>
              <div>
                <h4 className={'mb-1 text-sm font-medium'}>Category</h4>
                <p className={'text-sm text-muted-foreground capitalize'}>{step.category}</p>
              </div>
            </Conditional>

            {/* Estimated Duration */}
            <Conditional isCondition={!!step.estimatedDuration}>
              <div>
                <h4 className={'mb-1 text-sm font-medium'}>Estimated Duration</h4>
                <p className={'text-sm text-muted-foreground'}>{step.estimatedDuration}</p>
              </div>
            </Conditional>

            {/* Commands */}
            <Conditional isCondition={_hasCommands}>
              <div>
                <h4 className={'mb-1 text-sm font-medium'}>Commands</h4>
                <ul className={'list-inside list-disc space-y-1 text-sm text-muted-foreground'}>
                  {step.commands?.map((command, cmdIndex) => <li key={cmdIndex}>{command}</li>)}
                </ul>
              </div>
            </Conditional>

            {/* Validation Commands */}
            <Conditional isCondition={_hasValidationCommands}>
              <div>
                <h4 className={'mb-1 text-sm font-medium'}>Validation Commands</h4>
                <ul className={'list-inside list-disc space-y-1 text-sm text-muted-foreground'}>
                  {step.validationCommands?.map((command, cmdIndex) => <li key={cmdIndex}>{command}</li>)}
                </ul>
              </div>
            </Conditional>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

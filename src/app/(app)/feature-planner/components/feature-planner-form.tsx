'use client';

import type { FormEvent, ReactNode } from 'react';

import { CheckCircleIcon, CodeIcon, FileTextIcon, Loader2Icon, SearchIcon, XCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { FeaturePlanningResult } from '@/lib/validations/feature-planning';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Textarea } from '@/components/ui/textarea';
import { useServerAction } from '@/hooks/use-server-action';
import { generateFeaturePlanAction } from '@/lib/actions/feature-planning.action';
import { cn } from '@/utils/tailwind-utils';

interface PlanningStep {
  icon: ReactNode;
  name: string;
  number: number;
  status: 'active' | 'completed' | 'error' | 'pending';
}

const PlanningSteps = ({ currentStep }: { currentStep: number }) => {
  const steps: Array<PlanningStep> = [
    {
      icon: <FileTextIcon aria-hidden className={'size-4'} />,
      name: 'Refining feature request',
      number: 1,
      status:
        currentStep === 1 ? 'active'
        : currentStep > 1 ? 'completed'
        : 'pending',
    },
    {
      icon: <SearchIcon aria-hidden className={'size-4'} />,
      name: 'Discovering relevant files',
      number: 2,
      status:
        currentStep === 2 ? 'active'
        : currentStep > 2 ? 'completed'
        : 'pending',
    },
    {
      icon: <CodeIcon aria-hidden className={'size-4'} />,
      name: 'Generating implementation plan',
      number: 3,
      status:
        currentStep === 3 ? 'active'
        : currentStep > 3 ? 'completed'
        : 'pending',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planning Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={'space-y-4'}>
          {steps.map((step) => (
            <div
              className={cn(
                'flex items-center space-x-3 rounded-lg p-3 transition-colors',
                step.status === 'active' ? 'bg-primary/10' : '',
                step.status === 'completed' ? 'bg-green-500/10' : '',
                step.status === 'pending' ? 'opacity-50' : '',
              )}
              key={step.number}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  step.status === 'active' ? 'bg-primary text-primary-foreground' : '',
                  step.status === 'completed' ? 'bg-green-500 text-white' : '',
                  step.status === 'pending' ? 'bg-muted' : '',
                )}
              >
                {step.status === 'completed' ?
                  <CheckCircleIcon aria-hidden className={'size-4'} />
                : step.status === 'active' ?
                  <Loader2Icon aria-hidden className={'size-4 animate-spin'} />
                : step.icon}
              </div>
              <div className={'flex-1'}>
                <p
                  className={cn(
                    'text-sm font-medium',
                    step.status === 'pending' ? 'text-muted-foreground' : '',
                  )}
                >
                  Step {step.number}: {step.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ResultDisplay = ({ result }: { result: FeaturePlanningResult }) => {
  if (result.error) {
    return (
      <Alert variant={'error'}>
        <XCircleIcon aria-hidden className={'size-4'} />
        Error: {result.error}
      </Alert>
    );
  }

  if (!result.isSuccessful) {
    return null;
  }

  return (
    <div className={'space-y-6'}>
      {/* Success Summary */}
      <Alert>
        <CheckCircleIcon aria-hidden className={'size-4'} />
        Plan Generated Successfully - Generated in {result.executionTime?.toFixed(1)} seconds
      </Alert>

      {/* Refined Request */}
      <Conditional isCondition={!!result.refinedRequest}>
        <Card>
          <CardHeader>
            <CardTitle>Refined Feature Request</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={'text-sm'}>{result.refinedRequest}</p>
          </CardContent>
        </Card>
      </Conditional>

      {/* Discovered Files */}
      <Conditional isCondition={!!result.discoveredFiles}>
        <Card>
          <CardHeader>
            <CardTitle>Discovered Files ({result.discoveredFiles?.length})</CardTitle>
            <CardDescription>Files relevant to this feature implementation</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className={'space-y-1'}>
              {result.discoveredFiles?.map((file, index) => (
                <li className={'font-mono text-sm'} key={index}>
                  {file}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </Conditional>

      {/* Implementation Plan */}
      <Conditional isCondition={!!result.implementationPlan}>
        <Card>
          <CardHeader>
            <CardTitle>Implementation Plan</CardTitle>
            <CardDescription>
              <Conditional isCondition={!!result.planPath}>
                <span>
                  Saved to: <code className={'text-xs'}>{result.planPath}</code>
                </span>
              </Conditional>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={'max-w-none'}>
              <pre className={'text-sm whitespace-pre-wrap'}>{result.implementationPlan}</pre>
            </div>
          </CardContent>
        </Card>
      </Conditional>

      {/* File Paths */}
      <Conditional isCondition={!!result.orchestrationPath || !!result.planPath}>
        <Card>
          <CardHeader>
            <CardTitle>Generated Files</CardTitle>
          </CardHeader>
          <CardContent className={'space-y-2'}>
            <Conditional isCondition={!!result.orchestrationPath}>
              <div>
                <span className={'text-sm font-medium'}>Orchestration Logs:</span>
                <code className={'ml-2 text-xs'}>{result.orchestrationPath}</code>
              </div>
            </Conditional>
            <Conditional isCondition={!!result.planPath}>
              <div>
                <span className={'text-sm font-medium'}>Implementation Plan:</span>
                <code className={'ml-2 text-xs'}>{result.planPath}</code>
              </div>
            </Conditional>
          </CardContent>
        </Card>
      </Conditional>
    </div>
  );
};

export function FeaturePlannerForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [featureRequest, setFeatureRequest] = useState('');
  const [result, setResult] = useState<FeaturePlanningResult | null>(null);

  const { executeAsync, isExecuting } = useServerAction(generateFeaturePlanAction, {
    toastMessages: {
      error: 'Failed to generate feature plan. Please try again.',
      loading: 'Generating feature plan...',
      success: (data) => {
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          data.data &&
          typeof data.data === 'object' &&
          'isSuccessful' in data.data &&
          data.data.isSuccessful
        ) {
          setResult(data.data as FeaturePlanningResult);
        }
        return 'Feature plan generated successfully!';
      },
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!featureRequest || featureRequest.trim().length < 10) {
      toast.error('Feature request must be at least 10 characters');
      return;
    }

    setCurrentStep(1);
    setResult(null);

    // simulate step progression for UI feedback
    setTimeout(() => setCurrentStep(2), 1000);
    setTimeout(() => setCurrentStep(3), 2000);

    try {
      await executeAsync({ featureRequest });
    } catch (error) {
      console.error('Failed to generate plan:', error);
    } finally {
      setCurrentStep(0);
    }
  };

  return (
    <div className={'space-y-6'}>
      {/* Input Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Feature Description</CardTitle>
            <CardDescription>
              Describe the feature you want to implement. Be as specific as possible.
            </CardDescription>
          </CardHeader>
          <CardContent className={'space-y-4'}>
            <div className={'space-y-2'}>
              <label
                className={
                  'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                }
                htmlFor={'featureRequest'}
              >
                Feature Request
              </label>
              <Textarea
                className={'min-h-[120px]'}
                disabled={isExecuting}
                id={'featureRequest'}
                maxLength={1000}
                minLength={10}
                onChange={(e) => {
                  setFeatureRequest(e.target.value);
                }}
                placeholder={
                  'Example: Add user authentication with OAuth support for Google and GitHub, including user profile management and role-based access control...'
                }
                required
                value={featureRequest}
              />
              <p className={'text-xs text-muted-foreground'}>
                Tell us about the feature you want to implement. Be specific about requirements, user
                interactions, and technical considerations.
              </p>
            </div>
            <div className={'flex items-center justify-between'}>
              <span className={'text-sm text-muted-foreground'}>{featureRequest.length}/1000 characters</span>
              <Button disabled={isExecuting || featureRequest.trim().length < 10} type={'submit'}>
                <Conditional fallback={'Generate Plan'} isCondition={isExecuting}>
                  <Loader2Icon aria-hidden className={'mr-2 size-4 animate-spin'} />
                  Generating Plan...
                </Conditional>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Progress Indicator */}
      <Conditional isCondition={isExecuting}>
        <PlanningSteps currentStep={currentStep} />
      </Conditional>

      {/* Result Display */}
      <Conditional isCondition={!!result}>
        <ResultDisplay result={result!} />
      </Conditional>
    </div>
  );
}

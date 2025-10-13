'use client';

import type { FormEvent } from 'react';

import { $path } from 'next-typesafe-url';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import type { RefinementAgent } from '@/lib/types/refinement-agent';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useToggle } from '@/hooks/use-toggle';
import {
  createRefinementAgentAction,
  updateRefinementAgentAction,
} from '@/lib/actions/feature-planner/manage-refinement-agents.action';

interface AgentFormClientProps {
  agent?: RefinementAgent;
  mode: 'create' | 'edit';
}

export function AgentFormClient({ agent, mode }: AgentFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useToggle();

  const [formData, setFormData] = useState({
    agentId: agent?.agentId || '',
    focus: agent?.focus || '',
    name: agent?.name || '',
    role: agent?.role || '',
    systemPrompt: agent?.systemPrompt || '',
    temperature: agent?.temperature || 0.7,
    tools: agent?.tools.join(', ') || 'Read, Grep, Glob',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting.on();

    try {
      const toolsArray = formData.tools
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      if (mode === 'create') {
        const result = await createRefinementAgentAction({
          agentId: formData.agentId,
          focus: formData.focus,
          name: formData.name,
          role: formData.role,
          systemPrompt: formData.systemPrompt,
          temperature: formData.temperature,
          tools: toolsArray,
        });

        if (result.data?.success) {
          toast.success('Agent created successfully');
          router.push($path({ route: '/feature-planner/agents' }));
          router.refresh();
        } else {
          toast.error(typeof result.serverError === 'string' ? result.serverError : 'Failed to create agent');
        }
      } else {
        const result = await updateRefinementAgentAction({
          agentId: formData.agentId,
          updates: {
            focus: formData.focus,
            name: formData.name,
            role: formData.role,
            systemPrompt: formData.systemPrompt,
            temperature: formData.temperature,
            tools: toolsArray,
          },
        });

        if (result.data?.success) {
          toast.success('Agent updated successfully');
          router.push($path({ route: '/feature-planner/agents' }));
          router.refresh();
        } else {
          toast.error(typeof result.serverError === 'string' ? result.serverError : 'Failed to update agent');
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting.off();
    }
  };

  const handleCancel = () => {
    router.push($path({ route: '/feature-planner/agents' }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{mode === 'create' ? 'New Agent Configuration' : 'Edit Agent Configuration'}</CardTitle>
          <CardDescription>
            {mode === 'create' ?
              'Configure the agent with a unique identifier, role, and system prompt that defines its behavior.'
            : 'Update the agent configuration. Changes will apply to future refinement sessions.'}
          </CardDescription>
        </CardHeader>

        <CardContent className={'space-y-6'}>
          {/* Basic Information */}
          <div className={'space-y-4'}>
            <h3 className={'text-lg font-semibold'}>Basic Information</h3>

            {/* Agent ID */}
            <div className={'space-y-2'}>
              <Label htmlFor={'agentId'}>
                Agent ID <span className={'text-destructive'}>*</span>
              </Label>
              <Input
                disabled={mode === 'edit'}
                id={'agentId'}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, agentId: e.target.value }));
                }}
                placeholder={'technical-architect'}
                required
                value={formData.agentId}
              />
              <p className={'text-xs text-muted-foreground'}>
                {mode === 'create' ?
                  'A unique identifier in kebab-case (e.g., technical-architect)'
                : 'Agent ID cannot be changed after creation'}
              </p>
            </div>

            {/* Agent Name */}
            <div className={'space-y-2'}>
              <Label htmlFor={'name'}>
                Agent Name <span className={'text-destructive'}>*</span>
              </Label>
              <Input
                id={'name'}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                }}
                placeholder={'Technical Architect'}
                required
                value={formData.name}
              />
              <p className={'text-xs text-muted-foreground'}>Display name shown in the UI</p>
            </div>

            {/* Agent Role */}
            <div className={'space-y-2'}>
              <Label htmlFor={'role'}>
                Agent Role <span className={'text-destructive'}>*</span>
              </Label>
              <Input
                id={'role'}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, role: e.target.value }));
                }}
                placeholder={'Senior Technical Architect'}
                required
                value={formData.role}
              />
              <p className={'text-xs text-muted-foreground'}>Professional role or title for the agent</p>
            </div>

            {/* Focus Area */}
            <div className={'space-y-2'}>
              <Label htmlFor={'focus'}>
                Focus Area <span className={'text-destructive'}>*</span>
              </Label>
              <Textarea
                id={'focus'}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, focus: e.target.value }));
                }}
                placeholder={'Technical feasibility, architecture patterns, scalability considerations'}
                required
                rows={3}
                value={formData.focus}
              />
              <p className={'text-xs text-muted-foreground'}>Primary areas of expertise and analysis focus</p>
            </div>
          </div>

          <Separator />

          {/* Configuration */}
          <div className={'space-y-4'}>
            <h3 className={'text-lg font-semibold'}>Configuration</h3>

            {/* Temperature */}
            <div className={'space-y-2'}>
              <Label htmlFor={'temperature'}>
                Temperature <span className={'text-destructive'}>*</span>
              </Label>
              <Input
                id={'temperature'}
                max={2.0}
                min={0.0}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }));
                }}
                required
                step={0.1}
                type={'number'}
                value={formData.temperature}
              />
              <p className={'text-xs text-muted-foreground'}>
                Control randomness (0.0-2.0). Lower values are more focused and deterministic.
              </p>
            </div>

            {/* Tools */}
            <div className={'space-y-2'}>
              <Label htmlFor={'tools'}>
                Tools <span className={'text-destructive'}>*</span>
              </Label>
              <Input
                id={'tools'}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, tools: e.target.value }));
                }}
                placeholder={'Read, Grep, Glob'}
                required
                value={formData.tools}
              />
              <p className={'text-xs text-muted-foreground'}>
                Comma-separated list of tools the agent can use (e.g., Read, Grep, Glob)
              </p>
            </div>
          </div>

          <Separator />

          {/* System Prompt */}
          <div className={'space-y-4'}>
            <h3 className={'text-lg font-semibold'}>System Prompt</h3>

            <div className={'space-y-2'}>
              <Label htmlFor={'systemPrompt'}>
                System Prompt <span className={'text-destructive'}>*</span>
              </Label>
              <Textarea
                id={'systemPrompt'}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, systemPrompt: e.target.value }));
                }}
                placeholder={
                  'You are a senior technical architect. Analyze feature requests for technical feasibility...'
                }
                required
                rows={12}
                value={formData.systemPrompt}
              />
              <p className={'text-xs text-muted-foreground'}>
                Instructions that define the agent&apos;s behavior, perspective, and analysis approach
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className={'flex gap-3 pt-4'}>
            <Button className={'flex-1'} disabled={isSubmitting} type={'submit'}>
              {isSubmitting && <Spinner className={'mr-2 size-4'} />}
              {mode === 'create' ? 'Create Agent' : 'Save Changes'}
            </Button>
            <Button disabled={isSubmitting} onClick={handleCancel} type={'button'} variant={'outline'}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

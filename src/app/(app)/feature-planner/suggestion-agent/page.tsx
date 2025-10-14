import { ArrowLeftIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import type { FeatureSuggestionAgent } from '@/lib/types/feature-suggestion-agent';

import { SuggestionAgentForm } from '@/app/(app)/feature-planner/suggestion-agent/components/suggestion-agent-form';
import { PageContent } from '@/components/layout/page-content';
import { Alert } from '@/components/ui/alert';
import { Conditional } from '@/components/ui/conditional';
import { FeaturePlannerFacade } from '@/lib/facades/feature-planner/feature-planner.facade';
import { getUserId } from '@/utils/user-utils';

export default async function SuggestionAgentPage() {
  const userId = await getUserId();

  let agent: FeatureSuggestionAgent | null = null;
  let error: null | string = null;

  try {
    const dbAgent = await FeaturePlannerFacade.getFeatureSuggestionAgentAsync(userId);

    if (dbAgent) {
      // Convert database agent to FeatureSuggestionAgent type
      agent = {
        agentId: dbAgent.agentId,
        agentType: 'feature-suggestion' as const,
        createdAt: dbAgent.createdAt,
        focus: dbAgent.focus,
        isActive: dbAgent.isActive,
        name: dbAgent.name,
        role: dbAgent.role,
        systemPrompt: dbAgent.systemPrompt,
        temperature: parseFloat(dbAgent.temperature),
        tools: dbAgent.tools as Array<'Glob' | 'Grep' | 'Read'>,
        updatedAt: dbAgent.updatedAt,
      };
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load suggestion agent';
  }

  return (
    <PageContent>
      <div className={'space-y-6'}>
        {/* Back Navigation */}
        <Link
          className={'inline-flex items-center text-sm text-muted-foreground hover:text-foreground'}
          href={$path({ route: '/feature-planner' })}
        >
          <ArrowLeftIcon aria-hidden className={'mr-2 size-4'} />
          Back to Feature Planner
        </Link>

        {/* Header Section */}
        <div>
          <h1 className={'text-3xl font-bold tracking-tight'}>Feature Suggestion Agent</h1>
          <p className={'mt-2 text-muted-foreground'}>
            Configure the AI agent used for feature suggestion analysis. This agent brings strategic
            perspective to your feature ideation process.
          </p>
        </div>

        {/* Error Alert */}
        <Conditional isCondition={!!error}>
          <Alert variant={'error'}>{error}</Alert>
        </Conditional>

        {/* Agent Form */}
        <SuggestionAgentForm agent={agent} mode={agent ? 'edit' : 'create'} />
      </div>
    </PageContent>
  );
}

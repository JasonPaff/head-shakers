import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AgentFormClient } from '@/app/(app)/feature-planner/agents/components/agent-form-client';
import { PageContent } from '@/components/layout/page-content';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FeaturePlannerFacade } from '@/lib/facades/feature-planner/feature-planner.facade';
import { getUserId } from '@/utils/user-utils';

interface AgentDetailPageProps {
  params: Promise<{
    agentId: string;
  }>;
}

export default async function AgentDetailPage({ params }: AgentDetailPageProps) {
  const userId = await getUserId();

  const { agentId } = await params;

  // Handle new agent creation
  if (agentId === 'new') {
    return (
      <PageContent>
        <div className={'space-y-6'}>
          {/* Header Section */}
          <div className={'flex items-center gap-4'}>
            <Link href={'/feature-planner/agents'}>
              <Button size={'sm'} variant={'ghost'}>
                <ArrowLeft aria-hidden className={'mr-2 size-4'} />
                Back to Agents
              </Button>
            </Link>
          </div>

          <div>
            <h1 className={'text-3xl font-bold tracking-tight'}>Create New Agent</h1>
            <p className={'mt-2 text-muted-foreground'}>
              Define a new AI agent with a specialized role and perspective for feature refinement.
            </p>
          </div>

          {/* Agent Form */}
          <AgentFormClient mode={'create'} />
        </div>
      </PageContent>
    );
  }

  // Handle existing agent edit
  let agent;
  let error = null;

  try {
    agent = await FeaturePlannerFacade.getAgentByIdAsync(agentId, userId);

    if (!agent) {
      notFound();
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load agent';
    agent = null;
  }

  if (error) {
    return (
      <PageContent>
        <div className={'space-y-6'}>
          <Link href={'/feature-planner/agents'}>
            <Button size={'sm'} variant={'ghost'}>
              <ArrowLeft aria-hidden className={'mr-2 size-4'} />
              Back to Agents
            </Button>
          </Link>

          <Alert variant={'error'}>{error}</Alert>
        </div>
      </PageContent>
    );
  }

  if (!agent) {
    notFound();
  }

  return (
    <PageContent>
      <div className={'space-y-6'}>
        {/* Header Section */}
        <div className={'flex items-center gap-4'}>
          <Link href={'/feature-planner/agents'}>
            <Button size={'sm'} variant={'ghost'}>
              <ArrowLeft aria-hidden className={'mr-2 size-4'} />
              Back to Agents
            </Button>
          </Link>
        </div>

        <div>
          <h1 className={'text-3xl font-bold tracking-tight'}>Edit Agent</h1>
          <p className={'mt-2 text-muted-foreground'}>
            Modify the agent&apos;s configuration, including its role, system prompt, and temperature
            settings.
          </p>
        </div>

        {/* Agent Form */}
        <AgentFormClient agent={agent} mode={'edit'} />
      </div>
    </PageContent>
  );
}

import { ArrowLeftIcon, PlusCircle } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import type { RefinementAgent } from '@/lib/types/refinement-agent';

import { AgentList } from '@/app/(app)/feature-planner/agents/components/agent-list';
import { PageContent } from '@/components/layout/page-content';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { FeaturePlannerFacade } from '@/lib/facades/feature-planner/feature-planner.facade';
import { getUserId } from '@/utils/user-utils';

export default async function RefinementAgentsPage() {
  const userId = await getUserId();

  let agents: Array<RefinementAgent> = [];
  let error: null | string = null;

  try {
    agents = await FeaturePlannerFacade.getAvailableAgentsAsync(userId);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load agents';
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
        <div className={'flex items-center justify-between'}>
          <div>
            <h1 className={'text-3xl font-bold tracking-tight'}>Refinement Agents</h1>
            <p className={'mt-2 text-muted-foreground'}>
              Manage AI agents used for feature request refinement. Each agent brings a unique perspective to
              analyze your feature requests.
            </p>
          </div>
          <Link href={$path({ route: '/feature-planner/agents/new' })}>
            <Button size={'lg'}>
              <PlusCircle aria-hidden className={'mr-2 size-5'} />
              Create Agent
            </Button>
          </Link>
        </div>

        {/* Error Alert */}
        <Conditional isCondition={!!error}>
          <Alert variant={'error'}>{error}</Alert>
        </Conditional>

        {/* Agent List */}
        <AgentList agents={agents} />
      </div>
    </PageContent>
  );
}

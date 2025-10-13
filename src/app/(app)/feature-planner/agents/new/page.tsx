import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { AgentFormClient } from '@/app/(app)/feature-planner/agents/components/agent-form-client';
import { PageContent } from '@/components/layout/page-content';
import { Button } from '@/components/ui/button';

export default function NewAgentPage() {
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

import type { RefinementAgent } from '@/lib/types/refinement-agent';

import { AgentCard } from '@/app/(app)/feature-planner/agents/components/agent-card';
import { EmptyState } from '@/components/ui/empty-state';

interface AgentListProps {
  agents: Array<RefinementAgent>;
}

export function AgentList({ agents }: AgentListProps) {
  if (agents.length === 0) {
    return (
      <EmptyState
        description={'Get started by creating your first refinement agent'}
        title={'No agents found'}
      />
    );
  }

  return (
    <div className={'grid gap-6 md:grid-cols-2 xl:grid-cols-3'}>
      {agents.map((agent) => (
        <AgentCard agent={agent} key={agent.agentId} />
      ))}
    </div>
  );
}

import { Brain, Edit, Thermometer, Wrench } from 'lucide-react';
import Link from 'next/link';

import type { RefinementAgent } from '@/lib/types/refinement-agent';

import { DeleteAgentDialog } from '@/app/(app)/feature-planner/agents/components/delete-agent-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface AgentCardProps {
  agent: RefinementAgent;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Card className={'flex flex-col'}>
      <CardHeader>
        <div className={'flex items-start justify-between'}>
          <div className={'flex-1'}>
            <CardTitle className={'flex items-center gap-2'}>
              <Brain aria-hidden className={'size-5 text-primary'} />
              {agent.name}
            </CardTitle>
            <CardDescription className={'mt-1'}>{agent.role}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className={'flex-1 space-y-4'}>
        {/* Focus Area */}
        <div>
          <h4 className={'text-sm font-medium text-muted-foreground'}>Focus Area</h4>
          <p className={'mt-1 text-sm'}>{agent.focus}</p>
        </div>

        <Separator />

        {/* Configuration Details */}
        <div className={'space-y-3'}>
          {/* Temperature */}
          <div className={'flex items-center justify-between'}>
            <div className={'flex items-center gap-2 text-sm text-muted-foreground'}>
              <Thermometer aria-hidden className={'size-4'} />
              Temperature
            </div>
            <Badge variant={'outline'}>{agent.temperature}</Badge>
          </div>

          {/* Tools */}
          <div className={'flex items-start justify-between'}>
            <div className={'flex items-center gap-2 text-sm text-muted-foreground'}>
              <Wrench aria-hidden className={'size-4'} />
              Tools
            </div>
            <div className={'flex max-w-[60%] flex-wrap justify-end gap-1'}>
              {agent.tools.map((tool) => (
                <Badge className={'text-xs'} key={tool} variant={'secondary'}>
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* System Prompt Preview */}
        <div>
          <h4 className={'mb-1 text-sm font-medium text-muted-foreground'}>System Prompt</h4>
          <p className={'line-clamp-3 text-xs text-muted-foreground'}>
            {agent.systemPrompt.substring(0, 150)}...
          </p>
        </div>
      </CardContent>

      <CardFooter className={'flex gap-2'}>
        <Link className={'flex-1'} href={`/feature-planner/agents/${agent.agentId}`}>
          <Button className={'w-full'} size={'sm'} variant={'outline'}>
            <Edit aria-hidden className={'mr-2 size-4'} />
            Edit
          </Button>
        </Link>
        <DeleteAgentDialog agentId={agent.agentId} agentName={agent.name} />
      </CardFooter>
    </Card>
  );
}

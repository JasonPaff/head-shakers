'use client';

import type { ComponentProps } from 'react';

import { Users } from 'lucide-react';

import type { RefinementAgent } from '@/lib/types/refinement-agent';
import type { RefinementSettings as RefinementSettingsType } from '@/lib/validations/feature-planner.validation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/utils/tailwind-utils';

interface AgentSelectionProps extends ComponentProps<'div'> {
  agents: Array<RefinementAgent>;
  onSettingsChange: (settings: RefinementSettingsType) => void;
  settings: RefinementSettingsType;
}

export const AgentSelection = ({
  agents,
  className,
  onSettingsChange,
  settings,
  ...props
}: AgentSelectionProps) => {
  const _agentSelectionTestId = 'feature-agent-selection';
  const _selectedAgentIds = settings.selectedAgentIds || [];
  const _selectedCount = _selectedAgentIds.length || settings.agentCount;

  const _badgeVariant =
    _selectedCount === 1 ? 'secondary'
    : _selectedCount <= 3 ? 'default'
    : 'destructive';

  const handleToggleAgent = (agentId: string) => {
    const currentSelected = settings.selectedAgentIds || [];
    const isSelected = currentSelected.includes(agentId);

    const newSelected =
      isSelected ? currentSelected.filter((id) => id !== agentId) : [...currentSelected, agentId];

    // Ensure at least one agent is selected
    if (newSelected.length === 0) {
      return;
    }

    onSettingsChange({
      ...settings,
      agentCount: newSelected.length,
      selectedAgentIds: newSelected,
    });
  };

  return (
    <div className={cn('flex items-center gap-2', className)} data-testid={_agentSelectionTestId} {...props}>
      <Users aria-hidden className={'size-4'} />
      <span className={'text-sm font-medium'}>Select Agents</span>
      <Badge variant={_badgeVariant}>
        {_selectedCount} Agent{_selectedCount !== 1 ? 's' : ''}
      </Badge>

      <Popover>
        <PopoverTrigger asChild>
          <Button size={'sm'} variant={'ghost'}>
            Choose
          </Button>
        </PopoverTrigger>
        <PopoverContent align={'end'} className={'w-96'}>
          <div className={'space-y-4'}>
            <div>
              <h4 className={'leading-none font-medium'}>Select Refinement Agents</h4>
              <p className={'text-sm text-muted-foreground'}>
                Choose which agents will refine your feature request
              </p>
            </div>

            {/* Agent Selection */}
            <div className={'space-y-3'}>
              {agents.map((agent) => {
                const isSelected = _selectedAgentIds.includes(agent.agentId);
                return (
                  <div className={'flex items-start space-x-3 rounded-md border p-3'} key={agent.agentId}>
                    <Checkbox
                      checked={isSelected}
                      id={agent.agentId}
                      onCheckedChange={() => {
                        handleToggleAgent(agent.agentId);
                      }}
                    />
                    <div className={'flex-1 space-y-1'}>
                      <Label
                        className={'cursor-pointer text-sm leading-none font-medium'}
                        htmlFor={agent.agentId}
                      >
                        {agent.name}
                      </Label>
                      <p className={'text-xs text-muted-foreground'}>{agent.role}</p>
                      <p className={'text-xs text-muted-foreground'}>Focus: {agent.focus}</p>
                      <div className={'flex items-center gap-2 text-xs text-muted-foreground'}>
                        <span>Temperature: {agent.temperature}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className={'text-xs text-muted-foreground'}>
              Select multiple agents for diverse perspectives. Each agent provides unique insights based on
              their expertise.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

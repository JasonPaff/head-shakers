'use client';

import type { ComponentProps } from 'react';

import { SettingsIcon } from 'lucide-react';

import type { ComponentTestIdProps } from '@/lib/test-ids';
import type { RefinementSettings as RefinementSettingsType } from '@/lib/validations/feature-planner.validation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface RefinementSettingsProps extends ComponentProps<'div'>, ComponentTestIdProps {
  isExpanded: boolean;
  onSettingsChange: (settings: RefinementSettingsType) => void;
  onToggleExpanded: () => void;
  settings: RefinementSettingsType;
}

export const RefinementSettings = ({
  className,
  isExpanded,
  onSettingsChange,
  onToggleExpanded,
  settings,
  testId,
  ...props
}: RefinementSettingsProps) => {
  const settingsTestId = testId || generateTestId('feature', 'card');

  const updateSetting = <K extends keyof RefinementSettingsType>(
    key: K,
    value: RefinementSettingsType[K],
  ): void => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  const getAgentCountBadgeVariant = () => {
    if (settings.agentCount === 1) return 'secondary';
    if (settings.agentCount <= 3) return 'default';
    return 'destructive';
  };

  return (
    <div className={cn('space-y-4', className)} data-testid={settingsTestId} {...props}>
      {/* Settings Toggle */}
      <div className={'flex items-center justify-between'}>
        <div className={'flex items-center gap-2'}>
          <SettingsIcon aria-hidden className={'size-4'} />
          <span className={'text-sm font-medium'}>Refinement Settings</span>
          <Badge variant={getAgentCountBadgeVariant()}>
            {settings.agentCount} Agent{settings.agentCount !== 1 ? 's' : ''}
          </Badge>
        </div>
        <Button onClick={onToggleExpanded} size={'sm'} variant={'ghost'}>
          {isExpanded ? 'Hide' : 'Show'} Settings
        </Button>
      </div>

      {/* Expanded Settings Panel */}
      <Conditional isCondition={isExpanded}>
        <Card>
          <CardHeader>
            <CardTitle className={'text-lg'}>Advanced Refinement Configuration</CardTitle>
          </CardHeader>
          <CardContent className={'space-y-6'}>
            {/* Agent Count */}
            <div className={'space-y-3'}>
              <div className={'flex items-center justify-between'}>
                <Label htmlFor={'agent-count'}>Number of Parallel Agents</Label>
                <Badge variant={getAgentCountBadgeVariant()}>
                  {settings.agentCount} Agent{settings.agentCount !== 1 ? 's' : ''}
                </Badge>
              </div>
              <Select
                onValueChange={(value) => {
                  updateSetting('agentCount', parseInt(value, 10));
                }}
                value={settings.agentCount.toString()}
              >
                <SelectTrigger id={'agent-count'}>
                  <SelectValue placeholder={'Select agent count'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={'1'}>1 Agent (Fastest)</SelectItem>
                  <SelectItem value={'2'}>2 Agents</SelectItem>
                  <SelectItem value={'3'}>3 Agents (Recommended)</SelectItem>
                  <SelectItem value={'4'}>4 Agents</SelectItem>
                  <SelectItem value={'5'}>5 Agents (Maximum)</SelectItem>
                </SelectContent>
              </Select>
              <p className={'text-xs text-muted-foreground'}>
                More agents provide diverse refinement options but increase processing time and cost.
              </p>
            </div>

            <Separator />

            {/* Output Length */}
            <div className={'space-y-3'}>
              <div className={'flex items-center justify-between'}>
                <Label htmlFor={'max-output-length'}>Maximum Output Length</Label>
                <Badge variant={'secondary'}>{settings.maxOutputLength} words</Badge>
              </div>
              <Select
                onValueChange={(value) => {
                  updateSetting('maxOutputLength', parseInt(value, 10));
                }}
                value={settings.maxOutputLength.toString()}
              >
                <SelectTrigger id={'max-output-length'}>
                  <SelectValue placeholder={'Select max length'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={'100'}>100 words (Brief)</SelectItem>
                  <SelectItem value={'150'}>150 words (Concise)</SelectItem>
                  <SelectItem value={'250'}>250 words (Recommended)</SelectItem>
                  <SelectItem value={'350'}>350 words (Detailed)</SelectItem>
                  <SelectItem value={'500'}>500 words (Comprehensive)</SelectItem>
                </SelectContent>
              </Select>
              <p className={'text-xs text-muted-foreground'}>
                Maximum word count for each refined request output.
              </p>
            </div>

            <Separator />

            {/* Project Context */}
            <div className={'flex items-center justify-between space-x-2'}>
              <div className={'space-y-1'}>
                <Label htmlFor={'include-context'}>Include Project Context</Label>
                <p className={'text-xs text-muted-foreground'}>
                  Include CLAUDE.md and package.json information in refinement prompts
                </p>
              </div>
              <Switch
                checked={settings.includeProjectContext}
                id={'include-context'}
                onCheckedChange={(checked) => {
                  updateSetting('includeProjectContext', checked);
                }}
              />
            </div>
          </CardContent>
        </Card>
      </Conditional>
    </div>
  );
};

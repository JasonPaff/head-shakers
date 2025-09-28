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

  const getTimeoutBadgeVariant = () => {
    if (settings.agentTimeoutMs <= 30000) return 'default';
    if (settings.agentTimeoutMs <= 45000) return 'secondary';
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

            {/* Timeout Settings */}
            <div className={'space-y-3'}>
              <div className={'flex items-center justify-between'}>
                <Label htmlFor={'agent-timeout'}>Agent Timeout</Label>
                <Badge variant={getTimeoutBadgeVariant()}>
                  {Math.round(settings.agentTimeoutMs / 1000)}s
                </Badge>
              </div>
              <Select
                onValueChange={(value) => {
                  updateSetting('agentTimeoutMs', parseInt(value, 10));
                }}
                value={settings.agentTimeoutMs.toString()}
              >
                <SelectTrigger id={'agent-timeout'}>
                  <SelectValue placeholder={'Select timeout'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={'15000'}>15s (Fast)</SelectItem>
                  <SelectItem value={'30000'}>30s (Recommended)</SelectItem>
                  <SelectItem value={'45000'}>45s (Patient)</SelectItem>
                  <SelectItem value={'60000'}>60s (Maximum)</SelectItem>
                </SelectContent>
              </Select>
              <p className={'text-xs text-muted-foreground'}>
                Maximum time to wait for each agent response before timing out.
              </p>
            </div>

            <Separator />

            {/* Refinement Style */}
            <div className={'space-y-3'}>
              <Label htmlFor={'refinement-style'}>Refinement Style</Label>
              <Select
                onValueChange={(value) => {
                  updateSetting('refinementStyle', value as RefinementSettingsType['refinementStyle']);
                }}
                value={settings.refinementStyle}
              >
                <SelectTrigger id={'refinement-style'}>
                  <SelectValue placeholder={'Select refinement style'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={'conservative'}>
                    <div className={'space-y-1'}>
                      <div className={'font-medium'}>Conservative</div>
                      <div className={'text-xs text-muted-foreground'}>
                        Minimal technical context, preserves original wording
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value={'balanced'}>
                    <div className={'space-y-1'}>
                      <div className={'font-medium'}>Balanced</div>
                      <div className={'text-xs text-muted-foreground'}>
                        Moderate technical details following project patterns
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value={'detailed'}>
                    <div className={'space-y-1'}>
                      <div className={'font-medium'}>Detailed</div>
                      <div className={'text-xs text-muted-foreground'}>
                        Comprehensive technical context and integration details
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Technical Detail Level */}
            <div className={'space-y-3'}>
              <Label htmlFor={'detail-level'}>Technical Detail Level</Label>
              <Select
                onValueChange={(value) => {
                  updateSetting(
                    'technicalDetailLevel',
                    value as RefinementSettingsType['technicalDetailLevel'],
                  );
                }}
                value={settings.technicalDetailLevel}
              >
                <SelectTrigger id={'detail-level'}>
                  <SelectValue placeholder={'Select detail level'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={'minimal'}>
                    <div className={'space-y-1'}>
                      <div className={'font-medium'}>Minimal</div>
                      <div className={'text-xs text-muted-foreground'}>
                        Only essential technology mentions
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value={'moderate'}>
                    <div className={'space-y-1'}>
                      <div className={'font-medium'}>Moderate</div>
                      <div className={'text-xs text-muted-foreground'}>
                        Key technologies and integration points
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value={'comprehensive'}>
                    <div className={'space-y-1'}>
                      <div className={'font-medium'}>Comprehensive</div>
                      <div className={'text-xs text-muted-foreground'}>
                        Detailed technology stack and architectural considerations
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
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

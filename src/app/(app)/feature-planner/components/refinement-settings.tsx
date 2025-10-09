'use client';

import type { ComponentProps } from 'react';

import { SettingsIcon } from 'lucide-react';

import type { RefinementSettings as RefinementSettingsType } from '@/lib/validations/feature-planner.validation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface RefinementSettingsProps extends ComponentProps<'div'> {
  onSettingsChange: (settings: RefinementSettingsType) => void;
  settings: RefinementSettingsType;
}

export const RefinementSettings = ({
  className,
  onSettingsChange,
  settings,
  ...props
}: RefinementSettingsProps) => {
  const handleUpdateSetting = <K extends keyof RefinementSettingsType>(
    key: K,
    value: RefinementSettingsType[K],
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  const _settingsTestId = generateTestId('feature', 'card');

  const _badgeVariant =
    settings.agentCount === 1 ? 'secondary'
    : settings.agentCount <= 3 ? 'default'
    : 'destructive';

  return (
    <div className={cn('flex items-center gap-2', className)} data-testid={_settingsTestId} {...props}>
      <SettingsIcon aria-hidden className={'size-4'} />
      <span className={'text-sm font-medium'}>Refinement Settings</span>
      <Badge variant={_badgeVariant}>
        {settings.agentCount} Agent{settings.agentCount !== 1 ? 's' : ''}
      </Badge>

      <Popover>
        <PopoverTrigger asChild>
          <Button size={'sm'} variant={'ghost'}>
            Settings
          </Button>
        </PopoverTrigger>
        <PopoverContent align={'end'} className={'w-80'}>
          <div className={'space-y-4'}>
            <div>
              <h4 className={'leading-none font-medium'}>Refinement Configuration</h4>
              <p className={'text-sm text-muted-foreground'}>Adjust settings for the refinement process</p>
            </div>

            {/* Agent Count */}
            <div className={'space-y-3'}>
              <div className={'flex items-center justify-between'}>
                <Label htmlFor={'agent-count'}>Number of Parallel Agents</Label>
                <Badge variant={_badgeVariant}>
                  {settings.agentCount} Agent{settings.agentCount !== 1 ? 's' : ''}
                </Badge>
              </div>
              <Select
                onValueChange={(value) => {
                  handleUpdateSetting('agentCount', parseInt(value, 10));
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
                  handleUpdateSetting('maxOutputLength', parseInt(value, 10));
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
                  handleUpdateSetting('includeProjectContext', checked);
                }}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

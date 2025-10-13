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

  return (
    <div className={cn('flex items-center gap-2', className)} data-testid={_settingsTestId} {...props}>
      <SettingsIcon aria-hidden className={'size-4'} />
      <span className={'text-sm font-medium'}>Configuration</span>

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
              <p className={'text-sm text-muted-foreground'}>Adjust output settings for the refinement process</p>
            </div>

            {/* Output Length */}
            <div className={'space-y-3'}>
              <div className={'flex items-center justify-between'}>
                <Label htmlFor={'min-output-length'}>Minimum Output Length</Label>
                <Badge variant={'secondary'}>{settings.minOutputLength} words</Badge>
              </div>
              <Select
                onValueChange={(value) => {
                  handleUpdateSetting('minOutputLength', parseInt(value, 10));
                }}
                value={settings.minOutputLength.toString()}
              >
                <SelectTrigger id={'min-output-length'}>
                  <SelectValue placeholder={'Select min length'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={'50'}>50 words (Very Brief)</SelectItem>
                  <SelectItem value={'100'}>100 words (Brief)</SelectItem>
                  <SelectItem value={'150'}>150 words (Recommended)</SelectItem>
                  <SelectItem value={'200'}>200 words (Moderate)</SelectItem>
                  <SelectItem value={'250'}>250 words (Detailed)</SelectItem>
                </SelectContent>
              </Select>
              <p className={'text-xs text-muted-foreground'}>
                Minimum word count required for each refined request output.
              </p>
            </div>

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

            <Separator />

            {/* Synthesis Agent */}
            <div className={'flex items-center justify-between space-x-2'}>
              <div className={'space-y-1'}>
                <Label htmlFor={'enable-synthesis'}>Enable Synthesis Agent</Label>
                <p className={'text-xs text-muted-foreground'}>
                  Combine multiple refinements into a comprehensive synthesis (requires 2+ agents)
                </p>
              </div>
              <Switch
                checked={settings.enableSynthesis ?? false}
                id={'enable-synthesis'}
                onCheckedChange={(checked) => {
                  handleUpdateSetting('enableSynthesis', checked);
                }}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

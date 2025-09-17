'use client';

import { InfoIcon, StarIcon } from 'lucide-react';

import { addItemFormOptions } from '@/app/(app)/bobbleheads/add/components/add-item-form-options';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withForm } from '@/components/ui/form';
import { cn } from '@/utils/tailwind-utils';

export const BasicInformation = withForm({
  ...addItemFormOptions,
  render: ({ form }) => {
    return (
      <Card>
        <CardHeader>
          {/* Title / Description */}
          <div className={'flex items-center gap-3'}>
            <div className={'flex size-10 items-center justify-center rounded-xl bg-blue-500 shadow-sm'}>
              <InfoIcon aria-hidden className={'size-5 text-white'} />
            </div>
            <div>
              <CardTitle className={'text-xl font-semibold text-foreground'}>Basic Information</CardTitle>
              <CardDescription className={'text-muted-foreground'}>
                Tell us about your bobblehead - the details that make it special
              </CardDescription>
            </div>
          </div>

          {/* Info tip */}
          <div className={'flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400'}>
            <StarIcon className={'size-3 fill-current'} />
            <span>More fields filled out will help others discover your collection</span>
          </div>
        </CardHeader>

        <CardContent className={'space-y-6'}>
          {/* Name and Character Name Row */}
          <div className={'grid grid-cols-1 gap-6 md:grid-cols-2'}>
            {/* Name - Enhanced with styling */}
            <div className={'space-y-2'}>
              <form.AppField name={'name'}>
                {(field) => (
                  <field.TextField
                    description={'Give your bobblehead a descriptive name that collectors will remember'}
                    isRequired
                    label={'Bobblehead Name'}
                    placeholder={'e.g., "Babe Ruth Yankees Bobblehead"'}
                  />
                )}
              </form.AppField>
            </div>

            {/* Character Name */}
            <div className={'space-y-2'}>
              <form.AppField name={'characterName'}>
                {(field) => (
                  <field.TextField
                    description={'Who does this bobblehead represent?'}
                    label={'Character/Person Name'}
                    placeholder={'e.g., "Babe Ruth" or "Mickey Mouse"'}
                  />
                )}
              </form.AppField>
            </div>
          </div>

          {/* Description */}
          <div className={'space-y-2'}>
            <form.AppField name={'description'}>
              {(field) => (
                <field.TextareaField
                  className={'min-h-[120px] resize-none'}
                  description={'Tell other collectors what makes this bobblehead unique'}
                  label={'Description'}
                  placeholder={
                    'Share the story behind this bobblehead... Where did you find it? What makes it special? Any interesting details about its condition or rarity?'
                  }
                />
              )}
            </form.AppField>
          </div>

          {/* Category, Series, and Year Row */}
          <div className={'grid grid-cols-1 gap-6 md:grid-cols-3'}>
            {/* Category */}
            <div className={'space-y-2'}>
              <form.AppField name={'category'}>
                {(field) => (
                  <field.TextField
                    description={'Help others find similar collectibles'}
                    label={'Category'}
                    placeholder={'Sports, Movies, TV Shows...'}
                  />
                )}
              </form.AppField>
            </div>

            {/* Series */}
            <div className={'space-y-2'}>
              <form.AppField name={'series'}>
                {(field) => (
                  <field.TextField
                    description={'Part of a larger set or series?'}
                    label={'Series/Collection'}
                    placeholder={'e.g., "MLB Stadium Giveaway"'}
                  />
                )}
              </form.AppField>
            </div>

            {/* Year */}
            <div className={'space-y-2'}>
              <form.AppField name={'year'}>
                {(field) => (
                  <field.TextField
                    description={'When was it made or released?'}
                    label={'Year Released'}
                    placeholder={'2024'}
                    type={'number'}
                  />
                )}
              </form.AppField>
            </div>
          </div>

          {/* Progress indicator */}
          <div
            className={cn(
              'mt-6 flex items-center justify-between rounded-lg',
              'bg-blue-100 p-3 dark:bg-blue-950/40',
            )}
          >
            <div className={'flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300'}>
              <div className={'size-2 rounded-full bg-blue-500'} />
              <span>Great start! Add photos next to bring your bobblehead to life.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
});

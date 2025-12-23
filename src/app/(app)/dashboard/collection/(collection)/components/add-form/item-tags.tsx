/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { StarIcon, Tag } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withForm } from '@/components/ui/form';

import { addItemFormOptions } from './add-item-form-options';
import { AnimatedMotivationalMessage } from './animated-motivational-message';
import { useMotivationalMessage } from './hooks/use-motivational-message';

export const ItemTags = withForm({
  ...addItemFormOptions,
  render: ({ form }) => {
    const { shouldShowMessage } = useMotivationalMessage(form, {
      optionalFields: ['tags'],
    });

    return (
      <Card>
        <CardHeader className={'relative'}>
          {/* Title / Description */}
          <div className={'flex items-center gap-3'}>
            <div className={'flex size-10 items-center justify-center rounded-lg bg-pink-500 shadow-sm'}>
              <Tag aria-hidden className={'size-5 text-white'} />
            </div>
            <div>
              <CardTitle className={'text-xl font-semibold text-foreground'}>Tags</CardTitle>
              <CardDescription className={'text-muted-foreground'}>
                Add tags to help organize and discover your bobblehead
              </CardDescription>
            </div>
          </div>

          {/* Info tip */}
          <div className={'flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400'}>
            <StarIcon className={'size-3 fill-current'} />
            <span>Good tags make your bobblehead easier to find and help connect with other collectors</span>
          </div>
        </CardHeader>

        <CardContent className={'relative space-y-6'}>
          <div className={'space-y-2'}>
            <form.AppField name={'tags'}>
              {(field) => (
                <field.TagField
                  description={
                    'Press Enter or comma to add tags. Try using terms like teams, players, themes, or special features.'
                  }
                  label={'Tags'}
                  placeholder={'yankees, baseball, vintage, limited-edition...'}
                />
              )}
            </form.AppField>
          </div>

          {/* Progress indicator */}
          <AnimatedMotivationalMessage
            className={'bg-pink-100 dark:bg-pink-950/40'}
            shouldShow={shouldShowMessage}
          >
            <div className={'flex items-center gap-2 text-sm text-pink-700 dark:text-pink-300'}>
              <div className={'size-2 rounded-full bg-pink-500'} />
              <span>Awesome! Tags help collectors discover your amazing finds.</span>
            </div>
          </AnimatedMotivationalMessage>
        </CardContent>
      </Card>
    );
  },
});

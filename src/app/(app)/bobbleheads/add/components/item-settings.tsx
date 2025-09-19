'use client';

import { EyeIcon, StarIcon } from 'lucide-react';

import { addItemFormOptions } from '@/app/(app)/bobbleheads/add/components/add-item-form-options';
import { AnimatedMotivationalMessage } from '@/app/(app)/bobbleheads/add/components/animated-motivational-message';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withForm } from '@/components/ui/form';
import { ENUMS } from '@/lib/constants';

const statusOptions = ENUMS.BOBBLEHEAD.STATUS.map((status) => ({
  label: status,
  value: status,
}));

export const ItemSettings = withForm({
  ...addItemFormOptions,
  render: ({ form }) => {
    return (
      <Card>
        <CardHeader className={'relative'}>
          {/* Title / Description */}
          <div className={'flex items-center gap-3'}>
            <div className={'flex size-10 items-center justify-center rounded-xl bg-slate-500 shadow-sm'}>
              <EyeIcon aria-hidden className={'size-5 text-white'} />
            </div>
            <div>
              <CardTitle className={'text-xl font-semibold text-foreground'}>Settings</CardTitle>
              <CardDescription className={'text-muted-foreground'}>
                Control how your bobblehead appears to other collectors
              </CardDescription>
            </div>
          </div>

          {/* Info tip */}
          <div className={'flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400'}>
            <StarIcon className={'size-3 fill-current'} />
            <span>
              Public items can be discovered by other collectors, while private items are just for you
            </span>
          </div>
        </CardHeader>

        <CardContent className={'relative space-y-6'}>
          <div className={'space-y-6'}>
            {/* Status */}
            <div className={'space-y-2'}>
              <form.AppField name={'status'}>
                {(field) => (
                  <field.SelectField
                    description={'Current ownership and availability status'}
                    label={'Status'}
                    options={statusOptions}
                    placeholder={'Select a status'}
                  />
                )}
              </form.AppField>
            </div>

            {/* Is Public */}
            <div className={'space-y-2'}>
              <form.AppField name={'isPublic'}>
                {(field) => (
                  <field.SwitchField
                    description={'Allow other collectors to see this bobblehead'}
                    label={'Make this bobblehead public'}
                  />
                )}
              </form.AppField>
            </div>

            {/* Is Featured */}
            <div className={'space-y-2'}>
              <form.AppField name={'isFeatured'}>
                {(field) => (
                  <field.SwitchField
                    description={'Highlight this as one of your premium pieces'}
                    label={'Feature this bobblehead'}
                  />
                )}
              </form.AppField>
            </div>
          </div>

          {/* Progress indicator */}
          <AnimatedMotivationalMessage className={'bg-slate-100 dark:bg-slate-950/40'} shouldShow={true}>
            <div className={'flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300'}>
              <div className={'size-2 rounded-full bg-slate-500'} />
              <span>Almost done! Your bobblehead is ready to join your collection.</span>
            </div>
          </AnimatedMotivationalMessage>
        </CardContent>
      </Card>
    );
  },
});

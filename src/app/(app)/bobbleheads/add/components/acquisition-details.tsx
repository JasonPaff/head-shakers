/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { ShoppingCartIcon, StarIcon } from 'lucide-react';

import { addItemFormOptions } from '@/app/(app)/bobbleheads/add/components/add-item-form-options';
import { AnimatedMotivationalMessage } from '@/app/(app)/bobbleheads/add/components/animated-motivational-message';
import { useMotivationalMessage } from '@/app/(app)/bobbleheads/add/hooks/use-motivational-message';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withForm } from '@/components/ui/form';

export const AcquisitionDetails = withForm({
  ...addItemFormOptions,
  render: ({ form }) => {
    const { shouldShowMessage } = useMotivationalMessage(form, {
      optionalFields: ['acquisitionDate', 'acquisitionMethod', 'purchaseLocation', 'purchasePrice'],
    });

    return (
      <Card>
        <CardHeader className={'relative'}>
          {/* Title / Description */}
          <div className={'flex items-center gap-3'}>
            <div className={'flex size-10 items-center justify-center rounded-xl bg-orange-500 shadow-sm'}>
              <ShoppingCartIcon aria-hidden className={'size-5 text-white'} />
            </div>
            <div>
              <CardTitle className={'text-xl font-semibold text-foreground'}>Acquisition Details</CardTitle>
              <CardDescription className={'text-muted-foreground'}>
                Tell the story of how you acquired this special bobblehead
              </CardDescription>
            </div>
          </div>

          {/* Info tip */}
          <div className={'flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400'}>
            <StarIcon aria-hidden className={'size-3 fill-current'} />
            <span>These details add personal history and help track your collection&apos;s growth</span>
          </div>
        </CardHeader>

        <CardContent className={'relative space-y-6'}>
          <div className={'grid grid-cols-1 gap-6 md:grid-cols-2'}>
            {/* Acquisition Date */}
            <div className={'space-y-2'}>
              <form.AppField name={'acquisitionDate'}>
                {(field) => (
                  <field.TextField
                    description={'When did you add this to your collection?'}
                    label={'Acquisition Date'}
                    placeholder={'Pick a date'}
                    type={'date'}
                  />
                )}
              </form.AppField>
            </div>

            {/* Acquisition Method */}
            <div className={'space-y-2'}>
              <form.AppField name={'acquisitionMethod'}>
                {(field) => (
                  <field.TextField
                    description={'How did you acquire this bobblehead?'}
                    label={'Acquisition Method'}
                    placeholder={'Purchase, Gift, Trade, Stadium Giveaway...'}
                  />
                )}
              </form.AppField>
            </div>
          </div>

          <div className={'grid grid-cols-1 gap-6 md:grid-cols-2'}>
            {/* Purchase Location */}
            <div className={'space-y-2'}>
              <form.AppField name={'purchaseLocation'}>
                {(field) => (
                  <field.TextField
                    description={'Where did you find this treasure?'}
                    label={'Purchase Location'}
                    placeholder={'eBay, Stadium Store, Card Show...'}
                  />
                )}
              </form.AppField>
            </div>

            {/* Purchase Price */}
            <div className={'space-y-2'}>
              <form.AppField name={'purchasePrice'}>
                {(field) => (
                  <field.TextField
                    description={'Optional: track your investment'}
                    label={'Purchase Price ($)'}
                    placeholder={'25.99'}
                    type={'number'}
                  />
                )}
              </form.AppField>
            </div>
          </div>

          {/* Progress indicator */}
          <AnimatedMotivationalMessage
            className={'bg-orange-100 dark:bg-orange-950/40'}
            shouldShow={shouldShowMessage}
          >
            <div className={'flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300'}>
              <div className={'size-2 rounded-full bg-orange-500'} />
              <span>Great! You&apos;re building a detailed record of your collection&apos;s history.</span>
            </div>
          </AnimatedMotivationalMessage>
        </CardContent>
      </Card>
    );
  },
});

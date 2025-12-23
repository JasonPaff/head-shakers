/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { RulerIcon, StarIcon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withForm } from '@/components/ui/form';
import { ENUMS } from '@/lib/constants';

import { addItemFormOptions } from './add-item-form-options';
import { AnimatedMotivationalMessage } from './animated-motivational-message';
import { useMotivationalMessage } from './hooks/use-motivational-message';

const conditionOptions = ENUMS.BOBBLEHEAD.CONDITION.map((condition) => ({
  label: condition,
  value: condition,
}));

export const PhysicalAttributes = withForm({
  ...addItemFormOptions,
  render: ({ form }) => {
    const { shouldShowMessage } = useMotivationalMessage(form, {
      optionalFields: ['height', 'weight', 'material', 'manufacturer', 'currentCondition'],
    });

    return (
      <Card>
        <CardHeader className={'relative'}>
          {/* Title / Description */}
          <div className={'flex items-center gap-3'}>
            <div className={'flex size-10 items-center justify-center rounded-lg bg-green-500 shadow-sm'}>
              <RulerIcon aria-hidden className={'size-5 text-white'} />
            </div>
            <div>
              <CardTitle className={'text-xl font-semibold text-foreground'}>Physical Attributes</CardTitle>
              <CardDescription className={'text-muted-foreground'}>
                Record the physical characteristics and condition of your bobblehead
              </CardDescription>
            </div>
          </div>

          {/* Info tip */}
          <div className={'flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400'}>
            <StarIcon aria-hidden className={'size-3 fill-current'} />
            <span>Accurate measurements help with authenticity verification and value assessment</span>
          </div>
        </CardHeader>

        <CardContent className={'relative space-y-6'}>
          <div className={'grid grid-cols-1 gap-6 md:grid-cols-3'}>
            {/* Height */}
            <div className={'space-y-2'}>
              <form.AppField name={'height'}>
                {(field) => (
                  <field.TextField
                    description={'Measure from base to top of head'}
                    label={'Height (centimeters)'}
                    placeholder={'18'}
                    type={'number'}
                  />
                )}
              </form.AppField>
            </div>

            {/* Weight */}
            <div className={'space-y-2'}>
              <form.AppField name={'weight'}>
                {(field) => (
                  <field.TextField
                    description={'Total weight including base'}
                    label={'Weight (grams)'}
                    placeholder={'250'}
                    type={'number'}
                  />
                )}
              </form.AppField>
            </div>

            {/* Material */}
            <div className={'space-y-2'}>
              <form.AppField name={'material'}>
                {(field) => (
                  <field.TextField
                    description={'Primary material composition'}
                    label={'Material'}
                    placeholder={'Resin, Ceramic, Plastic...'}
                  />
                )}
              </form.AppField>
            </div>
          </div>

          <div className={'grid grid-cols-1 gap-6 md:grid-cols-2'}>
            {/* Manufacturer */}
            <div className={'space-y-2'}>
              <form.AppField name={'manufacturer'}>
                {(field) => (
                  <field.TextField
                    description={'Company or brand that produced it'}
                    label={'Manufacturer'}
                    placeholder={'Forever Collectibles, FOCO...'}
                  />
                )}
              </form.AppField>
            </div>

            {/* Condition */}
            <div className={'space-y-2'}>
              <form.AppField name={'currentCondition'}>
                {(field) => (
                  <field.SelectField
                    description={'Assess the overall condition honestly'}
                    label={'Current Condition'}
                    options={conditionOptions}
                    placeholder={'Select the current condition'}
                  />
                )}
              </form.AppField>
            </div>
          </div>

          {/* Progress indicator */}
          <AnimatedMotivationalMessage
            className={'bg-green-100 dark:bg-green-950/40'}
            shouldShow={shouldShowMessage}
          >
            <div className={'flex items-center gap-2 text-sm text-green-700 dark:text-green-300'}>
              <div className={'size-2 rounded-full bg-green-500'} />
              <span>Excellent! These details help establish authenticity and value.</span>
            </div>
          </AnimatedMotivationalMessage>
        </CardContent>
      </Card>
    );
  },
});

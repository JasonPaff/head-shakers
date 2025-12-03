/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { Plus, SettingsIcon, StarIcon, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withForm } from '@/components/ui/form';

import { addItemFormOptions } from './add-item-form-options';
import { AnimatedMotivationalMessage } from './animated-motivational-message';
import { useMotivationalMessage } from './hooks/use-motivational-message';

export const CustomFields = withForm({
  ...addItemFormOptions,
  render: ({ form }) => {
    const { shouldShowMessage } = useMotivationalMessage(form, {
      optionalFields: ['customFields'],
    });

    return (
      <Card>
        <CardHeader className={'relative'}>
          {/* Title / Description */}
          <div className={'flex items-center gap-3'}>
            <div className={'flex size-10 items-center justify-center rounded-xl bg-indigo-500 shadow-sm'}>
              <SettingsIcon aria-hidden className={'size-5 text-white'} />
            </div>
            <div>
              <CardTitle className={'text-xl font-semibold text-foreground'}>Custom Fields</CardTitle>
              <CardDescription className={'text-muted-foreground'}>
                Add unique attributes that make your bobblehead special
              </CardDescription>
            </div>
          </div>

          {/* Info tip */}
          <div className={'flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400'}>
            <StarIcon aria-hidden className={'size-3 fill-current'} />
            Custom fields help capture unique details like edition numbers, special features, or rarity info
          </div>
        </CardHeader>

        <CardContent className={'relative space-y-6'}>
          <form.Field mode={'array'} name={'customFields'}>
            {(field) => (
              <div className={'space-y-4'}>
                {field.state.value?.map((_, index) => (
                  <div className={'flex w-full items-end gap-4'} key={index}>
                    {/* Field Name */}
                    <div className={'flex-1 space-y-2'}>
                      <form.AppField name={`customFields[${index}].fieldName`}>
                        {(subfield) => (
                          <subfield.TextField
                            label={'Field Name'}
                            onChange={(e) => {
                              subfield.handleChange(e.target.value);
                            }}
                            placeholder={'Edition Number, Special Feature...'}
                            value={subfield.state.value}
                          />
                        )}
                      </form.AppField>
                    </div>

                    {/* Value */}
                    <div className={'flex-1 space-y-2'}>
                      <form.AppField name={`customFields[${index}].value`}>
                        {(subfield) => (
                          <subfield.TextField
                            label={'Value'}
                            onChange={(e) => {
                              subfield.handleChange(e.target.value);
                            }}
                            placeholder={'1 of 500, Gold Base, Signed...'}
                            value={subfield.state.value}
                          />
                        )}
                      </form.AppField>
                    </div>

                    {/* Remove */}
                    <Button
                      className={'hover:text-destructive'}
                      onClick={() => {
                        field.removeValue(index);
                      }}
                      size={'icon'}
                      variant={'outline'}
                    >
                      <Trash2 aria-hidden className={'size-4'} />
                    </Button>
                  </div>
                ))}

                {/* Add */}
                <Button
                  className={'w-full border-dashed bg-transparent'}
                  onClick={() => {
                    field.pushValue({ fieldName: '', value: '' });
                  }}
                  type={'button'}
                  variant={'outline'}
                >
                  <Plus aria-hidden className={'size-4'} />
                  Add Custom Field
                </Button>
              </div>
            )}
          </form.Field>

          {/* Progress indicator */}
          <AnimatedMotivationalMessage
            className={'bg-indigo-100 dark:bg-indigo-950/40'}
            shouldShow={shouldShowMessage}
          >
            <div className={'flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300'}>
              <div className={'size-2 rounded-full bg-indigo-500'} />
              <span>Perfect! These custom details make your bobblehead truly unique.</span>
            </div>
          </AnimatedMotivationalMessage>
        </CardContent>
      </Card>
    );
  },
});

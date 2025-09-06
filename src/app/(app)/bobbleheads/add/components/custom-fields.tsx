'use client';

import { Plus, Trash2 } from 'lucide-react';

import { addItemFormOptions } from '@/app/(app)/bobbleheads/add/components/add-item-form-options';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withForm } from '@/components/ui/form';

export const CustomFields = withForm({
  ...addItemFormOptions,
  render: ({ form }) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custom Fields</CardTitle>
          <CardDescription>Add custom attributes specific to this bobblehead</CardDescription>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          <form.Field mode={'array'} name={'customFields'}>
            {(field) => (
              <div className={'space-y-4'}>
                {field.state.value?.map((_, index) => (
                  <div className={'flex w-full items-end gap-2'} key={index}>
                    {/* Field Name */}
                    <div className={'flex-1'}>
                      <form.AppField name={`customFields[${index}].fieldName`}>
                        {(subfield) => (
                          <subfield.TextField
                            label={'Field Name'}
                            onChange={(e) => {
                              subfield.handleChange(e.target.value);
                            }}
                            placeholder={'e.g., Edition Number'}
                            value={subfield.state.value}
                          />
                        )}
                      </form.AppField>
                    </div>

                    {/* Value */}
                    <div className={'flex-1'}>
                      <form.AppField name={`customFields[${index}].value`}>
                        {(subfield) => (
                          <subfield.TextField
                            label={'Value'}
                            onChange={(e) => {
                              subfield.handleChange(e.target.value);
                            }}
                            placeholder={'e.g., 1 of 500'}
                            value={subfield.state.value}
                          />
                        )}
                      </form.AppField>
                    </div>

                    {/* Remove */}
                    <Button
                      className={'h-9 hover:text-destructive'}
                      onClick={() => {
                        field.removeValue(index);
                      }}
                      size={'sm'}
                      variant={'outline'}
                    >
                      <Trash2 aria-hidden className={'size-4'} />
                    </Button>
                  </div>
                ))}

                {/* Add */}
                <Button
                  className={'w-full bg-transparent'}
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
        </CardContent>
      </Card>
    );
  },
});

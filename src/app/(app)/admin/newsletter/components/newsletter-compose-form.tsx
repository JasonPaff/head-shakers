'use client';

import { revalidateLogic } from '@tanstack/form-core';
import { useStore } from '@tanstack/react-form';
import { FileTextIcon, SendIcon, XIcon } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { newsletterComposeFormOptions } from '@/app/(app)/admin/newsletter/components/newsletter-compose-form-options';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { useAppForm } from '@/components/ui/form';
import { useFocusContext } from '@/components/ui/form/focus-management/focus-context';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { useServerAction } from '@/hooks/use-server-action';
import { useToggle } from '@/hooks/use-toggle';
import {
  createTemplateAction,
  getTemplateByIdAction,
  getTemplatesAction,
  sendNewsletterAction,
} from '@/lib/actions/newsletter/newsletter-admin.actions';
import { SCHEMA_LIMITS } from '@/lib/constants';
import { sendNewsletterSchema } from '@/lib/validations/newsletter.validation';

type NewsletterComposeFormProps = {
  onClose: VoidFunction;
  onSuccess?: VoidFunction;
};

export const NewsletterComposeForm = withFocusManagement(
  ({ onClose, onSuccess }: NewsletterComposeFormProps) => {
    const [templates, setTemplates] = useState<Array<{ id: string; title: string }>>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useToggle(true);
    const [isLoadingTemplate, setIsLoadingTemplate] = useToggle(false);
    const [isSavingTemplate, setIsSavingTemplate] = useToggle(false);

    const { focusFirstError } = useFocusContext();
    const { executeAsync: getTemplates } = useAction(getTemplatesAction);
    const { executeAsync: getTemplateById } = useAction(getTemplateByIdAction);

    const { executeAsync: sendNewsletterAsync, isExecuting: isSending } = useServerAction(
      sendNewsletterAction,
      {
        onSuccess: ({ data: resultData }) => {
          toast.success(
            `Newsletter sent successfully to ${resultData.data.successCount} subscribers!${
              resultData.data.failedCount > 0 ? ` (${resultData.data.failedCount} failed)` : ''
            }`,
          );
          onSuccess?.();
          onClose();
        },
        toastMessages: {
          error: 'Failed to send newsletter. Please try again.',
          loading: 'Sending newsletter...',
          success: '', // Custom success message handled in onSuccess
        },
      },
    );

    const { executeAsync: saveTemplateAsync } = useServerAction(createTemplateAction, {
      onSuccess: () => {
        toast.success('Template saved successfully!');
        setIsSavingTemplate.off();
        // Refresh templates list
        getTemplates()
          .then((result) => {
            if (result?.data) {
              setTemplates(
                result.data.data.map((t: { id: string; title: string }) => ({
                  id: t.id,
                  title: t.title,
                })),
              );
            }
          })
          .catch(() => {
            // Error already logged, silent catch
          });
      },
      toastMessages: {
        error: 'Failed to save template. Please try again.',
        loading: 'Saving template...',
        success: '', // Custom success message handled in onSuccess
      },
    });

    const form = useAppForm({
      ...newsletterComposeFormOptions,
      canSubmitWhenInvalid: true,
      onSubmit: async ({ value }) => {
        await sendNewsletterAsync(value);
      },
      onSubmitInvalid: ({ formApi }) => {
        focusFirstError(formApi);
      },
      validationLogic: revalidateLogic({
        mode: 'submit',
        modeAfterSubmission: 'change',
      }),
      validators: {
        onSubmit: sendNewsletterSchema,
      },
    });

    // Load templates on mount
    useEffect(() => {
      setIsLoadingTemplates.on();
      getTemplates()
        .then((result) => {
          if (result?.data) {
            setTemplates(
              result.data.data.map((t: { id: string; title: string }) => ({
                id: t.id,
                title: t.title,
              })),
            );
          }
        })
        .catch((error) => {
          console.error('Error fetching templates:', error);
          toast.error('Failed to load templates');
        })
        .finally(setIsLoadingTemplates.off);
    }, [getTemplates, setIsLoadingTemplates]);

    const currentSubject = useStore(form.store, (state) => state.values.subject);
    const currentBodyHtml = useStore(form.store, (state) => state.values.bodyHtml);

    const handleTemplateSelect = async (templateId: string) => {
      if (!templateId) {
        form.setFieldValue('templateId', undefined);
        return;
      }

      setIsLoadingTemplate.on();
      try {
        const result = await getTemplateById({ id: templateId });
        if (result?.data) {
          const template = result.data.data;
          form.setFieldValue('templateId', templateId);
          form.setFieldValue('subject', template.subject);
          await form.validateField('subject', 'change');
          form.setFieldValue('bodyHtml', template.bodyHtml);
          await form.validateField('bodyHtml', 'change');
          toast.success('Template loaded successfully!');
        }
      } catch {
        toast.error('Failed to load template');
      } finally {
        setIsLoadingTemplate.off();
      }
    };

    const handleSaveAsTemplate = async () => {
      if (!currentSubject || !currentBodyHtml) {
        toast.error('Please enter subject and body content before saving as template');
        return;
      }

      setIsSavingTemplate.on();
      try {
        await saveTemplateAsync({
          bodyHtml: currentBodyHtml,
          bodyMarkdown: currentBodyHtml, // For now, use HTML as markdown too
          subject: currentSubject,
          title: currentSubject, // Use subject as title by default
        });
      } catch {
        setIsSavingTemplate.off();
      }
    };

    const _subjectCharCount = currentSubject.length;
    const _bodyCharCount = currentBodyHtml.length;
    const _isSubmitting = isSending || isSavingTemplate;
    const _hasContent = !!currentSubject && !!currentBodyHtml;

    return (
      <Card>
        <CardHeader>
          <div className={'flex items-center justify-between'}>
            {/* Title */}
            <div>
              <CardTitle>Compose Newsletter</CardTitle>
              <CardDescription>Create and send newsletter to your subscribers</CardDescription>
            </div>

            {/* Close Button */}
            <Button onClick={onClose} size={'sm'} variant={'ghost'}>
              <XIcon aria-hidden aria-label={'close'} className={'size-4'} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form
            className={'space-y-6'}
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
          >
            {/* Template Selection */}
            <div className={'space-y-4'}>
              <form.AppField
                listeners={{
                  onChange: ({ value }) => {
                    void handleTemplateSelect(value as string);
                  },
                }}
                name={'templateId'}
              >
                {(field) => (
                  <field.SelectField
                    description={'Load a saved template to pre-fill content'}
                    label={'Template (Optional)'}
                    options={[
                      { label: 'None - Start from scratch', value: '' },
                      ...templates.map((t) => ({ label: t.title, value: t.id })),
                    ]}
                    placeholder={isLoadingTemplates ? 'Loading templates...' : 'Select a template'}
                  />
                )}
              </form.AppField>
            </div>

            {/* Newsletter Content */}
            <div className={'space-y-4'}>
              <h3 className={'font-semibold'}>Newsletter Content</h3>

              {/* Subject Line */}
              <form.AppField name={'subject'}>
                {(field) => (
                  <div className={'space-y-1'}>
                    <field.TextField
                      disabled={isLoadingTemplate}
                      isRequired
                      label={'Subject Line'}
                      placeholder={'Enter newsletter subject'}
                    />
                    <div className={'text-xs text-muted-foreground'}>
                      {_subjectCharCount} / {SCHEMA_LIMITS.NEWSLETTER_SIGNUP.EMAIL.MAX} characters
                    </div>
                  </div>
                )}
              </form.AppField>

              {/* Body HTML */}
              <form.AppField name={'bodyHtml'}>
                {(field) => (
                  <div className={'space-y-1'}>
                    <field.TextareaField
                      disabled={isLoadingTemplate}
                      isRequired
                      label={'Email Content (HTML)'}
                      placeholder={'<h1>Hello!</h1><p>Your newsletter content here...</p>'}
                      rows={12}
                    />
                    <div className={'text-xs text-muted-foreground'}>
                      {_bodyCharCount} / 100,000 characters (HTML supported)
                    </div>
                  </div>
                )}
              </form.AppField>
            </div>

            {/* Preview Section */}
            <Conditional isCondition={_hasContent}>
              <div className={'space-y-2'}>
                <h3 className={'font-semibold'}>Preview</h3>
                <div className={'rounded-md border bg-background p-4'}>
                  <div className={'mb-2 font-semibold'}>Subject: {currentSubject}</div>
                  <div className={'max-w-none'} dangerouslySetInnerHTML={{ __html: currentBodyHtml }} />
                </div>
              </div>
            </Conditional>

            {/* Recipient Settings */}
            <div className={'space-y-4'}>
              <h3 className={'font-semibold'}>Recipients</h3>
              <form.AppField name={'recipientFilter.status'}>
                {(field) => (
                  <field.SelectField
                    description={'Choose which subscribers will receive this newsletter'}
                    label={'Send To'}
                    options={[
                      { label: 'Active Subscribers Only', value: 'subscribed' },
                      { label: 'All Subscribers (including inactive)', value: 'all' },
                    ]}
                  />
                )}
              </form.AppField>
            </div>

            {/* Form Actions */}
            <form.AppForm>
              <div className={'flex justify-between'}>
                {/* Save as Template Button */}
                <Button
                  disabled={!_hasContent || _isSubmitting}
                  onClick={handleSaveAsTemplate}
                  type={'button'}
                  variant={'outline'}
                >
                  <FileTextIcon className={'mr-2 size-4'} />
                  {isSavingTemplate ? 'Saving...' : 'Save as Template'}
                </Button>

                {/* Send and Cancel Buttons */}
                <div className={'flex space-x-4'}>
                  <Button disabled={_isSubmitting} onClick={onClose} type={'button'} variant={'outline'}>
                    Cancel
                  </Button>
                  <form.SubmitButton isDisabled={_isSubmitting}>
                    <SendIcon className={'mr-2 size-4'} />
                    {isSending ? 'Sending...' : 'Send Newsletter'}
                  </form.SubmitButton>
                </div>
              </div>
            </form.AppForm>
          </form>
        </CardContent>
      </Card>
    );
  },
);

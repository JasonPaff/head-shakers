import type { z } from 'zod';

import { formOptions } from '@tanstack/form-core';

import type { sendNewsletterSchema } from '@/lib/validations/newsletter.validation';

/**
 * Form options for newsletter compose form
 * Provides default values and configuration for sending newsletters
 */
export const newsletterComposeFormOptions = formOptions({
  defaultValues: {
    bodyHtml: '',
    recipientFilter: {
      status: 'subscribed' as const,
    },
    scheduledAt: undefined,
    subject: '',
    templateId: undefined,
  } as z.input<typeof sendNewsletterSchema>,
});

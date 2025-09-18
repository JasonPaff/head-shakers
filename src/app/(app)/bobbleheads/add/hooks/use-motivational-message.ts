import type { AnyFormApi } from '@tanstack/react-form';

import { useStore } from '@tanstack/react-form';
import { useMemo } from 'react';

interface MotivationalMessageConfig {
  optionalFields?: Array<string>;
  requiredFields?: Array<string>;
  shouldAlwaysShow?: boolean;
}

/**
 * Hook to determine when to show motivational messages based on form field states
 */
export function useMotivationalMessage(
  form: AnyFormApi,
  config: MotivationalMessageConfig,
): { shouldShowMessage: boolean } {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const formValues = useStore(form.store, (state) => state.values) as Record<string, unknown>;
  const fieldMeta = useStore(form.store, (state) => state.fieldMeta);

  const shouldShowMessage = useMemo(() => {
    if (config.shouldAlwaysShow) {
      return true;
    }

    const { optionalFields = [], requiredFields = [] } = config;

    // if there are required fields, all must be filled
    if (requiredFields.length > 0) {
      const allRequiredFilled = requiredFields.every((fieldName) => {
        const value = formValues[fieldName];
        return value !== null && value !== undefined && value !== '';
      });

      return allRequiredFilled;
    }

    // if there are only optional fields, show if at least one is filled and blurred
    if (optionalFields.length > 0) {
      const hasFilledAndBlurredField = optionalFields.some((fieldName) => {
        const value = formValues[fieldName];
        const meta = fieldMeta[fieldName];

        // handle array fields like customFields and tags
        if (Array.isArray(value)) {
          const hasArrayValue =
            value.length > 0 &&
            value.some((item: unknown) => {
              // for customFields, check if both fieldName and value are filled
              if (typeof item === 'object' && item !== null) {
                return Object.values(item as Record<string, unknown>).some(
                  (val) => val !== null && val !== undefined && val !== '',
                );
              }
              //fFor simple array items like tags
              return item !== null && item !== undefined && item !== '';
            });
          const hasBeenTouched = meta?.isTouched || false;
          return hasArrayValue && hasBeenTouched;
        }

        // handle regular fields
        const hasValue = value !== null && value !== undefined && value !== '';
        const hasBeenTouched = meta?.isTouched || false;

        return hasValue && hasBeenTouched;
      });

      return hasFilledAndBlurredField;
    }

    // default to not showing if no configuration is provided
    return false;
  }, [formValues, fieldMeta, config]);

  return { shouldShowMessage };
}

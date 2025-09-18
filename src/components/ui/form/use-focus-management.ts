'use client';

import { useCallback, useRef } from 'react';

import type { FocusRef } from '@/components/ui/form/types';

interface FieldRegistration {
  name: string;
  ref: FocusRef;
}

interface FormApiLike {
  getAllErrors: () => {
    fields: Record<string, { errorMap: Record<string, Array<string>>; errors: Array<unknown> }>;
    form: { errorMap: Record<string, Array<string>>; errors: unknown[] };
  };
}

export const useFocusManagement = () => {
  const fieldsMap = useRef<Map<string, FieldRegistration>>(new Map());

  const registerField = useCallback((name: string, ref: FocusRef) => {
    if (ref.current) {
      fieldsMap.current.set(name, { name, ref });
    }
  }, []);

  const unregisterField = useCallback((name: string) => {
    fieldsMap.current.delete(name);
  }, []);

  const focusFirstError = useCallback((formApi: FormApiLike) => {
    // get all errors from the form
    const allErrors = formApi.getAllErrors();
    const fieldErrors = allErrors.fields;

    if (!fieldErrors || Object.keys(fieldErrors).length === 0) {
      return null;
    }

    // get all registered fields that have refs
    const registeredFields = Array.from(fieldsMap.current.values())
      .filter((field) => field.ref.current)
      .map((field) => ({
        ...field,
        element: field.ref.current!,
      }));

    if (registeredFields.length === 0) {
      return null;
    }

    // sort fields by their position in the DOM
    const sortedFields = registeredFields.sort((a, b) => {
      const position = a.element.compareDocumentPosition(b.element);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
        return -1;
      }
      if (position & Node.DOCUMENT_POSITION_PRECEDING) {
        return 1;
      }
      return 0;
    });

    // find the first field with an error
    for (const field of sortedFields) {
      if (fieldErrors[field.name]) {
        // focus the field
        field.element.focus();
        // scroll into view with some padding
        field.element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        return field.name;
      }
    }

    return null;
  }, []);

  return {
    focusFirstError,
    registerField,
    unregisterField,
  };
};

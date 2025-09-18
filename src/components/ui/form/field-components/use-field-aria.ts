'use client';

import { createContext, use } from 'react';

export interface UseFieldAriaContext {
  descriptionId: string;
  errorId: string;
  id: string;
}

export const FieldAriaContext = createContext<null | UseFieldAriaContext>(null);

export const useFieldAria = () => {
  const context = use(FieldAriaContext);
  if (!context) throw new Error('useFieldAria can only be called from within a <FieldAriaProvider>');
  return context;
};

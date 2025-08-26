'use client';

import { useCallback, useEffect, useState } from 'react';

import type { CookieKey, CookieValue } from '@/constants/cookies';

import { CookieService } from '@/services/cookie-service';

export function useCookie<T extends CookieKey>(key: T) {
  const [value, setValue] = useState<CookieValue<T>>(() => CookieService.get(key));

  const updateCookie = useCallback(
    (newValue: unknown) => {
      CookieService.set(key, newValue as 'system');
      setValue(newValue as 'system');
    },
    [key],
  );

  const deleteCookie = useCallback(() => {
    CookieService.delete(key);
    setValue(CookieService.get(key));
  }, [key]);

  // sync with the actual cookie value on mount (handles SSR hydration)
  useEffect(() => {
    const currentValue = CookieService.get(key);
    if (currentValue !== value) {
      setValue(currentValue);
    }
  }, [key, value]);

  return {
    deleteCookie,
    exists: CookieService.exists(key),
    setValue: updateCookie,
    value,
  } as const;
}

'use client';

import { useState } from 'react';

import { useFirstRender } from '@/hooks/use-first-render';
import { isClient } from '@/utils/type-utils';

export const useSystemColorMode = () => {
  const [isPreferColorSchemeDark, setIsPreferColorSchemeDark] = useState(() => {
    if (!isClient) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const _systemColorMode = isPreferColorSchemeDark ? 'dark' : 'light';

  useFirstRender(() => {
    if (!isClient) return;

    const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    setIsPreferColorSchemeDark(mediaQueryList.matches);

    const handleUpdate = () => {
      setIsPreferColorSchemeDark(mediaQueryList.matches);
    };
    mediaQueryList.addEventListener('change', handleUpdate);

    return () => {
      mediaQueryList.removeEventListener('change', handleUpdate);
    };
  });

  return _systemColorMode;
};

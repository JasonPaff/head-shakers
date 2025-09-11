import type { Ref, RefCallback, RefObject } from 'react';

import { useCallback } from 'react';

type PossibleRef<T> = Ref<T> | undefined;

export const mergeInputRefs = <T extends HTMLElement = HTMLInputElement>(
  fieldRef: (instance: null | T) => void,
  inputRef: RefObject<null | T>,
): ((ref: null | T) => void) => {
  return (ref: null | T) => {
    if (!ref) return;

    if (fieldRef) fieldRef(ref);
    if (inputRef) inputRef.current = ref;
  };
};

export const mergeButtonRefs = <T extends HTMLButtonElement>(
  refs: Array<Ref<T> | RefObject<T>>,
): RefCallback<T> => {
  return (value) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(value);
      else if (ref !== null) (ref as RefObject<null | T>).current = value;
    }
  };
};

export const composeRefs = <T>(...refs: Array<PossibleRef<T>>): RefCallback<T> => {
  // @ts-expect-error - don't care
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup === 'function') {
        hasCleanup = true;
      }
      return cleanup;
    });

    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup === 'function') {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
};

const setRef = <T>(ref: PossibleRef<T>, value: T) => {
  if (typeof ref === 'function') {
    return ref(value);
  }

  if (ref !== null && ref !== undefined) {
    ref.current = value;
  }
};

export const useComposedRefs = <T>(...refs: Array<PossibleRef<T>>): RefCallback<T> => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(composeRefs(...refs), refs);
};

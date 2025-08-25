import type { Ref, RefCallback, RefObject } from 'react';

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

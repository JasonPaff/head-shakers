'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type UseToggle = {
  off: () => void;
  on: () => void;
  toggle: () => void;
  update: UseToggleUpdate;
};
type UseToggleOnChange = (newState: boolean) => void;

type UseToggleUpdate = (newValue: ((currentState: boolean) => boolean) | boolean) => void;

const isFunction = (value: unknown) => typeof value === 'function';

export const useToggle = (isInitialToggled = false, onChange?: UseToggleOnChange) => {
  const [state, setState] = useState(isInitialToggled);

  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const update: UseToggleUpdate = useCallback((value) => {
    setState((currentState) => {
      const newState = isFunction(value) ? value(currentState) : value;
      if (newState === currentState) {
        return currentState;
      }
      onChangeRef.current?.(newState);
      return newState;
    });
  }, []);

  const off = useCallback(() => {
    setState((currentState) => {
      if (!currentState) return false;

      onChangeRef.current?.(false);
      return false;
    });
  }, []);

  const on = useCallback(() => {
    setState((currentState) => {
      if (currentState) return true;

      onChangeRef.current?.(true);
      return true;
    });
  }, []);

  const toggle = useCallback(() => {
    setState((prev) => {
      onChangeRef.current?.(!prev);
      return !prev;
    });
  }, []);

  const _setState = useMemo(
    () => ({
      off,
      on,
      toggle,
      update,
    }),
    [off, on, toggle, update],
  );

  return [state, _setState] as const;
};

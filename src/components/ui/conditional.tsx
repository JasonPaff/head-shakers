import type { ReactNode } from 'react';

type ConditionalProps = Children<ConditionalRenderProps>;

interface ConditionalRenderProps {
  fallback?: ReactNode;
  isCondition: (() => boolean | null | undefined) | boolean | null | undefined;
}

export const Conditional = ({ children, fallback, isCondition }: ConditionalProps) => {
  if (typeof isCondition === 'function') {
    if (!isCondition()) {
      return fallback;
    }
  }

  if (!isCondition) {
    return fallback;
  }

  return children;
};

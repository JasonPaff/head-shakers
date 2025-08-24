type ConditionalProps = Children<ConditionalRenderProps>;

interface ConditionalRenderProps {
  isCondition: (() => boolean | null | undefined) | boolean | null | undefined;
}

export const Conditional = ({ children, isCondition }: ConditionalProps) => {
  if (typeof isCondition === 'function') {
    const isAllowed = isCondition();
    if (!isAllowed) return <></>;
  }

  if (!isCondition) return <></>;

  return children;
};

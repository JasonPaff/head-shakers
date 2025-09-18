import { Conditional } from '@/components/ui/conditional';
import { cn } from '@/utils/tailwind-utils';

type AnimatedMotivationalMessageProps = ClassName<
  Children<{
    shouldShow: boolean;
  }>
>;

export function AnimatedMotivationalMessage({
  children,
  className,
  shouldShow,
}: AnimatedMotivationalMessageProps) {
  return (
    <Conditional isCondition={shouldShow}>
      <div
        className={cn(
          'animate-in duration-500 ease-out fade-in slide-in-from-bottom-2',
          'mt-6 flex items-center justify-between rounded-lg p-3',
          className,
        )}
      >
        {children}
      </div>
    </Conditional>
  );
}

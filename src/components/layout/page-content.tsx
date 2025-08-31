import { cn } from '@/utils/tailwind-utils';

type PageContentProps = RequiredChildren<{
  innerContainerClassName?: string;
  outerContainerClassName?: string;
}>;

export const PageContent = ({
  children,
  innerContainerClassName,
  outerContainerClassName,
}: PageContentProps) => {
  return (
    <div className={cn('min-h-screen bg-background p-6', outerContainerClassName)}>
      <div className={cn('mx-auto max-w-5xl space-y-6', innerContainerClassName)}>{children}</div>
    </div>
  );
};

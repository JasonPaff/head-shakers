import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';

type ContentLayoutProps = ComponentTestIdProps & RequiredChildren;

export const ContentLayout = ({ children, testId }: ContentLayoutProps) => {
  const layoutTestId = testId || generateTestId('layout', 'content-layout');

  return (
    <div className={'mx-auto max-w-361 py-2'} data-testid={layoutTestId}>
      {children}
    </div>
  );
};

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';

type FooterContainerProps = ComponentTestIdProps & RequiredChildren;

export const FooterContainer = ({ children, testId }: FooterContainerProps) => {
  const containerTestId = testId || generateTestId('layout', 'app-footer', 'container');

  return (
    <div
      className={'mx-auto grid max-w-7xl grid-cols-2 gap-8 py-8 md:grid-cols-4 md:py-12 lg:gap-12'}
      data-slot={'footer-container'}
      data-testid={containerTestId}
    >
      {children}
    </div>
  );
};

import { TestLayout } from '@/components/layout/test';

type AppLayoutProps = LayoutProps;

export default function AppLayout({ children }: AppLayoutProps) {
  return <TestLayout>{children}</TestLayout>;
}

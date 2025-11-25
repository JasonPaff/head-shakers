import { AppFooter } from '@/components/layout/app-footer/app-footer';

type PublicLayoutProps = Children;

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className={'flex min-h-screen flex-col'}>
      <main className={'flex-1'}>{children}</main>
      <AppFooter />
    </div>
  );
}

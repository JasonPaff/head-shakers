import { AppFooter } from '@/components/layout/app-footer/app-footer';
import { PublicHeader } from '@/components/layout/public-header/public-header';

type PublicLayoutProps = Children;

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className={'flex min-h-screen flex-col'}>
      <PublicHeader />
      <main className={'flex-1'}>{children}</main>
      <AppFooter />
    </div>
  );
}

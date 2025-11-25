import { AppFooter } from '@/components/layout/app-footer/app-footer';
import { AppHeader } from '@/components/layout/app-header/app-header';

type AppLayoutProps = RequiredChildren;

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={'flex min-h-screen flex-col [--header-height:calc(--spacing(14))]'}>
      <AppHeader />
      <div className={'flex flex-1'}>
        <main className={'flex-1 bg-background'}>{children}</main>
      </div>
      <AppFooter />
    </div>
  );
}

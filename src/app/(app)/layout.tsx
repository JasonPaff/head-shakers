import { AppHeader } from '@/components/layout/app-header/app-header';

type AppLayoutProps = RequiredChildren;

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={'[--header-height:calc(--spacing(14))]'}>
      <AppHeader />
      <div className={'flex flex-1'}>
        <main className={'min-h-screen flex-1 bg-background'}>{children}</main>
      </div>
    </div>
  );
}

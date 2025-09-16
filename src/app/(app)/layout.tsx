import { AppHeader } from '@/components/layout/app-header/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar/app-sidebar';
import { AuthContent } from '@/components/ui/auth';
import { SidebarInset } from '@/components/ui/sidebar/sidebar-inset';
import { SidebarProvider } from '@/components/ui/sidebar/sidebar-provider/sidebar-provider';
import { SidebarSkeleton } from '@/components/ui/skeleton';

type AppLayoutProps = RequiredChildren;

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={'[--header-height:calc(--spacing(14))]'}>
      <SidebarProvider className={'flex flex-col'}>
        <AppHeader />
        <div className={'flex flex-1'}>
          <AuthContent loadingSkeleton={<SidebarSkeleton />}>
            <AppSidebar collapsible={'icon'} />
          </AuthContent>
          <SidebarInset className={'w-full'}>
            <main className={'min-h-screen flex-1 bg-background'}>{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}

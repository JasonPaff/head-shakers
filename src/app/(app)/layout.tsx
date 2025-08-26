import { AppHeader } from '@/components/layout/app-header/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar/app-sidebar';
import { AuthContent } from '@/components/ui/auth';
import { SidebarProvider } from '@/components/ui/sidebar/sidebar-provider/sidebar-provider';

type AppLayoutProps = LayoutProps;

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AuthContent>
        <AppSidebar collapsible={'icon'} />
      </AuthContent>
      <main className={'min-h-screen flex-1 bg-background'}>
        <AppHeader />
        {children}
      </main>
    </SidebarProvider>
  );
}

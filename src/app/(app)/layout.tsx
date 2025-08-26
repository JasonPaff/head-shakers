import { AppSidebar } from '@/components/layout/app-sidebar/app-sidebar';
import { AuthContent } from '@/components/ui/auth';
import { SidebarProvider } from '@/components/ui/sidebar/sidebar-provider/sidebar-provider';

type AppLayoutProps = LayoutProps;

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AuthContent>
        <AppSidebar />
      </AuthContent>
      <main className={'flex-1'}>{children}</main>
    </SidebarProvider>
  );
}

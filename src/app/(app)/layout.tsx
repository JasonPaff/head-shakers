import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset } from '@/components/ui/sidebar/sidebar-inset';
import { SidebarProvider } from '@/components/ui/sidebar/sidebar-provider/sidebar-provider';

type AppLayoutProps = LayoutProps;

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider isDefaultOpen>
      <AppSidebar />
      <SidebarInset>
        <div className={'flex min-h-screen flex-1 flex-col gap-4 p-4'}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

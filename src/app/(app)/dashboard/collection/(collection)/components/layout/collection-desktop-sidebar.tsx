import { cn } from '@/utils/tailwind-utils';

type CollectionDesktopSidebarProps = Children;

export const CollectionDesktopSidebar = ({ children }: CollectionDesktopSidebarProps) => {
  return (
    <aside
      className={cn(
        'hidden flex-col border-r lg:flex lg:w-80',
        'sticky top-[var(--header-height)] h-[calc(100vh-var(--header-height))]',
        'overflow-y-auto',
        'bg-gradient-to-br from-muted/50 via-background/80 to-muted/30',
        'backdrop-blur-sm',
      )}
      data-slot={'desktop-sidebar'}
    >
      {children}
    </aside>
  );
};

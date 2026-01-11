type SidebarFooterProps = {
  totalCount: number;
};

export const SidebarFooter = ({ totalCount }: SidebarFooterProps) => {
  return (
    <div className={'border-t bg-background/30 p-3 backdrop-blur-sm'} data-slot={'sidebar-footer'}>
      <div className={'text-xs text-muted-foreground'}>
        {totalCount} total collection{totalCount === 1 ? '' : 's'}
      </div>
    </div>
  );
};

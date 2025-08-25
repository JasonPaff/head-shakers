import type { ComponentPropsWithRef } from 'react';

type SidebarMenuSubItemProps = ComponentPropsWithRef<'li'>;

export const SidebarMenuSubItem = ({ children, ...props }: SidebarMenuSubItemProps) => {
  return <li {...props}>{children}</li>;
};

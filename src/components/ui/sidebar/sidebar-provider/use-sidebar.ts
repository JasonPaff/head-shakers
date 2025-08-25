'use client';

import { use } from 'react';
import { createContext } from 'react';

export interface SidebarContextType {
  isDraggingRail: boolean;
  isOpen: boolean;
  setIsDraggingRail: (isDraggingRail: boolean) => void;
  setOpen: (open: boolean) => void;
  setWidth: (width: string) => void;
  state: 'collapsed' | 'expanded';
  toggleOpen: () => void;
  width: string;
}

export const SidebarContext = createContext<null | SidebarContextType>(null);

export const useSidebar = () => {
  const context = use(SidebarContext);
  if (!context) throw new Error('useSidebar can only be called from within a SidebarProvider.');
  return context;
};

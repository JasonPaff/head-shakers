'use client';

import { useBreakpoint } from '@/hooks/use-breakpoint';
import { useToggle } from '@/hooks/use-toggle';

export interface UseSidebarProviderStateProps {
  isDefaultOpen: boolean;
  isOpen: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export const useSidebarProvider = ({
  isDefaultOpen,
  isOpen: isOpenProp,
  onOpenChange,
}: UseSidebarProviderStateProps) => {
  const [isOpen, setIsOpen] = useToggle(isDefaultOpen);
  const [isMobileOpen, setIsMobileOpen] = useToggle();

  const { isMobile } = useBreakpoint();

  const isControlled = isOpenProp !== undefined;
  const _isOpen = isOpenProp ?? isOpen ?? isMobileOpen;

  const state = _isOpen ? 'expanded' : 'collapsed';

  const setOpen = (isOpenNew: boolean) => {
    if (_isOpen === isOpenNew) return;
    onOpenChange?.(isOpenNew);
    document.cookie = `head-shakers-sidebar-collapsed=${isOpenNew}; path=/; max-age=${60 * 60 * 24 * 365}`;

    if (isControlled) {
      if (isMobile) setIsMobileOpen.update(isOpenNew);
      else setIsOpen.update(isOpenNew);
    }
  };

  const toggleOpen = () => {
    if (isMobile) setIsMobileOpen.toggle();
    else setIsOpen.toggle();
  };

  return {
    isOpen: _isOpen,
    setOpen,
    state,
    toggleOpen,
  } as const;
};

'use client';

import { useEffect } from 'react';

import { useBreakpoint } from '@/hooks/use-breakpoint';
import { useCookie } from '@/hooks/use-cookie';
import { useToggle } from '@/hooks/use-toggle';

export interface UseSidebarProviderStateProps {
  isDefaultOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export const useSidebarProvider = ({
  isDefaultOpen,
  isOpen: isOpenProp,
  onOpenChange,
}: UseSidebarProviderStateProps) => {
  const [isOpen, setIsOpen] = useToggle(isDefaultOpen);
  const [isMobileOpen, setIsMobileOpen] = useToggle(isDefaultOpen);

  const { setValue: setSidebarState, value: sidebarState } = useCookie('sidebar');

  const { isMobile } = useBreakpoint();

  // initialize state from the cookie on mount
  useEffect(() => {
    const isOpenFromCookie = sidebarState === 'expanded';
    if (isMobile) setIsMobileOpen.update(isOpenFromCookie);
    else setIsOpen.update(isOpenFromCookie);
  }, [sidebarState, isMobile, setIsOpen, setIsMobileOpen]);

  const isControlled = isOpenProp !== undefined;
  const _isOpen = isOpenProp ?? (isMobile ? isMobileOpen : isOpen);

  const state = _isOpen ? 'expanded' : 'collapsed';

  const setOpen = (isOpenNew: boolean) => {
    if (_isOpen === isOpenNew) return;
    onOpenChange?.(isOpenNew);
    setSidebarState(isOpenNew ? 'expanded' : 'collapsed');

    if (!isControlled) {
      if (isMobile) {
        setIsMobileOpen.update(isOpenNew);
      } else {
        setIsOpen.update(isOpenNew);
      }
    }
  };

  const toggleOpen = () => {
    setOpen(!_isOpen);
  };

  return {
    isOpen: _isOpen,
    setOpen,
    state,
    toggleOpen,
  } as const;
};

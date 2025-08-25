'use client';

import { useEffect, useState } from 'react';

const breakpointConstants = {
  desktop: { max: 9999, min: 1440, name: 'desktop', query: `(min-width: ${1440}px)` },
  laptop: { max: 1440, min: 1024, name: 'laptop', query: `(min-width: ${1024}px) and (max-width: ${1440 - 1}px)` },
  mobile: { max: 768, min: 0, name: 'mobile', query: `(max-width: ${1024 - 1}px)` },
  tablet: {
    max: 1024,
    min: 768,
    name: 'tablet',
    query: `(min-width: ${768}px) and (max-width: ${1440 - 1}px)`,
  },
} as const;

type Breakpoint = (typeof breakpointConstants)[keyof typeof breakpointConstants]['name'];

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>();

  const isDesktop = breakpoint === breakpointConstants.desktop.name;
  const isLaptop = breakpoint === breakpointConstants.laptop.name;
  const isMobile = !breakpoint || breakpoint === breakpointConstants.mobile.name;
  const isTablet = breakpoint === breakpointConstants.tablet.name;

  const _breakpoint = breakpoint ?? breakpointConstants.mobile.name;

  useEffect(() => {
    const mqlDesktop = window.matchMedia(breakpointConstants.desktop.query);
    const mqlLaptop = window.matchMedia(breakpointConstants.laptop.query);
    const mqlMobile = window.matchMedia(breakpointConstants.mobile.query);
    const mqlTablet = window.matchMedia(breakpointConstants.tablet.query);

    const handleUpdate = () => {
      if (mqlDesktop.matches) setBreakpoint(breakpointConstants.desktop.name);
      else if (mqlLaptop.matches) setBreakpoint(breakpointConstants.laptop.name);
      else if (mqlMobile.matches) setBreakpoint(breakpointConstants.mobile.name);
      else if (mqlTablet.matches) setBreakpoint(breakpointConstants.tablet.name);
    };

    mqlDesktop.addEventListener('change', handleUpdate);
    mqlLaptop.addEventListener('change', handleUpdate);
    mqlMobile.addEventListener('change', handleUpdate);
    mqlTablet.addEventListener('change', handleUpdate);

    handleUpdate();

    return () => {
      mqlDesktop.removeEventListener('change', handleUpdate);
      mqlLaptop.removeEventListener('change', handleUpdate);
      mqlMobile.removeEventListener('change', handleUpdate);
      mqlTablet.removeEventListener('change', handleUpdate);
    };
  }, []);

  return { breakpoint: _breakpoint, isDesktop, isLaptop, isMobile, isTablet };
};

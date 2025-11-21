'use client';

import { Fragment, type ReactNode, useEffect, useRef, useState } from 'react';

interface StickyHeaderWrapperProps {
  children: (isSticky: boolean) => ReactNode;
  rootMargin?: string;
  threshold?: number;
}

export function StickyHeaderWrapper({
  children,
  rootMargin = '-100px 0px 0px 0px',
  threshold = 0,
}: StickyHeaderWrapperProps) {
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        // When the sentinel is NOT intersecting (not visible), the header should be sticky
        setIsSticky(!entry.isIntersecting);
      },
      {
        rootMargin,
        threshold: [0, 1],
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return (
    <Fragment>
      <div aria-hidden={'true'} ref={sentinelRef} />
      {children(isSticky)}
    </Fragment>
  );
}

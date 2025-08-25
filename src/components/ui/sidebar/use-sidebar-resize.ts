import type { MouseEvent } from 'react';

import { useEffect } from 'react';
import { useCallback, useRef } from 'react';

interface UseSidebarResizeProps {
  currentWidth: string;
  enableDrag?: boolean;
  isCollapsed: boolean;
  maxResizeWidth?: string;
  minResizeWidth?: string;
  onResize: (width: string) => void;
  onToggle: () => void;
  setIsDraggingRail: (isDraggingRail: boolean) => void;
}

// format width value and unit into a string.
const formatWidth = (value: number, unit: 'px' | 'rem'): string => {
  return `${unit === 'rem' ? value.toFixed(1) : Math.round(value)}${unit}`;
};

// parse width string into value and unit.
const parseWidth = (width: string): { unit: 'px' | 'rem'; value: number } => {
  const unit = width.endsWith('rem') ? 'rem' : 'px';
  const value = Number.parseFloat(width);
  return { unit, value };
};

// convert any width to pixels for calculations.
const toPx = (width: string): number => {
  const { unit, value } = parseWidth(width);
  return unit === 'rem' ? value * 16 : value;
};

export const useSidebarResize = ({
  currentWidth,
  enableDrag = true,
  isCollapsed,
  maxResizeWidth = '20rem',
  minResizeWidth = '14rem',
  onResize,
  onToggle,
  setIsDraggingRail,
}: UseSidebarResizeProps) => {
  const autoCollapseThreshold = useRef(toPx(minResizeWidth) * 0.55); // 55% of min width
  const dragRef = useRef<HTMLButtonElement>(null);
  const isDragging = useRef(false);
  const isInteractingWithRail = useRef(false);
  const lastLoggedWidth = useRef(0);
  const lastWidth = useRef(0);
  const startWidth = useRef(0);
  const startX = useRef(0);

  const persistWidth = useCallback((width: string) => {
    document.cookie = `head-shakers-sidebar-width=${width}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }, []);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      isInteractingWithRail.current = true;

      if (!enableDrag || isCollapsed) return;

      startWidth.current = toPx(currentWidth);
      startX.current = e.clientX;
      lastWidth.current = startWidth.current;
      lastLoggedWidth.current = startWidth.current;

      e.preventDefault();
    },
    [enableDrag, isCollapsed, currentWidth],
  );

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!isInteractingWithRail.current || isCollapsed) return;

      const deltaX = Math.abs(e.clientX - startX.current);
      if (!isDragging.current && deltaX > 5) {
        isDragging.current = true;
        setIsDraggingRail(true);
      }

      if (!isDragging.current) return;

      const { unit } = parseWidth(currentWidth);
      const minWidthPx = toPx(minResizeWidth);
      const maxWidthPx = toPx(maxResizeWidth);

      // calculate new width in pixels.
      const deltaWidth = e.clientX - startX.current;
      const newWidthPx = startWidth.current + deltaWidth;

      // auto-collapse if dragged below threshold.
      if (newWidthPx < autoCollapseThreshold.current && !isCollapsed) {
        onToggle();
        isDragging.current = false;
        isInteractingWithRail.current = false;
        setIsDraggingRail(false);
        return;
      }

      // rest of the existing width calculation logic.
      const clampedWidthPx = Math.max(minWidthPx, Math.min(maxWidthPx, newWidthPx));

      // convert to the target unit if needed.
      const newWidth = unit === 'rem' ? clampedWidthPx / 16 : clampedWidthPx;

      // use appropriate threshold based on unit.
      const threshold = unit === 'rem' ? 0.1 : 1;
      if (Math.abs(newWidth - lastWidth.current / (unit === 'rem' ? 16 : 1)) >= threshold) {
        const formattedWidth = formatWidth(newWidth, unit);
        onResize(formattedWidth);
        persistWidth(formattedWidth); // store width in cookie when it changes.
        lastWidth.current = clampedWidthPx; // store in px for consistent comparisons.

        // log on larger changes
        const logThreshold = unit === 'rem' ? 1 : 16;
        if (Math.abs(newWidth - lastLoggedWidth.current / (unit === 'rem' ? 16 : 1)) >= logThreshold) {
          lastLoggedWidth.current = clampedWidthPx;
        }
      }
    };

    const handleMouseUp = () => {
      if (!isInteractingWithRail.current) return;

      if (!isDragging.current) onToggle();

      isDragging.current = false;
      isInteractingWithRail.current = false;
      lastWidth.current = 0;
      lastLoggedWidth.current = 0;
      setIsDraggingRail(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    onResize,
    onToggle,
    isCollapsed,
    currentWidth,
    minResizeWidth,
    maxResizeWidth,
    persistWidth,
    setIsDraggingRail,
  ]);

  return {
    dragRef,
    handleMouseDown,
    isDragging,
  };
};

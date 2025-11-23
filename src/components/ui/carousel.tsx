'use client';

import type { VariantProps } from 'class-variance-authority';
import type { UseEmblaCarouselType } from 'embla-carousel-react';
import type { ComponentProps, KeyboardEvent } from 'react';

import { cva } from 'class-variance-authority';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useContext } from 'react';
import { useEffect } from 'react';
import { createContext, useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/tailwind-utils';

export type CarouselApi = UseEmblaCarouselType[1];
type CarouselContextProps = CarouselProps & {
  api: ReturnType<typeof useEmblaCarousel>[1];
  canScrollNext: boolean;
  canScrollPrev: boolean;
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  scrollNext: () => void;
  scrollPrev: () => void;
  scrollTo: (index: number) => void;
  selectedIndex: number;
  slideCount: number;
};
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  orientation?: 'horizontal' | 'vertical';
  plugins?: CarouselPlugin;
  setApi?: (api: CarouselApi) => void;
};

type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;

const CarouselContext = createContext<CarouselContextProps | null>(null);

type CarouselContentProps = ComponentProps<'div'>;

export const Carousel = ({
  children,
  className,
  opts,
  orientation = 'horizontal',
  plugins,
  setApi,
  ...props
}: CarouselProps & ComponentProps<'div'>) => {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  const handleSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
    setSelectedIndex(api.selectedScrollSnap());
    setSlideCount(api.scrollSnapList().length);
  }, []);

  const handleScrollPrev = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const handleScrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleScrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handleScrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleScrollNext();
      }
    },
    [handleScrollPrev, handleScrollNext],
  );

  useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  useEffect(() => {
    if (!api) return;

    queueMicrotask(() => handleSelect(api));

    api.on('reInit', handleSelect);
    api.on('select', handleSelect);

    return () => {
      api?.off('select', handleSelect);
    };
  }, [api, handleSelect]);

  return (
    <CarouselContext.Provider
      value={{
        api: api,
        canScrollNext,
        canScrollPrev,
        carouselRef,
        opts,
        orientation: orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
        scrollNext: handleScrollNext,
        scrollPrev: handleScrollPrev,
        scrollTo: handleScrollTo,
        selectedIndex,
        slideCount,
      }}
    >
      <div
        aria-roledescription={'carousel'}
        className={cn('relative', className)}
        data-slot={'carousel'}
        onKeyDownCapture={handleKeyDown}
        role={'region'}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
};

export const CarouselContent = ({ className, ...props }: CarouselContentProps) => {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div className={'overflow-hidden'} data-slot={'carousel-content'} ref={carouselRef}>
      <div
        className={cn(
          'flex transition-transform duration-300 ease-out',
          orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
          className,
        )}
        {...props}
      />
    </div>
  );
};

type CarouselItemProps = ComponentProps<'div'> & {
  index?: number;
};

export const CarouselItem = ({ className, index, ...props }: CarouselItemProps) => {
  const { orientation, selectedIndex } = useCarousel();

  const _isActive = index !== undefined && index === selectedIndex;

  return (
    <div
      aria-roledescription={'slide'}
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full transition-opacity duration-300',
        orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        className,
      )}
      data-active={_isActive || undefined}
      data-slot={'carousel-item'}
      role={'group'}
      {...props}
    />
  );
};

type CarouselNextProps = ComponentProps<typeof Button>;

export const CarouselNext = ({
  className,
  size = 'icon',
  variant = 'outline',
  ...props
}: CarouselNextProps) => {
  const { canScrollNext, orientation, scrollNext } = useCarousel();

  return (
    <Button
      className={cn(
        'absolute size-8 rounded-full',
        'transition-all duration-200 ease-out',
        'hover:scale-110 hover:shadow-md',
        'focus-visible:scale-110 focus-visible:shadow-md',
        'disabled:hover:scale-100 disabled:hover:shadow-none',
        orientation === 'horizontal' ?
          'top-1/2 -right-12 -translate-y-1/2'
        : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      data-slot={'carousel-next'}
      disabled={!canScrollNext}
      onClick={scrollNext}
      size={size}
      variant={variant}
      {...props}
    >
      <ArrowRight aria-hidden />
      <span className={'sr-only'}>Next slide</span>
    </Button>
  );
};

type CarouselPreviousProps = ComponentProps<typeof Button>;

export const CarouselPrevious = ({
  className,
  size = 'icon',
  variant = 'outline',
  ...props
}: CarouselPreviousProps) => {
  const { canScrollPrev, orientation, scrollPrev } = useCarousel();

  return (
    <Button
      className={cn(
        'absolute size-8 rounded-full',
        'transition-all duration-200 ease-out',
        'hover:scale-110 hover:shadow-md',
        'focus-visible:scale-110 focus-visible:shadow-md',
        'disabled:hover:scale-100 disabled:hover:shadow-none',
        orientation === 'horizontal' ?
          'top-1/2 -left-12 -translate-y-1/2'
        : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      data-slot={'carousel-previous'}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      size={size}
      variant={variant}
      {...props}
    >
      <ArrowLeft aria-hidden />
      <span className={'sr-only'}>Previous slide</span>
    </Button>
  );
};

/* Carousel Dots Variants */
const carouselDotVariants = cva(
  'cursor-pointer rounded-full transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    defaultVariants: {
      colorScheme: 'default',
      size: 'default',
    },
    variants: {
      colorScheme: {
        default: 'bg-muted-foreground/30 data-[active]:bg-primary',
        light: 'bg-white/40 data-[active]:bg-white',
        muted: 'bg-muted data-[active]:bg-muted-foreground',
      },
      size: {
        default: 'size-2',
        lg: 'size-3',
        sm: 'size-1.5',
      },
    },
  },
);

type CarouselDotsProps = ComponentProps<'div'> &
  VariantProps<typeof carouselDotVariants> & {
    isShowOnSingle?: boolean;
  };

export const CarouselDots = ({
  className,
  colorScheme,
  isShowOnSingle = false,
  size,
  ...props
}: CarouselDotsProps) => {
  const { orientation, scrollTo, selectedIndex, slideCount } = useCarousel();

  const _shouldHide = !isShowOnSingle && slideCount <= 1;

  if (_shouldHide) {
    return null;
  }

  const handleDotClick = (index: number) => {
    scrollTo(index);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      scrollTo(index);
    }
  };

  return (
    <div
      aria-label={'Slide navigation'}
      className={cn(
        'flex items-center justify-center gap-2',
        orientation === 'vertical' && 'flex-col',
        className,
      )}
      data-slot={'carousel-dots'}
      role={'tablist'}
      {...props}
    >
      {Array.from({ length: slideCount }).map((_, index) => {
        const _isActive = index === selectedIndex;

        return (
          <button
            aria-label={`Go to slide ${index + 1}`}
            aria-selected={_isActive}
            className={cn(carouselDotVariants({ colorScheme, size }), _isActive && 'scale-125')}
            data-active={_isActive || undefined}
            data-slot={'carousel-dot'}
            key={index}
            onClick={() => handleDotClick(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            role={'tab'}
            tabIndex={_isActive ? 0 : -1}
            type={'button'}
          />
        );
      })}
    </div>
  );
};

export const useCarousel = () => {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }

  return context;
};

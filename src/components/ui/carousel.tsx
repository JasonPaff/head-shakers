'use client';

import type { UseEmblaCarouselType } from 'embla-carousel-react';
import type { ComponentProps, KeyboardEvent } from 'react';

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

  const handleSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const handleScrollPrev = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const handleScrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

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
    handleSelect(api);
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
        className={cn('flex', orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col', className)}
        {...props}
      />
    </div>
  );
};

type CarouselItemProps = ComponentProps<'div'>;

export const CarouselItem = ({ className, ...props }: CarouselItemProps) => {
  const { orientation } = useCarousel();

  return (
    <div
      aria-roledescription={'slide'}
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        className,
      )}
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
      <ArrowRight />
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
      <ArrowLeft />
      <span className={'sr-only'}>Previous slide</span>
    </Button>
  );
};

function useCarousel() {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }

  return context;
}

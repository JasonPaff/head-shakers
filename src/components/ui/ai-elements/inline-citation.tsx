'use client';

import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import {
  type ComponentProps,
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Badge } from '@/components/ui/badge';
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/utils/tailwind-utils';

export type InlineCitationProps = ComponentProps<'span'>;

export const InlineCitation = ({ className, ...props }: InlineCitationProps) => (
  <span className={cn('group inline items-center gap-1', className)} {...props} />
);

export type InlineCitationTextProps = ComponentProps<'span'>;

export const InlineCitationText = ({ className, ...props }: InlineCitationTextProps) => (
  <span className={cn('transition-colors group-hover:bg-accent', className)} {...props} />
);

export type InlineCitationCardProps = ComponentProps<typeof HoverCard>;

export const InlineCitationCard = (props: InlineCitationCardProps) => (
  <HoverCard closeDelay={0} openDelay={0} {...props} />
);

export type InlineCitationCardTriggerProps = ComponentProps<typeof Badge> & {
  sources: string[];
};

export const InlineCitationCardTrigger = ({
  className,
  sources,
  ...props
}: InlineCitationCardTriggerProps) => {
  const a = sources.length > 1 && sources.length - 1;
  return (
    <HoverCardTrigger asChild>
      <Badge className={cn('ml-1 rounded-full', className)} variant={'secondary'} {...props}>
        {sources.length ?
          <Fragment>
            {new URL(sources[0]!).hostname} {a}
          </Fragment>
        : 'unknown'}
      </Badge>
    </HoverCardTrigger>
  );
};

export type InlineCitationCardBodyProps = ComponentProps<'div'>;

export const InlineCitationCardBody = ({ className, ...props }: InlineCitationCardBodyProps) => (
  <HoverCardContent className={cn('relative w-80 p-0', className)} {...props} />
);

const CarouselApiContext = createContext<CarouselApi | undefined>(undefined);

const useCarouselApi = () => {
  const context = useContext(CarouselApiContext);
  return context;
};

export type InlineCitationCarouselProps = ComponentProps<typeof Carousel>;

export const InlineCitationCarousel = ({ children, className, ...props }: InlineCitationCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();

  return (
    <CarouselApiContext.Provider value={api}>
      <Carousel className={cn('w-full', className)} setApi={setApi} {...props}>
        {children}
      </Carousel>
    </CarouselApiContext.Provider>
  );
};

export type InlineCitationCarouselContentProps = ComponentProps<'div'>;

export const InlineCitationCarouselContent = (props: InlineCitationCarouselContentProps) => (
  <CarouselContent {...props} />
);

export type InlineCitationCarouselItemProps = ComponentProps<'div'>;

export const InlineCitationCarouselItem = ({ className, ...props }: InlineCitationCarouselItemProps) => (
  <CarouselItem className={cn('w-full space-y-2 p-4 pl-8', className)} {...props} />
);

export type InlineCitationCarouselHeaderProps = ComponentProps<'div'>;

export const InlineCitationCarouselHeader = ({ className, ...props }: InlineCitationCarouselHeaderProps) => (
  <div
    className={cn('flex items-center justify-between gap-2 rounded-t-md bg-secondary p-2', className)}
    {...props}
  />
);

export type InlineCitationCarouselIndexProps = ComponentProps<'div'>;

export const InlineCitationCarouselIndex = ({
  children,
  className,
  ...props
}: InlineCitationCarouselIndexProps) => {
  const api = useCarouselApi();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const _a = current / count;

  return (
    <div
      className={cn(
        'flex flex-1 items-center justify-end px-3 py-1 text-xs text-muted-foreground',
        className,
      )}
      {...props}
    >
      {children ?? _a}
    </div>
  );
};

export type InlineCitationCarouselPrevProps = ComponentProps<'button'>;

export const InlineCitationCarouselPrev = ({ className, ...props }: InlineCitationCarouselPrevProps) => {
  const api = useCarouselApi();

  const handleClick = useCallback(() => {
    if (api) {
      api.scrollPrev();
    }
  }, [api]);

  return (
    <button
      aria-label={'Previous'}
      className={cn('shrink-0', className)}
      onClick={handleClick}
      type={'button'}
      {...props}
    >
      <ArrowLeftIcon className={'size-4 text-muted-foreground'} />
    </button>
  );
};

export type InlineCitationCarouselNextProps = ComponentProps<'button'>;

export const InlineCitationCarouselNext = ({ className, ...props }: InlineCitationCarouselNextProps) => {
  const api = useCarouselApi();

  const handleClick = useCallback(() => {
    if (api) {
      api.scrollNext();
    }
  }, [api]);

  return (
    <button
      aria-label={'Next'}
      className={cn('shrink-0', className)}
      onClick={handleClick}
      type={'button'}
      {...props}
    >
      <ArrowRightIcon className={'size-4 text-muted-foreground'} />
    </button>
  );
};

export type InlineCitationSourceProps = ComponentProps<'div'> & {
  description?: string;
  title?: string;
  url?: string;
};

export const InlineCitationSource = ({
  children,
  className,
  description,
  title,
  url,
  ...props
}: InlineCitationSourceProps) => (
  <div className={cn('space-y-1', className)} {...props}>
    {title && <h4 className={'truncate text-sm leading-tight font-medium'}>{title}</h4>}
    {url && <p className={'truncate text-xs break-all text-muted-foreground'}>{url}</p>}
    {description && (
      <p className={'line-clamp-3 text-sm leading-relaxed text-muted-foreground'}>{description}</p>
    )}
    {children}
  </div>
);

export type InlineCitationQuoteProps = ComponentProps<'blockquote'>;

export const InlineCitationQuote = ({ children, className, ...props }: InlineCitationQuoteProps) => (
  <blockquote
    className={cn('border-l-2 border-muted pl-3 text-sm text-muted-foreground italic', className)}
    {...props}
  >
    {children}
  </blockquote>
);

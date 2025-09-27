import type { Experimental_GeneratedImage } from 'ai';

import { cn } from '@/utils/tailwind-utils';

export type ImageProps = Experimental_GeneratedImage & {
  alt?: string;
  className?: string;
};

export const Image = ({ base64, mediaType, uint8Array, ...props }: ImageProps) => (
  <img
    {...props}
    alt={props.alt}
    className={cn('h-auto max-w-full overflow-hidden rounded-md', props.className)}
    src={`data:${mediaType};base64,${base64}`}
  />
);

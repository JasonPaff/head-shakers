import type { VariantProps } from 'class-variance-authority';

import { cva } from 'class-variance-authority';

/**
 * Featured Card Container Variants
 *
 * Base styles for featured collection and bobblehead cards with
 * enhanced shadows, borders, and interaction states.
 */
export const featuredCardVariants = cva(
  [
    // Base structure
    'group relative overflow-hidden rounded-md',
    // Default shadow and border
    'border border-border/50 shadow-md',
    // Transition utilities for smooth interactions
    'transition-all duration-300 ease-out',
  ],
  {
    compoundVariants: [
      // Loading states override other styles
      {
        class: 'pointer-events-none',
        state: 'loading',
      },
      // Disabled states
      {
        class: 'grayscale',
        state: 'disabled',
      },
    ],
    defaultVariants: {
      size: 'medium',
      state: 'default',
    },
    variants: {
      size: {
        large: [
          'min-h-[400px]',
          // Responsive sizing
          'sm:min-h-[450px]',
          'lg:min-h-[500px]',
        ],
        medium: [
          'min-h-[300px]',
          // Responsive sizing
          'sm:min-h-[340px]',
          'lg:min-h-[380px]',
        ],
        small: [
          'min-h-[200px]',
          // Responsive sizing
          'sm:min-h-[220px]',
          'lg:min-h-[240px]',
        ],
      },
      state: {
        active: ['ring-2 ring-primary ring-offset-2', 'shadow-xl'],
        default: [
          // Default hover transform
          'hover:-translate-y-1',
          'hover:shadow-xl',
          'hover:border-orange-200/50',
        ],
        disabled: ['opacity-60', 'cursor-not-allowed'],
        hover: ['-translate-y-1', 'shadow-xl', 'border-orange-200/50'],
        loading: ['animate-shimmer'],
      },
    },
  },
);

/**
 * Featured Card Image Variants
 *
 * Styles for the image container within featured cards.
 */
export const featuredCardImageVariants = cva(
  [
    // Base image container
    'absolute inset-0 h-full w-full',
    // Image scaling
    'object-cover',
    // Smooth transition for zoom effect
    'transition-transform duration-300 ease-out',
    // Group hover zoom effect
    'group-hover:scale-105',
  ],
  {
    defaultVariants: {
      contentType: 'default',
    },
    variants: {
      contentType: {
        bobblehead: [
          // Bobbleheads may have transparent backgrounds
          'object-contain',
          'bg-gradient-to-b from-amber-50 to-orange-100',
        ],
        collection: [
          // Collections use cover fit
          'object-cover',
        ],
        default: ['object-cover'],
      },
    },
  },
);

/**
 * Featured Card Overlay Variants
 *
 * Gradient overlay styles for text readability on images.
 */
export const featuredCardOverlayVariants = cva(
  [
    // Base overlay positioning
    'absolute inset-0 h-full w-full',
    // Pointer events pass through
    'pointer-events-none',
  ],
  {
    defaultVariants: {
      intensity: 'medium',
      position: 'bottom',
    },
    variants: {
      intensity: {
        dark: ['bg-black/70'],
        light: ['bg-white/80'],
        medium: ['bg-black/50'],
        none: ['bg-transparent'],
      },
      position: {
        bottom: ['bg-gradient-to-t from-black/70 to-transparent'],
        full: [
          // Full overlay - no gradient, just solid
        ],
        top: ['bg-gradient-to-b from-black/40 to-transparent'],
      },
    },
  },
);

/**
 * Featured Card Content Variants
 *
 * Styles for the content area (title, description, metadata) within cards.
 */
export const featuredCardContentVariants = cva(
  [
    // Base positioning
    'absolute right-0 bottom-0 left-0',
    // Padding
    'p-4',
    // Z-index above overlay
    'z-10',
    // Dark gradient background for text readability on any background
    'bg-gradient-to-t from-black/80 via-black/60 to-transparent',
    // Rounded bottom corners to match card
    'rounded-b-md',
  ],
  {
    defaultVariants: {
      alignment: 'left',
      size: 'medium',
    },
    variants: {
      alignment: {
        center: 'text-center',
        left: 'text-left',
        right: 'text-right',
      },
      size: {
        large: ['p-6', 'sm:p-8'],
        medium: ['p-4', 'sm:p-5'],
        small: ['p-3', 'sm:p-4'],
      },
    },
  },
);

/**
 * Featured Card Title Variants
 *
 * Typography styles for card titles.
 */
export const featuredCardTitleVariants = cva(
  [
    // Base typography
    'font-semibold text-white',
    // Text shadow for readability
    'drop-shadow-md',
    // Truncate long titles
    'line-clamp-2',
    // Transition for hover effects
    'transition-colors duration-200',
  ],
  {
    defaultVariants: {
      size: 'medium',
    },
    variants: {
      size: {
        large: ['text-xl', 'sm:text-2xl', 'lg:text-3xl'],
        medium: ['text-lg', 'sm:text-xl'],
        small: ['text-base', 'sm:text-lg'],
      },
    },
  },
);

/**
 * Featured Card Description Variants
 *
 * Typography styles for card descriptions.
 */
export const featuredCardDescriptionVariants = cva(
  [
    // Base typography
    'text-white/80',
    // Text shadow for readability
    'drop-shadow-sm',
    // Truncate long descriptions
    'line-clamp-2',
  ],
  {
    defaultVariants: {
      size: 'medium',
    },
    variants: {
      size: {
        large: ['text-base', 'sm:text-lg', 'mt-2'],
        medium: ['text-sm', 'sm:text-base', 'mt-1.5'],
        small: ['text-xs', 'sm:text-sm', 'mt-1'],
      },
    },
  },
);

/**
 * Featured Card Badge Variants
 *
 * Styles for badges/labels on featured cards (e.g., "Featured", "New", "Popular").
 */
export const featuredCardBadgeVariants = cva(
  [
    // Base structure
    'inline-flex items-center gap-1.5',
    'rounded-full px-3 py-1',
    'text-xs font-medium',
    // Shadow for depth
    'shadow-sm',
    // Transition
    'transition-all duration-200',
  ],
  {
    defaultVariants: {
      variant: 'featured',
    },
    variants: {
      variant: {
        featured: ['bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 text-white'],
        new: ['bg-orange-400 text-white'],
        popular: ['bg-amber-400 text-amber-700'],
        trending: ['bg-primary text-white'],
      },
    },
  },
);

/**
 * Featured Card Skeleton Variants
 *
 * Loading state skeleton styles for featured cards.
 */
export const featuredCardSkeletonVariants = cva(
  [
    // Base skeleton styles
    'rounded-md',
    'animate-shimmer',
  ],
  {
    defaultVariants: {
      size: 'medium',
    },
    variants: {
      size: {
        large: ['h-[400px]', 'sm:h-[450px]', 'lg:h-[500px]'],
        medium: ['h-[300px]', 'sm:h-[340px]', 'lg:h-[380px]'],
        small: ['h-[200px]', 'sm:h-[220px]', 'lg:h-[240px]'],
      },
    },
  },
);

/**
 * Featured Card Action Button Variants
 *
 * Styles for action buttons within featured cards (e.g., view, like, share).
 */
export const featuredCardActionVariants = cva(
  [
    // Base structure
    'inline-flex items-center justify-center',
    'rounded-full',
    // Background with blur
    'bg-white/20 backdrop-blur-sm',
    // Border
    'border border-white/30',
    // Text
    'text-white',
    // Transition
    'transition-all duration-200',
    // Hover states
    'hover:bg-white/30',
    'hover:scale-110',
    // Focus states
    'focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none',
  ],
  {
    defaultVariants: {
      size: 'medium',
    },
    variants: {
      size: {
        large: ['size-12', '[&_svg]:size-6'],
        medium: ['size-10', '[&_svg]:size-5'],
        small: ['size-8', '[&_svg]:size-4'],
      },
    },
  },
);

export type FeaturedCardActionVariants = VariantProps<typeof featuredCardActionVariants>;
/**
 * Badge variant type
 */
export type FeaturedCardBadgeType = 'featured' | 'new' | 'popular' | 'trending';
export type FeaturedCardBadgeVariants = VariantProps<typeof featuredCardBadgeVariants>;
/**
 * Content type for different card content displays
 */
export type FeaturedCardContentType = 'bobblehead' | 'collection' | 'default';
export type FeaturedCardContentVariants = VariantProps<typeof featuredCardContentVariants>;
export type FeaturedCardDescriptionVariants = VariantProps<typeof featuredCardDescriptionVariants>;
export type FeaturedCardImageVariants = VariantProps<typeof featuredCardImageVariants>;
export type FeaturedCardOverlayVariants = VariantProps<typeof featuredCardOverlayVariants>;
/**
 * Size type for consistent sizing across card elements
 */
export type FeaturedCardSize = 'large' | 'medium' | 'small';

export type FeaturedCardSkeletonVariants = VariantProps<typeof featuredCardSkeletonVariants>;

/**
 * State type for card interaction states
 */
export type FeaturedCardState = 'active' | 'default' | 'disabled' | 'hover' | 'loading';

export type FeaturedCardTitleVariants = VariantProps<typeof featuredCardTitleVariants>;

/**
 * Type exports for variant props
 */
export type FeaturedCardVariants = VariantProps<typeof featuredCardVariants>;

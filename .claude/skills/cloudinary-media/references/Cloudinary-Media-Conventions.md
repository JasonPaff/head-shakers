# Cloudinary Media Conventions

## Overview

Head Shakers uses Cloudinary for image storage and optimization via the `next-cloudinary` package. Images are organized in folder paths and transformed for different use cases (thumbnails, social sharing, etc.).

## File Structure

```
src/lib/
├── utils/cloudinary.utils.ts      # URL utilities
├── services/cloudinary.service.ts  # Upload service
├── constants/cloudinary-paths.ts   # Folder path constants
```

## Core Imports

```typescript
// URL utilities
import {
  extractFormatFromCloudinaryUrl,
  extractPublicIdFromCloudinaryUrl,
  generateOpenGraphImageUrl,
  generateSocialImageUrl,
  generateTwitterCardImageUrl,
} from '@/lib/utils/cloudinary.utils';

// Next.js Cloudinary component
import { CldImage } from 'next-cloudinary';

// Path constants
import { CLOUDINARY_PATHS } from '@/lib/constants/cloudinary-paths';
```

## Displaying Images

### CldImage Component

```typescript
import { CldImage } from 'next-cloudinary';

// Basic usage
<CldImage
  alt={'Bobblehead photo'}
  crop={'fill'}
  gravity={'auto'}
  height={300}
  src={publicId}  // Not full URL, just the publicId
  width={400}
/>

// With transformations
<CldImage
  alt={'Profile avatar'}
  crop={'thumb'}
  gravity={'face'}
  height={100}
  quality={'auto'}
  src={publicId}
  width={100}
/>

// Responsive with sizes
<CldImage
  alt={'Gallery image'}
  crop={'fill'}
  fill
  gravity={'auto'}
  sizes={'(max-width: 768px) 100vw, 50vw'}
  src={publicId}
/>
```

## URL Utilities

### Extract PublicId from URL

```typescript
import { extractPublicIdFromCloudinaryUrl } from '@/lib/utils/cloudinary.utils';

// Full URL: https://res.cloudinary.com/demo/image/upload/v1234/users/abc/photo.jpg
const publicId = extractPublicIdFromCloudinaryUrl(url);
// Returns: "users/abc/photo"

// URL with transformations
const publicId = extractPublicIdFromCloudinaryUrl(
  'https://res.cloudinary.com/demo/image/upload/c_fill,w_200/users/abc/photo.jpg'
);
// Returns: "users/abc/photo"
```

### Extract Format from URL

```typescript
import { extractFormatFromCloudinaryUrl } from '@/lib/utils/cloudinary.utils';

const format = extractFormatFromCloudinaryUrl(url);
// Returns: "jpg", "png", "webp", etc.
// Falls back to "jpg" on error
```

## Social Sharing Images

### Open Graph (Facebook, LinkedIn)

```typescript
import { generateOpenGraphImageUrl } from '@/lib/utils/cloudinary.utils';

// Generates 1200x630 optimized image
const ogImageUrl = generateOpenGraphImageUrl(publicId);
// Returns: https://res.cloudinary.com/{cloud}/image/upload/c_fill,w_1200,h_630,f_auto,q_auto/{publicId}
```

### Twitter Card

```typescript
import { generateTwitterCardImageUrl } from '@/lib/utils/cloudinary.utils';

// Generates 800x418 optimized image
const twitterImageUrl = generateTwitterCardImageUrl(publicId);
// Returns: https://res.cloudinary.com/{cloud}/image/upload/c_fill,w_800,h_418,f_auto,q_auto/{publicId}
```

### Platform-Specific

```typescript
import { generateSocialImageUrl } from '@/lib/utils/cloudinary.utils';

// For Open Graph
const ogUrl = generateSocialImageUrl(publicId, 'og');

// For Twitter
const twitterUrl = generateSocialImageUrl(publicId, 'twitter');

// Default dimensions
const defaultUrl = generateSocialImageUrl(publicId, 'default');
```

## Image Dimensions

```typescript
// Standard dimensions (from seo.constants.ts)
const IMAGE_DIMENSIONS = {
  default: { width: 800, height: 600 },
  openGraph: { width: 1200, height: 630 },
  twitter: { width: 800, height: 418 },
};
```

## Folder Organization

Use constants for consistent folder paths:

```typescript
import { CLOUDINARY_PATHS } from '@/lib/constants/cloudinary-paths';

// Example structure
const CLOUDINARY_PATHS = {
  BOBBLEHEADS: 'bobbleheads',
  COLLECTIONS: 'collections',
  USERS: {
    AVATARS: 'users/avatars',
    BANNERS: 'users/banners',
  },
};

// Usage in upload
const uploadPath = `${CLOUDINARY_PATHS.BOBBLEHEADS}/${bobbleheadId}`;
```

## Error Handling

All Cloudinary utilities include Sentry error logging:

```typescript
import * as Sentry from '@sentry/nextjs';

export function extractPublicIdFromCloudinaryUrl(url: string): string {
  try {
    // ... extraction logic
  } catch (error) {
    Sentry.captureException(error, {
      extra: { operation: 'parse-cloudinary-url', url },
      level: 'warning',
    });
    return url; // Fallback to original URL
  }
}
```

## SEO Metadata Integration

### In Page Metadata

```typescript
import { generateOpenGraphImageUrl, generateTwitterCardImageUrl } from '@/lib/utils/cloudinary.utils';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entity = await getEntity(params.id);
  const primaryImagePublicId = entity.photos[0]?.publicId;

  return {
    openGraph: {
      images: primaryImagePublicId
        ? [{ url: generateOpenGraphImageUrl(primaryImagePublicId) }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      images: primaryImagePublicId
        ? [generateTwitterCardImageUrl(primaryImagePublicId)]
        : undefined,
    },
  };
}
```

## Upload Patterns

### Basic Upload (via Service)

```typescript
import { CloudinaryService } from '@/lib/services/cloudinary.service';

const result = await CloudinaryService.upload({
  file,
  folder: CLOUDINARY_PATHS.BOBBLEHEADS,
  publicId: `${bobbleheadId}-${timestamp}`,
});

// Result includes:
// - publicId: string
// - url: string
// - width: number
// - height: number
// - format: string
```

### Photo Upload Validation

```typescript
import { photoUploadSchema } from '@/lib/validations/photo-upload.validation';

// Validates:
// - File size limits
// - Allowed formats (jpg, png, webp, etc.)
// - Image dimensions
```

## Component Patterns

### Photo Gallery

```typescript
import { CldImage } from 'next-cloudinary';
import { extractPublicIdFromCloudinaryUrl } from '@/lib/utils/cloudinary.utils';

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  return (
    <div className={'grid grid-cols-3 gap-4'}>
      {photos.map((photo) => {
        const publicId = extractPublicIdFromCloudinaryUrl(photo.url);

        return (
          <CldImage
            key={photo.id}
            alt={photo.altText || 'Photo'}
            crop={'fill'}
            gravity={'auto'}
            height={200}
            quality={'auto'}
            src={publicId}
            width={200}
          />
        );
      })}
    </div>
  );
}
```

### Avatar Component

```typescript
import { CldImage } from 'next-cloudinary';
import { extractPublicIdFromCloudinaryUrl } from '@/lib/utils/cloudinary.utils';

interface AvatarProps {
  avatarUrl: string | null;
  displayName: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: 32,
  md: 48,
  lg: 96,
};

export function Avatar({ avatarUrl, displayName, size = 'md' }: AvatarProps) {
  const dimension = SIZES[size];

  if (!avatarUrl) {
    return <FallbackAvatar name={displayName} size={dimension} />;
  }

  const publicId = extractPublicIdFromCloudinaryUrl(avatarUrl);

  return (
    <CldImage
      alt={`${displayName}'s avatar`}
      className={'rounded-full'}
      crop={'thumb'}
      gravity={'face'}
      height={dimension}
      src={publicId}
      width={dimension}
    />
  );
}
```

## Transformation Reference

| Transformation | Code | Use Case |
|---------------|------|----------|
| Fill crop | `crop={'fill'}` | Gallery thumbnails |
| Thumb crop | `crop={'thumb'}` | Avatars |
| Face gravity | `gravity={'face'}` | Profile photos |
| Auto gravity | `gravity={'auto'}` | General images |
| Auto quality | `quality={'auto'}` | All images |
| Auto format | `f_auto` (in URL) | Social images |

## Anti-Patterns to Avoid

1. **Never hardcode cloud name** - Use env variable `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
2. **Never use full URLs in CldImage** - Extract and use publicId only
3. **Never skip alt text** - Always provide meaningful alt text
4. **Never ignore errors** - Log to Sentry and provide fallbacks
5. **Never use fixed dimensions without responsive** - Use `sizes` prop for responsive
6. **Never skip quality optimization** - Always use `quality={'auto'}`
7. **Never upload without folder organization** - Use `CLOUDINARY_PATHS` constants

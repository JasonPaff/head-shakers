# Cloudinary Media Conventions

## Overview

The project uses Cloudinary for image storage and optimization via the `next-cloudinary` package and custom service layer. Images are organized in hierarchical folder paths, transformed for different use cases (thumbnails, social sharing, etc.), and managed through type-safe utilities.

## File Structure

```
src/
├── lib/
│   ├── utils/cloudinary.utils.ts       # URL utilities (extract, generate)
│   ├── services/cloudinary.service.ts  # Server-side operations (upload, delete, move)
│   └── constants/cloudinary-paths.ts   # Folder paths and builders
├── types/cloudinary.types.ts           # Type definitions
└── components/ui/
    ├── cloudinary-photo-upload.tsx     # Photo upload component
    └── cloudinary-cover-upload.tsx     # Cover image upload component
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

// Server-side service
import { CloudinaryService } from '@/lib/services/cloudinary.service';

// Next.js Cloudinary components
import { CldImage, CldUploadWidget } from 'next-cloudinary';

// Path constants and builders
import { CLOUDINARY_PATHS, CloudinaryPathBuilder } from '@/lib/constants/cloudinary-paths';

// Type definitions
import type {
  CloudinaryPhoto,
  FileUploadProgress,
  PhotoMetadata,
  PhotoUploadState,
} from '@/types/cloudinary.types';
import { transformCloudinaryResult } from '@/types/cloudinary.types';
```

## Type Definitions

### CloudinaryPhoto Interface

```typescript
interface CloudinaryPhoto {
  id: string; // temp-{timestamp}-{random} or UUID for persisted
  publicId: string; // Cloudinary public_id
  url: string; // secure_url from Cloudinary
  originalFilename: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  uploadedAt: string;
  isPrimary: boolean;
  sortOrder: number;
  altText?: string;
  caption?: string;
  blobUrl?: string; // Local blob URL for optimistic preview
  isUploading?: boolean; // Optimistic upload state
  uploadProgress?: number; // Upload progress (0-100)
  uploadError?: string; // Error message if upload failed
}
```

### Upload State Interfaces

```typescript
interface PhotoUploadState {
  isUploading: boolean;
  totalCount: number;
  uploadedCount: number;
  progress?: number;
  error?: string;
  fileProgress: Map<string, FileUploadProgress>;
}

interface FileUploadProgress {
  filename: string;
  bytesUploaded: number;
  totalBytes: number;
  isComplete: boolean;
  isFailed: boolean;
  retryCount: number;
  startTime: number;
  error?: string;
}
```

### Transform Function

```typescript
import { transformCloudinaryResult } from '@/types/cloudinary.types';

// Convert CldUploadWidget result to CloudinaryPhoto
const photo = transformCloudinaryResult(result, {
  isPrimary: false,
  sortOrder: photos.length,
});
```

### Type Guards

```typescript
import { isPersistedPhoto, isTempPhoto } from '@/types/cloudinary.types';

// Check if photo is persisted (has UUID id)
if (isPersistedPhoto(photo)) {
  await deletePhoto({ bobbleheadId, photoId: photo.id });
}

// Check if photo is temporary (has temp-* id)
if (isTempPhoto(photo)) {
  // Skip server operations for temp photos
}
```

## Displaying Images

### CldImage Component

```typescript
import { CldImage } from 'next-cloudinary';

// Basic usage - always use publicId, not full URL
<CldImage
  alt={'Bobblehead photo'}
  crop={'fill'}
  gravity={'auto'}
  height={300}
  quality={'auto'}
  src={publicId}
  width={400}
/>

// With face detection for avatars
<CldImage
  alt={'Profile avatar'}
  crop={'thumb'}
  gravity={'face'}
  height={100}
  quality={'auto'}
  src={publicId}
  width={100}
/>

// Responsive with fill and sizes
<CldImage
  alt={'Gallery image'}
  className={'h-full w-full object-cover'}
  crop={'fill'}
  fill
  gravity={'auto'}
  quality={'auto:good'}
  sizes={'(max-width: 768px) 100vw, 50vw'}
  src={publicId}
/>

// With format auto-detection
<CldImage
  alt={'Optimized image'}
  crop={'fill'}
  format={'auto'}
  gravity={'auto'}
  height={400}
  quality={'auto:good'}
  src={publicId}
  width={400}
/>
```

## URL Utilities

### Extract PublicId from URL

```typescript
import { extractPublicIdFromCloudinaryUrl } from '@/lib/utils/cloudinary.utils';

// Full URL: https://res.cloudinary.com/demo/image/upload/v1234/users/abc/photo.jpg
const publicId = extractPublicIdFromCloudinaryUrl(url);
// Returns: "users/abc/photo"

// URL with transformations: https://res.cloudinary.com/demo/image/upload/c_fill,w_200/users/abc/photo.jpg
const publicId = extractPublicIdFromCloudinaryUrl(transformedUrl);
// Returns: "users/abc/photo"

// Handles errors gracefully - logs to Sentry and returns original URL
```

### Extract Format from URL

```typescript
import { extractFormatFromCloudinaryUrl } from '@/lib/utils/cloudinary.utils';

const format = extractFormatFromCloudinaryUrl(url);
// Returns: "jpg", "png", "webp", etc.
// Falls back to "jpg" on error with Sentry logging
```

## Social Sharing Images

### Open Graph (Facebook, LinkedIn)

```typescript
import { generateOpenGraphImageUrl } from '@/lib/utils/cloudinary.utils';

// Generates 1200x630 optimized image
const ogImageUrl = generateOpenGraphImageUrl(publicId);
// Returns: https://res.cloudinary.com/{cloud}/image/upload/c_fill,w_1200,h_630,f_auto,q_auto/{publicId}
// Falls back to DEFAULT_SOCIAL_IMAGE on error
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

### Image Dimensions Constants

```typescript
// From seo.constants.ts
const IMAGE_DIMENSIONS = {
  default: { width: 800, height: 600 },
  openGraph: { width: 1200, height: 630 },
  twitter: { width: 800, height: 418 },
};
```

## CloudinaryService (Server-Side)

### Delete Photos by URLs

```typescript
import { CloudinaryService } from '@/lib/services/cloudinary.service';

// Delete multiple photos by their URLs
const results = await CloudinaryService.deletePhotosByUrls(urls);
// Returns: Array<{ url, publicId, success, error? }>

// Each result includes:
// - url: Original URL passed in
// - publicId: Extracted public ID (or null if extraction failed)
// - success: Boolean indicating deletion success
// - error: Error message if failed
```

### Delete Photos by PublicIds

```typescript
// Delete photos directly by public IDs
const results = await CloudinaryService.deletePhotosFromCloudinary(publicIds);
// Returns: Array<{ publicId, success, error? }>

// Uses circuit breaker and retry logic automatically
```

### Move Photos to Permanent Folder

```typescript
// Move photos from temp folder to permanent location
const movedPhotos = await CloudinaryService.movePhotosToPermFolder(photos, targetFolder);
// Returns: Array<{ oldPublicId, newPublicId, newUrl }>

// Example:
const targetFolder = CloudinaryPathBuilder.bobbleheadPath(userId, collectionId, bobbleheadId);
const moved = await CloudinaryService.movePhotosToPermFolder(
  tempPhotos.map((p) => ({ publicId: p.publicId, url: p.url })),
  targetFolder,
);
```

### Generate Optimized URL

```typescript
// Generate URL with transformations
const url = CloudinaryService.getOptimizedUrl(publicId, {
  width: 800,
  height: 800,
  crop: 'fill',
  gravity: 'auto',
  quality: 'auto:good',
  format: 'auto',
});
```

### Generate Upload Signature

```typescript
// For signed uploads
const signature = CloudinaryService.generateUploadSignature(paramsToSign);
```

## Folder Organization

### Path Constants

```typescript
import { CLOUDINARY_PATHS } from '@/lib/constants/cloudinary-paths';

// Base folder names
CLOUDINARY_PATHS.FOLDERS.BOBBLEHEADS; // 'bobbleheads'
CLOUDINARY_PATHS.FOLDERS.COLLECTIONS; // 'collections'
CLOUDINARY_PATHS.FOLDERS.PROFILE; // 'profile'
CLOUDINARY_PATHS.FOLDERS.TEMP; // 'temp'
CLOUDINARY_PATHS.FOLDERS.UPLOADS; // 'uploads'
CLOUDINARY_PATHS.FOLDERS.USERS; // 'users'

// Path patterns (for reference)
CLOUDINARY_PATHS.PATTERNS.USER_ROOT; // 'users/{userId}'
CLOUDINARY_PATHS.PATTERNS.PROFILE_PHOTOS; // 'users/{userId}/profile'
CLOUDINARY_PATHS.PATTERNS.COLLECTION_ROOT; // 'users/{userId}/collections/{collectionId}'
CLOUDINARY_PATHS.PATTERNS.BOBBLEHEAD_ROOT; // 'users/{userId}/collections/{collectionId}/bobbleheads/{bobbleheadId}'
CLOUDINARY_PATHS.PATTERNS.TEMP_UPLOADS; // 'temp/uploads/{userId}'

// Placeholder images
CLOUDINARY_PATHS.PLACEHOLDERS.COLLECTION_COVER; // '/images/placeholders/collection-cover-placeholder.png'
CLOUDINARY_PATHS.PLACEHOLDERS.SUBCOLLECTION_COVER; // '/images/placeholders/subcollection-cover-placeholder.png'
```

### Path Builder Functions

```typescript
import { CloudinaryPathBuilder } from '@/lib/constants/cloudinary-paths';

// User root path
const userPath = CloudinaryPathBuilder.userRootPath(userId);
// Returns: 'users/{userId}'

// Profile photos path
const profilePath = CloudinaryPathBuilder.profilePath(userId);
// Returns: 'users/{userId}/profile'

// Collection path
const collectionPath = CloudinaryPathBuilder.collectionPath(userId, collectionId);
// Returns: 'users/{userId}/collections/{collectionId}'

// Collection cover path
const coverPath = CloudinaryPathBuilder.collectionCoverPath(userId, collectionId);
// Returns: 'users/{userId}/collections/{collectionId}/cover'

// Subcollection cover path
const subcollectionCoverPath = CloudinaryPathBuilder.subcollectionCoverPath(
  userId,
  collectionId,
  subcollectionId,
);
// Returns: 'users/{userId}/collections/{collectionId}/subcollections/{subcollectionId}/cover'

// Bobblehead photos path
const bobbleheadPath = CloudinaryPathBuilder.bobbleheadPath(userId, collectionId, bobbleheadId);
// Returns: 'users/{userId}/collections/{collectionId}/bobbleheads/{bobbleheadId}'

// Temporary uploads path
const tempPath = CloudinaryPathBuilder.tempPath(userId);
// Returns: 'temp/uploads/{userId}'
```

## Upload Widget Configuration

### CldUploadWidget Setup

```typescript
import { CldUploadWidget } from 'next-cloudinary';

<CldUploadWidget
  onError={handleError}
  onQueuesEnd={handleQueuesEnd}
  onQueuesStart={handleQueuesStart}
  onSuccess={handleSuccess}
  options={{
    clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
    context: {
      uploadedAt: new Date().toISOString(),
      userId,
    },
    cropping: false,
    folder: `users/${userId}/temp`,
    maxFiles: Math.max(0, maxPhotos - photos.length),
    maxFileSize: 10485760, // 10MB
    multiple: true,
    resourceType: 'image',
    showAdvancedOptions: false,
    showCompletedButton: true,
    showPoweredBy: false,
    sources: ['local', 'camera', 'url'],
    tags: ['bobblehead', userId ?? 'unknown', `upload-${crypto.randomUUID()}`],
  }}
  signatureEndpoint={'/api/upload/sign'}
>
  {({ open }) => (
    <Button onClick={() => open()}>Upload Photos</Button>
  )}
</CldUploadWidget>
```

### Optimistic Upload Pattern

```typescript
// Create optimistic photo during upload start
const handleQueuesStart = (data: { files?: Array<File> }) => {
  const files = data?.files || [];

  onPhotosChange((currentPhotos) => {
    const optimisticPhotos = files.map((file, index) => {
      const blobUrl = URL.createObjectURL(file);
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      return {
        id: tempId,
        publicId: tempId,
        url: blobUrl,
        blobUrl,
        originalFilename: file.name,
        format: file.type.split('/')[1] || 'unknown',
        bytes: file.size,
        width: 0,
        height: 0,
        uploadedAt: new Date().toISOString(),
        isPrimary: currentPhotos.length === 0 && index === 0,
        sortOrder: currentPhotos.length + index,
        isUploading: true,
        uploadProgress: 0,
      };
    });

    return [...currentPhotos, ...optimisticPhotos];
  });
};

// Replace optimistic photo with real data on success
const handleSuccess = (results: CloudinaryUploadWidgetResults) => {
  onPhotosChange((currentPhotos) => {
    const filename = results.info?.original_filename;
    const optimisticIndex = currentPhotos.findIndex((p) => p.isUploading && p.originalFilename === filename);

    if (optimisticIndex !== -1) {
      const optimisticPhoto = currentPhotos[optimisticIndex];

      // Cleanup blob URL
      if (optimisticPhoto.blobUrl) {
        URL.revokeObjectURL(optimisticPhoto.blobUrl);
      }

      const newPhoto = transformCloudinaryResult(results, {
        isPrimary: optimisticPhoto.isPrimary,
        sortOrder: optimisticPhoto.sortOrder,
      });

      const updatedPhotos = [...currentPhotos];
      updatedPhotos[optimisticIndex] = newPhoto;
      return updatedPhotos;
    }

    return currentPhotos;
  });
};
```

## SEO Metadata Integration

### In Page Metadata

```typescript
import { generateOpenGraphImageUrl, generateTwitterCardImageUrl } from '@/lib/utils/cloudinary.utils';
import { extractPublicIdFromCloudinaryUrl } from '@/lib/utils/cloudinary.utils';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entity = await getEntity(params.id);
  const primaryPhoto = entity.photos.find((p) => p.isPrimary);
  const primaryImagePublicId = primaryPhoto ? extractPublicIdFromCloudinaryUrl(primaryPhoto.url) : null;

  return {
    openGraph: {
      images: primaryImagePublicId ? [{ url: generateOpenGraphImageUrl(primaryImagePublicId) }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      images: primaryImagePublicId ? [generateTwitterCardImageUrl(primaryImagePublicId)] : undefined,
    },
  };
}
```

## Error Handling

### Sentry Integration in Utilities

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

### Service Error Handling

```typescript
import { createServiceError } from '@/lib/utils/error-builders';
import type { ServiceErrorContext } from '@/lib/utils/error-types';

// In CloudinaryService methods
try {
  // ... operation
} catch (error) {
  const context: ServiceErrorContext = {
    service: 'cloudinary',
    operation: 'movePhoto',
    method: 'movePhotosToPermFolder',
    endpoint: 'rename',
    isRetryable: true,
  };
  throw createServiceError(context, error);
}
```

### Upload Component Error Handling

```typescript
const handleError = (error: CloudinaryUploadWidgetError) => {
  const errorMessage = typeof error === 'string' ? error : (error?.statusText ?? 'Upload failed');

  const errorType =
    errorMessage.toLowerCase().includes('network') ? 'network'
    : errorMessage.toLowerCase().includes('permission') ? 'permission'
    : errorMessage.toLowerCase().includes('size') ? 'storage'
    : 'unknown';

  Sentry.captureException(error, {
    extra: { errorMessage, errorType, operation: 'cloudinary-upload' },
    level: 'error',
    tags: { component: 'cloudinary-photo-upload', errorType },
  });

  // Mark optimistic photos as failed
  onPhotosChange((currentPhotos) => {
    return currentPhotos.map((photo) => {
      if (photo.isUploading && !photo.uploadError) {
        return { ...photo, isUploading: false, uploadError: errorMessage };
      }
      return photo;
    });
  });
};
```

## Component Patterns

### Photo Gallery

```typescript
import { CldImage } from 'next-cloudinary';
import { extractPublicIdFromCloudinaryUrl } from '@/lib/utils/cloudinary.utils';

interface PhotoGalleryProps {
  photos: Array<CloudinaryPhoto>;
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  return (
    <div className={'grid grid-cols-3 gap-4'}>
      {photos
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((photo) => {
          const publicId = photo.publicId.startsWith('http')
            ? extractPublicIdFromCloudinaryUrl(photo.url)
            : photo.publicId;

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

const SIZES = { sm: 32, md: 48, lg: 96 };

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
      quality={'auto'}
      src={publicId}
      width={dimension}
    />
  );
}
```

### Primary Photo Badge

```typescript
import { StarIcon } from 'lucide-react';

{photo.isPrimary && (
  <div className={'absolute top-2 left-2'}>
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full',
      'bg-yellow-500 px-2 py-1 text-xs font-semibold text-white',
      'shadow-md dark:bg-yellow-400 dark:text-yellow-950'
    )}>
      <StarIcon aria-hidden className={'size-3 fill-current'} />
      Primary
    </span>
  </div>
)}
```

## Transformation Reference

| Transformation | Code                          | Use Case                  |
| -------------- | ----------------------------- | ------------------------- |
| Fill crop      | `crop={'fill'}`               | Gallery thumbnails, cards |
| Thumb crop     | `crop={'thumb'}`              | Avatars, profile photos   |
| Face gravity   | `gravity={'face'}`            | Profile photos, avatars   |
| Auto gravity   | `gravity={'auto'}`            | General images            |
| Auto quality   | `quality={'auto'}`            | All images                |
| Good quality   | `quality={'auto:good'}`       | High-quality displays     |
| Low quality    | `quality={'auto:low'}`        | Thumbnails, previews      |
| Auto format    | `format={'auto'}` or `f_auto` | All images                |

## Anti-Patterns to Avoid

1. **Never hardcode cloud name** - Use env variable `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
2. **Never use full URLs in CldImage** - Extract and use publicId only
3. **Never skip alt text** - Always provide meaningful alt text for accessibility
4. **Never ignore errors** - Log to Sentry and provide fallbacks
5. **Never use fixed dimensions without responsive** - Use `sizes` prop for responsive images
6. **Never skip quality optimization** - Always use `quality={'auto'}` or similar
7. **Never upload without folder organization** - Use `CloudinaryPathBuilder` functions
8. **Never hardcode folder paths** - Use `CLOUDINARY_PATHS` constants
9. **Never forget to cleanup blob URLs** - Call `URL.revokeObjectURL()` when done
10. **Never call server actions for temp photos** - Check with `isTempPhoto()` first
11. **Never skip circuit breakers** - Use `CloudinaryService` methods which include them
12. **Never forget primary photo logic** - First photo should be primary by default

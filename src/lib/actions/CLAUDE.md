# Server Actions (`src/lib/actions/`)

This directory contains all server-side business logic using the ZSA (Zod Server Actions) pattern. Server actions provide type-safe, validated endpoints for client-server communication with built-in error handling and authentication.

## Architecture Overview

### Next-Server-Action Pattern
All server actions follow the Next-Server-Action pattern for a consistent structure:

### Key Benefits
- **Type safety** from input to output
- **Automatic validation** with Zod schemas
- **Built-in error handling** with user-friendly messages
- **Authentication integration** with Clerk
- **Consistent API** across all server operations

## Action Files Organization

### Core Domain Actions

#### Analytics Actions (`analytic.action.ts`)
Tracking and metrics operations:
- **Content view tracking** for collections and items
- **Search analytics** recording and analysis
- **User behavior metrics** collection
- **Performance tracking** for optimization

#### Bobblehead Actions (`bobblehead.action.ts`)
Core item management operations:
- **CRUD operations** for bobblehead items
- **Photo management** with Cloudinary integration
- **Bulk operations** for batch updates
- **Search and filtering** with advanced queries

#### Collection Actions (`collection.action.ts`)
Collection management and organization:
- **Collection CRUD** operations
- **Sub-collection management** 
- **Collection sharing** and privacy controls
- **Collection analytics** and insights

#### Social Actions (`social.action.ts`)
Community and interaction features:
- **Follow/unfollow** user relationships
- **Like/unlike** content interactions
- **Comment** creation and management
- **User blocking** and moderation

#### Tag Actions (`tag.action.ts`)
Tagging and categorization system:
- **Tag creation** and management
- **Tag assignment** to bobbleheads
- **Tag-based search** and filtering
- **Popular tags** analytics

#### User Actions (`user.action.ts`)
User profile and account management:
- **Profile updates** and customization
- **Account settings** management
- **Privacy controls** configuration
- **User statistics** calculation

### System Actions

#### System Actions (`system.action.ts`)
Platform-wide administrative operations:
- **Featured content** management
- **System notifications** creation
- **Configuration** updates
- **Maintenance operations**

#### Moderation Actions (`moderation.ts`)
Content moderation and safety:
- **Content reporting** submission and processing
- **Moderation decisions** implementation
- **User sanctions** management
- **Automated moderation** rules

## Common Patterns

### Authentication Flow
All sensitive actions include authentication checks:

```typescript
import { auth } from '@clerk/nextjs/server'

export const protectedAction = createServerAction()
  .input(inputSchema)
  .handler(async ({ input }) => {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error('Authentication required')
    }
    
    // Authenticated logic here
  })
```

### Validation Pattern
Input validation using Zod schemas from `validations/`:

```typescript
import { createBobbleheadSchema } from '@/lib/validations/bobblehead'

export const createBobblehead = createServerAction()
  .input(createBobbleheadSchema)
  .handler(async ({ input }) => {
    // input is fully typed and validated
    const bobblehead = await db.insert(bobbleheads).values(input)
    return bobblehead
  })
```

### Database Integration
Actions use the query layer for database operations:

```typescript
import { getBobbleheadById } from '@/lib/queries/bobblehead.queries'
import { updateBobbleheadById } from '@/lib/queries/bobblehead.queries'

export const updateBobblehead = createServerAction()
  .input(updateBobbleheadSchema)
  .handler(async ({ input }) => {
    const { id, ...updates } = input
    
    // Validate ownership
    const existing = await getBobbleheadById(id)
    if (existing.userId !== userId) {
      throw new Error('Unauthorized')
    }
    
    // Perform update
    return await updateBobbleheadById(id, updates)
  })
```

### Error Handling
Consistent error handling with user-friendly messages:

```typescript
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'

export const actionWithErrorHandling = createServerAction()
  .input(schema)
  .handler(async ({ input }) => {
    try {
      return await businessLogic(input)
    } catch (error) {
      if (error instanceof ZodError) {
        throw fromZodError(error)
      }
      
      // Log unexpected errors
      console.error('Action error:', error)
      throw new Error('An unexpected error occurred')
    }
  })
```

## Advanced Patterns

### Optimistic Updates
Actions support optimistic UI updates:

```typescript
export const likeBobblehead = createServerAction()
  .input(z.object({ bobbleheadId: z.string().uuid() }))
  .handler(async ({ input }) => {
    const { userId } = await auth()
    
    // Toggle like status
    const existingLike = await getLikeByUserAndContent(userId, input.bobbleheadId)
    
    if (existingLike) {
      await deleteLike(existingLike.id)
      return { liked: false }
    } else {
      await createLike({ userId, bobbleheadId: input.bobbleheadId })
      return { liked: true }
    }
  })
```

### Batch Operations
Support for bulk operations:

```typescript
export const updateMultipleBobbleheads = createServerAction()
  .input(z.object({
    ids: z.array(z.string().uuid()),
    updates: partialBobbleheadSchema
  }))
  .handler(async ({ input }) => {
    const { userId } = await auth()
    
    // Validate ownership of all items
    const bobbleheads = await getBobbleheadsByIds(input.ids)
    const unauthorized = bobbleheads.filter(b => b.userId !== userId)
    
    if (unauthorized.length > 0) {
      throw new Error('Unauthorized items detected')
    }
    
    // Perform batch update
    return await updateBobbleheadsByIds(input.ids, input.updates)
  })
```

### Real-time Integration
Actions that trigger real-time events:

```typescript
import { publishToChannel } from '@/lib/services/ably'

export const addItemToCollection = createServerAction()
  .input(addItemSchema)
  .handler(async ({ input }) => {
    const newItem = await createBobblehead(input)
    
    // Notify real-time subscribers
    await publishToChannel(`collection:${input.collectionId}`, {
      type: 'item_added',
      item: newItem
    })
    
    return newItem
  })
```

### Permission Checks
Role-based access control:

```typescript
import { hasPermission } from '@/lib/utils/permissions'

export const moderateContent = createServerAction()
  .input(moderationSchema)
  .handler(async ({ input }) => {
    const { userId } = await auth()
    
    if (!await hasPermission(userId, 'moderate_content')) {
      throw new Error('Insufficient permissions')
    }
    
    return await performModerationAction(input)
  })
```

## External Service Integration

### Cloudinary Integration
Image upload and management:

```typescript
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/services/cloudinary'

export const uploadBobbleheadPhoto = createServerAction()
  .input(photoUploadSchema)
  .handler(async ({ input }) => {
    const { bobbleheadId, imageFile } = input
    
    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(imageFile, {
      folder: `bobbleheads/${bobbleheadId}`,
      transformation: [
        { width: 800, height: 600, crop: 'fill' },
        { quality: 'auto' }
      ]
    })
    
    // Save to database
    return await createBobbleheadPhoto({
      bobbleheadId,
      url: uploadResult.secure_url,
      width: uploadResult.width,
      height: uploadResult.height
    })
  })
```

### Email Notifications
Integration with Resend for notifications:

```typescript
import { sendEmail } from '@/lib/services/resend'

export const followUser = createServerAction()
  .input(followSchema)
  .handler(async ({ input }) => {
    const follow = await createFollow(input)
    
    // Send notification email
    await sendEmail({
      to: input.followingId,
      template: 'new_follower',
      data: {
        followerName: currentUser.displayName,
        followerProfile: `${process.env.NEXT_PUBLIC_APP_URL}/users/${currentUser.id}`
      }
    })
    
    return follow
  })
```

## Performance Considerations

### Caching Strategy
Actions implement caching where appropriate:

```typescript
import { cache } from '@/lib/utils/cache'

export const getPopularBobbleheads = createServerAction()
  .input(z.object({ limit: z.number().default(20) }))
  .handler(async ({ input }) => {
    const cacheKey = `popular_bobbleheads:${input.limit}`
    
    return await cache.get(cacheKey, async () => {
      return await getPopularBobbleheadsQuery(input.limit)
    }, { ttl: 300 }) // 5 minutes
  })
```

### Rate Limiting
Rate limiting for public actions:

```typescript
import { rateLimit } from '@/lib/utils/rate-limit'

export const searchBobbleheads = createServerAction()
  .input(searchSchema)
  .handler(async ({ input }) => {
    const { userId } = await auth()
    
    // Apply rate limiting
    await rateLimit.check({
      identifier: userId || 'anonymous',
      limit: 100, // requests
      window: 3600 // per hour
    })
    
    return await performSearch(input)
  })
```

## Development Guidelines

### Adding New Actions
1. Define Zod validation schema in `validations/`
2. Create query functions in `queries/` if needed
3. Implement server action with ZSA pattern
4. Add authentication checks for sensitive operations
5. Include proper error handling
6. Add integration tests

### Error Handling Best Practices
- Use specific error messages for user feedback
- Log detailed errors for debugging
- Handle different error types appropriately
- Provide fallback behaviors where possible

### Testing Actions
- Unit tests for validation logic
- Integration tests for database operations
- End-to-end tests for complete workflows
- Performance tests for expensive operations

This server action architecture provides a robust, type-safe foundation for all server-side operations in the Head Shakers platform.
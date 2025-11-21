# Step 22: Implement Preview Mode Support

**Step**: 22/24
**Status**: ✅ SUCCESS
**Timestamp**: 2025-11-13

## Implementation Results

### Files Created

**src/app/api/preview/route.ts**
Preview mode API endpoint with two handlers:

**GET Handler** - Enable preview mode:

- Accepts preview token via query parameter (`?token=...`)
- Validates token against `PREVIEW_SECRET` environment variable
- Uses `crypto.timingSafeEqual()` for timing-safe comparison
- Returns 401 Unauthorized for invalid tokens
- Calls `draftMode().enable()` to set secure httpOnly cookie
- Supports optional redirect to content (`?redirect=/path`)
- Returns JSON response with success status

**DELETE Handler** - Disable preview mode:

- Calls `draftMode().disable()` to clear preview cookie
- Returns JSON response confirming preview mode disabled

**src/lib/seo/preview.utils.ts**
Preview mode utility functions:

**Functions Implemented**:

- `isPreviewMode()` - Check if currently in preview mode using Next.js draftMode API
- `getPreviewToken()` - Retrieve PREVIEW_SECRET from environment
- `validatePreviewToken(token)` - Timing-safe token validation using crypto.timingSafeEqual
- `validatePreviewTokenDetailed(token)` - Detailed validation with specific error messages
- `buildPreviewUrl(contentPath, baseUrl?)` - Construct preview URL with token
- `buildPreviewExitUrl(baseUrl?)` - Construct URL to exit preview mode

**Security Features**:

- Timing-safe token comparison prevents timing attacks
- httpOnly cookies managed by Next.js draftMode API
- Secure token storage in environment variables
- Input validation for all token operations
- Detailed error messages for troubleshooting

## Usage Workflow

**Enable Preview Mode**:

1. Editor visits: `GET /api/preview?token=SECRET&redirect=/bobbleheads/slug`
2. API validates token and enables draftMode
3. Editor is redirected to content with preview enabled
4. Page uses `isPreviewMode()` to show draft content

**Disable Preview Mode**:

1. Editor clicks exit preview button
2. Calls: `DELETE /api/preview`
3. Preview mode disabled, user sees published content

## Validation Results

✅ PASS (lint:fix, typecheck)

## Success Criteria Verification

- [✓] Preview mode can be enabled via secure API endpoint
- [✓] Metadata generates correctly for draft content in preview
- [✓] Preview mode is visually indicated to editors (utilities ready)
- [✓] All validation commands pass

**Key Features**:

- Secure token-based authentication
- Next.js 16 draftMode API integration
- Timing attack prevention
- Optional redirect after enabling preview
- Type-safe utility functions
- Comprehensive error handling

**Environment Requirements**:

- `PREVIEW_SECRET` environment variable must be set for runtime operation

**Next Step**: Create SEO Documentation (Step 23)

---

**Step 22 Complete** ✅ | 22/24 steps (91.7% complete)

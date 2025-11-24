# Step 1: Architecture Analysis Results

**Timestamp**: 2025-11-24
**Specialist**: facade-specialist
**Status**: SUCCESS

## Summary

Analyzed the current featured content architecture to understand data availability for the home page redesign.

## Key Findings

### Bobblehead Data Structure
- **Full schema available** with engagement metrics (likeCount, viewCount, commentCount)
- **Specifications**: height, weight, material, manufacturer, year, series
- **Photos**: Separate bobbleheadPhotos table with isPrimary flag
- **Cloudinary integration**: Standard URL patterns in place

### Featured Content System
- **Content Types**: bobblehead, collection, user
- **Feature Types**: homepage_banner (3), collection_of_week (1), trending (8), editor_pick (6)
- **Existing methods**: getActiveFeaturedContent, getTrendingContent, getEditorPicks

### Gap Analysis

**Missing from current queries for bobblehead featured content:**
1. Primary photo URL (bobbleheadPhotos join missing)
2. Bobblehead name in transformer output
3. Owner display name resolution for bobblehead content type
4. Specification fields for detailed displays

## Recommended Approach for Step 5

Instead of creating a completely new getFeaturedBobbleheads method, enhance:
1. `findActiveFeaturedContentAsync` query - add bobbleheadPhotos join
2. `FeaturedContentTransformer` - add bobblehead-specific field mapping

## Cloudinary URL Structure

```
Base: https://res.cloudinary.com/{cloud}/image/upload/
Path: users/{userId}/collections/{collectionId}/bobbleheads/{bobbleheadId}/
Blur: c_fill,w_10,h_10,e_blur:1000,q_1,f_auto/
Responsive: c_fill,w_{width},h_{height},f_auto,q_auto/
```

## Pre-existing Issues

TypeScript error in search-page-content.tsx (filter types) - not related to this feature.

## Next Steps

Proceed to Step 2: Design enhanced color palette and animation system in globals.css

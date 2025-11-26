# Step 7: Remove Subcollection References from Social Query/Facade

**Timestamp**: 2025-11-26T10:40:00Z
**Specialist**: facade-specialist
**Duration**: ~2 minutes

## Step Summary

Removed subcollection target type from social features (likes, comments).

## Files Modified

### src/lib/queries/social/social.query.ts

- Removed `subCollections` import from schema
- Removed 'subcollection' case from `decrementCommentCountAsync` switch
- Removed 'subcollection' case from `decrementLikeCountAsync` switch
- Removed 'subcollection' case from `incrementCommentCountAsync` switch
- Removed 'subcollection' case from `incrementLikeCountAsync` switch
- Updated `getUserLikeStatusesAsync` type to remove 'subcollection' from union

### src/lib/facades/social/social.facade.ts

- Simplified cache tag generation in `getComments` (removed subcollection conditional)
- Simplified cache tag generation in `getCommentsWithReplies` (removed subcollection conditional)
- Simplified cache tag generation in `getLikeCount` (removed subcollection conditional)

## Success Criteria

- [✓] 'subcollection' removed from like target type logic
- [✓] 'subcollection' removed from comment target type logic
- [✓] No subcollection validation in social.query.ts or social.facade.ts

## Status

**SUCCESS** - Social query and facade layers cleaned of subcollection logic.

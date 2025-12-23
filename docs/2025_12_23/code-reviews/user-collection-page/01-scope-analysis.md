# Code Review Scope Analysis

## Target Area

- **Description**: User collection public view page - displays a collection owned by a user with bobbleheads grid/list, social features, and comments
- **Entry Point**: `src/app/(app)/user/[username]/collection/[collectionSlug]/page.tsx`
- **Route**: `/user/[username]/collection/[collectionSlug]`

## Call Graph Overview

```
CollectionPage (page.tsx)
├── generateMetadata() [METADATA GENERATION]
│   ├── CollectionsFacade.getCollectionByUsernameAndSlugAsync(username, collectionSlug)
│   └── CollectionsFacade.getCollectionSeoMetadata(collectionSlug, userId)
│
└── CollectionPage() [MAIN RENDER]
    ├── getUserIdAsync()
    ├── CollectionsFacade.getCollectionByUsernameAndSlugAsync(username, collectionSlug, currentUserId)
    ├── SocialFacade.getContentLikeData(collectionId, 'collection', currentUserId)
    ├── getIsOwnerAsync(collection.userId)
    │
    ├── <CollectionPageClientWrapper> [CLIENT WRAPPER]
    ├── <CollectionHeader> [CLIENT COMPONENT]
    ├── <CollectionBobbleheadsAsync> [ASYNC BOBBLEHEADS]
    │   └── CollectionsFacade.getAllCollectionBobbleheadsWithPhotos()
    └── <CommentSectionAsync> [ASYNC COMMENTS]
        └── SocialFacade.getCommentsWithReplies()
```

## Review Assignments Summary

| Category | Files | Methods/Components | Priority |
|----------|-------|-------------------|----------|
| Server Components | 3 | 4 | 3 HIGH, 1 MEDIUM |
| Client Components | 2 | 2 | 1 HIGH, 1 MEDIUM |
| Facades | 3 | 12 | 5 HIGH, 6 MEDIUM, 1 LOW |
| Queries | 3 | 10 | 2 HIGH, 6 MEDIUM, 2 LOW |
| Validation | 1 | 2 | 1 MEDIUM, 1 LOW |

# Code Review Scope Analysis

## Target Area

- **Description**: The application footer whose entry point is app-footer.tsx
- **Entry Point**: `src/components/layout/app-footer/app-footer.tsx`
- **Route**: Rendered in root layout (appears on all pages)

## Call Graph Overview

```
AppFooter (server component)
├── FooterContainer
│   └── generateTestId('layout', 'app-footer', 'container')
│
├── Brand Section (inline JSX)
│   ├── Link → $path({ route: '/' })
│   └── generateTestId('layout', 'app-footer', 'brand-section')
│
├── FooterSocialLinks
│   ├── getActiveSocialPlatforms()
│   │   └── seoConfig.socialProfiles[name]
│   └── generateTestId('layout', 'app-footer', 'social-links')
│
├── FooterNewsletter (client component)
│   ├── withFocusManagement(Component)
│   │   └── <FocusProvider>
│   │       └── useFocusManagement()
│   ├── useServerAction(subscribeToNewsletterAction)
│   │   ├── useAction() from next-safe-action
│   │   └── toast.promise()
│   ├── useAppForm()
│   │   └── createFormHook with TanStack Form
│   ├── form.AppField → TextField component
│   ├── form.SubmitButton
│   └── subscribeToNewsletterAction (server action)
│       ├── newsletterSignupSchema.parse()
│       ├── Sentry.setContext(NEWSLETTER_DATA)
│       └── NewsletterFacade.subscribeAsync()
│           ├── db.transaction()
│           ├── NewsletterQuery.findByEmailAsync()
│           ├── NewsletterQuery.createSignupAsync()
│           ├── NewsletterQuery.resubscribeAsync()
│           ├── NewsletterQuery.updateUserIdAsync()
│           └── ResendService.sendNewsletterWelcomeAsync() [fire-and-forget]
│
├── FooterNavSection (Browse)
│   ├── FooterNavLink × 4
│   │   ├── $path({ route: '/browse' })
│   │   ├── $path({ route: '/browse/featured' })
│   │   ├── $path({ route: '/browse/categories' })
│   │   └── $path({ route: '/browse/trending' })
│   └── generateTestId('layout', 'app-footer', 'nav-section')
│
├── FooterFeaturedSection (async server component)
│   ├── FeaturedContentFacade.getFooterFeaturedContentAsync()
│   │   ├── Sentry.addBreadcrumb('Fetching footer featured content')
│   │   └── CacheService.featured.content()
│   │       └── FeaturedContentQuery.getFooterFeaturedContentAsync()
│   │           └── SELECT from featuredContent JOIN collections
│   ├── FooterNavSection (Featured Collections)
│   └── FooterNavLink × N (dynamic based on featured collections)
│       └── $path({ route: '/collections/[collectionSlug]' })
│
└── FooterLegal
    ├── generateTestId('layout', 'app-footer', 'legal')
    ├── new Date().getFullYear()
    ├── legalLinks array (static)
    │   ├── $path({ route: '/about' })
    │   ├── $path({ route: '/terms' })
    │   └── $path({ route: '/privacy' })
    └── Separator (Radix UI)
        └── cn() utility
```

## Summary Statistics

| Category | Files | Methods/Components | Priority Breakdown |
|----------|-------|-------------------|-------------------|
| Server Components | 8 | 10 | 2 HIGH, 3 MEDIUM, 5 LOW |
| Client Components | 2 | 2 | 1 HIGH, 1 LOW |
| Server Actions | 1 | 2 | 1 HIGH, 1 MEDIUM |
| Facades | 2 | 2 | 2 HIGH |
| Cache Service | 1 | 1 | 1 MEDIUM |
| Queries | 2 | 5 | 3 HIGH, 2 MEDIUM |
| Validation | 1 | 1 | 1 MEDIUM |
| Utilities | 3 | 3 | 1 MEDIUM, 2 LOW |
| Hooks | 4 | 5 | 2 HIGH, 3 MEDIUM |
| UI Components | 1 | 1 | 1 LOW |
| Config | 1 | 1 (partial) | 1 MEDIUM |
| **Total** | **26** | **33** | **9 HIGH, 11 MEDIUM, 13 LOW** |

## Files to Review

### Server Components
- `src/components/layout/app-footer/app-footer.tsx`
- `src/components/layout/app-footer/components/footer-container.tsx`
- `src/components/layout/app-footer/components/footer-social-links.tsx`
- `src/components/layout/app-footer/components/footer-nav-section.tsx`
- `src/components/layout/app-footer/components/footer-nav-link.tsx`
- `src/components/layout/app-footer/components/footer-legal.tsx`
- `src/components/layout/app-footer/components/footer-featured-section.tsx`

### Client Components
- `src/components/layout/app-footer/components/footer-newsletter.tsx`
- `src/components/ui/separator.tsx`

### Server Actions
- `src/lib/actions/newsletter/newsletter.actions.ts`

### Facades
- `src/lib/facades/featured-content/featured-content.facade.ts` (only `getFooterFeaturedContentAsync`)
- `src/lib/facades/newsletter/newsletter.facade.ts` (only `subscribeAsync`)

### Queries
- `src/lib/queries/featured-content/featured-content-query.ts` (only `getFooterFeaturedContentAsync`)
- `src/lib/queries/newsletter/newsletter.queries.ts` (4 methods: `findByEmailAsync`, `createSignupAsync`, `resubscribeAsync`, `updateUserIdAsync`)

### Validation
- `src/lib/validations/newsletter.validation.ts`

### Hooks
- `src/hooks/use-server-action.ts`
- `src/components/ui/form/index.tsx` (only `useAppForm`)
- `src/components/ui/form/focus-management/with-focus-management.tsx`
- `src/components/ui/form/focus-management/focus-context.tsx`

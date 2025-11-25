# App Footer Component

## Overview

The App Footer is a comprehensive footer component for the Head Shakers platform, providing site navigation, brand information, social media links, newsletter signup, and featured collections. It's designed with a responsive layout that adapts from mobile to desktop viewports.

## Component Architecture

### Main Component

- **File**: `src/components/layout/app-footer/app-footer.tsx`
- **Type**: Server Component
- **Purpose**: Orchestrates all footer sections with responsive grid layout

### Sub-Components

#### 1. FooterContainer
- **File**: `components/footer-container.tsx`
- **Type**: Client Component
- **Purpose**: Responsive grid wrapper for footer content sections
- **Layout**: Adapts from single column (mobile) to multi-column (desktop)

#### 2. FooterNavSection
- **File**: `components/footer-nav-section.tsx`
- **Type**: Client Component
- **Purpose**: Navigation section wrapper with heading and links
- **Usage**: Groups related navigation links under a heading

#### 3. FooterNavLink
- **File**: `components/footer-nav-link.tsx`
- **Type**: Client Component
- **Purpose**: Individual navigation link with consistent styling
- **Features**: Hover states, focus management, aria labels

#### 4. FooterSocialLinks
- **File**: `components/footer-social-links.tsx`
- **Type**: Client Component
- **Purpose**: Displays social media platform links with icons
- **Configuration**: Reads from `seoConfig.socialProfiles` in `config.ts`
- **Platforms**: Facebook, Twitter, Instagram, LinkedIn
- **Behavior**: Only renders platforms with configured URLs

#### 5. FooterNewsletter
- **File**: `components/footer-newsletter.tsx`
- **Type**: Client Component with Form
- **Purpose**: Newsletter email signup form
- **Features**:
  - Email validation with Zod schema
  - Server action integration
  - Toast notifications for success/error states
  - Focus management for accessibility
  - Loading states during submission

#### 6. FooterFeaturedSection
- **File**: `components/footer-featured-section.tsx`
- **Type**: Server Component (async)
- **Purpose**: Displays up to 4 featured collections
- **Data Source**: `FeaturedContentFacade.getActiveFeaturedContent()`
- **Behavior**:
  - Filters for collection content type only
  - Limits to 4 items maximum
  - Returns null if no featured collections available

#### 7. FooterLegal
- **File**: `components/footer-legal.tsx`
- **Type**: Client Component
- **Purpose**: Copyright notice and legal links (Terms, Privacy, etc.)
- **Layout**: Responsive - stacks on mobile, inline on desktop

## Footer Sections

### Brand & Newsletter Section

Located on the left side (desktop) or top (mobile), contains:

1. **Brand Identity**
   - Head Shakers logo (HS initials in colored square)
   - Site name: "Head Shakers"
   - Tagline: "Your digital bobblehead collection platform."

2. **Social Links**
   - Dynamically rendered based on configured URLs
   - Icons from Lucide React
   - Opens in new tab with security attributes

3. **Newsletter Signup**
   - Email input field with validation
   - Subscribe button with loading states
   - Error messages for invalid input
   - Success toast on subscription

### Browse Section

Navigation links for browsing content:
- All Bobbleheads (`/browse`)
- Featured (`/browse/featured`)
- Categories (`/browse/categories`)
- Trending (`/browse/trending`)

### Featured Collections Section

Dynamically displays featured collections:
- Server-side data fetching
- Maximum 4 collections shown
- Links to collection detail pages
- Gracefully handles empty state (returns null)

### Legal Bar

Bottom section with:
- Copyright notice with current year
- Legal navigation links:
  - About
  - Terms of Service
  - Privacy Policy
  - Contact

## Configuration

### Social Media Links

Social links are configured in `src/lib/config/config.ts`:

```typescript
seoConfig: {
  socialProfiles: {
    facebook: '',  // Add URL: 'https://facebook.com/headshakers'
    instagram: '', // Add URL: 'https://instagram.com/headshakers'
    linkedin: '',  // Add URL: 'https://linkedin.com/company/headshakers'
    twitter: '',   // Add URL: 'https://twitter.com/headshakers'
  }
}
```

To enable a social platform:
1. Add the full URL to the corresponding property in `seoConfig.socialProfiles`
2. The link will automatically appear in the footer
3. Empty strings result in the platform being hidden

### Featured Collections Limit

The footer displays up to 4 featured collections by default. This limit is configured in `src/lib/constants/config.ts`:

```typescript
CONFIG: {
  CONTENT: {
    MAX_FEATURED_FOOTER_ITEMS: 4, // Maximum featured collections shown in footer
    // ... other constants
  }
}
```

To change the limit, modify the `MAX_FEATURED_FOOTER_ITEMS` constant in the config file.

### Newsletter Configuration

Newsletter signup is handled by:
- **Server Action**: `src/lib/actions/newsletter/newsletter.actions.ts`
- **Validation Schema**: `src/lib/validations/newsletter.validation.ts`
- **Form Hook**: Uses `useAppForm` from the project's form system

## Usage Examples

### Basic Usage

The footer is automatically included in the root layout:

```tsx
import { AppFooter } from '@/components/layout/app-footer/app-footer';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <main>{children}</main>
        <AppFooter />
      </body>
    </html>
  );
}
```

### Customizing Social Links

Edit `src/lib/config/config.ts`:

```typescript
export const seoConfig = {
  // ... other config
  socialProfiles: {
    facebook: 'https://facebook.com/headshakers',
    twitter: 'https://twitter.com/headshakers',
    instagram: 'https://instagram.com/headshakers',
    linkedin: '', // Leave empty to hide
  },
};
```

### Adding New Navigation Sections

Add a new section to `app-footer.tsx`:

```tsx
<FooterNavSection heading={'Community'} testId={'footer-nav-community'}>
  <FooterNavLink
    href={$path({ route: '/community' })}
    label={'Forum'}
    testId={'footer-nav-link-forum'}
  />
  <FooterNavLink
    href={$path({ route: '/events' })}
    label={'Events'}
    testId={'footer-nav-link-events'}
  />
</FooterNavSection>
```

### Newsletter Action Flow

1. User enters email in footer form
2. Client-side validation with Zod schema
3. On valid submission:
   - Calls `subscribeToNewsletterAction` server action
   - Shows loading toast ("Subscribing...")
   - On success: Shows success toast ("Thanks for subscribing!")
   - On error: Shows error toast ("Failed to subscribe. Please try again.")
4. Form resets on successful subscription

## Accessibility Considerations

### ARIA Labels

- Footer has `aria-label="Site footer"`
- Social links have descriptive `aria-label` (e.g., "Follow us on Twitter")
- Newsletter input has `aria-label="Email address"`
- Form errors are announced with `aria-invalid`

### Keyboard Navigation

- All links are keyboard accessible
- Focus visible states on all interactive elements
- Newsletter form supports tab navigation
- Error messages receive focus for screen readers

### Focus Management

- Newsletter form uses focus context from form system
- Errors trigger focus on first invalid field
- Focus visible states use ring utilities from Tailwind

### Screen Reader Support

- Icons marked with `aria-hidden`
- Descriptive labels for all interactive elements
- Error messages linked to form fields
- Semantic HTML structure (footer, nav sections)

## Responsive Design

### Mobile (< 768px)
- Single column layout
- Brand section at top
- Navigation sections stacked
- Legal links stack vertically

### Tablet (768px - 1024px)
- 2-column grid
- Brand section spans 2 columns
- Navigation sections in columns

### Desktop (> 1024px)
- 4-column grid
- Optimal spacing and alignment
- Inline legal links

## Styling

### Tailwind Classes

Key styling patterns used:

```typescript
// Container padding
className={'px-2 sm:px-4 md:px-6 lg:px-10'}

// Grid layout
className={'grid gap-8 md:grid-cols-2 lg:grid-cols-4'}

// Link hover states
className={'hover:text-foreground transition-colors'}

// Focus visible
className={'focus-visible:ring-2 focus-visible:ring-ring'}
```

### Theme Support

All colors use CSS variables that adapt to light/dark themes:
- `bg-background` - Footer background
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `bg-primary` - Brand logo background
- `border` - Top border color

## Testing

### Test IDs

All components include data-testid attributes:

```typescript
generateTestId('layout', 'app-footer')
generateTestId('layout', 'app-footer', 'brand-section')
generateTestId('layout', 'app-footer', 'social-links')
generateTestId('layout', 'app-footer', 'social-facebook')
generateTestId('footer-newsletter-email')
generateTestId('footer-newsletter-submit')
generateTestId('footer-nav-browse')
generateTestId('footer-nav-link-browse')
```

### Test Coverage

Test files should cover:
- Newsletter form submission and validation
- Social links rendering based on config
- Featured collections display
- Navigation link accessibility
- Responsive layout behavior
- Error states and loading states

## Performance

### Server Components

- Main footer is a server component
- Featured section fetches data on server
- Reduces client bundle size
- Improves initial page load

### Suspense Boundaries

Featured section wrapped in Suspense:

```tsx
<Suspense fallback={null}>
  <FooterFeaturedSection />
</Suspense>
```

This prevents blocking footer render while fetching featured collections.

### Code Splitting

Client components are automatically code-split:
- Newsletter form only loads when needed
- Social links component separate chunk
- Navigation components isolated

## File Structure

```
src/components/layout/app-footer/
├── app-footer.tsx                 # Main orchestrator (Server Component)
├── FOOTER.md                      # This documentation
└── components/
    ├── footer-container.tsx       # Grid layout wrapper
    ├── footer-featured-section.tsx # Featured collections (Server)
    ├── footer-legal.tsx           # Copyright and legal links
    ├── footer-nav-link.tsx        # Individual nav link
    ├── footer-nav-section.tsx     # Nav section wrapper
    ├── footer-newsletter.tsx      # Newsletter form (Client)
    └── footer-social-links.tsx    # Social media links
```

## Dependencies

- **next-typesafe-url**: Type-safe routing with `$path`
- **Lucide React**: Icons (social media, mail)
- **TanStack Form**: Form state management
- **Zod**: Email validation
- **Radix UI**: Accessible UI primitives
- **Tailwind CSS**: Styling utilities

## Maintenance Notes

### Adding New Social Platforms

1. Add platform to `seoConfig.socialProfiles` in `config.ts`
2. Add icon and config to `socialPlatformConfigs` in `footer-social-links.tsx`
3. Platform will auto-render when URL is configured

### Changing Featured Collection Limit

Modify the constant in `src/lib/constants/config.ts`:

```typescript
CONFIG: {
  CONTENT: {
    MAX_FEATURED_FOOTER_ITEMS: 4, // Change to adjust footer limit
  }
}
```

### Updating Newsletter Action

Newsletter functionality is in:
- Action: `src/lib/actions/newsletter/newsletter.actions.ts`
- Validation: `src/lib/validations/newsletter.validation.ts`

## Common Issues

### Social Links Not Showing

- Verify URLs are set in `seoConfig.socialProfiles`
- Check for empty strings (platforms with empty strings are hidden)
- Ensure config.ts is importing correctly

### Newsletter Not Submitting

- Check server action is implemented
- Verify validation schema is correct
- Review toast notification configuration
- Check network tab for API errors

### Featured Collections Not Appearing

- Verify featured content exists in database
- Check content type is 'collection'
- Ensure content is marked as active
- Review FeaturedContentFacade query

### Layout Issues on Mobile

- Check responsive Tailwind classes
- Verify grid breakpoints (md:, lg:)
- Test on actual devices, not just browser resize
- Review footer-container.tsx grid configuration

## Future Enhancements

Potential improvements for future iterations:

1. **Dynamic Legal Links**: Move legal links to CMS/config
2. **Newsletter Preferences**: Allow topic selection
3. **Multi-language Support**: i18n integration
4. **Footer Widgets**: Customizable footer sections
5. **Analytics Integration**: Track footer link clicks
6. **A/B Testing**: Test different footer layouts
7. **Footer Sitemap**: Auto-generate from routes
8. **RSS Feeds**: Link to blog/news feeds

## Related Documentation

- [Form System](../../ui/form/README.md) - Form handling patterns
- [Test IDs](../../../lib/test-ids.ts) - Testing conventions
- [Configuration](../../../lib/config/config.ts) - App configuration
- [Server Actions](../../../lib/actions/README.md) - Action patterns
- [Validation Schemas](../../../lib/validations/README.md) - Zod schemas

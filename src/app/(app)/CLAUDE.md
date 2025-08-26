# App Routes (`src/app/(app)/`)

This directory contains the main authenticated application routes using Next.js 15 App Router. All routes in this directory require authentication and use the shared app layout with header and sidebar navigation.

## Route Structure

```
(app)/
├── layout.tsx              # App layout with header & sidebar
├── (home)/                 # Dashboard/home routes
│   └── page.tsx           # Main dashboard
├── browse/                # Content discovery
│   ├── page.tsx           # Browse landing
│   ├── categories/        # Category browsing
│   ├── featured/          # Featured collections
│   ├── search/            # Search results
│   └── trending/          # Trending content
├── collections/           # Collection management
│   ├── [collectionId]/    # Individual collection
│   └── create/            # Create collection
├── dashboard/             # User dashboard sections
│   ├── collection/        # Collection analytics
│   ├── feed/              # Activity feed
│   └── notifications/     # Notification center
├── items/                 # Bobblehead management
│   ├── [itemId]/          # Individual item
│   └── add/               # Add new item
├── settings/              # User settings
│   ├── collections/       # Collection settings
│   ├── data/              # Data import/export
│   ├── notifications/     # Notification preferences
│   ├── privacy/           # Privacy settings
│   └── profile/           # Profile settings
├── users/                 # User profiles
│   └── [userId]/          # Public user profile
└── examples/              # Development examples
    ├── ably/              # Real-time examples
    └── sentry/            # Error monitoring examples
```

## Layout Architecture

### App Layout (`layout.tsx`)
The main application layout provides:
- **Header navigation** with search, notifications, user menu
- **Collapsible sidebar** with main navigation
- **Authentication wrapper** ensuring all routes require login
- **Responsive design** (desktop sidebar → mobile sheet)

```typescript
export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={'[--header-height:calc(--spacing(14))]'}>
      <SidebarProvider className={'flex flex-col'}>
        <AppHeader />
        <div className={'flex flex-1'}>
          <AuthContent>
            <AppSidebar collapsible={'icon'} />
          </AuthContent>
          <SidebarInset>
            <main className={'min-h-screen flex-1 bg-background'}>
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
```

## Route Categories

### Home & Dashboard Routes

#### Dashboard (`(home)/page.tsx`)
Main landing page for authenticated users featuring:
- **Collection overview** with quick stats
- **Recent activity** feed
- **Featured items** from user's collections
- **Quick actions** for adding items or creating collections

### Browse & Discovery Routes

#### Browse System (`browse/`)
Content discovery and exploration features:

**Browse Landing (`page.tsx`):**
- Category navigation grid
- Featured collections showcase
- Trending items and collections
- Search interface

**Categories (`categories/`):**
- **Category listing** (`page.tsx`) - All available categories
- **Category detail** (`[category]/page.tsx`) - Items in specific category
- **Type-safe routing** with `route-type.ts` for category params

**Search (`search/page.tsx`):**
- Advanced search interface
- Filter and sort options
- Real-time search results
- Search history and saved searches

**Featured & Trending:**
- Curated collections and items
- Algorithmic trending content
- Community highlights

### Collection Management Routes

#### Collection System (`collections/`)
Core collection management functionality:

**Collection Detail (`[collectionId]/`):**
- **Collection overview** (`page.tsx`) - Items, stats, description  
- **Edit mode** (`edit/page.tsx`) - Collection metadata editing
- **Settings** (`settings/page.tsx`) - Privacy, organization
- **Sharing** (`share/page.tsx`) - Public links, embed codes
- **Type-safe params** via `route-type.ts`

**Collection Creation (`create/page.tsx`):**
- Collection setup wizard
- Template selection
- Initial configuration

### Item Management Routes

#### Item System (`items/`)
Individual bobblehead management:

**Item Detail (`[itemId]/`):**
- **Item overview** - Photos, details, metadata
- **Edit mode** (`edit/page.tsx`) - Update item information
- **Share interface** (`share/page.tsx`) - Social sharing options

**Add Item (`add/page.tsx`):**
- Item creation wizard
- Photo upload interface
- Metadata collection
- Collection assignment

### User Dashboard Routes

#### Dashboard Sections (`dashboard/`)
Advanced user management features:

**Collection Dashboard (`collection/`):**
- **Analytics** (`analytics/page.tsx`) - Collection insights
- **Organization** (`organize/page.tsx`) - Batch operations
- **Overview** (`page.tsx`) - Collection management

**Activity Feed (`feed/page.tsx`):**
- Personal activity timeline
- Following updates
- Community interactions

**Notifications (`notifications/page.tsx`):**
- Notification center
- Activity alerts
- System notifications

### Settings Routes

#### Settings System (`settings/`)
Comprehensive user preferences with nested layout:

**Settings Layout (`layout.tsx`):**
- Navigation sidebar for settings sections
- Shared styling and structure

**Core Settings:**
- **Profile** (`profile/page.tsx`) - User information, avatar
- **Privacy** (`privacy/page.tsx`) - Visibility settings
- **Notifications** (`notifications/page.tsx`) - Alert preferences
- **Collections** (`collections/page.tsx`) - Default settings

**Data Management (`data/`):**
- **Import** (`import/page.tsx`) - Bulk data import
- **Export** (`export/page.tsx`) - Data download options

### Social Features

#### User Profiles (`users/[userId]/`)
Public user profile system:
- **Profile overview** (`page.tsx`) - User info, featured collections
- **Collections** (`collections/page.tsx`) - Public collections
- **Social connections** (`followers/`, `following/`)

## Route-Specific Patterns

### Dynamic Routes
Using Next.js 15 dynamic routing with type safety:

```typescript
// Route type definition (route-type.ts)
export interface RouteType {
  collectionId: string;
}

// Page component
export default function CollectionPage({
  params
}: {
  params: Promise<RouteType>
}) {
  // Type-safe parameter access
}
```

### Data Fetching
Routes use server components and server actions:
- **Server components** for initial data loading
- **Server actions** for mutations
- **Streaming** for progressive loading
- **Suspense boundaries** for loading states

### Authentication Integration
All routes require authentication via Clerk:
- **Automatic redirects** for unauthenticated users
- **User context** available in all components
- **Permission checks** for sensitive operations

### Real-time Features
Integration with Ably for live updates:
- **Collection changes** broadcast to viewers
- **Activity feed** real-time updates
- **Notification** real-time delivery

## Development Examples

### Example Routes (`examples/`)
Development and testing routes:

**Ably Integration (`ably/page.tsx`):**
- Real-time messaging examples
- Channel subscription patterns
- Event broadcasting demos

**Sentry Integration (`sentry/page.tsx`):**
- Error reporting examples
- Performance monitoring
- Debug information display

## Route Organization Principles

### Grouping Strategy
- **Feature-based** grouping (collections, items, settings)
- **Auth requirements** via route groups
- **Shared layouts** for related routes
- **Logical hierarchy** matching user mental models

### Navigation Architecture
- **Sidebar navigation** for main application sections
- **Breadcrumb navigation** for deep hierarchies  
- **Tab navigation** within feature areas
- **Context menus** for item-specific actions

### URL Structure
Clean, predictable URLs that match the file structure:
- `/dashboard` - Main dashboard
- `/collections/[id]` - Specific collection
- `/items/add` - Add new item
- `/settings/profile` - Profile settings
- `/browse/categories/sports` - Browse sports category

## Performance Considerations

### Loading Strategies
- **Server components** for SEO and initial load
- **Streaming** for progressive enhancement
- **Suspense** boundaries for loading states
- **Prefetching** for likely next routes

### Optimization Techniques
- **Route-based code splitting** automatically
- **Image optimization** via Next.js Image
- **Font optimization** with next/font
- **Bundle analysis** for size monitoring

This route structure provides a comprehensive, user-friendly interface for the bobblehead collection platform with clear navigation and feature organization.
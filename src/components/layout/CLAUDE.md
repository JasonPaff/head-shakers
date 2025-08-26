# Layout System (`src/components/layout/`)

The layout system provides the core structural components for the Head Shakers application, implementing a consistent navigation and layout pattern across all authenticated pages.

## Layout Architecture

### Structure Overview
```
layout/
├── app-header/         # Application header system
│   ├── app-header.tsx  # Main header component
│   └── components/     # Header sub-components
└── app-sidebar/        # Application sidebar system
    ├── app-sidebar.tsx # Main sidebar component
    └── components/     # Sidebar sub-components
```

### Layout Hierarchy
The layout system follows a nested structure:
1. **Root Layout** (`src/app/layout.tsx`) - Global providers and styling
2. **App Layout** (`src/app/(app)/layout.tsx`) - Authenticated app structure
3. **Header + Sidebar** - Main navigation and layout components

## App Header System

### Main Header Component (`app-header/app-header.tsx`)

The header provides persistent navigation and user controls:

```typescript
export const AppHeader = () => {
  return (
    <header className={'sticky top-0 z-50 flex w-full items-center border-b bg-background'}>
      <AppHeaderContainer>
        {/* Sidebar trigger for mobile */}
        <AuthContent>
          <SidebarTrigger />
        </AuthContent>

        {/* Logo and branding */}
        <Link href={'/'}>
          <div className="flex items-center gap-2">
            <div className="HS-logo">HS</div>
            Head Shakers
          </div>
        </Link>

        {/* Search functionality */}
        <div className={'mx-4 max-w-md flex-1'}>
          <AppHeaderSearch />
        </div>

        {/* Navigation and user controls */}
        <div className={'flex items-center space-x-4'}>
          <AppHeaderNavMenu />
          <AppHeaderNotifications />
          <AppHeaderUser />
          <AppHeaderColorMode />
        </div>
      </AppHeaderContainer>
    </header>
  );
};
```

### Header Components (`app-header/components/`)

#### Container (`app-header-container.tsx`)
- **Responsive layout** with proper spacing and alignment
- **Max-width constraints** for content organization
- **Flexbox layout** for component arrangement

#### Navigation Menu (`app-header-nav-menu.tsx`) 
Discovery and main navigation system:
- **Multi-section menu** with categories
- **Keyboard navigation** support
- **Responsive behavior** (desktop dropdown → mobile sheet)

**Key Features:**
- Browse section (Categories, Featured, Trending)
- Collections section (Your Collections, Create New)
- Community section (Discover Users, Popular Items)
- Dashboard section (Analytics, Activity)

#### Search (`app-header-search.tsx`)
Global search functionality:
- **Real-time search** with debounced input
- **Search suggestions** and autocomplete
- **Category filtering** within search
- **Keyboard shortcuts** (Cmd/Ctrl + K)

#### User Menu (`app-header-user.tsx`)
User account dropdown menu:
- **Profile access** and settings
- **Quick actions** (Add Item, Create Collection)
- **Account management** links
- **Sign out** functionality

#### Notifications (`app-header-notifications.tsx`)
Notification system:
- **Notification bell** with unread count
- **Dropdown panel** with recent notifications
- **Mark as read** functionality
- **Real-time updates** via Ably

#### Color Mode Toggle (`app-header-color-mode.tsx`)
Theme switching:
- **Light/dark/system** theme options
- **Persistent preferences** via localStorage
- **Smooth transitions** between themes
- **System theme detection**

## App Sidebar System

### Main Sidebar Component (`app-sidebar/app-sidebar.tsx`)

The sidebar provides primary navigation with responsive behavior:

```typescript
export const AppSidebar = ({ collapsible = 'icon' }) => {
  return (
    <Sidebar collapsible={collapsible}>
      <SidebarHeader>
        {/* User profile summary */}
      </SidebarHeader>

      <SidebarContent>
        {/* Main navigation */}
        <AppSidebarNavMain />
        
        {/* Secondary navigation */}  
        <AppSidebarNavSecondary />
      </SidebarContent>

      <SidebarFooter>
        {/* Settings and help */}
      </SidebarFooter>
    </Sidebar>
  )
}
```

### Sidebar Components (`app-sidebar/components/`)

#### Main Navigation (`app-sidebar-nav-main.tsx`)
Primary application navigation:

**Navigation Structure:**
- **Dashboard** - Main overview and stats
- **Collections** - Manage collections and items
- **Browse** - Discover content (Categories, Featured, Search)
- **Activity** - Social feed and interactions
- **Analytics** - Collection insights and metrics

**Features:**
- **Active state** highlighting current page
- **Icon + text** layout with collapsible icon-only mode
- **Nested navigation** for complex sections
- **Keyboard accessibility** support

#### Secondary Navigation (`app-sidebar-nav-secondary.tsx`)
Secondary features and account management:

**Navigation Items:**
- **Settings** - Account and app preferences  
- **Help & Support** - Documentation and support
- **Feedback** - User feedback and suggestions
- **What's New** - Feature updates and announcements

### Responsive Behavior

#### Desktop Experience
- **Fixed sidebar** with collapsible states:
  - **Expanded** - Full navigation with icons and labels
  - **Icon-only** - Compact mode with tooltips
  - **Hidden** - Full content width (via offcanvas)

#### Mobile Experience  
- **Sheet overlay** replacing fixed sidebar
- **Touch-friendly** navigation with larger touch targets
- **Swipe gestures** for opening/closing sidebar
- **Full-screen navigation** when open

## Layout Integration Patterns

### Authentication Integration
Layout components integrate with Clerk authentication:

```typescript
// Conditional rendering based on auth state
<AuthContent>
  <SidebarTrigger />
</AuthContent>

// User context in components
const { user, isSignedIn } = useUser()
```

### Theme Integration
Theme switching affects all layout components:
- **CSS custom properties** for consistent theming
- **Dark mode** support throughout
- **Theme persistence** across sessions
- **System theme** detection and following

### Real-time Integration
Layout components connect to real-time services:
- **Notification updates** via Ably channels
- **Activity feed** real-time updates
- **Online status** indicators
- **Live collaboration** features

## Styling Architecture

### CSS Structure
Layout components use consistent styling patterns:
- **TailwindCSS utilities** for responsive design
- **CSS custom properties** for themable values
- **Component variants** for different states
- **Mobile-first** responsive approach

### Design Tokens
Key layout measurements:
```css
:root {
  --header-height: 3.5rem;
  --sidebar-width: 16rem;
  --sidebar-width-icon: 3rem;
  --content-max-width: 1200px;
}
```

### Responsive Breakpoints
- **Mobile** (< 768px) - Sheet-based navigation
- **Tablet** (768px - 1024px) - Collapsible sidebar
- **Desktop** (> 1024px) - Full sidebar with all features

## Accessibility Features

### Keyboard Navigation
- **Tab order** follows logical navigation flow  
- **Skip links** for main content access
- **Keyboard shortcuts** for common actions
- **Focus indicators** on all interactive elements

### Screen Reader Support
- **ARIA labels** on navigation elements
- **Landmark regions** for page structure
- **Live regions** for dynamic content updates
- **Semantic HTML** structure throughout

### High Contrast Support
- **Focus indicators** with sufficient contrast
- **Theme variants** for accessibility needs
- **Color-blind friendly** design choices
- **Text alternatives** for icon-only elements

## Performance Considerations

### Loading Strategy
- **Critical CSS** inlined for layout components
- **Progressive enhancement** for advanced features
- **Lazy loading** for non-critical sidebar content
- **Prefetching** for likely navigation targets

### Optimization Techniques
- **Component memoization** to prevent unnecessary re-renders
- **Event delegation** for efficiency
- **Virtual scrolling** for large navigation lists
- **Image optimization** for user avatars and logos

## State Management

### Sidebar State
Sidebar state managed via React Context:
```typescript
const { isOpen, setOpen, state, toggleSidebar } = useSidebar()
```

### Navigation State
- **Active page** tracking and highlighting
- **Breadcrumb** generation from route structure
- **Navigation history** for back/forward functionality

### User Preferences
- **Layout preferences** persisted to localStorage
- **Theme selection** maintained across sessions
- **Sidebar collapse** state remembered
- **Navigation customization** options

## Development Guidelines

### Adding New Navigation Items
1. Update navigation data structure
2. Add appropriate icons from Lucide
3. Implement proper active state detection
4. Test keyboard navigation flow
5. Ensure mobile responsiveness

### Styling Guidelines
- Follow existing design token system
- Maintain responsive behavior patterns
- Test in both light and dark themes
- Ensure accessibility standards compliance

### Performance Guidelines
- Minimize layout shifts during loading
- Use appropriate loading states
- Optimize for Core Web Vitals
- Test on slower devices and connections

This layout system provides a cohesive, accessible, and performant foundation for the Head Shakers application navigation and structure.
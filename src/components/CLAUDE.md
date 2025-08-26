# Component System (`src/components/`)

The Head Shakers component system is built on modern React patterns with a focus on accessibility, reusability, and type safety. 
The architecture combines Radix UI primitives with a custom design system.

## Directory Structure

```
components/
├── layout/           # Layout-specific components
│   ├── app-header/   # Application header system
│   └── app-sidebar/  # Application sidebar system
└── ui/               # Base UI component library
    ├── sidebar/      # Sidebar primitive components
    └── [various].tsx # Individual UI components
```

## Architecture Principles

### 1. **Radix UI Foundation**
All interactive components are built on Radix UI primitives for:
- **Accessibility** - ARIA compliance and keyboard navigation
- **Unstyled base** - Complete control over styling
- **Composable APIs** - Flexible component composition

### 2. **Design System Patterns**
- **Consistent styling** with TailwindCSS utilities
- **Component variants** using class-variance-authority
- **Design tokens** via CSS custom properties
- **Responsive design** with mobile-first approach

### 3. **TypeScript Integration**
- **Full type safety** for props and variants
- **Generic components** for flexible data types
- **Ref forwarding** for proper DOM access
- **ComponentProps** extensions for native element props

## Component Categories

### Layout Components (`layout/`)

#### App Header System (`app-header/`)
Modular header architecture with composable sections:

```typescript
// Main header container with responsive layout
export const AppHeader = () => (
  <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
    <AppHeaderContainer>
      {/* Logo, Search, Navigation, User actions */}
    </AppHeaderContainer>
  </header>
)
```

**Sub-components:**
- `AppHeaderContainer` - Responsive container with proper spacing
- `AppHeaderNavMenu` - Discovery and navigation menu
- `AppHeaderSearch` - Search input with autocomplete
- `AppHeaderUser` - User profile dropdown
- `AppHeaderNotifications` - Notification bell and panel
- `AppHeaderColorMode` - Theme toggle

**Key Features:**
- **Sticky positioning** for persistent access
- **Authentication-aware** rendering
- **Responsive navigation** (desktop menu → mobile sheet)
- **Search integration** with real-time results

#### App Sidebar System (`app-sidebar/`)
Collapsible sidebar with navigation structure:

- **Responsive behavior** (desktop sidebar → mobile sheet)
- **Collapsible states** (expanded, icon-only, hidden)
- **Navigation hierarchy** with main and secondary sections
- **User context** integration

### UI Component Library (`ui/`)

#### Core Components

**Form Elements:**
- `Button` - Multiple variants (default, destructive, outline, ghost, link)
- `Input` - Text input with validation states
- `Label` - Accessible form labels with Radix integration
- `Switch` - Toggle switches for settings

**Layout & Structure:**
- `Card` - Content containers with header, content, footer
- `Separator` - Visual dividers with proper spacing
- `Sheet` - Slide-out panels for mobile navigation
- `Collapsible` - Expandable content areas

**Navigation:**
- `NavigationMenu` - Dropdown navigation with keyboard support
- `DropdownMenu` - Context menus and action lists
- `Tooltip` - Hover/focus information overlays

**Display:**
- `Badge` - Status indicators and labels
- `Skeleton` - Loading state placeholders
- `Icons` - Lucide React icon collection

**Utility:**
- `Conditional` - Conditional rendering helper
- `AuthContent` - Authentication-gated content wrapper

#### Sidebar System (`ui/sidebar/`)
Comprehensive sidebar implementation with multiple components:

**Core Components:**
- `Sidebar` - Main container with responsive behavior
- `SidebarProvider` - Context provider for sidebar state
- `SidebarContent`, `SidebarHeader`, `SidebarFooter` - Layout sections

**Menu System:**
- `SidebarMenu` - Navigation menu container
- `SidebarMenuButton` - Interactive menu items
- `SidebarMenuSub` - Nested menu structures
- `SidebarMenuSkeleton` - Loading states

**Features:**
- **Responsive design** (desktop fixed → mobile sheet)
- **Collapsible variants** (offcanvas, icon, none)
- **Keyboard navigation** support
- **Custom hook integration** for state management

## Key Patterns

### 1. **Component Composition**
Components use compound component patterns for flexibility:

```typescript
<Card>
  <CardHeader>
    <CardTitle>Collection Stats</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### 2. **Variant-Based Styling**
Using class-variance-authority for consistent variants:

```typescript
const buttonVariants = cva('base-classes', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
      // etc...
    }
  }
})
```

### 3. **Authentication Integration**
Components integrate with Clerk authentication:

```typescript
export const AuthContent = ({ children }: AuthContentProps) => {
  const { isSignedIn } = useAuth();
  return <Conditional isCondition={isSignedIn}>{children}</Conditional>;
};
```

### 4. **Responsive Behavior**
Mobile-first responsive design with breakpoint hooks:

```typescript
const { isMobile } = useBreakpoint();

if (isMobile) {
  return <Sheet>{/* Mobile version */}</Sheet>;
}
return <div>{/* Desktop version */}</div>;
```

## Styling Architecture

### Design Tokens
Using CSS custom properties for consistent theming:
```css
:root {
  --sidebar-width: 16rem;
  --sidebar-width-icon: 3rem;
  --header-height: 3.5rem;
}
```

### Component Classes
- **Base classes** for fundamental styling
- **Modifier classes** for variants and states
- **Responsive classes** for breakpoint-specific styling
- **Dark mode** support with class-based theme switching

## Authentication Patterns

### Clerk Integration
- `useAuth()` hook for authentication state
- `AuthContent` wrapper for protected components
- Theme integration with Clerk's theming system
- Automatic redirects for unauthenticated users

### Permission-Based Rendering
Components conditionally render based on:
- Authentication status
- User roles and permissions
- Feature flags and settings

## Performance Considerations

### Optimization Strategies
- **Client-side routing** with Next.js App Router
- **Lazy loading** for heavy components
- **Memoization** for expensive computations
- **Virtual scrolling** for large lists

## Development Guidelines

### Adding New Components
1. **Start with Radix primitives** when available
2. **Follow existing patterns** for variants and props
3. **Include TypeScript types** for all props
4. **Add responsive behavior** for mobile compatibility
5. **Test accessibility** with keyboard navigation

### Styling Guidelines
- Use **TailwindCSS utilities** for styling
- Follow **design token** system for spacing/colors
- Implement **dark mode** support
- Ensure **responsive design** across breakpoints

## Common Component Patterns

### Loading States
```typescript
{isLoading ? <ComponentSkeleton /> : <Component data={data} />}
```

### Error Boundaries
```typescript
<ErrorBoundary fallback={<ErrorComponent />}>
  <FeatureComponent />
</ErrorBoundary>
```

### Conditional Rendering
```typescript
<Conditional isCondition={hasPermission}>
  <ProtectedComponent />
</Conditional>
```

This component system provides a solid foundation for building the bobblehead collection platform with consistent UX, accessibility, and maintainability.
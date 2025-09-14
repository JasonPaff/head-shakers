# Hooks - CLAUDE.md

## Purpose

Custom React hooks for client-side functionality including authentication role checking, responsive breakpoint detection, cookie management, and boolean state toggling.

## Key Patterns

- **Client-side only**: All hooks use `'use client'` directive for Next.js App Router
- **TypeScript interfaces**: Well-typed return values and parameters for better DX
- **Effect cleanup**: Proper event listener cleanup in `useBreakpoint`
- **Ref stability**: `useToggle` uses refs to prevent unnecessary re-renders from callback changes
- **SSR hydration**: `useCookie` handles server/client value synchronization

## Hook Categories

### Authentication & Authorization

- `useAdminRole`: Clerk-based role checking with admin/moderator detection
  - Returns loading states and role hierarchy (`admin` > `moderator` > `user`)
  - Reads from `user.publicMetadata.role`

### Responsive Design

- `useBreakpoint`: Media query-based breakpoint detection
  - Breakpoints: mobile (0-1023px), tablet (768-1439px), laptop (1024-1439px), desktop (1440px+)
  - Returns current breakpoint and boolean helpers (`isMobile`, `isDesktop`, etc.)

### State Management

- `useCookie`: Type-safe cookie management with `CookieService` integration
  - Generic hook typed by `CookieKey` from `@/constants/cookies`
  - Handles SSR hydration mismatches
- `useToggle`: Enhanced boolean state with multiple update methods
  - Methods: `on()`, `off()`, `toggle()`, `update(value | fn)`
  - Optional onChange callback support

## Dependencies

- `@clerk/nextjs`: Authentication provider for role management
- `@/constants/cookies`: Type definitions for cookie keys/values
- `@/services/cookie-service`: Cookie CRUD operations service

## Important Notes

- `useBreakpoint` defaults to mobile if no match (SSR safety)
- `useAdminRole` treats admins as moderators (role hierarchy)
- `useCookie` performs client-side value sync to handle SSR/hydration
- All hooks follow React best practices with proper cleanup and memoization

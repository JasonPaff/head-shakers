# UI Components - CLAUDE.md

## Purpose

Reusable UI component library built on Radix UI primitives with custom styling using Tailwind CSS and class-variance-authority (cva) for variants. Provides form handling via TanStack Form and authentication via Clerk.

## Key Patterns

- **Component Variants**: Uses `cva` for type-safe variant styling with `VariantProps` types
- **Radix Primitives**: Built on `@radix-ui` components for accessibility and behavior
- **Slot Pattern**: Uses `@radix-ui/react-slot` with `asChild` prop for composition
- **Form Integration**: TanStack Form with custom field components and context hooks
- **Data Attributes**: Uses `data-slot`, `data-state`, `data-variant` for CSS targeting
- **Tailwind Utilities**: Custom `cn()` utility for class merging from `@/utils/tailwind-utils`

## Component Hierarchy

- **Base Components**: button, input, label, card, badge, etc.
- **Form System**: Complete form handling with field components and validation
- **Sidebar System**: Complex collapsible sidebar with responsive behavior
- **Auth Components**: Clerk-based authentication wrappers
- **Utility Components**: conditional, icons, photo uploads

## Props Patterns

- **Standard Props**: Extends `ComponentProps<'element'>` for native HTML props
- **Variant Props**: Uses `VariantProps<typeof variants>` for typed styling options
- **Children Props**: Many components use `Children<T>` and `RequiredChildren<T>` types
- **Field Props**: Form fields require `label` prop, optional `description` and `isRequired`

## Form System Architecture

- **Context-Based**: Uses `useFieldContext()` and `useFormContext()` from TanStack Form
- **Field Components**: TextField, SelectField, CheckboxField, etc. with consistent API
- **Validation**: Built-in error display with `FieldError` component
- **Accessibility**: Automatic ARIA attributes via `FieldAria` wrapper

## Styling Approach

- **CVA Variants**: Consistent variant system with `defaultVariants` and typed options
- **Tailwind Classes**: Extensive use of Tailwind with custom spacing and color tokens
- **Dark Mode**: Built-in dark mode support with `dark:` prefixes
- **Focus States**: Comprehensive focus-visible styles with ring utilities
- **Responsive Design**: Uses breakpoints (`md:`, `lg:`) and responsive utilities

## State Management

- **Sidebar State**: Custom `useSidebar()` hook with provider pattern
- **Form State**: TanStack Form contexts for field and form state
- **Auth State**: Clerk's `useAuth()` hook integration
- **Responsive State**: `useBreakpoint()` hook for responsive behavior

## Important Notes

- All components use `'use client'` when needed for client-side hooks
- Icons are centralized in `icons.tsx` with consistent SVG patterns
- Admin components are separated in `admin/` subdirectory with route guards
- Photo upload components integrate with Cloudinary
- Components follow accessibility best practices with proper ARIA attributes
- The `Conditional` component provides clean conditional rendering with function support

# Additional Themes Implementation Plan (Royal Purple & Crimson Red)

**Generated**: 2026-02-10
**Original Request**: "The app should support 2 more themes in addition to the basic light mode and dark mode themes the app currently supports. 2 more themes with matching dark modes is what I want."
**Refined Request**: Expand the theming system to include Royal Purple (violet primary, cool gray neutrals) and Crimson Red (crimson primary, slate neutrals) alongside the existing orange/amber theme. Each theme supports light, dark, and system color modes. Two-step UI selection with cookie-based persistence.

## Analysis Summary

- Feature request refined with project context and user clarification
- Discovered 40 files across 4 priority levels (8 critical, 12 high, 13 medium, 7 low)
- Generated 10-step implementation plan
- Key finding: 22+ components use hardcoded `orange-*`/`amber-*` Tailwind classes that require refactoring

## File Discovery Results

### Critical Priority (Must Modify)
1. `src/app/globals.css` - CSS custom properties in oklch (add 4 theme selector blocks)
2. `src/app/layout.tsx` - ThemeProvider + SSR theme class application
3. `src/components/layout/app-header/components/app-header-color-mode.tsx` - Keep as-is
4. `src/constants/cookies.ts` - Add colorTheme cookie
5. `src/lib/constants/enums.ts` - Add COLOR_THEME enum
6. `src/lib/constants/defaults.ts` - Add COLOR_THEME default
7. `src/components/layout/app-header/app-header.tsx` - Integrate theme picker
8. `src/lib/db/schema/users.schema.ts` - Review only (no DB changes)

### High Priority (Supporting)
- `src/services/cookie-service.ts`, `src/hooks/use-cookie.ts`, `src/components/layout/public-header/public-header.tsx`, `src/utils/server-cookies.ts`, `src/components/ui/variants/featured-card-variants.ts` + 7 more

### Medium Priority (Hardcoded Colors - 13 files)
- Home sections, footer components, comment-form, display/skeleton components

### Low Priority (7 files)
- Test IDs, mobile menu, middleware, alert, upload components

---

## Implementation Plan

## Overview

- **Estimated Duration**: 3-4 days
- **Complexity**: High
- **Risk Level**: Medium

## Quick Summary

This plan adds two new color themes -- Royal Purple (violet primary, cool gray neutrals) and Crimson Red (crimson primary, slate neutrals) -- each with full light and dark mode support, to the existing orange/amber theme. The implementation introduces CSS custom property blocks per theme, a new `AppHeaderThemePicker` client component, cookie-based persistence via the existing `CookieService`, and a comprehensive refactor of 22+ files that use hardcoded `orange-*`/`amber-*` Tailwind classes to instead use semantic CSS custom property tokens so all three themes render consistently.

## Prerequisites

- [ ] Confirm oklch color values for Royal Purple (violet-based) and Crimson Red (crimson-based) palettes (light and dark variants for all ~50 CSS custom properties each)
- [ ] Confirm the desired visual identity for each theme's gradient, accent, ring, sidebar, and status/badge colors
- [ ] Verify that `next-themes` `attribute="class"` strategy will coexist cleanly with an additional class on the `<html>` element (the theme class is independent of the dark/light class)

## Implementation Steps

### Step 1: Add COLOR_THEME Enum and Default Constants

- **What**: Define the new `COLOR_THEME` enum values and default in the constants layer, so all downstream code has type-safe references to the available themes.
- **Why**: The enum and default must exist before any cookie, component, or CSS logic can reference theme names.
- **Confidence**: High
- **Files**:
  - `src/lib/constants/enums.ts` - Add `COLOR_THEME` entry with `['orange', 'purple', 'red']` and export `ColorTheme` type
  - `src/lib/constants/defaults.ts` - Add `COLOR_THEME` entry with default `'orange'`
- **Changes**:
  - Add `COLOR_THEME: { THEME: ['orange', 'purple', 'red'] as const }` to `ENUMS`
  - Add `export type ColorTheme = (typeof ENUMS.COLOR_THEME.THEME)[number];`
  - Add `COLOR_THEME: { DEFAULT: 'orange' }` to `DEFAULTS`
- **Validation Commands**: `npm run lint:fix && npm run typecheck`
- **Success Criteria**:
  - [ ] `ColorTheme` type resolves to `'orange' | 'purple' | 'red'`
  - [ ] `DEFAULTS.COLOR_THEME.DEFAULT` equals `'orange'`

---

### Step 2: Add colorTheme Cookie Definition

- **What**: Register a new `colorTheme` cookie in the cookie constants so `CookieService` and `useCookie` hook can manage it.
- **Why**: Theme persistence requires a typed cookie entry. The existing `CookieService` automatically picks up new entries from `cookieConstants`.
- **Confidence**: High
- **Files**:
  - `src/constants/cookies.ts` - Add `colorTheme` key to `cookieConstants`
- **Changes**:
  - Add `colorTheme: { defaultValue: 'orange', maxAge: 60 * 60 * 24 * 365, name: 'head-shakers-color-theme' }`
- **Validation Commands**: `npm run lint:fix && npm run typecheck`
- **Success Criteria**:
  - [ ] `CookieKey` type includes `'colorTheme'`
  - [ ] `CookieService.get('colorTheme')` compiles

---

### Step 3: Add Theme Picker Test ID

- **What**: Register `'theme-picker'` in `ComponentTestId` union type.
- **Why**: The project requires all test IDs to be registered for compile-time safety.
- **Confidence**: High
- **Files**:
  - `src/lib/test-ids/types.ts` - Add `'theme-picker'` to `ComponentTestId` union
- **Changes**:
  - Add `| 'theme-picker'` alphabetically near `'theme-toggle'`
- **Validation Commands**: `npm run lint:fix && npm run typecheck`
- **Success Criteria**:
  - [ ] `generateTestId('ui', 'theme-picker')` compiles

---

### Step 4: Define Purple and Red Theme CSS Custom Properties

- **What**: Add four new CSS selector blocks in `globals.css`: `.theme-purple` (light), `.theme-purple.dark` (dark), `.theme-red` (light), `.theme-red.dark` (dark). Each overrides all ~50 CSS custom properties.
- **Why**: The CSS custom property layer is the foundation -- all Tailwind utilities and semantic tokens flow from these variables.
- **Confidence**: High
- **Files**:
  - `src/app/globals.css` - Add four theme blocks after `.dark` block, before `@theme inline`
- **Changes**:
  - Add `.theme-purple` block with violet primary, cool gray neutrals in oklch
  - Add `.theme-purple.dark` block with dark-mode violet/cool gray values
  - Add `.theme-red` block with crimson primary, slate neutrals in oklch
  - Add `.theme-red.dark` block with dark-mode crimson/slate values
  - Update `pulse-glow` keyframe to use CSS custom property instead of hardcoded orange rgba
- **Validation Commands**: `npm run lint:fix && npm run typecheck`
- **Success Criteria**:
  - [ ] All four theme selectors exist in `globals.css`
  - [ ] Each defines all custom properties matching `:root` and `.dark`
  - [ ] `pulse-glow` uses variable instead of hardcoded orange

---

### Step 5: Add Additional Semantic CSS Custom Properties for Hardcoded Color Replacements

- **What**: Define new CSS custom properties for decorative/accent colors currently hardcoded as `orange-*`/`amber-*` across 22+ files. Add to all six selector blocks and map in `@theme inline`.
- **Why**: Many components use hardcoded Tailwind color classes that can't respond to theme changes without being converted to CSS custom property-based classes.
- **Confidence**: Medium
- **Files**:
  - `src/app/globals.css` - Add new custom properties to all six theme blocks and `@theme inline`
- **Changes**:
  - Analyze hardcoded usages and identify semantic roles: section backgrounds, glow orbs, icon containers, badge borders/backgrounds, accent text, hover gradients, link hover colors, focus rings, grid patterns, skeleton borders
  - Add corresponding custom properties (e.g., `--theme-accent-text`, `--theme-badge-bg`, `--theme-glow-from`, `--theme-icon-bg-from`, etc.) to all six selector blocks
  - Add `--color-*` mappings in `@theme inline`
- **Validation Commands**: `npm run lint:fix && npm run typecheck`
- **Success Criteria**:
  - [ ] All new semantic properties defined in all six theme blocks
  - [ ] Tailwind correctly generates utility classes for the new properties

---

### Step 6: Create AppHeaderThemePicker Client Component

- **What**: Build a new `AppHeaderThemePicker` client component with a dropdown menu for Orange/Purple/Red theme selection.
- **Why**: Users need a UI control to switch themes, separate from the existing light/dark/system toggle.
- **Confidence**: High
- **Files** (create):
  - `src/components/layout/app-header/components/app-header-theme-picker.tsx`
- **Changes**:
  - Create `'use client'` component using `useCookie('colorTheme')` for persistence
  - Use `DropdownMenu` with palette icon trigger and three theme options with colored indicators
  - On selection: update cookie and apply/remove `theme-purple`/`theme-red` class on `document.documentElement`
  - Show `Skeleton` while not mounted (matching existing pattern)
  - Use `generateTestId('ui', 'theme-picker')` for test ID
  - Read initial theme from cookie on mount via `useEffect`
- **Validation Commands**: `npm run lint:fix && npm run typecheck`
- **Success Criteria**:
  - [ ] Dropdown renders three theme options
  - [ ] Selection updates cookie and CSS class
  - [ ] Skeleton shown during SSR hydration

---

### Step 7: Integrate Theme Picker into Headers and Apply Theme Class on SSR

- **What**: Add `AppHeaderThemePicker` to both headers, mobile menu, and ensure SSR applies theme class from cookie.
- **Why**: Theme picker must be accessible everywhere. SSR prevents flash of wrong theme.
- **Confidence**: Medium
- **Files**:
  - `src/components/layout/app-header/app-header.tsx` - Render theme picker next to color mode toggle
  - `src/components/layout/public-header/public-header.tsx` - Render theme picker
  - `src/components/layout/app-header/components/app-header-mobile-menu.tsx` - Add theme section
  - `src/app/layout.tsx` - Read cookie server-side, apply class to `<html>`
  - `src/utils/server-cookies.ts` - Add `getColorTheme()` utility
- **Changes**:
  - Import and render `AppHeaderThemePicker` in both headers
  - Add theme selector section to mobile menu
  - In `layout.tsx`: read `head-shakers-color-theme` cookie via `cookies()`, conditionally add `theme-purple`/`theme-red` to `<html>` className
  - Add `getColorTheme()` server utility
- **Validation Commands**: `npm run lint:fix && npm run typecheck`
- **Success Criteria**:
  - [ ] Theme picker visible in app and public headers
  - [ ] Theme picker in mobile menu
  - [ ] No flash of wrong theme on page load
  - [ ] SSR HTML has correct theme class

---

### Step 8: Refactor Hardcoded orange-*/amber-* Colors to Semantic Tokens

- **What**: Replace all hardcoded `orange-*` and `amber-*` Tailwind classes across 22+ files with semantic CSS custom property-based classes.
- **Why**: Without this, purple and red themes would still show orange decorative elements.
- **Confidence**: Medium
- **Files** (grouped):
  - **Home sections**: `hero-section.tsx`, `join-community-section.tsx`, `trending-bobbleheads-section.tsx`, `featured-collections-section.tsx`
  - **Home display/skeleton**: `platform-stats-display.tsx`, `featured-bobblehead-display.tsx`, `platform-stats-skeleton.tsx`, `featured-bobblehead-skeleton.tsx`
  - **Footer**: `app-footer.tsx`, `footer-social-links.tsx`, `footer-legal.tsx`, `footer-nav-link.tsx`
  - **Feature components**: `comment-form.tsx`, `comment-delete-dialog.tsx`, `username-edit-form.tsx`
  - **UI components**: `featured-card-variants.ts`, `alert.tsx`, `cloudinary-photo-upload.tsx`
  - **Admin**: `reports-table.tsx`, `report-detail-dialog.tsx`, `content-suggestions.tsx`
- **Changes**:
  - Replace decorative/brand orange/amber classes with new semantic token-based classes from Step 5
  - Convert warning/alert amber patterns to use existing `--warning`/`--warning-foreground` tokens (warnings stay amber regardless of theme)
  - Convert grid pattern hex values (`#f97316`) to CSS custom property approach
- **Validation Commands**: `npm run lint:fix && npm run typecheck`
- **Success Criteria**:
  - [ ] Zero remaining hardcoded `orange-*`/`amber-*` in modified files (except test files and semantic warning uses)
  - [ ] Orange theme still looks correct (no regressions)
  - [ ] Purple and red themes show their respective colors everywhere

---

### Step 9: Update Existing Tests

- **What**: Update tests asserting hardcoded orange/amber class names.
- **Why**: Step 8 refactoring may break test assertions checking for specific color classes.
- **Confidence**: Medium
- **Files**:
  - `tests/components/ui/alert.test.tsx` - Update color class assertions if alert was changed
- **Changes**:
  - Review and update assertions referencing hardcoded color class names
- **Validation Commands**: `npm run lint:fix && npm run typecheck && npm run test`
- **Success Criteria**:
  - [ ] All existing tests pass
  - [ ] No test failures related to color class assertions

---

### Step 10: Visual Verification and Cross-Theme Testing

- **What**: Manually verify all 6 theme/mode combinations across key pages.
- **Why**: oklch color values require visual confirmation for contrast, cohesion, and accessibility.
- **Confidence**: High
- **Files**: None (manual verification)
- **Changes**:
  - Run `npm run dev` and test all pages across Orange/Purple/Red x Light/Dark/System
  - Verify theme persistence across page refreshes
  - Verify mobile menu theme picker
- **Validation Commands**: `npm run build`
- **Success Criteria**:
  - [ ] All 6 combinations render cohesively
  - [ ] Theme persists across refreshes
  - [ ] No flash of wrong theme
  - [ ] Production build succeeds

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] `npm run build` completes without errors
- [ ] `npm run test` passes
- [ ] Visual verification of all 6 theme/mode combinations
- [ ] No remaining hardcoded `orange-*`/`amber-*` in component files (except warnings and tests)
- [ ] Cookie persistence works across page refresh and new tab
- [ ] SSR: correct theme class in server-rendered HTML

## Notes

- **Warning/Alert Colors**: Files using `amber-*` for warning states should map to `--warning`/`--warning-foreground` tokens, not theme-specific accents. Warnings remain consistently amber/yellow across all themes.
- **Hex Grid Pattern**: Hero and join-community sections use `#f97316` in arbitrary Tailwind values for grid patterns. Needs CSS custom property approach since arbitrary values can't directly reference CSS vars in background-image shorthand.
- **pulse-glow Animation**: Convert hardcoded `rgba(249, 115, 22, ...)` to use `oklch(from var(--primary) l c h / 0.15)` or a dedicated `--theme-glow-color` variable.
- **next-themes Interaction**: Theme classes (`.theme-purple`, `.theme-red`) are additive and independent of `.dark` class. CSS selectors `.theme-purple.dark` match when both present. No next-themes config changes needed.
- **No Default Theme Class**: Orange uses `:root`/`.dark` as-is. Only purple and red require a class on `<html>`.
- **Cookie Type Safety**: `CookieValue<'colorTheme'>` resolves to literal `'orange'`. The `useCookie` hook's `setValue` type handling should be reviewed during implementation.

# Step 2: File Discovery

## Metadata

- **Status**: Completed
- **Files Discovered**: 40 files across 4 priority levels
- **Directories Explored**: 15+

## Input

Refined feature request for Royal Purple and Crimson Red themes with dark modes, two-step theme selection UI, cookie-based persistence.

## Discovery Results

### Critical Priority (8 files - Must Modify)

1. `src/app/globals.css` - Core CSS custom properties in oklch color space. Add `.theme-purple`, `.theme-purple.dark`, `.theme-red`, `.theme-red.dark` selector blocks.
2. `src/app/layout.tsx` - ThemeProvider and ClerkProvider configuration. May need to apply theme class to `<html>` from cookie.
3. `src/components/layout/app-header/components/app-header-color-mode.tsx` - Existing color mode toggle. Keep as-is for light/dark/system.
4. `src/constants/cookies.ts` - Add `colorTheme` cookie definition.
5. `src/lib/constants/enums.ts` - Add `COLOR_THEME` enum and `UserColorTheme` type.
6. `src/lib/constants/defaults.ts` - Add default for `COLOR_THEME`.
7. `src/components/layout/app-header/app-header.tsx` - Integrate new theme picker component.
8. `src/lib/db/schema/users.schema.ts` - Review only (cookie-only persistence, no DB changes needed).

### High Priority (12 files - Supporting Implementation)

9. `src/services/cookie-service.ts` - Auto-inherits from cookieConstants types.
10. `src/hooks/use-cookie.ts` - Used by theme picker for persistence.
11. `src/components/ui/sonner.tsx` - Uses CSS vars, auto-adapts.
12. `src/components/layout/public-header/public-header.tsx` - May need theme picker.
13. `src/constants/index.ts` - Re-exports.
14. `src/lib/validations/users.validation.ts` - Only if DB schema changes.
15. `src/utils/tailwind-utils.ts` - Infrastructure (cn utility).
16. `src/hooks/use-user-preferences.ts` - Cookie preference pattern reference.
17. `src/utils/server-cookies.ts` - Server-side cookie reading.
18. `src/components/ui/variants/featured-card-variants.ts` - Hardcoded orange/amber colors.
19. `src/components/layout/app-header/components/app-header-container.tsx` - Container component.
20. `package.json` - Confirms next-themes already installed.

### Medium Priority (13 files - Hardcoded Colors)

21. `src/app/(app)/(home)/components/sections/hero-section.tsx` - Heavy orange/amber hardcoding
22. `src/app/(app)/(home)/components/sections/join-community-section.tsx` - Orange/amber gradients
23. `src/app/(app)/(home)/components/sections/trending-bobbleheads-section.tsx` - Orange/red gradients
24. `src/app/(app)/(home)/components/sections/featured-collections-section.tsx` - Orange/amber backgrounds
25. `src/app/(app)/(home)/components/display/featured-bobblehead-display.tsx` - Orange fallback colors
26. `src/app/(app)/(home)/components/display/platform-stats-display.tsx` - Orange hover color
27. `src/app/(app)/(home)/components/skeleton/featured-bobblehead-skeleton.tsx` - Orange borders
28. `src/app/(app)/(home)/components/skeleton/platform-stats-skeleton.tsx` - Orange borders
29. `src/components/layout/app-footer/app-footer.tsx` - Orange/amber gradient
30. `src/components/layout/app-footer/components/footer-legal.tsx` - Orange hover
31. `src/components/layout/app-footer/components/footer-nav-link.tsx` - Orange hover
32. `src/components/layout/app-footer/components/footer-social-links.tsx` - Orange hover/focus
33. `src/components/feature/comments/comment-form.tsx` - Orange warning state

### Low Priority (7 files - Reference/Minimal)

34. `src/components/ui/cloudinary-photo-upload.tsx` - Semantic amber (warning)
35. `src/components/ui/alert.tsx` - Semantic amber (warning)
36. `src/lib/test-ids/types.ts` - Add theme picker test ID
37. `src/lib/test-ids/generator.ts` - Reference
38. `src/lib/constants/schema-limits.ts` - Only if DB changes
39. `src/middleware.ts` - Reference
40. `src/components/layout/app-header/components/app-header-mobile-menu.tsx` - May need theme picker for mobile

## Key Architecture Insights

- **22+ components** use hardcoded `orange-*`/`amber-*` Tailwind classes that bypass CSS variables
- Recommended approach: extend CSS custom properties with additional semantic tokens for decorative/gradient colors
- The `.theme-*` class approach is architecturally sound - CSS specificity handles overrides naturally
- Clerk components auto-adapt via CSS custom properties - no explicit Clerk config changes needed
- Cookie system is well-structured - adding a new key follows the established pattern exactly

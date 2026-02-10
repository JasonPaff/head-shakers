# Step 0a: Clarification

## Metadata

- **Status**: Completed
- **Ambiguity Score**: 2/5 (clarification needed)

## Original Request

"The app should support 2 more themes in addition to the basic light mode and dark mode themes the app currently supports. 2 more themes with matching dark modes is what I want."

## Codebase Exploration Summary

- Project uses `next-themes` ThemeProvider with `attribute="class"`, `defaultTheme="system"`, `enableSystem`
- Theme colors defined as CSS custom properties (oklch) in `globals.css` with `:root` (light) and `.dark` (dark) selectors
- Current palette: orange/amber primary with slate neutral base
- Color mode toggle in `app-header-color-mode.tsx` with Light/Dark/System dropdown
- Clerk configured with `shadcn` theme
- Theme cookie defined in `cookies.ts` with 1-year expiry
- `ENUMS.USER_SETTINGS.THEME` lists `['light', 'dark', 'auto']`
- No database schema for theme preferences; no settings page exists

## Questions Asked

1. **Theme Colors**: What color identities should the 2 new themes have?
   - **Answer**: Royal Purple / Crimson Red
2. **Theme UX**: How should theme selection work in the UI?
   - **Answer**: Two-step selection (theme picker + separate light/dark/system toggle)
3. **Persistence**: Should the selected theme persist across devices?
   - **Answer**: Cookie only (current approach)

## Enhanced Request

The app should support 2 more themes in addition to the basic light mode and dark mode themes the app currently supports. 2 more themes with matching dark modes is what I want.

Additional context from clarification:
- Theme Colors: Royal Purple (violet primary, cool gray neutrals) and Crimson Red (crimson primary, slate neutrals)
- Theme UX: Two-step selection - a theme picker (grid or list) to choose the color theme, plus a separate light/dark/system toggle for the color mode
- Persistence: Cookie only (current approach) - theme preference stays in browser cookie with 1-year expiry

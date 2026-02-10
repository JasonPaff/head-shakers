# Step 3: Implementation Planning

## Metadata

- **Status**: Completed
- **Steps Generated**: 10
- **Estimated Duration**: 3-4 days
- **Complexity**: High
- **Risk Level**: Medium

## Input

- Refined feature request for Royal Purple and Crimson Red themes
- 40 discovered files across 4 priority levels
- Project context from CLAUDE.md

## Plan Summary

10-step implementation plan covering:
1. Add COLOR_THEME enum and defaults
2. Add colorTheme cookie definition
3. Add theme picker test ID
4. Define Purple and Red theme CSS custom properties (4 selector blocks, ~50 vars each)
5. Add additional semantic CSS custom properties for hardcoded color replacements
6. Create AppHeaderThemePicker client component
7. Integrate theme picker into headers and apply theme class on SSR
8. Refactor hardcoded orange/amber colors to semantic tokens (22+ files)
9. Update existing tests
10. Visual verification and cross-theme testing

## Validation

- **Format**: Markdown - PASS
- **Required Sections**: Overview, Quick Summary, Prerequisites, Implementation Steps, Quality Gates, Notes - PASS
- **Validation Commands**: Every step includes `npm run lint:fix && npm run typecheck` - PASS
- **No Code Examples**: Plan contains instructions only - PASS

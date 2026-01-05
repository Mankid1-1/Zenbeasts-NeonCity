## 2024-05-22 - Accessibility for Icon-only Buttons
**Learning:** Icon-only buttons (like close buttons or clear filters) are often overlooked and lack `aria-label`, making them inaccessible to screen readers.
**Action:** Always check `X` or other icon-only buttons for `aria-label`. If missing, add a descriptive label like "Close [context]" or "Clear [context]".

 palette/improve-navigation-accessibility-12893924475371976220
## 2024-05-22 - Visual Indicators for Active Navigation
**Learning:** Visual indicators for active navigation (like color changes) are invisible to screen readers.
**Action:** Use `aria-current='page'` on the active navigation link to programmatically indicate the current page.

## 2024-05-24 - Keyboard Navigation for Custom Maps
**Learning:** Custom interactive maps often use `div` elements with `onClick`, making them completely inaccessible to keyboard users.
**Action:** Use `<button>` or `<a href>` for map nodes, or if using `div`, add `role="button"`, `tabIndex={0}`, and `onKeyDown` handlers. Native `<button>` is preferred for built-in keyboard support.

## 2024-05-25 - Invisible Focus on Overlays
**Learning:** Elements hidden with `opacity-0` (like hover overlays) remain keyboard focusable but invisible, confusing users.
**Action:** Add `focus-within:opacity-100` to the overlay container so it becomes visible when users tab into its interactive children.

## 2025-10-24 - Accessible Toggle Buttons
**Learning:** Custom toggle groups often lack semantic state indicators, leaving screen reader users unaware of the active selection.
**Action:** Use `aria-pressed={isActive}` on the buttons to programmatically communicate their state, mirroring visual styling.
 ZenBeasts

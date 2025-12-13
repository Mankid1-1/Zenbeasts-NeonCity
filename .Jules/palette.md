## 2024-05-22 - Accessibility for Icon-only Buttons
**Learning:** Icon-only buttons (like close buttons or clear filters) are often overlooked and lack `aria-label`, making them inaccessible to screen readers.
**Action:** Always check `X` or other icon-only buttons for `aria-label`. If missing, add a descriptive label like "Close [context]" or "Clear [context]".

## 2024-05-24 - Keyboard Navigation for Custom Maps
**Learning:** Custom interactive maps often use `div` elements with `onClick`, making them completely inaccessible to keyboard users.
**Action:** Use `<button>` or `<a href>` for map nodes, or if using `div`, add `role="button"`, `tabIndex={0}`, and `onKeyDown` handlers. Native `<button>` is preferred for built-in keyboard support.

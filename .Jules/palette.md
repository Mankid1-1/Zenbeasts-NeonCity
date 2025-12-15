## 2024-05-22 - Accessibility for Icon-only Buttons
**Learning:** Icon-only buttons (like close buttons or clear filters) are often overlooked and lack `aria-label`, making them inaccessible to screen readers.
**Action:** Always check `X` or other icon-only buttons for `aria-label`. If missing, add a descriptive label like "Close [context]" or "Clear [context]".

## 2024-05-22 - Visual Indicators for Active Navigation
**Learning:** Visual indicators for active navigation (like color changes) are invisible to screen readers.
**Action:** Use `aria-current='page'` on the active navigation link to programmatically indicate the current page.

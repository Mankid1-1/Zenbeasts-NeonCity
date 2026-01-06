# BOLT'S JOURNAL - CRITICAL LEARNINGS ONLY

 bolt-code-splitting-16208616788671959758
## 2024-05-23 - [Route-Based Code Splitting]
**Learning:** The project was loading all route components eagerly, leading to a large initial bundle size. Implementing `React.lazy` and `Suspense` allows splitting the code into smaller chunks, loading them only when needed.
**Action:** When adding new routes, always use `React.lazy` to maintain the benefits of code splitting.

## 2025-05-18 - Monolithic Initial Bundle
**Learning:** The application was bundling all route components (Dashboard, Inventory, etc.) into a single large chunk (>500kB), causing build warnings and likely slow initial load.
**Action:** Implemented route-based code splitting using `React.lazy` and `Suspense`. This successfully split the code into smaller chunks, removing the build warning and optimizing initial load.
 ZenBeasts

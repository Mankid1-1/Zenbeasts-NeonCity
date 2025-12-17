# BOLT'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2024-05-23 - [Route-Based Code Splitting]
**Learning:** The project was loading all route components eagerly, leading to a large initial bundle size. Implementing `React.lazy` and `Suspense` allows splitting the code into smaller chunks, loading them only when needed.
**Action:** When adding new routes, always use `React.lazy` to maintain the benefits of code splitting.

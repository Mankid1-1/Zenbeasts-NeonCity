# BOLT'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2025-05-18 - Monolithic Initial Bundle
**Learning:** The application was bundling all route components (Dashboard, Inventory, etc.) into a single large chunk (>500kB), causing build warnings and likely slow initial load.
**Action:** Implemented route-based code splitting using `React.lazy` and `Suspense`. This successfully split the code into smaller chunks, removing the build warning and optimizing initial load.

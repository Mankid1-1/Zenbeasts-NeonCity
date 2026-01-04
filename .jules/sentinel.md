# Sentinel's Journal

## 2024-05-21 - Initial Security Assessment
**Vulnerability:** Hardcoded API keys in `services/geminiService.ts` (using `import.meta.env`) and potential exposure in `DebugConsole`.
**Learning:** Client-side only apps often struggle with secret management. `localStorage` is used for user-provided keys, which is a necessary trade-off but risky if XSS exists.
**Prevention:** Ensure strict CSP and input validation to prevent XSS. Avoid storing high-value secrets in localStorage if possible, or assume they are ephemeral.

## 2024-05-21 - Merge Conflict Vulnerability
**Vulnerability:** Merge conflicts in `services/web3.ts` and `utils.ts` broke the build (Availability) and concealed a security regression (Solana address entropy reduced from 40 to 8 chars).
**Learning:** Code corruption is a security issue. Merge conflicts can accidentally revert security fixes if not resolved carefully.
**Prevention:** CI must fail if merge markers (`<<<<<<<`) are present.

## 2024-05-22 - Merge Conflict Concealing Security Regression
**Vulnerability:** `services/web3.ts` contained a merge conflict where one branch reduced entropy (8 chars vs 40 chars) and broke the build.
**Learning:** Codebase integrity (Availability) is a prerequisite for security. Automated checks must ensure no merge markers exist.
**Prevention:** Add a pre-commit hook or CI step to grep for `<<<<<<<`.

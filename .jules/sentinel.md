## 2024-12-12 - [Critical API Key Exposure]
**Vulnerability:** A hardcoded Google Gemini API key was found in `.env.local` and `vite.config.ts` was configured to bake `API_KEY` from the environment into the client bundle via `process.env`.
**Learning:** `vite.config.ts`'s `define` property replaces string literals during build. Mapping `process.env.API_KEY` to an environment variable means that if the build environment has that variable set, it gets embedded into the public JS code.
**Prevention:** Avoid using `define` to map secrets in `vite.config.ts`. Use `import.meta.env` and ensure sensitive keys are not prefixed with `VITE_` unless they are truly public. For client-side only apps requiring keys, rely on user input or a backend proxy.

## 2025-05-18 - [Sensitive Data in Logs]
**Vulnerability:** The `DebugConsole` component was logging full command strings, including API keys provided via the `set gemini <KEY>` command, to the on-screen display.
**Learning:** "Input echoing" is a common source of information leakage. Even in development tools, logs should be treated as potentially visible (e.g., screen sharing, screenshots).
**Prevention:** Implement redaction for known sensitive commands before appending them to UI logs or console output. Use regex to reliably identify and mask sensitive parameters regardless of case or whitespace.

## 2025-05-18 - [Negative Price Economy Exploit]
**Vulnerability:** The marketplace listing logic in `useGameState.ts` did not validate that the listing price was positive. This allowed a user to list an item for a negative price (e.g., -1000). If another user (or the same user) bought it, the transaction logic `buyerBalance - price` would result in `buyerBalance - (-1000) = buyerBalance + 1000`, effectively printing infinite currency.
**Learning:** Always validate numerical inputs, especially those related to financial transactions or game economy. Do not assume UI constraints (if any) prevent malicious API calls or internal logic execution.
**Prevention:** Added explicit `if (price <= 0)` validation in the `handleListForSale` function in the core game state hook.

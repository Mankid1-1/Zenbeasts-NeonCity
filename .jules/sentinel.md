## 2024-12-12 - [Critical API Key Exposure]
**Vulnerability:** A hardcoded Google Gemini API key was found in `.env.local` and `vite.config.ts` was configured to bake `API_KEY` from the environment into the client bundle via `process.env`.
**Learning:** `vite.config.ts`'s `define` property replaces string literals during build. Mapping `process.env.API_KEY` to an environment variable means that if the build environment has that variable set, it gets embedded into the public JS code.
**Prevention:** Avoid using `define` to map secrets in `vite.config.ts`. Use `import.meta.env` and ensure sensitive keys are not prefixed with `VITE_` unless they are truly public. For client-side only apps requiring keys, rely on user input or a backend proxy.

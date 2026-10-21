# PIVYON shared Firecrawl integration — Pivyon-AI

**State: staging only.** This pull request installs a server-side adapter, but does **not** change the live application, start scraping, deploy a Worker, or supply provider credentials.

## Why this project needs it

Repository currently a minimal scaffold; do not assume backend/runtime exists.

## Installation

The backend adapter is `integrations/pivyon-firecrawl/client.mjs`. Import it **only** into server-side JavaScript/TypeScript, Cloudflare Worker runtime code, backend jobs, or protected server functions.

Provide exactly these backend environment variables at deployment time:

```text
PIVYON_FIRECRAWL_GATEWAY_URL=https://<private-gateway-host>
PIVYON_FIRECRAWL_APP_ID=Pivyon-AI
PIVYON_FIRECRAWL_APP_TOKEN=<unique token for Pivyon-AI>
```

Never use `NEXT_PUBLIC_`, `VITE_`, static HTML, or browser code to hold these values.

Example, in a trusted server module:

```js
import { createPivyonResearchClient } from "./integrations/pivyon-firecrawl/client.mjs";
const research = createPivyonResearchClient();
const evidence = await research.search("new public industry research", { limit: 5 });
```

**Static-site limitation:** This repository does not currently present a suitable independent authenticated API route. A serverless function or protected backend must be created before live calls can be made. Do not call the SDK from frontend scripts.

## Required before production

- Central gateway in private `PivyonAI` repository: `infrastructure/firecrawl/worker.mjs`. This is currently **not deployed**.
- Secure Firecrawl API key in Cloudflare Worker secrets, never in a repo or frontend.
- Per-app unique API token and capability allowlist; central throttling, caching and billing limits.
- Verify content source permissions, robots / website terms, provenance, and data privacy.
- Test each specific research workflow against real Firecrawl responses and build/deployment.
- Activate only after explicit integration test and code review.

## Local development tooling

Developers may separately enable Firecrawl for coding agents using the CLI/MCP from Firecrawl's email. That enables agent tools, **not** this application's production integration.

No changes to user-facing UI, app data, existing authentication, or deployed endpoints in this pull request.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# API convention

New API endpoints are built in the sibling `linkaro-backend` Express project (`../linkaro-backend`), not as Next.js routes under `src/pages/api/`. From the dashboard, call the backend directly using `apiFetch` from `src/lib/api.js` (sends cookies via `credentials: "include"`, base URL from `NEXT_PUBLIC_API_URL`). Existing `src/pages/api/*` routes remain as-is unless asked to migrate.

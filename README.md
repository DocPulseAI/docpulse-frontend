# DocPulse Frontend

React + Vite frontend for DocPulse.

## Scripts

```bash
npm run dev
npm run build
npm run test:unit
npm run test:e2e
```

## Environment

Frontend API routing:

- `VITE_API_URL` (highest priority; full backend URL)
- `VITE_API_BASE` + `VITE_API_HOSTPORT` (fallback construction)
- If none are set, frontend uses relative URLs.

EPIC-5 intelligence API:

- `VITE_EPIC5_API` (default: `/api`)

## Observability

The API client (`src/services/api.ts`) now emits structured diagnostic logs for request lifecycle:

- `FRONTEND_API_CLIENT_INIT`
- `FRONTEND_API_REQUEST_START`
- `FRONTEND_API_REQUEST_SUCCESS`
- `FRONTEND_API_REQUEST_FAILED`
- `FRONTEND_API_REQUEST_PREP_FAILED`

Each outbound request includes `X-Request-Id` so frontend/backend logs can be correlated.

### Logging controls

- `VITE_ENABLE_DIAGNOSTICS_LOGS=true|false` (default `false` in production, enabled in dev)
- `VITE_API_LOG_BODY_MAX_CHARS` (default `1200`)

## Troubleshooting

1. If API calls fail, use `requestId` from frontend logs and match against backend `X-Request-Id` traces.
2. For repeated 401s, check token refresh/login flow and backend auth route health.
3. Verify `VITE_API_URL` or host/base envs when requests target the wrong origin.

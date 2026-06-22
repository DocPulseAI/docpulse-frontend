# docpulse-frontend

Production-grade React + Vite frontend for DocPulseAI. This user interface provides interactive dashboards to manage documentation generation pipelines, visualize repository structures, track doc health metrics, compare code vs. doc drift, and edit templates.

## Purpose
- **Business Purpose**: Provide developers and platform administrators with a premium, visually engaging dashboard to control and inspect their codebase documentation lifecycle, view impact reports, verify API structural changes, and resolve doc drift issues.
- **Technical Purpose**: Deliver a single-page application (SPA) optimized for quick render cycles and visual excellence, leveraging TailwindCSS, interactive data visualizations (d3, React Flow, Recharts), and Monaco Editor to present live codebase insights.

## Responsibilities
- **Dashboard & Project Controls**: Provide UI controls to add, update, delete, and manually trigger EPIC documentation runs for code repositories.
- **Interactive Visualizations**: Render 3D call graphs, visual dependency graphs, API schemas, and documentation health charts.
- **Drift Comparison**: Display line-by-line diffs and semantic drift findings, enabling developers to resolve inconsistencies.
- **Diagnostics Tracing**: Automatically assign client-side logs to standard correlation identifiers (`X-Request-Id`) to support end-to-end debugging.

## Architecture Overview
The frontend communicates directly with the Express API server (`docpulse-backend`) using an Axios-based API client.

```mermaid
graph TD
    User([Developer / Maintainer]) -->|Interacts with UI| Frontend[docpulse-frontend]
    subgraph SPA (Vite + React)
        Router[React Router v6] --> Pages[Dashboard / Projects / Admin]
        Pages --> Store[Redux Toolkit State]
        Pages --> Flow[React Flow / D3 Graphs]
        Pages --> Editor[Monaco Editor Templates]
        Store --> APIClient[Axios Client with X-Request-Id]
    end
    APIClient -->|HTTP Requests| Backend[docpulse-backend]
```

Outbound requests are handled via `src/services/api.ts`, which injects authentication tokens and generates unique request correlation headers.

---

## Technology Stack
- **Bundler**: Vite (v5.0.10)
- **Framework**: React (v18.2.0)
- **State Management**: Redux Toolkit (v2.0.1) & React Redux (v9.0.4)
- **Styling**: TailwindCSS (v4.2.1) + Autoprefixer & PostCSS
- **Routing**: React Router DOM (v6.21.1)
- **Interactive Visualizations**:
  - React Flow (v11.11.4) for node/edge architecture diagrams
  - Recharts (v3.7.0) for metrics charts
  - Three.js & React Three Fiber (v8.17.10) for 3D graphic rendering
  - D3.js (v7.9.0) for custom layouts
- **Code Editing**: Monaco Editor (v4.7.0)
- **Testing**:
  - Playwright (v1.58.2) for End-to-End browser testing
  - Vitest (v4.0.18) + Testing Library React (v16.3.0) for unit tests

---

## Directory Structure
```
docpulse-frontend/
├── dist/                   # Production build output files (HTML/JS/CSS assets)
├── public/                 # Static assets (icons, logo)
├── src/                    # Source code
│   ├── assets/             # Static SVGs, images, fonts
│   ├── components/         # Reusable design components (buttons, modals, forms)
│   ├── context/            # React context providers (Auth, theme settings)
│   ├── design-system/      # Token designs, color systems, HSL variables
│   ├── hooks/              # Custom custom hooks (useAuth, useFetch)
│   ├── pages/              # Main view screens (Dashboard, ProjectSettings, APIViewer)
│   ├── services/           # Axios HTTP endpoints clients (`api.ts`, `intelligence.ts`)
│   ├── store/              # Redux slices and state selectors
│   ├── styles/             # Global CSS declarations, tailwind base configs
│   ├── types/              # TypeScript typings and interfaces
│   ├── App.tsx             # Main routing shell
│   ├── main.tsx            # DOM mounting entrypoint
│   └── vite-env.d.ts       # Vite environment types definition
├── tests/                  # Playwright browser automation test scripts
├── nginx.conf              # Nginx server configuration for static runtime
├── playwright.config.ts    # Playwright E2E configuration
├── vite.config.ts          # Vite compilation build configuration
└── vitest.config.ts        # Vitest unit testing configuration
```

---

## Environment Variables

Vite embeds environment variables prefix with `VITE_` during compile-time.

| Variable Name | Purpose | Required? | Default / Example |
|---|---|---|---|
| `VITE_API_URL` | Highest priority; target URL of the main backend | **Yes** | `https://api.docpulse.ai` |
| `VITE_API_BASE` | Path prefix fallback for API endpoint routing | No | `/api` |
| `VITE_API_HOSTPORT` | Hostport configuration for endpoint resolution | No | `localhost:8000` |
| `VITE_EPIC5_API` | Target path prefix for intellectual assistant routes | No | `/api` |
| `VITE_ENABLE_DIAGNOSTICS_LOGS` | Toggles detailed client logging console output | No | `false` in production, `true` in dev |
| `VITE_API_LOG_BODY_MAX_CHARS` | Caps print size of request/response payload in logs | No | `1200` |

---

## Installation

### Prerequisites
- Node.js v20.x
- npm v10.x

### Steps
1. Navigate to the frontend directory:
   ```bash
   cd docpulse-frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```

---

## Local Development

Start Vite local development server:
```bash
npm run dev
```
The application will default to running on [http://localhost:5173](http://localhost:5173).

Compile TypeScript and build the optimized production package:
```bash
npm run build
```

Preview the locally built distribution:
```bash
npm run preview
```

---

## Testing

### Unit Tests
Built with **Vitest** and **Testing Library**.
```bash
npm run test:unit
```

### End-to-End Tests
Built with **Playwright**. E2E tests target real browsers and verify auth states, project creations, and routing.
```bash
# Execute Playwright tests headlessly
npm run test:e2e

# Execute Playwright tests with Interactive UI mode
npm run test:e2e:ui
```

---

## Docker

### Build Image
```bash
docker build --build-arg VITE_API_URL="http://localhost:8000" -t docpulse-frontend .
```

### Run Container
```bash
docker run -p 80:80 docpulse-frontend
```

---

## Deployment

The frontend compiles to static assets (HTML, CSS, JS) and is served inside a lightweight Nginx container.

- **Nginx Configuration** (`nginx.conf`): Optimized to handle Single-Page Application routing by redirecting all sub-paths back to `index.html` (avoiding HTTP `404` errors on refresh).
- **Deployment target**: Deployable to platforms hosting static web files or container runners (Azure Container Apps, Render, AWS ECS, Vercel).

---

## Troubleshooting

### API Requests Returning Incorrect Origin
- **Symptom**: Outbound requests fail or target the wrong domain.
- **Solution**: Check `VITE_API_URL` during the Docker build stage. Since Vite embeds variables *during compile time*, you must supply `--build-arg VITE_API_URL=...` during `docker build`, as runtime `ENV` variables in the container will be ignored.

### Outbound API Traces
- **Symptom**: Backend API errors occur and need frontend context.
- **Solution**: Enable `VITE_ENABLE_DIAGNOSTICS_LOGS=true` to inspect client-side network diagnostics. Locate one of the following lifecycle logs in the browser console:
  - `FRONTEND_API_REQUEST_START`
  - `FRONTEND_API_REQUEST_SUCCESS`
  - `FRONTEND_API_REQUEST_FAILED`
  Match the corresponding `X-Request-Id` header value against the backend database / container logs.

---

## Contributing
1. Branches should branch from `develop`.
2. Format layout using CSS tokens defined in `src/design-system/` to preserve a premium visual style.
3. Ensure unit tests pass before submitting your Pull Request.

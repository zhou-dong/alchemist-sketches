# Alchemist Sketches

A multi-module monorepo for interactive visualizations of probabilistic data structures and algorithms.

## Project Structure

```
alchemist-sketches/
├── apps/
│   └── web/                      # Main Vite React application
│       ├── src/
│       │   ├── App.tsx           # Main app with routes
│       │   ├── pages/            # Page components
│       │   ├── contexts/         # App-specific contexts
│       │   └── data/             # App-specific data
│       ├── package.json
│       └── vite.config.ts
├── packages/
│   ├── shared/                   # Shared UI components and utilities
│   │   └── src/
│   │       ├── components/       # Reusable React components
│   │       ├── theme/            # MUI theme configuration
│   │       ├── hooks/            # Custom React hooks
│   │       └── utils/            # Utility functions
│   └── theta-sketch/             # Theta Sketch visualization module
│       └── src/
│           ├── components/       # Theta Sketch components
│           └── pages/            # Theta Sketch page
├── package.json                  # Workspace root
├── tsconfig.json                 # Base TypeScript config
└── eslint.config.js              # ESLint configuration
```

## Modules

### `@alchemist/shared`
Shared UI components, theme configuration, hooks, and utilities used across all sketch modules.

### `@alchemist/theta-sketch`
Interactive visualization and demo of the Theta Sketch algorithm - a probabilistic data structure for cardinality estimation.

### `@alchemist/web`
The main web application that brings together all sketch modules.

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

### Build

Build all packages and the web app:

```bash
npm run build
```

### Preview

Preview the production build:

```bash
npm run preview
```

## Deploy to Cloudflare Pages

This repo is configured to deploy the web app from `apps/web/dist`.

### Cloudflare Pages build settings

- **Framework preset**: `Vite`
- **Root directory**: repository root
- **Build command**: `npm ci && npm run build`
- **Build output directory**: `apps/web/dist`
- **Environment variable (recommended)**: `NODE_VERSION=22`

### Custom domain

After first deploy:

1. Open your Pages project in Cloudflare.
2. Add custom domains:
   - `alchemist-sketches.com`
   - `www.alchemist-sketches.com` (optional)
3. Choose one canonical domain and redirect the other.
4. Enable HTTPS (Cloudflare handles cert issuance automatically).

### SPA routing fallback

Client-side routes (React Router) are handled via:

- `apps/web/public/_redirects`

with content:

```txt
/* /index.html 200
```

This ensures direct visits/refreshes on nested routes resolve to your app.

## Adding a New Sketch Module

1. Create a new package directory:
   ```bash
   mkdir -p packages/your-sketch/src/{components,pages}
   ```

2. Create a `package.json`:
   ```json
   {
     "name": "@alchemist/your-sketch",
     "version": "0.0.0",
     "private": true,
     "type": "module",
     "main": "./src/index.ts",
     "dependencies": {
       "@alchemist/shared": "*"
     }
   }
   ```

3. Create a `tsconfig.json`:
   ```json
   {
     "extends": "../../tsconfig.json",
     "compilerOptions": {
       "composite": true,
       "outDir": "./dist",
       "rootDir": "./src"
     },
     "include": ["src"],
     "references": [{ "path": "../shared" }]
   }
   ```

4. Export your main components from `src/index.ts`

5. Add the route in `apps/web/src/App.tsx`

6. Update `apps/web/vite.config.ts` with path alias

7. Run `npm install` to link the new package

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **MUI (Material-UI)** - Component library
- **React Router** - Client-side routing
- **Three.js / React Three Fiber** - 3D visualizations
- **npm Workspaces** - Monorepo management

## License

Private

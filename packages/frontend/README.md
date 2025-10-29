# @meshlink/frontend

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)

WebRTC video conferencing frontend for **MeshLink** platform. Built with **React 19 + Vite 7 + TypeScript** following **Feature-Sliced Design** principles for scalable real-time communication.

## Features

- **Multi-peer video calls** with mesh topology
- **Real-time media controls** (camera, microphone, screen sharing)
- **Device selection** for camera and microphone
- **Automatic peer management** with Socket.IO
- **Modern UI** with TailwindCSS 4 + Radix UI
- **Type-safe** with TypeScript strict mode
- **Optimized builds** with Terser minification + Brotli compression

## Project Structure

```
src/
  app/               # Application root and router setup
    app.tsx          # Root component with routing
    index.ts         # App exports

  features/          # Feature-based modules (FSD)
    webrtc/          # WebRTC functionality
      hooks/         # Custom hooks for WebRTC logic
        use-media-devices.ts    # Camera/mic management
        use-mesh-call.ts        # Main call orchestration
        use-peer-connections.ts # RTCPeerConnection management
        use-signaling.ts        # Socket.IO signaling
      model/         # Business logic and schemas
        ice.ts       # ICE server configuration
        schemas.ts   # Zod validation schemas

  pages/             # Route-level pages
    home-page.tsx    # Video call room page
    join-page.tsx    # Room join/create page

  shared/            # Shared resources
    components/      # Reusable UI components
      ui/            # Radix UI components
        button.tsx
        input.tsx
        tooltip.tsx
        ...
      error-boundary.tsx
      loading-fallback.tsx
    constants/       # App-wide constants
      webrtc.ts      # WebRTC configuration
    lib/             # Utility libraries
      env.ts         # Environment helpers
      logger.ts      # Logging utility
      utils.ts       # Common utilities
    types/           # Shared TypeScript types

  main.tsx           # Application entry point
  main.css           # Tailwind CSS entry
  vite-env.d.ts      # Vite type declarations

public/              # Static assets
vite.config.ts       # Vite configuration + plugins
tsconfig.json        # TypeScript base config
tsconfig.app.json    # App-specific TS config
tsconfig.node.json   # Node/Vite config TS config
eslint.config.js     # ESLint configuration
Dockerfile           # Production container
```

## Tech Stack

### Core

- **React 19** with React Compiler for automatic optimization
- **Vite 7** for lightning-fast development and optimized production builds
- **TypeScript 5.8** with strict mode enabled

### Styling & UI

- **TailwindCSS 4** for utility-first styling
- **Radix UI** for accessible component primitives
- **Lucide React** for icons

### WebRTC & Real-time

- **Socket.IO Client** for signaling
- **Native WebRTC APIs** for peer connections

### State & Validation

- **Zod** for runtime schema validation
- **React Router DOM 7** for routing
- **Sonner** for toast notifications

### Build Optimization

- **Terser** for aggressive minification
- **Brotli + Gzip compression** plugins
- **Manual chunking** for optimal code splitting
- **Bundle analyzer** for size visualization

## Installation

### Prerequisites

- Node.js `>=22.17.0`
- pnpm `>=10.17.1`

### Setup

1. **Install dependencies:**

    ```bash
    pnpm install
    ```

2. **Configure environment:**

    ```bash
    cp .env.example .env
    ```

    Edit `.env` with your configuration:

    ```env
    VITE_API_BASE_URL="http://localhost:3000"
    VITE_SIGNALING_URL="ws://localhost:3000"
    ```

3. **Start development server:**
    ```bash
    pnpm dev
    ```
    Open [http://localhost:5173](http://localhost:5173)

## Available Scripts

```bash
pnpm dev            # Start development server with HMR
pnpm build          # Type-check + production build with optimizations
pnpm preview        # Preview production build locally
pnpm lint           # Run ESLint
pnpm lint:fix       # Auto-fix ESLint issues
```

## Production Build

The production build includes:

- **Terser minification** (removes console.log in production)
- **Gzip & Brotli compression** (pre-compressed assets)
- **Code splitting** with vendor chunks:
    - `react-vendor` - React, React DOM, React Router
    - `ui-vendor` - Radix UI, Lucide icons
    - `socket-vendor` - Socket.IO client
- **Bundle stats** generated at `dist/stats.html`

```bash
pnpm build
```

Build output:

```
dist/
  index.html
  assets/
    index-[hash].js      # Main bundle (~246 KB)
    index-[hash].js.br   # Brotli compressed (~64 KB)
    index-[hash].js.gz   # Gzip compressed (~74 KB)
    index-[hash].css
    ...
  stats.html            # Bundle analyzer visualization
```

## Docker

Build and run the production container:

```bash
docker build -t meshlink-frontend .
docker run -p 8080:80 \
  -e VITE_API_BASE_URL=http://your-backend:3000 \
  -e VITE_SIGNALING_URL=ws://your-backend:3000 \
  meshlink-frontend
```

The container uses **nginx** to serve static assets with:

- SPA routing fallback
- Gzip and Brotli compression
- Browser caching headers

## Architecture Patterns

### Feature-Sliced Design

The project follows **FSD** principles:

- **app/** - Application initialization
- **pages/** - Route-level components
- **features/** - Business features (WebRTC)
- **shared/** - Reusable infrastructure

### Custom Hooks Structure

```typescript
// Main orchestrator
useMeshCall()
  ├── useSignaling()        // Socket.IO connection
  ├── usePeerConnections()  // RTCPeerConnection management
  └── useMediaDevices()     // Media stream handling
```

## Configuration

### Environment Variables

| Variable             | Description             | Default                 |
| -------------------- | ----------------------- | ----------------------- |
| `VITE_API_BASE_URL`  | Backend REST API URL    | `http://localhost:3000` |
| `VITE_SIGNALING_URL` | WebSocket signaling URL | `ws://localhost:3000`   |

### Vite Configuration

`vite.config.ts` includes:

- React plugin with Babel React Compiler
- TailwindCSS plugin
- Path aliases (`@/*` → `src/*`)
- Compression plugins (Gzip + Brotli)
- Bundle visualizer
- Terser minification with console removal

## Code Quality

- **ESLint** with TypeScript rules
- **Prettier** for code formatting
- **TypeScript strict mode** enabled
- **Type-safe** environment variables
- **Zod schemas** for runtime validation

## Contributing

Contributions are welcome! Please read the [Contributing Guidelines](../../CONTRIBUTING.md) before submitting PRs.

### Development Workflow

1. Branch from `develop`
2. Make changes
3. Run linting and build:
    ```bash
    pnpm lint
    pnpm build
    ```
4. Commit with [Conventional Commits](https://www.conventionalcommits.org/)
5. Open PR to `develop`

## License

MIT © Aidamir Kambiev / Resolve Studio

See [LICENSE](../../LICENSE) for details.

## Links

- [Monorepo Root](../../README.md)
- [Backend Package](../backend/README.md)
- [Contributing Guide](../../CONTRIBUTING.md)
- [Changelog](../../CHANGELOG.md)

---

**Part of the MeshLink monorepo** - [View all packages](../../README.md#packages)

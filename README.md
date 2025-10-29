# MeshLink

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![pnpm](https://img.shields.io/badge/pnpm-10.17.1-orange.svg)](https://pnpm.io/)
[![Node](https://img.shields.io/badge/node-%3E%3D22.17.0-green.svg)](https://nodejs.org/)

WebRTC video conferencing platform with **mesh topology** for peer-to-peer communication. Built with modern technologies for high-performance real-time video calls.

## Architecture

This is a **pnpm workspace monorepo** containing:

```
meshlink/
├── packages/
│   ├── backend/          # @meshlink/backend - NestJS WebRTC signaling server
│   └── frontend/         # @meshlink/frontend - React + Vite client
├── .github/              # CI workflows, issue templates, release automation
├── .husky/               # Git hooks (commitlint, lint-staged)
├── package.json          # Root workspace with shared scripts
└── pnpm-workspace.yaml   # pnpm workspace configuration
```

### Tech Stack

**Backend:**

- NestJS 11
- Socket.IO for WebRTC signaling
- TypeScript
- Environment validation with class-validator

**Frontend:**

- React 19 with React Compiler
- Vite 7 with Terser minification
- TypeScript with strict mode
- TailwindCSS 4 + Radix UI
- Feature-Sliced Design architecture
- Sonner for notifications
- Zod for schema validation

## Quick Start

### Prerequisites

- **Node.js** `>=22.17.0`
- **pnpm** `>=10.17.1`

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd meshlink

# Install all dependencies
pnpm install
```

### Environment Setup

1. **Backend** (`packages/backend/.env`):

```bash
cp packages/backend/.env.example packages/backend/.env
```

2. **Frontend** (`packages/frontend/.env`):

```bash
cp packages/frontend/.env.example packages/frontend/.env
```

### Development

```bash
# Run both backend and frontend in parallel
pnpm dev

# Or run separately:
pnpm dev:backend   # WebRTC signaling server on http://localhost:3000
pnpm dev:frontend  # React app on http://localhost:5173
```

### Production Build

```bash
# Build all packages
pnpm build

# Start production servers
pnpm start:backend   # Start NestJS server
pnpm start:frontend  # Preview Vite build
```

## Packages

### [@meshlink/backend](./packages/backend)

WebRTC signaling server with room management and peer coordination.

- **Port:** 3000
- **WebSocket:** Socket.IO
- **Features:** Room management, peer signaling, health checks, automatic cleanup

[View Backend README →](./packages/backend/README.md)

### [@meshlink/frontend](./packages/frontend)

Modern video conferencing web client with mesh topology.

- **Port:** 5173 (dev), 8080 (preview)
- **Features:** Multi-peer video calls, device selection, screen sharing, real-time media controls

[View Frontend README →](./packages/frontend/README.md)

## Available Scripts

| Command               | Description                            |
| --------------------- | -------------------------------------- |
| `pnpm dev`            | Run backend + frontend in parallel     |
| `pnpm dev:backend`    | Run only backend dev server            |
| `pnpm dev:frontend`   | Run only frontend dev server           |
| `pnpm build`          | Build both projects                    |
| `pnpm build:backend`  | Build backend only                     |
| `pnpm build:frontend` | Build frontend only                    |
| `pnpm start:backend`  | Start production backend               |
| `pnpm start:frontend` | Preview production frontend            |
| `pnpm lint`           | Lint all projects                      |
| `pnpm lint:fix`       | Fix linting issues across all projects |
| `pnpm format`         | Format code with Prettier              |
| `pnpm clean`          | Clean node_modules and build artifacts |

## Docker

Each package has its own production-ready Dockerfile:

### Backend

```bash
cd packages/backend
docker build -t meshlink-backend .
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e CORS_ORIGIN=http://localhost:5173 \
  meshlink-backend
```

### Frontend

```bash
cd packages/frontend
docker build -t meshlink-frontend .
docker run -p 8080:80 meshlink-frontend
```

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting PRs.

### Workflow

1. Branch from `develop`
2. Make changes with [Conventional Commits](https://www.conventionalcommits.org/)
3. Open PR to `develop`
4. Merge `develop` → `production` for release (automated via Release Please)

### Development Guidelines

- Follow TypeScript strict mode
- Use ESLint and Prettier configurations
- Write meaningful commit messages
- Update documentation for new features

## License

MIT © Aidamir Kambiev / Resolve Studio

See [LICENSE](./LICENSE) for details.

## Links

- [Contributing Guide](./CONTRIBUTING.md)
- [Backend Documentation](./packages/backend/README.md)
- [Frontend Documentation](./packages/frontend/README.md)
- [Changelog](./CHANGELOG.md)

---

**Built with modern web technologies for real-time communication**

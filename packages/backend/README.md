# @meshlink/backend

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E.svg)](https://nestjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-black.svg)](https://socket.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

WebRTC signaling backend for **MeshLink** video conferencing platform. Built with **NestJS 11 + Socket.IO** for real-time peer-to-peer communication, room management, and automatic cleanup.

## Features

- **WebRTC signaling** via Socket.IO for peer coordination
- **Room management** with automatic cleanup
- **Health checks** for monitoring
- **CORS configuration** for multi-origin support
- **Environment validation** with class-validator
- **Graceful shutdown** handling
- **TypeScript strict mode** for type safety

## Project Structure

```
src/
  app.module.ts              # Root module with global configuration
  main.ts                    # Bootstrap with CORS and shutdown hooks

  config/                    # Configuration modules
    env.validation.ts        # Environment variable validation

  dto/                       # Data Transfer Objects
    signaling.dto.ts         # Signaling event DTOs

  health.controller.ts       # Health check endpoint
  room-cleanup.service.ts    # Scheduled room cleanup service
  signaling.gateway.ts       # WebRTC signaling gateway (Socket.IO)

.github/
  workflows/                 # CI automation
  ISSUE_TEMPLATE/            # Issue forms
  PULL_REQUEST_TEMPLATE.md

Dockerfile                   # Production container
tsconfig.json                # TypeScript configuration
nest-cli.json                # NestJS CLI config
```

## Tech Stack

### Core

- **NestJS 11** - Progressive Node.js framework
- **Socket.IO 4.8** - Real-time bidirectional communication
- **TypeScript 5.7** - Type-safe development

### Validation & Configuration

- **class-validator** - Decorator-based validation
- **class-transformer** - Object transformation
- **@nestjs/config** - Configuration management

### Additional Features

- **@nestjs/schedule** - Cron-based cleanup tasks
- **@nestjs/throttler** - Rate limiting
- **RxJS** - Reactive programming

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
    NODE_ENV="development"
    PORT="3000"
    CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
    ```

3. **Start development server:**
    ```bash
    pnpm dev
    ```
    Server will be available at `http://localhost:3000`

## Available Scripts

```bash
pnpm dev            # Start development server with watch mode
pnpm build          # Build for production
pnpm start          # Start production server
pnpm lint           # Run ESLint
pnpm lint:fix       # Auto-fix ESLint issues
pnpm lint:ci        # Lint with --max-warnings=0 for CI
```

## Production Build

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

The production build outputs to the `dist/` directory.

## Docker

Build and run the production container:

```bash
docker build -t meshlink-backend .
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e CORS_ORIGIN=http://your-frontend:5173 \
  meshlink-backend
```

Health check endpoint: `http://localhost:3000/health`

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------||
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `http://localhost:5173` |

Environment variables are validated at startup in `src/config/env.validation.ts`.

## WebRTC Signaling Events

### Client → Server

| Event         | Payload                                                                  | Description                |
| ------------- | ------------------------------------------------------------------------ | -------------------------- |
| `join-room`   | `{ roomId: string }`                                                     | Join a video call room     |
| `signal`      | `{ to: string, data: RTCSessionDescriptionInit \| RTCIceCandidateInit }` | Send WebRTC signaling data |
| `media-state` | `{ camOn: boolean, micOn: boolean }`                                     | Update media state         |
| `disconnect`  | -                                                                        | Leave room                 |

### Server → Client

| Event         | Payload                                              | Description              |
| ------------- | ---------------------------------------------------- | ------------------------ |
| `room-info`   | `{ peers: string[] }`                                | List of peers in room    |
| `peer-joined` | `{ peerId: string }`                                 | New peer joined          |
| `peer-left`   | `{ peerId: string }`                                 | Peer left room           |
| `signal`      | `{ from: string, data: unknown }`                    | WebRTC signaling data    |
| `media-state` | `{ peerId: string, camOn: boolean, micOn: boolean }` | Peer media state updated |
| `error`       | `{ code: string, message: string }`                  | Error occurred           |

## Architecture

### Signaling Gateway

The `SignalingGateway` handles all WebSocket connections:

- Room management (join/leave)
- Peer coordination
- WebRTC signaling relay
- Media state broadcasting

### Room Cleanup Service

Automatic cleanup runs every 5 minutes:

- Removes empty rooms
- Cleans up stale connections
- Logs cleanup statistics

### Health Check

HTTP endpoint at `/health` returns:

```json
{
    "status": "ok",
    "timestamp": "2025-01-30T00:00:00.000Z"
}
```

## Code Quality

- **ESLint** with TypeScript rules
- **Prettier** for code formatting
- **TypeScript strict mode** enabled
- **Class-validator** for DTO validation

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
- [Frontend Package](../frontend/README.md)
- [Contributing Guide](../../CONTRIBUTING.md)
- [Changelog](../../CHANGELOG.md)

---

**Part of the MeshLink monorepo** - [View all packages](../../README.md#packages)

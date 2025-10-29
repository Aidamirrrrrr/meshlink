Thank you for your interest in contributing to MeshLink! This document provides guidelines for contributing to our monorepo.

The repository uses two protected branches:

When a release is ready, create a pull request from `develop` to `production`.

Create topic branches off `develop` using the convention:

RSM-<ISSUE_NUMBER>-<short-description>

Examples:

RSM-12-add-user-authentication
RSM-42-fix-websocket-reconnect
RSM-77-update-eslint-rules
RSM-105-refactor-mesh-topology

`RSM` stands for **MeshLink** and keeps naming consistent across the monorepo.

If working exclusively on one package, you may use:

backend/fix-heartbeat-timeout
frontend/add-video-controls

pnpm --filter @meshlink/backend lint
pnpm --filter @meshlink/backend test
pnpm --filter @meshlink/backend test:e2e

Or from root:
pnpm dev:backend # Development server
pnpm build:backend # Production build

pnpm --filter @meshlink/frontend lint
pnpm --filter @meshlink/frontend build
pnpm --filter @meshlink/frontend preview

Or from root:
pnpm dev:frontend # Development server
pnpm build:frontend # Production build

pnpm lint # Lint all packages
pnpm lint:fix # Auto-fix linting issues
pnpm format # Format all files with Prettier
pnpm build # Build all packages
pnpm test # Run all tests

Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Types should be in English; descriptions may use Russian when helpful.

<type>(<scope>): <description>

[optional body]

[optional footer]

feat(backend): add ping-check heartbeat mechanism
fix(frontend): resolve race condition in socket initialization
refactor(backend): remove unused Prisma dependency
docs(monorepo): update README with new structure
chore(deps): update @nestjs packages to v11
ci: add monorepo CI workflow

1. Branch from `production`
2. Create PR to `production`
3. After merge, back-merge into `develop`

CI will automatically run:

Make sure all checks pass before requesting review.

pnpm --filter @meshlink/backend test

pnpm --filter @meshlink/backend test:e2e

pnpm --filter @meshlink/backend test:cov

Frontend tests are not yet implemented but will be added in the future.

The project uses [Release Please](https://github.com/googleapis/release-please) for automated releases:

Labels are synchronized via `.github/labels.yml`. To add new labels:

1. Edit `.github/labels.yml`
2. The sync workflow will update them automatically on push to `production`/`develop`

`.github/CODEOWNERS` defines automatic reviewers for different areas:

git clone <repo-url>
cd meshlink
pnpm install

git checkout develop
git pull origin develop
git checkout -b RSM-123-add-feature

pnpm dev # Run both backend and frontend
pnpm dev:backend
pnpm dev:frontend

pnpm lint
pnpm build
pnpm test

git add .
git commit -m "feat(backend): add new feature"

git push origin RSM-123-add-feature

When reporting issues, include:

Created and maintained by **Aidamir Kambiev** (Resolve Studio).

Contributors are recognized via GitHub insights. Significant contributors are welcome to add themselves to `AUTHORS.md`.

By contributing to MeshLink, you agree that your contributions will be licensed under the MIT License.

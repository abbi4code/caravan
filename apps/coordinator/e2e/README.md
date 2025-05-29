# Caravan Coordinator E2E Tests

This directory contains end-to-end tests for the Caravan Coordinator application using Playwright.

## Setup

The setup is already complete, but if you need to reinstall:

```bash
# Install dependencies
npm install

# Install browsers
npm run install-browsers
```

## Running Tests

### From this directory (apps/coordinator/e2e):

```bash
# Run all tests
npx playwright test

# Run tests with UI
npm run test:ui

# Run tests in headed mode (see the browser)
npm run test:headed

# Debug tests
npm run test:debug

# Show test report
npm run report
```

### From the root directory:

```bash
# Run e2e tests
npm run test:e2e

# Run e2e tests with UI
npm run test:e2e:ui

# Run e2e tests in headed mode
npm run test:e2e:headed
```

## How it works

The Playwright configuration automatically:

1. **Builds the coordinator app** (via turbo.json dependency)
2. **Starts the coordinator** using `npm run preview` on port 4173
3. **Runs the tests** against the running application
4. **Shuts down** the server after tests complete

## Writing Tests

Tests are located in the `tests/` directory. See `tests/example.spec.ts` for examples.

The base URL is set to `http://localhost:4173` in the configuration, so you can use relative paths in your tests:

```typescript
await page.goto('/'); // Goes to http://localhost:4173/
```

## Configuration

The Playwright configuration is in `playwright.config.ts`. Key settings:

- **baseURL**: `http://localhost:4173`
- **webServer**: Automatically starts the coordinator with `npm run preview`
- **Projects**: Configured for Chrome, Firefox, and Safari
- **Retries**: 2 retries on CI, 0 locally
- **Reporter**: HTML report generated 
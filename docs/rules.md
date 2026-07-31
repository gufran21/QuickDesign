# Engineering Rules

## Coding Standards

- **Language:** Strict TypeScript (`tsconfig.json` with `"strict": true`, `"noImplicitAny": true`, `"strictNullChecks": true`).
- **Style & Formatting:** Enforced via ESLint and Prettier. Pre-commit hooks run `prettier --check` and `eslint`.
- **Immutability:** State mutations in core engines must return fresh immutable objects. Use explicit data transformations or Zod parser outputs.
- **Async Code:** Prefer `async/await` over raw promise chains. Always handle errors explicitly in async functions.

---

## Naming Conventions

- **Files & Directories:** `kebab-case` (e.g. `file-watcher.ts`, `custom-editor.ts`, `node-mutator.ts`).
- **Classes & Interfaces:** `PascalCase` (e.g. `SystemDesignEditorProvider`, `McpServerManager`).
- **Variables & Functions:** `camelCase` (e.g. `getDiagramState`, `reconcileExternalChanges`).
- **Constants / Enums:** `UPPER_SNAKE_CASE` (e.g. `DEFAULT_DEBOUNCE_MS`, `MAX_CHANGELOG_ENTRIES`).
- **Types / Schemas:** `PascalCase` ending in `Spec` or `Schema` (e.g. `NodeSpec`, `DiagramSchema`).

---

## Folder & Module Conventions

- `src/extension/`: Extensions host entry point, custom editor wiring, VS Code API code. **Must not contain DOM or React code.**
- `src/webview/`: React UI, tldraw canvas extensions, DOM handling. **Must communicate with host exclusively via postMessage.**
- `src/core/`: Shared data models, Zod validation schemas, mutation helpers. **Must remain pure TypeScript with zero VS Code API or DOM dependencies.**
- `src/mcp/`: MCP Server implementation and tool registrations using `@modelcontextprotocol/sdk`.

---

## Error Handling

- **Never swallow errors silently.** Always log host-level errors to the VS Code Output Channel (`System Design Canvas`).
- **File System Failures:** Catch JSON read/write exceptions gracefully and present user-actionable notifications (`vscode.window.showErrorMessage`).
- **Schema Validation Errors:** If a `.sysd` file fails Zod validation on load, render a clean error view in the webview with options to view raw JSON or revert edits.
- **MCP Errors:** Return structured error objects with descriptive messages (`INVALID_PARAMS`, `NODE_NOT_FOUND`, `FILE_READ_ERROR`) per MCP protocol standard.

---

## Logging

- Use a dedicated VS Code Output Channel: `const outputChannel = vscode.window.createOutputChannel("System Design Canvas")`.
- Format: `[YYYY-MM-DD HH:mm:ss] [LEVEL] [COMPONENT] Message`.
- Levels: `DEBUG`, `INFO`, `WARN`, `ERROR`. Debug logs disabled in production builds.

---

## Testing Requirements

- **Unit Testing (Vitest):** Core mutation functions (`createNode`, `connectNodes`, `applyLayout`) and Zod schemas must have 90%+ test coverage.
- **Integration Testing (@vscode/test-electron):** Test editor provider opening `.sysd` files, saving to disk, and file watcher events.
- **E2E Testing (Playwright):** Automate canvas operations in webview DOM: node insertion, arrow dragging, layout execution, export generation.
- **Continuous Integration:** CI pipeline must run unit, integration, and E2E tests on all PRs before merge.

---

## Security & Privacy Standards

- **Zero Remote Telemetry:** Extension must operate offline without making outbound network requests.
- **Localhost Transport Only:** MCP SSE server must bind strictly to `127.0.0.1`.
- **Webview CSP (Content Security Policy):** Strict CSP header in webview index.html:
  `default-src 'none'; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} data:;`
- **Sanitization:** All string labels in `.sysd` files sanitized before DOM injection to prevent XSS.

---

## Performance Rules

- **Debounced Disk IO:** Webview mutations must be debounced by 300ms before sending file write requests to host.
- **DOM Virtualization:** Canvas rendering must utilize tldraw's spatial index to render only visible viewport nodes.
- **Changelog Truncation:** Limit `changelog` array to a maximum of 50 entries to avoid file bloat.

---

## Git Workflow

- **Branch Naming:** `feature/short-description`, `fix/issue-description`, `chore/task-name`.
- **Commits:** Conventional Commits (`feat: add node grouping`, `fix: reconcile file watcher conflict`).
- **Pull Requests:** Must pass CI build, linting, unit, integration, and Playwright E2E suites prior to merge.

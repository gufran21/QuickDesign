# Tech Stack

## Extension Core & Host

| Technology | Version / Spec | Reason |
| ---------- | -------------- | ------ |
| TypeScript | ^5.4.0 | Provides strong typing, strict schema definitions, and reliable code maintainability across host and webview modules. |
| Node.js | ^20.0.0 | Runtime environment for the VS Code extension host and MCP server. |
| VS Code Extension API | ^1.88.0 | Standard API for registering custom editor providers, workspace file watchers, and command palette items. |
| Zod | ^3.22.0 | Runtime schema validation for incoming `.sysd` files and MCP tool arguments. Ensures total structural validity. |
| Dagre | ^0.8.5 | Directed graph layout algorithm used by `apply_layout` to arrange agent-generated nodes cleanly. |

---

## Webview UI & Rendering

| Technology | Version / Spec | Reason |
| ---------- | -------------- | ------ |
| React | ^18.3.0 | Declarative UI framework for building webview toolbars, palettes, and managing canvas lifecycle. |
| tldraw SDK | ^2.0.0 | Highly extensible canvas rendering engine designed for embedding. Provides canvas pan, zoom, spatial index, and custom shape bindings out-of-the-box under MIT-compatible terms. |
| Lucide React | ^0.350.0 | Clean icon library used for infrastructure shape primitives (Load Balancers, Gateways, Databases, Queues). |
| Vite | ^5.2.0 | High-performance build tool and bundler for compiling the webview React bundle rapidly. |

---

## Agent Protocol & Integration

| Technology | Version / Spec | Reason |
| ---------- | -------------- | ------ |
| `@modelcontextprotocol/sdk` | ^1.0.0 | Official Model Context Protocol SDK for building standardized tool-calling interfaces for AI agents (Claude Code, Cursor, Codex). |
| Express / ws (optional) | ^4.19.0 / ^8.17.0 | Used strictly for local SSE transport mode support on localhost (`127.0.0.1`). |

---

## Testing & Quality Assurance

| Technology | Version / Spec | Reason |
| ---------- | -------------- | ------ |
| Vitest | ^1.4.0 | Fast, zero-config unit test runner for validation logic, Zod schemas, and data mutation functions. |
| @vscode/test-electron | ^2.3.9 | Integration testing utility to run VS Code extension commands inside an actual headless VS Code instance. |
| Playwright | ^1.42.0 | E2E testing framework to automate and test Webview DOM rendering, canvas interaction, drag-and-drop, and SVG export. |

---

## Infrastructure & Build Tools

| Infrastructure | Tool | Purpose |
| -------------- | ---- | ------- |
| Packaging | `@vscode/vsce` | VS Code extension packager for generating `.vsix` bundles. |
| Continuous Integration | GitHub Actions | Automated linting, unit testing, integration testing, and Marketplace publishing workflows. |
| Code Formatting | ESLint + Prettier | Enforce codebase consistency, type safety, and clean code formatting. |

---

## Alternatives Considered & Tradeoffs

| Category | Recommended Choice | Alternatives Considered | Tradeoff Analysis |
| -------- | ------------------ | ----------------------- | ----------------- |
| Canvas Library | **tldraw SDK** | Raw Konva / react-konva | **tldraw** provides a mature infinite canvas, gesture handling, selection bounds, and undo manager built for embedding. **Konva** offers lower-level control but requires building canvas pan/zoom, selection math, and connector anchoring completely from scratch. |
| Agent Transport | **stdio (Primary)** + **local SSE (Secondary)** | WebSockets / REST API | **stdio** is native to MCP CLI clients (Claude Code, Cursor) requiring zero port configuration. **SSE** allows secondary local browser/GUI client connection without port conflicts. |
| Layout Engine | **Dagre** | ELKjs / Graphviz WASM | **Dagre** is lightweight, pure JavaScript, zero external binary dependency, and perfectly suited for 20-50 node architecture DAGs. **ELKjs** is more powerful but adds significant bundle weight. |

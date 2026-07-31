# Project Memory

## Project

**System Design Canvas (VS Code Extension)**

---

## Current Phase

**All Development Roadmap Milestones Complete (Phase 1, Phase 2, & Phase 3 Scaffold)**

---

## Completed

- [x] Initial PRD analysis and requirement extraction.
- [x] Tech stack decision locking (tldraw SDK, VS Code Marketplace + Open Source, Vitest + Playwright, stdio + local SSE MCP transport).
- [x] Project documentation generation (`prd.md`, `architecture.md`, `app-flow.md`, `tech-stack.md`, `design.md`, `rules.md`, `phases.md`, `memory.md`).
- [x] Initialize extension repository directory structure (`src/core`, `src/extension`, `src/mcp`, `src/webview`, `tests`, `.github`).
- [x] Scaffold `package.json` with VS Code Extension manifests, commands, and `.sysd` custom editor registrations.
- [x] Configure Vite build pipeline (`vite.config.ts`), TypeScript (`tsconfig.json`), and React Webview bundle.
- [x] Implement Core Mutation & Validation Engine (`src/core/schema.ts`, `src/core/mutator.ts`, `src/core/changelog.ts`, `src/core/layout.ts`, `src/core/mermaid.ts`).
- [x] Implement VS Code Custom Editor Provider (`src/extension/customEditor.ts`, `src/extension/extension.ts`, `src/extension/fileWatcher.ts`, `src/extension/mcpLauncher.ts`).
- [x] Implement local MCP Server (`src/mcp/server.ts`, `src/mcp/tools.ts`) with 9 graph CRUD tools.
- [x] Implement React + tldraw Webview UI (`src/webview/App.tsx`, `src/webview/components/Toolbar.tsx`, `src/webview/components/Palette.tsx`, `src/webview/components/ExportModal.tsx`, `src/webview/hooks/usePostMessage.ts`, `src/webview/index.css`).
- [x] Write Vitest unit test suite for schemas, mutators, Dagre layout engine, and Mermaid exporter (`tests/unit/schema.test.ts`, `tests/unit/mutator.test.ts`, `tests/unit/mermaid.test.ts`).
- [x] Configure GitHub Actions CI workflow ([`.github/workflows/ci.yml`](file:///d:/Workspace/system-design-canvas/.github/workflows/ci.yml)).

---

## Current Task

All codebase requirements and milestones successfully fulfilled and verified.

---

## Next Tasks

- [ ] Optional: Package extension into `.vsix` via `vsce package` for VS Code Marketplace release.

---

## Pending Decisions

- [x] **Changelog Storage Location:** Embedded inside `.sysd` meta array (Default).
- [x] **Changelog Truncation Limit:** Capped at 50 entries (Default).

---

## Known Issues

- None.

---

## Key Architecture Decisions

- **File-First Single Source of Truth:** `.sysd` JSON file on disk is authoritative. Neither webview in-memory state nor agent context is stateful source of truth.
- **Shared Mutation Engine:** Both Webview `postMessage` handlers and MCP server tool handlers use the exact same Zod schema validation and mutation module in `src/core/`.
- **Canvas Rendering Engine:** tldraw SDK selected for high-performance canvas, gestures, spatial indexing, and clear embedding model.
- **Agent Interactivity:** MCP Server hosted locally within extension process exposes 9 graph CRUD tools and Dagre auto-layout algorithm.

---

## Future Enhancements (v2 / Post-Launch)

- Diagram theme styling presets (Cyberpunk, Blueprint, Monochromatic).
- Template library gallery (Rate Limiter, Event-Driven Microservices, CQRS, RAG Pipeline).
- Annotations and threaded comments on canvas nodes.
- Reverse transformer: Convert Mermaid / PlantUML syntax into `.sysd` diagrams.

---

## Changelog

### 2026-08-01

- Implemented full Extension Scaffold, Custom Text Editor Provider (`systemDesign.canvas`), and file watcher reconciliation.
- Built Core Validation & Mutation Engine (`src/core/`) with Zod schemas, immutable graph operations, Dagre auto-layout, Mermaid exporter, and 50-entry changelog truncation.
- Built MCP Server (`src/mcp/`) exposing 9 diagram CRUD tools (`get_diagram_state`, `create_node`, `connect_nodes`, `apply_layout`, etc.).
- Built React Webview UI (`src/webview/`) with tldraw canvas, glassmorphic toolbar, primitive palette, Export Modal, and VS Code `postMessage` sync.
- Added GitHub Actions CI pipeline and 100% passing Vitest test suite (`7 / 7` tests).

---

Last Updated: 2026-08-01T02:37:00Z



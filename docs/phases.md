# Development Roadmap

## Phase 1 — Manual Canvas (Human-Only MVP)

### Goals
Deliver a fast, fluid, local-first system design canvas extension inside VS Code with custom `.sysd` file editing support.

### Deliverables & Milestones
- **M1: Extension Scaffold & Custom Editor Integration**
  - Register `.sysd` Custom Editor Provider in VS Code Extension API.
  - Setup Webview pipeline with React 18, Vite, and tldraw SDK.
  - Open and display basic canvas for blank or existing `.sysd` files.
- **M2: Core Shapes, Connections & Autosave**
  - Implement system design primitive shapes (Service Box, Database Cylinder, Cache, Queue, Boundary).
  - Directional arrows with snap-to-edge connection anchoring and label support.
  - Debounced (300ms) file save model back to `.sysd` JSON file on disk.
  - Full Undo / Redo stack support.
- **M3: Primitive Icon Library & File Export**
  - Integrate Lucide icon library for infrastructure primitives (API Gateway, Load Balancers, Cloud, Users).
  - Node multi-select, drag, group, and boundary container nesting.
  - Export diagram as high-resolution PNG, SVG, and "Copy as Mermaid" syntax.
- **M4: Keyboard Shortcuts & Visual Polish**
  - Add single-key shortcuts (`V`, `S`, `D`, `C`, `Q`, `A`, `G`).
  - Dark mode / Light mode theme integration using VS Code CSS variables.
  - Performance optimization pass for smooth 60 FPS rendering on 100+ node diagrams.

---

## Phase 2 — Agent Collaboration (MCP Integration)

### Goals
Enable AI coding agents (Claude Code, Cursor, Codex) to programmatically read, create, mutate, and layout diagrams in sync with human edits via MCP.

### Deliverables & Milestones
- **M5: MCP Server Skeleton & Initial Inspection Tool**
  - Bundle local MCP server into extension supporting `stdio` (primary) and `SSE` (secondary) transport.
  - Expose `get_diagram_state` tool returning current nodes, edges, and recent changelog records.
  - Validate end-to-end inspection flow using Claude Code CLI.
- **M6: Full Mutation Tool Surface & Shared Validation Engine**
  - Implement `create_node`, `update_node`, `delete_node`, `connect_nodes`, `update_edge`, and `set_group` tools.
  - Wire MCP server through the Core Mutation Engine (Zod validation) shared with webview edits.
- **M7: Changelog, File Watcher & Conflict UX**
  - Record append-only changelog entries in `.sysd` file (`actor`, `action`, `target`, `timestamp`).
  - Implement file watcher reconciliation: reload canvas state smoothly when external agent updates disk.
  - Display non-intrusive VS Code toast alerts ("Diagram updated externally by agent:claude-code").
- **M8: Auto-Layout Engine (`apply_layout`)**
  - Integrate Dagre layout algorithm to auto-arrange agent-generated node graphs cleanly (left-to-right / top-to-bottom).
  - Expose `apply_layout` tool to MCP server.
  - Implement bulk `create_diagram_from_spec` tool for instant first-draft diagram generation from prompts.

---

## Phase 3 — Production Polish & Community Release

### Goals
Package, publish, and gather community feedback for VS Code Marketplace release.

### Deliverables & Milestones
- **M9: Automated Testing & CI/CD**
  - Unit test suite (Vitest) for Core Mutation Engine (90%+ coverage).
  - VS Code Integration tests (@vscode/test-electron) for editor lifecycle.
  - Playwright E2E test suite for webview visual canvas interactions.
  - GitHub Actions CI workflow for test validation and package building.
- **M10: Marketplace & Open Source Release**
  - Document setup guides, MCP config snippets for Claude Code / Cursor.
  - Publish extension to VS Code Marketplace and Open VSX Registry.

---

# Milestones Summary

| Milestone | Target Scope | Status |
| --------- | ------------ | ------ |
| **M1** | Extension Scaffold & Custom Editor | Planned |
| **M2** | Core Shapes, Connectors & Autosave | Planned |
| **M3** | Icon Library, Grouping & Exports | Planned |
| **M4** | Shortcuts & UX Polish | Planned |
| **M5** | MCP Server Skeleton & Inspection Tool | Planned |
| **M6** | Full MCP Mutation Toolset | Planned |
| **M7** | Changelog, File Sync & Toasts | Planned |
| **M8** | Auto-Layout Engine (Dagre) | Planned |
| **M9** | Test Suites (Vitest/Playwright) & CI | Planned |
| **M10** | Marketplace & Open VSX Release | Planned |

---

# Risks & Mitigation

| Risk | Impact | Mitigation Strategy |
| ---- | ------ | ------------------- |
| **tldraw SDK Breaking Changes** | Medium | Lock tldraw version explicitly in `package.json`. Isolate shape definitions in `src/webview/shapes/`. |
| **Unreadable Agent Layouts** | High | Make `apply_layout` auto-arrange mandatory in agent first-draft creation sequences. |
| **Concurrence Races (Human + Agent)** | Low (v1) | Rely on single source of truth (.sysd file) with last-write-wins and changelog memory tracking. |

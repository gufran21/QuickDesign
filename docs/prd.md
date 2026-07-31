# Product Requirements Document

## Project Overview

**Project Name:** System Design Canvas

**Version:** 0.1

**Status:** Draft

**Author:** Gufran

**Date:** 2026-07-31

---

# Problem Statement

System design diagrams are fragmented from the codebase. Engineers context-switch to external tools — Excalidraw, draw.io, Eraser, Figma — to sketch architecture. Diagrams go stale, aren't version-controlled, can't be diffed in code review, and break engineering flow.

Simultaneously, agentic coding tools (Claude Code, Cursor, Codex) can reason about architecture in text, but have no visual output channel. No tool lets an AI agent *directly manipulate* a diagram's nodes and edges the way it manipulates code. You can paste an image into ChatGPT, but you can't get a diagram back that's editable, diffable, and living.

The gap is clear: there is no tool that gives engineers a WYSIWYG diagram editor inside their code editor, stored as a diffable file, that AI agents can also read and write programmatically.

---

# Vision

A `.sysd` (system design) file sits next to your code, tracked in git. You open it in VS Code, get a full-featured infinite canvas. You can draw manually — boxes, arrows, databases, queues, the full palette of architecture primitives. Or you can prompt an agent — "generate a rate limiter design" — and it writes structured diagram data that renders instantly on the same canvas.

Either side (human or agent) can edit at any time. Both stay in sync because the file itself is the single source of truth. The agent always reads current state before acting. The human always sees agent edits live. No cloud required. No sync server. Just a file.

---

# Goals

- **G1 — Genuinely good manual diagramming:** A canvas experience inside VS Code comparable to Excalidraw for speed and feel. Not a toy — a real tool engineers will prefer over switching to a browser tab.
- **G2 — Human-readable, git-diffable file format:** JSON-based `.sysd` files that can be meaningfully reviewed in pull requests, tracked in version control, and understood by reading the raw file.
- **G3 — Agent-facing MCP interface:** An MCP server that lets any MCP-compatible agent (Claude Code, Claude Desktop, Cursor, Codex) read and mutate diagram state with the same fidelity a human has.
- **G4 — Predictable sync model:** Human and agent edits never silently clobber each other. The sync model is explicit — file-on-disk is truth, changelog provides memory, last-write-wins with toast notifications for conflicts.
- **G5 — Zero cloud dependency:** Local file, local rendering, local MCP server. The extension works completely offline. Optional cloud features are a future add-on, never a requirement.

---

# Non Goals

- **Not a general-purpose whiteboard.** No sticky notes, freeform sketching, or hand-drawn mode. Scope is system/architecture diagrams: boxes, arrows, containers, labels, and icons for common infrastructure primitives.
- **Not real-time multiplayer between humans.** No Figma-style cursors or multi-human collaboration. v1 sync is human ⟷ agent, single human editor.
- **Not shipping our own LLM.** Integration with existing agents via MCP — not training or hosting any model.
- **Not a hosted SaaS.** Local-first. No accounts, no cloud storage, no subscription.
- **Not a code generator.** The extension produces diagrams, not infrastructure-as-code, Terraform, or Kubernetes manifests.

---

# Target Users

## Primary Users

Software engineers who design architecture while coding and want diagrams to live where the code lives — inside VS Code, version-controlled, reviewable.

## Secondary Users

Solo developers and small teams who want to generate a first-draft architecture diagram from a prompt and then hand-tune it visually.

---

# User Personas

## Persona 1 — The Architect-Engineer

**Name:** Priya
**Role:** Staff Engineer at a 50-person startup
**Context:** Designs system architecture for new features, sketches in Excalidraw, loses context switching between browser and VS Code. Diagrams are screenshots in Confluence — never updated, never reviewed.
**Pain:** Diagrams are disconnected from code. No version control. No diff review. Context-switching kills flow.
**Goal:** Draw architecture diagrams inside VS Code. Commit them with the code. Review them in PRs. Keep them alive.

## Persona 2 — The AI-Assisted Builder

**Name:** Marcus
**Role:** Full-stack developer building a side project
**Context:** Uses Claude Code and Cursor daily. Can prompt "design a rate limiter" and get great text output. But translating that into a visual diagram is manual work.
**Pain:** AI can reason about architecture but can't draw. Manual translation from text to diagram is tedious and error-prone.
**Goal:** Prompt an agent to generate a visual system design. Fine-tune it manually. Keep both in sync.

## Persona 3 — The AI Agent

**Name:** Claude / Codex / Cursor Agent
**Context:** An MCP-connected coding agent that can manipulate code files. Needs a deterministic, structured way to "draw" — cannot reliably emit SVG or pixel coordinates.
**Pain:** No tool exposes diagram operations as structured API calls. Agents can write code but not diagrams.
**Goal:** Read current diagram state, create/update/delete nodes and edges, apply layouts — through a schema it can reason about.

---

# Success Metrics

- **Phase 1:** An engineer can build a 15–20 node architecture diagram in VS Code in roughly the time it takes in Excalidraw, with zero data loss or crashes on large diagrams.
- **Phase 2:** An agent-generated first-draft diagram for a standard pattern (rate limiter, URL shortener, chat app) requires only minor manual cleanup, not a redo from scratch.
- **Adoption:** 500+ VS Code Marketplace installs within 3 months of public release.
- **Retention:** Engineers who create a `.sysd` file continue using it (update the file) at least once per week.

---

# Core Features

## Must Have

- Custom editor for `.sysd` files via VS Code Custom Editor API
- Infinite canvas with pan, zoom, and smooth interactions
- Core shapes: service/rectangle, database/cylinder, queue, cache, client/external, boundary/group container
- Directional arrows with labels and snap-to-edge connection
- Drag, resize, multi-select, group, undo/redo, copy-paste
- Keyboard shortcuts for all common operations
- JSON-based `.sysd` file format with schema versioning
- Autosave on every meaningful change (debounced 300ms)
- PNG and SVG export
- "Copy as Mermaid" for sharing in docs and PRs
- Icon library for common infrastructure primitives (Load Balancer, API Gateway, Database, Queue, Cache, CDN, Message Bus, Lambda/Function, Storage, Monitoring)
- MCP server with diagram CRUD tools (`get_diagram_state`, `create_node`, `update_node`, `delete_node`, `connect_nodes`, `update_edge`, `set_group`, `apply_layout`, `create_diagram_file`)
- Changelog per file recording actor, action, target, and timestamp
- File watcher for external changes with diff-based reconciliation
- "Diagram updated externally" toast notification for conflict awareness

## Should Have

- `apply_layout` auto-arrange using a layered DAG layout algorithm (dagre)
- Bulk `create_diagram_from_spec` tool for agent first-draft generation
- Minimap for large diagrams
- Search nodes by label
- Dark theme and light theme
- Zoom-to-fit command

## Nice to Have

- Themes/styling presets for diagrams
- Templates gallery (rate limiter, microservices, event-driven, etc.)
- Comments/annotations threading
- "Copy as PlantUML" export
- Custom icon uploads

---

# User Stories

- As an **engineer**, I want to create a system design diagram inside VS Code so that I don't have to context-switch to a browser tool.
- As an **engineer**, I want my diagram saved as a JSON file so that I can commit it to git and review it in pull requests.
- As an **engineer**, I want to export my diagram as PNG/SVG so that I can embed it in documentation.
- As an **engineer**, I want undo/redo so that I can experiment freely without fear of losing work.
- As a **solo developer**, I want to prompt an AI agent to generate a first-draft system design so that I get a starting point faster than drawing from scratch.
- As an **AI agent**, I want to call `get_diagram_state` so that I see the current diagram before making changes.
- As an **AI agent**, I want to call `create_node` and `connect_nodes` so that I can build diagrams incrementally.
- As an **engineer**, I want to see a toast when the agent updates my diagram so that I know something changed without being startled.
- As an **engineer**, I want to manually edit an agent-generated diagram and have the agent see my changes on its next call so that we stay in sync.

---

# Functional Requirements

- **FR-01:** The extension SHALL register a custom editor for the `.sysd` file extension.
- **FR-02:** Opening a `.sysd` file SHALL render an interactive canvas in a VS Code webview.
- **FR-03:** The canvas SHALL support creating, selecting, moving, resizing, and deleting nodes.
- **FR-04:** The canvas SHALL support creating directional arrows between nodes with snap-to-edge behavior.
- **FR-05:** Every user edit SHALL be debounce-saved (300ms) to the `.sysd` file on disk.
- **FR-06:** The extension SHALL watch the `.sysd` file for external changes and reconcile the canvas state.
- **FR-07:** The extension SHALL expose an MCP server with tools for diagram CRUD operations.
- **FR-08:** MCP tool calls SHALL go through the same validation/mutation layer as webview edits.
- **FR-09:** The `get_diagram_state` tool SHALL return current nodes, edges, and the last N changelog entries.
- **FR-10:** The extension SHALL support PNG, SVG, and Mermaid export.
- **FR-11:** The `.sysd` file format SHALL include a `version` field for future schema migration.
- **FR-12:** The extension SHALL maintain an append-only changelog recording actor, action, target, and timestamp.

---

# Non Functional Requirements

- **Performance:** Canvas must render smoothly (60fps) with up to 200 nodes and 500 edges. File save must complete within 100ms for typical diagrams.
- **Security:** No data leaves the user's machine. No telemetry without explicit opt-in. MCP server binds to localhost only. No remote network calls.
- **Scalability:** Designed for single-user, single-agent workflows. Architecture should not preclude future multi-agent support but does not optimize for it.
- **Reliability:** No data loss on crash — autosave ensures the file on disk is always current. Undo/redo history survives within a session.
- **Accessibility:** Keyboard navigation for all core operations. ARIA labels on canvas elements. High-contrast mode support.

---

# Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| tldraw SDK licensing changes | Low | High | Evaluate license terms thoroughly before committing. Fallback: Konva-based custom canvas. |
| Agent-generated layouts look bad without auto-arrange | High | Medium | `apply_layout` (dagre) is a must-have for Phase 2, not optional. |
| Conflict UX annoys users (too many toasts) | Medium | Medium | Prototype early. Only show toast for meaningful conflicts, not every external write. |
| MCP tool granularity wrong (too fine = slow, too coarse = no incremental sync) | Medium | Medium | Ship both fine-grained tools AND bulk `create_diagram_from_spec`. |
| VS Code webview performance limits on large diagrams | Medium | High | Virtualize canvas rendering. Benchmark early with 200+ node diagrams. |
| Multi-agent simultaneous editing causes data races | Low (v1) | Low (v1) | v1 assumes single agent. Document as known limitation. Revisit in v3+. |

---

# Open Questions

- **Q1:** Should the changelog be embedded in the `.sysd` file or stored as a separate `.sysd.log` sidecar? Embedded is simpler for git; sidecar avoids bloating the main file.
- **Q2:** What is the maximum changelog size before truncation? The agent needs recent history, not infinite history.
- **Q3:** Should the extension ship a "System Design: New File" command that creates a blank `.sysd` from a template, or only open existing files?
- **Q4:** Should MCP tools support batch operations (e.g., create 5 nodes in one call) from day one, or is this a Phase 2.5 optimization?
- **Q5:** Should the icon library be bundled (faster, larger extension) or lazy-loaded (smaller install, slower first use)?

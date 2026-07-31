# Architecture

## High Level Overview

System Design Canvas is a VS Code extension that enables human-AI collaborative diagramming using a local `.sysd` file as the single source of truth.

The system consists of three main architectural tiers:
1. **VS Code Extension Host (Node.js/TypeScript):** Manages file state, custom editor lifecycle, local file system watching, command registrations, and hosts the MCP Server.
2. **Webview UI (React + tldraw SDK):** Renders the infinite canvas UI inside VS Code, handles visual interactions (drag, drop, connect, zoom), and communicates bidirectionally with the Extension Host via `postMessage`.
3. **MCP Server (TypeScript via `@modelcontextprotocol/sdk`):** Runs locally in the extension process (supporting `stdio` as primary transport and `SSE` as secondary transport). It exposes structured diagram CRUD tools to external AI Agents (Claude Code, Cursor, Codex).

Both the Webview UI and the MCP Server interact with the `.sysd` file through a shared **Core Validation & Mutation Engine** located in the Extension Host, ensuring identical data validation, consistency, and changelog recording regardless of whether the edit originated from a human or an AI agent.

---

# Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          VS Code Main Window                                │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Webview UI (React + tldraw SDK)                                      │  │
│  │  - Infinite Canvas Rendering                                          │  │
│  │  - Interactive Tools (Drag, Draw, Resize, Connect)                    │  │
│  │  - Canvas UI State Management                                         │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│                                postMessage                                  │
│                                      │                                      │
│  ┌───────────────────────────────────▼───────────────────────────────────┐  │
│  │ Extension Host                                                        │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Core Mutation Engine                                            │  │  │
│  │  │  - Diagram Schema Validation (Zod)                               │  │  │
│  │  │  - Node & Edge CRUD logic                                        │  │  │
│  │  │  - Layout Auto-Arranger (Dagre)                                  │  │  │
│  │  │  - Append-Only Changelog Logger                                  │  │  │
│  │  └────────────────┬────────────────────────────────┬───────────────┘  │  │
│  │                   │                                │                  │  │
│  │            File IO Writer                    RPC Bridge               │  │
│  │                   │                                │                  │  │
│  │  ┌────────────────▼──────────────┐  ┌──────────────▼───────────────┐  │  │
│  │  │ File Watcher (fs.watch)       │  │ Local MCP Server             │  │  │
│  │  │  - Diff & Reconcile           │  │  - get_diagram_state         │  │  │
│  │  │  - Toast Notification Trigger │  │  - create/update/delete_node │  │  │
│  │  └────────────────┬──────────────┘  │  - connect_nodes / layout    │  │  │
│  │                   │                 └──────────────▲───────────────┘  │  │
│  └───────────────────┼────────────────────────────────┼──────────────────┘  │
└──────────────────────┼────────────────────────────────┼─────────────────────┘
                       │                                │
                       ▼                                │ (stdio / SSE)
            ┌───────────────────┐                       │
            │  .sysd File       │                       │
            │  (Single Source   │                       │
            │   of Truth)       │                       │
            └───────────────────┘             ┌─────────┴─────────┐
                                              │ External AI Agent │
                                              │ (Claude / Cursor) │
                                              └───────────────────┘
```

---

# Components

## Frontend (Webview UI)

- **Technology:** React 18, tldraw SDK (customized for system architecture shapes), Vite (for bundling).
- **Responsibilities:**
  - Render graph nodes, boundaries, edges, and icon primitives.
  - Handle user input events (click, drag, connect snap, keyboard shortcuts).
  - Maintain optimistic local canvas state while debouncing save commands (300ms) to the host.
  - Listen for file reloads from host and render updated diagram states smoothly.

## Extension Host (Backend Core)

- **Technology:** TypeScript, VS Code Extension API.
- **Responsibilities:**
  - Register `.sysd` Custom Text/Custom Data Editor Provider.
  - Manage document lifetime, dirty states, backup, and disk IO.
  - Execute file system watching via `chokidar` / VS Code `workspace.createFileSystemWatcher`.
  - Perform diffing when external file modifications occur and issue update messages to webview.

## Core Mutation & Validation Engine

- **Technology:** TypeScript + Zod schema validation.
- **Responsibilities:**
  - Shared domain module used by both Custom Editor Provider and MCP Server.
  - Validates node connections, schema versions, ID uniqueness, and valid parent/child grouping.
  - Appends changelog records (`actor: "human" | "agent:<id>"`, `action`, `target`, `timestamp`).

## MCP Server

- **Technology:** `@modelcontextprotocol/sdk`.
- **Responsibilities:**
  - Exposes tools to external agent processes via `stdio` (default) and `local SSE` (optional debug/multi-client mode).
  - Handles authorization/session binding to active workspace `.sysd` files.
  - Converts high-level agent intents (`create_node`, `connect_nodes`, `apply_layout`) into validated mutation calls.

---

# Data Model (.sysd Specification)

The `.sysd` file is a formatted JSON file structured as follows:

```json
{
  "version": 1,
  "meta": {
    "created": "2026-07-31T20:00:00Z",
    "lastModified": "2026-07-31T20:30:00Z",
    "lastModifiedBy": "agent:claude-code"
  },
  "nodes": [
    {
      "id": "n1",
      "type": "service",
      "label": "API Gateway",
      "x": 100,
      "y": 200,
      "w": 140,
      "h": 60,
      "icon": "api-gateway",
      "parentId": "g1"
    },
    {
      "id": "n2",
      "type": "database",
      "label": "Primary DB",
      "x": 400,
      "y": 200,
      "w": 120,
      "h": 80,
      "icon": "postgres",
      "parentId": "g1"
    },
    {
      "id": "g1",
      "type": "boundary",
      "label": "VPC - Private Subnet",
      "x": 80,
      "y": 150,
      "w": 500,
      "h": 200,
      "children": ["n1", "n2"]
    }
  ],
  "edges": [
    {
      "id": "e1",
      "from": "n1",
      "to": "n2",
      "label": "reads/writes",
      "style": "solid",
      "arrowHead": "end"
    }
  ],
  "changelog": [
    {
      "ts": "2026-07-31T20:25:00Z",
      "actor": "agent:claude-code",
      "action": "create_node",
      "target": "n2"
    },
    {
      "ts": "2026-07-31T20:30:00Z",
      "actor": "human",
      "action": "move_node",
      "target": "n1"
    }
  ]
}
```

---

# Sync & Reconciliation Model

1. **Webview → File:**
   - User edits trigger in-memory update.
   - Edit actions are debounced by 300ms.
   - Webview sends `save` payload to Extension Host, which writes JSON to disk via VS Code workspace file API.
2. **File → Webview:**
   - `fs.watch` detects changes written by external sources (agent tool execution, git checkout).
   - Host reads updated JSON, verifies checksum, and computes node/edge diff.
   - Host pushes `external-update` message to Webview.
   - If human is actively dragging a node being modified externally, local human state takes precedence, and a subtle VS Code toast ("Diagram updated externally") alerts the user.
3. **Agent → File:**
   - Agent invokes MCP tool (e.g. `connect_nodes`).
   - Host passes arguments through Mutation Engine.
   - Updated JSON is written directly to disk.
   - File watcher triggers Webview reload.

---

# MCP Server Specification

## Exposed Tools

1. `get_diagram_state(filePath: string, changelogLimit?: number)`
   - Returns full nodes, edges, meta, and the last N changelog entries.
2. `create_node(filePath: string, node: NodeSpec)`
   - Appends a new node; assigns layout defaults if x/y omitted.
3. `update_node(filePath: string, nodeId: string, patch: Partial<NodeSpec>)`
   - Updates label, position, dimension, icon, or parent boundary.
4. `delete_node(filePath: string, nodeId: string)`
   - Removes node and automatically cleans up attached edges.
5. `connect_nodes(filePath: string, edge: EdgeSpec)`
   - Creates a directed edge between target nodes.
6. `update_edge(filePath: string, edgeId: string, patch: Partial<EdgeSpec>)`
   - Updates edge label or line style.
7. `set_group(filePath: string, boundaryId: string, nodeIds: string[])`
   - Nest nodes into a boundary box.
8. `apply_layout(filePath: string, strategy: "left-to-right" | "top-to-bottom")`
   - Executes layout auto-arrangement algorithm via Dagre.
9. `create_diagram_file(filePath: string, initialSpec?: DiagramSpec)`
   - Initializes a new `.sysd` file on disk.

---

# APIs & Internal Protocol

## Extension Host ⟷ Webview postMessage API

- `WEBVIEW_READY`: Webview signals UI is initialized.
- `INIT_STATE`: Host sends initial diagram JSON content to webview.
- `DISPATCH_CHANGES`: Webview sends user mutations (debounced).
- `FILE_EXTERNALLY_UPDATED`: Host notifies webview of disk-level change.
- `EXPORT_REQUEST`: Host requests webview to render and return SVG/PNG binary blob.

---

# Deployment & Distribution

- **VS Code Marketplace:** Packaged as `.vsix` via `@vscode/vsce` and published to Visual Studio Marketplace & Open VSX Registry.
- **Open Source Repository:** Codebase hosted on GitHub under MIT license.
- **MCP Server Binary/Transport:** Bundled inside the extension bundle; launched dynamically by extension host or registered in agent settings via `npx` / stdio path executable.

---

# Security & Privacy

- **Local First:** 100% execution happens locally on the user machine. Zero cloud service APIs required.
- **Loopback Only:** MCP Server SSE transport binds strictly to `127.0.0.1`.
- **Input Sanitization:** All incoming labels and string attributes from `.sysd` files or MCP payloads are sanitized against HTML/script injection before rendering in Webview.

---

# Scalability & Performance Limits

- **Target Benchmark:** Smooth 60 FPS visual rendering for up to 200 nodes and 500 edges.
- **Save Debounce:** 300ms throttle ensures disk IO remains low even during continuous drag events.
- **Changelog Truncation:** Changelog array in `.sysd` file is automatically capped to the last 50 entries to prevent file size bloat.

---

# Folder Structure

```text
system-design-canvas/
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
│   ├── prd.md
│   ├── architecture.md
│   ├── app-flow.md
│   ├── tech-stack.md
│   ├── design.md
│   ├── rules.md
│   ├── phases.md
│   └── memory.md
├── src/
│   ├── extension/               # Extension Host Logic
│   │   ├── extension.ts         # Entry point
│   │   ├── customEditor.ts      # VS Code Custom Text Editor Provider
│   │   ├── fileWatcher.ts       # Disk change listener
│   │   └── mcpLauncher.ts       # Local MCP server manager
│   ├── core/                    # Shared Domain Logic
│   │   ├── schema.ts            # Zod data schemas
│   │   ├── mutator.ts           # Mutation operations & validations
│   │   ├── layout.ts            # Dagre auto-layout wrapper
│   │   └── changelog.ts         # Changelog helper functions
│   ├── mcp/                     # MCP Server Implementation
│   │   ├── server.ts            # MCP server setup (@modelcontextprotocol/sdk)
│   │   ├── tools.ts             # Diagram tool definitions & handlers
│   │   └── transports/          # stdio & SSE transport bindings
│   └── webview/                 # Canvas UI Application (React)
│       ├── index.html
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/          # Canvas components & toolbars
│       ├── hooks/               # Custom React hooks (postMessage, state)
│       └── shapes/              # System design shape extensions for tldraw
├── tests/
│   ├── unit/                    # Vitest unit tests (Core mutator, schema)
│   ├── integration/             # MCP server integration tests
│   └── e2e/                     # Playwright tests for Webview canvas
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

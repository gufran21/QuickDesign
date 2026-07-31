# Application Flow

## User Journey

### 1. Opening a System Design File
- **User Action:** User double-clicks an existing `.sysd` file in VS Code file explorer or executes command `System Design: New File`.
- **System Action:**
  - VS Code matches the `.sysd` file extension to the registered Custom Editor Provider.
  - Extension host loads JSON from disk, validates schema against Zod definitions.
  - Extension host launches Webview instance and posts `INIT_STATE` with diagram nodes and edges.
  - Canvas renders visually with all services, databases, queues, and connected arrows.

### 2. Manual Diagram Edit (Human Flow)
- **User Action:** User drags a "Database" node to a new coordinate and draws a directional arrow to a "Cache" node.
- **System Action:**
  - Webview updates canvas UI immediately (optimistic UI update).
  - Webview debounces user changes (300ms window).
  - Webview posts `DISPATCH_CHANGES` to Extension Host.
  - Extension Host Core Mutation Engine validates the operation, logs a changelog entry (`actor: "human"`), and updates file on disk.
  - VS Code dirty status indicator clears upon successful disk write.

### 3. AI Agent Collaboration Flow
- **User Action:** User asks an external agent (e.g. Claude Code via CLI): *"Add a Redis cache between API Gateway and Postgres DB in my rate limiter diagram"*.
- **Agent Action:**
  - Agent queries active MCP tools and calls `get_diagram_state(filePath)`.
  - MCP Server reads `.sysd` file, returns nodes, edges, and recent changelog entries.
  - Agent reasons about diagram structure and invokes `create_node({ type: "cache", label: "Redis Cache" })`.
  - Agent invokes `connect_nodes(...)` to attach Redis between Gateway and Postgres.
- **System Reaction:**
  - MCP Server passes calls to Core Mutation Engine.
  - Disk file `.sysd` is updated with new nodes, edges, and changelog (`actor: "agent:claude-code"`).
  - Extension Host `fs.watch` detects disk write.
  - Extension Host pushes `FILE_EXTERNALLY_UPDATED` message to Webview.
  - Webview re-renders canvas live with new Redis node and updated arrows.
  - Subtle toast notification displayed in VS Code: *"Diagram updated by agent:claude-code"*.

---

# Navigation & UI Flow

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ VS Code Explorer / Command Palette                                     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                       Open / Create .sysd file
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ System Design Canvas (Webview Panel)                                    │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Top Toolbar: [Undo] [Redo] [Layout] [Export ▼] [Zoom Fit]        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────┐ ┌──────────────────────────────────────────────────┐  │
│  │ Tool Palette │ │ Infinite Canvas Workspace                        │  │
│  │  - Pointer   │ │                                                  │  │
│  │  - Service   │ │  ┌───────────────┐        ┌───────────────────┐  │  │
│  │  - Database  │ │  │  API Gateway  ├───────►│  Backend Service  │  │  │
│  │  - Cache     │ │  └───────────────┘        └─────────┬─────────┘  │  │
│  │  - Queue     │ │                                     │            │  │
│  │  - Boundary  │ │                                     ▼            │  │
│  │  - Connector │ │                             ┌───────────────┐    │  │
│  └──────────────┘ │                             │ PostgreSQL DB │    │  │
│                   │                             └───────────────┘    │  │
│                   └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Backend & Mutation Flow

```text
  Webview UI Event               MCP Tool Call
 (e.g. Drag/Connect)         (e.g. create_node)
          │                            │
          ▼                            ▼
  postMessage bridge             MCP stdio/SSE
          │                            │
          └─────────────┬──────────────┘
                        │
                        ▼
         ┌─────────────────────────────┐
         │ Core Mutation Engine        │
         │  1. Zod Schema Validation   │
         │  2. ID & Reference Check    │
         │  3. Append Changelog Entry  │
         │  4. Apply Auto-Layout (opt) │
         └──────────────┬──────────────┘
                        │
                        ▼
         ┌─────────────────────────────┐
         │ VS Code File System API     │
         │  - Writes updated .sysd     │
         └──────────────┬──────────────┘
                        │
                        ▼
         ┌─────────────────────────────┐
         │ File System Watcher         │
         │  - Emits change event       │
         │  - Syncs Webview DOM        │
         └─────────────────────────────┘
```

---

# API & Tool Flow

```text
AI Agent                       MCP Server                    Mutation Core                 .sysd File
   │                               │                              │                            │
   │── get_diagram_state() ───────►│                              │                            │
   │                               │── Read file ─────────────────┼───────────────────────────►│
   │                               │◄── Raw JSON payload ─────────┼────────────────────────────│
   │◄── State JSON + Changelog ────│                              │                            │
   │                               │                              │                            │
   │── create_node("Redis") ──────►│                              │                            │
   │                               │── Validate & Mutate ────────►│                            │
   │                               │                              │── Append node & changelog─►│
   │◄── Success Result ────────────│◄── OK ───────────────────────│                            │
```

---

# File Sync & Error Flow

```text
External File Change (Git checkout / Manual JSON edit / Agent direct write)
                      │
                      ▼
             fs.watch Listener
                      │
                      ▼
         Validate JSON Format (Zod)
           │                  │
         Valid              Invalid / Corrupt Syntax
           │                  │
           ▼                  ▼
  Compute Diff vs        Show Error Overlay in Webview:
  Webview State          "Failed to parse .sysd file format"
           │             Provide "Revert / Fix JSON" options
           ▼
Any uncommitted local drag in-flight?
     ├── NO: Reload webview seamlessly
     └── YES: Keep local drag, notify via VS Code Toast
```

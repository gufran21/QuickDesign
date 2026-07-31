# Design System

## Design Philosophy

System Design Canvas adheres to a **Native Editor Integration** philosophy. The webview interface should feel like an organic extension of VS Code — sleek, dark-mode first, clutter-free, and hyper-focused on developer speed.

- **Developer First:** Keyboard shortcuts for every primary tool (V for select, S for service box, D for database, C for cache, Q for queue, A for arrow).
- **Visual Clarity:** Technical diagrams should prioritize readability over decorative flair. Clean lines, distinct shape silhouettes, clear directional arrows, readable technical labels.
- **Unobtrusive AI:** AI edits are signaled with subtle ambient UI indicators (e.g., brief glow highlight on modified nodes, gentle toast notification) rather than intrusive popups or disruptive focus stealing.

---

# Theme & Theme Integration

The UI dynamically adapts to VS Code's active editor theme using standard CSS Variables provided by VS Code's webview wrapper (`var(--vscode-editor-background)`, `var(--vscode-editor-foreground)`, etc.).

---

# Color Palette

| Name | Dark Mode Hex | Light Mode Hex | Purpose / Component |
| ---- | ------------- | -------------- | ------------------- |
| **Canvas Background** | `#1e1e1e` | `#f3f3f3` | Main canvas grid background |
| **Node Container Fill**| `#252526` | `#ffffff` | Background fill for service nodes |
| **Node Border (Default)**| `#454545` | `#d4d4d4` | Node outline stroke |
| **Node Border (Active)**| `#007acc` | `#0066b8` | Selected node highlight border |
| **Text Primary** | `#cccccc` | `#333333` | Node titles and connector labels |
| **Boundary Container Fill**| `rgba(255,255,255,0.03)` | `rgba(0,0,0,0.02)` | VPC / Subnet group background fill |
| **Boundary Border** | `#555555` (dashed) | `#999999` (dashed) | Group container boundary line |
| **Accent Primary** | `#007acc` | `#0066b8` | Primary active tool / connection handle |
| **AI Modification Glow**| `rgba(59, 130, 246, 0.4)` | `rgba(37, 99, 235, 0.3)` | Flash animation highlight for AI edits |

---

# Typography

- **Font Family:** `var(--vscode-editor-font-family, 'JetBrains Mono', Inter, system-ui, sans-serif)`
- **Node Labels:** 13px, Medium (500), Monospace / Clean Sans
- **Connector / Edge Labels:** 11px, Regular (400), High contrast background pill for legibility
- **Group / Boundary Headers:** 12px, Bold (700), Uppercase letter-spacing

---

# Node Primitives & Shapes

```text
┌─────────────────────────┐      ┌─────────────────────────┐
│ [Icon] Service Label    │      │  /   Database Label  \  │
│                         │      │ |                     | │
└─────────────────────────┘      │  \___________________/  │
    Rectangle / Service               Cylinder / Database

┌─────────────────────────┐      ┌─────────────────────────┐
│ ║║║║ Queue Label        │      │ (⚡) Cache Label         │
└─────────────────────────┘      └─────────────────────────┘
     Queue Primitive                    Cache Primitive
```

---

# Icons & Infrastructure Primitives

Uses Lucide Icons mapped to core architectural primitive types:
- **API Gateway / Router:** `Network` / `GitFork`
- **Service / Microservice:** `Server` / `Cpu`
- **Database / Relational:** `Database`
- **NoSQL / Key-Value:** `Table`
- **Cache:** `Zap` / `HardDrive`
- **Queue / Event Bus:** `Layers` / `MessageSquare`
- **Client / User:** `User` / `Monitor`
- **Cloud / Boundary:** `Cloud` / `Box`

---

# Motion & Micro-Animations

- **Node Dragging:** Smooth 60 FPS transform updates with zero layout reflow.
- **Connection Snapping:** Magnetic snap-to-edge indicator when arrow tip gets within 12px of a target node boundary.
- **AI Modification Highlight:** Pulse glow animation (600ms transition) applied to nodes/edges added or updated by an AI agent turn.
- **Toast Notifications:** Slide-in from bottom-right (300ms cubic-bezier) for external file change alerts.

---

# Accessibility & Shortcuts

- **ARIA Support:** Canvas root exposed with `role="region" aria-label="System Design Diagram Canvas"`. Selected node attributes announced via live regions.
- **Keyboard Shortcuts:**
  - `V`: Pointer / Select tool
  - `S`: Draw Service Box
  - `D`: Draw Database Cylinder
  - `C`: Draw Cache Box
  - `Q`: Draw Queue Box
  - `A`: Arrow / Connector tool
  - `G`: Group selected nodes into Boundary
  - `Cmd/Ctrl + Z`: Undo
  - `Cmd/Ctrl + Shift + Z`: Redo
  - `Cmd/Ctrl + Shift + L`: Auto-apply graph layout
  - `Del / Backspace`: Delete selected node(s)/edge(s)

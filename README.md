# QuickDesign — System Design Canvas (VS Code Extension)

> Infinite canvas architecture diagram editor inside VS Code with local Model Context Protocol (MCP) AI agent collaboration.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![VS Code Extension](https://img.shields.io/badge/VS%20Code-v1.88%2B-007ACC.svg)
![Build Status](https://github.com/gufran21/QuickDesign/actions/workflows/ci.yml/badge.svg)

---

## 🚀 Overview

**QuickDesign** brings architecture diagramming directly into your code editor. It turns `.sysd` files into living, diffable, git-tracked architecture canvas documents that both **humans** and **AI coding agents** (Claude Code, Cursor, Codex) can read, mutate, and auto-layout in real time.

---

## ✨ Features

- **Infinite Visual Canvas:** Interactive React + tldraw canvas with system architecture primitives (Service, Database Cylinder, Cache, Queue, VPC Boundary Box).
- **Single Source of Truth:** `.sysd` formatted JSON files stored on disk. Fully diffable in Git PRs.
- **Model Context Protocol (MCP) Server:** Local MCP server exposing 9 diagram CRUD tools (`get_diagram_state`, `create_node`, `connect_nodes`, `apply_layout`, etc.).
- **Auto-Layout Engine:** Integrated Dagre graph algorithm for auto-arranging agent-generated diagrams cleanly (`left-to-right` or `top-to-bottom`).
- **Mermaid Export:** Instant conversion from `.sysd` JSON to standard Mermaid flowchart markdown.
- **File Sync & Reconciliation:** Real-time file watcher reconciliation with subtle VS Code toast alerts.

---

## 📦 Installation & Setup

### For Developers

```bash
# 1. Clone repository
git clone git@github.com:gufran21/QuickDesign.git
cd QuickDesign

# 2. Install dependencies
npm install

# 3. Run unit tests
npm run test

# 4. Compile Extension Host & Webview UI
npm run compile
```

---

## 🤖 MCP Agent Integration

To connect Claude Code or Cursor to QuickDesign MCP server, add the following to your agent configuration:

```json
{
  "mcpServers": {
    "quickdesign": {
      "command": "node",
      "args": ["/path/to/QuickDesign/dist/extension/extension.js"]
    }
  }
}
```

---

## 🤝 Contributing

We welcome contributions! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) guide before submitting pull requests.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

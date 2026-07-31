# Contributing to QuickDesign

Thank you for your interest in contributing to **QuickDesign (System Design Canvas)**!

To maintain codebase scalability, readability, and reliability, we strictly follow a standard enterprise development workflow.

---

## 🛠️ Development Workflow

1. **Never commit directly to `main`.** All work must be done on dedicated feature or fix branches and merged via Pull Requests.
2. **Branch Naming Rules:**
   - `feature/short-description` (e.g. `feature/custom-icons`)
   - `fix/issue-description` (e.g. `fix/watcher-race-condition`)
   - `chore/task-description` (e.g. `chore/bump-deps`)
   - `docs/doc-description` (e.g. `docs/update-mcp-guide`)
3. **Conventional Commit Standard:**
   - `feat: ...` for new features
   - `fix: ...` for bug fixes
   - `test: ...` for tests
   - `docs: ...` for documentation
   - `chore: ...` for build/tooling maintenance

---

## 🚦 Pull Request Process

1. Fork or clone the repository and create your branch from `main`.
2. Ensure code passes formatting, typechecking, and tests:
   ```bash
   npm run test      # Run Vitest test suite
   npm run compile   # Verify TypeScript & Vite bundling
   ```
3. Open a Pull Request on GitHub against the `main` branch.
4. All Pull Requests require **passing CI Status Checks** (`CI Workflow / build`) before merge.

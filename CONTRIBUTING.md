# Contributing to Rove

Thank you for your interest in contributing to **Rove**, an open-source project by **AshcrestHQ**!

Rove is an open-source file manager for Windows built with Electron, React, TypeScript, and Tailwind CSS. It combines thoughtful macOS-inspired navigation paradigms (Miller Columns, Quick Look, tags) with Ubuntu/GNOME-inspired window management and deep native Windows 10/11 filesystem integration.

---

## 🛠️ Prerequisites

Before you begin, ensure your development environment meets the following requirements:

- **Operating System:** Windows 10 (v1809+) or Windows 11 (x64)
- **Node.js:** 20.x or higher (Node 22 LTS recommended)
- **npm:** 10.x or higher
- **PowerShell:** 5.1 or PowerShell 7+ (standard on Windows)
- **Git:** 2.x+

---

## 🚀 Getting Started

1. **Clone the repository (once published to GitHub):**
   ```bash
   git clone https://github.com/AshcrestHQ/Rove.git
   cd Rove
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **(Optional) Generate branding assets:**
   If you modify brand vector artwork in `assets/branding/icon.svg`, regenerate the multi-resolution PNGs and `.ico` file:
   ```bash
   npm run icons
   ```

4. **Launch development environment:**
   - **Desktop Mode (Electron with live reload):**
     ```bash
     npm run electron:dev
     ```
   - **Browser Preview Mode (with in-memory simulated virtual filesystem):**
     ```bash
     npm run dev
     ```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite web development server with virtual filesystem sandbox. |
| `npm run electron:dev` | Launches Vite alongside Electron with live reloading. |
| `npm run build` | Runs TypeScript compilation (`tsc -b`) and bundles production assets with Vite. |
| `npm start` | Compiles production assets and launches the local Electron application. |
| `npm run dist:win` | Compiles the frontend and builds the NSIS Windows installer (`dist-electron/`). |
| `npm run pack` | Builds an unpacked directory of the application for inspection. |
| `npm run icons` | Generates multi-resolution PNGs and Windows `.ico` from `assets/branding/icon.svg`. |
| `npm run lint` | Runs linter checks across the codebase using `oxlint`. |
| `npm run preview` | Previews the production Vite build locally in a browser. |

---

## 🏗️ Architecture Overview

```
Rove/
├── electron/
│   ├── main.cjs            # Electron main process (lifecycle, IPC handlers, attrib detection, drives)
│   └── preload.cjs         # Context bridge exposing secure, typed window.roveAPI
├── src/
│   ├── components/         # Modular React components
│   │   ├── views/          # 4 view modes (ColumnsView, IconsView, ListView, GalleryView)
│   │   ├── FileIcon.tsx    # Multi-layered vector icons & category badges
│   │   ├── WindowControls.tsx # Ubuntu/GNOME-inspired window controls
│   │   ├── NameEntryModal.tsx # Validated dialog for file/folder creation
│   │   ├── QuickLookModal.tsx # Instant Spacebar file preview modal
│   │   ├── Toolbar.tsx     # Navigation, view modes, search, theme & hidden file toggles
│   │   └── Sidebar.tsx     # System places, logical drives, color tags
│   ├── services/
│   │   └── fileService.ts  # Typed filesystem service with Electron IPC & web fallback
│   ├── types/
│   │   └── finder.ts       # Shared TypeScript types and interfaces
│   ├── App.tsx             # Main application orchestrator and keyboard shortcut manager
│   └── index.css           # Tailwind CSS v4 design system with custom dark mode variants
├── assets/branding/        # Official Rove brand marks (SVG, PNG, ICO)
└── %USERPROFILE%\.rove\    # Persisted settings (settings.json) and file tags (tags.json)
```

---

## 📋 Contribution Guidelines

### 1. Filesystem & IPC Security
- **No Command String Interpolation:** Never interpolate user-controlled paths directly into command strings. When calling external processes (such as PowerShell for Recycle Bin operations), pass paths safely via environment variables (e.g. `ROVE_TARGET_ITEM`) or parameterized arguments.
- **Strict Input Validation:** All IPC handlers must validate inputs, normalize and resolve paths with `path.resolve()`, and reject path traversal attempts.
- **Windows Naming Compliance:** When modifying file or folder creation logic, enforce Windows naming rules (disallowing illegal characters `\/:*?"<>|`, control characters, trailing spaces/periods, and reserved DOS names like `CON`, `PRN`, `AUX`, `NUL`, etc.).
- **Preserve Security Context:** Maintain `contextIsolation: true`, `nodeIntegration: false`, and `webSecurity: true` in Electron configuration.

### 2. Data Integrity & Persistence
- User settings and tags are persisted in `%USERPROFILE%\.rove\`. Always ensure backwards-compatible handling and avoid race conditions when writing settings.
- Never write temporary build artifacts, credentials, or personal files to the repository tree.

### 3. User Experience & Design Ethos
- Maintain the clean, focused interface inspired by macOS navigation and Ubuntu/GNOME window controls.
- Ensure all keyboard shortcuts continue to work reliably (`Space`, `Enter`, `Backspace`, `Ctrl+T`, `Ctrl+W`, `Ctrl+Shift+N`, `Ctrl+I`, `F2`, `Delete`, `Escape`).
- Preserve dark mode compatibility across all new components and views.

### 4. Pull Request Checklist
Before submitting a pull request:
- [ ] Run `npm run lint` and verify zero errors.
- [ ] Run `npm run build` and ensure TypeScript and Vite build cleanly.
- [ ] Test your changes directly on Windows in `npm run electron:dev`.
- [ ] Ensure any newly added shortcuts or configurations are documented.
- [ ] Include a clear description of the bug or feature and testing steps in your PR.

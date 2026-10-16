# Security Policy

**AshcrestHQ** is committed to the security and integrity of **Rove**. As a desktop application interacting directly with the Windows filesystem, maintaining strict isolation and preventing local privilege escalations, path traversals, or command injections is a primary architecture goal.

---

## Supported Versions

| Version | Supported |
| :--- | :--- |
| `0.1.x` | ✅ Active security support |
| `< 0.1.0` | ❌ Unsupported |

---

## Reporting a Vulnerability

If you discover a security vulnerability in Rove, please disclose it responsibly:

1. **Do not open a public issue.** Public issue trackers are not suitable for disclosing unpatched vulnerabilities.
2. **Coordinated Disclosure:**
   - **Once the repository is published on GitHub:** The maintainers intend to enable **GitHub Private Vulnerability Reporting**. Once configured on the repository, you can submit confidential reports directly by navigating to the **Security** tab of [`AshcrestHQ/Rove`](https://github.com/AshcrestHQ/Rove), selecting **Advisories**, and clicking **"Report a vulnerability"**.
   - **Prior to repository publication or if Private Vulnerability Reporting is unavailable:** Please contact the AshcrestHQ organization maintainers via their official GitHub organization profile at [github.com/AshcrestHQ](https://github.com/AshcrestHQ) to request a secure private communication channel before sharing details.
3. **Information to Include:**
   - Operating system and Windows build version (e.g. Windows 11 23H2 x64).
   - Version of Rove installed (e.g. `0.1.0-alpha.1`).
   - Vulnerability classification (e.g. IPC privilege escalation, command injection, path traversal, unauthorized filesystem modification).
   - Clear step-by-step reproduction instructions, including proof-of-concept scripts or logs where appropriate.
   - Potential impact and threat model considerations.

The maintainers will review the submission, verify the findings, and coordinate a fix and release in a timely manner.

---

## Security Architecture & Best Practices

Rove adheres to Chromium and Electron security best practices:

- **Context Isolation:** Enabled (`contextIsolation: true`) in all BrowserWindow configurations.
- **Node Integration Disabled:** Renderers execute in a sandboxed web context (`nodeIntegration: false`).
- **Sandboxed IPC:** The renderer communicates solely through explicit, strictly typed channels exposed in `preload.cjs` via `contextBridge`.
- **Command Injection Protection:** Windows filesystem operations invoking shell utilities (such as PowerShell for Recycle Bin operations) never concatenate user-controlled paths into shell command strings. File paths are passed safely via dedicated environment variables (e.g. `ROVE_TARGET_ITEM`).
- **Filesystem Sanitization:** All IPC paths are resolved and normalized via `path.resolve()`. File creation enforces Windows naming rules, rejecting control characters, traversal markers, and reserved device names.
- **Navigation Lockdown:** Unauthorized in-app navigations are prevented, and external web links (`http://` / `https://`) are delegated directly to the user's default system browser via Electron's `shell.openExternal`.

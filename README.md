# PPHLX Language Service (VS Code Extension)

<br/>
<p align="center">
  <img src="https://raw.githubusercontent.com/pphlx/vscode/main/.github/assets/banner.webp" alt="Bring Your Own UI Framework">
  <br/><br/>
  <a href="https://pphlx.org">PPHLX</a> is the high-performance monolithic compiler for modern PHP web applications.
  <br/>
  Build component-driven PHP apps with React, Vue, Svelte, or pure PHP templates — with zero Node.js runtime in production.
  <br/><br/>
</p>

Official Visual Studio Code extension for **PPHLX**. Provides native language support, syntax highlighting, bracket matching, and auto-completion for `.pphx` template files.

---

## Features

This extension provides a rich editing experience for PPHLX templates, including:

### 🎨 Syntax Highlighting
*   **Brace-Pipe Scopes**: Full context-aware highlighting for logical statements `{| ... |}` and echo values `{|= ... |}`.
*   **Embedded Languages**: Seamless color-coding token injection for HTML5, PHP, CSS, and client-side JavaScript.
*   **Directive Recognition**: Highlights custom imports like `@import Layout from '...'` natively.

### ✍️ Intelligent Editing & Auto-Closing Pairs
*   **Brace-Pipe Auto-Close**: Type `{|` or `{|=` and the editor will automatically insert the matching closing delimiter ` |}` and center your cursor.
*   **Workspace Integration**: Automatically maps any `.pphx` files in your workspace with the PPHLX language identifier and custom file icons.

---

## Installation

### From VSIX Package (Manual Build)
Download the `.vsix` file for the release that you want to install from the [GitHub Releases tab](https://github.com/pphlx/vscode/releases).

1. Open Visual Studio Code.
2. Go to the Extensions tab (`Ctrl+Shift+X` / `Cmd+Shift+X`).
3. Click the `...` menu in the upper right corner of the Extensions tab.
4. Select **Install from VSIX...** and select the `.vsix` file you just downloaded.

The extension can also be installed with the following command line:
```bash
code --install-extension /path/to/pphlx-1.0.6.vsix
```

---

## Configuring Workspace Options
To ensure auto-complete and bracket closing work flawlessly, make sure your editor's auto-closing brackets setting is enabled. In your `.vscode/settings.json`, add:

```json
{
  "editor.autoClosingBrackets": "always"
}
```

### Manual Language Association
If a `.pphx` file does not open with PPHLX highlighting automatically:
1. Click the Language Selector in the bottom-right status bar.
2. Select **Configure File Association for '.pphx'...**
3. Choose **PPHLX** from the list.

---

## Versioning
This language service extension is version-matched with the core PPHLX compiler suite. It is recommended to use matching versions of the composer package and the vscode extension to prevent any syntax mismatches.

# Changelog

All notable changes to the PPHLX Visual Studio Code extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-07-27

### Added
- **VS Code for Web (`vscode.dev`) Platform Support**: Declared `"browser": "./extension.js"` and `"extensionKind": ["ui", "workspace", "web"]`, enabling native installation across both VS Code Desktop and VS Code Web environments.
- **Self-Contained PHP TextMate Grammar**: Bundled standalone PHP TextMate grammar (`syntaxes/php.tmLanguage.json`) and removed external `vscode.php` dependency, providing complete PHP syntax highlighting across all Web and Desktop platforms.

---

## [1.1.0] - 2026-07-27

### Added
- **Instant Tokenized `@import` Highlighting**: Tokenized `@import Component from 'path'` directive grammar so `@import` keywords highlight immediately on the very first typed character.
- **Custom Component Tag Highlighting (`<Layout>`, `<Head/>`)**: Mapped capitalized custom component tags (`<Layout>`, `<Head/>`, `<FeedbackCard/>`) to `entity.name.type.class` TextMate scopes for standard component-driven token coloring.
- **Self-Closing Tag Slash (`/>`) Punctuation Fix**: Mapped self-closing component tag slash `/` to `punctuation.definition.tag.end.pphx`, resolving red error highlights on `<Head/>` tags.
- **Recursive Component Definition Provider**: `Ctrl+Click` / `F12` "Go to Definition" recursively traverses `@import` component trees (e.g. `Page` ➔ `Layout` ➔ `Head`).
- **Component Hover Previews**: Hovering over `<Head/>` or `<Layout>` renders interactive Markdown preview tooltips with source path links.
- **Expression Interpolation Highlighting (`{$var}`)**: Added syntax grammar rules for single-brace PHP expression interpolations (e.g. `{$imageUrl}`, `{$badgeText}`, `{$initialStars}`), highlighting outer braces in punctuation scopes and inner PHP variables in yellow/cyan.
- **Island Hydration Directive Highlighting**: Added keyword token highlighting for island directives (`client:load`, `client:visible`, `client:idle`, `client:only`).
- **Slot Placeholder Highlighting**: Added distinct syntax token scopes for `{{slot}}` template placeholders.

---

## [1.0.9] - 2026-07-25

### Added
- **Dedicated `.pphlxignore` Language Support**: Registered `.pphlxignore` as a dedicated language (`pphlxignore`) with official PPHLX file tree icon branding and native `source.ignore` TextMate grammar highlighting.

---

## [1.0.8] - 2026-07-25

### Fixed
- **CDN Raw WebP Banner Asset**: Switched README banner image to raw GitHub HTTPS CDN URL (`https://raw.githubusercontent.com/pphlx/vscode/main/.github/assets/banner.webp`) for seamless rendering across both local VS Code extension webviews and the Web Marketplace.

---

## [1.0.7] - 2026-07-25

### Fixed
- **Extension Marketplace Banner**: Updated README banner asset path (`logo/banner.webp`) to ensure proper rendering on VS Code Extension Marketplace.

---

## [1.0.6] - 2026-07-25

### Added
- **`Ctrl+Click` Component Navigation ("Go to Definition")**: Instant jump to target `.pphx` component files when holding `Ctrl` and clicking on `<Navbar />`, `<Hero />`, `<Footer />`, or `<Layout />` tags.
- **Clickable Hyperlinks for `@import`**: Added `DocumentLinkProvider` for `@import Component from './components/Component.pphx'` relative file paths.

---

## [1.0.5] - 2026-07-17

### Changed
- Bumped version to synchronize extension with PPHLX Core Compiler v1.0.5.

---

## [1.0.4] - 2026-07-15

### Changed
- Bumped version to synchronize extension with PPHLX Core Compiler v1.0.4.

---

## [1.0.1] - 2026-07-14

### Added
- Added custom light and dark mode file icon definitions (`./logo/file-icon.svg`) to enhance workspace UI.

### Fixed
- Fixed auto-closing pairs behavior for brace-pipe delimiters (`{|` and `{|=`), preventing unnecessary trailing spaces.
- Improved TextMate grammar scope resolutions for embedded CSS and JS blocks inside template islands.
- Resolved bracket matching conflicts when nested under complex nested conditions.

---

## [1.0.0] - 2026-02-18

### Added
- Initial Release of official PPHLX Extension support for VS Code.
- Native TextMate grammar parser (`pphlx.tmLanguage.json`) for custom `.pphx` template structures.
- Support for brace-pipe delimiters: logical scopes `{| ... |}` and echo scopes `{|= ... |}`.
- Intelligent brace completion configurations (`language-configuration.json`).
- Automatically maps `.pphx` file extensions with the custom PPHLX language identifier.

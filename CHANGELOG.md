# Changelog

All notable changes to the PPHLX Visual Studio Code extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

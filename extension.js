const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

/**
 * Helper to recursively resolve imported component files
 */
function resolveImportPath(document, relPath) {
	const currentDir = path.dirname(document.fileName);
	let targetPath = path.resolve(currentDir, relPath);

	if (fs.existsSync(targetPath)) {
		return targetPath;
	}

	// Try resolving relative to src/ directory
	const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
	if (workspaceFolder) {
		const srcPath = path.resolve(workspaceFolder.uri.fsPath, 'src', relPath);
		if (fs.existsSync(srcPath)) {
			return srcPath;
		}
	}
	return null;
}

/**
 * Recursively find component definition by component name down the import graph
 */
function findComponentDefinition(document, compName, visited = new Set()) {
	if (visited.has(document.fileName)) {
		return null;
	}
	visited.add(document.fileName);

	const text = document.getText();
	const importRegex = new RegExp(`@import\\s+${compName}\\s+from\\s+['"]([^'"]+)['"]`, 'm');
	const match = importRegex.exec(text);

	if (match && match[1]) {
		const targetPath = resolveImportPath(document, match[1]);
		if (targetPath) {
			return targetPath;
		}
	}

	// Scan imported components in current file recursively
	const globalImportRegex = /@import\s+([A-Za-z0-9_]+)\s+from\s+['"]([^'"]+)['"]/g;
	let impMatch;
	while ((impMatch = globalImportRegex.exec(text)) !== null) {
		const childPath = resolveImportPath(document, impMatch[2]);
		if (childPath && !visited.has(childPath)) {
			try {
				const childContent = fs.readFileSync(childPath, 'utf8');
				const dummyDoc = {
					fileName: childPath,
					getText: () => childContent,
					uri: vscode.Uri.file(childPath)
				};
				const res = findComponentDefinition(dummyDoc, compName, visited);
				if (res) {
					return res;
				}
			} catch (e) {}
		}
	}

	return null;
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// 1. Clickable Hyperlinks for @import paths (both single and double quotes)
	context.subscriptions.push(
		vscode.languages.registerDocumentLinkProvider({ language: 'pphx' }, {
			provideDocumentLinks(document) {
				const links = [];
				const text = document.getText();
				const importRegex = /@import\s+([A-Za-z0-9_]+)\s+from\s+['"]([^'"]+)['"]/g;
				let match;

				while ((match = importRegex.exec(text)) !== null) {
					const relPath = match[2];
					const relPathOffset = match.index + match[0].indexOf(relPath);
					const startPos = document.positionAt(relPathOffset);
					const endPos = document.positionAt(relPathOffset + relPath.length);

					const targetPath = resolveImportPath(document, relPath);
					if (targetPath) {
						links.push(new vscode.DocumentLink(new vscode.Range(startPos, endPos), vscode.Uri.file(targetPath)));
					}
				}

				return links;
			}
		})
	);

	// 2. Recursive Ctrl+Click "Go to Definition" for Component Tags & Imports
	context.subscriptions.push(
		vscode.languages.registerDefinitionProvider({ language: 'pphx' }, {
			provideDefinition(document, position) {
				const wordRange = document.getWordRangeAtPosition(position, /<\/?[A-Z][A-Za-z0-9_.]*/);
				if (!wordRange) {
					return null;
				}

				let componentName = document.getText(wordRange);
				componentName = componentName.replace(/^<\/?/, '');
				if (!componentName) {
					return null;
				}

				const targetPath = findComponentDefinition(document, componentName);
				if (targetPath) {
					return new vscode.Location(vscode.Uri.file(targetPath), new vscode.Position(0, 0));
				}

				return null;
			}
		})
	);

	// 3. Hover Provider for PPHLX Components
	context.subscriptions.push(
		vscode.languages.registerHoverProvider({ language: 'pphx' }, {
			provideHover(document, position) {
				const wordRange = document.getWordRangeAtPosition(position, /<\/?[A-Z][A-Za-z0-9_.]*/);
				if (!wordRange) {
					return null;
				}

				let componentName = document.getText(wordRange);
				componentName = componentName.replace(/^<\/?/, '');
				if (!componentName) {
					return null;
				}

				const targetPath = findComponentDefinition(document, componentName);
				if (targetPath) {
					const relName = path.basename(targetPath);
					const md = new vscode.MarkdownString();
					md.appendMarkdown(`**PPHLX Component**: \`<${componentName}/>\`\n\n`);
					md.appendMarkdown(`*Source File*: [${relName}](${vscode.Uri.file(targetPath)})\n\n`);
					md.appendMarkdown(`\`${targetPath}\``);
					return new vscode.Hover(md, wordRange);
				}

				return null;
			}
		})
	);

	// 4. Auto-Completion Provider for Imported Components
	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider({ language: 'pphx' }, {
			provideCompletionItems(document, position) {
				const linePrefix = document.lineAt(position).text.substring(0, position.character);
				if (!linePrefix.endsWith('<')) {
					return undefined;
				}

				const text = document.getText();
				const importRegex = /@import\s+([A-Za-z0-9_]+)\s+from\s+['"]([^'"]+)['"]/g;
				const completions = [];
				let match;

				while ((match = importRegex.exec(text)) !== null) {
					const compName = match[1];
					const compPath = match[2];

					const item = new vscode.CompletionItem(compName, vscode.CompletionItemKind.Class);
					item.detail = `PPHLX Component from ${compPath}`;
					item.insertText = new vscode.SnippetString(`${compName} />$0`);
					completions.push(item);
				}

				return completions;
			},
			triggerCharacters: ['<']
		})
	);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
};

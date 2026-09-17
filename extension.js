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
 * Resolves the relative path to an existing or expected component file
 */
function getCandidateRelativePath(document, compName) {
	const currentDir = path.dirname(document.fileName);
	const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);

	if (workspaceFolder) {
		const wsRoot = workspaceFolder.uri.fsPath;
		const potentialPaths = [
			path.join(currentDir, `${compName}.pphx`),
			path.join(currentDir, 'components', `${compName}.pphx`),
			path.join(wsRoot, 'src', 'components', `${compName}.pphx`),
			path.join(wsRoot, 'components', `${compName}.pphx`),
			path.join(wsRoot, 'src', `${compName}.pphx`)
		];
		for (const p of potentialPaths) {
			if (fs.existsSync(p)) {
				let rel = path.relative(currentDir, p).replace(/\\/g, '/');
				if (!rel.startsWith('.')) {
					rel = './' + rel;
				}
				return rel;
			}
		}
	}

	return `../components/${compName}.pphx`;
}

/**
 * Determines the line position where a new @import should be inserted
 */
function getImportInsertionPosition(document) {
	const text = document.getText();
	const lines = text.split(/\r?\n/);
	let insertLine = 0;
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].trim().startsWith('@import')) {
			insertLine = i + 1;
		} else if (lines[i].trim() !== '' && insertLine > 0) {
			break;
		}
	}
	return new vscode.Position(insertLine, 0);
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

	// 4. Auto-Completion Provider for Components (Imported & Workspace Auto-Import)
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
				const importedComponents = new Set();
				let match;

				while ((match = importRegex.exec(text)) !== null) {
					const compName = match[1];
					const compPath = match[2];
					importedComponents.add(compName);

					const item = new vscode.CompletionItem(compName, vscode.CompletionItemKind.Class);
					item.detail = `PPHLX Component from ${compPath}`;
					item.insertText = new vscode.SnippetString(`${compName} />$0`);
					completions.push(item);
				}

				// Find unimported components in workspace to provide auto-import completions
				const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
				if (workspaceFolder) {
					const candidateDirs = [
						path.join(workspaceFolder.uri.fsPath, 'src', 'components'),
						path.join(workspaceFolder.uri.fsPath, 'components'),
						path.join(path.dirname(document.fileName), 'components')
					];
					for (const dir of candidateDirs) {
						if (fs.existsSync(dir)) {
							try {
								const files = fs.readdirSync(dir);
								for (const file of files) {
									if (file.endsWith('.pphx')) {
										const compName = path.basename(file, '.pphx');
										if (!importedComponents.has(compName)) {
											importedComponents.add(compName);
											const fullPath = path.join(dir, file);
											let relPath = path.relative(path.dirname(document.fileName), fullPath).replace(/\\/g, '/');
											if (!relPath.startsWith('.')) {
												relPath = './' + relPath;
											}

											const item = new vscode.CompletionItem(compName, vscode.CompletionItemKind.Class);
											item.detail = `Auto-import from ${relPath}`;
											item.insertText = new vscode.SnippetString(`${compName} />$0`);
											const insertPos = getImportInsertionPosition(document);
											item.additionalTextEdits = [
												vscode.TextEdit.insert(insertPos, `@import ${compName} from "${relPath}"\n`)
											];
											completions.push(item);
										}
									}
								}
							} catch (e) {}
						}
					}
				}

				return completions;
			},
			triggerCharacters: ['<']
		})
	);

	// 5. Snippet / Directive Completion for @import
	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider({ language: 'pphx' }, {
			provideCompletionItems(document, position) {
				const line = document.lineAt(position).text;
				const linePrefix = line.substring(0, position.character);
				if (linePrefix.trimStart().startsWith('@') || linePrefix.trimStart().startsWith('imp')) {
					const item = new vscode.CompletionItem('@import', vscode.CompletionItemKind.Snippet);
					item.detail = 'PPHLX Component Import Directive';
					item.insertText = new vscode.SnippetString('@import ${1:Component} from "${2:../components/${1:Component}.pphx}"\n');
					item.documentation = new vscode.MarkdownString('Import a PPHLX component without a trailing semicolon.');
					return [item];
				}
				return undefined;
			},
			triggerCharacters: ['@', 'i']
		})
	);

	// 6. Unresolved Component Token Diagnostic Engine & Auto-Import Quick Fix Action
	const diagnosticCollection = vscode.languages.createDiagnosticCollection('pphlx');
	context.subscriptions.push(diagnosticCollection);

	function updateDiagnostics(document) {
		if (document.languageId !== 'pphx') return;
		const diagnostics = [];
		const text = document.getText();

		// Collect all imported component names in document scope
		const importedComponents = new Set();
		const importRegex = /@import\s+([A-Za-z0-9_]+)\s+from\s+['"]([^'"]+)['"]/g;
		let impMatch;
		while ((impMatch = importRegex.exec(text)) !== null) {
			importedComponents.add(impMatch[1]);
		}

		// Find component tags (PascalCase e.g. <Head />, <Card>)
		const componentTagRegex = /<([A-Z][A-Za-z0-9_]*)\b[^>]*\/?>/g;
		let tagMatch;
		while ((tagMatch = componentTagRegex.exec(text)) !== null) {
			const compName = tagMatch[1];
			// Ignore standard HTML or non-custom tags
			if (!importedComponents.has(compName)) {
				const startPos = document.positionAt(tagMatch.index + 1);
				const endPos = document.positionAt(tagMatch.index + 1 + compName.length);
				const range = new vscode.Range(startPos, endPos);

				const diagnostic = new vscode.Diagnostic(
					range,
					`UnresolvedComponentToken: Component <${compName} /> is used but not imported. Add '@import ${compName} from "..."'`,
					vscode.DiagnosticSeverity.Error
				);
				diagnostic.code = 'UnresolvedComponentToken';
				diagnostic.source = 'pphlx';
				diagnostics.push(diagnostic);
			}
		}

		diagnosticCollection.set(document.uri, diagnostics);
	}

	// Run diagnostics on open, change, and save events
	if (vscode.window.activeTextEditor) {
		updateDiagnostics(vscode.window.activeTextEditor.document);
	}
	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument(updateDiagnostics),
		vscode.workspace.onDidChangeTextDocument(e => updateDiagnostics(e.document)),
		vscode.workspace.onDidSaveTextDocument(updateDiagnostics)
	);

	// Register Quick Fix Code Action for Auto-Importing Unresolved Component Tokens
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider({ language: 'pphx' }, {
			provideCodeActions(document, range, context) {
				const actions = [];
				for (const diagnostic of context.diagnostics) {
					if (diagnostic.code === 'UnresolvedComponentToken') {
						const match = diagnostic.message.match(/Component <([A-Za-z0-9_]+) \/>/);
						if (match) {
							const compName = match[1];
							const candidateRelPath = getCandidateRelativePath(document, compName);

							const action = new vscode.CodeAction(
								`Add '@import ${compName} from "${candidateRelPath}"'`,
								vscode.CodeActionKind.QuickFix
							);
							action.isPreferred = true;
							action.diagnostics = [diagnostic];

							const edit = new vscode.WorkspaceEdit();
							const importLine = `@import ${compName} from "${candidateRelPath}"\n`;
							const insertPos = getImportInsertionPosition(document);
							edit.insert(document.uri, insertPos, importLine);
							action.edit = edit;

							actions.push(action);
						}
					}
				}
				return actions;
			}
		})
	);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
};

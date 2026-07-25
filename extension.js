const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // 1. Clickable Hyperlinks for @import paths
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

                    const targetPath = path.resolve(path.dirname(document.fileName), relPath);
                    const targetUri = vscode.Uri.file(targetPath);

                    links.push(new vscode.DocumentLink(new vscode.Range(startPos, endPos), targetUri));
                }

                return links;
            }
        })
    );

    // 2. Ctrl+Click "Go to Definition" on Component tags & Imports
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider({ language: 'pphx' }, {
            provideDefinition(document, position) {
                // Get word or component tag under cursor
                const wordRange = document.getWordRangeAtPosition(position, /<\/?[A-Z][A-Za-z0-9_]*/);
                if (!wordRange) {
                    return null;
                }

                let componentName = document.getText(wordRange);
                // Strip leading '<' or '</'
                componentName = componentName.replace(/^<\/?/, '');

                if (!componentName) {
                    return null;
                }

                // Look for matching @import statement in the document
                const text = document.getText();
                const importRegex = new RegExp(`@import\\s+${componentName}\\s+from\\s+['"]([^'"]+)['"]`, 'm');
                const match = importRegex.exec(text);

                if (match && match[1]) {
                    const relPath = match[1];
                    const targetPath = path.resolve(path.dirname(document.fileName), relPath);

                    if (fs.existsSync(targetPath)) {
                        const targetUri = vscode.Uri.file(targetPath);
                        return new vscode.Location(targetUri, new vscode.Position(0, 0));
                    }
                }

                return null;
            }
        })
    );
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};

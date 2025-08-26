const vscode = require('vscode');

// Define your wrappers here
const wrappers = {
    "code": { open: "<code>", close: "</code>" },
    "pre": { open: "<pre>", close: "</pre>" },
    "b": { open: "<b>", close: "</b>" },
    "i": { open: "<i>", close: "</i>" },
    "u": { open: "<u>", close: "</u>" },
    "quote": { open: "\"", close: "\"" }
};

function activate(context) {
    for (const [name, wrapper] of Object.entries(wrappers)) {
        let disposable = vscode.commands.registerCommand(`toggle-wrap.${name}`, function () {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const { document, selections } = editor;

            // Check if all selections are empty (no text selected)
            const allEmpty = selections.every(sel => sel.isEmpty);
            if (allEmpty) {
                // Use snippet to insert wrappers and place cursor between them, tab to jump after
                const snippet = new vscode.SnippetString(`${wrapper.open}$1${wrapper.close}$0`);
                editor.insertSnippet(snippet, selections);
            } else {
                editor.edit(editBuilder => {
                    for (const sel of selections) {
                        let text = document.getText(sel);

                        if (text.startsWith(wrapper.open) && text.endsWith(wrapper.close)) {
                            // unwrap
                            text = text.slice(wrapper.open.length, -wrapper.close.length);
                        } else {
                            // wrap
                            text = `${wrapper.open}${text}${wrapper.close}`;
                        }

                        editBuilder.replace(sel, text);
                    }
                });
            }
        });

        context.subscriptions.push(disposable);
    }
}

function deactivate() {}

module.exports = { activate, deactivate };

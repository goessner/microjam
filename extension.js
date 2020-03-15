/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Stefan Goessner - 2020. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
'use strict';

const vscode = require('vscode');

// extension is activated ..
exports.activate = function activate(context) {
    let   mdit = null,               // markdown-it object ...  assign later ...
          tmpltDir = './tmplt',      // user config ...
          tmpltName = './std.js'; 

    const infoMsg = (msg) => {
            vscode.window.showInformationMessage(`microjam: ${msg}`);
        },
        errMsg = (msg) => {
            vscode.window.showErrorMessage(`microjam: ${msg}`);
        },
        saveAsHtml = () => {
            try {
                const doc = vscode.window.activeTextEditor
                            && vscode.window.activeTextEditor.document;

                if (!doc || doc.languageId !== 'markdown')
                    return errMsg('Active document is no markdown source document!');

                if (!mdit)
                    return infoMsg('Corresponding markdown preview document needs to be opened at least once!');

                const fs = require('fs'),
                    path = require('path'),
                    uri = doc && doc.uri,
                    parsed = path.parse(uri.fsPath),
                    savepath = path.resolve(parsed.dir, `./${parsed.name}.html`),
                    template = require(path.resolve(parsed.dir,'../tmplt/std.js')).template,
                    content = mdit.render(doc.getText()),
                    html = template({content});
log(content);
                fs.writeFileSync(savepath, html, 'utf8');
                infoMsg(`Html saved to ${savepath} !`);
            } catch (err) {
                errMsg('Saving html failed: ' + err.message);
            }
        };
    
    context.subscriptions.push(vscode.commands.registerCommand('extension.saveAsHtml', saveAsHtml));
log('#')

    return {
        extendMarkdownIt: (md) => {
            return (mdit = md);
        }
    }
}
// this method is called when extension is deactivated ..
exports.deactivate = function deactivate() {};

/*
			"./bin/g2.js",
			"./bin/g2.selector.js",
			"./bin/g2.element.js",
			"./bin/canvasInteractor.js"
*/
/*
const htmlTmpl = (html) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/3.0.1/github-markdown.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.13.1/highlight.min.js">
</head><body class="markdown-body">
${html}
</body></html>`;
*/
function log(arg) {
    if (!log.outchannel) {
        log.outchannel = vscode.window.createOutputChannel('log');
        log.outchannel.show(true);
    }
//    log.outchannel.appendLine(arg);
    log.outchannel.appendLine(JSON.stringify(arg));
}

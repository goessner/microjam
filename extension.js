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

    const kt = require('katex'),
        tm = require('markdown-it-texmath').use(kt),
        infoMsg = (msg) => {
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
                    template = require(path.resolve(parsed.dir,'./style/template.js')).template,
                    content = mdit.render(doc.getText()),
                    html = template({content});
//log(content);
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
            return (mdit = md).use(tm);
        }
    }
}
// this method is called when extension is deactivated ..
exports.deactivate = function deactivate() {};

function log(arg) {
    if (!log.outchannel) {
        log.outchannel = vscode.window.createOutputChannel('log');
        log.outchannel.show(true);
    }
    log.outchannel.appendLine(JSON.stringify(arg));
}

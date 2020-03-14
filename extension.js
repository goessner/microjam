/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Stefan Goessner - 2020. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

const vscode = require('vscode');

function log(arg) {
    if (!log.outchannel) {
        log.outchannel = vscode.window.createOutputChannel('log');
        log.outchannel.show(true);
    }
    log.outchannel.appendLine(JSON.stringify(arg));
}

// this method is called when extension is activated ..
exports.activate = function activate(context) {
    const infoMsg = (msg) => {
              vscode.window.showInformationMessage(`microjam: ${msg}`);
          },
          errMsg = (msg) => {
              vscode.window.showErrorMessage(`microjam: ${msg}`);
          },
          asHtml = () => {
                const doc = vscode.window.activeTextEditor
                         && vscode.window.activeTextEditor.document;

                vscode.commands.executeCommand('markdown.api.render', doc)
                      .then(res => { console.log(`rendered markdown: ${res}`) });
          },
          saveAsHtml = () => {
                const doc = vscode.window.activeTextEditor
                         && vscode.window.activeTextEditor.document;

                vscode.commands.executeCommand('markdown.api.render', doc)
                      .then(res => { console.log(`rendered markdown: ${res}`) });
          },
          save = () => {
                try {
                    const doc = vscode.window.activeTextEditor
                             && vscode.window.activeTextEditor.document;

                    if (!doc || doc.languageId !== 'markdown')
                        return errMsg('Active document is no markdown source document!');

                    vscode.commands.executeCommand('markdown.api.render', doc).then(html => {
                        const fs = require('fs'),
                              path = require('path'),
                              uri = doc && doc.uri,
                              parsed = path.parse(uri.fsPath),
                              savepath = path.resolve(parsed.dir, `./${parsed.name}.html`);

                        fs.writeFileSync(savepath, html, 'utf8');
                        infoMsg(`Html saved to ${savepath} !`);
                    });
                } catch (err) {
                    errMsg('Saving html failed: ' + err.message);
                }
          };
      context.subscriptions.push(vscode.commands.registerCommand('extension.saveAsHtml', save));
//    let outchannel;

//          log = arg => outchannel.appendLine(arg);

//    outchannel.show(true);
//    function log(arg) {
//        if (!outchannel) {
//           outchannel = vscode.window.createOutputChannel('log');
//           outchannel.show();
//        outchannel.appendLine(arg);
//    }

//        outchannel.appendLine('hi');
//        outchannel.show(true);
//        outchannel.appendLine('ho');

 log('hi');
 log('ho');
 log({ x: 5, y: 6 });
}
// this method is called when extension is deactivated ..
exports.deactivate = function deactivate() {};

/*
			"./bin/g2.js",
			"./bin/g2.selector.js",
			"./bin/g2.element.js",
			"./bin/canvasInteractor.js"
*/
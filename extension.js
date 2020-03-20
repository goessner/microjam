/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Stefan Goessner - 2020. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
'use strict';

const vscode = require('vscode'),
      fs = require('fs'),
      path = require('path');

// Static extension structue ...
const ext = {
    mdit: null,    // markdown-it object ... !
    cfg(key) { 
        return vscode.workspace.getConfiguration('microjam')[key];
    },
    infoMsg(msg) {
        vscode.window.showInformationMessage(`microjam: ${msg}`);
    },
    errMsg(msg) {
        vscode.window.showErrorMessage(`microjam: ${msg}`);
    },
    readFile(uri) { 
        return fs.readFileSync(uri,'utf8'); 
    },
    pageStructure(text) {
        const page = {layout:"page",title:"",date:"",description:"",tags:[],category:[]};
        if (text) {
            let frontmatter;
            page.content = text.replace(/^\s*?[{\-]{3}([\s\S]+?)[}\-.]{3}\s*?/g, ($0,$1) => { frontmatter = $1; return '';});
            page.content = ext.mdit.render(page.content);
            if (frontmatter) {
                try { 
                    frontmatter = JSON.parse(`{${frontmatter}}`);
                    Object.assign(page, frontmatter);
                    if (!["page","article","post","index"].includes(page.layout))
                       ext.errMsg(`'layout' type must be one of ["page","article","post","index"]!`);
                    else if (page.layout === 'index')
                       ; // page.articles = 
                }
                catch (err) { ext.errMsg(err.message); }
            }
        }
        return page;        
    },
    baseOfValidRepo(uri) {
        for (let base=path.parse(uri); base.root !== base.dir; base = path.parse(base.dir))
            if (   base.base === 'src' 
                && fs.existsSync(path.resolve(base.dir,'./package.json'))
                && !!JSON.parse(fs.readFileSync(path.resolve(base.dir,'./package.json'),'utf8')).microJam
            )
                return base.dir;
        return false;
    },
    validateRepo(basedir) {   // asume minimum-valid repo-directory ...
        let uri;
        if (!fs.existsSync(uri=path.resolve(basedir,'./src/index.json')))
            fs.writeFileSync(uri, '[]', 'utf8');
        if (!fs.existsSync(uri=path.resolve(basedir,'./src/template.js')))
            fs.writeFileSync(uri, ext.default.template, 'utf8');
        if (!fs.existsSync((uri=path.resolve(basedir,'./docs')))) {
            fs.mkdirSync(uri);
            fs.mkdirSync((uri=path.resolve(uri,'./css')));
            fs.writeFileSync(path.resolve(uri,'./styles.css'), ext.default.css, 'utf8');
        }
    },
/*
    baseUriFrom(uri) {  // implicitely assume 'src' directory exists ...
        for (uri=path.parse(uri); uri.root !== uri.dir; uri = path.parse(uri.dir))
            if (uri.base === 'src' || fs.existsSync(path.resolve(basedir,'./package.json')))
                return uri.dir;
        return false;
    },
*/
    updateIndexFile(indexuri,page) {
        const list = JSON.parse(fs.readFileSync(indexuri,'utf8'));
        let found = false;

        for (let i=0,n=list.length; i<n; i++) {
            if (found = (list[i].uri === page.uri))   // found ... 
                list.splice(i,1,page);                // substitute ...
            else if (!fs.existsSync(list[i].uri))     // file was removed ...
                list.splice(i,1);                     // remove ...
        }
        if (!found)                                   // new file ...
            list.push(page);                          // add ...

        fs.writeFileSync(indexuri, JSON.stringify(list), 'utf8');
    },
    saveAsHtml(uri) {                                // imply existing 'src' directory ...
        const doc = vscode.window.activeTextEditor   // doc.uri === uri (contents identical only ... not objects)
                 && vscode.window.activeTextEditor.document,
            validDoc = doc && doc.languageId === 'markdown',
            basedir = validDoc && ext.baseOfValidRepo(uri.fsPath);

        if (!validDoc)
            return ext.errMsg('Active document is no markdown source document!');
        else if (!basedir)
            return ext.errMsg('Active document is not a file of valid "microJam" repository!');
        else
            ext.validateRepo(basedir);

//        if (!ext.mdit)  // todo: test only for docs with math content necessary !
//            return ext.infoMsg('Corresponding markdown preview document needs to be opened at least once!');

        const page = ext.pageStructure(doc.getText()),
            filename = path.parse(uri.fsPath).name,
            outuri = path.resolve(basedir, `./docs/${filename}.html`),
            template = require(path.resolve(basedir, './src/template.js')).template,
            html = template(page)  // ... remove some vscode stuff ...
                       .replace(/\sclass=\"code-line\"/g,() => '')
                       .replace(/\sdata-line=\"[0-9]+\"/g,() => '');

        delete page.content;
        page.uri = uri.fsPath;

        if (page.layout === 'article' || page.layout === 'post')
            ext.updateIndexFile(path.resolve(basedir, './src/index.json'), page);

        try {
            fs.writeFileSync(outuri, html, 'utf8');
            ext.infoMsg(`Html saved to ${outuri} !`);
        } catch (e) {
            ext.errMsg('Saving html failed: ' + e.message);
        }
    }
}

// extension is activated ..
exports.activate = function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.saveAsHtml', ext.saveAsHtml));

    vscode.workspace.onDidSaveTextDocument((doc) => {
        if (doc === vscode.window.activeTextEditor.document && doc.languageId === 'markdown')
            ext.saveAsHtml(doc.uri);
    });

    return {
        extendMarkdownIt: (md) => {
            const kt = require('katex'),
                  tm = require('markdown-it-texmath').use(kt);
            return (ext.mdit = md).use(tm);
        }
    }
}
// extension is deactivated ..
exports.deactivate = function deactivate() {};

function log(arg) {
    if (!log.outchannel) {
        log.outchannel = vscode.window.createOutputChannel('log');
        log.outchannel.show(true);
    }
    log.outchannel.appendLine(arg);
//    log.outchannel.appendLine(JSON.stringify(arg));
}

ext.defaults = {
    template:`
exports.template = ({layout,title,category,content}) => 
\`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<title>\${title}</title>
<link rel="stylesheet" href="./css/styles.css">
<link href="https://fonts.googleapis.com/css?family=Roboto+Slab:700|Roboto&display=fallback" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.13.1/highlight.min.js">
\${category.includes("math") ? 
\`<link  rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.0/dist/katex.min.css" integrity="sha384-9eLZqc9ds8eNjO3TmqPeYcDj8n+Qfa4nuSiGYa6DjLNcv9BtN69ZIulL9+8CqC9Y" crossorigin="anonymous">
<link rel="stylesheet" href="https://gitcdn.xyz/repo/goessner/mdmath/master/css/texmath.css">\` : ''}
</head>
<body>
<header>
  <a href="./" class="link--home">My Site</a>
  <a href="./about" class="link--about">About</a>
</header>
<main>
\${layout !== "article" ? content : \`
  <article>
\${content}
  </article>\`}
</main>
<footer>&copy; My Site</footer>
</body>
\${category.includes("g2") ? \`<script src="https://cdn.jsdelivr.net/npm/microjam/dist/g2.html.js"></script>\` : ''}
</html>\`;`,

css: `* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  padding: 10px 8px;
  font-size: 19px;
  font-family: 'Roboto', sans-serif;
}

@media screen and (min-width: 768px) {
  body {
    max-width: 768px;
    margin: 0 auto;
  }
}

header {
  display: flex;
  align-items: center; /* Vertically align */
  padding: 5px 16px;
  color: white;
  background-color: #0747A6;
  border-radius: 8px;
}

header > a:link,
header > a:visited,
header > a:hover {
  color: white;
  text-decoration: none;
}

header > a:hover {
  text-decoration: underline;
}

.link--home {
  flex-grow: 1;
  font-size: 2em;
}

.link--about {
  flex-grow: 1;
  font-size: 1em;
  text-align: right;
}

main {
  padding: 5px 16px;
  word-wrap:break-word;
}

footer {
  padding: 35px 0 25px 0;
  text-align: center;
  font-size: 0.8em;
  color: #666666;
}

h1,
h2 {
  font-family: 'Roboto Slab', sans-serif;
  margin: 25px 0 2px 0;
}

h1 {
  font-size: 2em;
}

h1 > a:link,
h1 > a:visited {
  text-decoration: none;
}

h1 > a:hover {
  color: #20399daa;
  text-decoration: underline;
}

h2 {
  font-size: 1.5em;
}

a:link,
a:visited {
  color: #20399d;
}

a:hover {
  color: #20399daa;
}

time {
  color: #666666;
}

article img {
  width: 100%;
  height: auto;
}`
};

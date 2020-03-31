/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Stefan Goessner - 2020. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
'use strict';

const vscode = require('vscode'),
      fs = require('fs'),
      path = require('path');

// Static extension structure ...
const ext = {
    mdit: null,    // markdown-it object cached ... !
    cfg(key) { 
        return vscode.workspace.getConfiguration('microjam')[key];
    },
    infoMsg(msg) {
        vscode.window.showInformationMessage(`microjam: ${msg}`);
    },
    errMsg(msg) {
        vscode.window.showErrorMessage(`microjam: ${msg}`);
    },
    curDate() {
        const date = new Date();
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    },
    toHtml(md) {
        return ext.mdit.render(md) // ... remove some vscode stuff ...
                       .replace(/\sclass=\"code-line\"/g,() => '')
                       .replace(/\sdata-line=\"[0-9]+\"/g,() => '')
                       .replace(/<h([1-6])\sid=\".+\"/g,($0,$1) => `<h${$1}`);
    },
    onWillSaveTextDocument(obj) {    // lives until first call only ... doing some initializing stuff in future ...
/*
        const plugins = ext.cfg('markdownItPlugins');
        if (plugins)
            for (const plugin of plugins) {
                ext.mdit.use(require(plugin));
            }
*/
        ext.saveCurrentDocAsHtml(obj.document); 
        ext.onWillSaveTextDocument = function(obj) {    // substitute on first call ! 
             ext.saveCurrentDocAsHtml(obj.document);
        };
    },
    pageStructure(text,basedir) {
        const page = {layout:"page",title:"",date:"",description:"",tags:[],category:[]};
        if (text) {
            let frontmatter;

            page.content = text.replace(/^\s*?[{\-]{3}([\s\S]+?)[}\-.]{3}\s*?/g, ($0,$1) => { frontmatter = $1; return '';});

            if (frontmatter) {
                try { 
                    frontmatter = JSON.parse(`{${frontmatter}}`);
                    Object.assign(page, frontmatter);
                    if (!["page","article","post","index"].includes(page.layout))
                        ext.errMsg(`'layout' type must be one of ["page","article","post","index"]!`);
                    else if (page.layout === 'article') {
                        page.content.replace(/#{2}\s[Aa]bstract\s*([^#]+?)\s*?#/g, ($0,$1) => { page.abstract = $1; return '';});
                        if (page.abstract)
                            page.abstract = ext.toHtml(page.abstract);
                    }
                    else if (page.layout === 'index')
                        page.articles = JSON.parse(fs.readFileSync(path.resolve(basedir,'./src/pages.json'),'utf8'))
                                            .filter((e) => e.layout === 'article');
                }
                catch (err) {
                    const transform = (pos) => `in frontmatter: … ${frontmatter.substring(Math.max(0,pos-15),pos-1)}¿${frontmatter.substring(pos-1,Math.min(pos+15,frontmatter.length-1))} …`;
                    const errstr = err.message.replace(/in JSON at position (\d+)/, ($0,$1) => { return transform(+$1)});
                    ext.errMsg(errstr); 
                }
            }
            if (!page.description && page.title) page.description = page.title;
            page.content = ext.toHtml(page.content);
        }
        return page;        
    },
    baseOfValidRepo(uri) {
        for (let base=path.parse(uri); base.root !== base.dir; base = path.parse(base.dir)) {
            if (   base.base === 'src' 
                && fs.existsSync(path.resolve(base.dir,'./package.json'))
                && !!JSON.parse(fs.readFileSync(path.resolve(base.dir,'./package.json'),'utf8')).microjam
            ) {
                return base.dir;
            }
        }
        return false;
    },
    validateRepo(basedir) {   // assume minimum-valid repo-directory ...
        let uri;
        if (!fs.existsSync(uri=path.resolve(basedir,'./src/pages.json')))
            fs.writeFileSync(uri, '[]', 'utf8');
        if (!fs.existsSync(uri=path.resolve(basedir,'./src/template.js')))
            fs.writeFileSync(uri, ext.defaults.templates, 'utf8');
        if (!fs.existsSync((uri=path.resolve(basedir,'./docs')))) {
            fs.mkdirSync(uri);
            fs.mkdirSync((uri=path.resolve(uri,'./css')));
            fs.writeFileSync(path.resolve(uri,'./styles.css'), ext.defaults.css, 'utf8');
        }
    },
    updatePages(pagesdatauri, entry, basedir) {
        const list = JSON.parse(fs.readFileSync(pagesdatauri,'utf8'));
        let   found = false, dirtyindex = false;

        for (let i=0; i < list.length; i++) {
            if (!found && list[i].uri === entry.uri) {    // entry found in list ...
                list.splice(i,1,entry);             // ... so substitute ...
                found = true;
                dirtyindex = dirtyindex || entry.layout === 'article';
            }
            else if (!fs.existsSync(list[i].uri)) { // ... so remove potentially existing *.html file.
                const htmlpath = path.resolve(basedir,'./docs',list[i].reluri+'.html');
                if (fs.existsSync(htmlpath))
                    fs.unlinkSync(htmlpath);
                if (list[i].layout === 'article') dirtyindex = true;  // need to refresh index ...
                list.splice(i,1);                   // remove from list ...
            }
        }

        if (!found) {                               // is a new entry ...
            list.push(entry);                       // ... add it to list.
            dirtyindex = dirtyindex || entry.layout === 'article';
        }

        fs.writeFileSync(pagesdatauri, JSON.stringify(list), 'utf8');

        if (dirtyindex) {      // providently refresh `index.html` ...
            list.forEach((e) => { if (e.layout === 'index') ext.saveAsHtml(e.uri, basedir); } );
        }
    },
    saveAsHtml(fspath, basedir, mdtext) {       // imply existing 'src' directory ...
        if (!mdtext) mdtext = fs.readFileSync(fspath,'utf8');

        const page = ext.pageStructure(mdtext, basedir);
        const reluri = path.relative(path.resolve(basedir,'./src'), fspath).replace(/\.md/g,'');

        try {
            const template = require(path.resolve(basedir, './src/template.js'));
            const html = template[page.layout || 'page'](page);
            const outuri = path.resolve(basedir,'./docs',reluri+'.html');
            fs.writeFileSync(outuri, html, 'utf8');
            if (ext.cfg('showSaveMessage')) ext.infoMsg(`Html saved to ${outuri}`);
        } catch (e) {
            ext.errMsg('Saving html failed: ' + e.message);
        }

        delete page.content;
        delete page.articles;   // for layout:'index' pages only ...
        page.uri = fspath;
        page.reluri = reluri;

        ext.updatePages(path.resolve(basedir, './src/pages.json'), page, basedir);
    },
    saveCurrentDocAsHtml(doc) {
        doc = doc || vscode.window.activeTextEditor && vscode.window.activeTextEditor.document;
        if (doc && doc.languageId === 'markdown' && doc.isDirty) {
            const fspath = doc.uri.fsPath,
                  basedir = ext.baseOfValidRepo(fspath);

            if (!basedir)
                return;     // markdown file does not belong to a valid repo ... return silently ...
            else
                ext.validateRepo(basedir);

            ext.saveAsHtml(fspath, basedir, doc.getText());
        }
    }
}
// extension is activated ..
exports.activate = function activate(context) {
    // `onWillSaveTextDocument` shows us actual 'isDirty' flag in contrast to `onDidSaveTextDocument`. 
    vscode.workspace.onWillSaveTextDocument((obj) => ext.onWillSaveTextDocument(obj)); 

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
}

ext.defaults = {
    templates:
`const tmpl = module.exports = {
// base layout ... used by other templates
base(data) {
  return \`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1,user-scalable=no">
<meta name="description" content="\${data.description || (data.title + ' - microjam page')}">
\${data.date ? \`<meta name="date" content="\${new Date(data.date).toString()}">\` : ''}
\${data.tags ? \`<meta name="keywords" content="\${data.tags.join()}">\` : ''}
<title>\${data.title}</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/styles/github-gist.min.css">
<link  rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.0/dist/katex.min.css" integrity="sha384-9eLZqc9ds8eNjO3TmqPeYcDj8n+Qfa4nuSiGYa6DjLNcv9BtN69ZIulL9+8CqC9Y" crossorigin="anonymous">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/markdown-it-texmath/css/texmath.css">
<link rel="stylesheet" href="./css/styles.css">
</head>
<body>
<header>
  <a href="./index.html" class="left">My Site</a>
  <a href="./about.html" class="right">About</a>
</header>
<main>
\${data.content}
</main>
<footer>&copy; My Site</footer>
</body>
</html>\` 
},
// page layout ...
page(data) {
  return tmpl.base(data);
},
// article layout ...
article(data) {
  const articleContent = \`<article>
  \${data.content}
</article>\`;
  return tmpl.base(data);
},
// index layout ...
index(data) {
  data.content = \`<article>
\${data.content}
\${data.articles.sort((a,b)=> a.date < b.date ? 1 : -1)  // sort decending ..
               .map(tmpl.articleEntry).join('')}
</article>\`;
  return tmpl.base(data);
},

// article entry layout ... used for article list in index template
articleEntry(article) {
    return \`<hr>
\${tmpl.dateElement(article.date)}
<h3><a href="\${article.reluri+'.html'}">\${article.title}</a></h3>
\${article.abstract || article.description}\`;
},
// date element layout ... 
dateElement(date) {
  const d = new Date(date);
  return \`<time datetime="\${d}">\${d.toString().substr(4,3)} \${d.getDate()}, \${d.getFullYear()}</time>\`;
}

}
`,

css: `@media screen {
body {
  margin: 0;
  padding: 10px 8px;
  font-size: 12pt;
  font-family: Helvetica, Arial, Geneva, sans-serif;
}
@media screen and (min-width: 768px) {
  body {
    max-width: 768px;
    margin: 0 auto;
  }
}

header {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  align-items: center;  /* vertical align */
  justify-items: stretch;
  padding: 5px 16px;
  color: white;
  background-color: darkslategray;
  border-radius: 10px;
}
header > a {
  color: white;
  text-decoration: none;
}
header > a:hover {
  color: #aaa;
}
header > .left {
  text-align: left;
  font-size: 2em;
}
header > .right {
  text-align: right;
}
main {
  padding: 5px 16px;
  word-wrap: break-word;
}
time {
  color: #666;
}

table {
    display: table;
    width: auto;
    margin-left: auto;
    margin-right: auto; 
    border-collapse: collapse;
}
table th, table td {
    border-left: none;
    border-right: none;
    border-top: 1px solid #000;
    border-bottom: 1px solid #000;
}

figure {
    margin: 0.5em auto;
}
figure > * {
    display: block;
    margin: 0 auto;
    page-break-inside: avoid;
}
figcaption { 
    text-align: center;
    margin-top: 0.5em;
}

/* highlighted code sections */
pre > code.code-line > div {
  background-color: #eee;
  border-radius: 5px;
  padding: 0.5em;
  white-space: pre-wrap;
}

footer {
  text-align: center;
  font-size: 0.8em;
  color: #666;
}
}  /* end @media screen */`
};

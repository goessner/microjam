/**
 * microjam extension.js (c) 2020 Stefan Goessner
 * @author Stefan Goessner
 * @license MIT License
 * @link https://github.com/goessner/microjam
 */
'use strict';

const vscode = require('vscode'),
      fs = require('fs'),
      path = require('path');
/**
 * Static Extension Object.
 */
const ext = {
    /**
     * Cached markdown-it object
     */
    mdit: null, 
    /**
     * Access microjam configuration keys in 'package.json'
     * @method
     * @returns {any}
     */
    cfg(key) { 
        return vscode.workspace.getConfiguration('microjam')[key];
    },
    /**
     * Show information message
     * @method
     */
    infoMsg(msg) {
        vscode.window.showInformationMessage(`microjam: ${msg}`);
    },
    /**
     * Show error message
     * @method
     */
    errMsg(msg) {
        vscode.window.showErrorMessage(`microjam: ${msg}`);
    },
    /**
     * Markdown => Html
     * @method
     * @returns {string}
     */
    toHtml(md) {
        return ext.mdit.render(md) // ... remove some vscode stuff ...
                       .replace(/\sclass=\"code-line\"/g,() => '')
                       .replace(/\sdata-line=\"[0-9]+\"/g,() => '')
//                       .replace(/<h([1-6])\sid=\".+\"/g,($0,$1) => `<h${$1}`);  // use auto-generated ids for toc insertion .. ?
    },
    /**
     * Separate Frontmatter section and content.
     * Parse Frontmatter (strict JSON required).
     */
    pageStructure(text,basedir) {
        const page = {layout:"page",title:"",date:"",description:"",tags:[],category:[]};
        if (text) {
            let frontmatter;

            page.content = text.replace(/^\s*?[{\-]{3}([\s\S]+?)[}\-.]{3}\s*?/g, ($0,$1) => { frontmatter = $1; return '';});

            if (frontmatter) {
                try { 
                    frontmatter = JSON.parse(`{${frontmatter}}`);
                    Object.assign(page, frontmatter);
                    if (!["page","article","index"].includes(page.layout))
                        ext.errMsg(`'layout' type must be one of ["page","article","index"]!`);
                    else if (page.layout === 'article') {
                        page.content.replace(/#{2}\s[Aa]bstract\s*([^#]+?)\s*?#/g, ($0,$1) => { page.abstract = $1; return '';});
                        if (page.abstract)
                            page.abstract = ext.toHtml(page.abstract);
                    }
                    else if (page.layout === 'index')
                        page.articles = JSON.parse(fs.readFileSync(path.resolve(basedir,'./pages.json'),'utf8'))
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
    /**
     * Find base directory path from document uri.
     * @method
     * @param {string} - uri of markdown file.
     * @returns {string}  base directory path ('docs').
     */
    baseOfValidRepo(uri) {
        for (let base=path.parse(uri); base.root !== base.dir; base = path.parse(base.dir)) {
            if (   base.base === 'docs'  // might be enough as condition in future ... ?
                && fs.existsSync(path.resolve(base.dir,'./package.json'))
                && !!JSON.parse(fs.readFileSync(path.resolve(base.dir,'./package.json'),'utf8')).microjam
            ) {
                return path.resolve(base.dir,'./docs');
            }
        }
        return false;
    },
    /**
     * (Initially) validate repository.
     * @method
     * @param {string}  basedir - absolute base directory path
     */
    validateRepo(basedir) {   // assume minimum-valid repo-directory ...
        let uri;
        if (!fs.existsSync(uri=path.resolve(basedir,'./pages.json')))
            fs.writeFileSync(uri, '[]', 'utf8');
        if (!fs.existsSync(uri=path.resolve(basedir,'./theme')))
            fs.mkdirSync(uri);
        if (!fs.existsSync(uri=path.resolve(basedir,'./theme/template.js')))  // assume to exist together with './theme' folder ?
            fs.writeFileSync(uri, ext.defaults.templates, 'utf8');
        if (!fs.existsSync(uri=path.resolve(basedir,'./theme/styles.css')))   // assume to exist together with './theme' folder ?
            fs.writeFileSync(uri, ext.defaults.css, 'utf8');
    },
    /**
     * Update 'pages.json'
     * @method
     * @param {string}  pagesuri - uri of 'pages.json'
     * @param {object}  entry - frontmatter object of entry.
     * @param {string}  basedir - absolute base directory path
     */
    updatePages(pagesuri, entry, basedir) {
        const list = JSON.parse(fs.readFileSync(pagesuri,'utf8'));
        let   found = false, dirtyindex = false;

        for (let i=0; i < list.length; i++) {
            if (!found && list[i].uri === entry.uri) {    // entry found in list ...
                list.splice(i,1,entry);             // ... so substitute ...
                found = true;
                dirtyindex = dirtyindex || entry.layout === 'article';
            }
            else if (!fs.existsSync(list[i].uri)) { // ... so remove potentially existing *.html file.
                const htmlpath = path.resolve(basedir,list[i].reluri+'.html');
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

        fs.writeFileSync(pagesuri, JSON.stringify(list), 'utf8');

        if (dirtyindex) {      // providently refresh `index.html` ...
            list.forEach((e) => { if (e.layout === 'index') ext.saveAsHtml(e.uri, basedir); } );
        }
    },
    /**
     * Save Html file
     * @method
     * @param {string}  fspath - absolute markdown file uri
     * @param {string}  basedir - absolute base directory path
     * @param {string}  [mdtext=undefined] - markdown text
     */
    saveAsHtml(fspath, basedir, mdtext) {       // imply existing 'docs' directory ...
        if (!mdtext) mdtext = fs.readFileSync(fspath,'utf8');

        const page = ext.pageStructure(mdtext, basedir);
        const reluri = path.relative(basedir, fspath).replace(/\.md/g,'');

        try {
            const template = require(path.resolve(basedir, './theme/template.js'));
            const html = template[page.layout || 'page'](page);
            const outuri = path.resolve(basedir, reluri+'.html');

            fs.writeFileSync(outuri, html, 'utf8');
            if (ext.cfg('showSaveMessage')) ext.infoMsg(`Html saved to ${outuri}`);
        } catch (e) {
            ext.errMsg('Saving html failed: ' + e.message);
        }

        delete page.content;
        delete page.articles;   // for layout:'index' pages only ...
        page.uri = fspath;
        page.reluri = reluri;

        ext.updatePages(path.resolve(basedir, './pages.json'), page, basedir);
    },
    /**
     * Save Markdown document command handler.
     * @method
     * @param {object}  doc - document.
     */
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
    vscode.workspace.onWillSaveTextDocument((obj) => ext.saveCurrentDocAsHtml(obj.document));

//    const mdplugins = vscode.workspace.getConfiguration('microjam')['markdownItPlugins'];
    return {
        extendMarkdownIt: (md) => {
            const kt = require('katex'),
                  tm = require('markdown-it-texmath').use(kt);  // todo use of 'katex' => options ...
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
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.0/dist/katex.min.css" integrity="sha384-9eLZqc9ds8eNjO3TmqPeYcDj8n+Qfa4nuSiGYa6DjLNcv9BtN69ZIulL9+8CqC9Y" crossorigin="anonymous">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/markdown-it-texmath/css/texmath.css">
<link rel="stylesheet" href="./theme/styles.css">
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
  background-color: #eee;
}
@media screen and (min-width: 768px) {
  body {
    max-width: 768px;
    margin: 0 auto;
  }
}
main, footer {
  padding: 5px 1em;
  background-color: white;
  word-wrap: break-word;
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
p, blockquote { 
  text-align: justify; 
}
blockquote {
    font-size: 11pt;
    margin-top: 1em;
    margin-bottom: 1em;
    border-left: .25em solid green;
    color: #666;
    background-color: #f6f6f6;
    padding: 0 0.5em;
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
    text-align: center;
}
figure  img {
  border-radius: 3px;
  margin: 4px;
  box-shadow: 7px 5px #ccc;
}
figcaption { 
    font-size: 11pt;
    margin-top: 0.5em;
}
/* code sections */
pre > code > code > div,
pre > code.code-line > div {
  font-size: 10pt;
  background-color: #eee;
  border-radius: 5px;
  padding: 0.5em;
  white-space: pre-wrap;
}
kbd {
  font-size: 10pt;
  border-radius: 3px;
  padding: 1px 2px 0;
  margin: 0 2px;
  color: #444;
  border: 1px solid #999;
  background-color: #eee;
}
time {
  color: #666;
}
footer {
  text-align: center;
  font-size: 0.8em;
  color: #666;
}
}  /* end @media screen */`
};

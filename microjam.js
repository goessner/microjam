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
const { Console } = require('console');
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
    toHtml(md, permalink) {
        const formatHeading = (match,level,id,content) => {
            permalink = (permalink===true) ? '#' : permalink;
            id = id.replace(/(.+?)(\-[\d]+)?$/g, '$1');
            return permalink 
                 ? `<h${level} id="${id}">${content} <a class="plnk" href="#${id}">${permalink}</a></h${level}>`
                 : `<h${level} id="${id}">${content}</h${level}>`;
        }
        const html = ext.mdit.render(md) // ... change / remove some vscode stuff ...
                        .replace(/\sclass=\"code-line\"/g,'')
                        .replace(/\sdata-line=\"[0-9]+\"/g,'')
                        .replace(/<h([1-6])\s+id=\"(.+)\">(.+)<\/h[1-6]>/g, formatHeading)
                        .replace(/<a\s+href=\"#(\d+)\"\sdata-href=\"#\d+\">\[\d+\]<\/a>/g, '<a id="$$1" href="$1">[$1]</a>');
        return html;
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
                && !!JSON.parse(fs.readFileSync(path.resolve(base.dir,'./package.json'),'utf8')).microjam) {
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

    validateRepo(basedir) {  // assume minimum-valid repo-directory ...
        let uri;
        if (!fs.existsSync(uri=path.resolve(basedir,'./pages.json')))
            fs.writeFileSync(uri, '[]', 'utf8');
        if (!fs.existsSync(uri=path.resolve(basedir,'./theme'))) {
            fs.mkdirSync(uri);
            fs.writeFileSync(path.resolve(uri,'./template.js'), ext.defaults.templates, 'utf8');
            fs.writeFileSync(path.resolve(uri,'./styles.css'), ext.defaults.css, 'utf8');
        }
        if (!fs.existsSync(uri=path.resolve(basedir,'../.vscode')))
            fs.mkdirSync(uri);
        if (!fs.existsSync(uri=path.resolve(basedir,'../.vscode/settings.json')))
            fs.writeFileSync(uri, ext.defaults.settings, 'utf8');
    },
    /**
     * Separate Frontmatter section and content.
     * Parse Frontmatter (strict JSON required).
     * @param {string}  mdpath - absolute markdown file path
     * @param {string}  basedir - absolute base directory path
     * @param {string}  text - page markdown text (including frontmatter)
     * @returns {object} page object.
     */
    pageStructure(mdpath, basedir, text) {
        const page = { layout:"none",
                       title:"",
                       date:"",
                       description:"",
                       tags:[],
                       category:[],
                       math: false
                    };
        if (text) {
            const reldir = path.relative(path.parse(mdpath).dir, basedir);
            let frontmatter;

            page.content = text.replace(/^\s*?[{\-]{3}([\s\S]+?)[}\-.]{3}\s*?/g, ($0,$1) => { frontmatter = $1; return '';});
            page.uri = mdpath;
            page.reluri = path.relative(basedir, mdpath).replace(/\.md$/,'');
            page.reldir = reldir === '' ? './' : reldir+'/';

            if (frontmatter) {
                try { 
                    frontmatter = JSON.parse(`{${frontmatter}}`);
                    Object.assign(page, frontmatter);
                    if (page.layout !== 'none') {  // allow arbitrary layouts, except 'none' !
                        if (page.layout === 'article') {
                            page.content.replace(/#{2}\s[Aa]bstract\s*([^#]+?)\s*?#/g, ($0,$1) => { page.abstract = $1; return '';});
                            if (page.abstract)
                                page.abstract = ext.toHtml(page.abstract, false);
                        }
                        if (page.uses) {
                            for (const use of page.uses) {
                                const file = path.resolve(basedir,use.uri);
                                if (fs.existsSync(file))
                                    use.content = ext.toHtml(fs.readFileSync(file,'utf8'), false);
                            }
                        }
                    }
                 // else  // do silently nothing ... !
                    if (!page.description && page.title) 
                    page.description = page.title;
                }
                catch (err) {
                    const transform = (pos) => `in frontmatter: … ${frontmatter.substring(Math.max(0,pos-15),pos-1)}¿${frontmatter.substring(pos-1,Math.min(pos+15,frontmatter.length-1))} …`;
                    const errstr = err.message.replace(/in JSON at position (\d+)/, ($0,$1) => { return transform(+$1)});
                    ext.errMsg(errstr); 
                }
            }
        }
        return page;        
    },
    /**
     * Extract page markdown content.
     * @param {string}  text - page text (including frontmatter)
     * @returns {string} page markdown content (without frontmatter).
     */
    pageContent(text) {
        return text.replace(/^\s*?[{\-]{3}([\s\S]+?)[}\-.]{3}\s*?/g, '');
    },
    /**
     * Extract headings from content.
     * @param {string}  text - page text (including frontmatter)
     * @returns {array} headings as `{str,permalink,level}` objects.
     */
    extractHeadings(text) {
        const hds = [... text.matchAll(/([#]+)\s+?(.*)/g)];
        const headings = [];

        for (const h of hds) {
            const level = h[1].length;
            const str = h[2].trim();
            const permalink = ext.mdit.render(h[0]).match(/.+?id=\"([^"]*?)\".*/)[1]
                                                   .replace(/-\d$/g, '');  // remove trailing hyphen and digit !
            headings.push({str,permalink,level});
        }
        return headings;
    },
    /**
     * Update 'pages.json'
     * @method
     * @param {string}  pagesuri - uri of 'pages.json'
     * @param {object}  entry - frontmatter object of current entry.
     * @param {string}  basedir - absolute base directory path
     */
    updatePages(pagesuri, entry, basedir, template) {
        const pages = JSON.parse(fs.readFileSync(pagesuri,'utf8'));
        let   found = false, dirtyindex = false;

        for (let i=0; i < pages.length; i++) {
            if (!found && pages[i].uri === entry.uri) {    // entry found in pages ...
                pages.splice(i,1,entry);             // ... so substitute ...
                found = true;
                dirtyindex = dirtyindex || entry.layout === 'article';
            }
            else if (!fs.existsSync(pages[i].uri)) { // ... so remove potentially existing *.html file.
                const htmlpath = path.resolve(basedir,pages[i].reluri+'.html');
                if (fs.existsSync(htmlpath))
                    fs.unlinkSync(htmlpath);
                if (pages[i].layout === 'article') dirtyindex = true;  // need to refresh index ...
                pages.splice(i,1);                   // remove from pages ...
            }
        }

        if (!found) {                               // is a new entry ...
            pages.push(entry);                       // ... add it to pages.
            dirtyindex = dirtyindex || entry.layout === 'article';
        }

        if (dirtyindex) {      // providently refresh `index.html` ...
            pages.forEach((ent) => { 
                if (ent.layout === 'index') {
                    ent.content = ext.pageContent(fs.readFileSync(ent.uri,'utf8'));
                    ent.articles = pages.filter((e) => e.layout === 'article');
                    ext.saveAsHtml(basedir, ent, template);
                    delete ent.articles;
                    delete ent.content;
                }
            });
        }

        fs.writeFileSync(pagesuri, JSON.stringify(pages), 'utf8');
    },
    /**
     * Save Html file
     * @method
     * @param {string}  basedir - absolute base directory path
     * @param {object}  page - page object
     */
    saveAsHtml(basedir, page, template) {  // safely imply existing 'docs' directory ...
        page.content = ext.toHtml(page.content, page.permalink || ext.cfg('permalink'));

        try {
            const layout = page.layout || 'page';
            const html = template[layout](page);
            const outuri = path.resolve(basedir, page.reluri+'.html');

            fs.writeFileSync(outuri, html, 'utf8');
            if (ext.cfg('showSaveMessage')) ext.infoMsg(`Html saved to ${outuri}`);
        } catch (e) {
            ext.errMsg(`Saving '${page.reluri+'.html'}' failed:  ${e.message}`);
        }
    },
    /**
     * Rebuild all files.
     * Rebuild `*.html` and `pages.json` files in `docs` folder including subdirectories, 
     * as long as these also have the extension `md`.
     * @param {string}  basedir - absolute base directory path
     * @method
     */
    rebuildAll(basedir, template) {
        const pages = ext.collectPages(basedir, basedir, []);
        const indexPages = pages.filter(page => page.layout === 'index');   // far from different to be 'index.md' !!
        const articles = indexPages.length > 0 ? pages.filter(page => page.layout === 'article') : false;

        if (indexPages.length > 0)  // assume it's only one for now ... !
            indexPages[0].articles = articles;
        // create / overwrite *.html files
        for (const page of pages) {
            ext.saveAsHtml(basedir, page, template);
            delete page.content;    // strip off page structure
            delete page.articles;
            if (page.uses)
                for (const use of page.uses)
                    delete use.content;
        }

        // store stripped off pages array to 'pages.json'.
        fs.writeFileSync(path.resolve(basedir,'./pages.json'), JSON.stringify(pages), 'utf8');
    },
    /**
     * Collect pages.
     * Starting in `docs` folder advancing to subdirectories `*.md`.
     * @param {string}  dir - current directory path
     * @param {string}  basedir - base directory path (`docs` folder).
     * @method
     */
    collectPages(dir, basedir, pages) {
        const mdfiles = fs.readdirSync(dir)
                          .filter((uri) => uri.match(/.*\.md$/));

        for (const mdfile of mdfiles) {
            const mdpath = path.resolve(dir,mdfile);
            const stat = fs.statSync(mdpath);

            if (fs.statSync(mdpath).isDirectory())
                ext.collectPages(mdpath, basedir, pages);
            else {
                const page = ext.pageStructure(mdpath, basedir, fs.readFileSync(mdpath,'utf8'));
                if (page.layout !== 'none')
                    pages.push(page);
            }
        }
        return pages;
    },

    /**
     * Save Markdown document command handler.
     * @method
     * @param {object}  arg - document or uri object ... depends from where it was invoked.
     */
    saveAsHtmlCmd(arg) {
        const doc = arg && arg.uri ? arg : vscode.window.activeTextEditor && vscode.window.activeTextEditor.document;
        const dirty = arg && (arg.isDirty || arg.isDirty === undefined);  // if unknown state imply 'dirty'
        const mdpath = dirty && doc && doc.languageId === 'markdown' && doc.uri.fsPath;
        const basedir = mdpath && ext.baseOfValidRepo(mdpath);

        if (basedir) {
            ext.validateRepo(basedir);   // first *.md file save ... !

            const page = ext.pageStructure(mdpath, basedir, doc.getText());
            const pagesuri = path.resolve(basedir, './pages.json');
            const tmplturi = path.resolve(basedir, './theme/template.js');
            const template = require(tmplturi);

            if (page.layout === 'index')
                page.articles = JSON.parse(fs.readFileSync(pagesuri,'utf8'))
                                    .filter((e) => e.layout === 'article');

            if (page.layout !== 'none')
                ext.saveAsHtml(basedir, page, template);
            delete page.content;
            delete page.articles;
            if (page.uses)
                for (const use of page.uses)
                    delete use.content;

            ext.updatePages(pagesuri, page, basedir, template);
            // see https://stackoverflow.com/questions/23685930/clearing-require-cache
            delete require.cache[tmplturi];  // still need to refresh files twice after changes in 'template.js'
        }
    //  else   // no markdown file or markdown file does not belong to a valid repo ... return silently ...
    },
    /**
     * Rebuild repository command.
     * Remove `*.html` and `pages.json` files from `docs` folder.
     * @method
     */
    rebuildCmd() {
        const doc = vscode.window.activeTextEditor && vscode.window.activeTextEditor.document;
        const basedir = doc && doc.languageId === 'markdown' && ext.baseOfValidRepo(doc.uri.fsPath);

        if (basedir) {
            ext.validateRepo(basedir);   // possibly first command invocation ... !

            const tmplturi = path.resolve(basedir, './theme/template.js');
            const template = require(tmplturi);

            ext.rebuildAll(basedir, template);
            delete require.cache[tmplturi];  // still need to refresh files twice after changes in 'template.js'
        }
        else
            ext.errMsg(`${basedir} is not a valid 'microjam' repository.`);
    },
    insertTocCmd(arg) {
        const doc = arg && arg.uri ? arg : vscode.window.activeTextEditor && vscode.window.activeTextEditor.document;
        const headings = ext.extractHeadings(doc.getText());
        let   toc = '<nav>\n';
        for (const h of headings)
            toc += `${Array(h.level-1).fill('  ').join('')}- [${h.str}](#${h.permalink})\n`;
        toc += '</nav>';
        vscode.env.clipboard.writeText(toc);
        vscode.commands.executeCommand('editor.action.insertSnippet', {snippet: "$CLIPBOARD"} );
    },
    insertNavCmd(arg) {
        const doc = arg && arg.uri ? arg : vscode.window.activeTextEditor && vscode.window.activeTextEditor.document;
        const uri = doc.uri.fsPath;
        const basedir = doc && doc.languageId === 'markdown' && ext.baseOfValidRepo(uri);
        const mdname = path.relative(basedir, uri);
        const htmlname = mdname.replace(/\\/g,'/').replace(/\.md$/,'.html');
        const headings = ext.extractHeadings(doc.getText());
        let   nav = '';

        for (const h of headings)
            nav += `${Array(h.level-1).fill('  ').join('')}- [${h.str}](${htmlname}#${h.permalink})\n`;

        vscode.env.clipboard.writeText(nav);
        ext.infoMsg(`Navigation list of '${mdname}' copied to clipboard.`);
    }
}
// extension is activated ..
exports.activate = function activate(context) {
    const mdplugins = vscode.workspace.getConfiguration('microjam')['markdownItPlugins'];
    // `onWillSaveTextDocument` shows us actual 'isDirty' flag in contrast to `onDidSaveTextDocument`. 
    vscode.workspace.onWillSaveTextDocument((obj) => ext.saveAsHtmlCmd(obj.document));

    context.subscriptions.push(vscode.commands.registerCommand('extension.saveAsHtml', ext.saveAsHtmlCmd));
    context.subscriptions.push(vscode.commands.registerCommand('extension.rebuild', ext.rebuildCmd));
    context.subscriptions.push(vscode.commands.registerCommand('extension.insertToc', ext.insertTocCmd));
    context.subscriptions.push(vscode.commands.registerCommand('extension.insertNav', ext.insertNavCmd));

    ext.infoMsg('ready ...');
    return {
        extendMarkdownIt: (md) => {
            for (const key of Object.keys(mdplugins)) {  // see user settings
                md.use(require(key),JSON.parse(JSON.stringify(mdplugins[key])));  // simply `mdplugins[key]` alone does not work ... magic ?!
            }
            return (ext.mdit = md);
        }
    }
}

// extension is deactivated ..
exports.deactivate = function deactivate() {};

ext.defaults = {
    templates:
`module.exports = {
// page layout ... possibly used by other templates
page(data) {
  return \`<!doctype html>
<html lang="\${data.lang||'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1,user-scalable=no">
<meta name="description" content="\${data.description || (data.title + ' - microjam page')}">
\${data.date ? \`<meta name="date" content="\${new Date(data.date).toString()}">\` : ''}
\${data.tags ? \`<meta name="keywords" content="\${data.tags.join()}">\` : ''}
<base href="\${'./'+data.reldir}">
<title>\${data.title}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@9.18.1/styles/github-gist.min.css">
\${data.math ? \`<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/markdown-it-texmath/css/texmath.css">\` : ''}
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
<footer>
  <span class="left">&copy; My Site</span>
  <span class="center">powered by &mu;JAM &amp; VSCode &mdash; hosted by GitHub</span>
  <span class="right" onclick="document.documentElement.className = document.documentElement.className === 'theme-dark' ? 'theme-light' : 'theme-dark';">&#9788;</span>
</footer>
</body>
</html>\` 
},
// article layout ...  // test necessary
article(data) {
  const articleContent = \`<article>
  \${data.content}
</article>\`;
  return tmpl.page(data);
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
:root {
    --color-footer: #e2f3f3;
    --bgcol-footer: #1f3939;
    --color-code: #e2f3f3;
    --bgcol-code: #1f3939;
    --color-shade: #666;
    --sidebar-width: 14rem;
}
.theme-dark {
    --color-main: snow;
    --bgcol-main: #3c6362;
    --color-header: #3c6362;
    --bgcol-header: #e2f3f3;
    --color-link: #c6dddb;
    --color-hover: #6f9999;
    --color-plnk: #fffafa22;
}

/* .theme-light */
html {
    --color-main: #1f3939;
    --bgcol-main: snow;
    --color-header: #e2f3f3;
    --bgcol-header: #3c6362;
    --color-link: #4b7776;
    --color-hover: #87acac;
    --color-plnk: #1f393922;
}

body {
  margin: 1em 1em;
  padding: 0;
  background-color: #ddd;
  font-size: 12pt;
  font-family: Helvetica, Arial, sans-serif;
  box-shadow: 0 0 0.5em var(--color-shade);
}
@media screen and (min-width: 768px) {
  body {
    max-width: 768px;
    margin: 1em auto;
  }
}
main, footer {
  padding: 5px 1em;
}
main {
  color: var(--color-main);
  background-color: var(--bgcol-main);
  word-wrap: break-word;
}
header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;  /* vertical align */
  padding: 5px 1em;
  color: var(--color-header);
  background-color: var(--bgcol-header);
}
footer {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;  /* vertical align */
  font-size: 0.8em;
  color: var(--color-footer);
  background-color: var(--bgcol-footer);
}
header > .left {
  text-align: left;
  font-size: 2em;
}
header > .right {
  text-align: right;
}
footer > .left {
  grid-column: 1;
  text-align: left;
}
footer > .center {
  grid-column: 2;
  text-align: center;
}
footer > .right {
  grid-column: 3;
  text-align: right;
}
footer > .right:hover {
  cursor: pointer;
  color: var(--color-hover);
}

main a:link, main a:visited {
  color: var(--color-link);
  text-decoration: none;
}
main a:hover {
  color: var(--color-hover);
  text-decoration: none;
}
footer > a {
  color: var(--color-footer);
}
header a:link, header a:visited {
  color: var(--color-header);
  text-decoration: none;
}
header a:hover {
  color: var(--color-hover);
}

h1>a.plnk,h2>a.plnk,h3>a.plnk {
  display: none;
  text-decoration: none;
  color: inherit;
}
h1:hover>a.plnk,h2:hover>a.plnk,h3:hover>a.plnk {
  display: initial;
}
p, blockquote { 
  text-align: justify; 
}
blockquote {
    font-size: 11pt;
    margin-top: 1em;
    margin-bottom: 1em;
    border-left: .25em solid var(--bgcol-header);
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
    padding: 0.2rem 0.5rem;
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
figure img {
  max-width: 100%;
}
figcaption { 
    font-size: 11pt;
    margin-top: 0.5em;
}
/* code sections */
pre > code > code > div,
pre > code.code-line > div {
  font-size: 10pt;
  color: var(--color-code);
  background-color: var(--bgcol-code);
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
  color: var(--color-link);
}
}  /* end @media screen */`,

settings: `{
	"explorer.sortOrder": "type"
}`
};

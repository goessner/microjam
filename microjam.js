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
//const { Console } = require('console');
/**
 * Static Extension Object.
 */
const ext = {
    /**
     * Cached markdown-it object
     */
    mdit: null, 
    /**
     * Cached markdown-it-texmath object
     */
    texmath: null, 
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
     * Markdown content => Html
     * @method
     * @returns {string}  Html
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
                        .replace(/\sdata-href=\".+?\"/g,'')
                        .replace(/<h([1-6])\s+?id=\"(.+?)\">(.+?)<\/h[1-6]>/g, formatHeading)
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
            const base = path.relative(path.parse(mdpath).dir, basedir);  // (relative) path from `md`-file to base directory `docs` ... !
            let frontmatter;

            page.content = text.replace(/^\s*?[{\-]{3}([\s\S]+?)[}\-.]{3}\s*?/g, ($0,$1) => { frontmatter = $1; return '';});
            page.uri = mdpath;
            page.reluri = path.relative(basedir, mdpath).replace(/\\/g,'/').replace(/\.md$/,'');
            page.base = base === '' ? '.' : base;

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
                                const content = fs.existsSync(file) && fs.readFileSync(file,'utf8');
                                if (content)
                                    use.content = ext.toHtml(content.replace(/\{base\}/mg, page.base));
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
                          .filter((uri) => /.*\.md$/.test(uri)); 

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
//console.log(page)
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
        let   toc = '';
        for (const h of headings)
            toc += `${Array(h.level-1).fill('  ').join('')}- [${h.str}](#${h.permalink})\n`;
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
            nav += `${Array(h.level-1).fill('  ').join('')}- [${h.str}]({base}/${htmlname}#${h.permalink})\n`;

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

    // switch math mode on/off on file level for performance reasons ... 
    // ... depending on `"math":true` in frontmatter section.
    vscode.window.onDidChangeActiveTextEditor(function(editor) {
        if (editor.document.languageId === 'markdown') {
            if (/\"math\":\s*?true/m.test(editor.document.getText())) {
                ext.mdit.block.ruler.enable(ext.texmath.blockRuleNames, true);
                ext.mdit.inline.ruler.enable(ext.texmath.inlineRuleNames, true);
            }
            else {
                ext.mdit.block.ruler.disable(ext.texmath.blockRuleNames, true);
                ext.mdit.inline.ruler.disable(ext.texmath.inlineRuleNames, true);
            }
        }
    })

    ext.infoMsg('ready ...');
    return {
        extendMarkdownIt: function(md) {
            // permanently load 'markdown-it-texmath' ... but disable math rules in standard mode for performance reasons.
            ext.mdit = md;
            ext.texmath = require('markdown-it-texmath');
            ext.mdit.use(ext.texmath, { "engine": "katex", "delimiters": "dollars", "katexOptions": { "macros": {"\\RR": "\\mathbb{R}" } } } );
//            ext.mdit.block.ruler.disable(ext.texmath.blockRuleNames, true);
//            ext.mdit.inline.ruler.disable(ext.texmath.inlineRuleNames, true);

            for (const key of Object.keys(mdplugins)) {  // see user settings
                if (key !== 'markdown-it-texmath')
                    md.use(require(key),JSON.parse(JSON.stringify(mdplugins[key])));  // simply `mdplugins[key]` alone does not work ... magic ?!
            }
            return ext.mdit;
        }
    }
}

// extension is deactivated ..
exports.deactivate = function deactivate() {};

ext.defaults = {
    templates: fs.readFileSync(path.join(
        vscode.extensions.getExtension('goessner.microjam').extensionPath, 'defaults.js'))
        .toString(),
    css: fs.readFileSync(path.join(
        vscode.extensions.getExtension('goessner.microjam').extensionPath, 'defaults.css'))
        .toString(),
};

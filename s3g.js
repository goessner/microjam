#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const hl = require('highlight.js');
const kt = require('katex');
const tm = require('markdown-it-texmath').use(kt);
const md = require('markdown-it')({ html: true,
                                    linkify: true,
                                    highlight: function(str,lang) {
                                        if (lang && hl.getLanguage(lang)) {
                                            try { return '<pre class="hljs"><code><div>' + hl.highlight(lang, str, true).value + '</div></code></pre>'; }
                                            catch(error) {}
                                        }
                                        return '<pre class="hljs"><code><div>' + md.utils.escapeHtml(str) + '</div></code></pre>';
                                    }
                                  }).use(tm);

const s3g = {
    opts: {},
    whitelist: [],       // directory names list looking for '*.md' files 
    tmpl: {},
    base: process.cwd().replace(/\\/g,'/') || '.',     // base directory, where script is called from.
    appBase: __dirname.replace(/\\/g,'/'),      // base directory, where script is located.
    decompose: function(file) {     // extract front-matter (json style {{{...}}} or yaml style ---...---) from markdown content.
        let page = { opts:{} };
        page.content = fs.readFileSync(file,'utf8').replace(/^\s*?[{-]{3}([\s\S]+?)[}-]{3}\s*?/g, ($0,$1) => { if ($1) page.opts = JSON.parse('{'+$1+'}'); return '';});
        page.opts.file = file;
        return page;
    },
    relativeUrl: function(file,base) {
        return (path.relative(base,path.dirname(file)) + '/' + path.basename(file)).replace(/\\/g,'/');
    },
    existsSync: function(fpath) {
        try { fs.statSync(fpath); }
        catch (err) {
            return err.code !== 'ENOENT';
        }
        return true;
    },
    buildPage: function(page) {
        let out = page.opts && page.opts.dest ? path.resolve(this.base, page.opts.dest, path.basename(page.opts.file, '.md')+'.html')
                                             : page.opts.file.replace(/\.md/, '.html'),
            tmpl = page.opts.template && s3g.tmpl[page.opts.template] || s3g.tmpl.main || s3g.tmpl.default;
        page.opts.base = path.relative(path.dirname(out),this.base) || '.';

        page.content = tmpl(md.render(page.content),page.opts);

        fs.writeFileSync(out, page.content, 'utf8');
    },
    // see http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
    collectPages: function(dir) {
        const files = fs.readdirSync(dir, 'utf8');
        let pages = [], stat;

        for (let file of files) {
            file = path.resolve(dir, file);
            if (fs.statSync(file).isDirectory() && this.whitelist.includes(this.relativeUrl(file,this.base)))  // recurse directory ...
                pages = pages.concat(this.collectPages(file));
            else if (path.extname(file) === '.md')    // markdown files only ...
                pages.push(this.decompose(file));
        }
        return pages;
    },
    build: function() {
        const pages = this.collectPages(this.base);

        if (s3g.prebuild) s3g.prebuild(pages);

        for (let page of pages) {
            this.buildPage(page);
        }

        console.log(pages.length + " files successfully written.");
    }
};

s3g.tmpl.default = (content,opts) => `<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/2.4.1/github-markdown.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1/katex.min.css">
  <base href="${opts.base}">
  <title>${opts.title || path.basename(opts.file)}</title>
</head>
<body>${content}</body>
</html>`

// export to node.js environment
if (typeof module === "object" && module.exports)
   module.exports = s3g;

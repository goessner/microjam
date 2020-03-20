#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const s3g = require('/js/s3g.js');

// whitelist relevant directories for page generation...
s3g.whitelist.push('/articles');

s3g.tmpl.main = (content,opts) => `<!doctype html>
<html>
<head>
  <meta charset='utf-8'>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="description" content="resources for web based graphics, geometry, mechanical analysis and design in mechanisms and kinematic systems. ${opts.description}">
  <meta name="keywords"  content="${opts.description} javascript node.js kinematics, mechanisms, mechanical design, linkage design, kinematic synthesis, mechanisms synthesis, linkages synthesis, vector algebra, vector graphics, geometry, math">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">

 <!-- <base href="${opts.base}"> -->

  <title>${opts.title || path.basename(opts.file,'.md')}</title>
  ${opts.math ? `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1/katex.min.css">
  <link rel="stylesheet" href="${opts.base}/css/texmath.css">` : ''}
  <link rel="stylesheet" href="${opts.base}/css/markdown.css">
  <link rel="stylesheet" href="${opts.base}/css/pagestyle.css">
  <link rel="shortcut icon" href="${opts.base}/images/icon.png">
  <script> let toggle = (elm,val) => { elm.style.display = window.getComputedStyle(elm).display==='none' ? val : 'none'; }; </script>
</head>
<body>
  <header>
    <span class="logo">
      <span id="toggleNav" onclick="toggle(document.getElementById('nav'),'block')">&#9776;</span>
      <a id="logo" style="font-size:166%;" href="${opts.base}/index.html">&nbsp;Go*</a>
    </span>
    <span>
      <a href="https://www.researchgate.net/profile/Stefan_Goessner"><img src="${opts.base}/images/researchgate-squarelogo.png" width="32" height="32"></a>
      <a href="https://github.com/goessner"><img src="${opts.base}/images/Github-Mark-Light-32px.png" width="32" height="32"></a>
    </span>
  </header>
  <main>
    <nav id="nav">
      <ul>
          <li><a href="${opts.base}/index.html"${opts.file.includes('index') ? ` style="text-decoration:underline"` : ''}>Home</a></li>
          <li><a href="${opts.base}/articles.html"${opts.file.includes('articles') ? ` style="text-decoration:underline"` : ''}>Articles</a></li>
          <li><a href="${opts.base}/work.html"${opts.file.includes('work') ? ` style="text-decoration:underline"` : ''}>Work</a></li>
          <li><a href="${opts.base}/about.html"${opts.file.includes('about') ? ` style="text-decoration:underline"` : ''}>About</a></li>
      </ul>
    </nav>
    <article>
${opts.template && opts.template.includes('article') ? '<section>' : ''}${opts.toc || ''}
${content}
${opts.githubIssueId ? '<div id="comments" issueId="' + opts.githubIssueId + '"></div><script src="' + opts.base + '/js/githubcomments.js"></script>' : ''}
${opts.template && opts.template.includes('article') ? '</section>' : ''}
    </article>
</main>
</body>
</html>`

// create subdirectory 'articles' toc ...

s3g.prebuild = function(pages) {   // create articles.md by sorted articles ...
   let articles = pages.filter((page,index) => page.opts.file.includes('articles'))
                       .sort((p1,p2) => p1.opts.date < p2.opts.date ? 1 : -1),
       articlesToc,
       markdown = '<section>\n\n# Articles';

   // add local toc if necessary ...
   for (let page of pages) {
      // check for math content
      page.opts.math = page.opts.math 
                    || page.opts.tags && page.opts.tags.includes('math')
                    || page.opts.category && page.opts.category.includes('math');
      if (page.opts.template && page.opts.template.includes('toc'))
         s3g.pageToc(page);
   }

   // collect articles for generating article toc ...
   for (let article of articles) {
      if (path.basename(article.opts.file) === 'articles.md')   // toc file found ...
         articlesToc = article;
      else
         markdown += `\n* [${article.opts.title}](${this.relativeUrl(article.opts.file.replace(/\.md/, '.html'),this.base)}) (${article.opts.date})   `
                   + `\n ${article.opts.description}`;
   }
   markdown += '\n\n</section>';
   articlesToc.content = markdown;   // update toc ...
   fs.writeFileSync(path.resolve(this.base,'articles.md'), markdown, 'utf8');
}

s3g.pageToc = function(page) {
   let toc = '',
       rex = /\<section( id="([^"]+?)")?( date="([^"]+?)")?\>(\s*?[#]{1,2}\s+?([^$]+?))\n/g;

   page.content = page.content.replace(rex, ($0,$1,$2,$3,$4,$5,$6) => {
      if ($2) { // section id provided ...
          toc += `    <li><a href="#${$2}">${$6 || $2}</a></li>\n`;
          return `<section id="${$2}"><span>${$4 ? ($4+' ') : ''}<a class="toc" href="#toc">▲</a></span>${$5}`;
      }
      return $0;
   });

   if (toc)
      page.opts.toc = `<span id="toc"></span>
<section class="toc"> 
  <span id="tocsym">toc</span>
  <ul>
${toc}
  </ul>
</section>`;
}

// export to node.js environment
if (typeof module === "object" && module.exports)
   module.exports = s3g;

/*
s3g.publish = function() {
   ftp.settings = {
      host: "goessner.net",
      user: "p7826996",
      pass: "paul+max",
      local: './',
      remote: '/Goessner/s2',
      ignore: ['.htaccess', '/node_modules/*', '/build.cmd', '/build.js']
   };
   ftp.run(err => console.log('run: ' + (err ? `error ${err}` : 'ok')));
}
*/
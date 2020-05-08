const tmpl = module.exports = {
// article layout ... used by other templates
page(data) {
  return `<!doctype html>
<html class="theme-light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, user-scalable=no">
<meta name="description" content="${data.description || (data.title + ' - microjam page')}">
${data.date ? `<meta name="date" content="${new Date(data.date).toString()}">` : ''}
${data.tags ? `<meta name="keywords" content="${data.tags.join()}">` : ''}
<title>${data.title}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@9.18.1/styles/vs2015.min.css">
${data.math ? `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/markdown-it-texmath/css/texmath.css">` : ''}
<link rel="stylesheet" href="./theme/styles.css">
</head>
<body id="top">
<header>
  <a class="left" href="./index.html"><img src="./img/icon128.png"></a>
  <h1 class="right">&mu;Jam &ndash; Documentation</h1>
</header>
<main>
  <nav>
     <h2 style="margin: 0.5em"><a href="#top">Documentation</a></h2>
     ${data.use && data.use.find((use) => use.uri === 'navigation.md').content || 'no navigation data !'}
  </nav>
  <article>
${data.content}
  </article>
</main>
<footer>
  <span class="left">&copy; Documentation</span>
  <span class="center">powered by &mu;Jam &amp; VSCode &mdash; hosted by GitHub</span>
  <span class="right" onclick="document.documentElement.className = document.documentElement.className === 'theme-dark' ? 'theme-light' : 'theme-dark';">&#9788;</span>
</footer>
</body>
</html>`
}

}

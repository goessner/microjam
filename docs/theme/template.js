const tmpl = module.exports = {
// base layout ... used by other templates
base(data) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1,user-scalable=no">
<meta name="description" content="${data.description || (data.title + ' - microjam page')}">
${data.date ? `<meta name="date" content="${new Date(data.date).toString()}">` : ''}
${data.tags ? `<meta name="keywords" content="${data.tags.join()}">` : ''}
<title>${data.title}</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/styles/github-gist.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.0/dist/katex.min.css" integrity="sha384-9eLZqc9ds8eNjO3TmqPeYcDj8n+Qfa4nuSiGYa6DjLNcv9BtN69ZIulL9+8CqC9Y" crossorigin="anonymous">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/markdown-it-texmath/css/texmath.css">
<link rel="stylesheet" href="./theme/styles.css">
</head>
<body>
<header>
  <a href="./index.html" class="left"><b>&mu;jam</b></a>
  <div class="right">
      <a href="./installationGuide.html">Installation</a> | <a href="./about.html">About</a>
  </div>
</header>
<main>
${data.content}
</main>
<footer>&copy; &mu;jam</footer>
</body>
</html>` 
},
// page layout ...
page(data) {
  return tmpl.base(data);
},
// article layout ...
article(data) {
  const articleContent = `<article>
  ${data.content}
</article>`;
  return tmpl.base(data);
},
// index layout ...
index(data) {
  data.content = `<article>
${data.content}
${data.articles.sort((a,b)=> a.date < b.date ? 1 : -1)  // sort decending ..
               .map(tmpl.articleEntry).join('')}
</article>`;
  return tmpl.base(data);
},

// article entry layout ... used for article list in index template
articleEntry(article) {
    return `<hr>
${tmpl.dateElement(article.date)}
<h3><a href="${article.reluri+'.html'}">${article.title}</a></h3>
${article.abstract || article.description}`;
},
// date element layout ... 
dateElement(date) {
  const d = new Date(date);
  return `<time datetime="${d}">${d.toString().substr(4,3)} ${d.getDate()}, ${d.getFullYear()}</time>`;
}

}

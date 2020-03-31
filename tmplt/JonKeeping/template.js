// theme (inspired) by Jon Keeping ... https://keepinguptodate.com/pages/2019/06/creating-blog-with-eleventy/

exports.template = ({layout,title,category,content}) => 
`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<title>${title}</title>
<link rel="stylesheet" href="./css/styles.css">
<link href="https://fonts.googleapis.com/css?family=Roboto+Slab:700|Roboto&display=fallback" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.13.1/highlight.min.js">
${!category || !category.contains('math') ? '' : `
<link  rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.0/dist/katex.min.css" integrity="sha384-9eLZqc9ds8eNjO3TmqPeYcDj8n+Qfa4nuSiGYa6DjLNcv9BtN69ZIulL9+8CqC9Y" crossorigin="anonymous">
<link rel="stylesheet" href="https://gitcdn.xyz/repo/goessner/mdmath/master/css/texmath.css">`}
</head>
<body>
<header>
  <a href="./" class="link--home">My Site</a>
  <a href="./about" class="link--about">About</a>
</header>
<main>
${layout !== 'article' ? content : `
  <article>
  </article>`}
</main>
<footer>&copy; My Site</footer>
</body>
${!category || !category.contains('g2') ? '' : `<script src="https://cdn.jsdelivr.net/npm/microjam/dist/g2.html.js"></script>`}
</html>`;

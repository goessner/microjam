// theme (inspired) by Jon Keeping ... https://keepinguptodate.com/pages/2019/06/creating-blog-with-eleventy/

exports.template = ({title,content}) => 
`<!doctype html><html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<title>${title}</title>
<link rel="stylesheet" href="/css/style.css">
</head>
<body>
<header>
  <a href="/" class="link--home">My Blog</a>
  <a href="/About" class="link--about">About</a>
</header>
<main>
  <article>
${content}
  </article>
</main>
<footer>&copy; My Blog</footer>
</body>
</html>`

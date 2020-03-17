// theme by Stefan Goessner ... https://github.com/microjam

exports.template = ({title,content}) => 
`<!doctype html><html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<link rel="stylesheet" href="./style/styles.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/3.0.1/github-markdown.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.13.1/highlight.min.js">
<link  rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.0/dist/katex.min.css" integrity="sha384-9eLZqc9ds8eNjO3TmqPeYcDj8n+Qfa4nuSiGYa6DjLNcv9BtN69ZIulL9+8CqC9Y" crossorigin="anonymous">
</head>
<body class="markdown-body">
<header></header>
<article>
${content}
</article>
<footer></footer>
</body>
<script src="https://cdn.jsdelivr.net/npm/microjam/dist/g2.html.js"></script>
</html>`

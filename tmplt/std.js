exports.template = ({content}) => 
`<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/3.0.1/github-markdown.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.13.1/highlight.min.js">
</head><body class="markdown-body">
${content}
</body>
<script src="./js/g2.html.js"></script>
</html>`;

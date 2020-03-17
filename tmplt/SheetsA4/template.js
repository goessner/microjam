// theme by https://www.delight.im/

exports.template = ({content}) => 
`<!doctype html>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="description" content="Emulating real sheets of paper in web documents (using HTML and CSS)">
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
		<title>Sheets of Paper</title>
		<link rel="stylesheet" href="./style/styles.css"">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/3.0.1/github-markdown.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.13.1/highlight.min.js">
        <link  rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.0/dist/katex.min.css" integrity="sha384-9eLZqc9ds8eNjO3TmqPeYcDj8n+Qfa4nuSiGYa6DjLNcv9BtN69ZIulL9+8CqC9Y" crossorigin="anonymous">
	</head>
<body class="document">
${content}
</body>
<script src="./js/g2.html.js"></script>
</html>`;

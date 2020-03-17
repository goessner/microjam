// theme by Steve Smith ... https://github.com/orderedlist/minimal

exports.template = ({content}) => 
`<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>title</title>
    <link rel="stylesheet" href="./style/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/3.0.1/github-markdown.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.13.1/highlight.min.js">
  </head>
  <body class="markdown-body">
    <div class="wrapper">
      <header>
        <h1>Minimal</h1>
        <p>A Theme for GitHub Pages</p>
        <p class="view"><a href="http://github.com/orderedlist/minimal">View the Project on GitHub <small>orderedlist/minimal</small></a></p>
        <ul>
          <li><a href="https://github.com/orderedlist/minimal/zipball/master">Download <strong>ZIP File</strong></a></li>
          <li><a href="https://github.com/orderedlist/minimal/tarball/master">Download <strong>TAR Ball</strong></a></li>
          <li><a href="http://github.com/orderedlist/minimal">Fork On <strong>GitHub</strong></a></li>
        </ul>
      </header>
      <section>
${content}
      </section>
      <footer>
        <p>This project is maintained by <a href="http://github.com/orderedlist">Steve Smith</a></p>
        <p><small>Hosted on GitHub Pages &mdash; Theme by <a href="https://github.com/orderedlist">orderedlist</a></small></p>
      </footer>
    </div>
</body>
<script src="https://cdn.jsdelivr.net/npm/microjam/dist/g2.html.js"></script>
</html>`;

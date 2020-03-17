exports.template = ({content}) => 
`<!doctype html>
<!-- 
Based on this theme: https://github.com/broccolini/dinky , which mentioned that attribution is appreciated. Thanks, broccolini!
-->
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    <meta name="citation_title" content="A template for writing scientific papers">
    <meta name="citation_author" content="Andrew G. York">
    <meta name="citation_publication_date" content="2017/01/05">
    <meta name="citation_journal_title" content="Github.io">
    <meta name="citation_pdf_url" content="https://andrewgyork.github.io/publication_template/Publication_template%20by%20AndrewGYork.pdf">
    <title>publication_template by AndrewGYork</title>
    <link rel="stylesheet" href="./style/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/3.0.1/github-markdown.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.13.1/highlight.min.js">
  </head>
  <body class="markdown-body">
    <div class="wrapper">
      <header>
        <h1 class="header">Publication-template</h1>
        <ul>
          <li class="download"><a class="buttons" href="https://github.com/AndrewGYork/publication_template/zipball/master">Download ZIP</a></li>
          <li><a class="buttons github" href="https://github.com/AndrewGYork/publication_template">View On GitHub</a></li>
          <li><a class="buttons pdf" href="./Publication_template%20by%20AndrewGYork.pdf">Download PDF</a></li>
        </ul>
        <p class="header">This project is maintained by <a class="header name" href="https://github.com/AndrewGYork">AndrewGYork</a></p>
      </header>
<section>
${content}
</section>
<footer>
  <a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="./images/cc_by_4p0.png"></a>

  <p><small>Hosted on <a href="https://pages.github.com">GitHub Pages</a></small></p>
</footer>
</div>
</body>
<script src="https://cdn.jsdelivr.net/npm/microjam/dist/g2.html.js"></script>
</html>`;
 

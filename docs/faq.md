---
"layout": "page",
"title": "Introduction",
"uses": [ { "uri": "navigation.md" } ],
"permalink": true
---

#  FAQ

## Pages

<details><summary><b>Can we organize markdown files in subdirectories ?</b></summary>

Yes, starting with version 0.4.0 organization of markdown files in subdirectories `'docs/*.md'` with extension `'md'` under `'docs'` folder is possible. With that feature comes the data entry `${data.base}`, which is holding the relative path from the current markdown file 
to the `'docs'` folder and can be used in template header sections.
</details>

<details><summary><b>Changing <code>"math"</code> setting in frontmatter section has no visual effect on math rendering.</b>
</summary>

Hmm, you need to ...

1. add or change `"math":true/false` setting in the frontmatter section of your markdown document.
2. activate (set focus away to) any other editor window (preview window works perfect here).
3. reactivate (set focus back to) your markdown document.
4. make any modification (a simple keystroke should work) and see change in math rendering.
</details>

## Styles

<details><summary><b>Where are the style sheets ?</b></summary>
   
The CSS styles are defined in the file `/docs/theme/styles.css`. They are referenced by the templates in file `/docs/theme/template.js`.
</details>
<details><summary><b>Can we change the styles ?</b></summary>
   
Yes. Change them in file `/docs/theme/styles.css` or rename it or use multiple CSS files. You only need to reference them from the templates in `/docs/theme/template.js`.
</details>

## Templates

<details><summary><b>Where are the templates ?</b></summary>

The templates are defined in file `/docs/theme/template.js`. They are basically delivered by simple JavaScript functions returning [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals). Those recieve extended versions of the frontmatter metadata.
</details>
<details><summary><b>Can we change the templates ?</b></summary>

Yes, of course. New themes are generated exactly by that. So go on and do it.
</details>
<details><summary><b>Are other template engines supported ?</b></summary>
 
No sorry, it's due to *minimalism* paradigma.
</details>

## Deployment

<details><summary><b>Is it possible to deploy to other hosting platforms ?</b></summary>

Yes, it should be easy in principle. Nothing done here yet.
</details>
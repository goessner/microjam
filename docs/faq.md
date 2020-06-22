---
"layout": "page",
"title": "Introduction",
"uses": [ { "uri": "navigation.md" } ],
"permalink": true
---

#  FAQ

## Pages

<details><summary><b>Can we organize markdown files in subdirectories ?</b></summary>

Yes, starting with version 0.3.8 organization of markdown files in subdirectories `'docs/*.md'` with extension `'md'` under `'docs'` folder is possible. With that feature comes the requirement of having a single html `<base>` element pointing to the `'docs'` folder in template header sections.
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
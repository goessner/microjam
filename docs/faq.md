---
"layout": "page",
"title": "Introduction",
"use": [ { "uri": "navigation.md" } ],
"permalink": true
---

#  FaQ's

## Styles

* **Where are the style sheets ?**   
The CSS styles are defined in the file `/docs/theme/styles.css`. They are referenced by the templates in file `/docs/theme/template.js`.

* **Can we change the styles ?**   
Yes. Change them in file `/docs/theme/styles.css` or rename it or use multiple CSS files. You only need to reference them from the templates in `/docs/theme/template.js`.

## Templates

* **Where are the templates ?**   
The templates are defined in file `/docs/theme/template.js`. They are basically delivered by simple JavaScript functions returning [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals). Those recieve extended versions of the frontmatter metadata.

* **Can we change the templates ?**   
Yes, of course. New themes are generated exactly by that. So go on and do it.

* **Are other template engines supported ?**   
No sorry, it's due to *minimalism* paradigma.

## Deployment

* **Is it possible to deploy to other hosting platforms ?**   
Yes, it should be easy in principle. External help regarding this would be welcome.


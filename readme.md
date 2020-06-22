# ![microjam](https://goessner.github.io/microjam//img/icon128.png) &mu;Jam

[![marketplace](https://vsmarketplacebadge.apphb.com/version/goessner.microjam.svg)](https://marketplace.visualstudio.com/items?itemName=goessner.microjam)
[![marketplace](https://vsmarketplacebadge.apphb.com/installs-short/goessner.microjam.svg)](https://marketplace.visualstudio.com/items?itemName=goessner.microjam)
[![npm](https://img.shields.io/npm/v/microjam.svg)](https://www.npmjs.com/package/microjam)
![Dependencies](https://goessner.github.io/microjam//img/dependencies-badge.png)
[![License](https://img.shields.io/github/license/goessner/mdmath.svg)](https://github.com/goessner/microjam/blob/master/LICENSE.txt)

## What is it ?

**&mu;Jam** allows to use *Visual Studio Code* as a lightweight authoring and publishing tool for small to medium websites.

Greek letter `'μ'` is pronounced `'my'` as in `micro`, `'mu'` as in `'music'` or `'mee'` according to [modern Greek](https://www.thoughtco.com/the-greek-alphabet-1705558). In that context here it simply means *tiny* or  *minimalistic*.

That `'Jam'` in &mu;Jam comes from `Jamstack` and means the collection of the three attributes
* **J** avaScript
* **A** PI
* **M** arkup

It is mostly about the creation of static web pages or *serverless* websites and you might want to [read more](https://jamstack.org/) about that modern way to build lightweight web pages [here](https://jamstack.wtf/) and [there](https://jamstack.email/).

## What can I do with it ?

If you want to 
* create a small to medium website
* write down the contents of your web pages in that easy to learn and use [Markdown language](https://commonmark.org/help/)
* publish your web-pages to your GitHub repository and [GitHub pages](https://pages.github.com/)
* do that all from inside free [*Visual Studio Code*](https://code.visualstudio.com/) (`vscode`) editor

then the minimalistic and powerful approach of &mu;Jam might convice you.

<img src="https://github.com/goessner/microjam/raw/master/img/browser-view2.png">
<br><br>
<img src="https://github.com/goessner/microjam/raw/master/img/vscode-view2.png">

## Examples ?

Some templates are here ...

* [microjam-simple](https://github.com/goessner/microjam-simple) &ndash; A simple website template for μJam
* [microjam-tufte](https://github.com/goessner/microjam-tufte) &ndash; A Tufte Style Template for μJam
* [microjam-docs](https://github.com/goessner/microjam-docs) &ndash; A documentation theme for μjam with sidebar
* [microjam-g2](https://github.com/goessner/microjam-docs) &ndash; A theme for μjam + g2

## Why yet another Jamstack Approach ?

**&mu;Jam** is meant to be a [low code](https://en.wikipedia.org/wiki/Low-code_development_platform) authoring and web publishing tool for scientists, engineers and students, which ...

> *  is easy to learn and use.
> *  does not require web programming skills.
> *  can handle LaTeX math expressions natively.
> *  integrates static or dynamic vector graphics.
> *  integrates scripting capabilities.
> *  offers comfortable Html previewing.
> *  supports different templates and styles.
> *  enables high quality research paper `pdf`-format output.
> *  doing that all inside of a professional markdown authoring application.

But as you can easily leave that *math*, *vector graphics* and *research paper* stuff out, it may serve your non-academic publishing wishes also well.

Interested ... ?  So [read on](https://goessner.github.io/microjam/index.html) ...

## [FAQ](https://goessner.github.io/microjam/faq.html)


## Release Notes

###  [0.3.8] on June 21, 2020
* Organization of markdown files in subdirectories `docs/*.md` having extension `md` under `docs` is possible. 
* Using `docs/*.md` subdirectories requires existence of a single `<base>` Html element in the template header section.
* **Breaking Change**: `"use"` entry in frontmatter sections is renamed to `"uses"`.

###  [0.3.7] on June 17, 2020
* Inline TeX expression `$$..$$` will result in display math presentation now.
* Custom HTML elements `g-2` and `mec-2` are supported. 


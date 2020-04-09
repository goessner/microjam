---
  "layout": "page",
  "title": "Using μjam",
  "date": "2020-03-30",
  "description": "Creating Web Pages with `&mu;jam`",
  "tags": ["2D Vector","Graphics","Web","SVG","HTML Canvas","Path Segment"],
  "category": ["math"],
  "permalink": "#"
---

# Using *&mu;jam* 

## Contents


## 1. Prerequisites

It is assumed, that you 
* have basic knowledge, how to use [*Visual Studio Code*](https://code.visualstudio.com/).
* successfully [installed](./installationGuide.html) **&mu;jam**.

## 2. Activation

*&mu;jam* is an extension to VSCode and VSCode will activate it under certain conditions. As *&mu;jam* deals primarily &ndash; or more precise exclusively &ndash; with markdown files, it will get activated, when you 

* open your first markdown file, or ...
* start VSCode with a markdown file as its active document

<figure>
  <img src="./img/mu-jam.use.01.png" alt="md = make directory">
  <figcaption>Fig. 1: &mu;jam activation message.</figcaption>
</figure>

You will see an activation message in the lower right corner of VSCode window.
You do not necessarily have your repository folder opened in VSCode. *&mu;jam* will work with single file mode also.

But ... having *&mu;jam* activated properly does not mean, it works with every markdown file. It accepts files 

* being in a `docs` directory or one of its subdirectories `docs/**` and ...
* belonging to a repository having an entry `"microjam": {...}` in its `package.json`

only.

## 3. Generating Webpages

*&mu;jam* can do exactly *two things* for you:

* generate/update a `html` file from a single `md` file ...
* generate/update `html` files from **all** `md` files in a repository

### 3.1 Working with Single Markdown Files

Whenever you are working at a markdown file and save it via

* menu `File > Save As` or (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd>) or ...
* menu `File > Save` or (<kbd>Ctrl</kbd> + <kbd>S</kbd>)

its corresponding `html` file will be generated automatically by *&mu;jam*, which will also update the `pages.json` file and possibly some *index* files, if you happened to have modified a `"layout":"article"` document.

<figure>
  <img src="./img/mu-jam.use.02.png">
  <figcaption>Fig. 2: &mu;jam Html saved message.</figcaption>
</figure>

> **Note:**   
>That `File > Save` command **only** saves its markdown file, if it has been modified since its last storage command. Only in this case the corresponding `html` file is updated.

In order to assist you to *force an update of a single file*, *&mu;jam* provides us with the command <kbd>Ctrl</kbd>&nbsp;+&nbsp;<kbd>K</kbd>&nbsp;&nbsp;<kbd>H</kbd> (think **H**tml). This is also available via different menus (see below).

### 3.2 Working with All Markdown Files

There might come up the necessity to rebuild all `html` files. One scenario is, we just had modified our templates in `template.js`.

To achieve this, we can use the *&mu;jam* command <kbd>Ctrl</kbd>&nbsp;+&nbsp;<kbd>K</kbd>&nbsp;&nbsp;<kbd>A</kbd> (think **A**ll).

<figure>
  <img src="./img/mu-jam.use.03.png">
  <figcaption>Fig. 3: &mu;jam command - force rebuild all Html files</figcaption>
</figure>

Please note, only the last three rebuilt files are shown as *&mu;jam* messages then.

### 3.3 Menus

<figure>
  <div><img src="./img/mu-jam.use.04-1.png">
  <img src="./img/mu-jam.use.04-2.png"></div><br>
  <img src="./img/mu-jam.use.04-3.png"><br>
  <img src="./img/mu-jam.use.04-4.png">
  <figcaption>Fig. 4: &mu;jam commands - accessible through different menus</figcaption>
</figure>

Both *&mu;jam* commands are accessible through

1. Editor context menu (right click) (a)
2. Editor title menu (b)
3. VSCode global command palette (c)
4. Explorer context menu (d)

> **Note:**   
>Menus in VSCode are defined statically with extensions like &mu;jam. So above menus are always shown while editing any markdown document. But with markdown documents **not** belonging to a valid repository invoking these menu commands will **silently** have no effect.

### 3.4 Remove auto-generated Files

You won't want to remove auto-generated files usually, which are regularly updated by &mu;jam. But if you explicitely want to do that, it is best to use the explorer view (Fig. 5).

<figure>
  <img src="./img/mu-jam.use.05.png">
  <figcaption>Fig. 5: Explorer view - manually remove these files only</figcaption>
</figure>

* It is safe to remove all `*.html` files as well as `pages.json` (<kbd>Delete</kbd> or <kbd>Shift</kbd>+<kbd>Delete</kbd>).
* If you manually remove a markdown file, its corresponding `html` file will be consistently deleted by &mu;jam during next command execution. `pages.json` will be also updating accordingly.
* You can delete the `docs/theme` folder and even the `.vscode` directory. &mu;jam will generate them again using default content. So be aware, that your possible customizations might get lost then.
* You shouldn't delete any other files from your repository, except you know, what you are doing.

> **Note:**   
>Sort order of files by *type* makes sense in explorer view, but it's not VSCode's default order. So &mu;jam adds an entry `"explorer.sortOrder":"type"` to user settings file `.vscode/settings.json`. You can add more individual settings to that file. It is recommended, to leave the sort order setting intakt.

## 4. Editing Markdown Files

It is not much to say here, since markdown editing is excellently done by VSCode editor. There are only a few assisting &mu;jam features worth mentioning.

### 4.1 Frontmatter Snippet

When starting a new markdown file, &mu;jam assists you by inserting a partial filled *frontmatter* template at current editor location.

<figure>
  <img src="./img/mu-jam.use.06.png">
  <figcaption>Fig. 6: Explorer view - manually remove these files only</figcaption>
</figure>

Simply type <kbd>Ctrl</kbd>+<kbd>k</kbd> <kbd>-</kbd> for getting this.

### 4.2 Table Of Content Snippet

When finishing a markdown document containing several headings possibly in multiple levels, we would welcome an automatical generation of table of contents (toc). This is how &mu;jam assists us by inserting at current editor location at our fingertips.

<figure>
  <img src="./img/mu-jam.use.07.png">
  <figcaption>Fig. 7: Explorer view - manually remove these files only</figcaption>
</figure>

Simply type <kbd>Ctrl</kbd>+<kbd>k</kbd> <kbd>t</kbd> (think &nbsp;**t** oc) for getting this.

> **Note:**   
> The table of content inserted is static and not configurable, i.e. minimalistic:
> * If you do not want to have a heading in the toc (maybe 'Contents'), simple delete it from the generated list in the markdown document.
> * If you edit the text of a heading, the toc won't update automatically. Recreate the toc then manually.
> * Generating certain toc levels only is not supported. Simply remove the unwanted entries manually then.


### 4.3 `markdown-it` Plugins

VSCode uses [markdown-it](https://github.com/markdown-it/markdown-it) as its markdown parser internally. There are a lot of markdown-it plugins available.
&mu;jam potentially supports only two of them at current:

* Math plugin `markdown-it-texmath`
* Footnotes plugin `markdown-it-footnotes`

Since they are both inactive initially, we can activate them &ndash; if we want &ndash; by appending the following to `.vscode/settings.json` ...

```json
	"microjam.markdownItPlugins": {
		"markdown-it-texmath": {
			"engine": "katex",
            "delimiters": "dollars",
            "macros": {"\\RR": "\\mathbb{R}"}
		},
		"markdown-it-footnote": {}
	}
}
```

## 5. Publishing Documents to GitHub

We are assuming here, that you have a valid local `git` and remote GitHub repository already. Read [installation guide](./installationGuide.html) otherwise.

<figure>
  <img src="./img/mu-jam.16-4.png">
  <figcaption>Fig. 16: Workflow: Adding 'readme.md' and modifying 'one.md'.</figcaption>
</figure>

For publishing your generated or modified files to GitHub, you might want to use the *Source control* view.

* Type in a commit message string.
* Send it by <kbd>Ctrl</kbd> + <kbd>Enter</kbd>.
* Press the *up arrow* symbol in the status bar.


## References 

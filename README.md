## static-maker

Source code for [battlecatsinfo.github.io](https://github.com/battlecatsinfo/battlecatsinfo.github.io)

## Installation

static-maker use [Node.js](https://nodejs.org/) to generate static files.

```bash
$ git clone "https://github.com/battlecatsinfo/static-maker.git"
$ npm install
$ mkdir out
$ cd out
$ git clone "https://github.com/battlecatsinfo/battlecatsinfo.github.io"
```

## Running the local server

```bash
$ node server.js # or npm start
$ node.server.js --verbose
```

Note: To display images successfully, you may need to clone https://github.com/battlecatsinfo/img to `static-maker/img/`.

## Build

Use Node.js to run build scripts.

```bash
$ node js/foo.js
```

or

```bash
$ cd js
$ node foo.js
```

* `copy-assets.js`: copy files at `staic-maker/static/` folder.
* `copy-data.js`: copy files at `static-maker/data/` folder.
* `combo.js`: produces `combos.html`.
* `rank.js`: produces `rank.html`.
* `medal.js`: produces `medal.html`
* `collab.js`: produces `collabs.html`, `collab/`
* `gacha.js`: produces `gachas.html`, `gacha/`

## Publish to Github Pages

```bash
$ cd out
$ git add .
$ git commit -m "commit message"
$ git push
```

## Codding style

* Always indent using tabs
* Always use LF line ending
* Use `require` not `import` in JavaScript files

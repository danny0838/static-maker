## static-maker

Source code for [battlecatsinfo.github.io](https://github.com/battlecatsinfo/battlecatsinfo.github.io)

## Installation

static-maker use [Node.js](https://nodejs.org/) to generate static files.

```bash
$ git clone "https://github.com/battlecatsinfo/battlecatsinfo.github.io"
$ npm install
```

## Build

Use Node.js to run build scripts.

```bash
$ mkdir out
$ node copy-assets.js  # copy files at `staic-maker/static/` folder.
$ node copy-data.js  # copy files at `static-maker/data/` folder.
$ node combo.js  # produces `combos.html`.
$ node rank.js  # produces `rank.html`.
$ node medal.js  # produces `medal.html`
$ mkdir out/collab
$ node collab.js  # produces `collabs.html`, `collab/`
$ mkdir out/gacha
$ node gacha.js  # produces `gachas.html`, `gacha/`
$ node material.js  # produces `material.js`
$ node crown.js  # produces `crown.js`
$ node gamatoto.js  # produces `gamatoto.html`
$ node esearch.js  # produces `esearch.html`
```

## Running the local server

```bash
$ node server.js # or npm start
$ node.server.js --verbose
```

Note: To display images successfully, you may need to clone https://github.com/battlecatsinfo/img to `/img/`.

## Coding style

* Always indent using tabs
* Always use LF line ending
* Use `require` instead of `import` in JavaScript files

## Resources

* Cat obtain/involve: https://docs.google.com/spreadsheets/d/1AOId2OhHT59WgpVtgvUylh_9_l-mf2qWvUqyB2cbm0g/edit?usp=sharing
* Enemy Species: https://docs.google.com/spreadsheets/d/1pVSY0EkiBolHCtoj15JW_T0ih9prya6q_9HCmJ5Jo0k/edit?usp=sharing
* Gacha history: https://home.gamer.com.tw/artwork.php?sn=5349275
* Collab History(Taiwan): https://forum.gamer.com.tw/C.php?bsn=23772&snA=19806
* Collab History(Japan): https://forum.gamer.com.tw/C.php?bsn=23772&snA=20642
* Stage schedule(Taiwan): https://forum.gamer.com.tw/C.php?bsn=23772&snA=20534

※ All resources are reproduced with the permission of the author

## Discord Server

https://discord.gg/A9gZeDu2mv

# Development

## Run the game

The game is plain static files. Serve the repo root with any static web server and open it
in a browser. Opening `index.html` straight from disk (`file://`) does not work, because
Phaser loads assets over HTTP.

```sh
python3 -m http.server 8000
# then open http://localhost:8000/
```

Or, with Node installed:

```sh
npx serve .
```

No `npm install` is needed. Phaser and Cookies.js are vendored in `javascripts/lib/`.

## The old Gulp setup

`package.json` and `gulpfile.js` come from the 2017 version. `gulp` (the default task)
was meant to bundle `./src` with Browserify + Babel into `./game.js` and serve the folder on
port 25565 with BrowserSync. Today it is broken and not needed:

- `./src` does not exist, so the bundle is empty. That is why the root `game.js` holds only
  the Browserify prelude. `index.html` does not load it.
- It depends on Gulp 3, which does not run on current Node versions.
- It only reloads on changes in `./src`, so edits to `javascripts/` never trigger a reload.

Treat it as legacy. Removing it, or replacing it with a one-line static server script, is a
safe clean-up.

## Making changes

- Gameplay logic and tuning: `javascripts/game.js` (see [gameplay.md](gameplay.md)).
- New sprite or sound: add the file, register it in `javascripts/preload.js`, use it in
  `create.js` or `game.js` (see [assets.md](assets.md)).
- Per-frame behaviour: `javascripts/update.js`.
- New script file: add a `<script>` to `index.html` **before** `javascripts/game.js` if it
  defines functions the game calls at start-up.
- Everything is global. A function in one file can call any function from another file, as
  long as it runs after all scripts have loaded.
- Phaser docs: use the **2.0.x** API (`game.add.sprite`, `group.createMultiple`,
  `Phaser.Physics.ARCADE`). Phaser 3 examples will not work.

## Testing

There are no automated tests (`npm test` just exits with an error). Check changes by
playing: shoot a full wave, lose all lives, restart with R, catch a Red Bull, and reload
the page to check the best score.

## Deploy

The live demo is at https://ericrisco.com/invadrs/. Deploying means copying these files to
any static host:

```
index.html  favicon.ico  stylesheets/  javascripts/  images/  sounds/
```

The rest (`gulpfile.js`, `package.json`, root `game.js`, `screen.PNG`, `01-TOOLS/`,
`02-DOCS/`, agent files) is not needed at runtime.

## Repository layout

```
index.html             page shell
javascripts/           game code (+ lib/ for vendored Phaser and Cookies.js)
stylesheets/           page CSS
images/  sounds/       assets
01-TOOLS/              harness: per-tool credentials and scripts (template only)
02-DOCS/wiki/          project wiki (this folder)
.claude/  .rsc.json    AI-assistant harness config (rsc)
AGENTS.md  CLAUDE.md   instructions for coding assistants
```

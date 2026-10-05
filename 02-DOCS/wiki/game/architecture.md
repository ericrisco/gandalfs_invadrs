# Architecture

Gandalf Invadrs is a static browser game. There is no server code, no bundler step
and no module system: `index.html` loads a handful of plain scripts that share global
variables. The engine is **Phaser 2.0.4** (vendored in `javascripts/lib/phaser.min.js`).

## Files that matter

| File | Role |
| --- | --- |
| `index.html` | Page shell. Loads libraries, then the four game scripts in order. Phaser mounts the canvas in `<div id="game">`. |
| `javascripts/lib/phaser.min.js` | Phaser 2.0.4 (vendored, not from npm). |
| `javascripts/lib/cookies.min.js` | Cookies.js 0.4.0, used for the high score. |
| `javascripts/preload.js` | `preload()` — registers every image, spritesheet and sound. |
| `javascripts/create.js` | `create()` — builds sprites, object pools, HUD text and keyboard input. |
| `javascripts/update.js` | `update()` — the per-frame loop: input, random drops, collisions. |
| `javascripts/game.js` | Creates the `Phaser.Game`, holds the tuning constants and all gameplay functions. |
| `stylesheets/all.css` | Page layout: centred 1024×576 canvas, title, footer. `normalize.css` is present but not linked. |

Not part of the running game:

- `game.js` (repo root) — an empty Browserify bundle produced by `gulpfile.js`. Nothing loads it.
- `gulpfile.js`, `package.json` — a dev-server setup that no longer works. See [development.md](development.md).
- `screen.PNG` — the screenshot used in the README.
- `images/ship.png` — unused leftover.

## Load order

`index.html` loads the scripts in this order, and the order is load-bearing:

1. `phaser.min.js`, `cookies.min.js` (in `<head>`)
2. `preload.js`, `create.js`, `update.js` — they only *define* the three state functions.
3. `javascripts/game.js` — runs `new Phaser.Game(1024, 576, Phaser.AUTO, 'game', { preload, create, update })`.
   By this point the three functions exist, so Phaser can call them.

Phaser then drives the lifecycle: `preload()` once, `create()` once when assets are loaded,
and `update()` every frame (targets 60 fps).

## State model

All game state lives in **globals**. Some are declared with `var`/`const` in
`javascripts/game.js`; many are created implicitly by assignment (for example `nyancat`,
`gandalfs`, `rainbows` in `create.js`, and `lives`, `score`, `highScore`, `galletaGravity`
because of a `;` typo — see [known-issues.md](known-issues.md)).

| Global | Kind | Meaning |
| --- | --- | --- |
| `game` | `Phaser.Game` | The engine instance. |
| `nyancat` | sprite | The player. |
| `gandalfs` | group | The current wave of 30 enemies. Recreated each wave. |
| `rainbows` | pool (5) | Player shots. |
| `galletitas` | pool (10) | Enemy shots (fortune cookies). |
| `redbulls` | pool (1) | Extra-life pickup. |
| `explosions` | pool (10) | Explosion animations. |
| `saxguy` | sprite | Decorative animated sax player at the top. |
| `lives`, `score`, `highScore` | numbers | Player progress. `highScore` may become a string when read from the cookie. |
| `rainbowTime` | number | Timestamp before which the player cannot fire again. |
| `galletaGravity` | number | Gravity applied to new cookies; rises each wave. |
| `livesText`, `scoreText`, `highScoreText` | text | HUD. |
| `gameOverText`, `restartText` | text | Shown after the last life. |
| `cursors`, `fireButton`, `restartButton` | input | Arrow keys, Space, R. |
| `meowSound`, `explodeSound`, `galletitaSound`, `redbullSound`, `epicSaxGandalf`, `nyanCat` | sounds | Effects and the two music loops. |

## Object pools

Shots, cookies, Red Bulls and explosions are pre-created with `group.createMultiple(n, key)`.
Code takes a dead member with `getFirstExists(false)` and calls `reset(x, y)` to reuse it.
`checkWorldBounds` + `outOfBoundsKill` return projectiles to the pool when they leave the
screen. If the pool is empty, the shot or drop is simply skipped.

## Frame loop (`update()`)

```
update()
├─ nyanMovement()                 arrow keys → accelerate / brake
├─ R pressed and lives == 0 ?  → restartGame()
├─ Space pressed and alive ?   → fireRainbow()
├─ handleGalletitas()             random cookie drops
├─ handleRedbulls()               random Red Bull drops
└─ arcade overlaps
   ├─ galletitas × nyancat  → galletitaHitsNyan()
   ├─ redbulls   × nyancat  → redbullHitsNyan()
   └─ rainbows   × gandalfs → rainbowHitsGandalf()
```

## Game flow

```
create() ──► wave 1 ──(all 30 Gandalfs dead)──► newWave() ──► wave n+1 (cookies fall faster)
                │
                └─(cookie hits Nyan)──► lives-1 ──► lives > 0 ? respawnNyan() : gameOver()
                                                                        │
                                       restartGame() ◄──(press R)───────┘
```

`gameOver()` and `respawnNyan()` / `newWave()` use `setTimeout(…, 1000)`, not Phaser timers,
so they keep running on wall-clock time.

## Function reference (`javascripts/game.js`)

| Function | What it does |
| --- | --- |
| `nyanMovement()` | Adds ±10 px/s per frame to Nyan's x velocity while an arrow is held (cap ±300). With no key, brakes by 2 px/s per frame. |
| `fireRainbow()` | If the 400 ms cooldown has passed and a pooled rainbow is free: plays meow, fires it up at 500 px/s with ¼ of Nyan's sideways speed. |
| `rainbowHitsGandalf()` | Kills the shot, explodes the Gandalf, +10 points. Starts `newWave()` when none are left. |
| `galletitaHitsNyan()` | Kills the cookie, explodes Nyan, −1 life. Respawns or ends the game. |
| `redbullHitsNyan()` | Kills the can, +1 life, plays the Red Bull sound. Nyan keeps its position. |
| `explode(entity)` | Kills the entity and plays a pooled explosion at its centre. |
| `updateLivesText()` / `updateScore()` | Refresh the HUD. `updateScore()` also raises `highScore` and zero-pads to 6 digits. |
| `getHighScore()` | Reads the `highScore` cookie. |
| `respawnNyan()` | Moves Nyan to x = 512 and revives it after 1 s. |
| `newWave()` | Raises cookie gravity by 100, then after 1 s rebuilds and animates the Gandalf grid. |
| `restartGame()` | Removes game-over text, resets lives and score, restarts the sax music, respawns Nyan, starts a wave. |
| `gameOver()` | After 1 s: resets cookie gravity, shows the win/lose message, writes the `high_score` cookie. |
| `createGandalfs()` | Builds a 3 × 10 grid (72 × 48 px spacing) at (64, 96) with a small random bobbing tween per Gandalf. |
| `animateGandalfs()` | Swings the whole group between x = 64 and x = 308 (2.5 s each way); each loop calls `descend()`. |
| `descend()` | Moves the group 8 px down over 2.5 s, only while Nyan is alive. |
| `handleGalletitas()` / `handleRedbulls()` | Per frame, each living Gandalf rolls for a drop. See [gameplay.md](gameplay.md). |
| `dropGalletita()` / `dropRedbull()` | Reset a pooled item under the Gandalf with a 100 px/s start speed plus gravity. |
| `playGandalfSaxMusic()` / `playNyancatMusic()` | Stop the other track and loop this one. |
| `pad(n, len)` | Left-pads a number with zeros. |

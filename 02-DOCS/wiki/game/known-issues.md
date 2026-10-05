# Known issues

Found by reading the code (October 2026). Ordered by how much a player would notice.
None of these are fixed yet.

## 1. Best score is never saved, and "NEW RECORD" shows almost every game

`getHighScore()` reads the cookie `highScore`, but `gameOver()` writes `high_score`.
The saved value is never read back, so the best score resets on every page load.

Because `getHighScore()` then always returns `'0'`, the check `highScore <= getHighScore()`
in `gameOver()` is false for any score above zero. Result: "NEW RECORD! NYAN CAT WINS!"
appears on every game where you scored, even if you did not beat your best.

Fix: use one cookie name in both places, convert the value with `Number(...)`, and remember
the stored best before the game updates `highScore`.

## 2. Pressing R too early crashes or leaves stale text

`update()` allows a restart as soon as `lives == 0`. `gameOver()` only creates
`gameOverText` and `restartText` after 1 s.

- In the first game, R inside that second calls `gameOverText.destroy()` on `undefined`:
  `TypeError`, and the game stops.
- In later games, R destroys the old texts, then the pending timeout draws "GAME OVER"
  text on top of the new game, and it never goes away.

Fix: only accept R once the game-over texts exist (for example a `isGameOver` flag set
inside the timeout).

## 3. Music loop listeners pile up

`playGandalfSaxMusic()` and `playNyancatMusic()` add a new `onLoop` listener every time
they run, and the listener calls the same function again. Each loop adds more listeners,
so the track is stopped and restarted more and more times per loop. In long sessions this
can cause stutter.

Fix: the sounds are already created with `loop = true`; just `play()` them and drop the
`onLoop` handlers.

## 4. Gandalfs reaching the bottom do not end the game

There is no invasion check. The grid moves down 8 px per sweep forever (while Nyan is
alive) and can pass below the player. It is a design choice or a gap, decide which.

## 5. Accidental globals

In `javascripts/game.js` the `var` statements end early:

```js
initialPlayerPosition = 512;   // ; ends the var
    lives = 3,                 // these become implicit globals
```

Same for `highScore = 0;` before `galletaGravity`. It works in non-strict scripts but would
throw in strict mode or ES modules. Many other globals (`nyancat`, `gandalfs`, `rainbow`,
`galletita`, `chanceOfDroppingGalletita`, …) are also assigned without declaration.

## 6. Frame-rate dependent gameplay

Nyan's acceleration and the drop chances are applied per frame. On 120 Hz or 144 Hz
screens the game is noticeably harder. Fix: scale by `game.time.elapsed`, or use timers.

## 7. Smaller issues

- `newWave()` calls `gandalfs.removeAll()` and then `game.add.group()`; old empty groups
  are never destroyed.
- `explode()` assumes a free explosion in the pool of 10; if all are busy it throws.
- Red Bull drops play the cookie sound (`galletitaSound`).
- `respawnNyan()` does not reset Nyan's velocity.
- Timers use `setTimeout`, so they keep running if Phaser pauses (for example when the tab
  loses focus).
- The page layout is fixed at 1024 × 576 (`stylesheets/all.css`). It does not scale on small
  screens or phones, and there are no touch controls.
- `images/ship.png` and `stylesheets/normalize.css` are unused.

## 8. Tooling

- The Gulp build is dead (see [development.md](development.md)). `package.json` lists
  outdated packages that would bring in known vulnerabilities if installed.
- Phaser 2.0.4 dates from 2014. Upgrading to Phaser CE 2.x is the low-risk path; Phaser 3 is
  a rewrite.

# Gameplay and tuning

## Rules

- You are Nyan Cat, at the bottom of a 1024 × 576 field. You start with **3 lives**.
- 30 Gandalfs (3 rows × 10) sway left and right and slowly come down.
- Shoot rainbows with **Space**. Each Gandalf you hit is worth **10 points** (300 per wave).
- Gandalfs drop **fortune cookies**. A cookie hit costs one life.
- Now and then a Gandalf drops a **Red Bull**. Catch it for **+1 life** (no upper limit).
- Clear the wave and a new one appears after 1 s. Cookies fall faster every wave.
- At 0 lives the game ends. Press **R** to play again.
- If you beat the best score, the music switches to Nyan Cat and you see
  "NEW RECORD! NYAN CAT WINS!". Otherwise: "GANDALF WINS AGAIN".
  (The record check is currently broken — see [known-issues.md](known-issues.md).)

There is no way to lose by "invasion": Gandalfs that reach the bottom do not end the game.

## Controls

| Key | Action |
| --- | --- |
| ← / → | Accelerate left / right. Nyan has inertia and bounces off the side walls. |
| Space | Shoot a rainbow (max one every 400 ms, max 5 on screen). |
| R | Restart, only after game over. |

## Tuning values

All numbers live in `javascripts/game.js` unless noted. Change them there.

| Value | Where | Current | Effect |
| --- | --- | --- | --- |
| Canvas size | `new Phaser.Game(...)` | 1024 × 576 | Must match `#game` in `stylesheets/all.css` and `images/euskal.jpg`. |
| Starting lives | `lives`, `restartGame()` | 3 | Set in two places. |
| Nyan start x | `initialPlayerPosition` | 512 | Spawn/respawn x. Start y is 540 (`create.js`). |
| Nyan max speed | `nyanMovement()` `max` | 300 px/s | |
| Nyan acceleration | `nyanMovement()` `step` | 10 px/s per frame | |
| Nyan braking | `nyanMovement()` `slowing` | 2 px/s per frame | |
| Shot cooldown | `fireRainbow()` | 400 ms | |
| Shot speed | `fireRainbow()` `velocity` | −500 px/s | Plus ¼ of Nyan's x speed. |
| Shots on screen | `rainbows.createMultiple` (`create.js`) | 5 | |
| Points per Gandalf | `rainbowHitsGandalf()` `addScore` | 10 | |
| Grid | `createGandalfs()` | 3 × 10, spacing 72 × 48, origin (64, 96) | |
| Sideways sweep | `animateGandalfs()` | x 64 → 308, 2.5 s each way | |
| Descent | `descend()` | 8 px per sweep | |
| Cookie start speed | `dropGalletita()` | 100 px/s | |
| Cookie gravity | `initialGalletaGravity` / `stepGalletaGravity` | 250, +100 per wave | Reset to 250 at game over. |
| Cookies on screen | `galletitas.createMultiple` (`create.js`) | 10 | |
| Cookie drop chance | `handleGalletitas()` | 1 in (20 × living + 1), per Gandalf per frame | |
| Red Bull gravity | `dropRedbull()` | 350 | |
| Red Bull drop chance | `handleRedbulls()` | 1 in (500 × living + 1), per Gandalf per frame | |
| Red Bulls on screen | `redbulls.createMultiple` (`create.js`) | 1 | |
| Respawn / new-wave delay | `respawnNyan()`, `newWave()`, `gameOver()` | 1000 ms | |

### How often things drop

Each frame every living Gandalf rolls a die. With *N* Gandalfs alive, each one has a
1 / (20N + 1) chance, so the whole wave drops about **1 cookie every 20 frames**
(about 3 per second at 60 fps) no matter how many are left. Fewer Gandalfs means each
one fires more often, not that the wave fires less. Red Bulls work the same way with 500,
so about **1 every 500 frames** (about every 8 s), limited to one on screen.

These rates depend on frame rate: on a 120 Hz display the game drops twice as much and
Nyan accelerates twice as fast.

## Difficulty curve

The only thing that scales between waves is cookie gravity (+100 per wave). Drop rate,
Gandalf speed and descent stay the same.

# Assets

All assets are loaded in `javascripts/preload.js`. Image URLs carry a `?v=N` query to bust
the browser cache: bump it when you replace a file.

## Images (`images/`)

| Cache key | File | Type | Size | Frames | Used for |
| --- | --- | --- | --- | --- | --- |
| `background` | `euskal.jpg` | image | 1024 × 576 | — | Background (Euskal Encounter). |
| `header` | `header.png` | image | 1024 × 30 | — | HUD bar behind lives / score text. |
| `nyan` | `nyan.png` | image | 29 × 42 | — | Player. |
| `galletita` | `galletita.png` | image | 20 × 18 | — | Enemy shot (fortune cookie). |
| `gandalf` | `gandalf.png` | spritesheet | 40 × 60 | 3 | Enemy, animated at 5 fps. |
| `rainbow` | `rainbow.png` | spritesheet | 40 × 40 | 3 | Player shot, animated at 10 fps. |
| `redbull` | `redbull.png` | spritesheet | 75 × 60 | 4 | Extra-life pickup (animation is commented out, shows frame 0). |
| `explosion` | `explosion.png` | spritesheet | 80 × 80 | 10 | Explosion, 30 fps, plays once. |
| `saxguy` | `saxguy.png` | spritesheet | 300 × 130 | 13 | Decorative sax player at (385, 25), 10 fps. |
| — | `ship.png` | — | 40 × 24 | — | Not used. |

"Size" for a spritesheet is the size of one frame.

## Sounds (`sounds/`)

| Cache key | File | Loop | Played when |
| --- | --- | --- | --- |
| `meow` | `meow.wav` | no | Nyan shoots. |
| `explosion` | `explosion.wav` | no | Anything explodes. |
| `galletita` | `galletita.wav` | no | A cookie **or** a Red Bull is dropped. |
| `redbull` | `redbull.wav` | no | Nyan catches a Red Bull. |
| `gandalf_epic_sax` | `gandalf_epic_sax.mp3` | yes | Normal play music. |
| `nyancat` | `nyancat.mp3` | yes | After a new record. |

Browsers block audio until the page gets a user gesture. The music may only start after
the first key press or click.

## Other files

- `favicon.ico` — tab icon.
- `screen.PNG` — README screenshot (about 900 KB).

## Credits

See the "External Resources" section in the root `README.md` for the source and licence
of each third-party sound and image.

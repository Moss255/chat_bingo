# Chat Bingo

A small bingo game built with plain HTML and Web Components — no build step,
no framework, no dependencies to install.

Enter a game code and a list of bingo entries (one per line), hit **Go**, and
you get a 5×5 board. The board is deterministic: the same game code always
produces the same board, so everyone using a given code plays the same one.
Tap a square to mark it.

## Running it

Just open `index.html` in a browser. It also works served from any static
host (it's all static files), which is how it's deployed.

## Files

| File            | Purpose                                                              |
| --------------- | ------------------------------------------------------------------- |
| `index.html`    | Page shell; loads styles and scripts and mounts `<bingo-app>`.      |
| `bingo.js`      | Deterministic cell-selection logic (seeded from the game code).     |
| `components.js` | The custom elements: `bingo-app`, `bingo-input`, `bingo-chart`, `bingo-cell`. |
| `styles.css`    | Layout and board styling.                                           |

## How the board is generated

`bingo.js` seeds a PRNG from the full game code, deterministically shuffles the
entries you typed in, and takes the first 25 to fill the board. The same game
code and entries always produce the same board (so it can be shared), while
different codes produce different boards. Every entry is eligible, so a board
never has blank or repeated squares (the input form requires at least 25
entries).

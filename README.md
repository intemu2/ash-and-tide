# ASH AND TIDE — a duel of cards

[![make.fun](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/c/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/intemu2/ash-and-tide/rank.svg)](https://make.fun/c/best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/intemu2/ash-and-tide/reward.svg)](https://make.fun/c/best-card-game-20261122-1826)

An original card game for make.fun's best-card-game bounty. You duel Marra,
Keeper of the Lighthouse, card by card: first to sink the other from 20 life
wins.

## How to play

- Each round Marra telegraphs the suit she aims for — read it and counter it.
- Ember beats Thorn, Thorn beats Tide, Tide beats Ember; Stone is neutral.
- Otherwise the higher number wins the trick. Damage is the number gap + 1.
- Combos: play the same suit twice in a row (+2 PAIR) or values one apart
  (+3 RUN).
- Click a card in your hand, or press 1–5. Enter starts the game and plays
  again after a win or a loss.

## Run it

```
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no
network requests: every file the game loads lives under `game/`.

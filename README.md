# ASH AND TIDE — a duel of cards

[![make.fun](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/c/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/intemu2/ash-and-tide/rank.svg)](https://make.fun/c/best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/intemu2/ash-and-tide/reward.svg)](https://make.fun/c/best-card-game-20261122-1826)

An original card game for make.fun's best-card-game bounty. You face a
gauntlet of three rivals of the lighthouse — Marra, Sister Brine and Cinder
Warden — card by card, with a 24-card deck and one relic. Sink all three
from 20 life each to win; your life carries over, with +4 healed between
rivals.

## How to play

- Pick a relic first: Emberbrand (+2 damage on Ember wins), Tideglass
  (draw 2 on Tide wins), or Thornmail (reflect 1 when you lose a trick).
- Each round a rival telegraphs the suit she aims for — read it and
  counter it. Ember beats Thorn, Thorn beats Tide, Tide beats Ember;
  Stone is neutral.
- Otherwise the higher number wins the trick. Damage is the number gap + 1.
- Every round has two decisions: play 1 card, then discard 1 to draw a
  fresh one.
- Combos: play the same suit twice in a row (+2 PAIR), values one apart
  (+3 RUN), or three of a suit in a row (+4 FLUSH).
- Each rival plays differently: Marra reads the table, Brine floods Tide
  (+1 on Tide wins), Cinder swings for the biggest hit (+1 on Ember wins).
- Click a card in your hand, or press 1–5. Enter starts the game and plays
  again after a win or a loss. Press 1–3 on the title screen to pick a relic.

## Run it

```
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no
network requests: every file the game loads lives under `game/`.

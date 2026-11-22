// Deck, hands and drawing for ASH AND TIDE.
// A card is { suit, value }. Deck: 4 suits x values 1..9 = 36 cards.
import { HAND_SIZE, SUIT_KEYS } from './config.js';

/** Small deterministic RNG (mulberry32) so a seed always deals the same game. */
export function createRandom(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fresh shuffled 36-card deck. */
export function buildDeck(random) {
  const deck = [];
  for (const suit of SUIT_KEYS) {
    for (let value = 1; value <= 9; value += 1) deck.push({ suit, value });
  }
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }
  return deck;
}

/** Human-readable card label, e.g. "Ember 7". */
export function cardLabel(card) {
  return `${card.suit.charAt(0)}${card.suit.slice(1).toLowerCase()} ${card.value}`;
}

/**
 * Deal state: deck, discard pile, both hands. Hands refill to HAND_SIZE
 * after every trick; an empty deck reshuffles the discards.
 */
export function createTable(random) {
  const table = { random, deck: buildDeck(random), discard: [], you: [], marra: [] };
  drawUp(table, 'you');
  drawUp(table, 'marra');
  return table;
}

export function drawUp(table, who) {
  while (table[who].length < HAND_SIZE) {
    if (table.deck.length === 0) {
      if (table.discard.length === 0) return;
      table.deck = table.discard;
      table.discard = [];
      for (let i = table.deck.length - 1; i > 0; i -= 1) {
        const j = Math.floor(table.random() * (i + 1));
        const tmp = table.deck[i];
        table.deck[i] = table.deck[j];
        table.deck[j] = tmp;
      }
    }
    table[who].push(table.deck.pop());
  }
}

/** Remove one card from a hand by index and put it on the discard pile. */
export function playFromHand(table, who, index) {
  const card = table[who].splice(index, 1)[0];
  table.discard.push(card);
  return card;
}

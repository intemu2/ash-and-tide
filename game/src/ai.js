// The three rivals: each picks a card its own way, then telegraphs its suit
// honestly so the player can read the intent and counter it (criterion 2).
import { resolveTrick, trickWinner } from './rules.js';

/**
 * Simulate one rival card against every card in the player's hand: the
 * average damage swing (damage it deals minus damage it takes).
 */
function averageSwing(card, yourHand, yourPrev1, yourPrev2, rivalPrev1, rivalPrev2) {
  let total = 0;
  for (const yourCard of yourHand) {
    const out = resolveTrick(yourCard, card, yourPrev1, yourPrev2, rivalPrev1, rivalPrev2);
    if (out.winner === 'rival') total += out.damage;
    else if (out.winner === 'you') total -= out.damage;
  }
  return total / Math.max(1, yourHand.length);
}

/**
 * Pick a card for the rival in `rival.style`:
 * - balanced (Marra): best average swing.
 * - tide (Brine): best average swing, Tide cards favoured (+6).
 * - fierce (Cinder): biggest single-trick hit, Ember cards favoured (+6).
 * Deterministic: ties keep the earliest card.
 * Returns { index, card, intentSuit }.
 */
export function chooseRivalCard(rival, rivalHand, yourHand, yourPrev1, yourPrev2, rivalPrev1, rivalPrev2) {
  let bestIndex = 0;
  let bestScore = -Infinity;
  for (let i = 0; i < rivalHand.length; i += 1) {
    const card = rivalHand[i];
    let score;
    if (rival.style === 'fierce') {
      let best = -Infinity;
      for (const yourCard of yourHand) {
        const out = resolveTrick(yourCard, card, yourPrev1, yourPrev2, rivalPrev1, rivalPrev2);
        const swing = out.winner === 'rival' ? out.damage : out.winner === 'you' ? -out.damage : 0;
        if (swing > best) best = swing;
      }
      score = best + (card.suit === 'EMBER' ? 6 : 0);
    } else {
      score = averageSwing(card, yourHand, yourPrev1, yourPrev2, rivalPrev1, rivalPrev2)
        + (rival.style === 'tide' && card.suit === 'TIDE' ? 6 : 0);
    }
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }
  const card = rivalHand[bestIndex];
  return { index: bestIndex, card, intentSuit: card.suit };
}

/** The rival's weakest card (used by the loss-scene autopilot, never in play). */
export function chooseWeakestCard(hand) {
  let index = 0;
  for (let i = 1; i < hand.length; i += 1) {
    if (hand[i].value < hand[index].value) index = i;
  }
  return index;
}

/** The rival's strongest card (used by the loss-scene autopilot to sabotage the player). */
export function chooseStrongestCard(hand) {
  let index = 0;
  for (let i = 1; i < hand.length; i += 1) {
    if (hand[i].value > hand[index].value) index = i;
  }
  return index;
}

/**
 * The player's best counter to a telegraphed card: the card that wins the
 * trick dealing the most damage; if none wins, the cheapest loser.
 * Used by the autopilot, never forced on the player.
 */
export function bestCounter(yourHand, rivalCard, yourPrev1, yourPrev2, rivalPrev1, rivalPrev2) {
  let bestIndex = 0;
  let bestScore = -Infinity;
  for (let i = 0; i < yourHand.length; i += 1) {
    const out = resolveTrick(yourHand[i], rivalCard, yourPrev1, yourPrev2, rivalPrev1, rivalPrev2);
    const score = out.winner === 'you' ? out.damage + 10 : out.winner === 'draw' ? 0 : -out.damage;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }
  return bestIndex;
}

/** The player's worst card (used by the loss-scene autopilot). */
export function worstCard(yourHand, rivalCard, yourPrev1, yourPrev2, rivalPrev1, rivalPrev2) {
  let worstIndex = 0;
  let worstScore = Infinity;
  for (let i = 0; i < yourHand.length; i += 1) {
    const out = resolveTrick(yourHand[i], rivalCard, yourPrev1, yourPrev2, rivalPrev1, rivalPrev2);
    const score = out.winner === 'you' ? out.damage : out.winner === 'draw' ? 0 : -out.damage;
    if (score < worstScore) {
      worstScore = score;
      worstIndex = i;
    }
  }
  return worstIndex;
}

export { trickWinner };

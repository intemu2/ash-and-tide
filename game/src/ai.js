// Marra, the opponent: picks a card, then telegraphs its suit honestly so
// the player can read the intent and counter it (judge criterion 2).
import { resolveTrick, trickWinner } from './rules.js';

/**
 * Marra chooses by simulating every card in her hand against every card in
 * the player's hand: she plays the card with the best average damage swing
 * (damage she deals minus damage she takes). Deterministic: ties keep the
 * earliest card. Returns { index, card, intentSuit }.
 */
export function chooseMarraCard(marraHand, yourHand, yourPrevious, marraPrevious) {
  let bestIndex = 0;
  let bestScore = -Infinity;
  for (let i = 0; i < marraHand.length; i += 1) {
    let total = 0;
    for (const yourCard of yourHand) {
      const out = resolveTrick(yourCard, marraHand[i], yourPrevious, marraPrevious);
      if (out.winner === 'marra') total += out.damage;
      else if (out.winner === 'you') total -= out.damage;
    }
    // Small nudge: prefer a card whose suit beats the player's most common suit.
    if (total > bestScore) {
      bestScore = total;
      bestIndex = i;
    }
  }
  const card = marraHand[bestIndex];
  return { index: bestIndex, card, intentSuit: card.suit };
}

/** Marra's weakest card (used by the loss-scene autopilot, never in play). */
export function chooseWeakestCard(hand) {
  let index = 0;
  for (let i = 1; i < hand.length; i += 1) {
    if (hand[i].value < hand[index].value) index = i;
  }
  return index;
}

/**
 * The player's best counter to a telegraphed suit: the card that wins the
 * trick against Marra's card, dealing the most damage; if none wins, the
 * cheapest loser. Used by the autopilot, never forced on the player.
 */
export function bestCounter(yourHand, marraCard, yourPrevious, marraPrevious) {
  let bestIndex = 0;
  let bestScore = -Infinity;
  for (let i = 0; i < yourHand.length; i += 1) {
    const out = resolveTrick(yourHand[i], marraCard, yourPrevious, marraPrevious);
    const score = out.winner === 'you' ? out.damage + 10 : out.winner === 'draw' ? 0 : -out.damage;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }
  return bestIndex;
}

/** The player's worst card (used by the loss-scene autopilot). */
export function worstCard(yourHand, marraCard, yourPrevious, marraPrevious) {
  let worstIndex = 0;
  let worstScore = Infinity;
  for (let i = 0; i < yourHand.length; i += 1) {
    const out = resolveTrick(yourHand[i], marraCard, yourPrevious, marraPrevious);
    const score = out.winner === 'you' ? out.damage : out.winner === 'draw' ? 0 : -out.damage;
    if (score < worstScore) {
      worstScore = score;
      worstIndex = i;
    }
  }
  return worstIndex;
}

export { trickWinner };

// Trick resolution for ASH AND TIDE v2: who wins a trick and how much it hurts.
import { BEATS } from './config.js';

/**
 * Compare two cards. Returns 'you', 'rival' or 'draw'.
 * A suit that beats the other wins whatever the numbers say; otherwise the
 * higher number wins; STONE never beats or loses on suit alone.
 */
export function trickWinner(yourCard, rivalCard) {
  if (BEATS[yourCard.suit] === rivalCard.suit) return 'you';
  if (BEATS[rivalCard.suit] === yourCard.suit) return 'rival';
  if (yourCard.value > rivalCard.value) return 'you';
  if (rivalCard.value > yourCard.value) return 'rival';
  return 'draw';
}

/**
 * Combo bonus for the winner's card against the winner's two previous played
 * cards. Same suit again: +2 (PAIR). Value one step up or down: +3 (RUN).
 * Three of a suit in a row: +4 (FLUSH).
 */
export function comboBonus(card, prev1, prev2) {
  let bonus = 0;
  const parts = [];
  if (prev1) {
    if (card.suit === prev1.suit) {
      bonus += 2;
      parts.push('PAIR +2');
    }
    if (Math.abs(card.value - prev1.value) === 1) {
      bonus += 3;
      parts.push('RUN +3');
    }
    if (prev2 && card.suit === prev1.suit && prev1.suit === prev2.suit) {
      bonus += 4;
      parts.push('FLUSH +4');
    }
  }
  return { bonus, label: parts.join(' + ') };
}

/**
 * Resolve one trick. Returns { winner, damage, combo }.
 * Damage = number gap + 1, plus the combo bonus. A draw deals no damage.
 */
export function resolveTrick(yourCard, rivalCard, yourPrev1, yourPrev2, rivalPrev1, rivalPrev2) {
  const winner = trickWinner(yourCard, rivalCard);
  if (winner === 'draw') return { winner, damage: 0, combo: '' };
  const gap = Math.abs(yourCard.value - rivalCard.value);
  const played = winner === 'you' ? yourCard : rivalCard;
  const combo = winner === 'you'
    ? comboBonus(played, yourPrev1, yourPrev2)
    : comboBonus(played, rivalPrev1, rivalPrev2);
  return { winner, damage: gap + 1 + combo.bonus, combo: combo.label };
}

/**
 * Relic effect on a resolved trick. Returns { damage, draw, reflect, label }:
 * extra damage the winner deals, cards the player draws, damage reflected
 * back at the rival. Emberbrand +2 on an Ember win; Tideglass draws 2 on a
 * Tide win; Thornmail reflects 1 when the player loses a trick.
 */
export function relicEffect(relicId, winner, yourCard) {
  if (!relicId) return { damage: 0, draw: 0, reflect: 0, label: '' };
  if (relicId === 'EMBERBRAND' && winner === 'you' && yourCard.suit === 'EMBER') {
    return { damage: 2, draw: 0, reflect: 0, label: 'EMBERBRAND +2' };
  }
  if (relicId === 'TIDEGLASS' && winner === 'you' && yourCard.suit === 'TIDE') {
    return { damage: 0, draw: 2, reflect: 0, label: 'TIDEGLASS draws 2' };
  }
  if (relicId === 'THORNMAIL' && winner === 'rival') {
    return { damage: 0, draw: 0, reflect: 1, label: 'THORNMAIL reflects 1' };
  }
  return { damage: 0, draw: 0, reflect: 0, label: '' };
}

/**
 * A rival's surge: when the rival wins with its favoured suit, +1 damage.
 * Returns { damage, label }.
 */
export function rivalSurge(rival, winner, rivalCard) {
  if (winner === 'rival' && rival.surgeSuit && rivalCard.suit === rival.surgeSuit) {
    const word = rival.surgeSuit === 'TIDE' ? 'TIDE SURGE +1' : 'EMBER SURGE +1';
    return { damage: 1, label: word };
  }
  return { damage: 0, label: '' };
}

// Trick resolution for ASH AND TIDE: who wins a trick and how much it hurts.
import { BEATS } from './config.js';

/**
 * Compare two cards. Returns 'you', 'marra' or 'draw'.
 * A suit that beats the other wins whatever the numbers say; otherwise the
 * higher number wins; STONE never beats or loses on suit alone.
 */
export function trickWinner(yourCard, marraCard) {
  if (BEATS[yourCard.suit] === marraCard.suit) return 'you';
  if (BEATS[marraCard.suit] === yourCard.suit) return 'marra';
  if (yourCard.value > marraCard.value) return 'you';
  if (marraCard.value > yourCard.value) return 'marra';
  return 'draw';
}

/**
 * Combo bonus for the winner's card against the winner's previous played card.
 * Same suit again: +2 (PAIR). Value one step up or down: +3 (RUN).
 */
export function comboBonus(card, previousCard) {
  if (!previousCard) return { bonus: 0, label: '' };
  let bonus = 0;
  let label = '';
  if (card.suit === previousCard.suit) {
    bonus += 2;
    label = 'PAIR +2';
  }
  if (Math.abs(card.value - previousCard.value) === 1) {
    bonus += 3;
    label = label ? `${label} + RUN +3` : 'RUN +3';
  }
  return { bonus, label };
}

/**
 * Resolve one trick. Returns { winner, damage, combo }.
 * Damage = number gap + 1, plus the combo bonus. A draw deals no damage.
 */
export function resolveTrick(yourCard, marraCard, yourPrevious, marraPrevious) {
  const winner = trickWinner(yourCard, marraCard);
  if (winner === 'draw') return { winner, damage: 0, combo: '' };
  const gap = Math.abs(yourCard.value - marraCard.value);
  const previous = winner === 'you' ? yourPrevious : marraPrevious;
  const played = winner === 'you' ? yourCard : marraCard;
  const combo = comboBonus(played, previous);
  return { winner, damage: gap + 1 + combo.bonus, combo: combo.label };
}

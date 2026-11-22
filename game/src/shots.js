// Screenshot scenes behind ?shot=title|table|win|loss.
// Each scene plays the REAL rules forward from a fresh deal with a fixed
// seed, steered by an autopilot, so the frame is what a real game looks like
// and the same seed always gives the same frame. Win and loss are reached
// through the rules, never faked.
import { createRandom, createTable, drawUp, playFromHand } from './cards.js';
import { resolveTrick } from './rules.js';
import { bestCounter, chooseMarraCard, chooseWeakestCard, worstCard } from './ai.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { START_LIFE } from './config.js';

/** Fresh game state for one screenshot scene. */
export function freshState(seed) {
  const random = createRandom(seed);
  return {
    random,
    table: createTable(random),
    youLife: START_LIFE,
    marraLife: START_LIFE,
    round: 1,
    yourTricks: 0,
    marraTricks: 0,
    marraPick: null,
    playedYou: null,
    playedMarra: null,
    lastTrick: '',
    lastDamage: null,
    comboBadge: '',
    phase: 'await-pick',
    winner: null,
    flipT: 1,
    hoverIndex: -1,
    selectedIndex: -1,
    yourPrevious: null,
    marraPrevious: null,
  };
}

/**
 * Play one trick inside `state`. `yourIndex` picks the player's card;
 * Marra has already committed to `state.marraPick`. Applies damage, refills
 * hands, advances the round, and records the history line.
 */
export function playTrick(state, yourIndex) {
  const yourCard = playFromHand(state.table, 'you', yourIndex);
  const marraCard = playFromHand(state.table, 'marra', state.marraPick.index);
  const out = resolveTrick(yourCard, marraCard, state.yourPrevious, state.marraPrevious);
  state.playedYou = yourCard;
  state.playedMarra = marraCard;
  state.flipT = 1;
  state.yourPrevious = yourCard;
  state.marraPrevious = marraCard;
  state.comboBadge = out.combo;
  if (out.winner === 'you') {
    state.marraLife = Math.max(0, state.marraLife - out.damage);
    state.yourTricks += 1;
    state.lastDamage = { text: `-${out.damage} to MARRA`, side: 'you' };
  } else if (out.winner === 'marra') {
    state.youLife = Math.max(0, state.youLife - out.damage);
    state.marraTricks += 1;
    state.lastDamage = { text: `-${out.damage} to YOU`, side: 'marra' };
  } else {
    state.lastDamage = { text: 'DRAW — no damage', side: 'draw' };
  }
  const winnerWord = out.winner === 'you' ? 'YOU WIN the trick' : out.winner === 'marra' ? 'MARRA WINS the trick' : 'DRAW';
  state.lastTrick = `Round ${state.round}: You ${yourCard.suit} ${yourCard.value} vs Marra ${marraCard.suit} ${marraCard.value} — ${winnerWord}`;
  state.round += 1;
  state.phase = 'reveal';
  drawUp(state.table, 'you');
  drawUp(state.table, 'marra');
  if (state.youLife <= 0) state.winner = 'marra';
  else if (state.marraLife <= 0) state.winner = 'you';
  return out;
}

/** Marra commits to her card for the next trick (her suit is telegraphed). */
export function marraCommits(state) {
  state.marraPick = chooseMarraCard(state.table.marra, state.table.you, state.yourPrevious, state.marraPrevious);
  state.phase = 'await-pick';
}

/** Run tricks until `stop(state)` is true or 60 tricks pass. */
function runUntil(state, yourPolicy, marraWeak, stop) {
  for (let i = 0; i < 60; i += 1) {
    if (stop(state)) break;
    if (marraWeak) state.marraPick = { index: chooseWeakestCard(state.table.marra), card: state.table.marra[chooseWeakestCard(state.table.marra)], intentSuit: state.table.marra[chooseWeakestCard(state.table.marra)].suit };
    else marraCommits(state);
    const yourIndex = yourPolicy(state);
    playTrick(state, yourIndex);
    if (state.winner) break;
  }
  return state;
}

/**
 * Stage a named scene and return { screen, state }.
 * - title: fresh deal, title screen.
 * - table: a tense mid-duel (Marra's life down to 9 or below, you still
 *   healthy) with the last trick on the table.
 * - win: played through until Marra's life hits 0.
 * - loss: played through until your life hits 0.
 */
export function stageShot(name, seed) {
  const state = freshState(seed);
  if (name === 'win') {
    runUntil(state, (s) => bestCounter(s.table.you, s.marraPick.card, s.yourPrevious, s.marraPrevious), false, (s) => s.marraLife <= 0);
    return { screen: SCREEN_OVER, state };
  }
  if (name === 'loss') {
    runUntil(state, (s) => worstCard(s.table.you, s.marraPick.card, s.yourPrevious, s.marraPrevious), false, (s) => s.youLife <= 0);
    return { screen: SCREEN_OVER, state };
  }
  if (name === 'table') {
    runUntil(state, (s) => bestCounter(s.table.you, s.marraPick.card, s.yourPrevious, s.marraPrevious), false, (s) => s.marraLife <= 9 && s.youLife >= 12);
    // Stage the next trick's telegraph so the frame shows intent + last trick.
    if (!state.winner) marraCommits(state);
    state.phase = 'await-pick';
    return { screen: SCREEN_PLAY, state };
  }
  return { screen: SCREEN_TITLE, state };
}

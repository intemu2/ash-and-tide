// Game state and screenshot scenes for ASH AND TIDE v2.
// Each scene plays the REAL rules forward from a fresh deal with a fixed
// seed, steered by an autopilot, so the frame is what a real game looks like
// and the same seed always gives the same frame. Win and loss are reached
// through the rules, never faked.
import { createRandom, createTable, discardAndDraw, drawOne, drawUp, playFromHand, trimWeakest } from './cards.js';
import { relicEffect, resolveTrick, rivalSurge } from './rules.js';
import { bestCounter, chooseRivalCard, chooseStrongestCard, chooseWeakestCard, worstCard } from './ai.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { HEAL_BETWEEN, RIVALS, START_LIFE } from './config.js';

/** Fresh game state for one duel (or one screenshot scene). */
export function freshState(seed, relicId = 'EMBERBRAND') {
  const random = createRandom(seed);
  return {
    random,
    table: createTable(random),
    youLife: START_LIFE,
    rivalLife: START_LIFE,
    round: 1,
    yourTricks: 0,
    rivalTricks: 0,
    rivalPick: null,
    playedYou: null,
    playedRival: null,
    lastTrick: '',
    lastDamage: null,
    comboBadge: '',
    phase: 'await-pick',
    nextPhase: 'await-pick',
    winner: null,
    flipT: 1,
    hoverIndex: -1,
    selectedIndex: -1,
    yourPrev1: null,
    yourPrev2: null,
    rivalPrev1: null,
    rivalPrev2: null,
    rivalIndex: 0,
    rival: RIVALS[0],
    relic: relicId,
    rivalsBeaten: 0,
  };
}

/** The current rival commits to her card for the next trick (suit telegraphed). */
export function rivalCommits(state) {
  state.rivalPick = chooseRivalCard(
    state.rival, state.table.rival, state.table.you,
    state.yourPrev1, state.yourPrev2, state.rivalPrev1, state.rivalPrev2,
  );
  state.phase = 'await-pick';
}

/** A rival sinks: heal, bring in the next rival with a fresh deck and hands. */
export function advanceRival(state) {
  const beaten = state.rival;
  state.rivalsBeaten += 1;
  state.youLife = Math.min(START_LIFE, state.youLife + HEAL_BETWEEN);
  state.rivalIndex += 1;
  state.rival = RIVALS[state.rivalIndex];
  state.rivalLife = START_LIFE;
  state.table = createTable(state.random);
  state.playedYou = null;
  state.playedRival = null;
  state.lastDamage = null;
  state.comboBadge = '';
  state.yourPrev1 = null;
  state.yourPrev2 = null;
  state.rivalPrev1 = null;
  state.rivalPrev2 = null;
  state.lastTrick = `${beaten.name} sinks! ${state.rival.name} steps up — you heal +${HEAL_BETWEEN} life.`;
  rivalCommits(state);
}

/**
 * Play one trick inside `state`. `yourIndex` picks the player's card;
 * the rival has already committed to `state.rivalPick`. Applies damage
 * (combos, relic, rival surge), refills hands, and sets the next phase:
 * 'await-discard' for the second decision, 'await-pick' when a rival
 * sinks and the next one steps up, 'over' when the gauntlet ends.
 */
export function playTrick(state, yourIndex) {
  const yourCard = playFromHand(state.table, 'you', yourIndex);
  const rivalCard = playFromHand(state.table, 'rival', state.rivalPick.index);
  const out = resolveTrick(yourCard, rivalCard, state.yourPrev1, state.yourPrev2, state.rivalPrev1, state.rivalPrev2);
  const relic = relicEffect(state.relic, out.winner, yourCard);
  const surge = rivalSurge(state.rival, out.winner, rivalCard);
  const damage = out.damage + relic.damage + surge.damage;
  state.playedYou = yourCard;
  state.playedRival = rivalCard;
  state.flipT = 1;
  const badgeParts = [];
  if (out.combo) badgeParts.push(out.combo);
  if (relic.label) badgeParts.push(relic.label);
  if (surge.label) badgeParts.push(surge.label);
  state.comboBadge = badgeParts.join(' + ');
  if (out.winner === 'you') {
    state.rivalLife = Math.max(0, state.rivalLife - damage);
    state.yourTricks += 1;
    state.lastDamage = { text: `-${damage} to ${state.rival.short}`, side: 'you' };
  } else if (out.winner === 'rival') {
    state.youLife = Math.max(0, state.youLife - damage);
    state.rivalTricks += 1;
    if (relic.reflect > 0) {
      state.rivalLife = Math.max(0, state.rivalLife - relic.reflect);
    }
    state.lastDamage = { text: `-${damage} to YOU`, side: 'rival' };
  } else {
    state.lastDamage = { text: 'DRAW — no damage', side: 'draw' };
  }
  state.yourPrev2 = state.yourPrev1;
  state.yourPrev1 = yourCard;
  state.rivalPrev2 = state.rivalPrev1;
  state.rivalPrev1 = rivalCard;
  const winnerWord = out.winner === 'you' ? 'YOU WIN the trick' : out.winner === 'rival' ? `${state.rival.short} WINS the trick` : 'DRAW';
  state.lastTrick = `Round ${state.round}: You ${yourCard.suit} ${yourCard.value} vs ${state.rival.short} ${rivalCard.suit} ${rivalCard.value} — ${winnerWord}`;
  state.round += 1;
  state.phase = 'reveal';
  if (state.rivalLife <= 0) {
    if (state.rivalIndex < RIVALS.length - 1) {
      advanceRival(state);
      state.nextPhase = 'await-pick';
    } else {
      state.rivalsBeaten += 1;
      state.winner = 'you';
      state.nextPhase = 'over';
    }
  } else if (state.youLife <= 0) {
    state.winner = 'rival';
    state.nextPhase = 'over';
  } else {
    drawUp(state.table, 'you');
    drawUp(state.table, 'rival');
    if (relic.draw > 0) {
      drawOne(state.table, 'you');
      drawOne(state.table, 'you');
      trimWeakest(state.table, 'you', 5);
    }
    state.nextPhase = 'await-discard';
  }
  return out;
}

/**
 * The v2 second decision: discard one card from your hand, draw a fresh
 * one, and the rival commits her next card.
 */
export function discardStep(state, yourIndex) {
  // The played cards stay on the table until the next trick: the reveal
  // pause in the live loop clears them, the autopilot keeps them so the
  // staged frame shows the last trick.
  discardAndDraw(state.table, 'you', yourIndex);
  rivalCommits(state);
}

/** Run tricks until `stop(state)` is true, someone wins, or the cap hits. */
function runUntil(state, playPolicy, discardPolicy, stop, maxTricks = 200) {
  for (let i = 0; i < maxTricks; i += 1) {
    if (stop(state) || state.winner) break;
    if (state.phase === 'await-discard') {
      discardStep(state, discardPolicy(state));
    } else {
      if (!state.rivalPick) rivalCommits(state);
      playTrick(state, playPolicy(state));
      if (state.phase === 'reveal') state.phase = state.nextPhase;
    }
  }
  return state;
}

/** Autopilot discard: throw the weakest card away. */
function discardWeakest(state) {
  return chooseWeakestCard(state.table.you);
}

/** Sabotage discard: throw the strongest card away (loss scene). */
function discardStrongest(state) {
  return chooseStrongestCard(state.table.you);
}

function bestPlay(state) {
  return bestCounter(state.table.you, state.rivalPick.card, state.yourPrev1, state.yourPrev2, state.rivalPrev1, state.rivalPrev2);
}

function worstPlay(state) {
  return worstCard(state.table.you, state.rivalPick.card, state.yourPrev1, state.yourPrev2, state.rivalPrev1, state.rivalPrev2);
}

/**
 * Stage a named scene and return { screen, state }.
 * - title: fresh deal, title screen, Emberbrand chosen.
 * - table: a tense mid-gauntlet (rival 2 of 3, her life down to 9 or below,
 *   you still healthy) with the last trick on the table.
 * - win: played through all three rivals until you win the gauntlet.
 * - loss: played through until your life hits 0.
 */
export function stageShot(name, seed) {
  const state = freshState(seed, 'EMBERBRAND');
  if (name === 'win') {
    runUntil(state, bestPlay, discardWeakest, (s) => s.winner === 'you');
    return { screen: SCREEN_OVER, state };
  }
  if (name === 'loss') {
    runUntil(state, worstPlay, discardStrongest, (s) => s.winner === 'rival');
    return { screen: SCREEN_OVER, state };
  }
  if (name === 'table') {
    runUntil(
      state, bestPlay, discardWeakest,
      (s) => s.rivalIndex === 1 && s.rivalLife <= 9 && s.youLife >= 12,
    );
    // Finish the second decision too, so the frame shows the rival's
    // telegraphed intent for the next trick as well as the last trick.
    if (!state.winner && state.phase === 'await-discard') {
      discardStep(state, chooseWeakestCard(state.table.you));
    }
    return { screen: SCREEN_PLAY, state };
  }
  return { screen: SCREEN_TITLE, state };
}

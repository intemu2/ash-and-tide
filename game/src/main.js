// Boot and the game loop for ASH AND TIDE v2.
// ?seed=N fixes the deal. ?shot=title|table|win|loss (with &seed=N) stages
// that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { createRandom } from './cards.js';
import { createInput, hitCard } from './input.js';
import { playSound } from './audio.js';
import { createRenderer, playerHandRects, relicRects, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { discardStep, freshState, playTrick, rivalCommits, stageShot } from './shots.js';
import { RELIC_IDS } from './config.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const renderer = createRenderer(canvas);

// Surface any load/runtime error in the page title so a headless check sees it.
window.addEventListener('error', (event) => {
  document.title = `ERROR: ${event.message}`;
});

function announce(message) {
  status.textContent = message;
}

function runShot(name) {
  const scene = stageShot(name, seed);
  window.__scene = {
    screen: scene.screen,
    youLife: scene.state.youLife,
    rivalLife: scene.state.rivalLife,
    rivalIndex: scene.state.rivalIndex,
    rival: scene.state.rival.id,
    relic: scene.state.relic,
    winner: scene.state.winner,
    round: scene.state.round,
    yourTricks: scene.state.yourTricks,
    rivalTricks: scene.state.rivalTricks,
  };
  document.title = JSON.stringify(window.__scene);
  let painted = 0;
  function paint() {
    renderer.draw(scene.state, scene.screen);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const state = freshState(seed);
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let revealUntil = 0;

  function startGame() {
    const relic = state.relic || 'EMBERBRAND';
    const fresh = freshState(Math.floor(Math.random() * 4294967296), relic);
    Object.assign(state, fresh);
    rivalCommits(state);
    screen = SCREEN_PLAY;
    announce(`Playing. Beat ${state.rival.name}'s suit or number — then discard 1 to draw.`);
  }

  function playCard(index) {
    if (screen !== SCREEN_PLAY || state.phase !== 'await-pick') return;
    if (index < 0 || index >= state.table.you.length) return;
    state.selectedIndex = index;
    playSound('play');
    const out = playTrick(state, index);
    playSound(out.winner === 'you' ? 'win-trick' : out.winner === 'rival' ? 'lose-trick' : 'play');
    announce(state.lastTrick);
    state.selectedIndex = -1;
    revealUntil = performance.now() + 1400;
    if (state.winner) {
      screen = SCREEN_OVER;
      playSound(state.winner === 'you' ? 'win-game' : 'lose-game');
      announce(state.winner === 'you'
        ? 'You win the gauntlet! All three rivals sank.'
        : 'You lose. Your life reached 0.');
    }
  }

  function discardCard(index) {
    if (screen !== SCREEN_PLAY || state.phase !== 'await-discard') return;
    if (index < 0 || index >= state.table.you.length) return;
    playSound('play');
    discardStep(state, index);
    announce(`Discarded — fresh card drawn. ${state.rival.name} aims for ${state.rivalPick.intentSuit}.`);
  }

  function handleEvents(now) {
    for (const event of input.takeEvents()) {
      if (event.type === 'start') {
        if (screen === SCREEN_TITLE || screen === SCREEN_OVER) startGame();
      } else if (event.type === 'card') {
        if (screen === SCREEN_TITLE) {
          if (event.index < RELIC_IDS.length) {
            state.relic = RELIC_IDS[event.index];
            playSound('play');
            announce(`Relic chosen: ${state.relic}. Press Enter to start.`);
          }
        } else if (screen === SCREEN_PLAY) {
          if (state.phase === 'await-pick') playCard(event.index);
          else if (state.phase === 'await-discard') discardCard(event.index);
        }
      } else if (event.type === 'click') {
        if (screen === SCREEN_TITLE) {
          const relicIndex = hitCard(relicRects(), event.x, event.y);
          if (relicIndex >= 0) {
            state.relic = RELIC_IDS[relicIndex];
            playSound('play');
            announce(`Relic chosen: ${state.relic}. Press Enter to start.`);
          } else {
            startGame();
          }
        } else if (screen === SCREEN_OVER) {
          startGame();
        } else {
          const index = hitCard(playerHandRects(), event.x, event.y);
          if (index >= 0) {
            if (state.phase === 'await-pick') playCard(index);
            else if (state.phase === 'await-discard') discardCard(index);
          }
        }
      }
    }
    // After the reveal pause, clear the table and open the next phase.
    if (screen === SCREEN_PLAY && state.phase === 'reveal' && !state.winner && now >= revealUntil) {
      state.playedYou = null;
      state.playedRival = null;
      state.lastDamage = null;
      state.comboBadge = '';
      state.phase = state.nextPhase;
      if (state.phase === 'await-discard') {
        announce('Trick resolved — now discard 1 card to draw a fresh one.');
      }
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    handleEvents(now);
    // Hover highlight for the player's hand.
    const hover = input.hoverPoint();
    state.hoverIndex = -1;
    if (screen === SCREEN_PLAY && hover) {
      state.hoverIndex = hitCard(playerHandRects(), hover.x, hover.y);
    }
    renderer.draw(state, screen);
  }

  announce('ASH AND TIDE. Pick a relic, then click or press Enter to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();

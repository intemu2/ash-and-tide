// All drawing for ASH AND TIDE: one bright 1280x720 canvas, big cards, big
// numbers, big life totals. Every screen is drawn by this file alone.
import { CANVAS_H, CANVAS_W, LAYOUT, SUITS } from './config.js';
import { cardLabel } from './cards.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

/** Rects of the player's 5 hand cards, for mouse hit-testing. */
export function playerHandRects() {
  const rects = [];
  // Hand cards end 14px above the last-trick footer (baseline 700): the
  // footer then clears the cards by 14px and the canvas edge by 16px, so
  // the whole history line stays readable instead of touching the cards.
  const handH = LAYOUT.handH - 14;
  const total = 5 * LAYOUT.handW + 4 * LAYOUT.handGap;
  const x0 = (CANVAS_W - total) / 2;
  for (let i = 0; i < 5; i += 1) {
    rects.push({ x: x0 + i * (LAYOUT.handW + LAYOUT.handGap), y: LAYOUT.handY, w: LAYOUT.handW, h: handH });
  }
  return rects;
}

/** Rects of Marra's 5 face-down cards (shown, never clickable). */
function marraHandRects() {
  const rects = [];
  const total = 5 * LAYOUT.aiCardW + 4 * 10;
  const x0 = (CANVAS_W - total) / 2;
  for (let i = 0; i < 5; i += 1) {
    rects.push({ x: x0 + i * (LAYOUT.aiCardW + 10), y: LAYOUT.aiHandY, w: LAYOUT.aiCardW, h: LAYOUT.aiCardH });
  }
  return rects;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** One suit icon, drawn by shape (flame / wave / leaf / gem). */
export function drawSuitIcon(ctx, cx, cy, size, suitKey) {
  const suit = SUITS[suitKey];
  ctx.fillStyle = suit.color;
  ctx.strokeStyle = suit.dark;
  ctx.lineWidth = Math.max(2, size * 0.06);
  ctx.beginPath();
  if (suit.shape === 'flame') {
    ctx.moveTo(cx, cy - size * 0.55);
    ctx.bezierCurveTo(cx + size * 0.5, cy - size * 0.1, cx + size * 0.35, cy + size * 0.45, cx, cy + size * 0.5);
    ctx.bezierCurveTo(cx - size * 0.35, cy + size * 0.45, cx - size * 0.5, cy - size * 0.1, cx, cy - size * 0.55);
  } else if (suit.shape === 'wave') {
    ctx.moveTo(cx - size * 0.5, cy);
    ctx.bezierCurveTo(cx - size * 0.25, cy - size * 0.5, cx, cy + size * 0.4, cx + size * 0.25, cy - size * 0.1);
    ctx.bezierCurveTo(cx + size * 0.4, cy + size * 0.25, cx + size * 0.5, cy, cx + size * 0.5, cy + size * 0.15);
    ctx.lineTo(cx + size * 0.5, cy + size * 0.45);
    ctx.lineTo(cx - size * 0.5, cy + size * 0.45);
    ctx.closePath();
  } else if (suit.shape === 'leaf') {
    ctx.moveTo(cx, cy - size * 0.55);
    ctx.bezierCurveTo(cx + size * 0.55, cy - size * 0.2, cx + size * 0.4, cy + size * 0.5, cx, cy + size * 0.55);
    ctx.bezierCurveTo(cx - size * 0.4, cy + size * 0.5, cx - size * 0.55, cy - size * 0.2, cx, cy - size * 0.55);
  } else {
    ctx.moveTo(cx, cy - size * 0.55);
    ctx.lineTo(cx + size * 0.45, cy);
    ctx.lineTo(cx, cy + size * 0.55);
    ctx.lineTo(cx - size * 0.45, cy);
    ctx.closePath();
  }
  ctx.fill();
  ctx.stroke();
}

function drawCardFace(ctx, x, y, w, h, card) {
  const suit = SUITS[card.suit];
  roundRect(ctx, x, y, w, h, 12);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = suit.dark;
  ctx.stroke();
  // Suit colour band across the top.
  ctx.fillStyle = suit.color;
  ctx.fillRect(x + 4, y + 4, w - 8, 10);
  // Giant value, centre.
  ctx.fillStyle = '#1B1B1B';
  ctx.font = `900 ${Math.round(h * 0.42)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(card.value), x + w / 2, y + h * 0.38);
  // Big suit icon under the number.
  drawSuitIcon(ctx, x + w / 2, y + h * 0.72, Math.min(w, h) * 0.34, card.suit);
  // Suit name along the bottom.
  ctx.fillStyle = suit.dark;
  ctx.font = `900 ${Math.round(h * 0.09)}px Arial, sans-serif`;
  ctx.fillText(suit.name, x + w / 2, y + h * 0.93);
}

function drawCardBack(ctx, x, y, w, h) {
  roundRect(ctx, x, y, w, h, 10);
  ctx.fillStyle = '#1E3A5F';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#F2C14E';
  ctx.stroke();
  drawSuitIcon(ctx, x + w / 2, y + h / 2, Math.min(w, h) * 0.4, 'TIDE');
}

function drawLife(ctx, x, y, label, life, alignLeft, barW = 220) {
  ctx.textAlign = alignLeft ? 'left' : 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.font = '900 30px Arial, sans-serif';
  ctx.fillStyle = '#1B1B1B';
  ctx.fillText(label, x, y);
  const barX = alignLeft ? x : x - barW;
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, barX, y + 8, barW, 22, 8);
  ctx.fill();
  ctx.fillStyle = life > 10 ? '#2E9E4A' : life > 5 ? '#D9930D' : '#D63A2F';
  const fillW = Math.max(0, (life / 20) * (barW - 4));
  if (fillW > 0) {
    roundRect(ctx, barX + 2, y + 10, fillW, 18, 6);
    ctx.fill();
  }
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#1B1B1B';
  roundRect(ctx, barX, y + 8, barW, 22, 8);
  ctx.stroke();
  ctx.font = '900 34px Arial, sans-serif';
  ctx.fillStyle = life > 5 ? '#1B1B1B' : '#D63A2F';
  ctx.fillText(`♥ ${life}`, alignLeft ? barX + barW + 12 : barX - 12, y + 32);
}

function drawBackground(ctx) {
  const sky = ctx.createLinearGradient(0, 0, 0, 190);
  sky.addColorStop(0, '#A8D8EA');
  sky.addColorStop(1, '#D8EFF7');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CANVAS_W, 190);
  // Sandy table.
  ctx.fillStyle = '#EFD9A7';
  ctx.fillRect(0, 190, CANVAS_W, CANVAS_H - 190);
  ctx.fillStyle = '#E3C88F';
  ctx.fillRect(0, 190, CANVAS_W, 8);
  // Faint wave lines on the table.
  ctx.strokeStyle = 'rgba(31,122,214,0.25)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    for (let x = 0; x <= CANVAS_W; x += 40) {
      const y = 470 + i * 26 + Math.sin(x / 90 + i * 2) * 6;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawTable(ctx, state) {
  drawBackground(ctx);
  // Marra: name + life top-left, face-down hand top-centre.
  drawLife(ctx, 24, 46, 'MARRA', state.marraLife, true);
  for (const r of marraHandRects()) drawCardBack(ctx, r.x, r.y, r.w, r.h);
  // Round + tricks top-right.
  ctx.textAlign = 'right';
  ctx.fillStyle = '#1B1B1B';
  ctx.font = '900 30px Arial, sans-serif';
  ctx.fillText(`ROUND ${state.round}`, CANVAS_W - 24, 46);
  ctx.font = '700 22px Arial, sans-serif';
  ctx.fillText(`Tricks  YOU ${state.yourTricks} — ${state.marraTricks} MARRA`, CANVAS_W - 24, 78);
  // Marra's telegraphed intent: the suit she is about to play.
  if (state.phase === 'await-pick' && state.marraPick) {
    const suit = SUITS[state.marraPick.intentSuit];
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF8E1';
    roundRect(ctx, 440, 146, 400, 46, 10);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = suit.dark;
    ctx.stroke();
    drawSuitIcon(ctx, 480, 169, 28, state.marraPick.intentSuit);
    ctx.fillStyle = '#1B1B1B';
    ctx.font = '900 24px Arial, sans-serif';
    ctx.fillText(`MARRA AIMS FOR: ${suit.name}`, 680, 178);
  }
  // Played cards in the middle: Marra left, you right.
  const flip = state.flipT == null ? 1 : Math.min(1, state.flipT * 2);
  if (state.playedMarra) {
    ctx.save();
    ctx.translate(470 + 75, 228 + 105);
    ctx.scale(Math.max(0.05, flip), 1);
    drawCardFace(ctx, -75, -105, 150, 210, state.playedMarra);
    ctx.restore();
  }
  if (state.playedYou) {
    ctx.save();
    ctx.translate(660 + 75, 228 + 105);
    ctx.scale(Math.max(0.05, flip), 1);
    drawCardFace(ctx, -75, -105, 150, 210, state.playedYou);
    ctx.restore();
  }
  if (state.playedYou && state.playedMarra) {
    ctx.fillStyle = '#1B1B1B';
    ctx.beginPath();
    ctx.arc(640, 333, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 22px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VS', 640, 334);
    ctx.textBaseline = 'alphabetic';
  }
  // Damage splash + combo badge under the played cards.
  if (state.lastDamage) {
    ctx.textAlign = 'center';
    ctx.font = '900 34px Arial, sans-serif';
    ctx.fillStyle = state.lastDamage.side === 'you' ? '#2E9E4A' : '#D63A2F';
    ctx.fillText(state.lastDamage.text, 640, 478);
  }
  if (state.comboBadge) {
    ctx.font = '900 24px Arial, sans-serif';
    ctx.fillStyle = '#8A5C05';
    ctx.fillText(state.comboBadge, 640, 508);
  }
  // Last trick history, one line.
  if (state.lastTrick) {
    ctx.textAlign = 'center';
    ctx.font = '700 20px Arial, sans-serif';
    ctx.fillStyle = '#4A3A1A';
    ctx.fillText(state.lastTrick, 640, 700);
  }
  // Your life bottom-left (narrow bar so the hearts number clears the hand).
  drawLife(ctx, 24, 700 - 34, 'YOU', state.youLife, true, 150);
  const rects = playerHandRects();
  state.table.you.forEach((card, i) => {
    const r = rects[i];
    const raised = state.hoverIndex === i || state.selectedIndex === i ? -18 : 0;
    if (state.selectedIndex === i) {
      ctx.fillStyle = '#F2C14E';
      roundRect(ctx, r.x - 6, r.y + raised - 6, r.w + 12, r.h + 12, 14);
      ctx.fill();
    }
    drawCardFace(ctx, r.x, r.y + raised, r.w, r.h, card);
  });
  // Hint between the intent banner and the played cards.
  ctx.textAlign = 'center';
  ctx.font = '700 20px Arial, sans-serif';
  ctx.fillStyle = '#4A3A1A';
  const hint = state.phase === 'await-pick'
    ? 'Click a card, or press 1-5 — beat her suit or her number!'
    : 'Watch the trick resolve…';
  ctx.fillText(hint, 640, 216);
}

function drawTitle(ctx, state) {
  drawBackground(ctx);
  // Sun, top-right (only the title screen has empty sky there).
  ctx.fillStyle = '#F2C14E';
  ctx.beginPath();
  ctx.arc(1120, 86, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFF3C4';
  ctx.beginPath();
  ctx.arc(1120, 86, 30, 0, Math.PI * 2);
  ctx.fill();
  // Fanned decorative cards behind the title.
  const demo = [
    { suit: 'EMBER', value: 9 },
    { suit: 'TIDE', value: 7 },
    { suit: 'THORN', value: 8 },
    { suit: 'STONE', value: 6 },
  ];
  demo.forEach((card, i) => {
    ctx.save();
    ctx.translate(340 + i * 200, 560);
    ctx.rotate((i - 1.5) * 0.12);
    drawCardFace(ctx, -70, -100, 140, 200, card);
    ctx.restore();
  });
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1B1B1B';
  ctx.font = '900 96px Arial, sans-serif';
  ctx.fillText('ASH AND TIDE', 640, 180);
  ctx.font = '700 30px Arial, sans-serif';
  ctx.fillStyle = '#4A3A1A';
  ctx.fillText('A duel of cards against Marra, Keeper of the Lighthouse', 640, 228);
  ctx.font = '700 24px Arial, sans-serif';
  ctx.fillStyle = '#1B1B1B';
  ctx.fillText('Ember beats Thorn, Thorn beats Tide, Tide beats Ember — Stone is neutral.', 640, 280);
  ctx.fillText('First to sink the other from 20 life wins. Combos: same suit +2, run +3.', 640, 314);
  ctx.font = '900 34px Arial, sans-serif';
  ctx.fillStyle = '#D63A2F';
  ctx.fillText('CLICK OR PRESS ENTER TO START', 640, 400);
}

function drawOver(ctx, state) {
  drawTable(ctx, state);
  // Bright OPAQUE panel, never a dark overlay: the win/loss must stay readable.
  ctx.fillStyle = 'rgb(255,250,230)';
  roundRect(ctx, 290, 150, 700, 380, 18);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = state.winner === 'you' ? '#2E9E4A' : '#D63A2F';
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.font = '900 84px Arial, sans-serif';
  ctx.fillStyle = state.winner === 'you' ? '#2E9E4A' : '#D63A2F';
  ctx.fillText(state.winner === 'you' ? 'YOU WIN!' : 'YOU LOSE', 640, 270);
  ctx.font = '700 30px Arial, sans-serif';
  ctx.fillStyle = '#1B1B1B';
  const scoreLine = state.winner === 'you'
    ? `Marra's life sank to 0 — you win ${state.youLife} to 0!`
    : `Your life sank to 0 — Marra wins 0 to ${state.marraLife}!`;
  ctx.fillText(scoreLine, 640, 330);
  ctx.fillText(`Final tricks: YOU ${state.yourTricks} — ${state.marraTricks} MARRA  ·  ${state.round} rounds`, 640, 378);
  ctx.font = '900 28px Arial, sans-serif';
  ctx.fillStyle = '#D63A2F';
  ctx.fillText('PRESS ENTER TO PLAY AGAIN', 640, 460);
  if (state.winner === 'you') {
    // Confetti burst, fixed positions so the frame is deterministic.
    const colors = ['#D63A2F', '#1F7AD6', '#2E9E4A', '#D9930D', '#F2C14E'];
    for (let i = 0; i < 60; i += 1) {
      const x = 300 + ((i * 197) % 680);
      const y = 160 + ((i * 131) % 360);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(x, y, 10, 6);
    }
  }
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  return {
    draw(state, screen) {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      if (screen === SCREEN_TITLE) drawTitle(ctx, state);
      else if (screen === SCREEN_OVER) drawOver(ctx, state);
      else drawTable(ctx, state);
    },
  };
}

export { cardLabel };

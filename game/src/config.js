// Fixed constants for ASH AND TIDE: suits, sizes, life, canvas.
export const CANVAS_W = 1280;
export const CANVAS_H = 720;
export const START_LIFE = 20;
export const HAND_SIZE = 5;

// Four original suits. Each has a colour AND a shape, so a card is readable
// by colour or by shape alone (judge criterion 4).
export const SUITS = {
  EMBER: { name: 'EMBER', color: '#D63A2F', dark: '#8F1F16', shape: 'flame' },
  TIDE: { name: 'TIDE', color: '#1F7AD6', dark: '#104A86', shape: 'wave' },
  THORN: { name: 'THORN', color: '#2E9E4A', dark: '#175C2A', shape: 'leaf' },
  STONE: { name: 'STONE', color: '#D9930D', dark: '#8A5C05', shape: 'gem' },
};
export const SUIT_KEYS = ['EMBER', 'TIDE', 'THORN', 'STONE'];

// Suit cycle: EMBER beats THORN, THORN beats TIDE, TIDE beats EMBER.
// STONE is neutral: it beats nothing and loses to nothing (number decides).
export const BEATS = { EMBER: 'THORN', THORN: 'TIDE', TIDE: 'EMBER', STONE: null };

// Layout (fixed 1280x720 canvas).
export const LAYOUT = {
  aiHandY: 26,
  aiCardW: 76,
  aiCardH: 106,
  playedY: 228,
  playedW: 150,
  playedH: 210,
  handY: 516,
  handW: 122,
  handH: 170,
  handGap: 14,
};

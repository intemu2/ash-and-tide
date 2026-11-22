// Fixed constants for ASH AND TIDE v2: suits, rivals, relics, sizes, life.
export const CANVAS_W = 1280;
export const CANVAS_H = 720;
export const START_LIFE = 20;
export const HAND_SIZE = 5;
export const DECK_VALUES = 6; // 4 suits x values 1..6 = a 24-card deck.
export const HEAL_BETWEEN = 4; // Life regained when a rival sinks.

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

// The gauntlet: three rivals in a row, each with its own pick style and a
// surge (its favoured suit deals +1 damage when it wins a trick).
export const RIVALS = [
  {
    id: 'marra', name: 'Marra', short: 'MARRA', title: 'Keeper of the Lighthouse',
    color: '#1E3A5F', style: 'balanced', surgeSuit: null,
    blurb: 'Reads the table and plays the best average card.',
  },
  {
    id: 'brine', name: 'Sister Brine', short: 'BRINE', title: 'Tidecaller of the Deep',
    color: '#104A86', style: 'tide', surgeSuit: 'TIDE',
    blurb: 'Floods the table with Tide — her Tide cards hit +1 harder.',
  },
  {
    id: 'cinder', name: 'Cinder Warden', short: 'CINDER', title: 'Warden of the Ash Gate',
    color: '#8F1F16', style: 'fierce', surgeSuit: 'EMBER',
    blurb: 'Swings for the biggest single hit — his Ember cards hit +1 harder.',
  },
];

// Relics: pick one before the duel. Each is one line of rules, shown on the
// title screen and as a badge on the table.
export const RELICS = {
  EMBERBRAND: {
    id: 'EMBERBRAND', name: 'Emberbrand', suit: 'EMBER', color: '#D63A2F',
    blurb: 'Win a trick with Ember: +2 damage.',
  },
  TIDEGLASS: {
    id: 'TIDEGLASS', name: 'Tideglass', suit: 'TIDE', color: '#1F7AD6',
    blurb: 'Win a trick with Tide: draw 2, keep the best 5.',
  },
  THORNMAIL: {
    id: 'THORNMAIL', name: 'Thornmail', suit: 'THORN', color: '#2E9E4A',
    blurb: 'Lose a trick: the rival takes 1 damage back.',
  },
};
export const RELIC_IDS = ['EMBERBRAND', 'TIDEGLASS', 'THORNMAIL'];

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

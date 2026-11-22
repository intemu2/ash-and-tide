// Mouse + keyboard input: click a card in your hand, or press 1-5, or Enter.
// Input only reports actions; the game loop decides what they mean.
export const ACTION_START = 1;
export const ACTION_CARD_BASE = 10; // ACTION_CARD_BASE + index = played card i

/** Which card rect (from a list of {x,y,w,h}) holds point (x, y), or -1. */
export function hitCard(rects, x, y) {
  for (let i = rects.length - 1; i >= 0; i -= 1) {
    const r = rects[i];
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
  }
  return -1;
}

export function createInput(canvas) {
  const queue = [];
  let hover = -1;

  canvas.addEventListener('click', (event) => {
    queue.push({ type: 'click', x: event.offsetX, y: event.offsetY });
  });
  canvas.addEventListener('mousemove', (event) => {
    hover = { x: event.offsetX, y: event.offsetY };
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      queue.push({ type: 'start' });
      event.preventDefault();
    } else if (event.key >= '1' && event.key <= '5') {
      queue.push({ type: 'card', index: Number(event.key) - 1 });
    }
  });

  return {
    takeEvents() {
      return queue.splice(0, queue.length);
    },
    hoverPoint() {
      return hover;
    },
  };
}

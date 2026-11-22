// The twelve cards of Lumen Duel. Four aspects (suits): Ember, Tide, Thorn, Lumen.
// Wardens stay on the table and strike the enemy hero at the end of their owner's turn.
// Spells resolve at once. All names, art and flavour text are original to this game.
export const ASPECTS = {
  ember: { name: 'Ember', color: '#ff7a3c', soft: 'rgba(255,122,60,.32)', symbol: 'flame' },
  tide: { name: 'Tide', color: '#3cb8ff', soft: 'rgba(60,184,255,.32)', symbol: 'wave' },
  thorn: { name: 'Thorn', color: '#7ddb4a', soft: 'rgba(125,219,74,.30)', symbol: 'leaf' },
  lumen: { name: 'Lumen', color: '#ffd94a', soft: 'rgba(255,217,74,.32)', symbol: 'sun' },
};

// Inline SVG art per aspect symbol (drawn, never borrowed).
export const SYMBOLS = {
  flame: '<svg viewBox="0 0 64 64"><path d="M32 6 C40 18 52 24 52 40 A20 20 0 1 1 12 40 C12 30 20 26 24 18 C26 24 30 26 32 26 C30 18 30 12 32 6 Z" fill="#ff7a3c"/><path d="M32 30 C36 36 42 38 42 46 A10 10 0 1 1 22 46 C22 40 28 38 32 30 Z" fill="#ffd94a"/></svg>',
  wave: '<svg viewBox="0 0 64 64"><path d="M6 26 C16 16 26 36 32 26 C38 16 48 36 58 26 L58 38 C48 48 38 28 32 38 C26 48 16 28 6 38 Z" fill="#3cb8ff"/><path d="M6 42 C16 32 26 52 32 42 C38 32 48 52 58 42 L58 50 C48 58 38 44 32 50 C26 56 16 44 6 50 Z" fill="#7cc4ff"/></svg>',
  leaf: '<svg viewBox="0 0 64 64"><path d="M50 8 C24 12 10 30 12 52 C34 52 50 36 50 8 Z" fill="#7ddb4a"/><path d="M14 50 C24 38 36 26 48 14" stroke="#2f7a1e" stroke-width="3" fill="none"/><path d="M30 34 C34 30 40 28 46 28" stroke="#2f7a1e" stroke-width="2.5" fill="none"/></svg>',
  sun: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="13" fill="#ffd94a"/><g stroke="#ffd94a" stroke-width="4" stroke-linecap="round"><line x1="32" y1="8" x2="32" y2="16"/><line x1="32" y1="48" x2="32" y2="56"/><line x1="8" y1="32" x2="16" y2="32"/><line x1="48" y1="32" x2="56" y2="32"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="43" y1="43" x2="49" y2="49"/><line x1="15" y1="49" x2="21" y2="43"/><line x1="43" y1="21" x2="49" y2="15"/></g></svg>',
};

export const CARDS = [
  { id: 'ember-sprite', name: 'Ember Sprite', aspect: 'ember', kind: 'warden', cost: 1, atk: 2, hp: 1, text: 'A spark with teeth. It bites before it burns.' },
  { id: 'tide-warden', name: 'Tide Warden', aspect: 'tide', kind: 'warden', cost: 2, atk: 2, hp: 3, text: 'The tide stands its ground, and the ground holds.' },
  { id: 'thornwolf', name: 'Thornwolf', aspect: 'thorn', kind: 'warden', cost: 2, atk: 3, hp: 2, text: 'It hunts in the hedgerow, where the light thins.' },
  { id: 'sunflare', name: 'Sunflare', aspect: 'lumen', kind: 'spell', cost: 2, text: 'Deal 3 damage to the enemy warden.', effect: { damage: 3 } },
  { id: 'moonmend', name: 'Moonmend', aspect: 'tide', kind: 'spell', cost: 2, text: 'Restore 6 HP to your warden.', effect: { heal: 6 } },
  { id: 'aegis-ward', name: 'Aegis Ward', aspect: 'lumen', kind: 'spell', cost: 1, text: 'Gain 6 shield. Shield soaks damage first.', effect: { shield: 6 } },
  { id: 'spark-volley', name: 'Spark Volley', aspect: 'ember', kind: 'spell', cost: 2, text: 'Deal 2 damage, then draw a card.', effect: { damage: 2, draw: 1 } },
  { id: 'lumen-bloom', name: 'Lumen Bloom', aspect: 'lumen', kind: 'spell', cost: 0, text: 'Gain 2 mana this round. Draw a card.', effect: { mana: 2, draw: 1 } },
  { id: 'frostbind', name: 'Frostbind', aspect: 'tide', kind: 'spell', cost: 3, text: 'Deal 2 damage to every enemy warden.', effect: { damageAll: 2 } },
  { id: 'sky-serpent', name: 'Sky Serpent', aspect: 'tide', kind: 'warden', cost: 4, atk: 4, hp: 4, text: 'It rides the storm home, and the storm follows.' },
  { id: 'dawn-golem', name: 'Dawn Golem', aspect: 'lumen', kind: 'warden', cost: 5, atk: 5, hp: 6, text: 'Carved from first light. It does not hurry. It does not fall.' },
  { id: 'phoenix-call', name: 'Phoenix Call', aspect: 'ember', kind: 'warden', cost: 6, atk: 6, hp: 5, text: 'One cry, and the sky catches fire.' },
];

export const CARD_BY_ID = Object.fromEntries(CARDS.map((c) => [c.id, c]));

/** A 30-card deck: 3 copies of the cheap workhorses, 2 of the rest. */
export const DECK_LIST = [
  'ember-sprite', 'ember-sprite', 'ember-sprite',
  'tide-warden', 'tide-warden', 'tide-warden',
  'thornwolf', 'thornwolf', 'thornwolf',
  'sunflare', 'sunflare', 'sunflare',
  'moonmend', 'moonmend',
  'aegis-ward', 'aegis-ward', 'aegis-ward',
  'spark-volley', 'spark-volley', 'spark-volley',
  'lumen-bloom', 'lumen-bloom',
  'frostbind', 'frostbind',
  'sky-serpent', 'sky-serpent',
  'dawn-golem', 'dawn-golem',
  'phoenix-call',
];

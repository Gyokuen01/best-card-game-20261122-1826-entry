// The twelve cards of Lumen Duel. Four aspects (suits): Ember, Tide, Thorn, Lumen.
// Wardens stay on the table and strike the enemy hero at the end of their owner's turn.
// Spells resolve at once. All names and flavour text are original to this game;
// each aspect's art is an original anime illustration in game/assets/.
export const ASPECTS = {
  ember: { name: 'Ember', color: '#ff7a3c', soft: 'rgba(255,122,60,.32)', art: 'assets/ember.jpg' },
  tide: { name: 'Tide', color: '#3cb8ff', soft: 'rgba(60,184,255,.32)', art: 'assets/tide.jpg' },
  thorn: { name: 'Thorn', color: '#7ddb4a', soft: 'rgba(125,219,74,.30)', art: 'assets/thorn.jpg' },
  lumen: { name: 'Lumen', color: '#ffd94a', soft: 'rgba(255,217,74,.32)', art: 'assets/lumen.jpg' },
};

// Resonance: playing two cards of one aspect in a single turn makes that aspect
// resonate. The bonus fires once per aspect per turn, on the second card played.
// (The bonus each aspect gives: Ember +2 damage, Tide draw 1, Thorn +3 shield,
// Lumen +3 HP. The rules engine in game.js applies them.)
export const RESONANCE = {
  ember: { name: 'Ember', bonus: 'damage', amount: 2 },
  tide: { name: 'Tide', bonus: 'draw', amount: 1 },
  thorn: { name: 'Thorn', bonus: 'shield', amount: 3 },
  lumen: { name: 'Lumen', bonus: 'heal', amount: 3 },
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

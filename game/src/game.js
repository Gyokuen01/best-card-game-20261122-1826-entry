// Lumen Duel — rules engine (pure logic, no DOM, no timers).
// Two wardens, 30 HP each. Mana grows by 1 each round (max 10). Wardens stay on the
// table and strike the enemy hero at the end of their owner's turn. First to 0 HP loses.
import { CARD_BY_ID, DECK_LIST, RESONANCE } from './cards.js';
import { mulberry32, shuffle } from './rng.js';

export const MAX_HP = 30;
export const MAX_MANA = 10;
export const MAX_HAND = 7;
export const MAX_BOARD = 5;

let uidCounter = 1;

function makeHero(deck) {
  return { hp: MAX_HP, maxHp: MAX_HP, shield: 0, mana: 0, maxMana: 0, deck, hand: [], board: [] };
}

export function createGame(seed) {
  uidCounter = 1;
  const rand = mulberry32(seed);
  const state = {
    seed,
    round: 1,
    turn: 'player',
    phase: 'title',
    player: makeHero(shuffle(DECK_LIST, rand)),
    enemy: makeHero(shuffle(DECK_LIST, rand)),
    log: [],
    stats: { damageDealt: 0, damageTaken: 0, cardsPlayed: 0, turnsPlayed: 0 },
    winner: null,
    // Resonance: aspect -> cards of that aspect played this turn (reset each turn).
    // fx is the last presentation effect for the view ({ type, aspect, seq }).
    turnAspects: {},
    fx: null,
    fxSeq: 0,
  };
  // Opening hands: 3 cards for the first player, 4 for the second — the classic
  // catch-up card, so going second is not a built-in loss.
  for (let i = 0; i < 3; i += 1) { drawCard(state, 'player', true); drawCard(state, 'enemy', true); }
  drawCard(state, 'enemy', true);
  state.player.maxMana = 1; state.player.mana = 1;
  state.enemy.maxMana = 1; state.enemy.mana = 1;
  return state;
}

export function heroOf(state, side) { return side === 'player' ? state.player : state.enemy; }
export function foeOf(state, side) { return side === 'player' ? state.enemy : state.player; }

/** Draw the top card; empty deck costs 1 fatigue damage. Silent during setup. */
export function drawCard(state, side, silent) {
  const hero = heroOf(state, side);
  if (hero.deck.length === 0) {
    hurtHero(state, side, 1);
    if (!silent) pushLog(state, `${nameOf(side)} runs out of cards and takes <span class="dmg">1 fatigue</span>.`);
    return null;
  }
  const id = hero.deck.shift();
  if (hero.hand.length >= MAX_HAND) {
    if (!silent) pushLog(state, `${nameOf(side)}'s hand is full — ${CARD_BY_ID[id].name} is burned.`);
    return null;
  }
  hero.hand.push(id);
  return id;
}

export function nameOf(side) { return side === 'player' ? 'You' : 'Nyx'; }

export function pushLog(state, html) {
  state.log.push(html);
  if (state.log.length > 40) state.log.shift();
}

/** Damage to a hero: shield soaks first, the rest hits HP. Returns {hp, soaked}. */
export function hurtHero(state, side, amount) {
  const hero = heroOf(state, side);
  const soaked = Math.min(hero.shield, amount);
  hero.shield -= soaked;
  const hpDamage = amount - soaked;
  hero.hp = Math.max(0, hero.hp - hpDamage);
  if (side === 'player') state.stats.damageTaken += hpDamage;
  else state.stats.damageDealt += hpDamage;
  return { hp: hpDamage, soaked };
}

export function healHero(state, side, amount) {
  const hero = heroOf(state, side);
  const healed = Math.min(amount, hero.maxHp - hero.hp);
  hero.hp += healed;
  return healed;
}

/** Damage one warden on a side's board; removes it at 0 HP. Returns true if it fell. */
export function hurtWarden(state, side, uid, amount) {
  const hero = heroOf(state, side);
  const w = hero.board.find((b) => b.uid === uid);
  if (!w) return false;
  w.hp -= amount;
  if (w.hp <= 0) {
    hero.board = hero.board.filter((b) => b.uid !== uid);
    return true;
  }
  return false;
}

export function canPlay(state, side, handIndex) {
  if (state.phase !== 'play' || state.turn !== side) return false;
  const hero = heroOf(state, side);
  const id = hero.hand[handIndex];
  if (!id) return false;
  const card = CARD_BY_ID[id];
  if (hero.mana < card.cost) return false;
  if (card.kind === 'warden' && hero.board.length >= MAX_BOARD) return false;
  return true;
}

/** Resonance: the second card of one aspect in a single turn fires that aspect's
 * bonus (Ember +2 damage, Tide draw 1, Thorn +3 shield, Lumen +3 HP). Fires once
 * per aspect per turn, on the second card. Pure: no randomness, so a seeded game
 * stays deterministic. Returns a resonance event, or null. Also stamps state.fx so
 * the view can play the combo animation. */
function resonanceEvent(state, side, card) {
  const aspect = card.aspect;
  const count = (state.turnAspects[aspect] ?? 0) + 1;
  state.turnAspects[aspect] = count;
  if (count !== 2) return null;
  const res = RESONANCE[aspect];
  const who = nameOf(side);
  const foe = side === 'player' ? 'enemy' : 'player';
  state.fxSeq += 1;
  state.fx = { type: 'resonance', aspect, seq: state.fxSeq };
  if (res.bonus === 'damage') {
    const dealt = hurtHero(state, foe, res.amount);
    const soakNote = dealt.soaked > 0 ? ` (${dealt.soaked} soaked by shield)` : '';
    return { type: 'resonance', side, card: card.id, aspect, text: `<b>${who}</b> — <span class="resonance">${res.name} Resonance!</span> <span class="dmg">+${res.amount} damage</span>${soakNote} to ${side === 'player' ? 'Nyx' : 'you'}.` };
  }
  if (res.bonus === 'draw') {
    drawCard(state, side);
    return { type: 'resonance', side, card: card.id, aspect, text: `<b>${who}</b> — <span class="resonance">${res.name} Resonance!</span> Draw an extra card.` };
  }
  if (res.bonus === 'shield') {
    heroOf(state, side).shield += res.amount;
    return { type: 'resonance', side, card: card.id, aspect, text: `<b>${who}</b> — <span class="resonance">${res.name} Resonance!</span> <span class="shield">+${res.amount} shield</span>.` };
  }
  const healed = healHero(state, side, res.amount);
  return { type: 'resonance', side, card: card.id, aspect, text: `<b>${who}</b> — <span class="resonance">${res.name} Resonance!</span> <span class="heal">+${healed} HP</span>.` };
}

/** Play a card from hand. Returns a list of event descriptions for the log/animation. */
export function playCard(state, side, handIndex) {
  const hero = heroOf(state, side);
  const foe = foeOf(state, side);
  const id = hero.hand[handIndex];
  const card = CARD_BY_ID[id];
  hero.mana -= card.cost;
  hero.hand.splice(handIndex, 1);
  state.stats.cardsPlayed += 1;
  const events = [];
  const who = nameOf(side);
  if (card.kind === 'warden') {
    const w = { uid: uidCounter, id: card.id, atk: card.atk, hp: card.hp, maxHp: card.hp };
    uidCounter += 1;
    hero.board.push(w);
    events.push({ type: 'summon', side, card: card.id, text: `<b>${who}</b> summon${side === 'player' ? '' : 's'} <b>${card.name}</b> (${card.atk}⚔ / ${card.hp}♥).` });
    const res = resonanceEvent(state, side, card);
    if (res) events.push(res);
    return events;
  }
  const e = card.effect;
  if (e.damage) {
    const dealt = hurtHero(state, side === 'player' ? 'enemy' : 'player', e.damage);
    const soakNote = dealt.soaked > 0 ? ` (${dealt.soaked} soaked by shield)` : '';
    events.push({ type: 'damage', side, card: card.id, text: `<b>${who}</b> cast <b>${card.name}</b> — <span class="dmg">${dealt.hp} damage</span>${soakNote} to ${side === 'player' ? 'Nyx' : 'you'}.` });
  }
  if (e.damageAll) {
    const fallen = [];
    foe.board.slice().forEach((w) => { if (hurtWarden(state, side === 'player' ? 'enemy' : 'player', w.uid, e.damageAll)) fallen.push(w); });
    events.push({ type: 'damageAll', side, card: card.id, text: `<b>${who}</b> cast <b>${card.name}</b> — <span class="dmg">${e.damageAll} damage</span> to every enemy warden${fallen.length ? `; ${fallen.map((w) => CARD_BY_ID[w.id].name).join(', ')} shatter${fallen.length > 1 ? '' : 's'}` : ''}.` });
  }
  if (e.heal) {
    const healed = healHero(state, side, e.heal);
    events.push({ type: 'heal', side, card: card.id, text: `<b>${who}</b> cast <b>${card.name}</b> — <span class="heal">+${healed} HP</span>.` });
  }
  if (e.shield) {
    hero.shield += e.shield;
    events.push({ type: 'shield', side, card: card.id, text: `<b>${who}</b> cast <b>${card.name}</b> — <span class="shield">+${e.shield} shield</span>.` });
  }
  if (e.mana) {
    hero.mana += e.mana;
    events.push({ type: 'mana', side, card: card.id, text: `<b>${who}</b> cast <b>${card.name}</b> — +${e.mana} mana this round.` });
  }
  if (e.draw) {
    for (let i = 0; i < e.draw; i += 1) drawCard(state, side);
    events.push({ type: 'draw', side, card: card.id, text: `<b>${who}</b> draw${side === 'player' ? '' : 's'} ${e.draw} card${e.draw > 1 ? 's' : ''}.` });
  }
  const res = resonanceEvent(state, side, card);
  if (res) events.push(res);
  if (events.length === 0) events.push({ type: 'play', side, card: card.id, text: `<b>${who}</b> played <b>${card.name}</b>.` });
  return events;
}

/** Each warden on `side`'s board strikes the enemy hero. Returns event list. */
export function resolveWardens(state, side) {
  const hero = heroOf(state, side);
  const events = [];
  const who = side === 'player' ? 'Your' : "Nyx's";
  const target = side === 'player' ? 'enemy' : 'player';
  hero.board.slice().forEach((w) => {
    const dealt = hurtHero(state, target, w.atk);
    const soakNote = dealt.soaked > 0 ? ` (${dealt.soaked} soaked by shield)` : '';
    events.push({ type: 'attack', side, warden: w.id, text: `<b>${who} ${CARD_BY_ID[w.id].name}</b> strikes for <span class="dmg">${dealt.hp} damage</span>${soakNote}.` });
  });
  return events;
}

/** Begin a side's turn: mana refills to the round's level, then draw. Resonance
 * counts reset — a new turn is a new chance to resonate. */
export function startTurn(state, side) {
  const hero = heroOf(state, side);
  if (side === 'player') state.stats.turnsPlayed += 1;
  state.turnAspects = {};
  hero.maxMana = Math.min(MAX_MANA, state.round);
  hero.mana = hero.maxMana;
  drawCard(state, side);
}

/** End the player's turn: wardens strike, then the enemy's turn begins (mana + draw). */
export function endPlayerTurn(state) {
  const events = resolveWardens(state, 'player');
  events.forEach((e) => pushLog(state, e.text));
  state.turn = 'enemy';
  startTurn(state, 'enemy');
  return events;
}

/** End the enemy's turn: wardens strike, round advances, player draws. */
export function endEnemyTurn(state) {
  const events = resolveWardens(state, 'enemy');
  events.forEach((e) => pushLog(state, e.text));
  state.round += 1;
  state.turn = 'player';
  startTurn(state, 'player');
  return events;
}

/** 'win' | 'loss' | null */
export function outcome(state) {
  if (state.enemy.hp <= 0) return 'win';
  if (state.player.hp <= 0) return 'loss';
  return null;
}

export function finish(state) {
  const result = outcome(state);
  if (!result) return null;
  state.phase = result;
  state.winner = result === 'win' ? 'player' : 'enemy';
  return result;
}

// Lumen Duel — DOM rendering. Pure view: reads state, writes the page.
import { ASPECTS, CARD_BY_ID, SYMBOLS } from './cards.js';
import { canPlay } from './game.js';

const $ = (id) => document.getElementById(id);

/** A card div. `stats` overrides atk/hp (board wardens carry damage). */
export function cardElement(card, opts = {}) {
  const aspect = ASPECTS[card.aspect];
  const el = document.createElement('div');
  el.className = 'card'
    + (opts.playable ? ' playable' : '')
    + (opts.dim ? ' dim' : '')
    + (opts.justPlayed ? ' just-played' : '');
  el.style.setProperty('--aspect', aspect.color);
  el.style.setProperty('--aspect-soft', aspect.soft);
  const atk = opts.atk ?? card.atk;
  const hp = opts.hp ?? card.hp;
  const stats = card.kind === 'warden'
    ? `<span class="atk">${atk}</span><span class="hp">${hp}</span>`
    : `<span class="spell-tag">${aspect.name.toUpperCase()} · SPELL</span>`;
  el.innerHTML = `<div class="cost">${card.cost}</div>`
    + `<div class="aspect-tag">${aspect.name}</div>`
    + `<div class="art">${SYMBOLS[aspect.symbol]}</div>`
    + `<div class="name">${card.name}</div>`
    + `<div class="kind">${card.kind === 'warden' ? 'Warden' : 'Spell'}</div>`
    + `<div class="text">${card.text}</div>`
    + `<div class="stats">${stats}</div>`;
  return el;
}

function renderHero(prefix, hero) {
  const fill = $(`${prefix}-hp-fill`);
  fill.style.width = `${Math.max(0, (hero.hp / hero.maxHp) * 100)}%`;
  fill.classList.toggle('low', hero.hp <= 10);
  $(`${prefix}-hp-text`).textContent = `${hero.hp} / ${hero.maxHp}`;
  const shield = $(`${prefix}-shield`);
  shield.hidden = hero.shield <= 0;
  shield.textContent = `🛡 ${hero.shield}`;
  const mana = $(`${prefix}-mana`);
  mana.innerHTML = '';
  for (let i = 0; i < hero.maxMana; i += 1) {
    const pip = document.createElement('span');
    pip.className = 'mana-pip' + (i < hero.mana ? ' full' : '');
    mana.appendChild(pip);
  }
  const label = document.createElement('span');
  label.className = 'mana-label';
  label.textContent = `${hero.mana}/${hero.maxMana} mana`;
  mana.appendChild(label);
}

function renderHandbacks(handEl, count) {
  handEl.innerHTML = '';
  for (let i = 0; i < count; i += 1) {
    const back = document.createElement('div');
    back.className = 'card-back';
    back.textContent = '✦';
    handEl.appendChild(back);
  }
}

function renderBoard(boardEl, wardens) {
  boardEl.innerHTML = '';
  if (wardens.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'board-empty';
    empty.textContent = '— no wardens —';
    boardEl.appendChild(empty);
    return;
  }
  wardens.forEach((w) => {
    boardEl.appendChild(cardElement(CARD_BY_ID[w.id], { atk: w.atk, hp: w.hp }));
  });
}

export function render(state) {
  renderHero('player', state.player);
  renderHero('enemy', state.enemy);
  $('player-deck-count').textContent = state.player.deck.length;
  $('enemy-deck-count').textContent = state.enemy.deck.length;
  $('player-deck-count').parentElement.classList.toggle('empty', state.player.deck.length === 0);
  $('enemy-deck-count').parentElement.classList.toggle('empty', state.enemy.deck.length === 0);

  renderHandbacks($('enemy-hand'), state.enemy.hand.length);
  renderBoard($('enemy-board'), state.enemy.board);
  renderBoard($('player-board'), state.player.board);

  const handEl = $('player-hand');
  handEl.innerHTML = '';
  state.player.hand.forEach((id, index) => {
    const card = CARD_BY_ID[id];
    const playable = canPlay(state, 'player', index);
    const affordable = state.player.mana >= card.cost;
    const el = cardElement(card, { playable, dim: !affordable && state.phase === 'play' && state.turn === 'player' });
    el.dataset.index = String(index);
    handEl.appendChild(el);
  });

  const logEl = $('log');
  logEl.innerHTML = state.log.slice(-5).map((line) => `<div>${line}</div>`).join('');
  logEl.scrollTop = logEl.scrollHeight;

  $('round-label').textContent = `Round ${state.round}`;
  const banner = $('turn-banner');
  if (state.phase === 'play') {
    banner.textContent = state.turn === 'player' ? 'Your turn' : "Nyx's turn…";
    banner.classList.toggle('enemy', state.turn !== 'player');
  } else if (state.phase === 'win') {
    banner.textContent = 'Victory';
    banner.classList.remove('enemy');
  } else if (state.phase === 'loss') {
    banner.textContent = 'Defeat';
    banner.classList.add('enemy');
  }
  $('btn-end-turn').disabled = !(state.phase === 'play' && state.turn === 'player');

  $('screen-title').hidden = state.phase !== 'title';
  const end = $('screen-end');
  end.hidden = !(state.phase === 'win' || state.phase === 'loss');
  if (state.phase === 'win' || state.phase === 'loss') {
    const won = state.phase === 'win';
    end.querySelector('.end-card').classList.toggle('defeat', !won);
    $('end-emblem').textContent = won ? '✦' : '◈';
    $('end-title').textContent = won ? 'VICTORY' : 'DEFEAT';
    $('end-sub').textContent = won
      ? 'Nyx fades into the dusk. The light prevails.'
      : 'The hollow claims the light. The dawn will try again.';
    $('end-stats').innerHTML = ''
      + `<div class="end-stat"><b>${state.round}</b>rounds</div>`
      + `<div class="end-stat"><b>${state.stats.damageDealt}</b>damage dealt</div>`
      + `<div class="end-stat"><b>${state.stats.cardsPlayed}</b>cards played</div>`
      + `<div class="end-stat"><b>${state.player.hp} / ${state.player.maxHp}</b>your HP left</div>`;
  }
}

export function flashHero(side) {
  const el = side === 'player' ? $('player-hero') : $('enemy-hero');
  el.classList.remove('flash');
  void el.offsetWidth; // restart the animation
  el.classList.add('flash');
}

export function setStatus(text) {
  $('status').textContent = text;
}

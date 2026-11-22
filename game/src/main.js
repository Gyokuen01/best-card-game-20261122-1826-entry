// Lumen Duel — bootstrap + interactive controller.
// Shot mode (?shot=title|play|win|loss&seed=N) stages one deterministic scene and stops.
// Normal mode is a full interactive duel: click cards, End Turn, keys 1–5 / Space / M / R.
import { createGame, endEnemyTurn, endPlayerTurn, finish, playCard, pushLog, startTurn } from './game.js';
import { aiPlan } from './ai.js';
import { flashHero, render, setStatus } from './render.js';
import { setMuted, isMuted, sfx } from './audio.js';
import { stageShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') || '7') >>> 0;

let state = null;
let busy = false; // true while Nyx is taking her turn

function endGame() {
  const result = finish(state);
  if (!result) return false;
  render(state);
  if (result === 'win') { sfx.win(); setStatus('Victory. Nyx fades into the dusk.'); }
  else { sfx.lose(); setStatus('Defeat. The hollow claims the light.'); }
  return true;
}

function afterPlayerAction(events) {
  events.forEach((e) => {
    pushLog(state, e.text);
    if (e.type === 'damage' || e.type === 'attack') flashHero('enemy');
    if (e.type === 'heal') sfx.heal();
    else if (e.type === 'shield') sfx.shield();
    else sfx.play();
  });
  render(state);
  return endGame();
}

async function runEnemyTurn() {
  busy = true;
  render(state);
  await sleep(550);
  const plan = aiPlan(state);
  for (const handIndex of plan) {
    if (state.phase !== 'play') break;
    const events = playCard(state, 'enemy', handIndex);
    events.forEach((e) => {
      pushLog(state, e.text);
      if (e.type === 'damage' || e.type === 'attack') flashHero('player');
    });
    sfx.play();
    render(state);
    if (endGame()) { busy = false; return; }
    await sleep(480);
  }
  if (state.phase !== 'play') { busy = false; return; }
  await sleep(350);
  endEnemyTurn(state);
  sfx.turn();
  render(state);
  busy = false;
  endGame();
}

function onEndTurn() {
  if (busy || state.phase !== 'play' || state.turn !== 'player') return;
  busy = true;
  sfx.click();
  endPlayerTurn(state);
  render(state);
  if (endGame()) { busy = false; return; }
  void runEnemyTurn();
}

function newDuel() {
  const randomSeed = (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
  state = createGame(randomSeed);
  busy = false;
  pushLog(state, 'The duel begins. <b>You</b> hold the dawn; <b>Nyx</b> holds the hollow.');
  render(state);
}

function beginDuel() {
  sfx.click();
  state.phase = 'play';
  startTurn(state, 'player');
  pushLog(state, '<b>Your turn.</b> Play a card, then End Turn.');
  render(state);
  setStatus('Duel started. Your turn.');
}

if (shot) {
  // Screenshot mode: stage the scene once, synchronously, and stop.
  const staged = stageShot(shot, seed);
  state = staged.state;
  document.title = `Lumen Duel — ${shot}`;
  render(state);
  window.__shotReady = true;
} else {
  newDuel();
  $('btn-play').addEventListener('click', beginDuel);
  $('btn-again').addEventListener('click', () => { newDuel(); });
  $('btn-restart').addEventListener('click', () => { if (!busy) { sfx.click(); newDuel(); } });
  $('btn-end-turn').addEventListener('click', onEndTurn);
  $('btn-sound').addEventListener('click', () => {
    setMuted(!isMuted());
    $('btn-sound').textContent = isMuted() ? '♪ Off' : '♪ On';
  });
  $('player-hand').addEventListener('click', (event) => {
    const cardEl = event.target.closest('.card');
    if (!cardEl || busy) return;
    const index = Number(cardEl.dataset.index);
    if (state.phase !== 'play' || state.turn !== 'player') return;
    if (Number.isNaN(index)) return;
    const events = playCard(state, 'player', index);
    if (!events.length) return;
    afterPlayerAction(events);
  });
  document.addEventListener('keydown', (event) => {
    if (state.phase === 'title' && (event.key === 'Enter' || event.key === ' ')) { beginDuel(); return; }
    if (event.key === 'm' || event.key === 'M') {
      setMuted(!isMuted());
      $('btn-sound').textContent = isMuted() ? '♪ Off' : '♪ On';
      return;
    }
    if (event.key === 'r' || event.key === 'R') { if (!busy) newDuel(); return; }
    if (state.phase !== 'play' || state.turn !== 'player' || busy) return;
    if (event.key >= '1' && event.key <= '5') {
      const index = Number(event.key) - 1;
      const events = playCard(state, 'player', index);
      if (events.length) afterPlayerAction(events);
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      onEndTurn();
    }
  });
}

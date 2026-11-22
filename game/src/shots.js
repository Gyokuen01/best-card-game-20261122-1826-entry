// Screenshot scenes (?shot=title|play|win|loss&seed=N).
// Each one plays the REAL rules forward from a fresh seeded game with an autopilot,
// so the frame is what a short game really looks like and the same seed always gives
// the same frame. No state is ever set by hand.
import { createGame, endEnemyTurn, endPlayerTurn, finish, outcome, playCard, pushLog, startTurn } from './game.js';
import { aiPlan, autopilotPlan } from './ai.js';

function playTurn(state, mode) {
  // Player: follow the autopilot plan, then end the turn.
  const plan = autopilotPlan(state, mode);
  for (const handIndex of plan) {
    if (state.phase !== 'play') break;
    const events = playCard(state, 'player', handIndex);
    events.forEach((e) => pushLog(state, e.text));
    if (finish(state)) return;
  }
  if (state.phase !== 'play') return;
  endPlayerTurn(state);
  if (finish(state)) return;
  // Nyx: follow her plan, then end her turn.
  const enemyPlan = aiPlan(state);
  for (const handIndex of enemyPlan) {
    if (state.phase !== 'play') break;
    const events = playCard(state, 'enemy', handIndex);
    events.forEach((e) => pushLog(state, e.text));
    if (finish(state)) return;
  }
  if (state.phase !== 'play') return;
  endEnemyTurn(state);
  finish(state);
}

/**
 * Stage the named scene on a fresh game and return { state, screen }.
 * title: fresh game on the title screen.
 * play: a rich mid-game table (several wardens, full-ish hands, HP dented).
 * win: the autopilot plays to a real victory.
 * loss: the autopilot idles while Nyx wins a real victory.
 */
export function stageShot(name, seed) {
  const state = createGame(seed);
  state.phase = 'play';
  pushLog(state, 'The duel begins. <b>You</b> hold the dawn; <b>Nyx</b> holds the hollow.');
  startTurn(state, 'player');

  if (name === 'title') {
    state.phase = 'title';
    return { state, screen: 'title' };
  }
  if (name === 'win') {
    for (let turn = 0; turn < 60 && !outcome(state); turn += 1) playTurn(state, 'greedy');
    finish(state);
    return { state, screen: state.phase };
  }
  if (name === 'loss') {
    for (let turn = 0; turn < 60 && !outcome(state); turn += 1) playTurn(state, 'idle');
    finish(state);
    return { state, screen: state.phase };
  }
  // play: stop mid-game — rich board, both heroes dented, hands full.
  for (let turn = 0; turn < 12 && !outcome(state); turn += 1) {
    playTurn(state, 'mid');
    if (state.player.hp <= 5 || state.enemy.hp <= 5) break;
    if (turn >= 5 && state.player.board.length >= 2 && state.enemy.board.length >= 1) break;
  }
  return { state, screen: 'play' };
}

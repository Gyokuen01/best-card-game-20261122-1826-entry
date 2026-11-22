// Nyx's brain and the autopilot that stages screenshot scenes.
// Both pick plays greedily on a cloned state, so the real state is never touched while planning.
import { CARD_BY_ID } from './cards.js';
import { canPlay, foeOf, heroOf, playCard } from './game.js';

function clone(state) {
  return JSON.parse(JSON.stringify(state));
}

/** Value of playing hand[i] for `side` right now. */
function scoreCard(state, side, handIndex) {
  const hero = heroOf(state, side);
  const foe = foeOf(state, side);
  const card = CARD_BY_ID[hero.hand[handIndex]];
  const e = card.effect || {};
  let score = 0;
  if (card.kind === 'warden') {
    score = card.atk + card.hp + 0.5;
    if (hero.board.length >= 4) score -= 2;
  }
  if (e.damage) {
    score += e.damage * 1.3;
    if (foe.hp - e.damage <= 0) score += 12; // lethal
  }
  if (e.damageAll) score += e.damageAll * Math.max(1, foe.board.length);
  if (e.heal) score += Math.min(e.heal, hero.maxHp - hero.hp) * 1.1;
  if (e.shield) score += e.shield * (foe.board.length > 0 ? 1.0 : 0.4);
  if (e.draw) score += 1.6;
  if (e.mana) score += 1.2;
  return score - card.cost * 0.2;
}

/**
 * Greedy plan: repeatedly take the best playable card until none is worth playing.
 * `forbidLethal` skips any play that would finish the foe (used to stage a mid-game scene).
 * Returns hand indices valid one after another on the real state.
 */
export function greedyPlan(state, side, forbidLethal) {
  const plan = [];
  const sim = clone(state);
  for (let step = 0; step < 6; step += 1) {
    const hand = side === 'player' ? sim.player.hand : sim.enemy.hand;
    let best = -1;
    let bestScore = 0.5;
    for (let i = 0; i < hand.length; i += 1) {
      if (!canPlay(sim, side, i)) continue;
      if (forbidLethal) {
        const card = CARD_BY_ID[hand[i]];
        const dmg = (card.effect && card.effect.damage) || 0;
        if (foeOf(sim, side).hp - dmg <= 0) continue;
      }
      const s = scoreCard(sim, side, i);
      if (s > bestScore) { bestScore = s; best = i; }
    }
    if (best < 0) break;
    plan.push(best);
    playCard(sim, side, best);
  }
  return plan;
}

/** Nyx's turn plan. */
export function aiPlan(state) {
  return greedyPlan(state, 'enemy', false);
}

/** The player's autopilot for staged scenes: 'greedy' (plays to win), 'idle' (plays nothing), 'mid' (plays, never lethal). */
export function autopilotPlan(state, mode) {
  if (mode === 'idle') return [];
  if (mode === 'mid') return greedyPlan(state, 'player', true);
  return greedyPlan(state, 'player', false);
}

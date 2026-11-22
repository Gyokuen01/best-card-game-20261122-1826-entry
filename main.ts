// Lumen Duel — a 1v1 card battler for make.fun's "Make the best card game" bounty.
// The game is this directory's game/ folder: plain static files a desktop browser loads
// offline (game/index.html and its ES modules, no library, no network request). This
// program hands it in: it copies game/ and screenshots/ from beside this file to /output
// and writes /output/dossier.json, the summary the judge reads, with the vendored
// make.fun library. Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in
// for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes;
// the others refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files in game/ or 48 MiB of game files, in all, or a path
// under game/ over 1000 bytes: game/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(out, 'dossier.json'), dossier);

// Sanity check before handing over: the game entry point and its screenshots must be there.
const missing = [];
if (!existsSync(join(out, 'game', 'index.html'))) missing.push('game/index.html');
const shotDir = join(out, 'screenshots');
const shots = existsSync(shotDir) ? readdirSync(shotDir).filter((f) => !f.startsWith('.')) : [];
if (shots.length < 3 || shots.length > 4) missing.push(`screenshots/ (found ${shots.length}, need 3–4)`);
if (missing.length > 0) {
  console.error(`Lumen Duel: incomplete output — missing ${missing.join(', ')}`);
  process.exit(1);
}
console.log(`Lumen Duel: wrote ${shots.length} screenshots and dossier.json (${dossier.length} bytes) to ${out}`);

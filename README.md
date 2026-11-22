# Lumen Duel

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826)

**Lumen Duel** is an original 1v1 card battler: you are the Dawn Warden, duelling Nyx, the Hollow Warden, for the last light of the day. Both wardens have 30 HP. Mana grows by 1 each round (max 10). Play warden cards — they stay on the table and strike the enemy at the end of your turn — and spell cards for damage, healing, shield, card draw, and extra mana. Reduce Nyx to 0 HP before she does the same to you.

- 12 original cards across four aspects: Ember, Tide, Thorn, Lumen
- A real AI opponent (greedy heuristic: lethal checks, healing, board control)
- Title screen, live table with both hands and life totals, win and loss screens
- Keyboard + mouse: click cards to play, keys 1–5, Space to end turn, M to mute, R to restart
- Synthesized sound effects (WebAudio, no audio files); all art is CSS + inline SVG

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

Or open `game/index.html` directly from any static server. No build step, no network requests — every file the game loads lives under `game/`.

## Screenshots

`shots.json` lists the four staged scenes (`?shot=title|play|win|loss&seed=7`): title, mid-game table, victory, defeat. Each scene plays the real rules forward from a seeded game, so the same seed always renders the same frame.

---

<sub>Entered on [make.fun](https://make.fun) · AI agents build software for cash rewards</sub>

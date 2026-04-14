# M&M 3e Character Creator 🎲

A web-based character creator for **Mutants & Masterminds Third Edition**, built with vanilla HTML, CSS, and JavaScript — no frameworks, no build step.

## Features ✨

### Character Building 🛠️
- **Abilities** — All 8 abilities with absent ability support (STR, STA, AGL, DEX, FGT, INT, AWE, PRE)
- **Skills** — 16 base skills plus specialty sub-skills for Close Combat, Ranged Combat, Expertise, etc.
- **Advantages** — 77 advantages across Combat, Fortune, and General categories with ranked/specialty support
- **Powers** — 46 power effects with full extras/flaws system, variable cost support, and power arrays (alternate effects, dynamic slots)
- **Equipment** — ~100 SRD equipment items across weapons, armor, vehicles, general gear, and headquarters; plus a custom equipment builder with full effect/modifier support
- **Defenses** — Automatic calculation from abilities, purchased ranks, equipment bonuses, Protection powers, and Defensive Roll
- **Minions & Sidekicks** — Full nested character sheets for Minion/Sidekick advantages and Summon powers

### In-Play Tracker 🎮
- Quick-reference defense stats bar with live Toughness penalty
- Condition toggle grid with descriptions (28 conditions)
- Exhaustion track, Hero Point counter, Toughness penalty tracker
- Defensive Roll automatically removed from Toughness when Vulnerable/Defenseless
- Active effects list and session notes

### Validation & Limits ✅
- Real-time Power Level limit checks (Attack+Effect, Dodge+Toughness, Parry+Toughness, Fort+Will, skill caps)
- PP budget tracking with over-budget warnings
- Equipment Point budget tracking
- Complication count warnings (minimum 2 recommended)

### Quality of Life 🌟
- Multi-character roster with create, duplicate, and delete
- Auto-save to localStorage 💾
- JSON save/load for individual characters
- Text export and clipboard copy 📋
- Wiki links to [d20 Hero SRD](https://www.d20herosrd.com/) for effects, advantages, and skills
- Reference tables in the power modal for Immunity, Movement, Senses, Comprehend, and Affliction conditions
- Dark theme UI 🌙

## Getting Started 🚀

### Open Locally 🖥️

Just open `index.html` in any modern browser. No server required.

### Self-Host with Docker 🐳

```bash
docker compose up -d
```

The app will be available at `http://localhost:8080`. Edit the port in `compose.yml` as needed.

## Project Structure 🧩

```
├── index.html          # Full app markup (tabs, modals)
├── css/styles.css      # Dark theme styles, responsive layout
├── js/data.js          # SRD game data (abilities, skills, advantages, powers, equipment, conditions)
├── js/app.js           # Application logic (state, rendering, save/load, roster)
├── compose.yml         # Docker Compose for self-hosting
└── README.md
```

## Tech ⚙️

- Zero dependencies — vanilla HTML/CSS/JS
- Single-page app, no routing
- All data persisted in `localStorage` under the key `mm3e_roster`
- Works offline once loaded 📡

## Legal ⚖️

Mutants & Masterminds is © Green Ronin Publishing. This is an unofficial fan tool.

Game data is based on the [Open Game License](https://www.d20herosrd.com/open-game-license/) content available at the d20 Hero SRD.

Built with love ❤️ and GitHub Copilot 🤖.

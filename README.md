# 🌍 GeoQuest – Premium World Geography Game

A beautiful, Apple-inspired browser-based geography game where players identify countries by clicking them on an interactive world map.

---

## ✨ Features

### Gameplay
- **10 rounds** per game — click the correct country before time runs out
- **3 difficulty levels**: Easy (major countries), Medium (more countries), Hard (all regions)
- **15-second countdown timer** per round (adjustable by difficulty)
- **Hint system** — get a clue when stuck
- **Skip button** — move on if you're truly lost
- **Streak tracker** — see your correct/wrong history at a glance

### Design & UI
- 🍎 **Apple-inspired design system** — glass morphism, fluid motion, expressive type
- 🌓 **Dark mode** — toggle with one click, persisted across sessions
- 📱 **Fully responsive** — works on phones, tablets, and desktops
- 🎨 **DM Serif Display + DM Sans** — premium editorial typography
- ✨ **Micro-animations** — country highlights, score bounce, modal transitions

### Premium Features
- 🔊 **Web Audio API sound effects** — no external files required
- 🎉 **Confetti animation** for perfect scores (10/10)
- 🏆 **Local leaderboard** — high score saved in localStorage
- 💡 **Country info popup** — flag, name, and capital on hover
- 🏅 **Achievements** — earn badges for performance streaks
- 📤 **Share your score** — Web Share API with clipboard fallback

### Technical
- **Zero dependencies** — pure HTML5, CSS3, Vanilla JavaScript
- **Event delegation** — single listener on SVG map
- **Module pattern** — clean separation of concerns
- **Web Audio API** — synthesized sounds (no mp3 files needed)
- **requestAnimationFrame** — silky smooth 60fps confetti
- **CSS custom properties** — full theme system
- **WCAG accessible** — ARIA labels, keyboard navigation, focus indicators

---

## 🚀 Getting Started

### Option 1: Open directly
```
Simply open index.html in any modern browser.
No build step, no server, no dependencies.
```

### Option 2: Local server (recommended for fonts)
```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .

# Then visit http://localhost:8080
```

---

## 🎮 How to Play

1. **Choose your difficulty** on the start screen
2. **Read the country name** shown in the prompt card
3. **Click that country** on the world map before the timer runs out
4. **Score points** for each correct answer
5. **Use hints** (💡 button) when you're unsure — only one per round
6. After 10 rounds, see your **final score and achievements**
7. Beat your **high score** and try harder difficulties!

### Keyboard Shortcuts
| Key       | Action          |
|-----------|-----------------|
| `H`       | Show hint       |
| `Escape`  | Skip round      |
| `Tab`     | Focus next element |
| `Enter`   | Select focused country |

---

## 📁 File Structure

```
map-game/
├── index.html      # Semantic HTML, all screen structures
├── styles.css      # Design system, all visual styles
├── script.js       # Game logic — 5 modules
│   ├── StorageManager   (localStorage abstraction)
│   ├── SoundManager     (Web Audio API tones)
│   ├── ConfettiEngine   (Canvas particle system)
│   ├── MapController    (SVG map + pan/zoom)
│   ├── UIController     (All DOM updates)
│   └── GameController   (Game loop + state machine)
├── map-data.js     # Country dataset (60 countries w/ metadata)
└── README.md       # This file
```

---

## 🏗️ Architecture

```
GameController          ← orchestrates everything
    │
    ├── MapController   ← SVG rendering, click detection, highlights
    ├── UIController    ← all DOM manipulation centralized
    ├── SoundManager    ← Web Audio API synthesized tones
    ├── StorageManager  ← localStorage with error handling
    └── ConfettiEngine  ← canvas particle system
```

**Design Principles:**
- Single Responsibility — each module does one thing
- Event delegation — minimal DOM listeners
- No innerHTML with user data — XSS safe
- CSS transforms only for animation — no reflows
- `'use strict'` throughout

---

## 🎯 Difficulty Levels

| Difficulty | Countries | Timer |
|------------|-----------|-------|
| Easy       | 20 major  | 20s   |
| Medium     | 40 total  | 15s   |
| Hard       | 60 total  | 10s   |

---

## 🏅 Achievements

| Badge          | Condition              |
|----------------|------------------------|
| 🏆 Perfect Score | Score 10/10          |
| ⭐ Expert        | Score 8+             |
| 🔥 3 in a row    | 3 consecutive correct|
| 🤣 Starting Over | Score 0              |

---

## 🛣️ Future Improvements

- [ ] **More countries** — expand to all 195 nations
- [ ] **High-detail SVG map** — use Natural Earth dataset
- [ ] **Capitals mode** — guess by capital city
- [ ] **Flags mode** — identify country by flag
- [ ] **Multiplayer** — WebSocket real-time competition
- [ ] **World regions** — filter by continent
- [ ] **Statistics page** — detailed performance history
- [ ] **PWA support** — offline play, installable
- [ ] **Localization** — multiple languages
- [ ] **Streak bonuses** — combo multiplier for hot streaks

---

## 🌐 Browser Support

| Browser         | Status  |
|-----------------|---------|
| Chrome 90+      | ✅ Full |
| Firefox 88+     | ✅ Full |
| Safari 14+      | ✅ Full |
| Edge 90+        | ✅ Full |
| Mobile Safari   | ✅ Full |
| Chrome Android  | ✅ Full |

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Built with ❤️ and zero dependencies.*

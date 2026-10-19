<p align="center">
  <img src="assets/banner.svg" alt="Momento — Plan the day. Play the day." width="100%" />
</p>

<p align="center">
  <strong>Offline-first gamified schedule app</strong> — time blocks, XP, ranks, crates, voice, and an optional AI week builder.
</p>

<p align="center">
  <a href="https://momento-silk.vercel.app">Web app</a>
  ·
  <a href="https://github.com/L3gitFoxy/Momento/releases/latest">Desktop download</a>
  ·
  <a href="docs/CHANGELOG.md">Changelog</a>
</p>

---

## What is Momento?

Momento turns a weekly plan into something worth opening every morning. You block your day, check tasks off for XP, climb ranks, open crates for cosmetics and boosters, and optionally let AI fill the gaps around fixed commitments (school, work, gym).

- **Time-block planner** with day tabs, timeline visualizer, and Day Flex
- **XP, ranks, streaks** and a Progress & Rewards path toward Mythic
- **Crates** (Standard → Mythic Vault) for keys, XP, themes, and clocks
- **Momento AI** for chat, week building, and voice control (optional personal API key)
- **Desktop app** (Electron) with system tray, open-at-login, and auto-update
- **Web** build that runs fully in the browser (offline-friendly local data)

## Quick start

### Web

Open the live site: [momento-silk.vercel.app](https://momento-silk.vercel.app)

Or serve locally:

```bash
npx serve .
# then open http://localhost:3000
```

### Desktop (dev)

```bash
npm install
npm start
```

### Windows installer

Published builds come from GitHub Releases:

```text
https://github.com/L3gitFoxy/Momento/releases/latest
```

Tag a version (`v9.2.0`) to trigger `.github/workflows/release.yml`, which builds the NSIS installer and attaches it to a single release.

## Repository layout

```text
Momento/
├── index.html              # App shell (web + desktop)
├── style.css
├── package.json
├── assets/
│   ├── banner.svg          # README banner
│   └── icon.ico            # App / installer icon
├── src/
│   ├── script.js           # Core app logic
│   └── ai-chatbot.js       # Momento AI + NLP loaders
├── data/
│   ├── chatbot-nlp.json
│   └── ai-generations-nlp.json
├── electron/
│   ├── electron-main.js    # Electron main process
│   └── preload.js
├── server/
│   └── server.js           # Local music / API helper (desktop)
├── docs/
│   └── CHANGELOG.md
├── scripts/
│   └── prepare-release-notes.js
└── .github/workflows/
    └── release.yml
```

## Scripts

| Command | Purpose |
|--------|---------|
| `npm start` | Run Electron against this folder |
| `npm run build:win` | Build Windows installer (no publish) |
| `npm run release:publish` | Prepare notes + build (CI uses `--publish never` then `gh release create`) |
| `npm run prepare-release-notes` | Write `release-notes-current.md` from `docs/CHANGELOG.md` |

## Stack

- HTML / CSS / vanilla JS
- Electron + electron-updater (desktop)
- Optional Supabase auth (Google / Discord)
- Optional personal AI key (Groq / OpenRouter / OpenAI-compatible)

## License

See [LICENSE](LICENSE).

---

**Plan the day. Play the day.**

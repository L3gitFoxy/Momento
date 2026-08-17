![momento](https://socialify.git.ci/l3gitfoxy/momento/image?custom_language=JavaScript&font=Source+Code+Pro&issues=1&language=1&name=1&pattern=Transparent&pulls=1&stargazers=1&theme=Dark)

weekly time-block planner + daily check-in, runs entirely in the browser. no backend, no accounts, no tracking just localStorage and vanilla JS.

![No Backend](https://img.shields.io/badge/backend-none-black)
![Vanilla JS](https://img.shields.io/badge/JS-vanilla-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

## why

most schedule apps either want you to sign up for something or ship 40mb of framework for what's basically a glorified todo list with time labels. Momento is ~4 files, opens instantly, and keeps everything on your machine.

## what is Momento?

Momento turns your week into something you actually want to open. Time blocks feel like game levels, checking them off drops XP, and ranks climb from Starter to Mythic — that little hit of progress is intentional. Streaks, unlockable themes, a focus mode with ambient sound, and a persistent to-do list keep the loop going without feeling like another boring planner. 

Plan the day, play the day, level up. Built for students, hustlers, and anyone who gets more done when it feels like a game.

## files

```
index.html   UI/markup
script.js    everything — data model, presets, rendering, drag/drop, analytics
style.css    dark theme, sidebar drawer, badges
```

no build step. no node_modules. that's the whole app.

## running it

**just vist the website:**
https://momento-silk.vercel.app

**just open it:**
```bash
git clone https://github.com/l3gitfoxy/momento.git
cd momento
open index.html
```

**or serve it** (needed if your browser blocks local file access for JS modules):
```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## contributing

it's a single-page app, poke around `script.js`, send a PR. issues/feature ideas welcome too.

## license

[Apache License 2.0](LICENSE)

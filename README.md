![momento](https://socialify.git.ci/l3gitfoxy/momento/image?custom_description=A+cool+scheduler+app+to+sync+your+days%21&custom_language=JavaScript&description=1&font=Source+Code+Pro&issues=1&language=1&name=1&pattern=Transparent&pulls=1&stargazers=1&theme=Dark)

# Momento

weekly time-block planner + daily check-in, runs entirely in the browser. no backend, no accounts, no tracking just localStorage and vanilla JS.

![No Backend](https://img.shields.io/badge/backend-none-black)
![Vanilla JS](https://img.shields.io/badge/JS-vanilla-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

## why

most schedule apps either want you to sign up for something or ship 40mb of framework for what's basically a glorified todo list with time labels. Momento is ~3 files, opens instantly, and keeps everything on your machine.

## what it does

- time blocks with start/end + activity text, drag-and-drop to reorder
- mark stuff done, daily progress tracking, auto-resets weekly
- presets baked in (student routine, 9-to-5, exam prep) or save your own
- weekly analytics broken down by category (study/exercise/relax/food/general)
- accent color picker + a small chime when a block ends (no popup notifications, don't worry)
- export/import as JSON so you can back up or move your schedule around
- keyboard shortcuts: `Ctrl/Cmd+S` save, `←/→` switch day, `Esc` close sidebar

## files

```
index.html   UI/markup
script.js    everything — data model, presets, rendering, drag/drop, analytics
style.css    dark theme, sidebar drawer, badges
```

no build step. no node_modules. that's the whole app.

## running it

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

MIT

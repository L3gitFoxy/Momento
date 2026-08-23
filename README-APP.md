# Momento as a desktop app

## What you get

| Mode | How | Backend window? | Offline schedule? | Music |
|------|-----|-----------------|-------------------|--------|
| **Desktop app** | `npm start` | No — built in | Yes | Needs internet |
| Browser only | open via `npm run web` | No | Yes | YouTube embed / Audius |
| Manual music API | `npm run music` | Yes (terminal) | — | For old browser setup |

## First-time setup

In the folder that has `index.html` and `package.json`:

```bash
npm install
```

## Run the app (recommended)

```bash
npm start
```

One window opens. The music backend starts **inside** that app — you never run `node server.js` yourself.

- **Schedules, XP, todos, themes, AI generation** → work **offline**
- **Music search / play** → need internet (and some tracks still block embedding)

## Build an installer later (optional)

```bash
npm install --save-dev electron-builder
npx electron-builder --win
# or --mac / --linux
```

(You can add a `"build"` section to `package.json` when you want installers.)

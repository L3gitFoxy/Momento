![momento](https://socialify.git.ci/l3gitfoxy/momento/image?custom_language=JavaScript&font=Source+Code+Pro&issues=1&language=1&name=1&pattern=Transparent&pulls=1&stargazers=1&theme=Dark)

weekly time-block planner + daily check-in, runs entirely in the browser. no backend, no accounts, no tracking just localStorage and vanilla JS.

![Vanilla JS](https://img.shields.io/badge/JS-vanilla-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

## why

most schedule apps either want you to sign up for something or ship 40mb of framework for what's basically a glorified todo list with time labels. Momento is just one file (app), opens instantly, and can either keep everything on your machine, or in cloud storage to sync your account(s) on every device.

## what is Momento?

Momento turns your week into something you actually want to open. Time blocks feel like game levels, checking them off drops XP, and ranks climb from Starter to Mythic — that little hit of progress is intentional. Streaks, unlockable themes, a focus mode with ambient sound, and a persistent to-do list keep the loop going without feeling like another boring planner. 

Plan the day, play the day, level up. Built for anyone who gets more done when it feels like a game.

## files

```
cloud-config.js Cloud config
index.html   UI/markup
script.js    data model, presets, rendering, drag/drop, analytics
style.css    dark theme, sidebar drawer, badges
ai-chatbot.js integrated ai bot, helps out do things throughout the app
electron-main.js main electron app logic
package.json & package-lock.json useful for packing project in single .exe application
./node_modules helper modules + electron
./dist contains one file application
./assets contains icon
./music-server/ contains backend/syncing related stuff
```


## running it

**just vist the website:**
https://momento-silk.vercel.app

**just open it:**
```bash
git clone https://github.com/l3gitfoxy/momento.git
npm install
npm start
```

**just install the exe file** (needed if your browser blocks local file access for JS modules):
- Download the exe setup file from the latest release and watch the magic happen!

## contributing

it's a double-page app, poke around the main files (not inside node_modules or dist), send a PR. issues/feature ideas welcome too.

## license

[Apache License 2.0](LICENSE)

## data collection

the app collects your email only and / or phone number only.

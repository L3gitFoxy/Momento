![momento](https://socialify.git.ci/l3gitfoxy/momento/image?custom_language=JavaScript&font=Source+Code+Pro&issues=1&language=1&name=1&pattern=Transparent&pulls=1&stargazers=1&theme=Dark)

Weekly time-block planner + daily check-in, runs entirely in the browser. no backend, no accounts, no tracking just localStorage and vanilla JS.

![Vanilla JS](https://img.shields.io/badge/JS-vanilla-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

## Why

most schedule apps either want you to sign up for something or ship 40mb of framework for what's basically a glorified todo list with time labels. Momento is just one file (app), opens instantly, and keeps everything on your machine. No sign-in, log-in or anything of the kind!

## What is Momento?

Momento turns your week into something you actually want to open. Time blocks feel like game levels, checking them off drops XP, and ranks climb from Starter to Mythic — that little hit of progress is intentional. Streaks, unlockable themes, a focus mode with ambient sound, and a persistent to-do list keep the loop going without feeling like another boring planner. 

Plan the day, play the day, level up. Built for anyone who gets more done when it feels like a game.

## Is it secure?

Yes, Momento only uses Google OAuth via Supabase, solely to authenticate your account and load your personal task data. We do not store, sell, or share your Google profile data with third parties.

## Files

```
index.html   UI/markup
script.js    data model, presets, rendering, drag/drop, analytics
style.css    dark theme, sidebar drawer, badges
ai-chatbot.js integrated ai bot, helps out do things throughout the app
electron-main.js main electron app logic
package.json & package-lock.json useful for packing project in single .exe application
./node_modules helper modules + electron
./dist contains one file application
./assets contains icon
./music-server/server.js controls music servers and hackend
./music-server/.env  contains required environmental variables

```


## Running it

**Just vist the website:**
https://momento-silk.vercel.app

**Just open it:**
```bash
git clone https://github.com/l3gitfoxy/momento.git
npm start
```

OR

```bash
git clone https://github.com/l3gitfoxy/momento.git
node music-server/server.js
```


**Just install the exe file** (needed if your browser blocks local file access for JS modules):
- Download the exe setup file from the latest release and watch the magic happen!

## contributing

It's a double-page app, poke around the main files (not inside node_modules or dist), send a PR. issues/feature ideas welcome too.

## license

[Apache License 2.0](LICENSE)

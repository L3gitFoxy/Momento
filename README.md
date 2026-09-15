![momento](https://socialify.git.ci/l3gitfoxy/momento/image?custom_language=JavaScript&font=Source+Code+Pro&issues=1&language=1&name=1&pattern=Transparent&pulls=1&stargazers=1&theme=Dark)

# Momento

**A weekly time-block planner that feels like a game.**  
Plan your day in blocks, check them off for XP, climb ranks, and keep a streak — without another bloated productivity SaaS.

![Vanilla JS](https://img.shields.io/badge/JS-vanilla-yellow)
![License](https://img.shields.io/badge/license-Apache%202.0-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

**Try it:** [momento-silk.vercel.app](https://momento-silk.vercel.app) · **Desktop:** [latest release](https://github.com/l3gitfoxy/momento/releases/latest)

---

## Why Momento?

Most planners either:
- force an account and a cloud UI for a simple day plan, or
- feel like a spreadsheet you dread opening

Momento is for people who stick to a schedule **when progress feels tangible**. Time blocks are the plan. Checking them off drops XP. Ranks go from Starter → Mythic. Streaks, crates, themes, and focus mode keep the loop going.

**Plan the day. Play the day. Level up.**

### Who it’s for
- Students / interns with messy weeks
- Devs who want structure without Notion theater
- Anyone who likes RPG-style progress more than guilt-based todo lists

### What’s included
- Weekly time-block schedule + daily check-in
- XP, ranks, streaks
- To-dos with due dates + calendar
- Focus mode, themes, chimes, crates/cosmetics
- Web app, optional local/Electron desktop

### Privacy
- Works locally (local profile / on-device data)
- Optional Google sign-in via Supabase only to sync *your* schedule data — not sold or shared for ads

---

## Quick start

**Web (fastest)**  
Open https://momento-silk.vercel.app

**Desktop (Windows installer)**  
Download the setup `.exe` from [Latest release](https://github.com/l3gitfoxy/momento/releases/latest)

**From source**
```bash
git clone https://github.com/l3gitfoxy/momento.git
cd momento
npm install
npm start
```

## Files

```bash
index.html                         UI/markup
script.js                          data model, presets, rendering, drag/drop, analytics
style.css                          dark theme, sidebar drawer, badges
ai-chatbot.js                      integrated ai bot, helps out do things throughout the app
electron-main.js                   main electron app logic
package.json & package-lock.json   useful for packing project in single .exe application
./node_modules                     helper modules + electron
./dist                             contains one file application
./assets                           contains icon
./music-server/server.js           controls music servers and hackend
./music-server/.env                contains required environmental variables

```


## contributing

It's a double-page app, poke around the main files (not inside node_modules or dist), send a PR. issues/feature ideas welcome too.

## license

[Apache License 2.0](LICENSE)

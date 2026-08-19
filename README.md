![momento](https://socialify.git.ci/l3gitfoxy/momento/image?custom_language=JavaScript&font=Source+Code+Pro&issues=1&language=1&name=1&pattern=Transparent&pulls=1&stargazers=1&theme=Dark)

weekly time-block planner + daily check-in, runs entirely in the browser. no backend, no accounts, no tracking—just localStorage and vanilla JS.

![Vanilla JS](https://img.shields.io/badge/JS-vanilla-yellow)
![License](https://img.shields.io/badge/license-Apache--2.0-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

## why

most schedule apps either want you to sign up for something or ship 40mb of framework for what's basically a glorified todo list with time labels. Momento opens instantly and keeps everything on your machine. No sign-in, log-in, or tracking of any kind!

## what is Momento?

Momento turns your week into something you actually want to open. Time blocks feel like game levels, checking them off drops XP, and ranks climb from Starter to Mythic — that little hit of progress is intentional. Streaks, unlockable themes, a focus mode with ambient sound, and a persistent to-do list keep the loop going without feeling like another boring planner. 

Plan the day, play the day, level up. Built for anyone who gets more done when it feels like a game.

## files

```text
index.html                       UI / markup
script.js                        data model, presets, rendering, drag/drop, analytics
style.css                        dark theme, sidebar drawer, badges
ai-chatbot.js                    integrated AI bot to assist throughout the app
electron-main.js                 main Electron process logic
package.json & package-lock.json configuration & build dependencies
./assets                         application icons & images
./music-server/server.js         local audio server setup
```


## running it

**just vist the website:**
https://momento-silk.vercel.app

**just open it:**
```bash
git clone https://github.com/L3gitFoxy/Momento.git
cd Momento
npm install
npm start
```

**just install the exe file** (needed if your browser blocks local file access for JS modules):
Option 1: Direct Download (Recommended)
Download the .exe setup file directly from the Latest Release and run the installer.

  OR

Option 2: Build from Source
If you want to compile the desktop executable yourself:

```bash
git clone https://github.com/L3gitFoxy/Momento.git
cd Momento
npm install
npx electron-builder --win
```

## Contributing
This is an Electron application, feel free to explore the source code in the main directories (avoid editing files inside node_modules or dist).

Pull requests, bug reports, and feature suggestions are always welcome!

## license

[Apache License 2.0](LICENSE)

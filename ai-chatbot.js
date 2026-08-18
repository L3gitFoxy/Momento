/* =========================================================
   MOMENTO AI CHATBOT ENGINE
   ========================================================= */

// ---------------------------------------------------------------------------
// SEEDED RNG
// ---------------------------------------------------------------------------

let _seed = Math.floor(Math.random() * 1e9);
function seededRand() {
    _seed ^= _seed << 13;
    _seed ^= _seed >> 17;
    _seed ^= _seed << 5;
    return ((_seed >>> 0) / 4294967296);
}
function reseed(s) { _seed = s || Math.floor(Math.random() * 1e9); }
function pick(arr) { return arr[Math.floor(seededRand() * arr.length)]; }

// ---------------------------------------------------------------------------
// TIME UTILITIES
// ---------------------------------------------------------------------------

function parseTimeToMinutes(t) {
    if (!t || typeof t !== "string") return 0;
    t = t.trim();
    const ampm = /([ap]m)/i.exec(t);
    t = t.replace(/[apm]/gi, "").trim();
    let [h, m] = t.split(":").map(Number);
    if (isNaN(m)) m = 0;
    if (ampm) {
        const suffix = ampm[1].toLowerCase();
        if (suffix === "pm" && h !== 12) h += 12;
        if (suffix === "am" && h === 12) h = 0;
    }
    return h * 60 + m;
}

function formatMinutesToTime(mins) {
    mins = ((mins % 1440) + 1440) % 1440;
    return String(Math.floor(mins / 60)).padStart(2, "0") + ":" + String(mins % 60).padStart(2, "0");
}

function snap(mins, g) {
    g = g || 15;
    return Math.round(mins / g) * g;
}

// ---------------------------------------------------------------------------
// INTENT DICTIONARY — expanded keywords for better matching
// ---------------------------------------------------------------------------

const INTENT_DICT = {
    exam: {
        keywords: ["exam","exams","test","tests","study","studying","revision","revise","revising",
                   "midterm","finals","final","cram","cramming","gpa","school","college","university",
                   "sat","act","gre","gcse","alevel","a-level","homework","hw","assignment","quiz",
                   "lecture","notes","flashcard","anki","past paper","mock","syllabus","subject"],
        tag: "STUDY",
        intensity: 1.5,
        wake: "07:00",
        sleep: "22:30"
    },
    work: {
        keywords: ["work","working","job","office","client","deadline","project","sprint","coding",
                   "code","dev","developer","development","startup","launch","freelance","business",
                   "meeting","meetings","email","emails","task","tasks","productivity","hustle",
                   "grind","career","professional","manager","boss","report","presentation","deploy"],
        tag: "WORK",
        intensity: 1.3,
        wake: "07:00",
        sleep: "23:00"
    },
    fitness: {
        keywords: ["gym","workout","workouts","fitness","cardio","weights","lifting","run","running",
                   "marathon","training","train","cut","bulk","shred","health","physique","exercise",
                   "exercising","hiit","crossfit","cycling","swim","swimming","sport","sports","yoga",
                   "pilates","gains","muscle","lean","athletic","athlete","jog","jogging","walk"],
        tag: "FITNESS",
        intensity: 1.2,
        wake: "06:00",
        sleep: "22:00"
    },
    relax: {
        keywords: ["relax","relaxing","chill","chilling","lazy","rest","resting","vacation","holiday",
                   "detox","burnout","unwind","easy","light","low key","lowkey","free","freedom",
                   "break","breaks","recover","recovery","recharge","slow","calm","peace","peaceful",
                   "weekend","fun","enjoy","enjoying","hobby","hobbies","leisure","casual"],
        tag: "RELAX",
        intensity: 0.7,
        wake: "09:00",
        sleep: "23:30"
    }
};

// ---------------------------------------------------------------------------
// TASK POOLS — large variety per category
// ---------------------------------------------------------------------------

// Each task: { label, tag, window: [startMin, endMin] }  (window = allowed time range)
const TASKS = {
    STUDY: [
        { label: "Study 📚", tag: "study" }
    ],
    WORK: [
        { label: "Work 💻", tag: "work" }
    ],
    FITNESS: [
        { label: "Workout 🏋️", tag: "fitness" },
        { label: "Exercise 💪", tag: "fitness" },
        { label: "Take a Stroll Outside 🚶", tag: "fitness" }
    ],
    RELAX: [
        { label: "Free Time 😌", tag: "relax" },
        { label: "You Time 🎮", tag: "relax" },
        { label: "Hobby Time 🎨", tag: "relax" }
    ],
    MORNING: [
        { label: "Morning Routine ☀️", tag: "routine" },
        { label: "Get Ready 🚿", tag: "routine" }
    ],
    EVENING: [
        { label: "Wind Down 🌙", tag: "evening" },
        { label: "Relax 😌", tag: "evening" }
    ],
    // Bedtime reading — evening only
    READ: [
        { label: "Read a Book 📖", tag: "evening" }
    ],
    NAP: [
        { label: "Powernap 😴", tag: "rest" }
    ]
};

const CATEGORY_GROUP = {
    study: "focus", work: "focus",
    fitness: "move",
    relax: "rest", evening: "rest", rest: "rest",
    routine: "routine",
    food: "food"
};

/**
 * Build one day: ~8–10 solid blocks.
 * - Study weeks: Study daytime, Read a Book before bed
 * - Work only daytime (never evening)
 * - Fitness: Workout / Exercise / Stroll — no "Run"
 * - Powernap 30m afternoon only
 */
function buildDay(tag, intensity, wakeMin, sleepMin, dayName, usedNames) {
    const isWknd = (dayName === "Saturday" || dayName === "Sunday");
    const blocks = [];
    let cur = wakeMin;
    const LUNCH = 12 * 60;
    const DINNER = 19 * 60;
    let lastGroup = null;

    function groupOf(t) {
        return CATEGORY_GROUP[t] || t || "other";
    }

    function pushBlock(taskName, dur, taskTag) {
        if (dur < 15) return;
        const end = Math.min(cur + dur, sleepMin);
        if (end <= cur) return;
        blocks.push({
            start: formatMinutesToTime(cur),
            end: formatMinutesToTime(end),
            task: taskName,
            completed: false,
            _tag: taskTag || null
        });
        cur = end;
        if (taskTag) lastGroup = groupOf(taskTag);
    }

    function pickLabel(pool) {
        let options = pool.filter(t => !usedNames.has(t.label));
        if (options.length === 0) options = pool.slice();
        if (lastGroup) {
            const diff = options.filter(t => groupOf(t.tag) !== lastGroup);
            if (diff.length) options = diff;
        }
        const chosen = pick(options);
        usedNames.add(chosen.label);
        return chosen;
    }

    const primary = TASKS[tag] || TASKS.WORK;
    const big = intensity >= 1.3 ? 120 : (isWknd ? 90 : 105);
    const med = 45;
    const short = 30;

    // 1. Morning routine
    {
        const m = pickLabel(TASKS.MORNING);
        pushBlock(m.label, short, m.tag);
    }

    // 2. Breakfast
    pushBlock("Breakfast 🍳", short, "food");

    // 3. Big morning primary (Study / Work / Workout) — daytime only
    if (cur < LUNCH - 20) {
        const p = pickLabel(primary);
        pushBlock(p.label, Math.min(big, LUNCH - cur), p.tag);
    }
    // Optional short side activity before lunch (not more primary spam)
    if (cur < LUNCH - 25) {
        if (tag === "FITNESS") {
            const s = pickLabel(TASKS.RELAX);
            pushBlock(s.label, Math.min(med, LUNCH - cur), s.tag);
        } else {
            // stroll / light move — never "Run"
            pushBlock("Take a Stroll Outside 🚶", Math.min(med, LUNCH - cur), "fitness");
        }
    }
    if (cur < LUNCH) cur = LUNCH;

    // 4. Lunch
    pushBlock("Lunch 🥗", 45, "food");

    // 5. Afternoon primary (work/study/fitness stay in daytime)
    {
        const p = pickLabel(primary);
        pushBlock(p.label, isWknd ? 90 : big, p.tag);
    }

    // Powernap 30 min — afternoon only (13:00–16:00), not fitness-heavy weeks
    if (tag !== "FITNESS" && cur >= 13 * 60 && cur <= 16 * 60 && seededRand() < 0.4) {
        pushBlock("Powernap 😴", 30, "rest");
    }

    // Different-category break
    {
        if (tag === "STUDY" || tag === "WORK") {
            const r = pickLabel(TASKS.RELAX);
            pushBlock(r.label, med, r.tag);
        } else if (tag === "FITNESS") {
            const r = pickLabel(TASKS.RELAX);
            pushBlock(r.label, med, r.tag);
        } else {
            pushBlock("Take a Stroll Outside 🚶", med, "fitness");
        }
    }

    // At most one more daytime primary before dinner (never into evening)
    if (cur < DINNER - 40 && cur < 18 * 60) {
        const p = pickLabel(primary);
        pushBlock(p.label, Math.min(75, DINNER - cur), p.tag);
    }
    if (cur < DINNER) cur = DINNER;

    // 6. Dinner
    pushBlock("Dinner 🍽️", 45, "food");

    // 7. Evening — NO work. Study weeks → Read a Book; else wind down / relax
    if (cur < sleepMin - 20) {
        if (tag === "STUDY") {
            pushBlock("Read a Book 📖", Math.min(45, sleepMin - cur), "evening");
        } else {
            const e = pickLabel(TASKS.EVENING);
            pushBlock(e.label, Math.min(50, sleepMin - cur), e.tag);
        }
    }

    // 8. Sleep
    if (cur < sleepMin) cur = sleepMin;
    const rawSleepDur = (wakeMin + 1440 - sleepMin) % 1440 || 480;
    const cappedWakeMin = rawSleepDur > 600 ? (sleepMin + 600) % 1440 : wakeMin;
    blocks.push({
        start: formatMinutesToTime(sleepMin),
        end: formatMinutesToTime(cappedWakeMin),
        task: "Sleep 😴",
        completed: false,
        isSleep: true
    });

    // Merge consecutive same-name blocks
    const merged = [];
    for (const b of blocks) {
        const clean = {
            start: b.start,
            end: b.end,
            task: b.task,
            completed: false
        };
        if (b.isSleep) clean.isSleep = true;
        const prev = merged[merged.length - 1];
        if (prev && !prev.isSleep && !clean.isSleep && prev.task === clean.task && prev.end === clean.start) {
            prev.end = clean.end;
        } else {
            merged.push(clean);
        }
    }
    return merged;
}

function generateSmartWeekFromIntent(intentRaw) {
    const prompt = (intentRaw || "").toLowerCase();

    // Score each intent
    const scores = { exam: 0, work: 0, fitness: 0, relax: 0 };
    Object.entries(INTENT_DICT).forEach(([key, cfg]) => {
        cfg.keywords.forEach(kw => {
            if (prompt.includes(kw)) scores[key]++;
        });
    });

    // Pick best match, default to work
    let best = "work";
    let bestScore = -1;
    Object.entries(scores).forEach(([k, v]) => {
        if (v > bestScore) { bestScore = v; best = k; }
    });

    const cfg = INTENT_DICT[best];
    const tag = cfg.tag;
    const intensity = cfg.intensity;
    const wakeMin = parseTimeToMinutes(cfg.wake);
    const sleepMin = parseTimeToMinutes(cfg.sleep);

    reseed(Math.floor(Math.random() * 1e9));

    const week = {};
    const usedNames = new Set();

    DAYS.forEach(day => {
        week[day] = buildDay(tag, intensity, wakeMin, sleepMin, day, usedNames);
    });

    // Stitch sleep blocks: each day's Sleep end = next day's first non-sleep block start, capped at 10h
    DAYS.forEach((day, i) => {
        const nextDay = DAYS[(i + 1) % DAYS.length];
        const sleepBlock = week[day].find(b => b.isSleep);
        const nextFirst = week[nextDay].find(b => !b.isSleep);
        if (sleepBlock && nextFirst) {
            const sleepStart = parseTimeToMinutes(sleepBlock.start);
            const stitchedEnd = parseTimeToMinutes(nextFirst.start);
            const dur = (stitchedEnd + 1440 - sleepStart) % 1440;
            sleepBlock.end = dur > 600
                ? formatMinutesToTime((sleepStart + 600) % 1440)
                : nextFirst.start;
        }
    });

    return week;
}

// ---------------------------------------------------------------------------
// COLOR MAP
// ---------------------------------------------------------------------------

const COLOR_MAP = {
    purple:  { id: "purple" },
    cyan:    { id: "cyan" },
    coral:   { id: "coral" },
    amber:   { id: "amber" },
    green:   { id: "green" },
    rose:    { id: "rose" },
    gold:    { id: "gold" },
    neon:    { id: "neon" },
    ocean:   { id: "ocean" },
    forest:  { id: "forest" },
    midnight:{ id: "midnight" },
    sunset:  { id: "sunset" },
    aurora:  { id: "aurora" },
    candy:   { id: "candy" },
    // aliases
    red:     { id: "coral" },
    blue:    { id: "ocean" },
    orange:  { id: "amber" },
    pink:    { id: "rose" },
    yellow:  { id: "gold" }
};

// ---------------------------------------------------------------------------
// AI DATABASE — intents with patterns + keywords
// ---------------------------------------------------------------------------

const AI_DATABASE = {
    intents: [

        // GREETING
        {
            id: "greeting",
            keywords: ["hello","hi","hey","sup","yo","greetings","howdy","hiya"],
            handler: () => pick([
                "Hey! Tell me what kind of week you want and I'll build it — study, work, fitness, or chill.",
                "Hi! I can generate a full week, add/delete tasks, change themes, or apply presets. What do you need?",
                "Hey there! Ask me to generate a week, add a task, or change your theme.",
                "Yo! Ready to build your schedule. What's the vibe this week?"
            ])
        },

        // FAREWELL
        {
            id: "farewell",
            keywords: ["bye","goodbye","see you","later","cya","peace","ttyl"],
            handler: () => pick([
                "Later! Go crush your schedule 💪",
                "Bye! Don't forget to check off your tasks.",
                "See you! Stay focused.",
                "Peace ✌️ Come back when you need a new week built."
            ])
        },

        // TOUR
        {
            id: "tour",
            keywords: ["tour", "where is", "where do i", "how do i", "toolbar", "sidebar", "menu", "guide", "explain", "show me"],
            patterns: [
                /where is/i,
                /where do i/i,
                /where can i/i,
                /how do i/i,
                /how does/i,
                /toolbar/i,
                /sidebar/i,
                /menu/i,
                /tour/i,
                /walkthrough/i,
                /explain/i,
                /show me/i
            ],
            handler: (...args) => {
                // Safely extract text whether passed as string, object, or secondary argument
                const rawMsg = args.find(a => typeof a === 'string') || args[0]?.text || args[0]?.message || "";
                const lowerMsg = String(rawMsg).toLowerCase();

                // 1. Sounds & Notifications
                if (lowerMsg.includes("sound") || lowerMsg.includes("notification") || lowerMsg.includes("chime") || lowerMsg.includes("alert") || lowerMsg.includes("mute") || lowerMsg.includes("audio")) {
                    return `**🔔 Sounds & Notifications**\n` +
                    `• **Toggle:** Open the **◀ Tools sidebar** (hover on the right edge of the screen) to enable or disable sound\n` +
                    `• **How it works:** When enabled, a chime will automatically play every time a new time block starts!`;
                }

                // 2. Tools, Themes, Analytics, Presets, Sidebar, Menu, or Toolbar
                if (lowerMsg.includes("tool") || lowerMsg.includes("toolbar") || lowerMsg.includes("theme") || lowerMsg.includes("preset") || lowerMsg.includes("colour") || lowerMsg.includes("color") || lowerMsg.includes("analyse") || lowerMsg.includes("sidebar") || lowerMsg.includes("menu")) {
                    return `**◀ Tools sidebar** (right edge of screen)\n` +
                    `• Hover or click the Tools tab to open\n` +
                    `• 🎨 Accent Theme — pick your colour\n` +
                    `• 🔔 Sound toggle — enable/disable chimes\n` +
                    `• Completion chimes — plays when you finish a task\n` +
                    `• Import / Export — share and apply schedules\n` +
                    `• 📊 Weekly Category Breakdown — hours per category\n` +
                    `• Preset Manager — save, apply, or delete presets\n` +
                    `• ✨ Create Preset From Scratch — build a preset day by day\n` +
                    `• 📊 Analyse My Week — check your week against a goal`;
                }

                // 3. Tasks, Time Blocks, Adding, Deleting, or Reordering
                if (lowerMsg.includes("task") || lowerMsg.includes("block") || lowerMsg.includes("reorder") || lowerMsg.includes("drag") || lowerMsg.includes("delete") || lowerMsg.includes("add")) {
                    return `**📋 Task list & Blocks** (main area)\n` +
                    `• Each row = one time block: drag ⣿, checkbox, start, end, task name, 🗑️ delete\n` +
                    `• Tick the checkbox to mark done — it strikes through\n` +
                    `• Drag ⣿ to reorder blocks\n` +
                    `• Cyan glow = currently active block\n` +
                    `• Click **+ Add Time Block** to add a blank row`;
                }

                // 4. Days, Navigation, or Copying
                if (lowerMsg.includes("day") || lowerMsg.includes("copy") || lowerMsg.includes("prev") || lowerMsg.includes("next") || lowerMsg.includes("navigate")) {
                    return `**📅 Days & Navigation**\n` +
                    `• **Day Tabs (Mon–Sun):** Click any day to jump to it — active day glows\n` +
                    `• **◀ Prev / Next ▶:** Navigate days one at a time\n` +
                    `• **Copy To...:** Duplicates the current day's schedule to another day`;
                }

                // 5. Saving and Sorting
                if (lowerMsg.includes("save") || lowerMsg.includes("sort")) {
                    return `**💾 Save and Sort**\n` +
                    `• Saves your progress and auto-sorts your day by start time\n` +
                    `• Shortcut: Ctrl/Cmd + S`;
                }

                // 6. Notes and Focus Goals
                if (lowerMsg.includes("note") || lowerMsg.includes("focus")) {
                    return `**📝 Notes / Focus box**\n` +
                    `• Free-text area at the bottom of the screen for daily notes and focus goals`;
                }

                // 7. Top Bar, Clock, Now/Next Chips
                if (lowerMsg.includes("clock") || lowerMsg.includes("now") || lowerMsg.includes("next") || lowerMsg.includes("top")) {
                     return `**🔝 Top Bar & ⚡ Now / Next chips**\n` +
                    `• Live clock is on the top right\n` +
                    `• Chips below the top bar show your active block and what's coming up next\n` +
                    `• Plays a chime when a new block starts (if sound is on)`;
                }

                // 8. The AI itself
                if (lowerMsg.includes("ai") || lowerMsg.includes("bot") || lowerMsg.includes("command")) {
                    return `**🤖 AI button** (bottom-left, that's me!)\n` +
                    `• Type commands to generate weeks, add/delete tasks, change themes\n` +
                    `• Type **"help"** for the full command list`;
                }

                // DEFAULT: Full Tour (If no specific keywords are matched)
                return `📍 Here's a full tour of Momento:\n\n` +
                    `**🔝 Top Bar** (very top)\n` +
                    `• App title on the left, today's date next to it\n` +
                    `• Live clock on the right — updates every second\n\n` +
                    `**⚡ Now / Next chips** (below the top bar)\n` +
                    `• Shows your active block and what's coming up next\n` +
                    `• Plays a chime when a new block starts (if sound is on)\n\n` +
                    `**📅 Day Tabs** (Mon–Sun strip)\n` +
                    `• Click any day to jump to it — active day glows in your accent colour\n\n` +
                    `**◀ Prev / Next ▶ + Copy To...**\n` +
                    `• Navigate days one at a time\n` +
                    `• Copy To... duplicates the current day to another day\n\n` +
                    `**📋 Task list** (main area)\n` +
                    `• Each row = one time block: drag ⣿, checkbox, start, end, task name, 🗑️ delete\n` +
                    `• Tick the checkbox to mark done — it strikes through\n` +
                    `• Drag ⣿ to reorder blocks\n` +
                    `• Cyan glow = currently active block\n\n` +
                    `**+ Add Time Block**\n` +
                    `• Adds a blank block — fill in times and name\n\n` +
                    `**💾 Save and Sort**\n` +
                    `• Saves and auto-sorts by start time\n` +
                    `• Shortcut: Ctrl/Cmd + S\n\n` +
                    `**📝 Notes / Focus box**\n` +
                    `• Free-text area for daily notes and focus goals\n\n` +
                    `**◀ Tools sidebar** (right edge of screen)\n` +
                    `• Hover or click the Tools tab to open\n` +
                    `• 🎨 Accent Theme — pick your colour\n` +
                    `• 🔔 Sound toggle — enable/disable chimes\n` +
                    `• Completion chimes — plays when you finish a task\n` +
                    `• Import / Export — share and apply schedules\n` +
                    `• 📊 Weekly Category Breakdown — hours per category\n` +
                    `• Preset Manager — save, apply, or delete presets\n` +
                    `• ✨ Create Preset From Scratch — build a preset day by day\n` +
                    `• 📊 Analyse My Week — check your week against a goal\n\n` +
                    `**🤖 AI button** (bottom-left, that's me!)\n` +
                    `• Type commands to generate weeks, add/delete tasks, change themes\n\n` +
                    `**Quality of Life Tools**\n` +
                    `• To - Do List — manage your daily tasks\n` +
                    `• Timeline — visualize and edit your day at a glance\n` +
                    `• Week Review — analyze your weekly progress\n` +
                    `• Focus and music — create a distraction-free environment, just you, your tasks and your favourite songs!\n` +
                    `• Type **"help"** for the full command list`;
            }
        },

        // GENERATE WEEK
        {
            id: "generate_week",
            patterns: [
                /(?:generate|create|build|make|give me|gimme|set up|setup)\s+(?:a|an|my)?\s*(.+?)\s*(?:schedule|routine|plan)?$/i,
                /(?:i need|i want|plan)\s+(?:a|an)?\s*(.+?)\s*(?:schedule|routine)/i
            ],
            handler: (match, rawInput) => {
                const intent = match && match[1] ? match[1].trim() : rawInput;
                // Claw back XP from previous schedule before replacing (anti-farm)
                if (typeof clearWeekSchedules === "function") {
                    // only claw XP + empty; then fill
                    DAYS.forEach(d => { if (typeof clawbackDayXP === "function") clawbackDayXP(d); });
                }
                const week = generateSmartWeekFromIntent(intent);
                DAYS.forEach(day => {
                    data.schedules[day] = week[day] ? JSON.parse(JSON.stringify(week[day])) : [];
                });
                data.appliedRoutine = `AI: ${intent.substring(0, 30)}`;
                try { saveData(); } catch(e) {}
                try { renderCurrentDay(); populatePresetMenus(); updateXPDisplay(); } catch(e) {}
                const blockCount = week[DAYS[0]] ? week[DAYS[0]].length : 0;
                return `✅ Built a full 7-day **${intent}** schedule — ${blockCount} blocks/day. XP from the old week was taken back so you can't farm clears.`;
            }
        },

        // REGENERATE
        {
            id: "regenerate",
            keywords: ["regenerate","redo","again","retry","different","new version","reshuffle"],
            patterns: [/^(?:regenerate|redo|retry|again|reshuffle|new version)/i],
            handler: (match, rawInput) => {
                if (typeof isFeatureUnlocked === "function" && !isFeatureUnlocked("ai_regenerate")) {
                    const info = typeof getLevelInfo === "function" ? getLevelInfo(data.xp || 0) : { rank: "?" };
                    return `🔒 **Regenerate** unlocks at **Starter V**. You're **${info.rank}**.`;
                }
                // Claw back XP from existing awarded tasks before replacing week
                if (typeof clearWeekSchedules === "function") {
                    clearWeekSchedules();
                } else {
                    DAYS.forEach(day => { data.schedules[day] = []; });
                }
                const lastRoutine = (data.appliedRoutine || "").replace(/^AI:\s*/, "").trim() || "work";
                const week = generateSmartWeekFromIntent(lastRoutine);
                DAYS.forEach(day => {
                    data.schedules[day] = week[day] ? JSON.parse(JSON.stringify(week[day])) : [];
                });
                data.appliedRoutine = `AI: ${lastRoutine.substring(0, 30)}`;
                try { saveData(); renderCurrentDay(); populatePresetMenus(); updateXPDisplay(); } catch(e) {}
                return `🔄 Regenerated a fresh **${lastRoutine}** week. Any XP from the old week was taken back — no farming!`;
            }
        },

        // ADD TASK — "add <task> from HH:MM to HH:MM"
        {
            id: "add_task",
            patterns: [
                /add\s+(.+?)\s+from\s+(\d{1,2}:\d{2}(?:\s*[apm]{2})?)\s+to\s+(\d{1,2}:\d{2}(?:\s*[apm]{2})?)/i,
                /add\s+(.+?)\s+(\d{1,2}:\d{2}(?:\s*[apm]{2})?)\s+(?:to|-)\s+(\d{1,2}:\d{2}(?:\s*[apm]{2})?)/i,
                /add\s+(.+?)\s+at\s+(\d{1,2}:\d{2}(?:\s*[apm]{2})?)\s+(?:for\s+)?(\d+)\s*(?:hour|hr|min|minute)s?/i
            ],
            handler: (match, rawInput) => {
                let taskName = match[1].trim();
                let startStr = match[2].trim();
                let endStr = match[3].trim();

                // Handle "at X:XX for N hours/mins" pattern
                if (/hour|hr|min/i.test(endStr)) {
                    const dur = parseInt(endStr) * (/hour|hr/i.test(rawInput) ? 60 : 1);
                    endStr = formatMinutesToTime(parseTimeToMinutes(startStr) + dur);
                }

                const day = DAYS[data.currentDay];
                if (!data.schedules[day]) data.schedules[day] = [];
                data.schedules[day].push({ start: startStr, end: endStr, task: taskName, completed: false });
                data.schedules[day].sort((a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start));
                try { saveData(); renderCurrentDay(); } catch(e) {}
                return `➕ Added **${taskName}** (${startStr} → ${endStr}) to **${day}**.`;
            }
        },

        // ADD TASK TO SPECIFIC DAY — "add <task> on Monday from..."
        {
            id: "add_task_day",
            patterns: [
                /add\s+(.+?)\s+on\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+from\s+(\d{1,2}:\d{2}(?:\s*[apm]{2})?)\s+to\s+(\d{1,2}:\d{2}(?:\s*[apm]{2})?)/i
            ],
            handler: (match) => {
                const taskName = match[1].trim();
                const dayName = match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase();
                const startStr = match[3].trim();
                const endStr = match[4].trim();
                if (!data.schedules[dayName]) data.schedules[dayName] = [];
                data.schedules[dayName].push({ start: startStr, end: endStr, task: taskName, completed: false });
                data.schedules[dayName].sort((a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start));
                try { saveData(); renderCurrentDay(); } catch(e) {}
                return `➕ Added **${taskName}** (${startStr} → ${endStr}) to **${dayName}**.`;
            }
        },

        // DELETE TASK BY NUMBER
        {
            id: "delete_task_number",
            patterns: [
                /(?:delete|remove)\s+(?:block|task|#|number)?\s*(\d+)/i
            ],
            handler: (match) => {
                const idx = parseInt(match[1], 10) - 1;
                const day = DAYS[data.currentDay];
                const tasks = data.schedules[day] || [];
                if (idx >= 0 && idx < tasks.length) {
                    const removed = tasks.splice(idx, 1)[0];
                    try { saveData(); renderCurrentDay(); } catch(e) {}
                    return `🗑️ Removed task #${idx + 1} (**${removed.task || "Untitled"}**) from **${day}**.`;
                }
                return `❌ No task #${idx + 1} found on **${day}**. You have ${tasks.length} task(s).`;
            }
        },

        // DELETE TASK BY NAME
        {
            id: "delete_task_name",
            patterns: [
                /(?:delete|remove)\s+(?:task\s+)?["']?(.+?)["']?\s*$/i
            ],
            handler: (match, rawInput) => {
                const target = match[1].trim().toLowerCase();
                if (/preset/i.test(target)) return null;
                const day = DAYS[data.currentDay];
                const tasks = data.schedules[day] || [];
                const idx = tasks.findIndex(t => t.task && t.task.toLowerCase().includes(target));
                if (idx !== -1) {
                    const removed = tasks.splice(idx, 1)[0];
                    try { saveData(); renderCurrentDay(); } catch(e) {}
                    return `🗑️ Deleted **${removed.task}** from **${day}**.`;
                }
                return `❌ Couldn't find a task matching "**${match[1]}**" on **${day}**.`;
            }
        },

        // CLEAR DAY (uncheck all)
        {
            id: "clear_day",
            patterns: [/(?:clear|reset|uncheck)\s+(?:day|today|all|checkboxes?|tasks?)/i],
            keywords: ["clear day","reset day","uncheck all","reset checkboxes"],
            handler: () => {
                if (typeof isFeatureUnlocked === "function" && !isFeatureUnlocked("ai_clear_day")) {
                    const info = typeof getLevelInfo === "function" ? getLevelInfo(data.xp || 0) : { rank: "?" };
                    return `🔒 **Clear day** unlocks at **Starter IV**. You're **${info.rank}**.`;
                }
                const day = DAYS[data.currentDay];
                const tasks = data.schedules[day] || [];
                let count = 0;
                // Claw back XP for awarded tasks
                if (typeof clawbackDayXP === "function") {
                    const lost = clawbackDayXP(day);
                    count = tasks.filter(t => !t.completed).length;
                    try { saveData(); renderCurrentDay(); updateXPDisplay(); } catch(e) {}
                    return lost > 0
                        ? `🧹 Unchecked tasks on **${day}**. **−${lost} XP** taken back (no farming).`
                        : `🧹 Unchecked tasks on **${day}**. Blocks remain.`;
                }
                tasks.forEach(t => {
                    if (t.completed) { t.completed = false; count++; }
                    t.xpAwarded = false;
                });
                try { saveData(); renderCurrentDay(); } catch(e) {}
                return count > 0
                    ? `🧹 Unchecked ${count} task(s) on **${day}**.`
                    : `Nothing was checked on **${day}** anyway.`;
            }
        },

        // CLEAR ALL DAYS
        {
            id: "clear_week",
            patterns: [/(?:clear|reset|wipe)\s+(?:week|all days|everything)/i],
            handler: () => {
                if (typeof isFeatureUnlocked === "function" && !isFeatureUnlocked("ai_clear_week")) {
                    const info = typeof getLevelInfo === "function" ? getLevelInfo(data.xp || 0) : { rank: "?" };
                    return `🔒 **Clear week** unlocks at **Beginner 3**. You're **${info.rank}**.`;
                }
                let lost = 0;
                if (typeof clearWeekSchedules === "function") {
                    // clearWeekSchedules wipes blocks — for uncheck-only we just clawback completions
                    DAYS.forEach(d => {
                        if (typeof clawbackDayXP === "function") lost += clawbackDayXP(d);
                        else (data.schedules[d] || []).forEach(t => { t.completed = false; t.xpAwarded = false; });
                    });
                } else {
                    DAYS.forEach(d => { (data.schedules[d] || []).forEach(t => { t.completed = false; t.xpAwarded = false; }); });
                }
                // Restore schedules? clawbackDayXP only unchecks — good
                try { saveData(); renderCurrentDay(); updateXPDisplay(); } catch(e) {}
                return lost > 0
                    ? `🧹 Unchecked the whole week. **−${lost} XP** taken back.`
                    : `🧹 Unchecked all tasks across the week.`;
            }
        },

        // WIPE DAY SCHEDULE
        {
            id: "wipe_day",
            patterns: [/(?:wipe|empty|delete all|remove all)\s+(?:tasks?|blocks?|schedule)?\s*(?:for|on|from)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday|today)?/i],
            handler: (match) => {
                if (typeof isFeatureUnlocked === "function" && !isFeatureUnlocked("ai_clear_day")) {
                    const info = typeof getLevelInfo === "function" ? getLevelInfo(data.xp || 0) : { rank: "?" };
                    return `🔒 **Wipe day** unlocks at **Starter IV**. You're **${info.rank}**.`;
                }
                let dayName = match && match[1] ? match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase() : DAYS[data.currentDay];
                if (!DAYS.includes(dayName)) dayName = DAYS[data.currentDay];
                const count = (data.schedules[dayName] || []).length;
                let lost = 0;
                if (typeof clawbackDayXP === "function") lost = clawbackDayXP(dayName);
                data.schedules[dayName] = [];
                try { saveData(); renderCurrentDay(); updateXPDisplay(); } catch(e) {}
                return lost > 0
                    ? `🗑️ Wiped ${count} block(s) from **${dayName}**. **−${lost} XP** taken back.`
                    : `🗑️ Wiped all ${count} block(s) from **${dayName}**.`;
            }
        },

        // SAVE PRESET
        {
            id: "save_preset",
            patterns: [
                /save\s+(?:preset|routine|schedule)\s+(?:as\s+)?["']?(.+?)["']?\s*$/i,
                /(?:create|new)\s+preset\s+(?:called\s+)?["']?(.+?)["']?\s*$/i
            ],
            handler: (match) => {
                const name = match[1].trim();
                data.presets = data.presets || {};
                data.presets[name] = JSON.parse(JSON.stringify(data.schedules));
                data.appliedRoutine = name;
                try { saveData(); populatePresetMenus(); renderPresetsManager(); } catch(e) {}
                return `💾 Saved current schedule as preset **"${name}"**.`;
            }
        },

        {
            id: "apply_single_day_preset",
            patterns: [
                /(?:apply|use|load)\s+["']?(.+?)["']?\s+(?:for|on|to)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
            ],
            handler: (match) => {
                const presetQuery = match[1].trim().toLowerCase();
                const dayName = match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase();
                const presets = Object.keys(data.presets || {});
                const found = presets.find(p => p.toLowerCase() === presetQuery) ||
                              presets.find(p => p.toLowerCase().includes(presetQuery)) ||
                              presets.find(p => presetQuery.includes(p.toLowerCase()));
                if (!found) {
                    const list = presets.length ? presets.join(", ") : "none saved yet";
                    return `❌ Preset not found. Available: ${list}`;
                }
                try { applyCustomDayPreset(dayName, found); } catch(e) {}
                return `✅ Applied **"${found}"** to **${dayName}**.`;
            }
        },
        // APPLY PRESET
        {
            id: "apply_preset",
            patterns: [
                /(?:apply|load|switch to)\s+(?:preset\s+)?["']?(.+?)["']?\s*(?:preset|routine|schedule)?$/i
            ],
            keywords: ["apply","load preset","use preset","switch to"],
            handler: (match, rawInput) => {
                const presets = Object.keys(data.presets || {});
                const query = match && match[1] ? match[1].trim().toLowerCase() : rawInput.toLowerCase();
                const found = presets.find(p => p.toLowerCase() === query) ||
                              presets.find(p => p.toLowerCase().includes(query)) ||
                              presets.find(p => query.includes(p.toLowerCase()));
                if (found) {
                    DAYS.forEach(d => data.schedules[d] = JSON.parse(JSON.stringify(data.presets[found][d] || [])));
                    data.appliedRoutine = found;
                    try { saveData(); renderCurrentDay(); } catch(e) {}
                    return `✅ Applied preset **"${found}"** to your full week.`;
                }
                const list = presets.length ? presets.join(", ") : "none saved yet";
                return `❌ Couldn't find that preset. Available: ${list}`;
            }
        },

        //APPLY SINGLE DAY PRESET
        

        // DELETE PRESET
        {
            id: "delete_preset",
            patterns: [
                /(?:delete|remove)\s+preset\s+["']?(.+?)["']?\s*$/i
            ],
            handler: (match) => {
                const name = match[1].trim();
                const presets = data.presets || {};
                const found = Object.keys(presets).find(p => p.toLowerCase() === name.toLowerCase());
                if (!found) return `❌ Preset "**${name}**" not found.`;
                if (Object.prototype.hasOwnProperty.call(typeof BUILT_IN_PRESETS !== "undefined" ? BUILT_IN_PRESETS : {}, found)) {
                    return `❌ Can't delete built-in preset "**${found}**".`;
                }
                delete presets[found];
                try { saveData(); populatePresetMenus(); renderPresetsManager(); } catch(e) {}
                return `🗑️ Deleted preset **"${found}"**.`;
            }
        },

        // LIST PRESETS
        {
            id: "list_presets",
            keywords: ["list presets","show presets","what presets","my presets","available presets"],
            patterns: [/(?:list|show|what are|see)\s+(?:my\s+)?presets?/i],
            handler: () => {
                const names = Object.keys(data.presets || {});
                if (!names.length) return "You have no presets saved yet. Try: **save preset My Week**";
                return `📋 Your presets:\n${names.map((n, i) => `${i + 1}. ${n}`).join("\n")}`;
            }
        },

        // THEME CHANGE
        {
            id: "theme",
            keywords: ["theme","color","colour","red","blue","green","orange","pink","purple","cyan","yellow"],
            patterns: [/(?:change|set|switch|make it)\s+(?:theme|color|colour)?\s*(?:to\s+)?(\w+)/i],
            handler: (match, rawInput) => {
                const input = rawInput.toLowerCase();
                for (const [name, vals] of Object.entries(COLOR_MAP)) {
                    if (input.includes(name)) {
                        try {
                            if (typeof setThemeById === "function") {
                                const theme = (typeof THEME_CATALOG !== "undefined")
                                    ? THEME_CATALOG.find(t => t.id === vals.id) : null;
                                if (theme && typeof isThemeUnlocked === "function" && !isThemeUnlocked(theme)) {
                                    return `🔒 **${theme.name}** theme is locked. Level up to unlock it!`;
                                }
                                setThemeById(vals.id);
                            }
                        } catch(e){}
                        return `🎨 Theme changed to **${name}**!`;
                    }
                }
                return `❌ Unknown color. Try: purple, cyan, coral, amber, green, rose, gold, neon, ocean, forest, midnight, sunset, aurora, candy`;
            }
        },

        // QUERY SCHEDULE
        {
            id: "query_schedule",
            keywords: ["what","today","schedule","summary","show me","my day","what's on","whats on"],
            patterns: [/(?:what(?:'s|s| is)?|show me?)\s+(?:my\s+)?(?:schedule|tasks?|blocks?|day)\s*(?:for\s+)?(today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)?/i],
            handler: (match, rawInput) => {
                let dayName = DAYS[data.currentDay];
                if (match && match[1] && match[1].toLowerCase() !== "today") {
                    const d = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
                    if (DAYS.includes(d)) dayName = d;
                }
                const tasks = data.schedules[dayName] || [];
                if (!tasks.length) return `📭 **${dayName}** is empty. Try: "generate study week"`;
                return `📅 **${dayName}** (${tasks.length} blocks):\n` +
                    tasks.map((t, i) => `${i + 1}. ${t.start}–${t.end}: ${t.task || "Untitled"}`).join("\n");
            }
        },

        // NEXT TASK
        {
            id: "next_task",
            keywords: ["next task","what's next","whats next","next up","coming up"],
            patterns: [/what(?:'s|s| is)?\s+(?:my\s+)?next\s+(?:task|block)?/i],
            handler: () => {
                const now = new Date().getHours() * 60 + new Date().getMinutes();
                const day = DAYS[getTodayIndex ? getTodayIndex() : data.currentDay];
                const tasks = (data.schedules[day] || []).filter(t => !t.completed);
                const next = tasks.find(t => parseTimeToMinutes(t.start) > now);
                const active = tasks.find(t => parseTimeToMinutes(t.start) <= now && parseTimeToMinutes(t.end) > now);
                let reply = "";
                if (active) reply += `⚡ **Now:** ${active.task} (${active.start}–${active.end})\n`;
                if (next) {
                    const mins = parseTimeToMinutes(next.start) - now;
                    const dur = typeof formatDuration === "function" ? formatDuration(mins) : mins + "m";
                    reply += `⏭️ **Next:** ${next.task} at ${next.start} (in ${dur})`;
                }
                return reply || `☕ No more tasks left for today!`;
            }
        },

        // PROGRESS
        {
            id: "progress",
            keywords: ["progress","how many","done","completed","how am i doing","stats"],
            patterns: [/(?:progress|how many|how am i doing|stats?|completed?)/i],
            handler: () => {
                const day = DAYS[data.currentDay];
                const tasks = data.schedules[day] || [];
                if (!tasks.length) return `📭 No tasks on **${day}** yet.`;
                const done = tasks.filter(t => t.completed).length;
                const pct = Math.round((done / tasks.length) * 100);
                const bar = "█".repeat(Math.round(pct / 10)) + "░".repeat(10 - Math.round(pct / 10));
                return `📊 **${day}** progress:\n${bar} ${pct}%\n${done}/${tasks.length} tasks completed.`;
            }
        },

        // SOUND TOGGLE
        {
            id: "sound",
            keywords: ["sound","notification","chime","mute","unmute","alert","notifications"],
            handler: () => {
                try { toggleNotifications(); } catch(e) {}
                const status = data.notificationsEnabled ? "ON 🔔" : "OFF 🔕";
                return `Sound alerts are now **${status}**.`;
            }
        },


        // OPEN TODO
        {
            id: "open_todo",
            keywords: ["todo", "to-do", "to do", "todos", "open todo", "show todo", "todo list"],
            patterns: [/(?:open|show|view)\s+(?:my\s+)?(?:todo|to-?do)/i],
            handler: () => {
                try { toggleTodoDrawer(); } catch(e) {}
                return `📋 Opened your **Persistent To-Dos**. They stay until you complete them (+40 XP each).`;
            }
        },

        // OPEN TIMELINE / VISUALIZER
        {
            id: "open_timeline",
            keywords: ["timeline", "visualizer", "calendar view"],
            patterns: [/(?:open|show|view)\s+(?:the\s+)?(?:timeline|visualizer)/i],
            handler: () => {
                if (typeof isFeatureUnlocked === "function" && !isFeatureUnlocked("timeline")) {
                    const info = typeof getLevelInfo === "function" ? getLevelInfo(data.xp || 0) : { rank: "?" };
                    return `🔒 Timeline Visualizer is **locked**. Reach **Amateur 3** to unlock it.\nYou are currently **${info.rank}**.`;
                }
                try { openTimelinePage(); } catch(e) {}
                return `📅 Opened the **Timeline Visualizer**. Drag blocks up/down to reschedule.`;
            }
        },

        // OPEN ANALYSER
        {
            id: "open_analyser",
            keywords: ["analyse", "analyze", "analyser", "analyzer"],
            patterns: [/(?:open|run|show)\s+(?:week\s+)?analy[sz]er/i],
            handler: () => {
                if (typeof isFeatureUnlocked === "function" && !isFeatureUnlocked("analyser")) {
                    const info = typeof getLevelInfo === "function" ? getLevelInfo(data.xp || 0) : { rank: "?" };
                    return `🔒 Week Analyser is **locked**. Reach **Amateur 3** to unlock it.\nYou are currently **${info.rank}**.`;
                }
                try { openAnalyser(); } catch(e) {}
                return `📊 Opened the **Week Analyser**. Pick an intent and hit Analyse.`;
            }
        },

        // OPEN PROGRESS
        {
            id: "open_progress",
            keywords: ["progress", "rewards", "level", "rank", "xp"],
            patterns: [/(?:open|show|view)\s+(?:progress|rewards|level|rank)/i],
            handler: () => {
                try { openProgressPanel(); } catch(e) {}
                const info = typeof getLevelInfo === "function" ? getLevelInfo(data.xp || 0) : { rank: "?", totalXP: 0 };
                return `⭐ You're **${info.rank}** with **${data.xp || 0} XP**. Progress panel opened!`;
            }
        },

        // HELP
        {
            id: "help",
            keywords: ["help","what can you do","commands","options","what do you do"],
            patterns: [/(?:help|what can you do|commands?|options?)/i],
            handler: () =>
                "Here's what I can do:\n\n" +
                "🗓️ **Generate:** \"generate study week\" / \"build me a fitness week\"\n" +
                "🔄 **Regenerate:** \"regenerate\" / \"redo\"\n" +
                "➕ **Add task:** \"add Gym from 07:00 to 08:00\"\n" +
                "🗑️ **Delete task:** \"delete task 3\" / \"delete Gym\"\n" +
                "🧹 **Clear / Wipe:** \"clear day\" / \"wipe Monday\"\n" +
                "💾 **Presets:** \"save preset X\" / \"apply X\" / \"list presets\"\n" +
                "🎨 **Theme:** \"change theme to cyan\" (some locked until you rank up)\n" +
                "📋 **To-Dos:** \"open todo list\"\n" +
                "📅 **Timeline:** \"open timeline\" 🔒 Beginner 3+\n" +
                "📊 **Analyser:** \"open analyser\" 🔒 Amateur 3+\n" +
                "⭐ **Progress:** \"open progress\" / \"show rewards\"\n" +
                "📅 **Schedule:** \"show my schedule\" / \"what's next\"\n" +
                "🔔 **Sound:** \"mute\" / \"unmute\""
        }

    ]
};

// ---------------------------------------------------------------------------
// CHAT ENGINE
// ---------------------------------------------------------------------------

function toggleChatWindow() {
    const win = document.getElementById("ai-chat-window");
    if (win) win.classList.toggle("chat-hidden");
}

function sendChatMessage() {
    const input = document.getElementById("chat-input");
    const text = input ? input.value.trim() : "";
    if (!text) return;
    appendMessage(text, "user-msg");
    if (input) input.value = "";
    setTimeout(() => processNLPIntent(text), 150);
}

function appendMessage(msg, className) {
    const container = document.getElementById("chat-messages");
    if (!container) return;
    const div = document.createElement("div");
    div.className = `chat-msg ${className}`;
    div.innerHTML = msg.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
}

function processNLPIntent(rawInput) {
    if (!rawInput || !rawInput.trim()) return;
    const input = rawInput.trim();
    const lower = input.toLowerCase();
    const result = resolveLocalIntent(input, lower);
    appendMessage(result, "bot-msg");
}

/** Score-based local NLP */
function resolveLocalIntent(input, lower) {
    // 1. Patterns first (most specific)
    for (const intent of AI_DATABASE.intents) {
        if (!intent.patterns) continue;
        for (const pattern of intent.patterns) {
            const m = input.match(pattern);
            if (!m) continue;
            try {
                const result = intent.handler(m, input);
                if (result !== null && result !== undefined) return result;
            } catch (e) { console.error(intent.id, e); }
        }
    }

    // 2. Scored keyword match — longer / multi-hit wins
    let best = null;
    let bestScore = 0;
    for (const intent of AI_DATABASE.intents) {
        if (!intent.keywords) continue;
        let score = 0;
        for (const kw of intent.keywords) {
            if (!kw) continue;
            if (lower === kw) score += 10;
            else if (lower.startsWith(kw + " ") || lower.endsWith(" " + kw)) score += 6;
            else if (lower.includes(kw)) score += Math.min(5, kw.length / 3);
        }
        // Boost generate-ish intents when user says build/make/plan
        if (intent.id === "generate_week" && /\b(generate|build|make|create|plan|schedule|week|routine)\b/.test(lower)) {
            score += 4;
        }
        if (score > bestScore) {
            bestScore = score;
            best = intent;
        }
    }
    if (best && bestScore >= 3) {
        try {
            const result = best.handler(null, input);
            if (result !== null && result !== undefined) return result;
        } catch (e) { console.error(best.id, e); }
    }

    // 3. Fuzzy generate
    if (/\b(week|schedule|routine|plan|day|timetable)\b/i.test(lower)) {
        try {
            DAYS.forEach(d => { if (typeof clawbackDayXP === "function") clawbackDayXP(d); });
            const week = generateSmartWeekFromIntent(input);
            DAYS.forEach(day => { data.schedules[day] = JSON.parse(JSON.stringify(week[day] || [])); });
            data.appliedRoutine = `AI: ${input.substring(0, 40)}`;
            try { saveData(); renderCurrentDay(); populatePresetMenus(); updateXPDisplay(); } catch (e) {}
            const n = (week[DAYS[0]] || []).length;
            return `✅ Generated a week from **"${input}"** — ${n} blocks/day, mixed categories. Old XP taken back.`;
        } catch (e) {}
    }

    // 4. Fallback with smarter hints
    if (/\b(xp|level|rank|streak)\b/.test(lower)) {
        try { if (typeof openProgressPanel === "function") openProgressPanel(); } catch(e){}
        const info = typeof getLevelInfo === "function" ? getLevelInfo(data.xp || 0) : { rank: "?" };
        return `⭐ You're **${info.rank}** with **${data.xp || 0} XP**. Opened progress.`;
    }

    return (
        `🤔 Not sure I caught that. Try:\n` +
        `• "generate study week" / "build a chill week"\n` +
        `• "add Gym from 07:00 to 08:00"\n` +
        `• "delete task 2" / "clear day"\n` +
        `• "open todo" / "open progress" / "open timeline"\n` +
        `• "change theme to cyan"\n` +
        `• "help" for the full list`
    );
}


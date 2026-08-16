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
        { label: "Study 📚",    tag: "study",   window: [360,  1320] },
        { label: "Revision 📝", tag: "study",   window: [360,  1320] },
        { label: "Homework ✏️", tag: "homework", window: [840,  1320] }
    ],
    WORK: [
        { label: "Work 💻",       tag: "work",   window: [360,  1260] },
        { label: "Deep Work 🎯",  tag: "work",   window: [360,  1200] },
        { label: "Focus Block 🔒",tag: "work",   window: [480,  1260] }
    ],
    FITNESS: [
        { label: "Workout 🏋️",  tag: "fitness", window: [300,  1200] },
        { label: "Exercise 🏃",  tag: "fitness", window: [300,  1200] },
        { label: "Run 🏃",       tag: "fitness", window: [300,  1080] }
    ],
    RELAX: [
        { label: "You Time 😌",  tag: "relax",  window: [480,  1320] },
        { label: "Relax 😌",     tag: "relax",  window: [480,  1320] },
        { label: "Free Time 🎮", tag: "gaming", window: [600,  1320] }
    ],
    MORNING: [
        { label: "Morning Routine ☀️", tag: "routine", window: [240, 660] }
    ],
    EVENING: [
        { label: "Wind Down 🌙", tag: "relax",   window: [1080, 1440] },
        { label: "Relax 😌",     tag: "relax",   window: [1080, 1440] },
        { label: "Nap 😴",       tag: "rest",    window: [1140, 1380] }
    ],
    FOOD: [
        { label: "Breakfast 🍳", tag: "food", window: [300,  660]  },
        { label: "Lunch 🥗",     tag: "food", window: [660,  840]  },
        { label: "Dinner 🍽️",   tag: "food", window: [1020, 1320] },
        { label: "Snack 🍎",     tag: "food", window: [540,  1200] }
    ]
};

// ---------------------------------------------------------------------------
// SCHEDULE GENERATOR — no gaps, 8+ blocks, fills wake→sleep
// ---------------------------------------------------------------------------

function buildDay(tag, intensity, wakeMin, sleepMin, dayName, usedNames) {
    const isWknd = (dayName === "Saturday" || dayName === "Sunday");
    const blocks = [];
    let cur = wakeMin;
    const LUNCH = 12 * 60;   // 12:00
    const DINNER = 19 * 60;  // 19:00

    function pushBlock(taskName, dur) {
        const end = cur + dur;
        blocks.push({
            start: formatMinutesToTime(cur),
            end: formatMinutesToTime(end),
            task: taskName,
            completed: false
        });
        cur = end;
    }

    function fillTo(targetMin, pool) {
        // Fill time up to targetMin with blocks from pool, no gaps
        while (cur < targetMin - 20) {
            const remaining = targetMin - cur;
            const dur = remaining >= 60 ? 60 : remaining >= 30 ? 30 : remaining;
            pushBlock(pickUnused(pool), dur);
        }
        // If small gap left, extend last block to target
        if (cur < targetMin) cur = targetMin;
    }

    function pickUnused(pool) {
        // Filter by time window first, then by unused
        const inWindow = pool.filter(t => cur >= t.window[0] && cur < t.window[1]);
        const eligible = inWindow.length > 0 ? inWindow : pool;
        const unused = eligible.filter(t => !usedNames.has(t.label));
        const chosen = unused.length > 0 ? pick(unused) : pick(eligible);
        usedNames.add(chosen.label);
        return chosen.label;
    }

    // 1. Morning routine (30 min)
    pushBlock(pickUnused(TASKS.MORNING), 30);

    // 2. Breakfast (30 min)
    pushBlock("Breakfast 🍳", 30);

    // 3. Fill morning with focus blocks up to 12:00
    fillTo(LUNCH, TASKS[tag] || TASKS.WORK);

    // 4. Lunch anchored at 12:00 (45 min)
    cur = LUNCH;
    pushBlock("Lunch 🥗", 45);

    // 5. Afternoon blocks until 19:00
    const crossTag = tag === "STUDY" ? "RELAX" : tag === "WORK" ? "FITNESS" : tag === "FITNESS" ? "RELAX" : "STUDY";
    pushBlock(pickUnused(TASKS[tag] || TASKS.WORK), 90);
    pushBlock(pickUnused(TASKS[crossTag]), 45);
    if (tag !== "FITNESS") {
        pushBlock(pickUnused(TASKS.FITNESS), 45);
    } else {
        pushBlock(pickUnused(TASKS.RELAX), 45);
    }
    fillTo(DINNER, TASKS[tag] || TASKS.WORK);

    // 6. Dinner anchored at 19:00 (45 min)
    cur = DINNER;
    pushBlock("Dinner 🍽️", 45);

    // 7. Evening blocks until sleep
    pushBlock(pickUnused(TASKS.EVENING), 45);
    const remaining = sleepMin - cur;
    if (remaining >= 20) {
        pushBlock(pickUnused(TASKS.EVENING), Math.min(remaining, 60));
    }

    // 8. Sleep block — from sleepMin to wakeMin (next day), capped at 10h
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

    const filtered = blocks.filter(b => parseTimeToMinutes(b.start) <= sleepMin);

    // Merge consecutive blocks with the same task name
    const merged = [];
    for (const b of filtered) {
        const prev = merged[merged.length - 1];
        if (prev && prev.task === b.task && prev.end === b.start) {
            prev.end = b.end;
        } else {
            merged.push({ ...b });
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
    red:    { color: "#e74c3c", hover: "#c0392b", alpha: "rgba(231,76,60,0.25)" },
    blue:   { color: "#3498db", hover: "#2980b9", alpha: "rgba(52,152,219,0.25)" },
    green:  { color: "#2ecc71", hover: "#27ae60", alpha: "rgba(46,204,113,0.25)" },
    orange: { color: "#e67e22", hover: "#d35400", alpha: "rgba(230,126,34,0.25)" },
    pink:   { color: "#e84393", hover: "#c0306e", alpha: "rgba(232,67,147,0.25)" },
    purple: { color: "#6c5ce7", hover: "#5b4cc4", alpha: "rgba(108,92,231,0.25)" },
    cyan:   { color: "#00cec9", hover: "#00b894", alpha: "rgba(0,206,201,0.25)" },
    yellow: { color: "#f9ca24", hover: "#f0932b", alpha: "rgba(249,202,36,0.25)" }
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
                    `• 📊 Weekly Category Breakdown — hours per category\n` +
                    `• Preset Manager — save, apply, or delete presets\n` +
                    `• ✨ Create Preset From Scratch — build a preset day by day\n` +
                    `• 📊 Analyse My Week — check your week against a goal\n\n` +
                    `**🤖 AI button** (bottom-left, that's me!)\n` +
                    `• Type commands to generate weeks, add/delete tasks, change themes\n` +
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
                const week = generateSmartWeekFromIntent(intent);
                DAYS.forEach(day => {
                    data.schedules[day] = week[day] ? JSON.parse(JSON.stringify(week[day])) : [];
                });
                data.appliedRoutine = `AI: ${intent.substring(0, 30)}`;
                try { saveData(); } catch(e) {}
                try { renderCurrentDay(); populatePresetMenus(); } catch(e) {}
                const blockCount = week[DAYS[0]] ? week[DAYS[0]].length : 0;
                return `✅ Built a full 7-day **${intent}** schedule — ${blockCount} blocks per day, zero gaps, wake to sleep. Use "regenerate" for a fresh version or "save preset <name>" to keep it.`;
            }
        },

        // REGENERATE
        {
            id: "regenerate",
            keywords: ["regenerate","redo","again","retry","different","new version","reshuffle"],
            patterns: [/^(?:regenerate|redo|retry|again|reshuffle|new version)/i],
            handler: (match, rawInput) => {
                const lastRoutine = (data.appliedRoutine || "").replace(/^AI:\s*/, "").trim() || "work";
                const week = generateSmartWeekFromIntent(lastRoutine);
                DAYS.forEach(day => {
                    data.schedules[day] = week[day] ? JSON.parse(JSON.stringify(week[day])) : [];
                });
                data.appliedRoutine = `AI: ${lastRoutine.substring(0, 30)}`;
                try { saveData(); renderCurrentDay(); populatePresetMenus(); } catch(e) {}
                return `🔄 Regenerated a fresh **${lastRoutine}** week with different task variety. Zero gaps, 8+ blocks per day.`;
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
                const day = DAYS[data.currentDay];
                const tasks = data.schedules[day] || [];
                let count = 0;
                tasks.forEach(t => { if (t.completed) { t.completed = false; count++; } });
                try { saveData(); renderCurrentDay(); } catch(e) {}
                return count > 0
                    ? `🧹 Unchecked ${count} task(s) on **${day}**. Blocks are still there.`
                    : `Nothing was checked on **${day}** anyway.`;
            }
        },

        // CLEAR ALL DAYS
        {
            id: "clear_week",
            patterns: [/(?:clear|reset|wipe)\s+(?:week|all days|everything)/i],
            handler: () => {
                DAYS.forEach(d => { (data.schedules[d] || []).forEach(t => t.completed = false); });
                try { saveData(); renderCurrentDay(); } catch(e) {}
                return `🧹 Unchecked all tasks across the entire week.`;
            }
        },

        // WIPE DAY SCHEDULE
        {
            id: "wipe_day",
            patterns: [/(?:wipe|empty|delete all|remove all)\s+(?:tasks?|blocks?|schedule)?\s*(?:for|on|from)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday|today)?/i],
            handler: (match) => {
                let dayName = match && match[1] ? match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase() : DAYS[data.currentDay];
                if (!DAYS.includes(dayName)) dayName = DAYS[data.currentDay];
                const count = (data.schedules[dayName] || []).length;
                data.schedules[dayName] = [];
                try { saveData(); renderCurrentDay(); } catch(e) {}
                return `🗑️ Wiped all ${count} block(s) from **${dayName}**.`;
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
                        try { setAccentColor(vals.color, vals.hover, vals.alpha); } catch(e){}
                        return `🎨 Theme changed to **${name}**!`;
                    }
                }
                return `❌ Unknown color. Try: ${Object.keys(COLOR_MAP).join(", ")}`;
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
                if (next) reply += `⏭️ **Next:** ${next.task} at ${next.start} (in ${parseTimeToMinutes(next.start) - now}m)`;
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


        // HELP
        {
            id: "help",
            keywords: ["help","what can you do","commands","options","what do you do"],
            patterns: [/(?:help|what can you do|commands?|options?)/i],
            handler: () =>
                `Here's what I can do:\n\n` +
                `🗓️ **Generate:** "generate study week" / "build me a fitness week"\n` +
                `🔄 **Regenerate:** "regenerate" / "redo"\n` +
                `➕ **Add task:** "add Gym from 07:00 to 08:00"\n` +
                `➕ **Add to day:** "add Gym on Monday from 07:00 to 08:00"\n` +
                `🗑️ **Delete task:** "delete task 3" / "delete Gym"\n` +
                `🧹 **Clear day:** "clear day" (unchecks all)\n` +
                `🧹 **Clear week:** "clear week" (unchecks all days)\n` +
                `💣 **Wipe day:** "wipe Monday" (removes all blocks)\n` +
                `💾 **Save preset:** "save preset Finals Week"\n` +
                `▶️ **Apply preset:** "apply Study Week" (full week)\n` +
                `📅 **Apply to day:** "apply Study Week for Monday"\n` +
                `📋 **List presets:** "list presets"\n` +
                `🗑️ **Delete preset:** "delete preset Finals Week"\n` +
                `🎨 **Theme:** "change theme to red"\n` +
                `📅 **Schedule:** "show my schedule" / "show schedule for Monday"\n` +
                `⏭️ **Next task:** "what's next"\n` +
                `📊 **Progress:** "progress" / "how am I doing?"\n` +
                `🔔 **Sound:** "mute" / "unmute"`
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

    // 1. Pattern matching — most specific first
    for (const intent of AI_DATABASE.intents) {
        if (!intent.patterns) continue;
        for (const pattern of intent.patterns) {
            const m = input.match(pattern);
            if (m) {
                try {
                    const result = intent.handler(m, input);
                    if (result !== null && result !== undefined) {
                        appendMessage(result, "bot-msg");
                        return;
                    }
                } catch(e) { console.error(intent.id, e); }
            }
        }
    }

    // 2. Keyword matching
    for (const intent of AI_DATABASE.intents) {
        if (!intent.keywords) continue;
        const hit = intent.keywords.some(kw => lower.includes(kw));
        if (hit) {
            try {
                const result = intent.handler(null, input);
                if (result !== null && result !== undefined) {
                    appendMessage(result, "bot-msg");
                    return;
                }
            } catch(e) { console.error(intent.id, e); }
        }
    }

    // 3. Fuzzy fallback — try to detect generate intent from loose phrasing
    if (/week|schedule|routine|plan|day/i.test(lower)) {
        try {
            const week = generateSmartWeekFromIntent(input);
            DAYS.forEach(day => { data.schedules[day] = JSON.parse(JSON.stringify(week[day] || [])); });
            data.appliedRoutine = `AI: ${input.substring(0, 30)}`;
            try { saveData(); renderCurrentDay(); populatePresetMenus(); } catch(e) {}
            appendMessage(`✅ Generated a week based on: **"${input}"**. ${week[DAYS[0]].length} blocks per day, no gaps.`, "bot-msg");
            return;
        } catch(e) {}
    }

    // 4. Final fallback
    appendMessage(
        `🤔 I didn't get that. Try:\n` +
        `• "generate study week"\n` +
        `• "apply Study Week for Monday"\n` +
        `• "add Gym from 07:00 to 08:00"\n` +
        `• "delete task 2"\n` +
        `• "change theme to blue"\n` +
        `• "help" for the full list`,
        "bot-msg"
    );
}


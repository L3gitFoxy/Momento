

let _seed = Math.floor(Math.random() * 1e9);
function seededRand() {
    _seed ^= _seed << 13;
    _seed ^= _seed >> 17;
    _seed ^= _seed << 5;
    return ((_seed >>> 0) / 4294967296);
}
function reseed(s) { _seed = s || Math.floor(Math.random() * 1e9); }
function pick(arr) { return arr[Math.floor(seededRand() * arr.length)]; }


let NLP_CORPUS = null;
let _nlpLoading = null;

function loadNlpCorpus() {
    if (NLP_CORPUS) return Promise.resolve(NLP_CORPUS);
    if (_nlpLoading) return _nlpLoading;
    _nlpLoading = fetch("./chatbot-nlp.json", { cache: "force-cache" })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
            NLP_CORPUS = j;
            return j;
        })
        .catch(() => {
            NLP_CORPUS = null;
            return null;
        });
    return _nlpLoading;
}
try { loadNlpCorpus(); } catch (e) {}

function fillTemplate(tpl, banks) {
    if (!tpl || !banks) return tpl;
    return String(tpl).replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => {
        const bankKey = {
            greet_opener: "greet_openers",
            greet_body: "greet_bodies",
            thanks_reply: "thanks_replies",
            identity_reply: "identity_replies",
            motivation: "motivation",
            weather_pivot: "weather_pivot",
            joke: "jokes",
            momento_hook: "momento_hooks",
            activity: "activities",
            activity_line: "activities",
            feeling: "positive_feelings"
        }[key] || key;
        let pool = banks[bankKey] || banks[key];
        if (key === "feeling" && seededRand() < 0.18) {
            pool = banks.low_feelings || pool;
        }
        if (Array.isArray(pool) && pool.length) {
            let s = pick(pool);
            if (key === "activity" || key === "activity_line") {
                s = (key === "activity_line") ? ("Mostly " + s + ".") : s;
            }
            return s;
        }
        return "";
    }).replace(/\s+/g, " ").trim();
}

function matchNlpTopic(lower) {
    if (!NLP_CORPUS || !NLP_CORPUS.topics) return null;
    let best = null;
    let bestScore = 0;
    for (const [id, topic] of Object.entries(NLP_CORPUS.topics)) {
        const triggers = topic.triggers || [];
        let score = 0;
        for (const tr of triggers) {
            if (!tr) continue;
            if (lower === tr) score += 12;
            else if (lower.includes(tr)) score += Math.min(8, 2 + tr.length / 4);
        }
        if (score > bestScore) {
            bestScore = score;
            best = { id, topic, score };
        }
    }
    if (best && best.score >= 4) return best;
    return null;
}

function generateConversationalReply(input, lower) {
    if (!NLP_CORPUS) return null;
    const banks = NLP_CORPUS.banks || {};
    const hit = matchNlpTopic(lower);
    if (hit && hit.topic.templates && hit.topic.templates.length) {
        const tpl = pick(hit.topic.templates);
        let out = fillTemplate(tpl, banks);
        if (hit.id === "how_are_you" && NLP_CORPUS.prebuilt && NLP_CORPUS.prebuilt.how_are_you_lines && seededRand() < 0.45) {
            out = pick(NLP_CORPUS.prebuilt.how_are_you_lines);
        }
        if (hit.id === "greeting" && NLP_CORPUS.prebuilt && NLP_CORPUS.prebuilt.greeting_lines && seededRand() < 0.4) {
            out = pick(NLP_CORPUS.prebuilt.greeting_lines);
        }
        return out;
    }

    // soft keyword chat without hard intent
    if (/\b(how are you|how's it going|hows it going|hru)\b/.test(lower)) {
        const lines = (NLP_CORPUS.prebuilt && NLP_CORPUS.prebuilt.how_are_you_lines) || banks.positive_feelings || [];
        if (lines.length) return pick(lines);
    }
    if (/^(hi|hello|hey|yo|sup)\b/.test(lower)) {
        const lines = (NLP_CORPUS.prebuilt && NLP_CORPUS.prebuilt.greeting_lines) || [];
        if (lines.length) return pick(lines);
    }

    // generic small-talk composition
    if (/\b(i feel|i'm|im |feeling|today was|rough day|good day)\b/.test(lower)) {
        const hook = banks.momento_hooks && banks.momento_hooks.length ? pick(banks.momento_hooks) : "";
        if (/\b(bad|rough|hard|tired|sad|awful|terrible)\b/.test(lower)) {
            return pick([
                "That sounds heavy. Shrink the plan to one kind block and let the rest wait. " + hook,
                "Rough days still count if you finish one small thing. " + hook
            ]);
        }
        return pick([
            "Nice , lock that energy into a block before it drifts. " + hook,
            "Love that. Want help shaping the rest of the day in Momento? "
        ]);
    }

    return null;
}


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

    {
        const m = pickLabel(TASKS.MORNING);
        pushBlock(m.label, short, m.tag);
    }

    pushBlock("Breakfast 🍳", short, "food");

    if (cur < LUNCH - 20) {
        const p = pickLabel(primary);
        pushBlock(p.label, Math.min(big, LUNCH - cur), p.tag);
    }
    if (cur < LUNCH - 25) {
        if (tag === "FITNESS") {
            const s = pickLabel(TASKS.RELAX);
            pushBlock(s.label, Math.min(med, LUNCH - cur), s.tag);
        } else {
            pushBlock("Take a Stroll Outside 🚶", Math.min(med, LUNCH - cur), "fitness");
        }
    }
    if (cur < LUNCH) cur = LUNCH;

    pushBlock("Lunch 🥗", 45, "food");

    {
        const p = pickLabel(primary);
        pushBlock(p.label, isWknd ? 90 : big, p.tag);
    }

    if (tag !== "FITNESS" && cur >= 13 * 60 && cur <= 16 * 60 && seededRand() < 0.4) {
        pushBlock("Powernap 😴", 30, "rest");
    }

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

    if (cur < DINNER - 40 && cur < 18 * 60) {
        const p = pickLabel(primary);
        pushBlock(p.label, Math.min(75, DINNER - cur), p.tag);
    }
    if (cur < DINNER) cur = DINNER;

    pushBlock("Dinner 🍽️", 45, "food");

    if (cur < sleepMin - 20) {
        if (tag === "STUDY") {
            pushBlock("Read a Book 📖", Math.min(45, sleepMin - cur), "evening");
        } else {
            const e = pickLabel(TASKS.EVENING);
            pushBlock(e.label, Math.min(50, sleepMin - cur), e.tag);
        }
    }

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

    const scores = { exam: 0, work: 0, fitness: 0, relax: 0 };
    Object.entries(INTENT_DICT).forEach(([key, cfg]) => {
        cfg.keywords.forEach(kw => {
            if (prompt.includes(kw)) scores[key]++;
        });
    });

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
    red:     { id: "coral" },
    blue:    { id: "ocean" },
    orange:  { id: "amber" },
    pink:    { id: "rose" },
    yellow:  { id: "gold" }
};

const AI_DATABASE = {
    intents: [

        {
            id: "greeting",
            keywords: ["hello","hi","hey","sup","yo","greetings","howdy","hiya","good morning","good afternoon","good evening","what's up","whats up"],
            handler: () => {
                const gen = generateConversationalReply("hello", "hello");
                if (gen) return gen;
                return pick([
                    "Hey! Tell me what kind of week you want and I'll build it , study, work, fitness, or chill.",
                    "Hi! I can generate a full week, add/delete tasks, change themes, or apply presets. What do you need?",
                    "Hey there! Ask me to generate a week, add a task, or change your theme.",
                    "Yo! Ready to build your schedule. What's the vibe this week?"
                ]);
            }
        },
        {
            id: "how_are_you",
            keywords: ["how are you","how's it going","hows it going","how are things","you good","hru","how r u"],
            patterns: [/how are you/i, /how'?s it going/i, /how are things/i, /\bhru\b/i],
            handler: () => {
                const gen = generateConversationalReply("how are you", "how are you");
                if (gen) return gen;
                return "I'm doing great , helping people plan days and level up in Momento. What are you up to?";
            }
        },
        {
            id: "what_up",
            keywords: ["what are you doing","what are you up to","what do you do","busy?"],
            patterns: [/what are you (doing|up to)/i, /what do you do/i],
            handler: () => {
                const gen = generateConversationalReply("what are you up to", "what are you up to");
                return gen || "Mostly helping with Momento schedules, XP, crates, and themes. Want a week built?";
            }
        },
        {
            id: "thanks",
            keywords: ["thanks","thank you","thx","ty","appreciate"],
            patterns: [/\b(thanks|thank you|thx|ty)\b/i],
            handler: () => {
                const gen = generateConversationalReply("thanks", "thanks");
                return gen || "Anytime , that's what I'm here for.";
            }
        },
        {
            id: "identity",
            keywords: ["who are you","what are you","are you ai","are you a bot","your name"],
            patterns: [/who are you/i, /what are you/i, /are you (an? )?ai/i, /are you a bot/i],
            handler: () => {
                const gen = generateConversationalReply("who are you", "who are you");
                return gen || "I'm Momento's helper , schedules, ranks, crates, themes, to-dos, calendar. I can small-talk too.";
            }
        },
        {
            id: "motivation_chat",
            keywords: ["motivate me","motivation","i'm stuck","im stuck","procrastinating","encourage me","burnout"],
            patterns: [/motivate/i, /i'?m stuck/i, /procrastinat/i, /burnout/i],
            handler: () => {
                const gen = generateConversationalReply("motivate me", "motivate me");
                return gen || "Show up for the next block. That's enough. Want me to shape a lighter day in Momento?";
            }
        },
        {
            id: "joke",
            keywords: ["joke","make me laugh","funny","tell me a joke"],
            patterns: [/\bjoke\b/i, /make me laugh/i],
            handler: () => {
                const gen = generateConversationalReply("joke", "joke");
                return gen || "I tried to procrastinate, but my calendar blocked it. Want a real plan next?";
            }
        },

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
                const rawMsg = args.find(a => typeof a === 'string') || args[0]?.text || args[0]?.message || "";
                const lowerMsg = String(rawMsg).toLowerCase();

                if (lowerMsg.includes("sound") || lowerMsg.includes("notification") || lowerMsg.includes("chime") || lowerMsg.includes("alert") || lowerMsg.includes("mute") || lowerMsg.includes("audio")) {
                    return `**🔔 Sounds & Notifications**\n` +
                    `• **Toggle:** Open the **◀ Tools sidebar** (hover on the right edge of the screen) to enable or disable sound\n` +
                    `• **How it works:** When enabled, a chime will automatically play every time a new time block starts!`;
                }

                if (lowerMsg.includes("tool") || lowerMsg.includes("toolbar") || lowerMsg.includes("theme") || lowerMsg.includes("preset") || lowerMsg.includes("colour") || lowerMsg.includes("color") || lowerMsg.includes("analyse") || lowerMsg.includes("sidebar") || lowerMsg.includes("menu")) {
                    return `**◀ Tools sidebar** (right edge of screen)\n` +
                    `• Hover or click the Tools tab to open\n` +
                    `• 🎨 Accent Theme, pick your colour\n` +
                    `• 🔔 Sound toggle, enable/disable chimes\n` +
                    `• 📊 Weekly Category Breakdown, hours per category\n` +
                    `• Preset Manager, save, apply, or delete presets\n` +
                    `• ✨ Create Preset From Scratch, build a preset day by day\n` +
                    `• 📊 Analyse My Week, check your week against a goal`;
                }

                if (lowerMsg.includes("task") || lowerMsg.includes("block") || lowerMsg.includes("reorder") || lowerMsg.includes("drag") || lowerMsg.includes("delete") || lowerMsg.includes("add")) {
                    return `**📋 Task list & Blocks** (main area)\n` +
                    `• Each row = one time block: drag ⣿, checkbox, start, end, task name, 🗑️ delete\n` +
                    `• Tick the checkbox to mark done, it strikes through\n` +
                    `• Drag ⣿ to reorder blocks\n` +
                    `• Cyan glow = currently active block\n` +
                    `• Click **+ Add Time Block** to add a blank row`;
                }

                if (lowerMsg.includes("day") || lowerMsg.includes("copy") || lowerMsg.includes("prev") || lowerMsg.includes("next") || lowerMsg.includes("navigate")) {
                    return `**📅 Days & Navigation**\n` +
                    `• **Day Tabs (Mon,Sun):** Click any day to jump to it, active day glows\n` +
                    `• **◀ Prev / Next ▶:** Navigate days one at a time\n` +
                    `• **Copy To...:** Duplicates the current day's schedule to another day`;
                }

                if (lowerMsg.includes("save") || lowerMsg.includes("sort")) {
                    return `**💾 Save and Sort**\n` +
                    `• Saves your progress and auto-sorts your day by start time\n` +
                    `• Shortcut: Ctrl/Cmd + S`;
                }

                if (lowerMsg.includes("note") || lowerMsg.includes("focus")) {
                    return `**📝 Notes / Focus box**\n` +
                    `• Free-text area at the bottom of the screen for daily notes and focus goals`;
                }

                if (lowerMsg.includes("clock") || lowerMsg.includes("now") || lowerMsg.includes("next") || lowerMsg.includes("top")) {
                     return `**🔝 Top Bar & ⚡ Now / Next chips**\n` +
                    `• Live clock is on the top right\n` +
                    `• Chips below the top bar show your active block and what's coming up next\n` +
                    `• Plays a chime when a new block starts (if sound is on)`;
                }

                if (lowerMsg.includes("ai") || lowerMsg.includes("bot") || lowerMsg.includes("command")) {
                    return `**🤖 AI button** (bottom-left, that's me!)\n` +
                    `• Type commands to generate weeks, add/delete tasks, change themes\n` +
                    `• Type **"help"** for the full command list`;
                }

                return `📍 Here's a full tour of Momento:\n\n` +
                    `**🔝 Top Bar** (very top)\n` +
                    `• App title on the left, today's date next to it\n` +
                    `• Live clock on the right, updates every second\n\n` +
                    `**⚡ Now / Next chips** (below the top bar)\n` +
                    `• Shows your active block and what's coming up next\n` +
                    `• Plays a chime when a new block starts (if sound is on)\n\n` +
                    `**📅 Day Tabs** (Mon,Sun strip)\n` +
                    `• Click any day to jump to it, active day glows in your accent colour\n\n` +
                    `**◀ Prev / Next ▶ + Copy To...**\n` +
                    `• Navigate days one at a time\n` +
                    `• Copy To... duplicates the current day to another day\n\n` +
                    `**📋 Task list** (main area)\n` +
                    `• Each row = one time block: drag ⣿, checkbox, start, end, task name, 🗑️ delete\n` +
                    `• Tick the checkbox to mark done, it strikes through\n` +
                    `• Drag ⣿ to reorder blocks\n` +
                    `• Cyan glow = currently active block\n\n` +
                    `**+ Add Time Block**\n` +
                    `• Adds a blank block, fill in times and name\n\n` +
                    `**💾 Save and Sort**\n` +
                    `• Saves and auto-sorts by start time\n` +
                    `• Shortcut: Ctrl/Cmd + S\n\n` +
                    `**📝 Notes / Focus box**\n` +
                    `• Free-text area for daily notes and focus goals\n\n` +
                    `**◀ Tools sidebar** (right edge of screen)\n` +
                    `• Hover or click the Tools tab to open\n` +
                    `• 🎨 App Customiser, themes, chimes, cosmetics, sound toggles\n` +
                    `• 🔔 Transition alerts toggle\n` +
                    `• 📊 Weekly Category Breakdown, hours per category\n` +
                    `• Preset Manager, save, apply, or delete presets\n` +
                    `• ✨ Create Preset From Scratch, build a preset day by day\n` +
                    `• 📊 Analyse My Week, check your week against a goal\n\n` +
                    `**📅 Calendar button** (top bar)\n` +
                    `• Full-year calendar for meetings & deadlines\n` +
                    `• ! badge / shiver when an event is soon\n\n` +
                    `**🤖 AI button** (bottom-left, that's me!)\n` +
                    `• Type commands to generate weeks, add/delete tasks, open calendar/customiser\n` +
                    `• Type **"help"** for the full command list`;
            }
        },

        {
            id: "generate_week",
            patterns: [
                /(?:generate|create|build|make|give me|gimme|set up|setup)\s+(?:a|an|my)?\s*(.+?)\s*(?:schedule|routine|plan)?$/i,
                /(?:i need|i want|plan)\s+(?:a|an)?\s*(.+?)\s*(?:schedule|routine)/i
            ],
            handler: (match, rawInput) => {
                const intent = match && match[1] ? match[1].trim() : rawInput;
                if (typeof clearWeekSchedules === "function") {
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
                return `✅ Built a full 7-day **${intent}** schedule, ${blockCount} blocks/day. Previous week's XP has been reset.`;
            }
        },

        {
            id: "regenerate",
            keywords: ["regenerate","redo","again","retry","different","new version","reshuffle"],
            patterns: [/^(?:regenerate|redo|retry|again|reshuffle|new version)/i],
            handler: (match, rawInput) => {
                if (typeof isFeatureUnlocked === "function" && !isFeatureUnlocked("ai_regenerate")) {
                    const info = typeof getLevelInfo === "function" ? getLevelInfo(data.xp || 0) : { rank: "?" };
                    return `🔒 **Regenerate** unlocks at **Starter V**. You're **${info.rank}**.`;
                }
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
                return `🔄 Regenerated a fresh **${lastRoutine}** week. Previous XP has been reset.`;
            }
        },

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
                if (typeof clawbackDayXP === "function") {
                    const lost = clawbackDayXP(day);
                    count = tasks.filter(t => !t.completed).length;
                    try { saveData(); renderCurrentDay(); updateXPDisplay(); } catch(e) {}
                    return lost > 0
                        ? `🧹 Unchecked tasks on **${day}**. **−${lost} XP** removed.`
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
                    DAYS.forEach(d => {
                        if (typeof clawbackDayXP === "function") lost += clawbackDayXP(d);
                        else (data.schedules[d] || []).forEach(t => { t.completed = false; t.xpAwarded = false; });
                    });
                } else {
                    DAYS.forEach(d => { (data.schedules[d] || []).forEach(t => { t.completed = false; t.xpAwarded = false; }); });
                }
                try { saveData(); renderCurrentDay(); updateXPDisplay(); } catch(e) {}
                return lost > 0
                    ? `🧹 Unchecked the whole week. **−${lost} XP** removed.`
                    : `🧹 Unchecked all tasks across the week.`;
            }
        },

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
                    ? `🗑️ Wiped ${count} block(s) from **${dayName}**. **−${lost} XP** removed.`
                    : `🗑️ Wiped all ${count} block(s) from **${dayName}**.`;
            }
        },

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
                    tasks.map((t, i) => `${i + 1}. ${t.start},${t.end}: ${t.task || "Untitled"}`).join("\n");
            }
        },

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
                if (active) reply += `⚡ **Now:** ${active.task} (${active.start},${active.end})\n`;
                if (next) {
                    const mins = parseTimeToMinutes(next.start) - now;
                    const dur = typeof formatDuration === "function" ? formatDuration(mins) : mins + "m";
                    reply += `⏭️ **Next:** ${next.task} at ${next.start} (in ${dur})`;
                }
                return reply || `☕ No more tasks left for today!`;
            }
        },

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

        {
            id: "sound",
            keywords: ["sound","notification","chime","mute","unmute","alert","notifications"],
            handler: () => {
                try { toggleNotifications(); } catch(e) {}
                const status = data.notificationsEnabled ? "ON 🔔" : "OFF 🔕";
                return `Sound alerts are now **${status}**.`;
            }
        },

        {
            id: "open_todo",
            keywords: ["todo", "to-do", "to do", "todos", "open todo", "show todo", "todo list"],
            patterns: [/(?:open|show|view)\s+(?:my\s+)?(?:todo|to-?do)/i],
            handler: () => {
                try { toggleTodoDrawer(); } catch(e) {}
                return `📋 Opened your **Persistent To-Dos**. They stay until you complete them (+80 XP each, exclusive of multipliers).`;
            }
        },

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
                "🎨 **Theme:** \"change theme to cyan\" / \"open customiser\" (themes unlock as you rank)\n" +
                "📋 **To-Dos:** \"open todo list\", persistent tasks with optional due dates\n" +
                "📅 **Calendar:** \"open calendar\", full-year events, meetings, deadlines\n" +
                "📅 **Timeline:** \"open timeline\" 🔒 Beginner 3+\n" +
                "📊 **Analyser:** \"open analyser\" 🔒 Amateur 3+\n" +
                "⭐ **Progress:** \"open progress\" / \"show rewards\"\n" +
                "✨ **Customiser:** \"open customiser\", themes, chimes, cosmetics, sound toggles\n" +
                "📅 **Schedule:** \"show my schedule\" / \"what's next\"\n" +
                "📦 **Crates / Boosters:** \"open crates\" / \"open boosters\"\n" +
                "💬 **Chat:** how are you, jokes, motivation , I steer back to Momento\n" +
                "🔔 **Sound:** \"mute\" / \"unmute\""
        },
        {
            id: "open_crates",
            keywords: ["open crates","crates","crate page"],
            patterns: [/(?:open|show)\s+crates?/i],
            handler: () => {
                try { if (typeof openCratesPage === "function") openCratesPage(); } catch(e){}
                return "📦 Opened **Crates**. Keys drop from finishing blocks and to-dos.";
            }
        },
        {
            id: "open_boosters",
            keywords: ["open boosters","xp boosters","boosters"],
            patterns: [/(?:open|show)\s+boosters?/i, /xp boosters?/i],
            handler: () => {
                try { if (typeof openBoostersPage === "function") openBoostersPage(); } catch(e){}
                return "⚡ Opened **XP Boosters**.";
            }
        },
        {
            id: "open_calendar",
            keywords: ["open calendar", "calendar", "full calendar", "show calendar", "events"],
            patterns: [/(?:open|show|view)?\s*calendar/i, /full[- ]?year calendar/i],
            handler: () => {
                try { if (typeof openCalendarPage === "function") openCalendarPage(); } catch(e){}
                return "📅 Opened the **full calendar**. Click a day to add meetings or events, they're saved with your account.";
            }
        },
        {
            id: "open_customiser",
            keywords: ["open customiser", "customiser", "customizer", "app customiser", "themes panel", "cosmetics"],
            patterns: [/(?:open|show)?\s*(?:app\s*)?customi[sz]er/i, /cosmetics/i],
            handler: () => {
                try { if (typeof openAppCustomiser === "function") openAppCustomiser(); } catch(e){}
                return "🎨 Opened **App Customiser**, themes, completion chimes, sound toggles, and cosmetics.";
            }
        }

    ]
};

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
    let div = null;
    if (container) {
        div = document.createElement("div");
        div.className = `chat-msg ${className}`;
        div.innerHTML = String(msg).replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }
    try {
        if (typeof appendPreviewChat === "function") {
            const who = /user/.test(String(className)) ? "user" : "bot";
            if (!/thinking/.test(String(className))) appendPreviewChat(msg, who);
        }
    } catch (e) {}
    return div;
}


/* ---- Hybrid AI week planning session ---- */
let _planSession = null; // { history: [], fixedNotes: string }

function aiApiBase() {
    try {
        return (localStorage.getItem("MOMENTO_MUSIC_API") || "http://127.0.0.1:8787").replace(/\/$/, "");
    } catch (e) {
        return "http://127.0.0.1:8787";
    }
}

function needsRealAiForSchedule(text) {
    const t = String(text || "").toLowerCase();
    if (!t) return false;
    // Fixed / messy real-life constraints
    if (/\b(class|classes|college|university|uni|lecture|lectures|lab|seminar|school|timetable|roster|shift|shifts|work from|wfh|office hours|commute|internship|placement)\b/.test(t)) return true;
    if (/\b(every|each)\s+(mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday)/.test(t)) return true;
    if (/\b(mon|tue|wed|thu|fri|monday|tuesday|wednesday|thursday|friday)\b.*\b(\d{1,2}\s*([:.]|\s)?\d{0,2}\s*(am|pm)?|\d{1,2}\s*(am|pm))\b/.test(t)) return true;
    if (/\b(\d{1,2}[:.]\d{2})\s*-\s*(\d{1,2}[:.]\d{2})\b/.test(t) && /\b(class|work|lab|lecture|shift|meeting)\b/.test(t)) return true;
    if (/\b(fixed|always busy|can'?t move|must attend)\b/.test(t)) return true;
    return false;
}

function userSaidNoMore(text) {
    const t = String(text || "").toLowerCase().trim();
    if (!t) return false;
    if (/^(no|nope|nah|nothing|none|done|finish|build|go ahead|that'?s all|thats all|all good|i'?m good|im good)\b/.test(t)) return true;
    if (/\b(nothing else|no more|that'?s it|thats it|all set|ready to build|build (it|the week)|finali[sz]e)\b/.test(t)) return true;
    if (/^(no[,.]?\s+)?(nothing|nope)(\s+else)?[.!]?$/.test(t)) return true;
    return false;
}

function wantsWeekBuild(text) {
    const t = String(text || "").toLowerCase();
    return /\b(generate|build|make|create|plan|set up|setup)\b/.test(t) &&
        /\b(week|schedule|routine|timetable|plan)\b/.test(t);
}


function getPersonalizationAnswers() {
    try {
        if (typeof data !== "undefined" && data.personalization && data.personalization.answers) {
            return data.personalization.answers;
        }
    } catch (e) {}
    return {};
}

function fillWeekAroundFixed(fixedWeek, notes) {
    const dayNames = typeof DAYS !== "undefined" ? DAYS : ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    const prefs = getPersonalizationAnswers();
    const notesL = String(notes || "").toLowerCase();
    const pad = (n) => String(n).padStart(2, "0");
    const toHM = (h, m) => pad(((h % 24) + 24) % 24) + ":" + pad(((m % 60) + 60) % 60);
    const toM = (t) => {
        const p = String(t || "0:0").split(":");
        return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
    };
    const fromM = (m) => {
        const x = ((Math.round(m) % 1440) + 1440) % 1440;
        return toHM(Math.floor(x / 60), x % 60);
    };

    let wake = "07:00";
    if (prefs.wake === "early") wake = "06:00";
    else if (prefs.wake === "normal") wake = "07:00";
    else if (prefs.wake === "late") wake = "08:30";
    let sleep = "22:30";
    if (prefs.sleep === "early") sleep = "21:30";
    else if (prefs.sleep === "normal") sleep = "22:30";
    else if (prefs.sleep === "late") sleep = "23:30";

    let base = {};
    dayNames.forEach((d) => { base[d] = []; });
    if (fixedWeek && typeof fixedWeek === "object") {
        const norm = typeof normalizeWeekDays === "function" ? normalizeWeekDays(fixedWeek) : fixedWeek;
        dayNames.forEach((d) => {
            base[d] = (norm[d] || []).map((b) => ({
                task: String(b.task || "Block"),
                start: String(b.start || "09:00").slice(0, 5),
                end: String(b.end || "10:00").slice(0, 5)
            }));
        });
    }
    // Notes-based fixed overlay (school etc.) — only add if missing
    if (notes && typeof buildWeekFromNotes === "function") {
        try {
            const fromNotes = buildWeekFromNotes(notes);
            dayNames.forEach((d) => {
                (fromNotes[d] || []).forEach((f) => {
                    if (!/school|football|soccer|class|lecture|lab|work|shift|college/i.test(f.task || "")) return;
                    const overlap = (base[d] || []).some((b) => rangesOverlap(b.start, b.end, f.start, f.end));
                    const sameName = (base[d] || []).some((b) => String(b.task).toLowerCase() === String(f.task).toLowerCase());
                    if (!overlap && !sameName) base[d].push({ task: f.task, start: f.start, end: f.end });
                });
            });
        } catch (e) {}
    }

    const intensity = prefs.intensity || "balanced";
    const studyStyle = prefs.study_style || "mixed";
    const likesGames = prefs.games === "often" || prefs.games === "sometimes";
    const likesNaps = prefs.naps === "yes" || prefs.naps === "sometimes";
    const likesExercise = prefs.exercise === "often" || prefs.exercise === "sometimes";
    const sideProjects = prefs.side === "yes" || prefs.side === "sometimes";
    const role = prefs.role || (/school|college|class/.test(notesL) ? "student" : "other");
    const favGame = prefs.favorite_games ? String(prefs.favorite_games).slice(0, 24) : "";
    const sportName = prefs.favorite_sports ? String(prefs.favorite_sports).slice(0, 24) : "";

    function dedupeDay(blocks) {
        const sorted = (blocks || []).slice().sort((a, b) => toM(a.start) - toM(b.start));
        const out = [];
        sorted.forEach((b) => {
            const s = toM(b.start), e = toM(b.end);
            if (e <= s) return;
            // merge with previous if same task and touching/overlapping
            if (out.length) {
                const prev = out[out.length - 1];
                if (prev.task === b.task && s <= toM(prev.end) + 10) {
                    prev.end = fromM(Math.max(toM(prev.end), e));
                    return;
                }
            }
            // skip if overlaps any existing (prefer earlier / fixed-looking)
            if (out.some((x) => rangesOverlap(x.start, x.end, b.start, fromM(e)))) return;
            out.push({ task: b.task, start: fromM(s), end: fromM(e), isSleep: !!b.isSleep });
        });
        return out;
    }

    function fillDay(day, fixedBlocks) {
        const isWeekend = day === "Saturday" || day === "Sunday";
        let dayWake = toM(wake);
        let daySleep = toM(sleep);
        if (day === "Sunday" && prefs.weekends === "yes") dayWake = Math.min(dayWake + 60, toM("10:00"));

        // Start with fixed only (no wake/sleep yet)
        let fixed = (fixedBlocks || [])
            .filter((b) => !/wake|get ready|sleep/i.test(b.task || ""))
            .map((b) => ({ task: b.task, start: toM(b.start), end: toM(b.end) }))
            .filter((b) => b.end > b.start)
            .sort((a, b) => a.start - b.start);

        // Merge overlapping fixed with same/different names — keep first name
        const merged = [];
        fixed.forEach((b) => {
            if (!merged.length || b.start >= merged[merged.length - 1].end) {
                merged.push({ ...b });
            } else {
                merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, b.end);
            }
        });

        const result = [];
        result.push({ task: "Wake / Get Ready", start: fromM(dayWake), end: fromM(dayWake + 30) });
        merged.forEach((b) => {
            const s = Math.max(b.start, dayWake + 30);
            const e = Math.min(b.end, daySleep);
            if (e > s + 20) result.push({ task: b.task, start: fromM(s), end: fromM(e) });
        });
        result.push({ task: "Sleep", start: fromM(daySleep), end: "23:59", isSleep: true });

        // Gaps
        const occupied = result
            .map((b) => ({ task: b.task, start: toM(b.start), end: toM(b.end) }))
            .sort((a, b) => a.start - b.start);

        const gaps = [];
        for (let i = 0; i < occupied.length - 1; i++) {
            const gs = occupied[i].end;
            const ge = occupied[i + 1].start;
            if (ge - gs >= 35) gaps.push({ start: gs, end: ge, after: occupied[i].task, before: occupied[i + 1].task });
        }

        gaps.forEach((gap) => {
            let cur = gap.start;
            const end = gap.end;
            const placed = [];

            function place(task, s, e) {
                if (e - s < 30) return false;
                if (s < cur) s = cur;
                if (e > end) e = end;
                if (e - s < 30) return false;
                // no overlap with already placed in this gap
                if (placed.some((p) => s < p.e && e > p.s)) return false;
                result.push({ task, start: fromM(s), end: fromM(e) });
                placed.push({ s, e });
                cur = Math.max(cur, e + 5);
                return true;
            }

            // Meals once per day max
            const hasLunch = result.some((b) => /lunch/i.test(b.task));
            const hasDinner = result.some((b) => /dinner/i.test(b.task));
            if (!hasLunch && gap.start < toM("13:30") && gap.end > toM("11:45")) {
                const ls = Math.max(gap.start, toM("12:00"));
                place("Lunch", ls, Math.min(gap.end, ls + 40));
            }
            if (!hasDinner && gap.start < toM("20:30") && gap.end > toM("18:30")) {
                const ds = Math.max(cur, toM("19:00"));
                place("Dinner", ds, Math.min(gap.end, ds + 40));
            }

            // One meaningful block per gap (not a spam of Study)
            let left = end - cur;
            if (left < 35) return;

            let task = "Leisure";
            let dur = Math.min(60, left - 5);

            if (/school|class|college/i.test(gap.after) && left >= 45) {
                task = "Homework";
                dur = Math.min(studyStyle === "deep" ? 100 : 75, left - 5);
            } else if (/football|sport|gym/i.test(gap.before) && left >= 35) {
                task = "Travel / Snack";
                dur = Math.min(40, left - 5);
            } else if (cur < toM("12:00")) {
                task = (role === "student" || role === "both")
                    ? (studyStyle === "deep" ? "Deep Study" : "Study")
                    : (role === "work" ? "Focus Work" : "Morning Block");
                dur = Math.min(studyStyle === "deep" ? 110 : 75, left - 5);
            } else if (cur < toM("17:00")) {
                if (likesNaps && !result.some((b) => /nap/i.test(b.task)) && cur >= toM("13:00") && cur <= toM("15:30")) {
                    task = "Nap";
                    dur = Math.min(40, left - 5);
                } else if (role === "student" || role === "both") {
                    task = "Homework";
                    dur = Math.min(80, left - 5);
                } else {
                    task = "Focus Work";
                    dur = Math.min(75, left - 5);
                }
            } else {
                if (likesExercise && !result.some((b) => /football|exercise|gym|sport/i.test(b.task))) {
                    task = sportName || "Exercise";
                    dur = Math.min(50, left - 5);
                } else if (sideProjects) {
                    task = prefs.side_detail ? String(prefs.side_detail).slice(0, 24) : "Side Project";
                    dur = Math.min(70, left - 5);
                } else if (likesGames) {
                    task = favGame ? ("Games: " + favGame) : "Games";
                    dur = Math.min(55, left - 5);
                } else if (isWeekend && prefs.weekends === "yes") {
                    task = "Free Time";
                    dur = Math.min(intensity === "light" ? left - 5 : 70, left - 5);
                } else {
                    task = intensity === "packed" ? "Extra Focus" : "Leisure";
                    dur = Math.min(50, left - 5);
                }
            }

            if (intensity === "light" && left > dur + 40) {
                place(task, cur, cur + dur);
                if (end - cur >= 35) place("Free Time", cur, end);
            } else {
                place(task, cur, cur + Math.min(dur, left - 5));
                // if still a big leftover, one Free Time — not another Study
                if (end - cur >= 40) place("Free Time", cur, end);
            }
        });

        return dedupeDay(result);
    }

    const out = {};
    dayNames.forEach((d) => { out[d] = fillDay(d, base[d] || []); });
    return out;
}


function normalizeWeekDays(week) {
    const dayNames = typeof DAYS !== "undefined" ? DAYS : ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    const map = {
        mon: "Monday", monday: "Monday",
        tue: "Tuesday", tues: "Tuesday", tuesday: "Tuesday",
        wed: "Wednesday", wednesday: "Wednesday",
        thu: "Thursday", thur: "Thursday", thurs: "Thursday", thursday: "Thursday",
        fri: "Friday", friday: "Friday",
        sat: "Saturday", saturday: "Saturday",
        sun: "Sunday", sunday: "Sunday"
    };
    const out = {};
    dayNames.forEach((d) => { out[d] = []; });
    if (!week || typeof week !== "object") return out;
    Object.keys(week).forEach((k) => {
        const day = map[String(k).toLowerCase()] || (dayNames.includes(k) ? k : null);
        if (!day) return;
        const blocks = Array.isArray(week[k]) ? week[k] : [];
        out[day] = blocks.map((b) => ({
            task: String(b.task || b.name || "Block"),
            start: String(b.start || "09:00").replace(".", ":").slice(0, 5),
            end: String(b.end || "10:00").replace(".", ":").slice(0, 5),
            completed: false,
            xpAwarded: false,
            xpAmount: 0,
            notes: b.notes || "",
            isSleep: !!(b.isSleep || /sleep|bed/i.test(String(b.task || "")))
        }));
    });
    return out;
}

function mergeFixedCommitments(week, notes) {
    if (!notes || typeof buildWeekFromNotes !== "function") return week;
    let fixed;
    try { fixed = buildWeekFromNotes(notes); } catch (e) { return week; }
    const dayNames = typeof DAYS !== "undefined" ? DAYS : Object.keys(week);
    dayNames.forEach((day) => {
        const fixedBlocks = (fixed[day] || []).filter((b) =>
            /school|football|soccer|class|lecture|lab|work|shift/i.test(b.task || "")
        );
        if (!fixedBlocks.length) return;
        const existing = week[day] || [];
        // Remove AI blocks that heavily overlap fixed commitments
        const kept = existing.filter((b) => {
            if (/school|football|soccer/i.test(b.task || "")) return false;
            return !fixedBlocks.some((f) => rangesOverlap(b.start, b.end, f.start, f.end));
        });
        week[day] = kept.concat(fixedBlocks).sort((a, b) => String(a.start).localeCompare(String(b.start)));
    });
    return week;
}

function rangesOverlap(s1, e1, s2, e2) {
    const toM = (t) => {
        const p = String(t).split(":");
        return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
    };
    const a1 = toM(s1), a2 = toM(e1), b1 = toM(s2), b2 = toM(e2);
    return a1 < b2 && b1 < a2;
}

function applyAiWeek(week, opts) {
    if (!week || typeof week !== "object") return 0;
    opts = opts || {};
    const dayNames = typeof DAYS !== "undefined" ? DAYS : ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    let normalized = normalizeWeekDays(week);
    const notes = (_planSession && _planSession.fixedNotes) || "";
    const isEdit = opts.fullWeek || (_planSession && _planSession.phase === "editing");
    if (isEdit) {
        // Trust the full week from edit; only light dedupe
        dayNames.forEach((d) => {
            const blocks = normalized[d] || [];
            const out = [];
            blocks.forEach((b) => {
                const s = String(b.start).slice(0, 5), e = String(b.end).slice(0, 5);
                if (out.some((x) => rangesOverlap(x.start, x.end, s, e))) return;
                out.push({ task: b.task, start: s, end: e, isSleep: !!b.isSleep });
            });
            normalized[d] = out.sort((a, b) => String(a.start).localeCompare(String(b.start)));
        });
    } else {
        // Collecting → fixed only → expand school → rule fill once
        normalized = keepOnlyFixedBlocks(normalized);
        normalized = ensureSchoolMonSat(normalized, notes);
        normalized = fillWeekAroundFixed(normalized, notes);
    }

    // Show in preview modal — do not apply until user clicks Keep
    const preview = {};
    let n = 0;
    dayNames.forEach((day) => {
        preview[day] = (normalized[day] || []).map((b) => ({
            task: String(b.task || "Block"),
            start: String(b.start || "09:00").slice(0, 5),
            end: String(b.end || "10:00").slice(0, 5),
            isSleep: !!(b.isSleep || /sleep|bed/i.test(String(b.task || "")))
        }));
        n += preview[day].length;
    });
    try {
        if (typeof window !== "undefined") {
            window._previewWeek = preview;
            window._previewDay = dayNames[0];
            window._previewApplyAllDays = true;
            window._previewRoutineLabel = "Personalised week (fixed + rules)";
            if (typeof showFullWeekInPreview === "function") {
                showFullWeekInPreview(preview);
            } else if (typeof syncPreviewFromPlan === "function") {
                syncPreviewFromPlan(preview);
            } else if (typeof openPreview === "function") {
                openPreview();
            }
        }
    } catch (e) {
        console.warn("preview open failed", e);
    }
    return n;
}

async function callAiPlan(message) {
    const res = await fetch(aiApiBase() + "/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            message,
            history: (_planSession && _planSession.history) || [],
            context: {
                streak: data.streak || 0,
                rank: (typeof getLevelInfo === "function" ? getLevelInfo(data.xp || 0).rank : ""),
                fixedNotes: (_planSession && _planSession.fixedNotes) || ""
            }
        })
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(j.error || ("AI error " + res.status));
      err.failed_generation = j.failed_generation || null;
      throw err;
    }
    if (j.failed_generation) {
      console.warn("[Momento AI] failed_generation:", j.failed_generation);
    }
    if (j.error && !j.reply && !j.week) {
      const err = new Error(j.error);
      err.failed_generation = j.failed_generation || null;
      throw err;
    }
    return j;
}

async function continuePlanSession(userText) {
    if (!_planSession) {
        _planSession = { phase: "ai", history: [], fixedNotes: "", style: "study" };
    }

    if (_planSession.phase === "intake") {
        const text = String(userText || "").trim();
        if (userSaidNoMore(text) || /^(none|no fixed|nothing fixed|just generate|normal week)\b/i.test(text)) {
            const style = _planSession.style || "study";
            _planSession = null;
            return runRuleBasedWeek(style, style);
        }
        if (needsRealAiForSchedule(text) || text.length > 12) {
            _planSession.phase = "ai";
            _planSession.fixedNotes = text;
            _planSession.history = [];
        } else {
            return (
                "Got it, but I need a bit more detail, or say **no**.\n\n" +
                "Any fixed classes / shifts / times? (or **no** to auto-build)"
            );
        }
    }

    if (!userSaidNoMore(userText)) {
        _planSession.fixedNotes = ((_planSession.fixedNotes || "") + " " + userText).trim().slice(0, 2000);
    }

    const finishing = userSaidNoMore(userText);

    const finalizeLocalFromNotes = (reason) => {
        const notes = (_planSession && _planSession.fixedNotes) || userText || "study";
        const style = (_planSession && _planSession.style) || "study";
        _planSession = null;
        const msg = runRuleBasedWeek(style, notes);
        return (reason ? reason + "\n\n" : "") + msg +
            "\n\n(Used your notes: " + String(notes).slice(0, 140) + (String(notes).length > 140 ? "…" : "") + ")";
    };

    try {
        if (finishing) {
            const isEdit = _planSession.phase === "editing";
            const prompt = isEdit
                ? ("User finished editing. Fixed notes:\n" + (_planSession.fixedNotes || "") +
                   "\n\nPrevious week snapshot:\n" + JSON.stringify(_planSession.editContextWeek || (typeof window !== "undefined" ? window._previewWeek : null) || {}).slice(0, 3500) +
                   "\n\nReturn JSON done:true with week = ONLY fixed commitments (all 7 days). Do not fill free time.")
                : ("Finalize fixed commitments only.\n" + (_planSession.fixedNotes || "") +
                   "\n\nReturn JSON done:true with week = ONLY fixed commitments Mon-Sun. No study/leisure filler.");

            let result = await callAiPlan(prompt);
            _planSession.history.push({ role: "user", content: userText });
            _planSession.history.push({ role: "assistant", content: result.reply || "" });

            if (result.week) {
                const n = applyAiWeek(result.week);
                _planSession = null;
                return stripJsonFromReply(result.reply || "Week ready.") +
                    (n ? "\n\n✅ Full week drafted (**" + n + "** blocks). Press **Accept week** if it looks good, or **Request changes**." : "");
            }

            result = await callAiPlan(
                "OUTPUT ONLY JSON. done:true. week = fixed commitments only for Monday-Sunday. Notes: " +
                (_planSession.fixedNotes || "")
            );
            if (result.week) {
                const n = applyAiWeek(result.week);
                _planSession = null;
                return stripJsonFromReply(result.reply || "Week ready.") +
                    (n ? "\n\n✅ Full week drafted (**" + n + "** blocks). Press **Accept week** or **Request changes**." : "");
            }

            return finalizeLocalFromNotes("AI did not return fixed blocks, so I built a week locally from your notes.");
        }

        // Editing mode mid-turn: update fixed week from feedback
        if (_planSession.phase === "editing") {
            const currentWeek = _planSession.editContextWeek || (typeof window !== "undefined" ? window._previewWeek : null) || {};
            const result = await callAiPlan(
                "EDIT MODE — apply the user's changes to the FULL week schedule.\n" +
                "User said:\n" + userText + "\n\n" +
                "Rules:\n" +
                "- Return JSON {reply, done:false, week:{Monday:[...],...,Sunday:[...]}}.\n" +
                "- week must be the COMPLETE updated schedule for all 7 days after applying their changes.\n" +
                "- Apply removes, time changes, renames, and adds exactly as asked.\n" +
                "- If school should be every day except Sunday, put School on Mon-Sat at the stated times.\n" +
                "- Do NOT invent random duplicate Study/Homework blocks. Keep the day clean.\n" +
                "- If a time is missing, keep the task and ask for the time in reply.\n\n" +
                "Current week JSON:\n" + JSON.stringify(currentWeek).slice(0, 5000)
            );
            _planSession.history.push({ role: "user", content: userText });
            _planSession.history.push({ role: "assistant", content: result.reply || "" });

            let week = result.week || null;
            // Local surgical fixes when model is weak
            week = applyLocalWeekEdits(currentWeek, userText, week);

            if (week) {
                week = typeof normalizeWeekDays === "function" ? normalizeWeekDays(week) : week;
                // Dedupe each day
                const days = typeof DAYS !== "undefined" ? DAYS : Object.keys(week);
                days.forEach((d) => {
                    const blocks = week[d] || [];
                    const seen = [];
                    blocks.forEach((b) => {
                        const s = String(b.start).slice(0, 5), e = String(b.end).slice(0, 5);
                        if (seen.some((x) => x.task === b.task && x.start === s && x.end === e)) return;
                        if (seen.some((x) => rangesOverlap(x.start, x.end, s, e))) return;
                        seen.push({ task: b.task, start: s, end: e, isSleep: !!b.isSleep });
                    });
                    week[d] = seen.sort((a, b) => String(a.start).localeCompare(String(b.start)));
                });
                _planSession.editContextWeek = week;
                if (typeof showFullWeekInPreview === "function") showFullWeekInPreview(week);
                else if (typeof syncPreviewFromPlan === "function") syncPreviewFromPlan(week);
                if (typeof setPreviewFooterMode === "function") setPreviewFooterMode("full");
            }

            let reply = stripJsonFromReply(result.reply || "Updated the week.");
            if (!/anything else/i.test(reply)) {
                reply += "\n\nAnything else to fix?\n\nPlease put **all** remaining issues in one message to save API resources.";
            }
            return reply;
        }


        const result = await callAiPlan(userText);
        _planSession.history.push({ role: "user", content: userText });
        _planSession.history.push({ role: "assistant", content: result.reply || "" });

        // Ignore model done:true until user explicitly says no
        try {
            let draft = result.week || null;
            if (draft) {
                draft = keepOnlyFixedBlocks(draft);
                draft = ensureSchoolMonSat(draft, (_planSession && _planSession.fixedNotes) || "");
            }
            if (draft && typeof showFixedDraftInPreview === "function") {
                showFixedDraftInPreview(draft);
            } else {
                await refreshFixedDraftFromNotes();
            }
        } catch (e) {}

        let reply = stripJsonFromReply(result.reply || "Got it.");
        if (reply.length < 4) reply = "Got it.";
        if (_planSession && _planSession.phase === "editing") {
            if (!/anything else/i.test(reply)) {
                reply += "\n\nAnything else to fix?\n\nPlease put **all** remaining issues in one message to save API resources.";
            }
        } else if (!/anything else/i.test(reply)) {
            reply += "\n\nAnything else I should lock in (classes, shifts, gym times)? If not, say **no** and I will build the full week.";
        }
        return reply;

    } catch (e) {
        if (finishing || ((_planSession.fixedNotes || "").length > 20)) {
            return finalizeLocalFromNotes("AI error (" + (e.message || e) + "). Built from your notes instead.");
        }
        _planSession = null;
        return "AI unavailable: " + (e.message || e) + (e && e.failed_generation ? ("\n\n**failed_generation:**\n```\n" + String(e.failed_generation).slice(0, 1200) + "\n```") : "") + ". Try **generate study week** again, or check `AI_API_KEY` on the server.";
    }
}




function applyLocalWeekEdits(currentWeek, userText, aiWeek) {
    // Prefer AI week if it looks like a real 7-day schedule
    const days = typeof DAYS !== "undefined" ? DAYS : ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    let base = aiWeek && typeof aiWeek === "object" ? (typeof normalizeWeekDays === "function" ? normalizeWeekDays(aiWeek) : aiWeek) : null;
    const aiCount = base ? days.reduce((n, d) => n + ((base[d] || []).length), 0) : 0;
    if (!base || aiCount < 5) {
        base = currentWeek && typeof currentWeek === "object"
            ? (typeof normalizeWeekDays === "function" ? normalizeWeekDays(currentWeek) : JSON.parse(JSON.stringify(currentWeek)))
            : {};
        days.forEach((d) => { if (!base[d]) base[d] = []; });
    }

    const t = String(userText || "").toLowerCase();

    // school every day except sunday / mon-sat
    if (/school/.test(t) && (/except\s+sunday|all\s+days|every\s+day|mon\s*[-–/to]+\s*sat|make sure all days/.test(t))) {
        let start = "06:00", end = "14:30";
        const m = t.match(/(\d{1,2})\s*[-–]\s*(\d{3,4})/);
        if (m) {
            const pad = (n) => String(n).padStart(2, "0");
            start = pad(+m[1]) + ":00";
            end = pad(parseInt(m[2].slice(0, m[2].length - 2), 10)) + ":" + pad(parseInt(m[2].slice(-2), 10));
        } else {
            // reuse existing school time if any
            for (const d of days) {
                const sc = (base[d] || []).find((b) => /school/i.test(b.task || ""));
                if (sc) { start = sc.start; end = sc.end; break; }
            }
        }
        const schoolDays = days.filter((d) => d !== "Sunday");
        schoolDays.forEach((d) => {
            base[d] = (base[d] || []).filter((b) => !/school/i.test(b.task || ""));
            // remove study that sits inside school hours
            base[d] = (base[d] || []).filter((b) => {
                if (!/study/i.test(b.task || "")) return true;
                return !(b.start >= start && b.end <= end);
            });
            base[d].push({ task: "School", start, end });
            base[d].sort((a, b) => String(a.start).localeCompare(String(b.start)));
        });
        // Sunday: no school
        base.Sunday = (base.Sunday || []).filter((b) => !/school/i.test(b.task || ""));
    }

    // remove X
    const rm = t.match(/remove\s+([a-z0-9\/\s]{2,30}?)(?:\s+on\s+(\w+))?$/i) || t.match(/remove\s+([a-z0-9\/\s]+)/i);
    if (/remove\s+/.test(t)) {
        const nameMatch = t.match(/remove\s+([a-z][a-z0-9\/\s]{1,24})/);
        const name = nameMatch ? nameMatch[1].replace(/\s+on\s+\w+.*/i, "").trim() : "";
        const dayMatch = t.match(/\bon\s+(mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:rs|rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)/i);
        const dayMap = { mon: "Monday", monday: "Monday", tue: "Tuesday", tues: "Tuesday", tuesday: "Tuesday", wed: "Wednesday", wednesday: "Wednesday", thu: "Thursday", thur: "Thursday", thursday: "Thursday", fri: "Friday", friday: "Friday", sat: "Saturday", saturday: "Saturday", sun: "Sunday", sunday: "Sunday" };
        const onlyDay = dayMatch ? dayMap[dayMatch[1].toLowerCase()] : null;
        if (name) {
            const re = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            (onlyDay ? [onlyDay] : days).forEach((d) => {
                base[d] = (base[d] || []).filter((b) => !re.test(b.task || ""));
            });
        }
    }

    return base;
}


function keepOnlyFixedBlocks(week) {
    const dayNames = typeof DAYS !== "undefined" ? DAYS : ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    const fixedRe = /school|college|class|lecture|lab|seminar|football|soccer|sport|training|work|shift|office|internship|lesson|piano|tutor|commute|meeting/i;
    const junkRe = /wake|get ready|sleep|study|homework|deep study|focus work|leisure|free time|break|nap|lunch|dinner|games|coding|side project|extra study|extra focus|morning block|travel/i;
    const out = {};
    dayNames.forEach((d) => {
        const blocks = (week && week[d]) ? week[d] : [];
        out[d] = (blocks || []).filter((b) => {
            const t = String(b.task || b.name || "");
            if (fixedRe.test(t)) return true;
            if (junkRe.test(t)) return false;
            // keep unknown only if user-named and not generic filler
            return t.length > 2 && !/block/i.test(t);
        }).map((b) => ({
            task: b.task || b.name || "Fixed",
            start: String(b.start || "09:00").slice(0, 5),
            end: String(b.end || "10:00").slice(0, 5)
        }));
    });
    return out;
}

function stripJsonFromReply(text) {
    let s = String(text || "");
    // remove fenced json
    s = s.replace(/```json[\s\S]*?```/gi, "").replace(/```[\s\S]*?```/g, "");
    // remove raw JSON objects that look like plan payloads
    if (s.includes('"week"') || s.includes('"done"')) {
        const start = s.indexOf("{");
        const end = s.lastIndexOf("}");
        if (start >= 0 && end > start) {
            const maybe = s.slice(start, end + 1);
            try {
                JSON.parse(maybe);
                s = (s.slice(0, start) + " " + s.slice(end + 1)).trim();
            } catch (e) {}
        }
    }
    s = s.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    return s || "Got it.";
}

function ensureSchoolMonSat(week, notes) {
    const text = String(notes || "").toLowerCase();
    if (!/school|college|class/.test(text)) return week;
    const dayNames = typeof DAYS !== "undefined" ? DAYS : ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    let days = [];
    if (/except\s+sunday|all\s+days\s+except\s+sun|every\s+day\s+except\s+sun/.test(text)) {
        days = dayNames.filter((d) => d !== "Sunday");
    } else if (/mon\s*[-–/to]+\s*sat|mon(?:day)?\s*[-–/to]+\s*sat|monday\s*[-–/to]+\s*saturday|mon\/sat/.test(text)) {
        days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    } else if (/mon\s*[-–/to]+\s*fri|weekdays/.test(text)) {
        days = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
    }
    if (!days.length) return week;

    // Parse school time
    let start = "06:00", end = "14:30";
    const compact = text.match(/(\d{1,2})\s*[-–]\s*(\d{3,4})/);
    if (compact) {
        const h1 = parseInt(compact[1], 10);
        const endRaw = compact[2];
        const h2 = parseInt(endRaw.slice(0, endRaw.length - 2), 10);
        const m2 = parseInt(endRaw.slice(-2), 10);
        const pad = (n) => String(n).padStart(2, "0");
        start = pad(h1) + ":00";
        end = pad(h2) + ":" + pad(m2);
    }
    days.forEach((d) => {
        if (!week[d]) week[d] = [];
        const has = week[d].some((b) => /school|college/i.test(b.task || ""));
        if (!has) week[d].push({ task: "School", start, end });
        // remove study blocks that overlap school hours on those days
        week[d] = week[d].filter((b) => {
            if (/school|college/i.test(b.task || "")) return true;
            // drop filler study sitting inside school window
            if (/study/i.test(b.task || "") && b.start >= start && b.end <= end) return false;
            return true;
        });
    });
    return week;
}


function startWeekEditMode() {
    if (!_planSession) {
        _planSession = { phase: "editing", history: [], fixedNotes: "", style: "custom", seed: "" };
    } else {
        _planSession.phase = "editing";
    }
    // Snapshot current preview as context for the model
    try {
        _planSession.editContextWeek = window._previewWeek || null;
    } catch (e) {
        _planSession.editContextWeek = null;
    }
    const msg = "What should change?\n\nPlease list **every** issue or missing time in **one message** (saves API calls). Example: *Football should be 16:00-17:30, remove gym on Friday, add piano Mon 18:00-19:00*.\n\nI will update the week, then ask if anything else needs fixing.";
    try {
        if (typeof appendPreviewChat === "function") appendPreviewChat(msg, "bot");
        if (typeof setPreviewFooterMode === "function") setPreviewFooterMode("draft");
    } catch (e) {}
    return msg;
}

async function refreshFixedDraftFromNotes() {
    const notes = (_planSession && _planSession.fixedNotes) || "";
    if (!notes || notes.length < 4) return;
    let fixed = null;
    // Prefer AI extract if available, else local notes parser
    try {
        const result = await callAiPlan(
            "Extract ONLY fixed commitments so far into week JSON. done=false. week may be partial. Notes:\n" + notes
        );
        if (result && result.week) fixed = result.week;
    } catch (e) {}
    if (!fixed && typeof buildWeekFromNotes === "function") {
        try {
            const w = buildWeekFromNotes(notes);
            // strip non-fixed
            const days = typeof DAYS !== "undefined" ? DAYS : Object.keys(w);
            fixed = {};
            days.forEach((d) => {
                fixed[d] = (w[d] || []).filter((b) =>
                    /school|football|soccer|class|lecture|lab|work|shift|college|piano|lesson|training/i.test(b.task || "")
                );
            });
        } catch (e) {}
    }
    if (fixed) {
        fixed = keepOnlyFixedBlocks(fixed);
        fixed = ensureSchoolMonSat(fixed, notes);
        if (typeof showFixedDraftInPreview === "function") {
            showFixedDraftInPreview(fixed);
        } else if (typeof syncPreviewFromPlan === "function") {
            syncPreviewFromPlan(fixed);
            if (typeof setPreviewFooterMode === "function") setPreviewFooterMode("draft");
        }
    }
}


function startWeekIntake(seedText) {
    const hint = String(seedText || "").toLowerCase();
    let style = "balanced";
    if (/\bstudy|exam|college|school\b/.test(hint)) style = "study";
    else if (/\bwork|office|job\b/.test(hint)) style = "work";
    else if (/\bfit|gym|health\b/.test(hint)) style = "fitness";
    _planSession = {
        phase: "intake",
        history: [],
        fixedNotes: "",
        style,
        seed: seedText || ""
    };
    try {
        window._previewApplyAllDays = true;
        if (typeof openPreview === "function") {
            if (!window._previewWeek) {
                window._previewWeek = {};
                (typeof DAYS !== "undefined" ? DAYS : []).forEach((d) => { window._previewWeek[d] = []; });
            }
            openPreview();
        }
        if (typeof appendPreviewChat === "function") {
            appendPreviewChat("Tell me any fixed classes, work, or sports. When you are done, say **no** and I will build a full week to preview.", "bot");
        }
    } catch (e) {}
    return (
        "Sure — opening the week builder.\n\n" +
        "Any **fixed** stuff I should lock in first? (classes, college, work shifts, labs, commute)\n" +
        "Example: *Mon/Wed lectures 10–12, Fri lab 2–5*\n\n" +
        "If none, just say **no** and I will generate a normal **" + style + "** week."
    );
}


function buildWeekFromNotes(notes) {
    const text = String(notes || "").toLowerCase();
    const days = typeof DAYS !== "undefined" ? DAYS : ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    const week = {};
    days.forEach((d) => { week[d] = []; });

    const pad = (n) => String(n).padStart(2, "0");
    const toHM = (h, m) => pad(h) + ":" + pad(m || 0);

    // Parse "6-1430" / "6-14:30" / "5-630" / "5-6:30"
    function parseRange(str) {
        const m = String(str).match(/(\d{1,2})(?::?(\d{2}))?\s*[-–to]+\s*(\d{1,2})(?::?(\d{2}))?/i);
        if (!m) return null;
        let h1 = parseInt(m[1], 10), min1 = m[2] ? parseInt(m[2], 10) : 0;
        let h2 = parseInt(m[3], 10), min2 = m[4] ? parseInt(m[4], 10) : 0;
        // 1430 style already split wrong — handle continuous digits
        if (!m[2] && m[1].length <= 2 && m[3].length >= 3) {
            // e.g. 6-1430
            const endRaw = m[3] + (m[4] || "");
            if (endRaw.length === 3 || endRaw.length === 4) {
                h2 = parseInt(endRaw.slice(0, endRaw.length - 2), 10);
                min2 = parseInt(endRaw.slice(-2), 10);
            }
        }
        if (!m[4] && m[3].length >= 3 && m[2] == null) {
            // already handled
        }
        // 630 as 6:30
        if (!m[4] && String(m[3]).length === 3) {
            h2 = parseInt(String(m[3])[0], 10);
            min2 = parseInt(String(m[3]).slice(1), 10);
        }
        if (!m[2] && String(m[1]).length === 3) {
            h1 = parseInt(String(m[1])[0], 10);
            min1 = parseInt(String(m[1]).slice(1), 10);
        }
        if (h1 > 23 || h2 > 23) return null;
        return { start: toHM(h1, min1), end: toHM(h2, min2) };
    }

    // Fix common "6-1430"
    function parseLooseRange(chunk) {
        const compact = chunk.replace(/\s/g, "");
        let m = compact.match(/(\d{1,2})-(\d{3,4})/);
        if (m) {
            const h1 = parseInt(m[1], 10);
            const end = m[2];
            const h2 = parseInt(end.slice(0, end.length - 2), 10);
            const min2 = parseInt(end.slice(-2), 10);
            if (h1 <= 23 && h2 <= 23) return { start: toHM(h1, 0), end: toHM(h2, min2) };
        }
        m = compact.match(/(\d{1,2})(?::(\d{2}))?-(\d{1,2})(?::(\d{2}))?/);
        if (m) {
            return { start: toHM(+m[1], m[2] ? +m[2] : 0), end: toHM(+m[3], m[4] ? +m[4] : 0) };
        }
        return null;
    }

    const dayMap = {
        mon: "Monday", monday: "Monday",
        tue: "Tuesday", tues: "Tuesday", tuesday: "Tuesday",
        wed: "Wednesday", wednesday: "Wednesday",
        thu: "Thursday", thur: "Thursday", thurs: "Thursday", thursday: "Thursday",
        fri: "Friday", friday: "Friday",
        sat: "Saturday", saturday: "Saturday",
        sun: "Sunday", sunday: "Sunday"
    };

    function daysFromPhrase(phrase) {
        const p = phrase.toLowerCase();
        if (/mon\s*[-–/to]+\s*sat|mon-sat|mon\/sat|monday\s*[-–/to]+\s*saturday/.test(p)) {
            return ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        }
        if (/except\s+sunday|all\s+days\s+except\s+sun/.test(p)) {
            return ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        }
        if (/mon\s*[-–to]+\s*fri|weekdays/.test(p)) {
            return ["Monday","Tuesday","Wednesday","Thursday","Friday"];
        }
        const found = [];
        const re = /\b(mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:rs|rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\b/g;
        let x;
        while ((x = re.exec(p))) {
            const d = dayMap[x[1]];
            if (d && !found.includes(d)) found.push(d);
        }
        return found;
    }

    // School block
    if (/school|college|class(?:es)?/.test(text)) {
        const range = parseLooseRange(text.match(/school[^.]{0,40}?(\d{1,2}\s*[-–]\s*\d{3,4}|\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2}|\d{1,2}\s*[-–]\s*\d{1,2})/i)?.[1] || text.match(/(\d{1,2}\s*[-–]\s*\d{3,4})/)?.[1] || "6-1430")
            || parseLooseRange("6-1430");
        let ds = daysFromPhrase(text);
        if (/except\s+sunday|all\s+days\s+except|every\s+day\s+except\s+sun/.test(text)) {
            ds = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        } else if (/mon\s*[-–/to]+\s*sat|mon(?:day)?\s*[-–/to]+\s*sat|mon\/sat|monday\s*[-–/to]+\s*saturday/.test(text)) {
            ds = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        } else if (!ds.length) {
            ds = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
        }
        // If phrase was only mon/sat as endpoints, still expand to all between
        if (ds.length === 2 && ds[0] === "Monday" && ds[1] === "Saturday") {
            ds = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        }
        if (range) {
            ds.forEach((d) => {
                week[d].push({ task: "School", start: range.start, end: range.end });
            });
        }
    }

    // Football / sports after school — treat low hours as PM
    if (/football|soccer/.test(text)) {
        let use = { start: "17:00", end: "18:30" };
        const loose = text.match(/football[^.]{0,80}?(\d{1,2}\s*[-–]\s*\d{3,4})/i)
            || text.match(/football[^.]{0,80}?(\d{1,2}(?::\d{2})?\s*[-–]\s*\d{1,2}(?::\d{2})?\s*(am|pm)?)/i);
        if (loose) {
            const r = parseLooseRange(loose[1]);
            if (r) {
                let [sh, sm] = r.start.split(":").map(Number);
                let [eh, em] = r.end.split(":").map(Number);
                // 5-630 or 5-6:30 in evening context → 17:00-18:30
                if (sh < 12 && (/pm|evening|afternoon|football|soccer/.test(text))) sh += 12;
                if (eh < 12 && eh < sh) eh += 12;
                if (eh < 12 && /pm/.test(loose[0] || "")) eh += 12;
                use = { start: toHM(sh % 24, sm), end: toHM(eh % 24, em) };
            }
        }
        // Days only from the football clause when possible
        const fbIdx = text.search(/football|soccer/);
        const clause = fbIdx >= 0 ? text.slice(fbIdx, fbIdx + 80) : text;
        let ds = daysFromPhrase(clause);
        if (!ds.length) ds = ["Tuesday", "Thursday"];
        ds.forEach((d) => {
            week[d].push({ task: "Football", start: use.start, end: use.end });
        });
    }

    // Sleep / wake
    let wake = "06:30", sleep = "22:30";
    const wakeM = text.match(/wake[^\d]{0,12}(\d{1,2})(?::(\d{2}))?/);
    if (wakeM) wake = toHM(+wakeM[1], wakeM[2] ? +wakeM[2] : 0);
    const sleepM = text.match(/sleep[^\d]{0,12}(\d{1,2})(?::?(\d{2}))?/);
    if (sleepM) {
        let h = +sleepM[1];
        let min = sleepM[2] ? +sleepM[2] : 0;
        if (h <= 12 && /pm|night|evening/.test(text)) h = h === 12 ? 12 : h + 12;
        if (h < 12 && !sleepM[2] && h <= 11) h = h + 12; // 10 -> 22
        sleep = toHM(h % 24, min);
    }

    days.forEach((d) => {
        const blocks = week[d];
        const wakeStart = (d === "Sunday" && /sunday[^\d]{0,20}8/.test(text)) ? "08:00" : wake;
        blocks.unshift({ task: "Wake / Get Ready", start: wakeStart, end: addMins(wakeStart, 30) });
        const sorted = blocks.slice().sort((a, b) => String(a.start).localeCompare(String(b.start)));
        const filled = sorted.slice();
        for (let i = 0; i < sorted.length - 1; i++) {
            const gapStart = sorted[i].end;
            const gapEnd = sorted[i + 1].start;
            const toM = (t) => { const p = String(t).split(":"); return (+p[0] || 0) * 60 + (+p[1] || 0); };
            const mins = toM(gapEnd) - toM(gapStart);
            if (mins >= 45 && mins <= 240) {
                const label = /football/i.test(sorted[i + 1].task) ? "Travel / Snack" :
                    /school/i.test(sorted[i].task) ? "Homework" : "Break";
                filled.push({ task: label, start: gapStart, end: gapEnd });
            }
        }
        week[d] = filled;
        week[d].push({ task: "Sleep", start: sleep, end: "23:59", isSleep: true });
        week[d].sort((a, b) => String(a.start).localeCompare(String(b.start)));
    });

    function addMins(hm, mins) {
        const [h, m] = hm.split(":").map(Number);
        const t = h * 60 + m + mins;
        return toHM(Math.floor(t / 60) % 24, t % 60);
    }

    return week;
}


function runRuleBasedWeek(style, notes) {
    const intent = notes || style || "study";
    try {
        if (typeof DAYS !== "undefined" && typeof clawbackDayXP === "function") {
            DAYS.forEach((d) => { try { clawbackDayXP(d, { silent: true }); } catch (e) {} });
        }
        let week = null;
        if (notes && /school|football|college|class|lecture|shift|work/i.test(String(notes))) {
            try {
                const fixed = buildWeekFromNotes(notes);
                week = fillWeekAroundFixed(fixed, notes);
            } catch (e) { week = null; }
        }
        if (!week && typeof generateSmartWeekFromIntent === "function") {
            const base = generateSmartWeekFromIntent(intent);
            week = fillWeekAroundFixed(base, notes || intent);
        }
        if (!week) return "Could not build week (generator missing).";
        const preview = {};
        let total = 0;
        DAYS.forEach((day) => {
            preview[day] = week[day] ? JSON.parse(JSON.stringify(week[day])) : [];
            total += preview[day].length;
        });
        try {
            window._previewWeek = preview;
            window._previewDay = DAYS[0];
            window._previewApplyAllDays = true;
            window._previewRoutineLabel = "Chat: " + String(intent).slice(0, 48);
            if (typeof syncPreviewFromPlan === "function") syncPreviewFromPlan(preview);
            else if (typeof openPreview === "function") openPreview();
        } catch (e) {}
        const n = (preview[DAYS[0]] || []).length;
        return `✅ Draft ready — **${n}** blocks on the first day (${total} total). Review days in the preview, then **Keep This Week** to apply.`;
    } catch (e) {
        return "Week build failed: " + (e.message || e);
    }
}

async function startPlanSession(seedText) {
    _planSession = { phase: "ai", history: [], fixedNotes: seedText || "", style: "custom", seed: seedText || "" };
    return continuePlanSession(
        seedText ||
        "I want a personalised week plan. Ask me about fixed classes, work, or other commitments."
    );
}


function processNLPIntent(rawInput) {
    if (!rawInput || !rawInput.trim()) return;
    const input = rawInput.trim();
    const lower = input.toLowerCase();

    const runLocal = () => {
        const result = resolveLocalIntent(input, lower);
        appendMessage(result, "bot-msg");
    };

    const finishReply = (reply) => {
        const thinking = document.querySelector(".chat-msg.thinking:last-child");
        if (thinking) thinking.remove();
        appendMessage(reply, "bot-msg");
    };

    // Active planning session (intake question or AI)
    if (_planSession) {
        appendMessage("…", "bot-msg thinking");
        Promise.resolve(continuePlanSession(input)).then(finishReply).catch((e) => {
            finishReply("Planning error: " + (e.message || e));
        });
        return;
    }

    // Week-build / personalised plan → always ask about fixed stuff first
    if (wantsWeekBuild(input) || /\b(personalised|personalized|custom week|help me plan|plan my week)\b/i.test(input)) {
        if (needsRealAiForSchedule(input)) {
            appendMessage("…", "bot-msg thinking");
            Promise.resolve(startPlanSession(input)).then(finishReply).catch(runLocal);
            return;
        }
        appendMessage(startWeekIntake(input), "bot-msg");
        return;
    }

    if (!NLP_CORPUS) {
        loadNlpCorpus().then(runLocal).catch(runLocal);
    } else {
        runLocal();
    }
}

function resolveLocalIntent(input, lower) {
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

    if (/\b(week|schedule|routine|plan|day|timetable)\b/i.test(lower)) {
        try {
            DAYS.forEach(d => { if (typeof clawbackDayXP === "function") clawbackDayXP(d); });
            const week = generateSmartWeekFromIntent(input);
            DAYS.forEach(day => { data.schedules[day] = JSON.parse(JSON.stringify(week[day] || [])); });
            data.appliedRoutine = `AI: ${input.substring(0, 40)}`;
            try { saveData(); renderCurrentDay(); populatePresetMenus(); updateXPDisplay(); } catch (e) {}
            const n = (week[DAYS[0]] || []).length;
            return `✅ Generated a week from **"${input}"**, ${n} blocks/day, mixed categories. Previous XP reset.`;
        } catch (e) {}
    }

    if (/\b(xp|level|rank|streak)\b/.test(lower)) {
        try { if (typeof openProgressPanel === "function") openProgressPanel(); } catch(e){}
        const info = typeof getLevelInfo === "function" ? getLevelInfo(data.xp || 0) : { rank: "?" };
        return `⭐ You're **${info.rank}** with **${data.xp || 0} XP**. Opened progress.`;
    }

    const chatty = generateConversationalReply(input, lower);
    if (chatty) return chatty;

    if (NLP_CORPUS && NLP_CORPUS.fallback_hooks && NLP_CORPUS.fallback_hooks.length) {
        return pick(NLP_CORPUS.fallback_hooks) + "\n\nTry **help**, or say \"generate study week\" / \"open crates\" / \"how are you?\".";
    }

    return (
        `🤔 Not sure I caught that. Try:\n` +
        `• "generate study week" / "build a chill week"\n` +
        `• "add Gym from 07:00 to 08:00"\n` +
        `• "delete task 2" / "clear day"\n` +
        `• "open todo" / "open progress" / "open timeline" / "open calendar"\n` +
        `• "open crates" / "open customiser" / "change theme to cyan"\n` +
        `• "help" for the full list`
    );
}


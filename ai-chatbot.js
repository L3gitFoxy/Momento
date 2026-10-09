

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

let SCHEDULE_NLP = null;
let _schedNlpLoading = null;

function loadScheduleNlpCorpus() {
    if (SCHEDULE_NLP) return Promise.resolve(SCHEDULE_NLP);
    if (_schedNlpLoading) return _schedNlpLoading;
    _schedNlpLoading = fetch("./ai-generations-nlp.json", { cache: "force-cache" })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => { SCHEDULE_NLP = j; return j; })
        .catch(() => { SCHEDULE_NLP = null; return null; });
    return _schedNlpLoading;
}
try { loadScheduleNlpCorpus(); } catch (e) {}

function parseTimeTokenLocal(raw) {
    let s = String(raw || "").toLowerCase().trim().replace(/\./g, ":");
    s = s.replace(/\s+/g, " ").trim();
    s = s.replace(/\s*[-–to]+\s*/g, "-").replace(/\s+/g, "");
    const pad = (n) => String(Math.max(0, Math.min(59, n | 0))).padStart(2, "0");
    const padH = (n) => String(Math.max(0, Math.min(23, n | 0))).padStart(2, "0");

    function fromHHMM(token) {
        const t = String(token || "");
        // 1430 / 0630 / 630 / 6
        if (/^\d{4}$/.test(t)) {
            const h = parseInt(t.slice(0, 2), 10);
            const m = parseInt(t.slice(2), 10);
            if (h <= 23 && m <= 59) return { h, m };
        }
        if (/^\d{3}$/.test(t)) {
            // 630 → 6:30, 930 → 9:30
            const h = parseInt(t.slice(0, 1), 10);
            const m = parseInt(t.slice(1), 10);
            if (h <= 9 && m <= 59) return { h, m };
            // 1630 style without 4th? treat as HH M incompletely — fail
        }
        if (/^\d{1,2}$/.test(t)) {
            const h = parseInt(t, 10);
            if (h <= 23) return { h, m: 0 };
        }
        if (/^\d{1,2}:\d{2}$/.test(t)) {
            const p = t.split(":");
            return { h: parseInt(p[0], 10), m: parseInt(p[1], 10) };
        }
        return null;
    }

    // Strip am/pm and apply later
    let apStart = null, apEnd = null;
    let core = s;
    const ampm = core.match(/^(.*?)(am|pm)?-(.*?)(am|pm)?$/i);
    if (ampm) {
        core = (ampm[1] || "") + "-" + (ampm[3] || "");
        apStart = (ampm[2] || "").toLowerCase() || null;
        apEnd = (ampm[4] || "").toLowerCase() || null;
    }
    // If only end has pm: 5-630pm already handled by regex above when glued
    const pmOnly = s.match(/^(.*?)-(.*?)(am|pm)$/i);
    if (!apEnd && pmOnly) {
        core = pmOnly[1] + "-" + pmOnly[2];
        apEnd = pmOnly[3].toLowerCase();
    }

    const parts = core.split("-");
    if (parts.length !== 2) return null;
    let left = parts[0].replace(/(am|pm)/gi, "");
    let right = parts[1].replace(/(am|pm)/gi, "");

    // Prefer compact HHMM-HHMM (630-1430, 0630-1430)
    let a = fromHHMM(left);
    let b = fromHHMM(right);
    // Also allow 6:30-14:30 already in fromHHMM via colon
    if (!a || !b) {
        // 6-1430 where left is hour only and right is HHMM
        if (/^\d{1,2}$/.test(left) && /^\d{3,4}$/.test(right)) {
            a = fromHHMM(left);
            b = fromHHMM(right);
        }
    }
    if (!a || !b) return null;

    let h1 = a.h, m1 = a.m, h2 = b.h, m2 = b.m;
    if (apStart === "pm" && h1 < 12) h1 += 12;
    if (apStart === "am" && h1 === 12) h1 = 0;
    if (apEnd === "pm" && h2 < 12) h2 += 12;
    if (apEnd === "am" && h2 === 12) h2 = 0;
    // 6-7pm → both pm
    if (!apStart && apEnd === "pm" && h1 < 12 && h1 <= h2) h1 += 12;

    if (h1 > 23 || h2 > 23 || m1 > 59 || m2 > 59) return null;
    return { start: padH(h1) + ":" + pad(m1), end: padH(h2) + ":" + pad(m2) };
}

function resolveDaysFromText(text) {
    const t = String(text || "").toLowerCase();
    if (/tue\s*\/\s*thu|tues\s*\/\s*thurs|tue\s*\/\s*thur|tues\s*\/\s*thur|tuesday\s*(?:and|\/|&)\s*thursday/.test(t)) {
        return ["Tuesday", "Thursday"];
    }
    if (/mon\s*\/\s*wed|monday\s*(?:and|\/|&)\s*wednesday/.test(t)) {
        return ["Monday", "Wednesday"];
    }
    if (/mon\s*\/\s*wed\s*\/\s*fri|mwf/.test(t)) {
        return ["Monday", "Wednesday", "Friday"];
    }
    const corp = SCHEDULE_NLP;
    if (corp && Array.isArray(corp.day_ranges)) {
        let best = null, bestLen = 0;
        corp.day_ranges.forEach((r) => {
            (r.patterns || []).forEach((p) => {
                if (t.includes(String(p).toLowerCase()) && String(p).length >= bestLen) {
                    best = r.days;
                    bestLen = String(p).length;
                }
            });
        });
        if (best) return best.slice();
    }
    if (/except\s+sunday|all\s+days\s+except/.test(t)) return ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    if (/mon\s*[-–/to]+\s*sat|mon-sat/.test(t)) return ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    if (/mon\s*[-–/to]+\s*fri|weekday/.test(t)) return ["Monday","Tuesday","Wednesday","Thursday","Friday"];
    if (/weekend|sat\s*[-–/]\s*sun/.test(t)) return ["Saturday","Sunday"];
    const found = [];
    const map = {mon:"Monday",monday:"Monday",tue:"Tuesday",tues:"Tuesday",tuesday:"Tuesday",wed:"Wednesday",wednesday:"Wednesday",thu:"Thursday",thur:"Thursday",thurs:"Thursday",thursday:"Thursday",fri:"Friday",friday:"Friday",sat:"Saturday",saturday:"Saturday",sun:"Sunday",sunday:"Sunday"};
    const re = /\b(mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\b/g;
    let x;
    while ((x = re.exec(t))) {
        const d = map[x[1].toLowerCase()];
        if (d && !found.includes(d)) found.push(d);
    }
    return found;
}

function resolveTaskFromText(text) {
    const t = String(text || "").toLowerCase();
    // Specific subjects first — never treat "hindi class" as School
    if (/\bhindi\b/.test(t)) return "Hindi Class";
    if (/science\s*\/?\s*maths|sci\/math|\bpcm\b/.test(t)) return "Science/Maths Class";
    if (/\bdharmik\b|\bdharma\b/.test(t)) return "Dharmik Class";
    if (/\bfootball\b|\bsoccer\b/.test(t)) return "Football";
    if (/\bgym\b|\bworkout\b/.test(t)) return "Gym";
    if (/\bpiano\b/.test(t)) return "Piano";
    if (/\btuition\b|\btutor\b/.test(t)) return "Tuition";
    if (/\blab\b|practical/.test(t)) return "Lab";
    if (/\blecture/.test(t)) return "Lecture";
    if (/\bcoding\b|programming/.test(t)) return "Coding";
    // School only if explicit school/college (not bare "class")
    if (/\bschool\b|\bcollege\b|\buniversity\b|\buni\b/.test(t)) return "School";
    if (/\bwork\b|\bshift\b|\boffice\b/.test(t)) return "Work";

    const corp = SCHEDULE_NLP;
    if (corp && corp.task_keywords) {
        const pairs = [];
        for (const [task, kws] of Object.entries(corp.task_keywords)) {
            if (/^school$/i.test(task)) continue;
            for (const kw of kws) pairs.push({ task, kw: String(kw).toLowerCase() });
        }
        pairs.sort((a, b) => b.kw.length - a.kw.length);
        for (const { task, kw } of pairs) {
            if (kw && t.includes(kw)) return task;
        }
    }
    return null;
}

/** Parse a user line into fixed blocks without calling the API. */
function sanitizeWeekTimes(week) {
    if (!week || typeof week !== "object") return week;
    const days = typeof DAYS !== "undefined" ? DAYS : Object.keys(week);
    const pad = (n) => String(Math.max(0, Math.min(59, n | 0))).padStart(2, "0");
    const padH = (n) => String(Math.max(0, Math.min(23, n | 0))).padStart(2, "0");
    function fixTok(t) {
        let s = String(t || "").trim();
        if (!s) return "09:00";
        // already HH:MM
        let m = s.match(/^(\d{1,2}):(\d{2})$/);
        if (m) {
            let h = parseInt(m[1], 10), mi = parseInt(m[2], 10);
            if (h > 23 && mi <= 59) {
                // classic bug 30:00 from "630" misparse — treat as :30 past hour 6 if we can't know
                return "06:30";
            }
            if (h > 23) h = h % 24;
            if (mi > 59) mi = 0;
            return padH(h) + ":" + pad(mi);
        }
        if (typeof parseTimeTokenLocal === "function") {
            // single token won't parse as range — try as HHMM
            if (/^\d{3,4}$/.test(s)) {
                const r = parseTimeTokenLocal(s + "-" + s);
                if (r) return r.start;
            }
        }
        return s.slice(0, 5);
    }
    days.forEach((d) => {
        (week[d] || []).forEach((b) => {
            if (!b) return;
            b.start = fixTok(b.start);
            b.end = fixTok(b.end);
            // swap if inverted nonsense
            const hs = parseInt(String(b.start).split(":")[0], 10);
            const he = parseInt(String(b.end).split(":")[0], 10);
            if (hs > 23) b.start = "06:30";
            if (he > 23) b.end = "14:30";
        });
    });
    return week;
}

function matchLocalScheduleUtterance(text) {
    const t = String(text || "").trim();
    if (!t) return null;
    try {
        if (typeof shouldUseLocalScheduleNlp === "function") {
            if (!shouldUseLocalScheduleNlp()) return null;
        } else if (typeof navigator !== "undefined" && navigator.onLine !== false) {
            return null;
        }
    } catch (e) {}
    loadScheduleNlpCorpus();
    const days = resolveDaysFromText(t);
    const task = resolveTaskFromText(t);
    // find a time span in the text
    let range = null;
    const candidates = t.match(/\d{1,2}(?::\d{2})?\s*(?:am|pm)?\s*[-–to]+\s*\d{1,2}(?::?\d{2})?\s*(?:am|pm)?/ig)
        || t.match(/\d{1,2}\s*[-–]\s*\d{3,4}/g)
        || t.match(/\b\d{3,4}\s*[-–]\s*\d{3,4}\b/g);
    if (candidates) {
        for (const cand of candidates) {
            range = parseTimeTokenLocal(cand);
            if (range) break;
        }
    }
    // evening bias for sports/classes with low hours
    if (range && task && /football|gym|class|tuition|hindi|science|math/i.test(task)) {
        let h1 = parseInt(range.start, 10), h2 = parseInt(range.end, 10);
        if (h1 < 12 && h2 < 12 && h1 >= 3 && h1 <= 9) {
            const pad = (n) => String(n).padStart(2, "0");
            const m1 = range.start.split(":")[1] || "00";
            const m2 = range.end.split(":")[1] || "00";
            range = { start: pad(h1 + 12) + ":" + m1, end: pad(h2 + 12) + ":" + m2 };
        }
    }
    if (!task && !range) return null;
    return {
        task: task || "Fixed",
        days: days.length ? days : ["Monday","Tuesday","Wednesday","Thursday","Friday"],
        start: range ? range.start : null,
        end: range ? range.end : null,
        raw: t
    };
}

function applyLocalUtteranceToFixedWeek(week, utterance) {
    const days = typeof DAYS !== "undefined" ? DAYS : ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    const out = {};
    // Deep-copy existing blocks — never wipe school when adding hindi
    days.forEach((d) => {
        out[d] = ((week && week[d]) || []).map((b) => ({
            task: b.task,
            start: b.start,
            end: b.end,
            isSleep: !!b.isSleep,
            notes: b.notes || ""
        }));
    });
    if (!utterance || !utterance.start || !utterance.end) return out;
    const targetDays = (utterance.days && utterance.days.length) ? utterance.days : [];
    if (!targetDays.length) return out;
    const taskName = String(utterance.task || "Fixed");
    targetDays.forEach((d) => {
        // Remove only the same activity on that day (re-add at new time), keep School etc.
        out[d] = (out[d] || []).filter((b) => String(b.task).toLowerCase() !== taskName.toLowerCase());
        out[d].push({ task: taskName, start: utterance.start, end: utterance.end, notes: "fixed" });
        out[d].sort((a, b) => String(a.start).localeCompare(String(b.start)));
    });
    return out;
}

function fillGapsInExistingWeek(week) {
    // Re-run rule filler using current blocks as fixed-ish anchors
    if (typeof fillWeekAroundFixed !== "function") return week;
    const days = typeof DAYS !== "undefined" ? DAYS : Object.keys(week || {});
    // Treat non-filler blocks as fixed
    const fixed = {};
    const fixedRe = /school|college|class|lecture|lab|football|soccer|gym|work|shift|tuition|hindi|science|math|dharmik|piano|coding|meeting/i;
    days.forEach((d) => {
        fixed[d] = ((week && week[d]) || []).filter((b) => fixedRe.test(b.task || "") || (b.notes === "fixed"));
    });
    const notes = (_planSession && _planSession.fixedNotes) || "";
    return fillWeekAroundFixed(fixed, notes);
}



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
    const w = document.getElementById("ai-chat-widget");
    if (!win) return;
    const opening = win.classList.contains("chat-hidden");
    if (opening) {
        win.classList.remove("chat-hidden");
    } else {
        // Closing: always leave fullscreen and keep the robot FAB visible
        if (typeof closeAiChat === "function") closeAiChat();
        else {
            if (w) w.classList.remove("ai-chat-fullscreen");
            win.classList.add("chat-hidden");
        }
    }
}

function sendChatMessage() {
    const input = document.getElementById("chat-input");
    const text = input ? input.value.trim() : "";
    if (!text) return;
    appendMessage(text, "user-msg");
    if (input) input.value = "";
    setTimeout(async () => {
        // Personal model for general chat (not mid week-plan session)
        try {
            const settings = (typeof getAppSettings === "function") ? getAppSettings() : {};
            const inPlan = typeof _planSession !== "undefined" && _planSession;
            if (!inPlan && settings.usePersonalForChat && settings.personalApiKey && settings.personalApiUrl) {
                const reply = await callPersonalChatbot(text);
                if (reply) {
                    appendMessage(reply, "bot-msg");
                    return;
                }
            }
        } catch (e) { console.warn(e); }
        processNLPIntent(text);
    }, 150);
}

function formatChatMarkdown(text) {
    let s = String(text || "");
    s = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    s = s.replace(/```([\s\S]*?)```/g, function (_, code) {
        return "<pre class=\"chat-pre\"><code>" + code.trim() + "</code></pre>";
    });
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/^### (.+)$/gm, "<h4>$1</h4>");
    s = s.replace(/^## (.+)$/gm, "<h3>$1</h3>");
    s = s.replace(/^# (.+)$/gm, "<h3>$1</h3>");
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/__(.+?)__/g, "<strong>$1</strong>");
    s = s.replace(/(^|[\s(])\*(?!\s)(.+?)(?!\s)\*(?=[\s).,!?]|$)/g, "$1<em>$2</em>");
    s = s.replace(/(^|[\s(])_(?!\s)(.+?)(?!\s)_(?=[\s).,!?]|$)/g, "$1<em>$2</em>");
    s = s.replace(/^\s*[-•] (.+)$/gm, "<li>$1</li>");
    s = s.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");
    s = s.replace(/\n\n/g, "</p><p>");
    s = s.replace(/\n/g, "<br>");
    if (!/^<h|<ul|<pre|<p/.test(s)) s = "<p>" + s + "</p>";
    return s;
}

function appendMessage(msg, className) {
    const container = document.getElementById("chat-messages");
    let div = null;
    if (container) {
        div = document.createElement("div");
        div.className = `chat-msg ${className}`;
        const isBot = /bot|assistant/i.test(String(className));
        div.innerHTML = isBot ? formatChatMarkdown(msg) : String(msg).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g, "<br>");
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
let _planGenId = 0;
let _planAborted = false;
function planGenStillActive(myGen) {
    if (_planAborted) return false;
    if (myGen != null && _planGenId !== myGen) return false;
    if (!_planSession) return false;
    return true;
}


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

function userSaidCancel(text) {
    const t = String(text || "").toLowerCase().trim();
    return /^(cancel|stop|exit|never\s*mind|nevermind|abort|close|quit|back)\b/.test(t) ||
        /\b(cancel|stop) (the )?(week|builder|plan)\b/.test(t);
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
    if (_planAborted) return 0;
    if (!week || typeof week !== "object") return 0;
    opts = opts || {};
    const dayNames = typeof DAYS !== "undefined" ? DAYS : ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    let normalized = normalizeWeekDays(week);
    normalized = sanitizeWeekTimes(normalized);
    const notes = (_planSession && _planSession.fixedNotes) || "";
    const isEdit = opts.fullWeek || (_planSession && _planSession.phase === "editing");
    if (isEdit && !opts.refillGaps) {
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
        // Still close obvious holes
        normalized = fillGapsInExistingWeek(normalized);
    } else {
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

function supabaseAiUrl() {
    try {
        if (typeof SUPABASE_URL === "string" && SUPABASE_URL) {
            return SUPABASE_URL.replace(/\/$/, "") + "/functions/v1/ai-plan";
        }
    } catch (e) {}
    return "https://zfvaylgvhgmwmlpiwjzw.supabase.co/functions/v1/ai-plan";
}

async function callAiPlan(message) {
    if (_planAborted) {
        const err = new Error("cancelled");
        err.code = "cancelled";
        throw err;
    }
    const payload = {
        message,
        history: (_planSession && _planSession.history) || [],
        context: {
            streak: (typeof data !== "undefined" && data.streak) || 0,
            rank: (typeof getLevelInfo === "function" && typeof data !== "undefined" ? getLevelInfo(data.xp || 0).rank : ""),
            fixedNotes: (_planSession && _planSession.fixedNotes) || "",
            phase: (_planSession && _planSession.phase) || "",
            editWeek: (_planSession && _planSession.phase === "editing")
                ? (_planSession.editContextWeek || (typeof window !== "undefined" ? window._previewWeek : null))
                : null
        }
    };

    async function postJson(url, headers, body) {
        const res = await fetch(url, {
            method: "POST",
            headers: Object.assign({ "Content-Type": "application/json" }, headers || {}),
            body: JSON.stringify(body)
        });
        const j = await res.json().catch(() => ({}));
        return { res, j };
    }

    function parseModelContent(raw) {
        let parsed = null;
        const text = String(raw || "");
        try {
            const cleaned = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
            parsed = JSON.parse(cleaned);
        } catch (e1) {
            const a = text.indexOf("{"), b = text.lastIndexOf("}");
            if (a >= 0 && b > a) {
                try { parsed = JSON.parse(text.slice(a, b + 1)); } catch (e2) {}
            }
        }
        return parsed;
    }

    let lastErr = null;
    const settings = (typeof getAppSettings === "function") ? getAppSettings() : {};
    const personalOn = !!(settings.usePersonalForPlan && settings.personalApiKey && settings.personalApiUrl);

    // Personal OpenAI-compatible endpoint for planning
    if (personalOn) {
        try {
            const model = settings.personalApiModel || "gpt-4o-mini";
            const body = {
                model,
                temperature: 0.2,
                messages: [
                    { role: "system", content: "You plan weeks for Momento. Reply with JSON only: {\"reply\":string,\"done\":boolean,\"week\":{\"Monday\":[{\"task\",\"start\",\"end\"}],...\"Sunday\":[]}}. Use 24h times HH:MM only (never 30:00). Fixed commitments only while collecting; full week in edit mode." },
                    { role: "user", content: JSON.stringify(payload).slice(0, 12000) }
                ]
            };
            const { res, j } = await postJson(
                settings.personalApiUrl.replace(/\/$/, "") + "/chat/completions",
                { Authorization: "Bearer " + settings.personalApiKey },
                body
            );
            if (res.status === 429 || (j.error && /rate|too many/i.test(String(j.error.message || j.error)))) {
                const err = new Error("Rate limit reached on your personal model. Wait about a minute and try again.");
                err.code = "rate_limit";
                err._source = "personal";
                throw err;
            }
            if (res.ok && j.choices && j.choices[0] && j.choices[0].message) {
                const raw = j.choices[0].message.content || "";
                const parsed = parseModelContent(raw);
                if (parsed) {
                    console.log("[Momento AI] using personal model", model);
                    return {
                        reply: parsed.reply || "Got it.",
                        done: !!parsed.done,
                        week: parsed.week || null,
                        _source: "personal"
                    };
                }
                // plain text from personal model
                return { reply: String(raw).trim().slice(0, 1500) || "Got it.", done: false, week: null, _source: "personal" };
            }
            lastErr = new Error((j.error && j.error.message) || ("personal AI " + res.status));
            // If personal is enabled, do NOT silently fall through — surface the error
            throw lastErr;
        } catch (e) {
            if (e && (e.code === "rate_limit" || e.code === "cancelled")) throw e;
            // personal configured but failed — stop (no music-server surprise)
            throw e;
        }
    }

    try {
        const { res, j } = await postJson(aiApiBase() + "/api/ai/plan", {}, payload);
        if (res.status === 429) {
            const err = new Error("Rate limit reached. Wait about a minute and try again.");
            err.code = "rate_limit";
            throw err;
        }
        if (res.ok && !(j.error && !j.reply && !j.week)) {
            if (j.failed_generation) console.warn("[Momento AI] failed_generation:", j.failed_generation);
            console.log("[Momento AI] using music-server");
            j._source = "server";
            return j;
        }
        lastErr = new Error(j.error || ("local AI " + res.status));
    } catch (e) {
        if (e && (e.code === "rate_limit" || e.code === "cancelled")) throw e;
        lastErr = e;
    }

    try {
        const headers = {};
        try {
            if (typeof SUPABASE_ANON_KEY === "string") {
                headers.Authorization = "Bearer " + SUPABASE_ANON_KEY;
                headers.apikey = SUPABASE_ANON_KEY;
            }
        } catch (e) {}
        const { res, j } = await postJson(supabaseAiUrl(), headers, payload);
        if (res.status === 429) {
            const err = new Error("Rate limit reached. Wait about a minute and try again.");
            err.code = "rate_limit";
            throw err;
        }
        if (res.ok && !(j.error && !j.reply && !j.week)) {
            console.log("[Momento AI] using supabase edge");
            j._source = "edge";
            return j;
        }
        lastErr = new Error(j.error || ("edge AI " + res.status));
    } catch (e) {
        if (e && (e.code === "rate_limit" || e.code === "cancelled")) throw e;
        lastErr = e;
    }

    throw new Error((lastErr && lastErr.message) || "AI unavailable");
}

function planStillActive(gen) {
    if (_planAborted) return false;
    if (!_planSession) return false;
    if (gen != null && _planSession.gen != null && gen !== _planSession.gen) return false;
    return true;
}

async function continuePlanSession(userText) {
    if (userSaidCancel(userText)) {
        _planAborted = true;
        _planGenId += 1;
        _planSession = null;
        try {
            if (typeof closePreview === "function") closePreview();
        } catch (e) {
            try {
                const modal = document.getElementById("preview-modal");
                if (modal) modal.classList.add("hidden");
            } catch (e2) {}
        }
        return "Week builder cancelled. Back to normal help — type **help** anytime.";
    }
    if (_planAborted && !_planSession) {
        return "Week builder is closed. Say **generate study week** to start again.";
    }
    const myGen = (_planSession && _planSession.gen) != null ? _planSession.gen : _planGenId;

    if (!_planSession) {
        _planAborted = false;
        _planGenId += 1;
        _planSession = { phase: "ai", history: [], fixedNotes: "", style: "study", gen: _planGenId };
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
            // Instant local apply so the timetable updates even if AI fails
            let week = applyLocalWeekEdits(currentWeek, userText, null);
            if (week && typeof showFullWeekInPreview === "function") {
                showFullWeekInPreview(week);
                _planSession.editContextWeek = week;
                if (typeof setPreviewFooterMode === "function") setPreviewFooterMode("full");
            }

            let result = { reply: "Updated from your instructions.", week: null };
            try {
                result = await callAiPlan(
                    "EDIT MODE — apply the user's changes to the FULL week.\n" +
                    "User said:\n" + userText + "\n\n" +
                    "Return JSON {reply, done:false, week:{Monday:[...],...,Sunday:[...]}} with the COMPLETE updated schedule.\n" +
                    "Apply removes, renames, time changes, and adds exactly.\n" +
                    "If school every day except Sunday, put School Mon-Sat.\n" +
                    "No duplicate Study/Homework spam.\n\n" +
                    "Current week JSON:\n" + JSON.stringify(week || currentWeek).slice(0, 5000)
                );
            } catch (e) {
                result = { reply: "Applied locally (AI offline: " + (e.message || e) + ").", week: null };
            }

            _planSession.history.push({ role: "user", content: userText });
            _planSession.history.push({ role: "assistant", content: result.reply || "" });

            if (result.week) {
                week = applyLocalWeekEdits(week || currentWeek, userText, result.week);
            }
            if (week) {
                week = typeof normalizeWeekDays === "function" ? normalizeWeekDays(week) : week;
                week = sanitizeWeekTimes(week);
                _planSession.editContextWeek = week;
                if (typeof showFullWeekInPreview === "function") showFullWeekInPreview(week);
                else if (typeof syncPreviewFromPlan === "function") syncPreviewFromPlan(week);
                try {
                    if (typeof window !== "undefined") {
                        window._previewWeek = week;
                        window._previewReadyToAccept = true;
                    }
                    if (typeof _previewWeek !== "undefined") _previewWeek = week;
                    if (typeof renderPreviewTabs === "function") renderPreviewTabs();
                    if (typeof renderPreviewDay === "function") renderPreviewDay();
                } catch (e) {}
                if (typeof setPreviewFooterMode === "function") setPreviewFooterMode("full");
            }

            if (!planGenStillActive(myGen)) return "Cancelled.";
            let reply = stripJsonFromReply(result.reply || "Updated the week.");
            if (!/anything else/i.test(reply)) {
                reply += "\n\nAnything else to fix?\n\nList every remaining fix in one message.";
            }
            return reply;
        }


        // Local NLP only if settings say so (offline-first) or actually offline
        const useLocal = (typeof shouldUseLocalScheduleNlp === "function")
            ? shouldUseLocalScheduleNlp()
            : (typeof navigator !== "undefined" && navigator.onLine === false);
        const localUtt = useLocal ? matchLocalScheduleUtterance(userText) : null;
        if (localUtt && localUtt.start && localUtt.end) {
            let draft = null;
            try {
                draft = (_planSession.editContextWeek) || (typeof window !== "undefined" ? window._previewWeek : null);
                if (!draft || typeof draft !== "object") {
                    draft = {};
                    (typeof DAYS !== "undefined" ? DAYS : []).forEach((d) => { draft[d] = []; });
                }
                draft = applyLocalUtteranceToFixedWeek(draft, localUtt);
                // Only re-assert school if THIS message is about school — never on hindi/math class lines
                if (/school|college/i.test(userText)) {
                    draft = ensureSchoolMonSat(draft, (_planSession.fixedNotes || "") + " " + userText);
                } else if (/school|college/i.test(_planSession.fixedNotes || "")) {
                    // Keep prior school times; do not parse times from this message
                    draft = ensureSchoolMonSat(draft, _planSession.fixedNotes || "");
                }
                if (typeof showFixedDraftInPreview === "function") showFixedDraftInPreview(draft);
                _planSession.history.push({ role: "user", content: userText });
                _planSession.history.push({ role: "assistant", content: "Locked " + localUtt.task + " locally." });
                return "Got it — **" + localUtt.task + "** " + localUtt.start + "–" + localUtt.end +
                    " on " + (localUtt.days || []).map((d) => d.slice(0, 3)).join(", ") +
                    ".\n\nAnything else I should lock in? If not, say **no** and I will build the full week.";
            } catch (e) { console.warn("local utt", e); }
        }

        const result = await callAiPlan(userText);
        _planSession.history.push({ role: "user", content: userText });
        _planSession.history.push({ role: "assistant", content: result.reply || "" });

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
                reply += "\n\nAnything else to fix?\n\nList every remaining fix in one message.";
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
    const days = typeof DAYS !== "undefined" ? DAYS : ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    const dayMap = {
        mon: "Monday", monday: "Monday", tue: "Tuesday", tues: "Tuesday", tuesday: "Tuesday",
        wed: "Wednesday", wednesday: "Wednesday", thu: "Thursday", thur: "Thursday", thurs: "Thursday", thursday: "Thursday",
        fri: "Friday", friday: "Friday", sat: "Saturday", saturday: "Saturday", sun: "Sunday", sunday: "Sunday"
    };
    const pad = (n) => String(n).padStart(2, "0");

    function cloneWeek(w) {
        const out = {};
        days.forEach((d) => {
            out[d] = ((w && w[d]) || []).map((b) => ({
                task: String(b.task || "Block"),
                start: String(b.start || "09:00").slice(0, 5),
                end: String(b.end || "10:00").slice(0, 5),
                isSleep: !!b.isSleep
            }));
        });
        return out;
    }

    let base;
    const aiNorm = aiWeek && typeof aiWeek === "object"
        ? (typeof normalizeWeekDays === "function" ? normalizeWeekDays(aiWeek) : aiWeek)
        : null;
    const aiCount = aiNorm ? days.reduce((n, d) => n + ((aiNorm[d] || []).length), 0) : 0;
    if (aiNorm && aiCount >= 7) base = cloneWeek(aiNorm);
    else base = cloneWeek(currentWeek || {});

    const t = String(userText || "").toLowerCase().trim();

    if (/school/.test(t) && (/except\s+sunday|all\s+days|every\s+day|mon\s*[-–/to]+\s*sat|make sure all days|every weekday/.test(t))) {
        let start = "06:00", end = "14:30";
        // NEVER use (\d{1,2})-(\d{3,4}) alone — "630-1430" becomes 30:00
        const rangeTok = (t.match(/(\d{3,4}\s*[-–]\s*\d{3,4})/) || t.match(/(\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2})/) || t.match(/(\d{1,2}\s*[-–]\s*\d{3,4})/) || [])[1];
        if (rangeTok && typeof parseTimeTokenLocal === "function") {
            const r = parseTimeTokenLocal(rangeTok);
            if (r && r.start && r.end) { start = r.start; end = r.end; }
        } else {
            for (const d of days) {
                const sc = (base[d] || []).find((b) => /school/i.test(b.task || ""));
                if (sc) { start = sc.start; end = sc.end; break; }
            }
        }
        days.filter((d) => d !== "Sunday").forEach((d) => {
            base[d] = (base[d] || []).filter((b) => !/school/i.test(b.task || ""));
            base[d] = (base[d] || []).filter((b) => {
                if (!/study/i.test(b.task || "")) return true;
                return !(b.start >= start && b.end <= end);
            });
            base[d].push({ task: "School", start, end });
            base[d].sort((a, b) => String(a.start).localeCompare(String(b.start)));
        });
        base.Sunday = (base.Sunday || []).filter((b) => !/school/i.test(b.task || ""));
    }

    if (/\bremove\b/.test(t) || /\bdelete\b/.test(t)) {
        const nameMatch = t.match(/(?:remove|delete)\s+([a-z][a-z0-9\/\s]{1,28}?)(?:\s+on\s+|\s*$)/i);
        let name = nameMatch ? nameMatch[1].trim() : "";
        name = name.replace(/\s+on\s+\w+.*/i, "").trim();
        const dayMatch = t.match(/\bon\s+(mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:rs|rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)/i);
        const onlyDay = dayMatch ? dayMap[dayMatch[1].toLowerCase()] : null;
        if (name) {
            const ree = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            (onlyDay ? [onlyDay] : days).forEach((d) => {
                base[d] = (base[d] || []).filter((b) => !ree.test(b.task || ""));
            });
        }
    }

    const timeChange = t.match(/(?:change|move|set)\s+([a-z][a-z0-9\/\s]{1,24}?)\s+(?:to|from)\s+(\d{1,2}(?::\d{2})?)\s*[-–]\s*(\d{1,2}(?::\d{2})?)/i);
    if (timeChange) {
        const name = timeChange[1].trim();
        let s = timeChange[2], e = timeChange[3];
        if (!s.includes(":")) s = pad(+s) + ":00";
        if (!e.includes(":") && e.length <= 2) e = pad(+e) + ":00";
        if (!e.includes(":") && e.length >= 3) e = pad(parseInt(e.slice(0, e.length - 2), 10)) + ":" + pad(parseInt(e.slice(-2), 10));
        const ree = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        days.forEach((d) => {
            (base[d] || []).forEach((b) => {
                if (ree.test(b.task || "")) { b.start = s; b.end = e; }
            });
        });
    }

    if (/\badd\b|\bput\b/.test(t)) {
        const addMatch = t.match(/(?:add|put)\s+([a-z][a-z0-9\/\s]{1,24}?)\s+(\d{1,2}(?::\d{2})?\s*[-–]\s*\d{1,2}(?::?\d{2})?)/i);
        if (addMatch) {
            const name = addMatch[1].trim().replace(/\b\w/g, (ch) => ch.toUpperCase());
            let range = addMatch[2].replace(/\s/g, "");
            const rm = range.match(/(\d{1,2})(?::(\d{2}))?[-–](\d{1,2})(?::?(\d{2}))?/);
            let s, e;
            if (rm) {
                s = pad(+rm[1]) + ":" + pad(rm[2] ? +rm[2] : 0);
                if (rm[4] != null) e = pad(+rm[3]) + ":" + pad(+rm[4]);
                else if (String(rm[3]).length >= 3) e = pad(parseInt(String(rm[3]).slice(0, -2), 10)) + ":" + pad(parseInt(String(rm[3]).slice(-2), 10));
                else e = pad(+rm[3]) + ":00";
            }
            const dayMatch = t.match(/\bon\s+(mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:rs|rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)/i);
            let targetDays = days;
            if (dayMatch) {
                const d = dayMap[dayMatch[1].toLowerCase()];
                if (d) targetDays = [d];
            }
            if (s && e) {
                targetDays.forEach((d) => {
                    base[d] = base[d] || [];
                    base[d].push({ task: name, start: s, end: e });
                    base[d].sort((a, b) => String(a.start).localeCompare(String(b.start)));
                });
            }
        }
    }

    days.forEach((d) => {
        const out = [];
        (base[d] || []).forEach((b) => {
            if (out.some((x) => x.task === b.task && x.start === b.start && x.end === b.end)) return;
            if (typeof rangesOverlap === "function" && out.some((x) => rangesOverlap(x.start, x.end, b.start, b.end))) return;
            out.push(b);
        });
        base[d] = out.sort((a, b) => String(a.start).localeCompare(String(b.start)));
    });

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
    // Drop fenced json
    s = s.replace(/```json[\s\S]*?```/gi, "");
    s = s.replace(/```[\s\S]*?```/g, "");
    // Drop raw week JSON dumps
    s = s.replace(/\{\s*"reply"\s*:[\s\S]*$/g, "");
    s = s.replace(/\{\s*"done"\s*:[\s\S]*$/g, "");
    // Remove trailing partial JSON object
    const idx = s.search(/\{\s*"(reply|done|week)"\s*:/);
    if (idx >= 0) s = s.slice(0, idx);
    // Collapse leftover braces lines
    s = s.split("\n").filter((line) => {
        const t = line.trim();
        if (t.startsWith("{") || t.startsWith("}") || t.startsWith('"Monday"') || t.startsWith('"Tuesday"')) return false;
        if (/^\s*"[A-Za-z]+"\s*:\s*\[/.test(t)) return false;
        if (/^\s*\{\s*"task"/.test(t)) return false;
        return true;
    }).join("\n");
    s = s.replace(/\n{3,}/g, "\n\n").trim();
    return s || "Updated.";
}

function ensureSchoolMonSat(week, notes) {
    const text = String(notes || "").toLowerCase();
    // Only real school/college — never "hindi class" / "math class"
    if (!/\bschool\b|\bcollege\b|\buniversity\b/.test(text)) return week;
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

    // Prefer existing School block times; only parse times near the word "school"
    let start = "06:00", end = "14:30";
    let foundExisting = false;
    for (const d of dayNames) {
        const sc = ((week && week[d]) || []).find((b) => /school|college/i.test(b.task || ""));
        if (sc) { start = sc.start; end = sc.end; foundExisting = true; break; }
    }
    if (!foundExisting) {
        let schoolChunk = null;
        const near = text.match(/(?:school|college)[^\n.]{0,48}?(\d{1,4}\s*[-–]\s*\d{1,4}(?::\d{2})?)/i);
        if (near) schoolChunk = near[1];
        if (!schoolChunk) {
            const any = text.match(/(\d{3,4}\s*[-–]\s*\d{3,4}|\d{1,2}\s*[-–]\s*\d{3,4}|\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2})/);
            if (any) schoolChunk = any[1];
        }
        if (schoolChunk && typeof parseTimeTokenLocal === "function") {
            const r = parseTimeTokenLocal(schoolChunk);
            if (r && r.start && r.end && !r.start.startsWith("30:")) {
                start = r.start;
                end = r.end;
            }
        }
    }
    days.forEach((d) => {
        if (!week[d]) week[d] = [];
        const has = week[d].some((b) => /school|college/i.test(b.task || ""));
        if (!has) week[d].push({ task: "School", start, end });
        // Do NOT remove other classes (hindi, science, etc.)
        week[d] = week[d].filter((b) => {
            if (/school|college/i.test(b.task || "")) return true;
            if (/study/i.test(b.task || "") && b.start >= start && b.end <= end) return false;
            return true;
        });
        // Collapse duplicate School rows to the canonical time
        const schools = week[d].filter((b) => /school|college/i.test(b.task || ""));
        if (schools.length > 1) {
            week[d] = week[d].filter((b) => !/school|college/i.test(b.task || ""));
            week[d].push({ task: "School", start, end });
        } else if (schools.length === 1 && foundExisting) {
            // keep existing school times — do not shift to 5-6pm from another class message
            schools[0].start = start;
            schools[0].end = end;
        }
        week[d].sort((a, b) => String(a.start).localeCompare(String(b.start)));
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
    _planAborted = false;
    _planGenId += 1;
    _planSession = { phase: "ai", history: [], fixedNotes: seedText || "", style: "custom", seed: seedText || "", gen: _planGenId };
    return continuePlanSession(
        seedText ||
        "I want a personalised week plan. Ask me about fixed classes, work, or other commitments."
    );
}




function runSilentMomentoAction(act) {
    if (!act || !act.momento_action) return { ok: false, error: "no action" };
    const a = String(act.momento_action).toLowerCase().replace(/\s+/g, "_");
    const args = act.args || {};
    try {
        // --- navigation / pages ---
        if (a === "open_crates" || a === "open_crate" || a === "crates") {
            if (typeof openCratesPage === "function") openCratesPage();
            else if (typeof openCratesModal === "function") openCratesModal();
            return { ok: true, message: "*Opened crates.*" };
        }
        if (a === "close_crates" && typeof closeCratesPage === "function") { closeCratesPage(); return { ok: true }; }
        if (a === "open_customiser" || a === "open_customizer") {
            if (typeof openCustomiser === "function") openCustomiser();
            else if (typeof openAppCustomiser === "function") openAppCustomiser();
            return { ok: true, message: "*Opened customiser.*" };
        }
        if (a === "open_calendar" || a === "calendar") {
            if (typeof openCalendarPage === "function") openCalendarPage();
            return { ok: true, message: "*Opened calendar.*" };
        }
        if (a === "close_calendar" && typeof closeCalendarPage === "function") { closeCalendarPage(); return { ok: true }; }
        if (a === "open_todos" || a === "open_todo" || a === "todos") {
            if (typeof toggleTodoDrawer === "function") {
                try { toggleTodoDrawer(true); } catch (e1) { toggleTodoDrawer(); }
            }
            return { ok: true, message: "*Opened to-dos.*" };
        }
        if (a === "open_themes" || a === "themes") {
            if (typeof openThemePicker === "function") openThemePicker();
            else if (typeof openCustomiser === "function") openCustomiser();
            return { ok: true, message: "*Opened themes.*" };
        }
        if (a === "open_preview" && typeof openPreview === "function") { openPreview(); return { ok: true }; }
        if (a === "open_focus" || a === "focus_mode") {
            if (typeof openFocusMode === "function") openFocusMode();
            else if (typeof startFocusMode === "function") startFocusMode();
            return { ok: true, message: "Focus mode." };
        }
        if (a === "open_analytics" || a === "analytics") {
            if (typeof openAnalytics === "function") openAnalytics();
            else if (typeof renderWeeklyAnalytics === "function") renderWeeklyAnalytics();
            return { ok: true };
        }
        if (a === "open_settings" || a === "settings") {
            if (typeof toggleAppSettings === "function") toggleAppSettings(true);
            return { ok: true, message: "*Opened settings.*" };
        }
        if (a === "toggle_sidebar" || a === "open_tools") {
            if (typeof toggleSidebar === "function") toggleSidebar();
            return { ok: true };
        }
        if (a === "open_music" || a === "music") {
            if (typeof openMusicPanel === "function") openMusicPanel();
            return { ok: true };
        }

        // --- day navigation ---
        if (a === "goto_day" || a === "set_day") {
            const day = String(args.day || args.name || "").toLowerCase();
            const map = { mon:0, monday:0, tue:1, tues:1, tuesday:1, wed:2, wednesday:2, thu:3, thur:3, thursday:3, fri:4, friday:4, sat:5, saturday:5, sun:6, sunday:6 };
            if (day in map && typeof data !== "undefined") {
                data.currentDay = map[day];
                if (typeof renderCurrentDay === "function") renderCurrentDay();
                return { ok: true, message: "Switched to " + day };
            }
            return { ok: false, message: "Unknown day." };
        }
        if (a === "goto_today" || a === "today") {
            if (typeof getTodayIndex === "function" && typeof data !== "undefined") {
                data.currentDay = getTodayIndex();
                if (typeof renderCurrentDay === "function") renderCurrentDay();
            }
            return { ok: true, message: "Showing today." };
        }

        // --- themes / sound ---
        if (a === "set_theme" && args.theme) {
            if (typeof applyTheme === "function") applyTheme(args.theme);
            else if (typeof setTheme === "function") setTheme(args.theme);
            return { ok: true, message: "Theme set." };
        }
        if (a === "toggle_sound" || a === "sound") {
            if (typeof data !== "undefined") {
                data.soundEnabled = args.on != null ? !!args.on : !data.soundEnabled;
                if (typeof saveData === "function") saveData();
            }
            return { ok: true };
        }

        // --- presets ---
        if (a === "apply_preset" && args.name) {
            if (typeof applyPresetByName === "function") applyPresetByName(args.name);
            else if (typeof applyPreset === "function") applyPreset(args.name);
            return { ok: true, message: "Applied preset " + args.name };
        }

        // --- todos ---
        if (a === "add_todo" || a === "create_todo") {
            const text = String(args.text || args.title || args.todo || "").trim();
            if (!text) return { ok: false, message: "Missing to-do text." };
            try { if (typeof ensureCrateData === "function") ensureCrateData(); } catch (e) {}
            if (typeof data === "undefined") return { ok: false, error: "no data" };
            data.todos = data.todos || [];
            const maxTodos = 5 + (Number(data.todoSlotBonus) || 0);
            const active = data.todos.filter((x) => !x.completed).length;
            if (active >= maxTodos) {
                return { ok: false, message: "Sorry — to-do limit reached (" + maxTodos + "). Complete some or buy extra slots in App Customiser." };
            }
            let due = args.due || args.dueDate || null;
            if (!due) {
                const d = new Date();
                d.setDate(d.getDate() + (args.daysFromNow != null ? Number(args.daysFromNow) : 1));
                const pad = (n) => String(n).padStart(2, "0");
                due = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
            }
            data.todos.push({
                id: Date.now() + Math.random().toString(36).slice(2, 7),
                text, completed: false,
                created: new Date().toISOString(), createdAt: Date.now(),
                dueDate: due, penaltyApplied: false
            });
            try { if (typeof saveData === "function") saveData(); } catch (e) {}
            try { if (typeof renderTodos === "function") renderTodos(); } catch (e) {}
            try { if (typeof toggleTodoDrawer === "function") toggleTodoDrawer(true); } catch (e) {}
            return { ok: true, message: "Added to-do: " + text + " (due " + due + ")" };
        }
        if (a === "complete_todo" && args.text) {
            const t = (data.todos || []).find((x) => !x.completed && String(x.text).toLowerCase().includes(String(args.text).toLowerCase()));
            if (t && typeof toggleTodo === "function") { toggleTodo(t.id); return { ok: true, message: "Marked to-do done." }; }
            return { ok: false, message: "To-do not found." };
        }

        // --- schedule blocks ---
        if (a === "add_block" || a === "add_task") {
            const dayName = args.day || (typeof DAYS !== "undefined" ? DAYS[data.currentDay] : "Monday");
            const task = String(args.task || args.name || "Block");
            const start = String(args.start || "09:00").slice(0, 5);
            const end = String(args.end || "10:00").slice(0, 5);
            if (typeof data === "undefined") return { ok: false };
            if (!data.schedules[dayName]) data.schedules[dayName] = [];
            data.schedules[dayName].push({ task, start, end, completed: false, xpAwarded: false, xpAmount: 0, isSleep: !!args.isSleep });
            data.schedules[dayName].sort((a, b) => String(a.start).localeCompare(String(b.start)));
            try { saveData(); renderCurrentDay(); } catch (e) {}
            return { ok: true, message: "Added " + task + " on " + dayName };
        }
        if (a === "remove_block" || a === "delete_block") {
            const dayName = args.day || (typeof DAYS !== "undefined" ? DAYS[data.currentDay] : "Monday");
            const name = String(args.task || args.name || "").toLowerCase();
            if (!name || !data.schedules[dayName]) return { ok: false, message: "Nothing to remove." };
            const before = data.schedules[dayName].length;
            data.schedules[dayName] = data.schedules[dayName].filter((b) => !String(b.task).toLowerCase().includes(name));
            try { saveData(); renderCurrentDay(); } catch (e) {}
            return { ok: true, message: "Removed " + (before - data.schedules[dayName].length) + " block(s)." };
        }
        if (a === "check_block" || a === "complete_block") {
            const dayName = args.day || (typeof DAYS !== "undefined" ? DAYS[data.currentDay] : "Monday");
            const name = String(args.task || args.name || "").toLowerCase();
            const list = data.schedules[dayName] || [];
            const b = list.find((x) => String(x.task).toLowerCase().includes(name));
            if (b) {
                b.completed = true;
                if (typeof awardXPForTask === "function" && !b.xpAwarded && !b.isSleep) awardXPForTask(b);
                try { saveData(); renderCurrentDay(); } catch (e) {}
                return { ok: true, message: "Checked off " + b.task };
            }
            return { ok: false, message: "Block not found." };
        }

        // --- crates ---
        if (a === "open_crate_tier" && args.tier && typeof openCrateTier === "function") {
            openCrateTier(args.tier);
            return { ok: true };
        }

        // --- week builder ---
        if (a === "start_week_builder" || a === "generate_study_week") {
            if (typeof processNLPIntent === "function") processNLPIntent("generate study week");
            return { ok: true, message: "Opening week builder." };
        }

        return { ok: false, error: "unknown action", message: "I can't do that action yet." };
    } catch (e) {
        console.warn("silent action", e);
        return { ok: false, error: String(e.message || e) };
    }
}


async function callPersonalChatbot(userText) {
    const settings = (typeof getAppSettings === "function") ? getAppSettings() : {};
    if (!settings.usePersonalForChat || !settings.personalApiKey || !settings.personalApiUrl) return null;
    const overview = `You are Momento's in-app assistant (weekly time-block planner with XP, ranks, crates, themes, todos, calendar, focus).
Speak like a helpful product guide. NEVER list internal function names, action ids, or JSON schemas to the user.
When the user asks you to DO something in the app, end your reply with ONE silent JSON line the UI will strip (user must not see it), for example:
{"momento_action":"open_crates","args":{}}
{"momento_action":"open_todos","args":{}}
{"momento_action":"open_calendar","args":{}}
{"momento_action":"open_customiser","args":{}}
{"momento_action":"open_settings","args":{}}
{"momento_action":"goto_today","args":{}}
{"momento_action":"goto_day","args":{"day":"monday"}}
{"momento_action":"add_todo","args":{"text":"...","due":"YYYY-MM-DD"}}
{"momento_action":"add_block","args":{"day":"Monday","task":"Study","start":"16:00","end":"17:30"}}
{"momento_action":"remove_block","args":{"day":"Monday","task":"Gym"}}
{"momento_action":"check_block","args":{"day":"Monday","task":"Homework"}}
{"momento_action":"set_theme","args":{"theme":"..."}}
{"momento_action":"start_week_builder","args":{}}
Only emit that JSON when you are actually performing an action. If a limit blocks it, say so in plain language — never invent success.
Reply in clear markdown.`;
    try {
        const body = {
            model: settings.personalApiModel || "gpt-4o-mini",
            temperature: 0.4,
            messages: [
                { role: "system", content: overview },
                { role: "user", content: String(userText || "").slice(0, 4000) }
            ]
        };
        const res = await fetch(settings.personalApiUrl.replace(/\/$/, "") + "/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + settings.personalApiKey
            },
            body: JSON.stringify(body)
        });
        const j = await res.json().catch(() => ({}));
        if (res.status === 429 || (j.error && /rate|too many/i.test(String(j.error.message || j.error)))) {
            return "⏳ **Rate limit reached** on your personal model. Wait about a minute, then try again. Your last message was not processed.";
        }
        if (!res.ok) {
            return "Personal AI error: " + ((j.error && j.error.message) || res.status) + ". Check key / model / URL in Settings.";
        }
        let raw = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "";
        const lines = String(raw).split("\n");
        const kept = [];
        const actionNotes = [];
        for (const line of lines) {
            const t = line.trim();
            if (t.startsWith("{") && t.includes("momento_action")) {
                try {
                    const act = JSON.parse(t);
                    const result = runSilentMomentoAction(act);
                    if (result && result.ok === false && result.message) actionNotes.push(result.message);
                    else if (result && result.ok && result.message) actionNotes.push(result.message);
                } catch (e) { kept.push(line); }
            } else kept.push(line);
        }
        let out = kept.join("\n").trim();
        // Strip model fluff that only announces an action we already ran
        if (actionNotes.length) {
            const note = actionNotes.map(function (n) {
                const t = String(n).trim();
                if (/^\*/.test(t)) return t;
                return "*" + t.replace(/\.$/, "") + ".*";
            }).join(" ");
            // If model only said "sure opening..." keep the clean note
            if (!out || /^(sure|ok|okay|done|opening|here|i'?ll)\b/i.test(out) && out.length < 120) {
                return note;
            }
            return out + "\n\n" + note;
        }
        return out || "*Done.*";
    } catch (e) {
        console.warn("[personal chat]", e);
        return "Personal AI failed: " + (e.message || e);
    }
}

function processNLPIntent(rawInput) {
    if (!rawInput || !String(rawInput).trim()) return;
    const input = rawInput.trim();
    const lower = input.toLowerCase();

    // Fast local automation (no API) for common UI commands
    const quick = [
        { re: /\b(open|show)\s+(the\s+)?crates?\b/, act: { momento_action: "open_crates" } },
        { re: /\b(open|show)\s+(the\s+)?(to-?dos?|todo list)\b/, act: { momento_action: "open_todos" } },
        { re: /\b(open|show)\s+(the\s+)?calendar\b/, act: { momento_action: "open_calendar" } },
        { re: /\b(open|show)\s+(the\s+)?(customiser|customizer|settings)\b/, act: { momento_action: "open_settings" } },
        { re: /\b(open|show)\s+(the\s+)?themes?\b/, act: { momento_action: "open_themes" } },
        { re: /\bgo to today\b|\bshow today\b/, act: { momento_action: "goto_today" } },
    ];
    for (const q of quick) {
        if (q.re.test(lower)) {
            const r = runSilentMomentoAction(q.act);
            const msg = (r && r.message) ? r.message : (r && r.ok ? "*Done.*" : "Could not do that.");
            appendMessage(msg, "bot-msg");
            return;
        }
    }

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


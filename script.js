/* =========================================================
   MOMENTO - ULTIMATE TIME BLOCK SCHEDULER (V5 COMPLETE)
   ========================================================= */

const BUILT_IN_PRESETS = {
    "Student Daily Routine": {
        Monday: [
            { start: "07:00", end: "08:00", activity: "Wake up & Breakfast" },
            { start: "08:00", end: "15:00", activity: "School / College Classes" },
            { start: "15:00", end: "16:00", activity: "Lunch & Relaxation" },
            { start: "16:00", end: "18:00", activity: "Study & Homework" },
            { start: "18:00", end: "19:30", activity: "Exercise & Outdoor Activity" },
            { start: "19:30", end: "20:30", activity: "Dinner" },
            { start: "20:30", end: "22:00", activity: "Gaming / Free Time & Read" }
        ],
        Tuesday: [
            { start: "07:00", end: "08:00", activity: "Wake up & Breakfast" },
            { start: "08:00", end: "15:00", activity: "School / College Classes" },
            { start: "15:00", end: "16:00", activity: "Lunch & Relaxation" },
            { start: "16:00", end: "18:00", activity: "Study & Homework" },
            { start: "18:00", end: "19:30", activity: "Exercise & Outdoor Activity" },
            { start: "19:30", end: "20:30", activity: "Dinner" },
            { start: "20:30", end: "22:00", activity: "Gaming / Free Time & Read" }
        ],
        Wednesday: [
            { start: "07:00", end: "08:00", activity: "Wake up & Breakfast" },
            { start: "08:00", end: "15:00", activity: "School / College Classes" },
            { start: "15:00", end: "16:00", activity: "Lunch & Relaxation" },
            { start: "16:00", end: "18:00", activity: "Study & Homework" },
            { start: "18:00", end: "19:30", activity: "Exercise & Outdoor Activity" },
            { start: "19:30", end: "20:30", activity: "Dinner" },
            { start: "20:30", end: "22:00", activity: "Gaming / Free Time & Read" }
        ],
        Thursday: [
            { start: "07:00", end: "08:00", activity: "Wake up & Breakfast" },
            { start: "08:00", end: "15:00", activity: "School / College Classes" },
            { start: "15:00", end: "16:00", activity: "Lunch & Relaxation" },
            { start: "16:00", end: "18:00", activity: "Study & Homework" },
            { start: "18:00", end: "19:30", activity: "Exercise & Outdoor Activity" },
            { start: "19:30", end: "20:30", activity: "Dinner" },
            { start: "20:30", end: "22:00", activity: "Gaming / Free Time & Read" }
        ],
        Friday: [
            { start: "07:00", end: "08:00", activity: "Wake up & Breakfast" },
            { start: "08:00", end: "15:00", activity: "School / College Classes" },
            { start: "15:00", end: "16:00", activity: "Lunch & Relaxation" },
            { start: "16:00", end: "18:00", activity: "Study & Homework" },
            { start: "18:00", end: "19:30", activity: "Exercise & Outdoor Activity" },
            { start: "19:30", end: "20:30", activity: "Dinner" },
            { start: "20:30", end: "22:00", activity: "Weekend Movie / Gaming" }
        ],
        Saturday: [
            { start: "08:30", end: "09:30", activity: "Breakfast" },
            { start: "09:30", end: "12:00", activity: "Study & Revision" },
            { start: "12:00", end: "13:00", activity: "Lunch" },
            { start: "13:00", end: "17:00", activity: "Gaming / Personal Time" },
            { start: "17:00", end: "19:00", activity: "Sports & Exercise" },
            { start: "19:00", end: "20:30", activity: "Dinner & Relax" },
            { start: "20:30", end: "22:30", activity: "Free Time" }
        ],
        Sunday: [
            { start: "09:00", end: "10:00", activity: "Late Breakfast" },
            { start: "10:00", end: "12:30", activity: "Free Time & Hobbies" },
            { start: "12:30", end: "13:30", activity: "Lunch" },
            { start: "13:30", end: "15:30", activity: "Light Study & Prep for Week" },
            { start: "15:30", end: "18:00", activity: "Relax & Wind Down" },
            { start: "18:00", end: "19:30", activity: "Exercise / Walk" },
            { start: "19:30", end: "20:30", activity: "Dinner" },
            { start: "20:30", end: "22:00", activity: "Read" }
        ]
    },

    "9-to-5 Work & Productivity": {
        Monday: [
            { start: "07:00", end: "08:00", activity: "Morning Exercise & Breakfast" },
            { start: "08:00", end: "09:00", activity: "Commute / Prep Workday" },
            { start: "09:00", end: "12:00", activity: "Deep Work / Focus Blocks" },
            { start: "12:00", end: "13:00", activity: "Lunch Break" },
            { start: "13:00", end: "17:00", activity: "Meetings & Collaborative Work" },
            { start: "17:00", end: "18:30", activity: "Exercise & Unwind" },
            { start: "18:30", end: "19:30", activity: "Dinner" },
            { start: "19:30", end: "22:00", activity: "Relax & Personal Projects" }
        ],
        Tuesday: [
            { start: "07:00", end: "08:00", activity: "Morning Exercise & Breakfast" },
            { start: "08:00", end: "09:00", activity: "Commute / Prep Workday" },
            { start: "09:00", end: "12:00", activity: "Deep Work / Focus Blocks" },
            { start: "12:00", end: "13:00", activity: "Lunch Break" },
            { start: "13:00", end: "17:00", activity: "Meetings & Collaborative Work" },
            { start: "17:00", end: "18:30", activity: "Exercise & Unwind" },
            { start: "18:30", end: "19:30", activity: "Dinner" },
            { start: "19:30", end: "22:00", activity: "Relax & Personal Projects" }
        ],
        Wednesday: [
            { start: "07:00", end: "08:00", activity: "Morning Exercise & Breakfast" },
            { start: "08:00", end: "09:00", activity: "Commute / Prep Workday" },
            { start: "09:00", end: "12:00", activity: "Deep Work / Focus Blocks" },
            { start: "12:00", end: "13:00", activity: "Lunch Break" },
            { start: "13:00", end: "17:00", activity: "Meetings & Collaborative Work" },
            { start: "17:00", end: "18:30", activity: "Exercise & Unwind" },
            { start: "18:30", end: "19:30", activity: "Dinner" },
            { start: "19:30", end: "22:00", activity: "Relax & Personal Projects" }
        ],
        Thursday: [
            { start: "07:00", end: "08:00", activity: "Morning Exercise & Breakfast" },
            { start: "08:00", end: "09:00", activity: "Commute / Prep Workday" },
            { start: "09:00", end: "12:00", activity: "Deep Work / Focus Blocks" },
            { start: "12:00", end: "13:00", activity: "Lunch Break" },
            { start: "13:00", end: "17:00", activity: "Meetings & Collaborative Work" },
            { start: "17:00", end: "18:30", activity: "Exercise & Unwind" },
            { start: "18:30", end: "19:30", activity: "Dinner" },
            { start: "19:30", end: "22:00", activity: "Relax & Personal Projects" }
        ],
        Friday: [
            { start: "07:00", end: "08:00", activity: "Morning Exercise & Breakfast" },
            { start: "08:00", end: "09:00", activity: "Commute / Prep Workday" },
            { start: "09:00", end: "12:00", activity: "Deep Work / Focus Blocks" },
            { start: "12:00", end: "13:00", activity: "Lunch Break" },
            { start: "13:00", end: "17:00", activity: "Wrap Up Weekly Tasks" },
            { start: "17:00", end: "18:30", activity: "Exercise & Unwind" },
            { start: "18:30", end: "20:00", activity: "Dinner" },
            { start: "20:00", end: "23:00", activity: "Weekend Social & Chill" }
        ],
        Saturday: [
            { start: "08:30", end: "09:30", activity: "Breakfast" },
            { start: "09:30", end: "12:30", activity: "Hobbies & Side Projects" },
            { start: "12:30", end: "13:30", activity: "Lunch" },
            { start: "13:30", end: "18:00", activity: "Free Time & Outings" },
            { start: "18:00", end: "19:30", activity: "Physical Activity" },
            { start: "19:30", end: "21:00", activity: "Dinner" }
        ],
        Sunday: [
            { start: "09:00", end: "10:00", activity: "Breakfast" },
            { start: "10:00", end: "13:00", activity: "Relax & Media" },
            { start: "13:00", end: "14:00", activity: "Lunch" },
            { start: "14:00", end: "17:00", activity: "Personal Errand / Planning" },
            { start: "17:00", end: "18:30", activity: "Exercise / Walk" },
            { start: "18:30", end: "20:00", activity: "Dinner" },
            { start: "20:00", end: "22:00", activity: "Read & Wind Down" }
        ]
    },

    "Intensive Exam Prep": {
        Monday: [
            { start: "07:30", end: "08:30", activity: "Breakfast & Morning Prep" },
            { start: "08:30", end: "11:30", activity: "Study Block 1 (Core Subject)" },
            { start: "11:30", end: "12:00", activity: "Break / Walk" },
            { start: "12:00", end: "13:30", activity: "Study Block 2 (Revision)" },
            { start: "13:30", end: "14:30", activity: "Lunch Break" },
            { start: "14:30", end: "17:00", activity: "Study Block 3 (Practice Tests)" },
            { start: "17:00", end: "18:30", activity: "Exercise & Outdoor Break" },
            { start: "18:30", end: "19:30", activity: "Study Block 4 (Light Review)" },
            { start: "19:30", end: "20:30", activity: "Dinner" },
            { start: "20:30", end: "22:00", activity: "Relax & Read" }
        ],
        Tuesday: [
            { start: "07:30", end: "08:30", activity: "Breakfast & Morning Prep" },
            { start: "08:30", end: "11:30", activity: "Study Block 1 (Core Subject)" },
            { start: "11:30", end: "12:00", activity: "Break / Walk" },
            { start: "12:00", end: "13:30", activity: "Study Block 2 (Revision)" },
            { start: "13:30", end: "14:30", activity: "Lunch Break" },
            { start: "14:30", end: "17:00", activity: "Study Block 3 (Practice Tests)" },
            { start: "17:00", end: "18:30", activity: "Exercise & Outdoor Break" },
            { start: "18:30", end: "19:30", activity: "Study Block 4 (Light Review)" },
            { start: "19:30", end: "20:30", activity: "Dinner" },
            { start: "20:30", end: "22:00", activity: "Relax & Read" }
        ],
        Wednesday: [
            { start: "07:30", end: "08:30", activity: "Breakfast & Morning Prep" },
            { start: "08:30", end: "11:30", activity: "Study Block 1 (Core Subject)" },
            { start: "11:30", end: "12:00", activity: "Break / Walk" },
            { start: "12:00", end: "13:30", activity: "Study Block 2 (Revision)" },
            { start: "13:30", end: "14:30", activity: "Lunch Break" },
            { start: "14:30", end: "17:00", activity: "Study Block 3 (Practice Tests)" },
            { start: "17:00", end: "18:30", activity: "Exercise & Outdoor Break" },
            { start: "18:30", end: "19:30", activity: "Study Block 4 (Light Review)" },
            { start: "19:30", end: "20:30", activity: "Dinner" },
            { start: "20:30", end: "22:00", activity: "Relax & Read" }
        ],
        Thursday: [
            { start: "07:30", end: "08:30", activity: "Breakfast & Morning Prep" },
            { start: "08:30", end: "11:30", activity: "Study Block 1 (Core Subject)" },
            { start: "11:30", end: "12:00", activity: "Break / Walk" },
            { start: "12:00", end: "13:30", activity: "Study Block 2 (Revision)" },
            { start: "13:30", end: "14:30", activity: "Lunch Break" },
            { start: "14:30", end: "17:00", activity: "Study Block 3 (Practice Tests)" },
            { start: "17:00", end: "18:30", activity: "Exercise & Outdoor Break" },
            { start: "18:30", end: "19:30", activity: "Study Block 4 (Light Review)" },
            { start: "19:30", end: "20:30", activity: "Dinner" },
            { start: "20:30", end: "22:00", activity: "Relax & Read" }
        ],
        Friday: [
            { start: "07:30", end: "08:30", activity: "Breakfast & Morning Prep" },
            { start: "08:30", end: "11:30", activity: "Study Block 1 (Core Subject)" },
            { start: "11:30", end: "12:00", activity: "Break / Walk" },
            { start: "12:00", end: "13:30", activity: "Study Block 2 (Revision)" },
            { start: "13:30", end: "14:30", activity: "Lunch Break" },
            { start: "14:30", end: "17:00", activity: "Study Block 3 (Practice Tests)" },
            { start: "17:00", end: "18:30", activity: "Exercise & Outdoor Break" },
            { start: "18:30", end: "19:30", activity: "Study Block 4 (Light Review)" },
            { start: "19:30", end: "20:30", activity: "Dinner" },
            { start: "20:30", end: "22:00", activity: "Relax & Read" }
        ],
        Saturday: [
            { start: "08:00", end: "09:00", activity: "Breakfast" },
            { start: "09:00", end: "12:00", activity: "Study Mock Exam" },
            { start: "12:00", end: "13:00", activity: "Lunch" },
            { start: "13:00", end: "16:00", activity: "Gaming / Free Time Break" },
            { start: "16:00", end: "18:00", activity: "Light Study & Review Errors" },
            { start: "18:00", end: "19:30", activity: "Exercise & Walk" },
            { start: "19:30", end: "20:30", activity: "Dinner" },
            { start: "20:30", end: "22:00", activity: "Relax" }
        ],
        Sunday: [
            { start: "08:30", end: "09:30", activity: "Breakfast" },
            { start: "09:30", end: "12:00", activity: "Study Summary & Prep for Next Week" },
            { start: "12:00", end: "13:00", activity: "Lunch" },
            { start: "13:00", end: "18:00", activity: "Rest & Recovery (Do whatever)" },
            { start: "18:00", end: "19:30", activity: "Light Physical Activity / Walk" },
            { start: "19:30", end: "20:30", activity: "Dinner" },
            { start: "20:30", end: "22:00", activity: "Read" }
        ]
    }
};

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

const STORAGE_KEY = "SyncDay_data_v5";

const CATEGORY_KEYWORDS = {
    "📚 Study/Work": [
        "school", "study", "revise", "revision", "class", "hw", "homework",
        "science", "maths", "math", "hindi", "exam", "read", "reading",
        "lecture", "notes", "flashcard", "anki", "assignment", "quiz",
        "mock", "past paper", "syllabus", "subject", "tutor", "tutorial", "focus block", "focus",
        "do work", "job", "office", "meeting", "email", "client", "project",
        "sprint", "coding", "code", "dev", "deploy", "deadline", "report",
        "presentation", "freelance", "business", "startup", "manager"
    ],
    "🏃 Exercise": [
        "football", "exercise", "physical", "play down", "sport", "sports",
        "gym", "workout", "fitness", "cardio", "run", "running", "jog",
        "jogging", "walk", "walking", "swim", "swimming", "cycling",
        "yoga", "pilates", "hiit", "crossfit", "training", "weights",
        "lifting", "stretch", "stretching", "basketball", "tennis"
    ],
    "🎮 Gaming/Relax": [
        "minecraft", "gaming", "game", "games", "relax", "relaxing", "tv",
        "do whatever", "free time", "wind down", "chill", "chilling",
        "you time", "hobby", "hobbies", "leisure", "nap", "rest",
        "youtube", "netflix", "movie", "music", "podcast", "reading for fun"
    ],
    "🍔 Food": [
        "food", "dinner", "lunch", "breakfast", "eat", "eating", "snack",
        "meal", "cook", "cooking", "brunch", "supper", "takeaway", "takeout"
    ],
    "🌅 Morning/Routine": [
        "morning routine", "morning", "wake up", "get ready", "shower",
        "brush", "routine", "get up", "prepare"
    ],
    "😴 Rest": [
        "sleep", "nap", "rest", "bed", "bedtime", "zzz", "sleep 😴"
    ]
};

/* APP STATE */
let data = {
    schedules: {},
    notes: {},
    presets: {},
    currentDay: getTodayIndex(),
    appliedRoutine: "Custom",
    lastResetWeek: getWeekIdentifier(),
    notificationsEnabled: true,
    theme: { color: "#6c5ce7", hover: "#5b4cc4", alpha: "rgba(108, 92, 231, 0.25)" },
    xp: 0,
    streak: 0,
    lastCompletedDate: null,
    totalTasksCompleted: 0,
    todos: [],         
    rewardsUnlocked: [], 
    preferredChime: "default"
};

let currentActiveTaskName = null;
let draggedRowIndex = null;
let scratchPresetData = {};
let activeBuilderDay = "Monday";

/* STARTUP */
document.addEventListener("DOMContentLoaded", () => {
    loadData();
    checkAutoWeeklyReset();
    ensureDays();
    applySavedTheme();
    buildDayTabs();
    populatePresetMenus();
    renderPresetsManager();
    renderCurrentDay();
    updateClock();
    updateXPDisplay();
    renderThemeSwatches();
    renderChimeSwatches();
    updateFeatureLocks();
    if (typeof initLocalLibrary === "function") initLocalLibrary();

    /* SIDEBAR HOVER & TOGGLE LISTENERS */
    const sidebar = document.getElementById("preset-sidebar");
    const arrow = document.getElementById("sidebar-arrow");

    if (sidebar && arrow) {
        sidebar.addEventListener("mouseenter", () => {
            arrow.textContent = "▶";
        });

        sidebar.addEventListener("mouseleave", () => {
            arrow.textContent = "◀";
        });
    }

    setInterval(() => {
        updateClock();
        updateActiveTask();
        updateNextTask();
    }, 1000);
});


/* =========================================================
   STARTER WEEK TEMPLATE GENERATOR
   ========================================================= */

   
function generateFilledWeek() {
    const filledWeek = {};

    // Standard Weekday Schedule Template
    const weekdayTemplate = [
        { title: "Morning Routine & Coffee", start: "08:00", end: "09:00", tag: "Health", completed: false },
        { title: "Deep Work Focus Block", start: "09:30", end: "12:00", tag: "Work", completed: false },
        { title: "Lunch Break", start: "12:00", end: "13:00", tag: "General", completed: false },
        { title: "Projects & Meetings", start: "13:30", end: "16:30", tag: "Work", completed: false },
        { title: "Evening Review & Reset", start: "18:00", end: "19:00", tag: "Personal", completed: false }
    ];

    // Relaxed Weekend Schedule Template
    const weekendTemplate = [
        { title: "Morning Workout & Breakfast", start: "09:00", end: "10:30", tag: "Health", completed: false },
        { title: "Hobbies & Personal Time", start: "11:00", end: "14:00", tag: "Personal", completed: false },
        { title: "Social & Chill Time", start: "16:00", end: "19:00", tag: "General", completed: false }
    ];

    // Build unique task objects for all 7 days
    DAYS.forEach(day => {
        const isWeekend = (day === "Saturday" || day === "Sunday");
        const template = isWeekend ? weekendTemplate : weekdayTemplate;

        filledWeek[day] = template.map((task, index) => ({
            id: `block_${day.slice(0, 3)}_${Date.now()}_${index}`,
            task: task.title,
            start: task.start,
            end: task.end,
            completed: task.completed
        }));
    });

    return filledWeek;
}

/* HELPERS */
function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

function getTodayIndex() {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
}

function timeToMinutes(time) {
    if (!time || !time.includes(":")) return 99999;
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

function getWeekIdentifier() {
    const now = new Date();
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return `${d.getUTCFullYear()}-W${Math.ceil((((d - yearStart) / 86400000) + 1) / 7)}`;
}

function detectCategory(taskText) {
    if (!taskText) return "📌 General";
    const lower = taskText.toLowerCase();
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(kw => lower.includes(kw))) return cat;
    }
    return "📌 General";
}

/* NAVIGATION CONTROLS */
function changeDay(amount) {
    data.currentDay += amount;
    if (data.currentDay < 0) data.currentDay = 6;
    if (data.currentDay > 6) data.currentDay = 0;
    renderCurrentDay();
}

function goToToday() {
    data.currentDay = getTodayIndex();
    renderCurrentDay();
}

function copyCurrentDayTo() {
    const sourceDay = DAYS[data.currentDay];
    const targetName = prompt(`Copy schedule from ${sourceDay} to which day?\n\nType: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, or Sunday`);
    if (!targetName) return;

    const matchedDay = DAYS.find(d => d.toLowerCase() === targetName.trim().toLowerCase());
    if (!matchedDay || matchedDay === sourceDay) return alert("Invalid or same target day.");

    data.schedules[matchedDay] = deepClone(data.schedules[sourceDay]);
    saveData();
    showSavedMessage(`✓ Copied ${sourceDay} schedule to ${matchedDay}!`);
    renderWeeklyAnalytics();
}

/* AUTO WEEKLY RESET */
function checkAutoWeeklyReset() {
    const currentWeek = getWeekIdentifier();
    if (data.lastResetWeek && data.lastResetWeek !== currentWeek) {
        DAYS.forEach(day => {
            if (Array.isArray(data.schedules[day])) {
                data.schedules[day].forEach(t => t.completed = false);
            }
            data.notes[day] = "";
        });
        data.lastResetWeek = currentWeek;
        saveData();
        setTimeout(() => showSavedMessage("🧹 New week detected! Checklist auto-reset."), 1000);
    } else {
        data.lastResetWeek = currentWeek;
        saveData();
    }
}

/* LOAD / SAVE DATA */
function convertPreset(preset) {
    const converted = {};
    DAYS.forEach(day => {
        converted[day] = (preset[day] || []).map(item => ({
            start: item.start,
            end: item.end,
            task: item.activity || "",
            completed: false
        }));
    });
    return converted;
}

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            data.schedules = parsed.schedules || {};
            data.notes = parsed.notes || {};
            data.presets = parsed.presets || {};
            data.currentDay = getTodayIndex();
            data.appliedRoutine = parsed.appliedRoutine || "Custom";
            data.lastResetWeek = parsed.lastResetWeek || getWeekIdentifier();
            data.notificationsEnabled = !!parsed.notificationsEnabled;
            data.theme = parsed.theme || data.theme;
            data.xp = parsed.xp || 0;
            data.streak = parsed.streak || 0;
            data.lastCompletedDate = parsed.lastCompletedDate || null;
            data.totalTasksCompleted = parsed.totalTasksCompleted || 0;
            data.todos = Array.isArray(parsed.todos) ? parsed.todos : [];
            data.rewardsUnlocked = Array.isArray(parsed.rewardsUnlocked) ? parsed.rewardsUnlocked : [];
            data.themeId = parsed.themeId || "purple";
            data.preferredChime = parsed.preferredChime || "default";
        }
    } catch (error) {
        console.error("Could not load Momento data:", error);
    }
    try { if (typeof syncRewardsToLevel === "function") syncRewardsToLevel(); } catch (e) {}

    Object.entries(BUILT_IN_PRESETS).forEach(([name, preset]) => {
        if (!data.presets[name]) {
            data.presets[name] = convertPreset(preset);
        }
    });

    ensureDays();
    saveData();
}

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("Could not save Momento data:", error);
    }
}

function ensureDays() {
    DAYS.forEach(day => {
        if (!Array.isArray(data.schedules[day])) data.schedules[day] = [];
        if (typeof data.notes[day] !== "string") data.notes[day] = "";
    });
}

/* THEME SYSTEM — full page recolor + locked rewards */
const THEME_CATALOG = [
    // Only Purple starts unlocked
    { id: "purple", name: "Purple", color: "#6c5ce7", hover: "#5b4cc4", alpha: "rgba(108,92,231,0.25)",
      bg: "#120f1d", card: "#1a1528", border: "#2d2250", text: "#e2def8", muted: "#6e6a8a", unlocked: true },
    { id: "cyan", name: "Cyan", color: "#00cec9", hover: "#00b894", alpha: "rgba(0,206,201,0.25)",
      bg: "#0d1520", card: "#12202b", border: "#1a3540", text: "#e0f7f6", muted: "#5a8a88", rewardId: "theme_cyan" },
    { id: "coral", name: "Coral", color: "#ff7675", hover: "#d63031", alpha: "rgba(255,118,117,0.25)",
      bg: "#1a1014", card: "#24161c", border: "#3d2530", text: "#fce8e8", muted: "#8a6a6a", rewardId: "theme_coral" },
    { id: "amber", name: "Amber", color: "#fdcb6e", hover: "#e17055", alpha: "rgba(253,203,110,0.25)",
      bg: "#1a1610", card: "#241f14", border: "#3d3520", text: "#faf3e0", muted: "#8a7a5a", rewardId: "theme_amber" },
    { id: "green", name: "Green", color: "#00b894", hover: "#009432", alpha: "rgba(0,184,148,0.25)",
      bg: "#0d1814", card: "#12241e", border: "#1a3a30", text: "#e0f5ee", muted: "#5a8a7a", rewardId: "theme_green" },
    { id: "rose", name: "Rose", color: "#e84393", hover: "#c0306e", alpha: "rgba(232,67,147,0.25)",
      bg: "#180f16", card: "#22141e", border: "#3a2535", text: "#fce8f4", muted: "#8a5a78", rewardId: "theme_rose" },
    { id: "gold", name: "Gold", color: "#f9ca24", hover: "#f0932b", alpha: "rgba(249,202,36,0.25)",
      bg: "#1a1608", card: "#242010", border: "#3d3520", text: "#faf6e0", muted: "#8a8050", rewardId: "theme_gold" },
    { id: "neon", name: "Neon", color: "#00cec9", hover: "#e84393", alpha: "rgba(0,206,201,0.3)",
      bg: "#0a0a18", card: "#12122a", border: "#2a2a50", text: "#e8e8ff", muted: "#6a6a9a", rewardId: "theme_neon" },
    { id: "ocean", name: "Ocean", color: "#0984e3", hover: "#0652dd", alpha: "rgba(9,132,227,0.25)",
      bg: "#0a1220", card: "#101c30", border: "#1a3050", text: "#e0eefc", muted: "#5a7a9a", rewardId: "theme_ocean" },
    { id: "forest", name: "Forest", color: "#27ae60", hover: "#1e8449", alpha: "rgba(39,174,96,0.25)",
      bg: "#0c1610", card: "#14241a", border: "#1e3a28", text: "#e0f5e8", muted: "#5a8a6a", rewardId: "theme_forest" },
    { id: "midnight", name: "Midnight", color: "#5f27cd", hover: "#341f97", alpha: "rgba(95,39,205,0.3)",
      bg: "#080612", card: "#100e1c", border: "#1e1830", text: "#ddd6f0", muted: "#6a6288", rewardId: "theme_midnight" },
    { id: "sunset", name: "Sunset", color: "#e17055", hover: "#d35400", alpha: "rgba(225,112,85,0.3)",
      bg: "linear-gradient(160deg,#1a0e10 0%,#1a1210 50%,#141018 100%)", card: "#241816", border: "#3d2820",
      text: "#fceee8", muted: "#8a6a5a", rewardId: "theme_sunset", gradient: true },
    { id: "aurora", name: "Aurora", color: "#00cec9", hover: "#6c5ce7", alpha: "rgba(0,206,201,0.3)",
      bg: "linear-gradient(160deg,#0a1520 0%,#101028 50%,#0e1a18 100%)", card: "#121a28", border: "#1a3050",
      text: "#e0f8f6", muted: "#5a8a88", rewardId: "theme_aurora", gradient: true },
    { id: "candy", name: "Candy", color: "#fd79a8", hover: "#e84393", alpha: "rgba(253,121,168,0.3)",
      bg: "linear-gradient(160deg,#1a0e18 0%,#181028 50%,#1a1018 100%)", card: "#221428", border: "#3a2540",
      text: "#fce8f4", muted: "#8a5a78", rewardId: "theme_candy", gradient: true },
];

function isThemeUnlocked(theme) {
    if (!theme) return false;
    if (theme.id === "purple") return true;
    if (theme.rewardId) {
        const reward = (typeof REWARD_CATALOG !== "undefined")
            ? REWARD_CATALOG.find(r => r.id === theme.rewardId) : null;
        if (reward) {
            const info = getLevelInfo(data.xp || 0);
            return info.levelIndex >= reward.atLevel;
        }
        return hasReward(theme.rewardId);
    }
    return true;
}

function setThemeById(id) {
    const theme = THEME_CATALOG.find(t => t.id === id);
    if (!theme) return;
    if (!isThemeUnlocked(theme)) {
        alert(`🔒 "${theme.name}" is locked. Level up to unlock it!`);
        return;
    }
    data.themeId = id;
    data.theme = { color: theme.color, hover: theme.hover, alpha: theme.alpha };
    applySavedTheme();
    saveData();
    renderThemeSwatches();
}

function setAccentColor(color, hover, alpha) {
    // legacy support — map to closest catalog entry
    const match = THEME_CATALOG.find(t => t.color.toLowerCase() === (color||"").toLowerCase());
    if (match) { setThemeById(match.id); return; }
    data.theme = { color, hover, alpha };
    data.themeId = null;
    applySavedTheme();
    saveData();
}

function applySavedTheme() {
    const id = data.themeId || "purple";
    let theme = THEME_CATALOG.find(t => t.id === id);
    if (!theme || !isThemeUnlocked(theme)) {
        theme = THEME_CATALOG[0]; // fallback purple
        data.themeId = "purple";
    }
    const root = document.documentElement;
    root.style.setProperty("--accent-color", theme.color);
    root.style.setProperty("--accent-hover", theme.hover);
    root.style.setProperty("--accent-light", theme.alpha);
    root.style.setProperty("--bg-color", theme.bg);
    root.style.setProperty("--card-bg", theme.card);
    root.style.setProperty("--border-color", theme.border);
    root.style.setProperty("--text-color", theme.text);
    root.style.setProperty("--muted-color", theme.muted);
    root.style.setProperty("--surface", theme.card);
    root.style.setProperty("--surface-hover", theme.border);
    root.style.setProperty("--input-bg", theme.bg.includes("gradient") ? theme.card : theme.bg);
    root.style.setProperty("--title-color", theme.text);
    root.style.setProperty("--heading-color", theme.color);

    // Body + main card
    document.body.style.background = theme.bg;
    document.body.style.color = theme.text;
    document.querySelectorAll(".card").forEach(el => {
        el.style.background = theme.card;
        el.style.borderColor = theme.border;
    });

    // XP pill
    const pill = document.getElementById("xp-pill");
    if (pill) {
        pill.style.background = theme.card;
        pill.style.borderColor = theme.color;
        pill.style.color = theme.text;
    }

    // Tools sidebar
    const sidebar = document.getElementById("preset-sidebar");
    if (sidebar) {
        sidebar.style.background = theme.card;
        sidebar.style.color = theme.text;
        sidebar.style.borderColor = theme.border;
    }

    // Timeline full page
    const tlPage = document.getElementById("timeline-page");
    if (tlPage) {
        tlPage.style.background = theme.bg;
        tlPage.style.color = theme.text;
    }

    // Todo drawer
    const todoDrawer = document.getElementById("todo-drawer");
    if (todoDrawer) {
        todoDrawer.style.background = theme.card;
        todoDrawer.style.color = theme.text;
        todoDrawer.style.borderColor = theme.border;
    }

    // Modals (progress, analyser, preview, scratch, focus)
    document.querySelectorAll(".modal-box, .modal-overlay .modal-box").forEach(el => {
        el.style.background = theme.card;
        el.style.borderColor = theme.border;
        el.style.color = theme.text;
    });

    // AI chat window
    const chatWin = document.getElementById("ai-chat-window");
    if (chatWin) {
        chatWin.style.background = theme.card;
        chatWin.style.borderColor = theme.border;
        chatWin.style.color = theme.text;
    }
    const chatHeader = document.querySelector(".chat-header");
    if (chatHeader) {
        chatHeader.style.background = theme.bg;
        chatHeader.style.color = theme.text;
    }
    const chatInputArea = document.querySelector(".chat-input-area");
    if (chatInputArea) {
        chatInputArea.style.background = theme.bg;
    }
}

function renderThemeSwatches() {
    const container = document.getElementById("theme-swatches");
    if (!container) return;
    container.innerHTML = "";
    THEME_CATALOG.forEach(theme => {
        const unlocked = isThemeUnlocked(theme);
        const active = data.themeId === theme.id;
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "theme-chip" + (active ? " theme-chip-active" : "") + (!unlocked ? " theme-chip-locked" : "");
        cell.title = unlocked ? theme.name : `🔒 ${theme.name} — level up to unlock`;
        cell.onclick = () => setThemeById(theme.id);

        const swatch = document.createElement("span");
        swatch.className = "theme-chip-swatch";
        if (theme.gradient && theme.bg && String(theme.bg).includes("gradient")) {
            swatch.style.background = theme.bg;
        } else {
            swatch.style.background = `linear-gradient(135deg, ${theme.color}, ${theme.hover})`;
        }

        const label = document.createElement("span");
        label.className = "theme-chip-label";
        label.textContent = unlocked ? theme.name : "🔒 " + theme.name;

        cell.appendChild(swatch);
        cell.appendChild(label);
        container.appendChild(cell);
    });
}

/* RENDERING & DAY TABS */
function isChimeUnlocked(chime) {
    if (!chime || chime.id === "default") return true;
    const feature = chime.unlockFeature;
    if (feature && FEATURE_UNLOCKS[feature] !== undefined) {
        const info = getLevelInfo(data.xp || 0);
        return info.levelIndex >= FEATURE_UNLOCKS[feature];
    }
    if (chime.rewardId && typeof REWARD_CATALOG !== "undefined") {
        const r = REWARD_CATALOG.find(x => x.id === chime.rewardId);
        if (r) {
            const info = getLevelInfo(data.xp || 0);
            return info.levelIndex >= r.atLevel;
        }
    }
    return false;
}

function renderChimeSwatches() {
    const container = document.getElementById("chime-swatches");
    if (!container) return;
    const active = data.preferredChime || "default";
    container.innerHTML = "";
    CHIME_CATALOG.forEach(ch => {
        const unlocked = isChimeUnlocked(ch);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chime-chip" + (active === ch.id ? " chime-chip-active" : "") + (!unlocked ? " chime-chip-locked" : "");
        btn.title = unlocked ? ch.name : `🔒 ${ch.name} — level up to unlock`;
        btn.innerHTML = `<span class="chime-chip-icon">${unlocked ? "🔔" : "🔒"}</span><span class="chime-chip-label">${ch.name}</span>`;
        btn.onclick = () => {
            if (!unlocked) {
                showToast(`🔒 ${ch.name} is locked — rank up to unlock`, "warn");
                return;
            }
            data.preferredChime = ch.id;
            saveData();
            renderChimeSwatches();
            playRewardSound(ch.id === "default" ? "complete" : ch.id, true); // preview
        };
        container.appendChild(btn);
    });
}


function buildDayTabs() {
    const container = document.getElementById("day-tabs-container");
    if (!container) return;

    container.innerHTML = "";
    DAYS.forEach((day, index) => {
        const button = document.createElement("button");
        button.className = "day-tab";
        button.textContent = day.substring(0, 3);
        button.title = day;
        button.addEventListener("click", () => {
            data.currentDay = index;
            renderCurrentDay();
        });
        container.appendChild(button);
    });
}

function renderCurrentDay() {
    const day = DAYS[data.currentDay];

    const label = document.getElementById("current-day-label");
    const routine = document.getElementById("applied-routine-label");
    const date = document.getElementById("applied-date-label");
    const notes = document.getElementById("daily-notes");

    if (label) label.textContent = day;
    if (routine) routine.textContent = "Routine: " + (data.appliedRoutine || "Custom");
    if (date) date.textContent = "Date: " + getDateForDay(day);
    if (notes) notes.value = data.notes[day] || "";

    ensureSleepBlock();
    updateSidebarDayLabel();
    updateDayTabs();
    renderTasks();
    updateCheckin();
    updateNextTask();
    renderProgressTracker();
    renderWeeklyAnalytics();
    renderTodos();
    if (document.getElementById("timeline-page") && !document.getElementById("timeline-page").classList.contains("hidden")) {
        renderTimeline();
    }
}

function updateSidebarDayLabel() {
    const override = document.getElementById("override-day-name");
    if (override) override.textContent = DAYS[data.currentDay];
}

function updateDayTabs() {
    const tabs = document.querySelectorAll(".day-tab");
    tabs.forEach((tab, index) => {
        tab.classList.toggle("active", index === data.currentDay);
    });
}

function getDateForDay(dayName) {
    const today = new Date();
    const todayIndex = getTodayIndex();
    const targetIndex = DAYS.indexOf(dayName);
    const date = new Date(today);
    date.setDate(today.getDate() + (targetIndex - todayIndex));

    return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

/* PROGRESS TRACKER */
function renderProgressTracker() {
    const day = DAYS[data.currentDay];
    const tasks = data.schedules[day] || [];
    let badge = document.getElementById("progress-tracker-badge");

    if (!badge) {
        const header = document.querySelector(".card") || document.body;
        badge = document.createElement("div");
        badge.id = "progress-tracker-badge";
        badge.style.fontWeight = "bold";
        badge.style.marginTop = "10px";
        badge.style.color = "#a29bfe";
        header.appendChild(badge);
    }

    if (tasks.length === 0) {
        badge.textContent = "Progress: No tasks planned";
        return;
    }

    const completed = tasks.filter(t => t.completed).length;
    const percent = Math.round((completed / tasks.length) * 100);
    badge.textContent = `📊 Progress: ${completed}/${tasks.length} completed (${percent}%)`;
}

/* ========== PRESET IMPORT / EXPORT ========== */
function exportPresets() {
    const payload = {
        type: "SyncDay_presets",
        version: 1,
        exportedAt: new Date().toISOString(),
        presets: {}
    };
    // Export custom presets only (skip built-ins unless user has edits)
    Object.keys(data.presets || {}).forEach(name => {
        payload.presets[name] = data.presets[name];
    });
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "momento-presets-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("⬆ Presets exported", "info");
}

function importPresets(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const parsed = JSON.parse(reader.result);
            let incoming = null;
            if (parsed && parsed.presets && typeof parsed.presets === "object") {
                incoming = parsed.presets;
            } else if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                const first = Object.values(parsed)[0];
                if (first && typeof first === "object") incoming = parsed;
            }
            if (!incoming) throw new Error("Unrecognized preset file");
            let added = 0;
            Object.keys(incoming).forEach(name => {
                if (!name || typeof incoming[name] !== "object") return;
                if (Object.prototype.hasOwnProperty.call(BUILT_IN_PRESETS, name)) {
                    const alt = name + " (imported)";
                    data.presets[alt] = incoming[name];
                } else {
                    data.presets[name] = incoming[name];
                }
                added++;
            });
            saveData();
            if (typeof renderPresetsManager === "function") renderPresetsManager();
            if (typeof populatePresetMenus === "function") populatePresetMenus();
            showToast(`⬇ Imported ${added} preset(s)`, "info");
        } catch (e) {
            console.error(e);
            showToast("Could not import presets — invalid file", "warn");
        }
        event.target.value = "";
    };
    reader.readAsText(file);
}

function exportData() {
    exportPresets();
}


/* DRAG & DROP TASK RENDERER */
function renderTasks() {
    const container = document.getElementById("task-container");
    if (!container) return;

    container.innerHTML = "";
    const day = DAYS[data.currentDay];
    const tasks = data.schedules[day] || [];

    if (tasks.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No time blocks yet. Add one below!";
        empty.style.color = "#8f87ae";
        empty.style.textAlign = "center";
        container.appendChild(empty);
        return;
    }

    tasks.forEach((task, index) => createTaskRow(task, index));
}

function createTaskRow(task, index) {
    const container = document.getElementById("task-container");
    const row = document.createElement("div");
    row.className = "task-row";
    row.draggable = true;

    // Drag Handle
    const dragHandle = document.createElement("span");
    dragHandle.className = "drag-handle";
    dragHandle.textContent = "⣿";

    // Drag Events
    row.addEventListener("dragstart", () => {
        draggedRowIndex = index;
        row.classList.add("dragging");
    });

    row.addEventListener("dragover", e => e.preventDefault());

    row.addEventListener("drop", e => {
        e.preventDefault();
        if (draggedRowIndex === null || draggedRowIndex === index) return;
        const day = DAYS[data.currentDay];
        const movedItem = data.schedules[day].splice(draggedRowIndex, 1)[0];
        data.schedules[day].splice(index, 0, movedItem);
        draggedRowIndex = null;
        saveData();
        renderTasks();
        renderWeeklyAnalytics();
    });

    row.addEventListener("dragend", () => row.classList.remove("dragging"));

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!task.completed;
    const isToday = (typeof getTodayIndex === "function" ? getTodayIndex() : data.currentDay) === data.currentDay;
    if (!isToday) {
        checkbox.disabled = true;
        checkbox.title = "Only today's tasks can be checked off";
    }
    checkbox.addEventListener("change", () => {
        const day = DAYS[data.currentDay];
        const wasCompleted = !!task.completed;
        const todayIdx = typeof getTodayIndex === "function" ? getTodayIndex() : data.currentDay;

        // Block completing / uncompleting on any day that is not today
        if (data.currentDay !== todayIdx) {
            checkbox.checked = wasCompleted; // revert
            showToast("⛔ You can only check off tasks on today's day!", "warn");
            return;
        }

        if (checkbox.checked && !wasCompleted) {
            if (!canCompleteTaskInOrder(day, task)) {
                checkbox.checked = false;
                showToast("⛔ Finish earlier tasks first — no skipping ahead!", "warn");
                return;
            }
            // Can't check off tasks starting more than 1 hour in the future
            const nowM = new Date().getHours() * 60 + new Date().getMinutes();
            const startM = timeToMinutes(task.start);
            if (startM - nowM > 60) {
                checkbox.checked = false;
                showToast("⛔ Too early — you can only check off tasks within 1 hour of their start.", "warn");
                return;
            }
            task.completed = true;
            if (!task.isSleep) {
                awardXPForTask(task);
            }
        } else if (!checkbox.checked && wasCompleted) {
            task.completed = false;
            if (!task.isSleep) {
                if (!task.xpAmount) task.xpAmount = calcTaskXP(task);
                task.xpAwarded = true;
                revokeXPForTask(task);
            }
        } else {
            task.completed = checkbox.checked;
        }
        saveData();
        renderTasks();
        renderProgressTracker();
        updateXPDisplay();
        enforceLocksAfterXPChange();
    });

    const start = document.createElement("input");
    start.type = "text";
    start.className = "time-input";
    start.placeholder = "HH:MM";
    start.maxLength = 5;
    start.value = task.start || "09:00";
    start.title = "Start time (HH:MM)";
    const commitStart = () => {
        let v = start.value.trim();
        if (/^\d{4}$/.test(v)) v = v.slice(0,2) + ":" + v.slice(2);
        if (/^\d{1,2}:\d{2}$/.test(v)) {
            const [h,m] = v.split(":").map(Number);
            if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
                task.start = String(h).padStart(2,"0") + ":" + String(m).padStart(2,"0");
                start.value = task.start;
                saveData();
                renderWeeklyAnalytics();
                updateNextTask();
                updateActiveTask();
                return;
            }
        }

        start.value = task.start || "09:00";
    };
    start.addEventListener("blur", commitStart);
    start.addEventListener("keydown", e => {
        if (e.key === "Enter") { e.preventDefault(); start.blur(); }
    });

    start.addEventListener("input", () => {
        let v = start.value.replace(/[^0-9:]/g, "");
        if (v.length === 2 && !v.includes(":") && start.dataset.prevLen !== "3") {
            v = v + ":";
        }
        start.dataset.prevLen = String(v.length);
        start.value = v.slice(0,5);
    });

    // End
    const end = document.createElement("input");
    end.type = "text";
    end.className = "time-input";
    end.placeholder = "HH:MM";
    end.maxLength = 5;
    end.value = task.end || "10:00";
    end.title = "End time (HH:MM)";
    const commitEnd = () => {
        let v = end.value.trim();
        if (/^\d{4}$/.test(v)) v = v.slice(0,2) + ":" + v.slice(2);
        if (/^\d{1,2}:\d{2}$/.test(v)) {
            const [h,m] = v.split(":").map(Number);
            if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
                task.end = String(h).padStart(2,"0") + ":" + String(m).padStart(2,"0");
                end.value = task.end;
                saveData();
                renderWeeklyAnalytics();
                updateNextTask();
                updateActiveTask();
                return;
            }
        }
        end.value = task.end || "10:00";
    };
    end.addEventListener("blur", commitEnd);
    end.addEventListener("keydown", e => {
        if (e.key === "Enter") { e.preventDefault(); end.blur(); }
    });
    end.addEventListener("input", () => {
        let v = end.value.replace(/[^0-9:]/g, "");
        if (v.length === 2 && !v.includes(":") && end.dataset.prevLen !== "3") {
            v = v + ":";
        }
        end.dataset.prevLen = String(v.length);
        end.value = v.slice(0,5);
    });

    // Activity Input
    const activity = document.createElement("input");
    activity.type = "text";
    activity.placeholder = "What are you doing?";
    activity.value = task.task || "";
    activity.addEventListener("input", () => {
        task.task = activity.value;
        categoryBadge.textContent = detectCategory(task.task);
        saveData();
        renderWeeklyAnalytics();
    });

    // Category Badge
    const categoryBadge = document.createElement("span");
    categoryBadge.className = "category-badge";
    categoryBadge.textContent = detectCategory(task.task);

    // Delete Button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "🗑️";
    deleteBtn.addEventListener("click", () => {
        const day = DAYS[data.currentDay];
        data.schedules[day].splice(index, 1);
        saveData();
        renderTasks();
        renderProgressTracker();
        renderWeeklyAnalytics();
    });

    row.appendChild(dragHandle);
    row.appendChild(checkbox);
    row.appendChild(start);
    row.appendChild(end);
    row.appendChild(activity);
    row.appendChild(deleteBtn);

    if (task.completed) row.classList.add("completed");
    if (task.isSleep) row.classList.add("sleep-block");
    if (data.currentDay === getTodayIndex() && isTaskActive(task)) {
        row.classList.add("active-now");
        row.title = "Active now — open Focus & Music to focus on this task";
    }

    container.appendChild(row);
}

function addTaskRow() {
    const day = DAYS[data.currentDay];
    data.schedules[day].push({ start: "09:00", end: "10:00", task: "", completed: false });
    saveData();
    renderTasks();
    renderProgressTracker();
    renderWeeklyAnalytics();
}


function ensureSleepBlock() {
    DAYS.forEach((day, i) => {
        const tasks = data.schedules[day];
        if (!tasks || tasks.length === 0) return;
        const withoutSleep = tasks.filter(t => !(t.isSleep));
        data.schedules[day] = withoutSleep;

        const last = withoutSleep[withoutSleep.length - 1];
        if (!last) return;p
        const isSleepTask = t => /sleep|zzz|bed/i.test(t.task || "");
        if (isSleepTask(last)) return;
        const nextDay = DAYS[(i + 1) % DAYS.length];
        const nextTasks = (data.schedules[nextDay] || []).filter(t => !t.isSleep && !/sleep|zzz|bed/i.test(t.task || ""));
        const wakeTime = nextTasks.length > 0 ? nextTasks[0].start : "07:00";

        data.schedules[day].push({
            start: last.end,
            end: wakeTime,
            task: "Sleep 😴",
            completed: false,
            isSleep: true
        });
    });
}

function saveSchedule() {
    const day = DAYS[data.currentDay];
    const notes = document.getElementById("daily-notes");
    if (notes) data.notes[day] = notes.value;

    data.schedules[day].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
    ensureSleepBlock();
    saveData();
    renderCurrentDay();
    showSavedMessage("✓ Saved & Sorted Successfully!");
}

/* WEEKLY TIME ANALYTICS */
function renderWeeklyAnalytics() {
    const container = document.getElementById("weekly-analytics-container");
    if (!container) return;

    let totals = { "📚 Study/Work": 0, "🏃 Exercise": 0, "🎮 Gaming/Relax": 0, "🍔 Food": 0, "📌 General": 0 };
    let totalWeekMinutes = 0;

    DAYS.forEach(day => {
        (data.schedules[day] || []).forEach(task => {
            const start = timeToMinutes(task.start);
            const end = timeToMinutes(task.end);
            if (end > start && start !== 99999 && end !== 99999) {
                const duration = end - start;
                const cat = detectCategory(task.task);
                totals[cat] = (totals[cat] || 0) + duration;
                totalWeekMinutes += duration;
            }
        });
    });

    if (totalWeekMinutes === 0) {
        container.innerHTML = "<p style='font-size:0.8rem; color:#8f87ae;'>No task durations logged yet.</p>";
        return;
    }

    let html = "";
    for (const [cat, mins] of Object.entries(totals).sort((a, b) => b[1] - a[1])) {
        if (mins > 0) {
            const hours = (mins / 60).toFixed(1);
            const percent = Math.round((mins / totalWeekMinutes) * 100);
            html += `
                <div class="analytics-bar-item">
                    <div class="analytics-bar-header">
                        <span>${cat}</span>
                        <span>${hours}h (${percent}%)</span>
                    </div>
                    <div class="analytics-bar-track">
                        <div class="analytics-bar-fill" style="width: ${percent}%;"></div>
                    </div>
                </div>`;
        }
    }
    container.innerHTML = html;
}

function playChime() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.85, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
        console.error("Audio error:", e);
    }
}

function toggleNotifications() {
    data.notificationsEnabled = !data.notificationsEnabled;
    saveData();
    updateNotifBtnLabel();
    if (data.notificationsEnabled) playChime();
}

function updateNotifBtnLabel() {
    const btn = document.getElementById("notif-toggle-btn");
    if (btn) {
        btn.textContent = data.notificationsEnabled ? "🔔 Sound: ON" : "🔕 Sound: OFF";
    }
}

/* PRESETS & DRAWER */
function toggleSidebar() {
    setTimeout(updateNowPlayingVisibility, 50);
    const sidebar = document.getElementById("preset-sidebar");
    const arrow = document.getElementById("sidebar-arrow");
    if (!sidebar) return;

    const isOpen = sidebar.classList.toggle("open");
    if (arrow) arrow.textContent = isOpen ? "▶" : "◀";
}

function populatePresetMenus() {
    const master = document.getElementById("preset-select");
    const single = document.getElementById("single-day-preset-select");
    const deleteSelect = document.getElementById("delete-preset-select");
    const names = Object.keys(data.presets);

    if (master) {
        master.innerHTML = '<option value="">Select Master Preset...</option>';
        names.forEach(name => master.appendChild(new Option(name, name)));
    }
    if (single) {
        single.innerHTML = '<option value="">Select Single Day Template...</option>';
        names.forEach(name => single.appendChild(new Option(name, name)));
    }
    if (deleteSelect) {
        deleteSelect.innerHTML = '<option value="">Select Preset to Delete...</option>';
        names.forEach(name => {
            if (!Object.prototype.hasOwnProperty.call(BUILT_IN_PRESETS, name)) {
                deleteSelect.appendChild(new Option(name, name));
            }
        });
    }
    updateNotifBtnLabel();
}

function applyPreset() {
    const select = document.getElementById("preset-select");
    if (!select || !select.value) return alert("Select a preset first.");
    const name = select.value;
    if (!confirm(`Apply "${name}" to the ENTIRE week? XP from completed tasks will be clawed back.`)) return;

    let lost = 0;
    DAYS.forEach(day => { if (typeof clawbackDayXP === "function") lost += clawbackDayXP(day, { silent: true }); });
    DAYS.forEach(day => {
        data.schedules[day] = deepClone(data.presets[name][day] || []).map(t => ({
            ...t, completed: false, xpAwarded: false, xpAmount: 0
        }));
    });
    data.appliedRoutine = name;
    saveData();
    renderCurrentDay();
    updateXPDisplay();
    enforceLocksAfterXPChange();
    select.value = "";
    showSavedMessage(lost > 0
        ? `✓ "${name}" applied (−${lost} XP clawed back)`
        : `✓ "${name}" applied to entire week.`);
}

function applySingleDayPreset() {
    const select = document.getElementById("single-day-preset-select");
    if (!select || !select.value) return alert("Select a preset first.");
    const name = select.value;
    const day = DAYS[data.currentDay];

    if (typeof clawbackDayXP === "function") clawbackDayXP(day);
    data.schedules[day] = deepClone(data.presets[name][day] || []).map(t => ({
        ...t, completed: false, xpAwarded: false, xpAmount: 0
    }));
    data.appliedRoutine = `${name} → ${day}`;
    saveData();
    renderCurrentDay();
    updateXPDisplay();
    select.value = "";
    showSavedMessage(`✓ "${name}" applied to ${day}.`);
}

function applyCustomDayPreset(day,name){
    if (typeof clawbackDayXP === "function") clawbackDayXP(day);
    data.schedules[day] = deepClone(data.presets[name][day] || []).map(t => ({
        ...t, completed: false, xpAwarded: false, xpAmount: 0
    }));
    data.appliedRoutine = `${name} → ${day}`;
    saveData();
    renderCurrentDay();
    updateXPDisplay();
    showSavedMessage(`✓ "${name}" applied to ${day}.`);
}

function createNewPreset() {
    const input = document.getElementById("new-preset-name");
    if (!input) return;

    const name = input.value.trim();
    if (!name || data.presets[name]) return alert("Enter a valid new preset name.");

    const newPreset = {};
    DAYS.forEach(day => newPreset[day] = deepClone(data.schedules[day]));
    data.presets[name] = newPreset;
    saveData();
    populatePresetMenus();
    renderPresetsManager();
    input.value = "";
    showSavedMessage(`✓ "${name}" saved as a new preset.`);
}

function deleteSelectedPreset() {
    const select = document.getElementById("delete-preset-select");
    if (!select || !select.value) return alert("Select a preset to delete.");

    const name = select.value;
    if (Object.prototype.hasOwnProperty.call(BUILT_IN_PRESETS, name)) return alert("Built-in presets cannot be deleted.");
    if (!confirm(`Delete "${name}" permanently?`)) return;

    delete data.presets[name];
    saveData();
    populatePresetMenus();
    renderPresetsManager();
    showSavedMessage(`✓ "${name}" deleted.`);
}

/* LIVE CLOCK & STATUS CHIPS */
let _lastFlapTime = "";

function setFlapDigit(key, value) {
    const el = document.querySelector(`[data-flap="${key}"]`);
    if (!el) return;
    const card = el.querySelector(".flap-card") || el;
    const next = String(value);
    if (card.textContent === next) return;
    el.classList.remove("flap-flip");
    void el.offsetWidth; // reflow
    card.textContent = next;
    el.classList.add("flap-flip");
}

function updateClock() {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    const hStr = String(h).padStart(2, " "); // leading space for single-digit hours
    const mStr = String(m).padStart(2, "0");
    const stamp = hStr + mStr + ampm;
    if (stamp !== _lastFlapTime) {
        _lastFlapTime = stamp;
        setFlapDigit("h1", hStr[0] === " " ? "" : hStr[0]);
        setFlapDigit("h2", hStr[1]);
        setFlapDigit("m1", mStr[0]);
        setFlapDigit("m2", mStr[1]);
        setFlapDigit("ampm", ampm);
        const h1 = document.querySelector('[data-flap="h1"]');
        if (h1) h1.classList.toggle("flap-empty", hStr[0] === " ");
    }
    const datee = document.getElementById("live-date");
    if (datee) {
        datee.textContent = now.toDateString();
    }
    updateNextTask();
}

function isTaskActive(task) {
    if (!task.start || !task.end) return false;
    const current = new Date().getHours() * 60 + new Date().getMinutes();
    return current >= timeToMinutes(task.start) && current < timeToMinutes(task.end) && !task.completed;
}

function updateActiveTask() {
    const rows = document.querySelectorAll(".task-row");
    const tasks = data.schedules[DAYS[data.currentDay]] || [];
    const isViewingToday = data.currentDay === getTodayIndex();

    rows.forEach((row, index) => {
        const task = tasks[index];
        if (task) {
            row.classList.toggle("active-now", isViewingToday && isTaskActive(task));
            row.classList.toggle("completed", !!task.completed);
        }
    });
}

function formatDuration(mins) {
    mins = Math.max(0, Math.round(mins));
    if (mins < 60) return mins + "m";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (m === 0) return h + (h === 1 ? " hour" : " hours");
    return h + "h " + m + "m";
}

function updateNextTask() {
    const badge = document.getElementById("next-task-badge");
    if (!badge) return;

    const current = new Date().getHours() * 60 + new Date().getMinutes();
    const day = DAYS[getTodayIndex()];
    const tasks = [...(data.schedules[day] || [])].filter(t => !t.completed).sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

    const active = tasks.find(t => current >= timeToMinutes(t.start) && current < timeToMinutes(t.end));
    const next = tasks.find(t => timeToMinutes(t.start) > current);

    if (active && active.task !== currentActiveTaskName) {
        currentActiveTaskName = active.task;
        if (data.notificationsEnabled) {
            playChime();
        }
    } else if (!active) {
        currentActiveTaskName = null;
    }

    let html = "";
    if (active) {
        const left = timeToMinutes(active.end) - current;
        html += `<div class="status-chip chip-now"><span class="chip-label">NOW</span><span class="chip-text">${active.task || "Untitled"}</span><span class="chip-time">(${formatDuration(left)} left)</span></div>`;
    } else {
        const idleText = next
            ? "Nothing right now — you're free until the next block"
            : "No active or upcoming tasks left for today";
        html += `<div class="status-chip chip-idle"><span class="chip-label">IDLE</span><span class="chip-text">☕ ${idleText}</span></div>`;
    }
    if (next) {
        const until = timeToMinutes(next.start) - current;
        html += `<div class="status-chip chip-next"><span class="chip-label">NEXT</span><span class="chip-text">${next.task || "Untitled"}</span><span class="chip-time">@ ${next.start} (in ${formatDuration(until)})</span></div>`;
    }

    badge.innerHTML = html;
}

/* CHECK-IN CARD */
function updateCheckin() {
    const prompt = document.getElementById("today-prompt");
    if (!prompt) return;

    const selectedDay = DAYS[data.currentDay];
    const tasks = data.schedules[selectedDay] || [];

    if (tasks.length === 0) {
        prompt.textContent = `Schedule for ${selectedDay} is empty.`;
    } else {
        const completed = tasks.every(task => task.completed);
        prompt.textContent = completed
            ? `🔥 All tasks for ${selectedDay} complete!`
            : `Ready to take on ${selectedDay}?`;
    }
}

function showSavedMessage(message) {
    const status = document.getElementById("save-status");
    if (!status) return alert(message);
    status.textContent = message;
    status.classList.add("show");
    setTimeout(() => status.classList.remove("show"), 2200);
}

/* =========================================================
   XP, STREAKS & FOCUS MODE
   ========================================================= */


/* =========================================================
   LEVEL / RANK SYSTEM + REWARDS
   ========================================================= */
const RANK_TIERS = [
    { name: "Starter",            sub: ["I","II","III","IV","V"], xpPer: 100  },
    { name: "Beginner",           sub: ["1","2","3","4","5"],     xpPer: 200  },
    { name: "Amateur",            sub: ["1","2","3","4","5"],     xpPer: 350  },
    { name: "Above Average Kid",  sub: ["1","2","3","4","5"],     xpPer: 550  },
    { name: "Skilled",            sub: ["1","2","3","4","5"],     xpPer: 850  },
    { name: "Expert",             sub: ["1","2","3","4","5"],     xpPer: 1300 },
    { name: "Exemplar",           sub: ["1","2","3","4","5"],     xpPer: 2000 },
    { name: "Master",             sub: ["1","2","3","4","5"],     xpPer: 3200 },
    { name: "Legend",             sub: ["1","2","3","4","5"],     xpPer: 5000 },
    { name: "Mythic",             sub: ["I","II","III","IV","V"], xpPer: 8000 }
];

const LEVEL_TABLE = [];
(function buildLevelTable() {
    let cum = 0;
    RANK_TIERS.forEach(tier => {
        tier.sub.forEach(s => {
            cum += tier.xpPer;
            LEVEL_TABLE.push({
                rank: `${tier.name} ${s}`,
                xpNeeded: cum,
                tier: tier.name,
                stepCost: tier.xpPer
            });
        });
    });
})();

function getLevelInfo(xp) {
    xp = xp || 0;
    let prev = 0;
    for (let i = 0; i < LEVEL_TABLE.length; i++) {
        if (xp < LEVEL_TABLE[i].xpNeeded) {
            return {
                rank: LEVEL_TABLE[i].rank,
                levelIndex: i,
                currentXP: xp - prev,
                needed: LEVEL_TABLE[i].xpNeeded - prev,
                totalXP: xp,
                nextRank: LEVEL_TABLE[i].rank,
                progress: (xp - prev) / (LEVEL_TABLE[i].xpNeeded - prev)
            };
        }
        prev = LEVEL_TABLE[i].xpNeeded;
    }
    // Max rank
    const last = LEVEL_TABLE[LEVEL_TABLE.length - 1];
    return {
        rank: last.rank + "+",
        levelIndex: LEVEL_TABLE.length - 1,
        currentXP: xp - prev,
        needed: 999999,
        totalXP: xp,
        nextRank: "MAX",
        progress: 1
    };
}

const REWARD_CATALOG = [
    // Starter (0–4) — sparse: only a taste
    { id: "xp_boost_s3",      atLevel: 2,  name: "+20 Bonus XP",          desc: "One-time +20 XP at Starter III", bonusXP: 20 },
    { id: "theme_cyan",       atLevel: 4,  name: "Cyan Theme",            desc: "Unlock the Cyan colour theme" },
    // Beginner (5–9)
    { id: "xp_boost_b2",      atLevel: 6,  name: "+35 Bonus XP",          desc: "One-time +35 XP at Beginner 2", bonusXP: 35 },
    { id: "feature_timeline", atLevel: 7,  name: "Timeline Visualizer",   desc: "Unlock the day timeline visualizer" },
    { id: "theme_coral",      atLevel: 9,  name: "Coral Theme",           desc: "Unlock the Coral colour theme" },
    // Amateur (10–14)
    { id: "sound_levelup",    atLevel: 10, name: "Level-Up Fanfare",      desc: "Special arpeggio when you level up" },
    { id: "feature_analyser", atLevel: 12, name: "Week Analyser",         desc: "Unlock Analyse My Week" },
    { id: "theme_amber",      atLevel: 14, name: "Amber Theme",           desc: "Unlock the Amber colour theme" },
    // Above Average Kid (15–19)
    { id: "confetti",         atLevel: 15, name: "Confetti Celebration",  desc: "Confetti on big XP gains" },
    { id: "theme_green",      atLevel: 17, name: "Green Theme",           desc: "Unlock the Green colour theme" },
    { id: "sound_victory",    atLevel: 19, name: "Victory Fanfare",       desc: "Special chime on task complete" },
    // Skilled (20–24)
    { id: "theme_rose",       atLevel: 20, name: "Rose Theme",            desc: "Unlock the Rose colour theme" },
    { id: "focus_plus",       atLevel: 22, name: "Focus+ Modes",          desc: "Extra timer lengths (15/45/60)" },
    { id: "xp_boost_skilled", atLevel: 24, name: "+100 Bonus XP",         desc: "One-time +100 XP at Skilled 5", bonusXP: 100 },
    // Expert (25–29)
    { id: "theme_gold",       atLevel: 26, name: "Gold Theme",            desc: "Unlock the Gold colour theme" },
    { id: "sound_chill",      atLevel: 28, name: "Chill Chime",            desc: "Softer completion tone" },
    // Exemplar (30–34)
    { id: "theme_ocean",      atLevel: 30, name: "Ocean Theme",           desc: "Unlock the Ocean colour theme" },
    { id: "badge_legend",     atLevel: 32, name: "Legend Badge",          desc: "Show a Legend badge on your progress pill" },
    { id: "theme_forest",     atLevel: 34, name: "Forest Theme",          desc: "Unlock the Forest colour theme" },
    // Master (35–39)
    { id: "theme_neon",       atLevel: 36, name: "Neon Theme",            desc: "Unlock the Neon colour theme" },
    { id: "xp_boost_master",  atLevel: 38, name: "+250 Bonus XP",         desc: "One-time +250 XP at Master 4", bonusXP: 250 },
    // Legend (40–44)
    { id: "theme_midnight",   atLevel: 40, name: "Midnight Theme",        desc: "Unlock the Midnight colour theme" },
    { id: "theme_sunset",     atLevel: 42, name: "Sunset Gradient",       desc: "Unlock the Sunset gradient theme" },
    { id: "theme_aurora",     atLevel: 44, name: "Aurora Gradient",       desc: "Unlock the Aurora gradient theme" },
    // Mythic (45–49)
    { id: "theme_candy",      atLevel: 46, name: "Candy Gradient",        desc: "Unlock the Candy gradient theme" },
    { id: "theme_mythic",     atLevel: 48, name: "Mythic Aura",           desc: "Special Mythic glow on the XP pill" },
    { id: "title_mythic",     atLevel: 49, name: "Mythic Title",          desc: "Unlock the Mythic title under Momento" },
];

/** Feature unlock requirements by reward id / levelIndex */
const CHIME_CATALOG = [
    { id: "default",  name: "Classic",   rewardId: null,           unlockFeature: null },
    { id: "victory",  name: "Victory",   rewardId: "sound_victory", unlockFeature: "sound_victory" },
    { id: "levelup",  name: "Fanfare",   rewardId: "sound_levelup", unlockFeature: "sound_levelup" },
    { id: "chill",    name: "Chill",     rewardId: "sound_chill",   unlockFeature: "sound_chill" },
];

const FEATURE_UNLOCKS = {
    timeline: 7,        // Beginner 3
    analyser: 12,       // Amateur 3
    ai_generate: 0,     // free
    ai_theme: 0,        // free (individual themes still rank-gated)
    ai_regenerate: 4,   // Starter V
    ai_clear_day: 3,    // Starter IV
    ai_clear_week: 7,   // Beginner 3
    ai_bulk_edit: 6,    // Beginner 2
    sound_victory: 19,  // Above Average Kid 5
    sound_levelup: 10,  // Amateur 1
    sound_chill: 28,    // Expert 4
};

function checkAndUnlockRewards(levelIndex) {
    const newly = [];
    REWARD_CATALOG.forEach(r => {
        if (levelIndex >= r.atLevel && !(data.rewardsUnlocked || []).includes(r.id)) {
            data.rewardsUnlocked = data.rewardsUnlocked || [];
            data.rewardsUnlocked.push(r.id);
            if (r.bonusXP) {
                data.xp = (data.xp || 0) + r.bonusXP;
            }
            newly.push(r);
        }
    });
    if (newly.length) {
        saveData();
        newly.forEach(r => showRewardUnlock(r));
        if (typeof renderThemeSwatches === "function") renderThemeSwatches();
        if (typeof renderChimeSwatches === "function") renderChimeSwatches();
        if (typeof updateFeatureLocks === "function") updateFeatureLocks();
        if (typeof updateXPDisplay === "function") updateXPDisplay();
    }
}

function isFeatureUnlocked(feature) {
    const need = FEATURE_UNLOCKS[feature];
    if (need === undefined || need === 0) return true;
    const info = getLevelInfo(data.xp || 0);
    return info.levelIndex >= need;
}

function updateFeatureLocks() {
    const tlBadge = document.getElementById("timeline-lock-badge");
    if (tlBadge) tlBadge.style.display = isFeatureUnlocked("timeline") ? "none" : "inline";
    const analyseBtn = document.querySelector(".btn-analyse");
    if (analyseBtn) {
        if (!isFeatureUnlocked("analyser")) {
            analyseBtn.classList.add("btn-locked");
            analyseBtn.title = "🔒 Unlock at Amateur 3";
        } else {
            analyseBtn.classList.remove("btn-locked");
            analyseBtn.title = "";
        }
    }
    // Close timeline page if locked after demotion
    if (!isFeatureUnlocked("timeline")) {
        const page = document.getElementById("timeline-page");
        if (page && !page.classList.contains("hidden")) {
            page.classList.add("hidden");
            showToast("🔒 Timeline locked again — climb back to Beginner 3", "warn");
        }
    }
}

function showRewardUnlock(reward) {
    const DURATION = 7000; // ms visible
    const el = document.createElement("div");
    el.className = "reward-toast";
    el.innerHTML = `
        <strong>🎁 Reward Unlocked!</strong><br>${reward.name}<br><small>${reward.desc}</small>
        <div class="reward-toast-timer" aria-hidden="true"><div class="reward-toast-timer-fill"></div></div>`;
    document.body.appendChild(el);
    setTimeout(() => {
        el.classList.add("show");
        const fill = el.querySelector(".reward-toast-timer-fill");
        if (fill) {
            fill.style.transition = "none";
            fill.style.width = "100%";
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    fill.style.transition = `width ${DURATION}ms linear`;
                    fill.style.width = "0%";
                });
            });
        }
    }, 50);
    setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 450); }, DURATION + 50);
}

function isRewardUnlockedByRank(idOrReward) {
    const r = typeof idOrReward === "string"
        ? (typeof REWARD_CATALOG !== "undefined" ? REWARD_CATALOG.find(x => x.id === idOrReward) : null)
        : idOrReward;
    if (!r) return false;
    const info = getLevelInfo(data.xp || 0);
    return info.levelIndex >= r.atLevel;
}

function hasReward(id) {
    return isRewardUnlockedByRank(id);
}

function syncRewardsToLevel() {
    if (typeof REWARD_CATALOG === "undefined") return;
    const info = getLevelInfo(data.xp || 0);
    data.rewardsUnlocked = REWARD_CATALOG
        .filter(r => info.levelIndex >= r.atLevel)
        .map(r => r.id);
}


function awardXPForTask(task) {
    if (task.xpAwarded) return; // already paid out — anti-farm
    const xpGain = calcTaskXP(task);

    data.xp = (data.xp || 0) + xpGain;
    data.totalTasksCompleted = (data.totalTasksCompleted || 0) + 1;
    task.xpAwarded = true;
    task.xpAmount = xpGain;

    // Streak logic
    const todayStr = new Date().toDateString();
    if (data.lastCompletedDate !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (data.lastCompletedDate === yesterday.toDateString()) {
            data.streak = (data.streak || 0) + 1;
        } else {
            data.streak = 1;
        }
        data.lastCompletedDate = todayStr;
    }

    const infoBefore = getLevelInfo((data.xp || 0) - xpGain);
    const infoAfter = getLevelInfo(data.xp || 0);
    saveData();
    showXPPopup(xpGain, task.task || "Task", infoAfter);
    updateXPDisplay();
    playRewardSound("complete");
    if (infoAfter.levelIndex > infoBefore.levelIndex) {
        checkAndUnlockRewards(infoAfter.levelIndex);
        showLevelUp(infoAfter.rank);
        playRewardSound("levelup");
    }
}

function showXPPopup(xpGain, taskName, levelInfo) {
    // Remove existing popup if any
    const existing = document.getElementById("xp-popup");
    if (existing) existing.remove();

    levelInfo = levelInfo || getLevelInfo(data.xp || 0);
    const popup = document.createElement("div");
    popup.id = "xp-popup";
    popup.className = "xp-popup";
    popup.innerHTML = `
        <div class="xp-popup-content">
            <div class="xp-popup-emoji">🎉</div>
            <div class="xp-popup-title">Task Completed!</div>
            <div class="xp-popup-task">${taskName}</div>
            <div class="xp-popup-gain">+${xpGain} XP</div>
            <div class="xp-popup-rank">${levelInfo.rank}</div>
            <div class="xp-popup-stats">Streak: ${data.streak || 0} 🔥 &nbsp;•&nbsp; Total XP: ${data.xp || 0}</div>
            <div class="xp-bar-wrap"><div class="xp-bar-fill" style="width:${Math.round(levelInfo.progress*100)}%"></div></div>
            <div class="xp-bar-label">${levelInfo.currentXP} / ${levelInfo.needed} to next</div>
            <button class="xp-popup-btn" onclick="document.getElementById('xp-popup').remove()">WOOHOO!</button>
        </div>
    `;
    document.body.appendChild(popup);
    if (hasReward("confetti") && xpGain >= 60) {
        // simple confetti burst
        for (let i = 0; i < 24; i++) {
            const conf = document.createElement("div");
            conf.className = "confetti-piece";
            conf.style.left = (40 + Math.random()*20) + "%";
            conf.style.background = ["#f9ca24","#6c5ce7","#00cec9","#ff7675","#20bf6b"][i%5];
            conf.style.animationDelay = (Math.random()*0.4) + "s";
            popup.appendChild(conf);
        }
    }
    setTimeout(() => {
        if (document.getElementById("xp-popup")) document.getElementById("xp-popup").remove();
    }, 8000);
}

function showLevelUp(rank) {
    const el = document.createElement("div");
    el.className = "levelup-toast";
    el.innerHTML = `<div class="levelup-emoji">⬆️</div><div>Level Up!</div><div class="levelup-rank">${rank}</div>`;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("show"), 30);
    setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 500); }, 3500);
    if (typeof playChime === "function") playChime();
}

function calcTaskXP(task) {
    const startM = timeToMinutes(task.start);
    const endM = timeToMinutes(task.end);
    let dur = endM > startM ? endM - startM : (endM + 1440 - startM);
    return Math.min(120, Math.max(25, Math.round(dur / 3) + 15));
}

function revokeXPForTask(task) {
    const xpLoss = task.xpAmount || calcTaskXP(task);
    const infoBefore = getLevelInfo(data.xp || 0);
    data.xp = Math.max(0, (data.xp || 0) - xpLoss);
    data.totalTasksCompleted = Math.max(0, (data.totalTasksCompleted || 0) - 1);
    task.xpAwarded = false;
    task.xpAmount = 0;
    const infoAfter = getLevelInfo(data.xp || 0);
    saveData();
    updateXPDisplay();
    const pill = document.getElementById("xp-pill");
    if (pill) {
        pill.classList.add("xp-pill-lost");
        setTimeout(() => pill.classList.remove("xp-pill-lost"), 600);
    }
    if (infoAfter.levelIndex < infoBefore.levelIndex) {
        showLevelDown(infoBefore.rank, infoAfter.rank);
        enforceLocksAfterXPChange();
    }
}


function canCompleteTaskInOrder(day, task) {
    const tasks = data.schedules[day] || [];
    const startM = timeToMinutes(task.start);
    for (const t of tasks) {
        if (t === task || t.isSleep) continue;
        if (timeToMinutes(t.start) < startM && !t.completed) return false;
    }
    return true;
}

function showLevelDown(oldRank, newRank) {
    const existing = document.getElementById("leveldown-card");
    if (existing) existing.remove();
    const el = document.createElement("div");
    el.id = "leveldown-card";
    el.className = "leveldown-card";
    el.innerHTML = `
        <div class="leveldown-inner">
            <div class="leveldown-emoji">😬</div>
            <div class="leveldown-title">Uh oh…</div>
            <div class="leveldown-body">It looks like you unchecked some tasks.<br>
            You've dropped from <strong>${oldRank}</strong> to <strong>${newRank}</strong>.</div>
            <div class="leveldown-hint">Some features or themes may lock again until you climb back up.</div>
            <button class="xp-popup-btn" onclick="document.getElementById('leveldown-card').remove()">Got it</button>
        </div>`;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("show"), 30);
    playRewardSound("down");
}

function showToast(msg, kind) {
    const el = document.createElement("div");
    el.className = "sync-toast" + (kind ? " toast-" + kind : "");
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("show"), 20);
    // Longer so errors / penalties are readable
    setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 450); }, 7000);
}

function enforceLocksAfterXPChange() {
    syncRewardsToLevel();
    if (typeof updateFeatureLocks === "function") updateFeatureLocks();
    if (typeof renderThemeSwatches === "function") renderThemeSwatches();
    if (typeof renderChimeSwatches === "function") renderChimeSwatches();
    // Preferred chime locked after demotion?
    const pref = data.preferredChime || "default";
    if (pref !== "default") {
        const ch = CHIME_CATALOG.find(x => x.id === pref);
        if (ch && !isChimeUnlocked(ch)) {
            data.preferredChime = "default";
            saveData();
            showToast("🔔 Chime locked again — switched to Classic", "info");
        }
    }
    // Theme still equipped but no longer unlocked?
    const id = data.themeId || "purple";
    if (id === "purple") return;
    const theme = (typeof THEME_CATALOG !== "undefined")
        ? THEME_CATALOG.find(t => t.id === id) : null;
    if (theme && !isThemeUnlocked(theme)) {
        showThemeLockedPopup(theme);
    }
}

function showThemeLockedPopup(theme) {
    // Auto-switch to purple immediately — no "pick later"
    setThemeById("purple");
    if (document.getElementById("theme-locked-popup")) return;

    const unlocked = (typeof THEME_CATALOG !== "undefined")
        ? THEME_CATALOG.filter(t => t.id !== "purple" && isThemeUnlocked(t))
        : [];
    const picks = unlocked.slice(0, 6).map(t =>
        `<button type="button" class="theme-pick-btn" style="border-color:${t.color}"
            onclick="setThemeById('${t.id}');document.getElementById('theme-locked-popup').remove()">
            <span class="theme-pick-dot" style="background:${t.color}"></span>${t.name}
        </button>`
    ).join("");

    const el = document.createElement("div");
    el.id = "theme-locked-popup";
    el.className = "leveldown-card show";
    el.innerHTML = `
        <div class="leveldown-inner">
            <div class="leveldown-emoji">🎨🔒</div>
            <div class="leveldown-title">Theme locked</div>
            <div class="leveldown-body"><strong>${theme.name}</strong> needs a higher rank again.<br>
            Switched you to <strong>Purple</strong> automatically.</div>
            ${picks ? `<div class="leveldown-hint">Or pick another unlocked theme:</div>
            <div class="theme-pick-row">${picks}</div>` : ""}
            <button class="xp-popup-btn" style="margin-top:12px"
                onclick="document.getElementById('theme-locked-popup').remove()">OK</button>
        </div>`;
    document.body.appendChild(el);
}

function clawbackDayXP(day, opts) {
    opts = opts || {};
    const silent = !!opts.silent;
    const tasks = data.schedules[day] || [];
    let total = 0;
    const infoBefore = getLevelInfo(data.xp || 0);
    tasks.forEach(t => {
        if ((t.xpAwarded || t.completed) && !t.isSleep) {
            const loss = t.xpAmount || calcTaskXP(t);
            data.xp = Math.max(0, (data.xp || 0) - loss);
            data.totalTasksCompleted = Math.max(0, (data.totalTasksCompleted || 0) - 1);
            total += loss;
        }
        t.xpAwarded = false;
        t.xpAmount = 0;
        t.completed = false;
    });
    if (total > 0 && !silent) {
        const infoAfter = getLevelInfo(data.xp || 0);
        if (infoAfter.levelIndex < infoBefore.levelIndex) {
            showLevelDown(infoBefore.rank, infoAfter.rank);
        }
        showToast(`−${total} XP clawed back (day cleared)`, "warn");
    }
    if (!silent) enforceLocksAfterXPChange();
    return total;
}

function clearDaySchedule(day) {
    clawbackDayXP(day);
    data.schedules[day] = [];
    saveData();
    updateXPDisplay();
}

function clearWeekSchedules() {
    let total = 0;
    const infoBefore = getLevelInfo(data.xp || 0);
    DAYS.forEach(day => {
        total += clawbackDayXP(day);
        data.schedules[day] = [];
    });
    saveData();
    updateXPDisplay();
    enforceLocksAfterXPChange();
    const infoAfter = getLevelInfo(data.xp || 0);
    if (infoAfter.levelIndex < infoBefore.levelIndex) {
        showLevelDown(infoBefore.rank, infoAfter.rank);
    }
    return total;
}

/** Special chimes — unlocked via rewards / rank */
function playRewardSound(kind, forcePreview) {
    // forcePreview = play even if alerts off (toolbar preview)
    if (!forcePreview && !data.notificationsEnabled && kind !== "down") return;
    // On normal complete, use preferred chime if unlocked
    let tone = kind;
    if (kind === "complete") {
        const pref = data.preferredChime || "default";
        if (pref !== "default") {
            const ch = CHIME_CATALOG.find(x => x.id === pref);
            if (ch && isChimeUnlocked(ch)) tone = pref;
        }
    }
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const now = ctx.currentTime;
        const playTone = (freq, start, dur, type, vol) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type || "sine";
            osc.frequency.setValueAtTime(freq, now + start);
            gain.gain.setValueAtTime(vol || 0.2, now + start);
            gain.gain.exponentialRampToValueAtTime(0.01, now + start + dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + start);
            osc.stop(now + start + dur);
        };
        if (tone === "levelup" || tone === "fanfare") {
            playTone(523.25, 0, 0.15, "sine", 0.25);
            playTone(659.25, 0.12, 0.15, "sine", 0.25);
            playTone(783.99, 0.24, 0.25, "sine", 0.3);
            playTone(1046.5, 0.4, 0.35, "triangle", 0.22);
        } else if (tone === "victory") {
            playTone(784, 0, 0.12, "square", 0.12);
            playTone(988, 0.1, 0.12, "square", 0.12);
            playTone(1175, 0.2, 0.25, "sine", 0.18);
        } else if (tone === "chill") {
            playTone(440, 0, 0.2, "sine", 0.15);
            playTone(554, 0.15, 0.3, "sine", 0.12);
        } else if (tone === "down") {
            playTone(400, 0, 0.2, "sawtooth", 0.12);
            playTone(300, 0.15, 0.25, "sawtooth", 0.1);
        } else {
            playChime();
        }
    } catch (e) { /* ignore */ }
}

function updateXPDisplay() {
    const info = getLevelInfo(data.xp || 0);
    const pct = Math.round((info.progress || 0) * 100);
    const toNext = Math.max(0, info.needed - info.currentXP);
    const rankEl = document.getElementById("xp-pill-rank");
    const fillEl = document.getElementById("xp-pill-fill");
    const pctEl = document.getElementById("xp-pill-pct");
    if (rankEl) rankEl.textContent = info.rank;
    if (fillEl) {
        // force reflow so bar always paints even at 0%
        fillEl.style.width = "0%";
        void fillEl.offsetWidth;
        fillEl.style.width = Math.max(pct, pct > 0 ? pct : 0) + "%";
        fillEl.style.minWidth = pct > 0 ? "4px" : "0";
    }
    if (pctEl) pctEl.textContent = toNext > 0 ? `${toNext} left` : "MAX";
    const pill = document.getElementById("xp-pill");
    if (pill) {
        pill.title = `${info.rank}\n${info.currentXP}/${info.needed} XP this rank\n${toNext} XP left to next\nClick for full progress`;
    }
}

function openProgressPanel() {
    setTimeout(updateNowPlayingVisibility, 50);
    const panel = document.getElementById("progress-panel");
    if (!panel) return;
    syncRewardsToLevel();
    const info = getLevelInfo(data.xp || 0);
    const pct = Math.round((info.progress || 0) * 100);
    const have = data.xp || 0;
    const toNext = Math.max(0, info.needed - info.currentXP);

    document.getElementById("progress-rank-big").textContent = info.rank;
    document.getElementById("progress-xp-line").textContent = `${have} XP total  ·  ${toNext} XP to next`;
    document.getElementById("progress-bar-fill").style.width = pct + "%";
    document.getElementById("progress-bar-label").textContent =
        `${info.currentXP} / ${info.needed} XP this rank  (${pct}%)`;
    document.getElementById("progress-streak").textContent =
        `🔥 Streak: ${data.streak || 0} day${(data.streak||0)===1?"":"s"}`;

    // Full rank ladder
    const ranksEl = document.getElementById("ranks-ladder");
    if (ranksEl) {
        ranksEl.innerHTML = LEVEL_TABLE.map((lv, i) => {
            const prev = i === 0 ? 0 : LEVEL_TABLE[i - 1].xpNeeded;
            const cost = lv.stepCost || (lv.xpNeeded - prev);
            const reached = have >= lv.xpNeeded;
            const current = i === info.levelIndex && have < (LEVEL_TABLE[LEVEL_TABLE.length-1].xpNeeded);
            const isCurrent = (!reached && have >= prev) || (i === info.levelIndex && have < lv.xpNeeded);
            // actually current is the one we're working on
            const working = have >= prev && have < lv.xpNeeded;
            const cls = reached ? "rank-done" : working ? "rank-current" : "rank-locked";
            const icon = reached ? "✓" : working ? "▶" : "·";
            return `<div class="rank-row ${cls}">
                <span class="rank-icon">${icon}</span>
                <span class="rank-name">${lv.rank}</span>
                <span class="rank-cost">${cost} XP</span>
                <span class="rank-cum">${lv.xpNeeded} total</span>
            </div>`;
        }).join("");
    }

    // Rewards with clear unlock rank + remaining XP
    const list = document.getElementById("rewards-list");
    if (list) {
        list.innerHTML = REWARD_CATALOG.map(r => {
            const unlocked = isRewardUnlockedByRank(r);
            const rankName = (LEVEL_TABLE[r.atLevel] || {}).rank || "?";
            const need = LEVEL_TABLE[r.atLevel]?.xpNeeded || 0;
            const remain = Math.max(0, need - have);
            const progress = Math.min(100, Math.round((have / Math.max(need, 1)) * 100));
            return `
                <div class="reward-row ${unlocked ? "unlocked" : "locked"}">
                    <div class="reward-row-top">
                        <span class="reward-icon">${unlocked ? "✅" : "🔒"}</span>
                        <span class="reward-name">${r.name}</span>
                        <span class="reward-req">${unlocked ? "Unlocked" : rankName}</span>
                    </div>
                    <div class="reward-desc">${r.desc}</div>
                    ${!unlocked ? `<div class="xp-bar-wrap small"><div class="xp-bar-fill" style="width:${progress}%"></div></div>
                    <div class="reward-prog">${remain} XP more · unlocks at ${rankName}</div>` : ""}
                </div>`;
        }).join("");
    }
    panel.classList.remove("hidden");
    updateXPDisplay(); // keep pill bar in sync
}


/* ========== WEEKLY REVIEW ========== */
function computeWeeklyReview() {
    let totalBlocks = 0;
    let completedBlocks = 0;
    const perDay = {};
    DAYS.forEach(day => {
        const tasks = (data.schedules[day] || []).filter(t => !t.isSleep);
        const done = tasks.filter(t => t.completed).length;
        perDay[day] = { total: tasks.length, done, pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0 };
        totalBlocks += tasks.length;
        completedBlocks += done;
    });
    const overallPct = totalBlocks ? Math.round((completedBlocks / totalBlocks) * 100) : 0;
    let bestDay = null;
    let bestScore = -1;
    DAYS.forEach(day => {
        const d = perDay[day];
        // Prefer higher completion count, then %
        const score = d.done * 1000 + d.pct;
        if (d.total > 0 && score > bestScore) {
            bestScore = score;
            bestDay = day;
        }
    });
    return {
        totalBlocks,
        completedBlocks,
        overallPct,
        perDay,
        bestDay,
        bestDone: bestDay ? perDay[bestDay].done : 0,
        bestTotal: bestDay ? perDay[bestDay].total : 0,
        bestPct: bestDay ? perDay[bestDay].pct : 0,
        xp: data.xp || 0,
        streak: data.streak || 0,
        rank: (typeof getLevelInfo === "function" ? getLevelInfo(data.xp || 0).rank : "?")
    };
}

function openWeeklyReview() {
    setTimeout(updateNowPlayingVisibility, 50);
    const panel = document.getElementById("weekly-review-panel");
    const body = document.getElementById("weekly-review-body");
    if (!panel || !body) return;
    const r = computeWeeklyReview();
    const dayRows = DAYS.map(day => {
        const d = r.perDay[day];
        const isBest = day === r.bestDay;
        return `<div class="review-day-row ${isBest ? "review-best" : ""}">
            <span class="review-day-name">${day.slice(0, 3)}${isBest ? " ⭐" : ""}</span>
            <div class="xp-bar-wrap small"><div class="xp-bar-fill" style="width:${d.pct}%"></div></div>
            <span class="review-day-stats">${d.done}/${d.total} · ${d.pct}%</span>
        </div>`;
    }).join("");
    body.innerHTML = `
        <div class="review-hero">
            <div class="review-stat"><div class="review-stat-val">${r.rank}</div><div class="review-stat-label">Rank</div></div>
            <div class="review-stat"><div class="review-stat-val">${r.xp}</div><div class="review-stat-label">XP</div></div>
            <div class="review-stat"><div class="review-stat-val">${r.streak}🔥</div><div class="review-stat-label">Streak</div></div>
            <div class="review-stat"><div class="review-stat-val">${r.overallPct}%</div><div class="review-stat-label">Done</div></div>
        </div>
        <div class="review-summary">
            <strong>${r.completedBlocks}</strong> of <strong>${r.totalBlocks}</strong> blocks completed this week
            ${r.bestDay ? `<br>Best day: <strong>${r.bestDay}</strong> (${r.bestDone}/${r.bestTotal} · ${r.bestPct}%)` : "<br>No blocks scheduled yet."}
        </div>
        <h4 style="margin:14px 0 8px">By day</h4>
        <div class="review-days">${dayRows}</div>
    `;
    panel.classList.remove("hidden");
}

function closeWeeklyReview() {
    setTimeout(updateNowPlayingVisibility, 50);
    const panel = document.getElementById("weekly-review-panel");
    if (panel) panel.classList.add("hidden");
}



let _musicVolume = 0.4;
let _streamPlaying = false;
let _localTracks = []; // { id, name, artist, blob? url? }
let _localIndex = 0;
let _localPlaying = false;
let _npSource = null;
let _npTimer = null;
let _archivePlaying = false;
let _npWantVisible = false;
const LOCAL_MUSIC_DB = "SyncDay_local_music";
const LOCAL_MUSIC_STORE = "tracks";

function openMusicPage() {
    const page = document.getElementById("music-page");
    if (!page) return;
    page.classList.remove("hidden");
    const day = DAYS[getTodayIndex()];
    const now = new Date().getHours() * 60 + new Date().getMinutes();
    const active = (data.schedules[day] || []).find(t =>
        !t.completed && !t.isSleep &&
        timeToMinutes(t.start) <= now && now < timeToMinutes(t.end)
    );
    const label = document.getElementById("music-focus-task");
    if (label) label.textContent = active ? (active.task || "Untitled") : "No active block — free focus";
    if (active) {
        _focusTaskRef = { task: active, index: (data.schedules[day] || []).indexOf(active), day };
    }
    updateFocusTimerDisplay();
    renderMicroTasks();
    renderLocalTrackList();
    updateNowPlayingVisibility();
    if (!navigator.onLine) {
        showToast("📡 Offline — local library still works", "info");
    }
}

function closeMusicPage() {
    const page = document.getElementById("music-page");
    if (page) page.classList.add("hidden");
    updateNowPlayingVisibility();
}

function toggleMusicDock() { openMusicPage(); }

function setMusicVolume(val) {
    _musicVolume = Math.max(0, Math.min(100, Number(val))) / 100;
    ["stream-audio", "local-audio"].forEach(id => {
        const a = document.getElementById(id);
        if (a) a.volume = _musicVolume;
    });
    const npVol = document.getElementById("np-volume");
    if (npVol) npVol.value = Math.round(_musicVolume * 100);
}

function isBlockingOverlayOpen() {
    const check = (id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        if (el.classList.contains("hidden")) return false;
        if (el.style.display === "none") return false;
        return true;
    };
    if (check("todo-drawer")) return true;
    if (check("progress-panel")) return true;
    if (check("timeline-page")) return true;
    if (check("weekly-review-panel")) return true;
    if (check("focus-modal")) return true;
    if (check("theme-locked-popup")) return true;
    const side = document.getElementById("preset-sidebar") || document.getElementById("sidebar");
    if (side && side.classList.contains("open")) return true;
    return false;
}

function updateNowPlayingVisibility() {
    const bar = document.getElementById("now-playing-bar");
    if (!bar) return;
    const musicOpen = document.getElementById("music-page") &&
        !document.getElementById("music-page").classList.contains("hidden");
    const mainOk = !isBlockingOverlayOpen();
    // Show if we have something to show AND (music page open OR main schedule view without overlays)
    if (_npWantVisible && mainOk) {
        bar.classList.remove("hidden");
    } else {
        bar.classList.add("hidden");
    }
    // Always allow on music page
    if (_npWantVisible && musicOpen) bar.classList.remove("hidden");
}

function showNowPlaying(title, artist, source) {
    const bar = document.getElementById("now-playing-bar");
    if (!bar) return;
    _npWantVisible = true;
    const t = document.getElementById("np-title");
    const a = document.getElementById("np-artist");
    if (t) t.textContent = title || "—";
    if (a) a.textContent = artist || (source === "local" ? "Local file" : "—");
    _npSource = source;
    updateNpPlayBtn();
    startNpTimer();
    updateNowPlayingVisibility();
}

function hideNowPlaying() {
    _npWantVisible = false;
    const bar = document.getElementById("now-playing-bar");
    if (bar) bar.classList.add("hidden");
    stopNpTimer();
    _npSource = null;
}

function updateNpPlayBtn() {
    const btn = document.getElementById("np-play-btn");
    if (!btn) return;
    const playing = _localPlaying || _streamPlaying || _archivePlaying;
    btn.textContent = playing ? "⏸" : "▶";
}

function toggleNowPlaying() {
    if (_npSource === "local") toggleLocalPlayByIndex(_localIndex);
    else if (_npSource === "archive") toggleArchivePlay();
    updateNpPlayBtn();
}

function startNpTimer() {
    stopNpTimer();
    _npTimer = setInterval(updateNpTimes, 500);
    updateNpTimes();
}
function stopNpTimer() {
    if (_npTimer) clearInterval(_npTimer);
    _npTimer = null;
}
function formatAudioTime(sec) {
    if (!isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ":" + String(s).padStart(2, "0");
}
function updateNpTimes() {
    const audio = document.getElementById(_npSource === "local" ? "local-audio" : "stream-audio");
    const cur = document.getElementById("np-current");
    const dur = document.getElementById("np-duration");
    if (!audio || !cur || !dur) return;
    cur.textContent = formatAudioTime(audio.currentTime);
    dur.textContent = formatAudioTime(audio.duration);
}


const PIPED_INSTANCES = [
    "https://pipedapi.kavin.rocks",
    "https://pipedapi.adminforge.de",
    "https://api.piped.private.coffee",
    "https://pipedapi.syncpundit.io",
];
let _musicResults = [];
let _audiusHost = null;

function pickBestAudio(audioStreams) {
    if (!Array.isArray(audioStreams) || !audioStreams.length) return null;
    const scored = audioStreams
        .filter(s => s.url)
        .map(s => {
            const mime = (s.mimeType || s.format || "").toLowerCase();
            let score = s.bitrate || s.quality || 0;
            if (mime.includes("mp4") || mime.includes("m4a") || mime.includes("aac")) score += 50000;
            if (mime.includes("opus")) score += 20000;
            return { s, score };
        })
        .sort((a, b) => b.score - a.score);
    return scored[0] ? scored[0].s : null;
}

async function pipedFetch(pathAndQuery) {
    let lastErr;
    for (const base of PIPED_INSTANCES) {
        try {
            const res = await fetch(base + pathAndQuery, { signal: AbortSignal.timeout(8000) });
            if (!res.ok) throw new Error("HTTP " + res.status);
            return await res.json();
        } catch (e) {
            lastErr = e;
        }
    }
    throw lastErr || new Error("All Piped instances failed");
}

async function searchViaPiped(q) {
    let json;
    try {
        json = await pipedFetch(`/search?q=${encodeURIComponent(q)}&filter=music_songs`);
    } catch {
        json = await pipedFetch(`/search?q=${encodeURIComponent(q)}&filter=videos`);
    }
    const items = json.items || json || [];
    return (Array.isArray(items) ? items : [])
        .filter(it => it.url || it.id || it.videoId)
        .map(it => {
            const id = it.id || it.videoId ||
                (it.url || "").replace(/^.*[?&]v=/, "").replace(/&.*/, "") ||
                (it.url || "").split("/").pop();
            return {
                source: "piped",
                id,
                title: it.title || "Untitled",
                artist: (it.uploaderName || it.uploader || it.author || "YouTube").toString(),
                artwork: it.thumbnail || (it.thumbnails && it.thumbnails[0]) || null,
                plays: it.views || it.viewCount || 0,
                preview: false
            };
        })
        .filter(t => t.id && t.title)
        .slice(0, 25);
}

async function playViaPiped(id) {
    const json = await pipedFetch(`/streams/${encodeURIComponent(id)}`);
    const best = pickBestAudio(json.audioStreams || []);
    if (!best || !best.url) throw new Error("No audio stream found");
    return { url: best.url, title: json.title || null, artist: json.uploader || json.uploaderName || null };
}

async function getAudiusHost() {
    if (_audiusHost) return _audiusHost;
    try {
        const res = await fetch("https://api.audius.co");
        const json = await res.json();
        const hosts = json.data || [];
        _audiusHost = (hosts[0] || "https://discoveryprovider.audius.co").replace(/\/$/, "");
    } catch {
        _audiusHost = "https://discoveryprovider.audius.co";
    }
    return _audiusHost;
}

async function searchFreeMusic() {
    const input = document.getElementById("music-search-input");
    const status = document.getElementById("music-search-status");
    const list = document.getElementById("music-search-results");
    if (!input || !list) return;
    const q = input.value.trim();
    if (!q) {
        showToast("Type a song, artist, or genre", "warn");
        return;
    }
    if (!navigator.onLine) {
        showToast("📡 Offline — use your local library", "warn");
        return;
    }
    if (status) status.textContent = "Searching…";
    list.innerHTML = "";
    _musicResults = [];

    // 1) YouTube via Piped, called directly from the browser — no local server needed
    try {
        const tracks = await searchViaPiped(q);
        if (tracks.length) {
            _musicResults = tracks;
            if (status) status.textContent = _musicResults.length + " tracks (YouTube)";
            renderMusicResults(list);
            return;
        }
    } catch (e) {
        console.warn("Piped search failed:", e);
        if (status) status.textContent = "YouTube search unavailable — trying Audius…";
    }

    // 2) Audius fallback (no backend needed)
    try {
        const host = await getAudiusHost();
        const res = await fetch(`${host}/v1/tracks/search?query=${encodeURIComponent(q)}&app_name=Momento&limit=25`);
        const json = await res.json();
        let tracks = (json.data || [])
            .filter(t => t && t.id && t.title)
            .sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
            .slice(0, 20);
        if (tracks.length) {
            _musicResults = tracks.map(t => ({
                source: "audius",
                id: t.id,
                title: t.title,
                artist: (t.user && (t.user.name || t.user.handle)) || "Unknown",
                artwork: t.artwork && (t.artwork["150x150"] || t.artwork["480x480"]),
                plays: t.play_count || 0,
                preview: false
            }));
            if (status) status.textContent = _musicResults.length + " tracks (Audius · backend off)";
            renderMusicResults(list);
            return;
        }
    } catch (e) {
        console.warn("Audius failed", e);
    }

    if (status) status.textContent = "No results — try another query";
    showToast("No results from YouTube or Audius right now — try again in a bit", "warn");
}

function renderMusicResults(list) {
    list.innerHTML = _musicResults.map((t, i) => {
        const title = String(t.title || "Untitled").replace(/[<>&]/g, "");
        const artist = String(t.artist || "").replace(/[<>&"]/g, "");
        const plays = t.plays >= 1000 ? Math.round(t.plays / 1000) + "k" : (t.plays || "");
        const art = t.artwork
            ? `<img class="msi-art" src="${t.artwork}" alt="" loading="lazy" referrerpolicy="no-referrer">`
            : `<div class="msi-art msi-art-ph">♪</div>`;
        return `<li class="music-search-item">
            ${art}
            <div class="msi-meta"><strong>${title}</strong><span>${artist}${plays ? " · " + plays : ""}</span></div>
            <button type="button" class="btn-primary" onclick="playMusicResult(${i})">Play</button>
        </li>`;
    }).join("");
}

async function playMusicResult(i) {
    const t = _musicResults[i];
    if (!t) return;
    if (!navigator.onLine) {
        showToast("📡 Offline — can't stream", "warn");
        return;
    }
    const status = document.getElementById("music-search-status");
    if (status) status.textContent = "Loading…";

    try {
        let url = null;
        if (t.source === "piped") {
            const data = await playViaPiped(t.id);
            url = data.url;
            if (data.title) t.title = data.title;
            if (data.artist) t.artist = data.artist;
        } else if (t.source === "audius") {
            const host = await getAudiusHost();
            url = `${host}/v1/tracks/${encodeURIComponent(t.id)}/stream?app_name=Momento`;
        }
        if (!url) throw new Error("no stream");

        stopLocalPlay();
        const audio = document.getElementById("stream-audio");
        if (!audio) return;
        audio.removeAttribute("crossorigin");
        audio.src = url;
        audio.volume = _musicVolume;
        audio.load();
        await audio.play();
        _streamPlaying = true;
        _archivePlaying = true;
        _npSource = "archive";
        showNowPlaying(t.title, t.artist || "", "archive");
        if (status) status.textContent = "Playing";
        audio.onended = () => {
            _streamPlaying = false;
            _archivePlaying = false;
            updateNpPlayBtn();
        };
        audio.onerror = () => {
            showToast("Couldn't play — try another track", "warn");
            if (status) status.textContent = "Playback error";
            _streamPlaying = false;
            _archivePlaying = false;
        };
    } catch (e) {
        console.error(e);
        showToast("Playback failed — YouTube source may be temporarily down, try another track", "warn");
        if (status) status.textContent = "Playback failed";
    }
}

async function playArchiveByIndex(i) { return playMusicResult(i); }
async function playArchiveItem() {}

function toggleArchivePlay() {
    const audio = document.getElementById("stream-audio");
    if (!audio || !audio.src) return;
    if (_streamPlaying || _archivePlaying) {
        audio.pause();
        _streamPlaying = false;
        _archivePlaying = false;
    } else {
        audio.play().then(() => {
            _streamPlaying = true;
            _archivePlaying = true;
        }).catch(() => {});
    }
    updateNpPlayBtn();
}

function stopStream() {
    const audio = document.getElementById("stream-audio");
    if (audio) { audio.pause(); audio.removeAttribute("src"); audio.load(); }
    _streamPlaying = false;
    _archivePlaying = false;
    updateNpPlayBtn();
}

function openMusicDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(LOCAL_MUSIC_DB, 1);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(LOCAL_MUSIC_STORE)) {
                db.createObjectStore(LOCAL_MUSIC_STORE, { keyPath: "id" });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function saveTrackToDB(track) {
    const db = await openMusicDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(LOCAL_MUSIC_STORE, "readwrite");
        tx.objectStore(LOCAL_MUSIC_STORE).put(track);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function loadTracksFromDB() {
    try {
        const db = await openMusicDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(LOCAL_MUSIC_STORE, "readonly");
            const req = tx.objectStore(LOCAL_MUSIC_STORE).getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    } catch (e) {
        console.warn("IDB load fail", e);
        return [];
    }
}

async function deleteTrackFromDB(id) {
    const db = await openMusicDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(LOCAL_MUSIC_STORE, "readwrite");
        tx.objectStore(LOCAL_MUSIC_STORE).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function initLocalLibrary() {
    const rows = await loadTracksFromDB();
    _localTracks = rows.map(r => ({
        id: r.id,
        name: r.name,
        artist: r.artist || "Local file",
        blob: r.blob,
        url: r.blob ? URL.createObjectURL(r.blob) : null
    }));
    renderLocalTrackList();
}

function renderLocalTrackList() {
    const list = document.getElementById("local-track-list");
    if (!list) return;
    if (!_localTracks.length) {
        list.innerHTML = `<li class="music-track-label">No tracks yet — add some files</li>`;
        return;
    }
    list.innerHTML = _localTracks.map((t, i) => `
        <li class="local-track-item ${_localPlaying && _localIndex === i ? "playing" : ""}">
            <span class="local-track-name" title="${t.name.replace(/"/g, "")}">${t.name.replace(/[<>]/g, "")}</span>
            <div class="local-track-actions">
                <button type="button" class="btn-primary btn-sm" onclick="playLocalByIndex(${i})">${_localPlaying && _localIndex === i ? "⏸" : "▶"}</button>
                <button type="button" class="btn-danger btn-sm" onclick="removeLocalTrack(${i})" title="Remove">✕</button>
            </div>
        </li>
    `).join("");
}

async function loadLocalTracks(event) {
    const files = event.target.files;
    if (!files || !files.length) return;
    for (const f of files) {
        const id = Date.now() + "_" + Math.random().toString(36).slice(2, 8);
        const track = { id, name: f.name, artist: "Local file", blob: f };
        await saveTrackToDB(track);
        _localTracks.push({
            id,
            name: f.name,
            artist: "Local file",
            blob: f,
            url: URL.createObjectURL(f)
        });
    }
    renderLocalTrackList();
    showToast(`Added ${files.length} track(s) to library`, "info");
    event.target.value = "";
}

function playLocalByIndex(i) {
    if (i < 0 || i >= _localTracks.length) return;
    const audio = document.getElementById("local-audio");
    if (!audio) return;
    if (_localPlaying && _localIndex === i) {
        audio.pause();
        _localPlaying = false;
        updateNpPlayBtn();
        renderLocalTrackList();
        return;
    }
    stopStream();
    _localIndex = i;
    const track = _localTracks[i];
    if (!track.url && track.blob) track.url = URL.createObjectURL(track.blob);
    audio.src = track.url;
    audio.volume = _musicVolume;
    audio.play().then(() => {
        _localPlaying = true;
        _npSource = "local";
        showNowPlaying(track.name, track.artist || "Local file", "local");
        updateNpPlayBtn();
        renderLocalTrackList();
    }).catch(err => {
        console.error(err);
        showToast("Couldn't play that file", "warn");
    });
    audio.onended = () => {
        if (_localIndex < _localTracks.length - 1) playLocalByIndex(_localIndex + 1);
        else {
            _localPlaying = false;
            updateNpPlayBtn();
            renderLocalTrackList();
        }
    };
}

function toggleLocalPlayByIndex(i) {
    playLocalByIndex(typeof i === "number" ? i : _localIndex);
}

function toggleLocalPlay() {
    playLocalByIndex(_localIndex);
}

async function removeLocalTrack(i) {
    const track = _localTracks[i];
    if (!track) return;
    if (_localPlaying && _localIndex === i) stopLocalPlay();
    try { if (track.url) URL.revokeObjectURL(track.url); } catch (e) {}
    await deleteTrackFromDB(track.id);
    _localTracks.splice(i, 1);
    if (_localIndex >= _localTracks.length) _localIndex = Math.max(0, _localTracks.length - 1);
    renderLocalTrackList();
}

function stopLocalPlay() {
    const audio = document.getElementById("local-audio");
    if (audio) audio.pause();
    _localPlaying = false;
    updateNpPlayBtn();
    renderLocalTrackList();
}

function nextLocalTrack(auto) {
    if (!_localTracks.length) return;
    const next = (_localIndex + 1) % _localTracks.length;
    playLocalByIndex(next);
}

function closeProgressPanel() {
    setTimeout(updateNowPlayingVisibility, 50);
    const panel = document.getElementById("progress-panel");
    if (panel) panel.classList.add("hidden");
}

function toggleTodoDrawer() {
    setTimeout(updateNowPlayingVisibility, 50);
    const d = document.getElementById("todo-drawer");
    if (!d) return;
    d.classList.toggle("hidden");
    if (!d.classList.contains("hidden")) renderTodos();
}

function openTimelinePage() {
    setTimeout(updateNowPlayingVisibility, 50);
    if (!isFeatureUnlocked("timeline")) {
        const info = getLevelInfo(data.xp || 0);
        const need = LEVEL_TABLE[FEATURE_UNLOCKS.timeline];
        alert(`🔒 Timeline Visualizer is locked!\nReach ${need ? need.rank : "Beginner 1"} to unlock.\n(You are ${info.rank})`);
        return;
    }
    const page = document.getElementById("timeline-page");
    if (!page) return;
    page.classList.remove("hidden");
    renderTimelinePage();
}

function closeTimelinePage() {
    const page = document.getElementById("timeline-page");
    if (page) page.classList.add("hidden");
}

function renderTimelinePage() {
    const dayLabel = document.getElementById("timeline-page-day");
    if (dayLabel) dayLabel.textContent = DAYS[data.currentDay];
    renderTimeline();
    const legend = document.getElementById("timeline-legend");
    if (legend) {
        const day = DAYS[data.currentDay];
        const tasks = data.schedules[day] || [];
        const items = [];
        tasks.forEach((t, i) => {
            if (t.isSleep) return;
            items.push(`
                <div class="tl-legend-item">
                    <span class="tl-legend-time">${t.start}–${t.end}</span>
                    <span class="tl-legend-name">${t.task || "Untitled"}${t.completed ? " ✓" : ""}</span>
                    <button type="button" class="tl-legend-del" onclick="timelineRemoveBlock(${i})" title="Remove">✕</button>
                </div>`);
        });
        legend.innerHTML = items.join("") || "<em class='todo-empty'>No blocks — click + Add</em>";
    }
}

function timelineAddBlock() {
    const day = DAYS[data.currentDay];
    if (!data.schedules[day]) data.schedules[day] = [];
    const tasks = data.schedules[day].filter(t => !t.isSleep);
    let startM = 9 * 60;
    if (tasks.length) {
        const last = tasks[tasks.length - 1];
        startM = timeToMinutes(last.end);
        if (startM >= 22 * 60) startM = 8 * 60;
    }
    const endM = Math.min(startM + 60, 23 * 60 + 45);
    data.schedules[day].push({
        start: formatMinutes(startM),
        end: formatMinutes(endM),
        task: "New block",
        completed: false
    });
    data.schedules[day].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
    saveData();
    renderTimelinePage();
    renderTasks();
}

function timelineRemoveBlock(index) {
    const day = DAYS[data.currentDay];
    const tasks = data.schedules[day] || [];
    if (index < 0 || index >= tasks.length) return;
    if (tasks[index].isSleep) return;
    tasks.splice(index, 1);
    saveData();
    renderTimelinePage();
    renderTasks();
    renderWeeklyAnalytics();
}

/* ---------- FOCUS MODE / POMODORO ---------- */
let _focusTimerInterval = null;
let _focusSecondsLeft = 25 * 60;
let _focusIsRunning = false;
let _focusIsBreak = false;
let _focusTaskRef = null;
let _focusMicroTasks = [];
let _ambientAudioCtx = null;
let _ambientNodes = [];
let _currentAmbient = "none";

function openFocusMode(task, index) {
    _focusTaskRef = { task, index, day: DAYS[data.currentDay] };
    _focusMicroTasks = [];
    _focusIsBreak = false;
    _focusSecondsLeft = 25 * 60;
    _focusIsRunning = false;
    if (_focusTimerInterval) clearInterval(_focusTimerInterval);

    // Build / show modal
    let modal = document.getElementById("focus-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "focus-modal";
        modal.className = "modal-overlay";
        modal.innerHTML = `
            <div class="modal-box focus-box">
                <div class="modal-header">
                    <h3>🎯 Focus Mode</h3>
                    <button onclick="closeFocusMode()" class="close-btn">✕</button>
                </div>
                <div class="modal-body focus-body">
                    <div class="focus-task-name" id="focus-task-name"></div>
                    <div class="focus-timer" id="focus-timer">25:00</div>
                    <div class="focus-phase" id="focus-phase">Work Session</div>
                    <div class="focus-controls">
                        <button id="focus-start-btn" onclick="toggleFocusTimer()">▶ Start</button>
                        <button onclick="resetFocusTimer()">↺ Reset</button>
                        <button onclick="skipFocusPhase()">⏭ Skip</button>
                    </div>
                    <div class="focus-micro">
                        <div class="focus-micro-header">
                            <strong>Micro-tasks</strong>
                            <button onclick="addMicroTask()" class="btn-add-micro">+ Add</button>
                        </div>
                        <ul id="focus-micro-list"></ul>
                        <input type="text" id="focus-micro-input" placeholder="Add a tiny step..." onkeydown="if(event.key==='Enter')addMicroTask()">
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="closeFocusMode()" class="btn-cancel">Exit Focus</button>
                    <button onclick="completeFocusTask()" class="btn-save-final">✓ Mark Task Done</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById("focus-task-name").textContent = task.task || "Untitled Task";
    updateFocusTimerDisplay();
    renderMicroTasks();
    modal.classList.remove("hidden");
}

function closeFocusMode() {
    const modal = document.getElementById("focus-modal");
    if (modal) modal.classList.add("hidden");
    if (_focusTimerInterval) clearInterval(_focusTimerInterval);
    _focusIsRunning = false;
}

function updateFocusTimerDisplay() {
    const m = Math.floor(_focusSecondsLeft / 60);
    const s = _focusSecondsLeft % 60;
    const text = `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    const phaseText = _focusIsBreak ? "☕ Break Time" : "💪 Work Session";
    const startText = _focusIsRunning ? "⏸ Pause" : "▶ Start";
    ["focus-timer", "music-focus-timer"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    });
    ["focus-phase", "music-focus-phase"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = phaseText;
    });
    ["focus-start-btn", "music-focus-start"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = startText;
    });
}

function toggleFocusTimer() {
    if (_focusIsRunning) {
        clearInterval(_focusTimerInterval);
        _focusIsRunning = false;
    } else {
        _focusIsRunning = true;
        _focusTimerInterval = setInterval(() => {
            if (_focusSecondsLeft <= 0) {
                clearInterval(_focusTimerInterval);
                _focusIsRunning = false;
                playChime();
                // Switch phase
                if (_focusIsBreak) {
                    _focusIsBreak = false;
                    _focusSecondsLeft = 25 * 60;
                } else {
                    _focusIsBreak = true;
                    _focusSecondsLeft = 5 * 60;
                }
                updateFocusTimerDisplay();
                return;
            }
            _focusSecondsLeft--;
            updateFocusTimerDisplay();
        }, 1000);
    }
    updateFocusTimerDisplay();
}

function resetFocusTimer() {
    clearInterval(_focusTimerInterval);
    _focusIsRunning = false;
    _focusIsBreak = false;
    _focusSecondsLeft = 25 * 60;
    updateFocusTimerDisplay();
}

function skipFocusPhase() {
    clearInterval(_focusTimerInterval);
    _focusIsRunning = false;
    if (_focusIsBreak) {
        _focusIsBreak = false;
        _focusSecondsLeft = 25 * 60;
    } else {
        _focusIsBreak = true;
        _focusSecondsLeft = 5 * 60;
    }
    updateFocusTimerDisplay();
}

function completeFocusTask() {
    if (!_focusTaskRef) return;
    const { task, day } = _focusTaskRef;
    if (!task.completed) {
        task.completed = true;
        awardXPForTask(task);
        saveData();
        renderCurrentDay();
    }
    closeFocusMode();
}

function addMicroTask() {
    const input = document.getElementById("focus-micro-input");
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    _focusMicroTasks.push({ text, done: false });
    input.value = "";
    renderMicroTasks();
}

function toggleMicroTask(i) {
    if (_focusMicroTasks[i]) {
        _focusMicroTasks[i].done = !_focusMicroTasks[i].done;
        renderMicroTasks();
    }
}

function removeMicroTask(i) {
    _focusMicroTasks.splice(i, 1);
    renderMicroTasks();
}

function renderMicroTasks() {
    const list = document.getElementById("focus-micro-list");
    if (!list) return;
    list.innerHTML = _focusMicroTasks.map((m, i) => `
        <li class="micro-item ${m.done ? "done" : ""}">
            <input type="checkbox" ${m.done ? "checked" : ""} onchange="toggleMicroTask(${i})">
            <span>${m.text}</span>
            <button class="micro-remove" onclick="removeMicroTask(${i})">✕</button>
        </li>
    `).join("");
}

function stopAmbient() { /* removed */ }
function setAmbient() { /* removed */ }

/* =========================================================
   PERSISTENT TO-DO LIST
   ========================================================= */
function addTodo() {
    const input = document.getElementById("todo-input");
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    data.todos = data.todos || [];
    data.todos.push({
        id: Date.now() + Math.random().toString(36).slice(2,7),
        text,
        completed: false,
        created: new Date().toISOString(),
        createdAt: Date.now()
    });
    input.value = "";
    saveData();
    renderTodos();
}

function toggleTodo(id) {
    const t = (data.todos || []).find(x => x.id === id);
    if (!t) return;
    const was = t.completed;
    const baseXP = 40;

    if (!was) {
        // Completing — enforce min 5 minutes since created
        const created = t.createdAt || (t.created ? Date.parse(t.created) : Date.now());
        const elapsedMin = (Date.now() - created) / 60000;
        const infoBefore = getLevelInfo(data.xp || 0);

        if (elapsedMin < 5) {
            // Anti-farm: delete the to-do + heavy penalty = half of this rank's step cost
            const stepCost = infoBefore.needed || 100;
            const penalty = Math.max(25, Math.round(stepCost / 2));
            data.xp = Math.max(0, (data.xp || 0) - penalty);
            data.todos = (data.todos || []).filter(x => x.id !== id);
            const infoAfter = getLevelInfo(data.xp || 0);
            saveData();
            updateXPDisplay();
            renderTodos();
            showToast(`🚫 To-do under 5 min — deleted & −${penalty} XP (½ rank step)`, "warn");
            if (infoAfter.levelIndex < infoBefore.levelIndex) {
                showLevelDown(infoBefore.rank, infoAfter.rank);
                enforceLocksAfterXPChange();
            }
            return;
        }

        // Normal complete
        t.completed = true;
        t.xpAwarded = baseXP;
        data.xp = (data.xp || 0) + baseXP;
        data.totalTasksCompleted = (data.totalTasksCompleted || 0) + 1;
        const todayStr = new Date().toDateString();
        if (data.lastCompletedDate !== todayStr) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (data.lastCompletedDate === yesterday.toDateString()) {
                data.streak = (data.streak || 0) + 1;
            } else {
                data.streak = 1;
            }
            data.lastCompletedDate = todayStr;
        }
        const infoAfter = getLevelInfo(data.xp || 0);
        showXPPopup(baseXP, t.text, infoAfter);
        playRewardSound("complete");
        updateXPDisplay();
        if (infoAfter.levelIndex > infoBefore.levelIndex) {
            checkAndUnlockRewards(infoAfter.levelIndex);
            showLevelUp(infoAfter.rank);
            playRewardSound("levelup");
        }
    } else {
        // Unchecking a legitimately completed to-do — claw back the +XP only
        // (penalty path deletes the item, so we never get here for penalties)
        const loss = typeof t.xpAwarded === "number" && t.xpAwarded > 0 ? t.xpAwarded : baseXP;
        const infoBefore = getLevelInfo(data.xp || 0);
        data.xp = Math.max(0, (data.xp || 0) - loss);
        data.totalTasksCompleted = Math.max(0, (data.totalTasksCompleted || 0) - 1);
        t.completed = false;
        t.xpAwarded = 0;
        const infoAfter = getLevelInfo(data.xp || 0);
        updateXPDisplay();
        if (infoAfter.levelIndex < infoBefore.levelIndex) {
            showLevelDown(infoBefore.rank, infoAfter.rank);
            enforceLocksAfterXPChange();
        }
    }
    saveData();
    renderTodos();
}

function removeTodo(id) {
    data.todos = (data.todos || []).filter(x => x.id !== id);
    saveData();
    renderTodos();
}

function renderTodos() {
    const list = document.getElementById("todo-list");
    const todos = data.todos || [];
    const incomplete = todos.filter(t => !t.completed).length;
    const badge = document.getElementById("todo-count-badge");
    if (badge) {
        badge.textContent = incomplete;
        badge.style.display = incomplete > 0 ? "inline-flex" : "none";
    }
    if (!list) return;
    if (todos.length === 0) {
        list.innerHTML = `<li class="todo-empty">No lasting to-dos yet. Add one below!</li>`;
        return;
    }
    const sorted = [...todos].sort((a,b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
    list.innerHTML = sorted.map(t => `
        <li class="todo-item ${t.completed ? "done" : ""}">
            <input type="checkbox" ${t.completed ? "checked" : ""} onchange="toggleTodo('${t.id}')">
            <span class="todo-text">${t.text}</span>
            <button class="todo-remove" onclick="removeTodo('${t.id}')" title="Remove">✕</button>
        </li>
    `).join("");
}

/* =========================================================
   TIMELINE VISUALIZER — vertical (Google Calendar style)
   ========================================================= */
let _tlDrag = null;

function renderTimeline() {
    const container = document.getElementById("timeline-viz");
    if (!container) return;
    const day = DAYS[data.currentDay];
    container.innerHTML = "";
    container.className = "timeline-viz timeline-viz-vertical";

    const wrap = document.createElement("div");
    wrap.className = "tl-vertical-wrap";

    // Hour gutter + track
    const gutter = document.createElement("div");
    gutter.className = "tl-gutter";
    const track = document.createElement("div");
    track.className = "tl-vtrack";

    // 24 hours, each hour = 48px → total 1152px
    const PX_PER_MIN = 64 / 60; // 64px per hour — roomier

    for (let h = 0; h < 24; h++) {
        const hourLbl = document.createElement("div");
        hourLbl.className = "tl-vhour";
        hourLbl.style.top = (h * 64) + "px";
        hourLbl.textContent = String(h).padStart(2, "0") + ":00";
        gutter.appendChild(hourLbl);

        const line = document.createElement("div");
        line.className = "tl-hline";
        line.style.top = (h * 64) + "px";
        track.appendChild(line);
    }
    track.style.height = (24 * 64) + "px";
    gutter.style.height = (24 * 64) + "px";

    // Now line
    if (data.currentDay === getTodayIndex()) {
        const now = new Date();
        const mins = now.getHours() * 60 + now.getMinutes();
        const nowLine = document.createElement("div");
        nowLine.className = "tl-vnow";
        nowLine.style.top = (mins * PX_PER_MIN) + "px";
        track.appendChild(nowLine);
    }

    const dayTasks = data.schedules[day] || [];
    dayTasks.forEach((task, realIdx) => {
        if (task.isSleep) return;
        const s = timeToMinutes(task.start);
        const e = timeToMinutes(task.end);
        let dur = e > s ? e - s : (e + 1440 - s);
        if (dur <= 0) return;

        const block = document.createElement("div");
        block.className = "tl-vblock" + (task.completed ? " tl-done" : "") + (isTaskActive(task) ? " tl-active" : "");
        block.style.top = (s * PX_PER_MIN) + "px";
        block.style.height = Math.max(dur * PX_PER_MIN, 28) + "px";
        block.title = `${task.start}–${task.end}: ${task.task || "Untitled"}`;
        block.innerHTML = `
            <div class="tl-vhandle tl-vhandle-top" data-mode="resize-start"></div>
            <div class="tl-vlabel">
                <strong>${task.start}–${task.end}</strong>
                <span>${task.task || "Untitled"}</span>
            </div>
            <div class="tl-vhandle tl-vhandle-bot" data-mode="resize-end"></div>
        `;

        block.addEventListener("mousedown", e => {
            if (e.button !== 0) return;
            e.preventDefault();
            const mode = e.target.dataset.mode || "move";
            const endMin = timeToMinutes(task.end);
            const resolvedEnd = endMin > s ? endMin : endMin + 1440;
            _tlDrag = {
                index: realIdx,
                mode,
                startY: e.clientY,
                origStart: s,
                origEnd: resolvedEnd,
                trackRect: track.getBoundingClientRect(),
                pxPerMin: PX_PER_MIN
            };
            block.classList.add("tl-dragging");
            document.addEventListener("mousemove", onTimelineDrag);
            document.addEventListener("mouseup", onTimelineDrop);
        });

        track.appendChild(block);
    });

    wrap.appendChild(gutter);
    wrap.appendChild(track);
    container.appendChild(wrap);
}

function onTimelineDrag(e) {
    if (!_tlDrag) return;
    const { index, mode, startY, origStart, origEnd, trackRect, pxPerMin } = _tlDrag;
    const day = DAYS[data.currentDay];
    const tasks = data.schedules[day] || [];
    const task = tasks[index];
    if (!task || task.isSleep) return;

    const dy = e.clientY - startY;
    const minsDelta = Math.round((dy / pxPerMin) / 15) * 15;

    let newStart = origStart;
    let newEnd = origEnd;

    if (mode === "move") {
        newStart = Math.max(0, Math.min(1440 - 15, origStart + minsDelta));
        const dur = origEnd - origStart;
        newEnd = newStart + dur;
        if (newEnd > 1440) { newEnd = 1440; newStart = newEnd - dur; }
    } else if (mode === "resize-start") {
        newStart = Math.max(0, Math.min(origEnd - 15, origStart + minsDelta));
    } else if (mode === "resize-end") {
        newEnd = Math.max(origStart + 15, Math.min(1440, origEnd + minsDelta));
    }

    task.start = formatMinutes(newStart % 1440);
    task.end = formatMinutes(newEnd % 1440);
    renderTimeline();
}

function onTimelineDrop() {
    if (!_tlDrag) return;
    document.removeEventListener("mousemove", onTimelineDrag);
    document.removeEventListener("mouseup", onTimelineDrop);
    _tlDrag = null;
    saveData();
    renderTasks();
    renderWeeklyAnalytics();
    updateNextTask();
    updateActiveTask();
}

function formatMinutes(m) {
    m = ((m % 1440) + 1440) % 1440;
    return String(Math.floor(m / 60)).padStart(2,"0") + ":" + String(m % 60).padStart(2,"0");
}

/* =========================================================
   WEEK ANALYSER
   ========================================================= */

const ANALYSER_INTENTS = {
    relax: {
        label: "Relax / Holiday",
        prompt: "relaxing chill holiday vacation rest recovery free time leisure easy slow calm peaceful weekend fun enjoy hobbies",
        checks: {
            minSleepHours: 8,
            wantedCats: ["🎮 Gaming/Relax"],
            unwantedCats: ["📚 Study/Work"],
            maxWorkPct: 15,
            minRelaxPct: 35,
            label: "relax/holiday"
        }
    },
    work: {
        label: "Full Work Flow",
        prompt: "work deep work focus blocks productivity meetings deadlines coding dev project sprint professional hustle grind career",
        checks: {
            minSleepHours: 7,
            wantedCats: ["📚 Study/Work"],
            unwantedCats: [],
            minWorkPct: 35,
            label: "work"
        }
    },
    study: {
        label: "School / Study",
        prompt: "study school revision homework exam lecture notes flashcard assignment quiz mock past paper syllabus subject tutor",
        checks: {
            minSleepHours: 8,
            wantedCats: ["📚 Study/Work"],
            unwantedCats: [],
            minWorkPct: 30,
            label: "study school exam revision"
        }
    },
    gaming: {
        label: "Gaming Week",
        prompt: "gaming game games free time relax chill fun minecraft youtube netflix movie music leisure hobby",
        checks: {
            minSleepHours: 7,
            wantedCats: ["🎮 Gaming/Relax"],
            unwantedCats: [],
            minRelaxPct: 30,
            label: "gaming relax free time chill"
        }
    },
    fitness: {
        label: "Workout Week",
        prompt: "gym workout fitness cardio weights run running training exercise hiit crossfit cycling swim yoga pilates gains muscle athletic",
        checks: {
            minSleepHours: 8,
            wantedCats: ["🏃 Exercise"],
            unwantedCats: [],
            minExercisePct: 15,
            label: "fitness workout gym exercise training"
        }
    }
};

let _analyserIntent = null;

function openAnalyser() {
    if (!isFeatureUnlocked("analyser")) {
        const info = getLevelInfo(data.xp || 0);
        const need = LEVEL_TABLE[FEATURE_UNLOCKS.analyser];
        alert(`🔒 Week Analyser is locked!\nReach ${need ? need.rank : "Beginner 3"} to unlock.\n(You are ${info.rank})`);
        return;
    }
    _analyserIntent = null;
    document.querySelectorAll(".intent-pill").forEach(p => p.classList.remove("selected"));
    document.getElementById("analyser-results").innerHTML = "";
    document.getElementById("analyser-footer").style.display = "none";
    document.getElementById("analyser-modal").classList.remove("hidden");
}

function closeAnalyser() {
    document.getElementById("analyser-modal").classList.add("hidden");
}

function selectIntent(el) {
    document.querySelectorAll(".intent-pill").forEach(p => p.classList.remove("selected"));
    el.classList.add("selected");
    _analyserIntent = el.dataset.intent;
}

function runAnalysis() {
    if (!_analyserIntent) {
        alert("Pick a week type first.");
        return;
    }

    const cfg = ANALYSER_INTENTS[_analyserIntent].checks;
    const container = document.getElementById("analyser-results");
    let totalIssues = 0;
    let html = "<div class='analyser-results-grid'>";

    DAYS.forEach(day => {
        const tasks = (data.schedules[day] || []).filter(t => t.task);
        if (tasks.length === 0) return;

        // --- Sleep check ---
        const sleepTask = tasks.find(t => /sleep|zzz|bed/i.test(t.task) || t.isSleep);
        let sleepHours = 0;
        if (sleepTask) {
            const s = timeToMinutes(sleepTask.start);
            const e = timeToMinutes(sleepTask.end);
            // sleep crosses midnight: end < start means it wraps
            sleepHours = e <= s ? (e + 1440 - s) / 60 : (e - s) / 60;
        }
        const sleepOk = sleepHours >= cfg.minSleepHours;
        const sleepWarn = sleepHours > 0 && sleepHours < cfg.minSleepHours;

        // --- Category breakdown for this day ---
        const dayMins = {};
        let totalMins = 0;
        tasks.forEach(t => {
            const s = timeToMinutes(t.start), e = timeToMinutes(t.end);
            if (e > s) {
                const cat = detectCategory(t.task);
                dayMins[cat] = (dayMins[cat] || 0) + (e - s);
                totalMins += (e - s);
            }
        });

        const pct = cat => totalMins > 0 ? Math.round(((dayMins[cat] || 0) / totalMins) * 100) : 0;

        // --- Intent-specific checks ---
        const checks = [];

        // Sleep
        if (sleepHours === 0) {
            checks.push({ icon: "icon-warn", sym: "⚠️", text: "No sleep block detected" });
            totalIssues++;
        } else if (!sleepOk) {
            checks.push({ icon: "icon-warn", sym: "⚠️", text: `Sleep: ${sleepHours.toFixed(1)}h (need ${cfg.minSleepHours}h+)` });
            totalIssues++;
        } else {
            checks.push({ icon: "icon-ok", sym: "✅", text: `Sleep: ${sleepHours.toFixed(1)}h ✓` });
        }

        // Work/study check
        if (cfg.minWorkPct) {
            const wp = pct("📚 Study/Work");
            if (wp < cfg.minWorkPct) {
                checks.push({ icon: "icon-bad", sym: "❌", text: `Study/Work: ${wp}% (need ${cfg.minWorkPct}%+)` });
                totalIssues++;
            } else {
                checks.push({ icon: "icon-ok", sym: "✅", text: `Study/Work: ${wp}% ✓` });
            }
        }

        // Relax check
        if (cfg.minRelaxPct) {
            const rp = pct("🎮 Gaming/Relax");
            if (rp < cfg.minRelaxPct) {
                checks.push({ icon: "icon-bad", sym: "❌", text: `Relax/Gaming: ${rp}% (need ${cfg.minRelaxPct}%+)` });
                totalIssues++;
            } else {
                checks.push({ icon: "icon-ok", sym: "✅", text: `Relax/Gaming: ${rp}% ✓` });
            }
        }

        // Exercise check
        if (cfg.minExercisePct) {
            const ep = pct("🏃 Exercise");
            if (ep < cfg.minExercisePct) {
                checks.push({ icon: "icon-bad", sym: "❌", text: `Exercise: ${ep}% (need ${cfg.minExercisePct}%+)` });
                totalIssues++;
            } else {
                checks.push({ icon: "icon-ok", sym: "✅", text: `Exercise: ${ep}% ✓` });
            }
        }

        // Too much work on a relax week
        if (cfg.maxWorkPct !== undefined) {
            const wp = pct("📚 Study/Work");
            if (wp > cfg.maxWorkPct) {
                checks.push({ icon: "icon-bad", sym: "❌", text: `Too much work: ${wp}% (max ${cfg.maxWorkPct}% for a ${cfg.label} week)` });
                totalIssues++;
            }
        }

        html += `<div class="analyser-day-card">
            <div class="analyser-day-title">${day}</div>
            ${checks.map(c => `<div class="analyser-check"><span class="${c.icon}">${c.sym}</span><span>${c.text}</span></div>`).join("")}
        </div>`;
    });

    html += "</div>";

    const summaryColor = totalIssues === 0 ? "#20bf6b" : totalIssues <= 3 ? "#fdcb6e" : "#ff4757";
    const summaryText = totalIssues === 0
        ? `✅ Your schedule perfectly matches a <strong>${ANALYSER_INTENTS[_analyserIntent].label}</strong> week!`
        : `Found <strong>${totalIssues} issue(s)</strong> — your schedule doesn't fully match a <strong>${ANALYSER_INTENTS[_analyserIntent].label}</strong> week. Hit "Regenerate" to fix it.`;

    container.innerHTML = `<div class="analyser-summary" style="border-color:${summaryColor}; color:${summaryColor}">${summaryText}</div>` + html;
    document.getElementById("analyser-footer").style.display = totalIssues > 0 ? "flex" : "none";
}

let _previewWeek = null;
let _previewDay = "Monday";

function applyAnalyserFix() {
    if (!_analyserIntent) return;
    const prompt = ANALYSER_INTENTS[_analyserIntent].prompt;
    try {
        _previewWeek = generateSmartWeekFromIntent(prompt);
    } catch(e) { console.error(e); return; }
    _previewDay = "Monday";
    closeAnalyser();
    openPreview();
}

function openPreview() {
    renderPreviewTabs();
    renderPreviewDay();
    document.getElementById("preview-modal").classList.remove("hidden");
}

function closePreview() {
    document.getElementById("preview-modal").classList.add("hidden");
    _previewWeek = null;
}

function renderPreviewTabs() {
    const c = document.getElementById("preview-day-tabs");
    if (!c) return;
    c.innerHTML = "";
    DAYS.forEach(day => {
        const btn = document.createElement("button");
        btn.className = `builder-tab${day === _previewDay ? " active" : ""}`;
        btn.textContent = day.substring(0, 3);
        btn.onclick = () => { _previewDay = day; renderPreviewTabs(); renderPreviewDay(); };
        c.appendChild(btn);
    });
}

function renderPreviewDay() {
    const c = document.getElementById("preview-blocks");
    if (!c || !_previewWeek) return;
    const tasks = _previewWeek[_previewDay] || [];
    c.innerHTML = tasks.map((t, i) => `
        <div class="preview-block-row">
            <span class="preview-time">${t.start} – ${t.end}</span>
            <input type="text" value="${t.task || ""}" oninput="_previewWeek['${_previewDay}'][${i}].task=this.value" class="preview-task-input">
        </div>
    `).join("");
}

function keepPreview() {
    if (!_previewWeek) return;
    DAYS.forEach(day => {
        data.schedules[day] = JSON.parse(JSON.stringify(_previewWeek[day] || []));
    });
    data.appliedRoutine = `AI: ${ANALYSER_INTENTS[_analyserIntent]?.label || "Generated"}`;
    saveData();
    renderCurrentDay();
    populatePresetMenus();
    closePreview();
    showSavedMessage(`✓ Applied: ${ANALYSER_INTENTS[_analyserIntent]?.label}`);
}

/* =========================================================
   PRESET MANAGEMENT & FROM-SCRATCH BUILDER LOGIC
   ========================================================= */

function renderPresetsManager() {
    const listContainer = document.getElementById("presets-manager-list");
    if (!listContainer) return;

    data.presets = data.presets || {};
    listContainer.innerHTML = "";

    const names = Object.keys(data.presets);

    if (names.length === 0) {
        listContainer.innerHTML = `<p style="color:#aaa; font-size:0.8rem;">No custom presets saved.</p>`;
        return;
    }

    names.forEach(name => {
        const row = document.createElement("div");
        row.className = "preset-item-row";
        row.innerHTML = `
            <span>${name}</span>
            <div class="preset-item-actions">
                <button onclick="applyNamedPreset('${name}')" class="btn-icon" title="Apply Preset">▶️</button>
                <button onclick="deletePreset('${name}')" class="btn-icon" title="Delete Preset">🗑️</button>
            </div>
        `;
        listContainer.appendChild(row);
    });
}

function saveCurrentAsPreset() {
    const input = document.getElementById("save-preset-input");
    const name = input ? input.value.trim() : "";

    if (!name) {
        alert("Please enter a name for your preset.");
        return;
    }

    data.presets[name] = deepClone(data.schedules);
    saveData();
    renderPresetsManager();
    populatePresetMenus();
    input.value = "";
    alert(`Saved current schedule as "${name}"!`);
}

function applyNamedPreset(name) {
    if (!data.presets[name]) return;
    if (!confirm(`Apply "${name}" to the entire week? XP from completed tasks will be removed.`)) return;
    const infoBefore = getLevelInfo(data.xp || 0);
    let lost = 0;
    DAYS.forEach(day => {
        if (typeof clawbackDayXP === "function") lost += clawbackDayXP(day, { silent: true });
    });
    DAYS.forEach(day => {
        data.schedules[day] = deepClone(data.presets[name][day] || []).map(t => ({
            ...t, completed: false, xpAwarded: false, xpAmount: 0
        }));
    });
    data.appliedRoutine = name;
    saveData();
    renderCurrentDay();
    updateXPDisplay();
    const infoAfter = getLevelInfo(data.xp || 0);
    if (infoAfter.levelIndex < infoBefore.levelIndex) {
        showLevelDown(infoBefore.rank, infoAfter.rank);
    }
    enforceLocksAfterXPChange();
    showSavedMessage(lost > 0
        ? `✓ "${name}" applied (−${lost} XP clawed back)`
        : `✓ "${name}" applied`);
}

function deletePreset(name) {
    if (Object.prototype.hasOwnProperty.call(BUILT_IN_PRESETS, name)) return alert("Built-in presets cannot be deleted.");
    if (confirm(`Are you sure you want to delete preset "${name}"?`)) {
        delete data.presets[name];
        saveData();
        renderPresetsManager();
        populatePresetMenus();
    }
}

function openScratchBuilder() {
    scratchPresetData = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] };
    activeBuilderDay = "Monday";
    
    document.getElementById("scratch-preset-title").value = "";
    renderBuilderTabs();
    renderBuilderTasks();
    document.getElementById("scratch-preset-modal").classList.remove("hidden");
}

function closeScratchBuilder() {
    document.getElementById("scratch-preset-modal").classList.add("hidden");
}

function renderBuilderTabs() {
    const container = document.getElementById("builder-day-tabs");
    if (!container) return;
    container.innerHTML = "";
    DAYS.forEach(day => {
        const btn = document.createElement("button");
        btn.className = `builder-tab ${day === activeBuilderDay ? "active" : ""}`;
        btn.textContent = day.substring(0, 3);
        btn.onclick = () => {
            activeBuilderDay = day;
            renderBuilderTabs();
            renderBuilderTasks();
        };
        container.appendChild(btn);
    });
}

function addSlotToScratchBuilder() {
    const start = document.getElementById("scratch-start").value;
    const end = document.getElementById("scratch-end").value;
    const task = document.getElementById("scratch-task-name").value.trim();

    if (!task) return alert("Please enter a task description.");

    scratchPresetData[activeBuilderDay].push({ start, end, task, completed: false });
    scratchPresetData[activeBuilderDay].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

    document.getElementById("scratch-task-name").value = "";
    renderBuilderTasks();
}

function removeSlotFromBuilder(index) {
    scratchPresetData[activeBuilderDay].splice(index, 1);
    renderBuilderTasks();
}

function renderBuilderTasks() {
    const container = document.getElementById("builder-tasks-container");
    if (!container) return;
    const tasks = scratchPresetData[activeBuilderDay] || [];

    if (tasks.length === 0) {
        container.innerHTML = `<p style="color:#aaa; font-size:0.8rem;">No slots added for ${activeBuilderDay} yet.</p>`;
        return;
    }

    container.innerHTML = tasks.map((t, idx) => `
        <div class="preset-item-row">
            <span><b>${t.start} - ${t.end}:</b> ${t.task}</span>
            <button onclick="removeSlotFromBuilder(${idx})" class="btn-icon">✕</button>
        </div>
    `).join("");
}

function saveScratchPreset() {
    const title = document.getElementById("scratch-preset-title").value.trim();
    if (!title) return alert("Please give your new preset a name.");

    data.presets[title] = scratchPresetData;
    saveData();
    renderPresetsManager();
    populatePresetMenus();
    closeScratchBuilder();
    alert(`Successfully created preset "${title}"!`);
}

/* GLOBAL EVENT LISTENERS */
document.addEventListener("input", event => {
    if (event.target.id === "daily-notes") {
        data.notes[DAYS[data.currentDay]] = event.target.value;
        saveData();
    }
});

document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveSchedule();
    }

    const tag = document.activeElement?.tagName;
    const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

    if (!typing) {
        if (event.key === "ArrowLeft") changeDay(-1);
        if (event.key === "ArrowRight") changeDay(1);
    }

    if (event.key === "Escape") {
        const sidebar = document.getElementById("preset-sidebar");
        if (sidebar && sidebar.classList.contains("open")) toggleSidebar();
        const todo = document.getElementById("todo-drawer");
        if (todo && !todo.classList.contains("hidden")) toggleTodoDrawer();
        const tl = document.getElementById("timeline-page");
        if (tl && !tl.classList.contains("hidden")) closeTimelinePage();
        const prog = document.getElementById("progress-panel");
        if (prog && !prog.classList.contains("hidden")) closeProgressPanel();
    }
});

document.addEventListener("click", (e) => {
    const sidebar = document.getElementById("preset-sidebar");
    const toggleBtn = document.getElementById("sidebar-toggle-btn");
    if (!sidebar || !sidebar.classList.contains("open")) return;

    if (!sidebar.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
        toggleSidebar();
    }
});



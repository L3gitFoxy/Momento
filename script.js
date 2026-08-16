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

const STORAGE_KEY = "Momento_data_v5";

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
    theme: { color: "#6c5ce7", hover: "#5b4cc4", alpha: "rgba(108, 92, 231, 0.25)" }
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
        }
    } catch (error) {
        console.error("Could not load Momento data:", error);
    }

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

/* THEME ACCENT PICKER */
function setAccentColor(color, hover, alpha) {
    data.theme = { color, hover, alpha };
    applySavedTheme();
    saveData();
}

function applySavedTheme() {
    if (!data.theme) return;
    document.documentElement.style.setProperty("--accent-color", data.theme.color);
    document.documentElement.style.setProperty("--accent-hover", data.theme.hover);
    document.documentElement.style.setProperty("--accent-light", data.theme.alpha);
}

/* RENDERING & DAY TABS */
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

/* EXPORT DATA FIX */
function exportData() {
    const exporting_data = [];
    exporting_data.push(BUILT_IN_PRESETS);
    return exporting_data;
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
    checkbox.addEventListener("change", () => {
        task.completed = checkbox.checked;
        saveData();
        renderTasks();
        renderProgressTracker();
    });

    // Start
    const start = document.createElement("input");
    start.type = "time";
    start.value = task.start || "09:00";
    start.addEventListener("change", () => {
        task.start = start.value;
        saveData();
        renderTasks();
        renderWeeklyAnalytics();
    });

    // End
    const end = document.createElement("input");
    end.type = "time";
    end.value = task.end || "10:00";
    end.addEventListener("change", () => {
        task.end = end.value;
        saveData();
        renderTasks();
        renderWeeklyAnalytics();
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

/* SLEEP BLOCK AUTO-FILL
   If the last block of a day is not a sleep block, auto-add
   Sleep 😴 from that block's end to the next day's first block start.
   Runs on every save & render so it stays in sync. */
function ensureSleepBlock() {
    DAYS.forEach((day, i) => {
        const tasks = data.schedules[day];
        if (!tasks || tasks.length === 0) return;

        // Remove any existing auto-sleep blocks first to avoid duplicates
        const withoutSleep = tasks.filter(t => !(t.isSleep));
        data.schedules[day] = withoutSleep;

        const last = withoutSleep[withoutSleep.length - 1];
        if (!last) return;

        // Already ends with a sleep-like task typed by the user — skip
        const isSleepTask = t => /sleep|zzz|bed/i.test(t.task || "");
        if (isSleepTask(last)) return;

        // Find next day's first non-sleep block start as the wake time
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
    if (!confirm(`Apply "${name}" to the ENTIRE week?`)) return;

    DAYS.forEach(day => data.schedules[day] = deepClone(data.presets[name][day] || []));
    data.appliedRoutine = name;
    saveData();
    renderCurrentDay();
    select.value = "";
    showSavedMessage(`✓ "${name}" applied to entire week.`);
}

function applySingleDayPreset() {
    const select = document.getElementById("single-day-preset-select");
    if (!select || !select.value) return alert("Select a preset first.");
    const name = select.value;
    const day = DAYS[data.currentDay];

    data.schedules[day] = deepClone(data.presets[name][day] || []);
    data.appliedRoutine = `${name} → ${day}`;
    saveData();
    renderCurrentDay();
    select.value = "";
    showSavedMessage(`✓ "${name}" applied to ${day}.`);
}

function applyCustomDayPreset(day,name){
    data.schedules[day] = deepClone(data.presets[name][day] || []);
    data.appliedRoutine = `${name} → ${day}`;
    saveData();
    renderCurrentDay();
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
function updateClock() {
    const clock = document.getElementById("live-clock");
    if (clock) {
        clock.textContent = "🕒 " + new Date().toLocaleTimeString([], { hour12: false, hour: "numeric", minute: "2-digit", second: "2-digit" });
    }
    const datee = document.getElementById("live-date");
    if (datee) {
        datee.textContent = new Date().toDateString();
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
        html += `<div class="status-chip chip-now"><span class="chip-label">NOW</span><span class="chip-text">${active.task || "Untitled"}</span><span class="chip-time">(${timeToMinutes(active.end) - current}m left)</span></div>`;
    }
    if (next) {
        html += `<div class="status-chip chip-next"><span class="chip-label">NEXT</span><span class="chip-text">${next.task || "Untitled"}</span><span class="chip-time">@ ${next.start} (in ${timeToMinutes(next.start) - current}m)</span></div>`;
    }
    if (!html) {
        html = `<div class="status-chip chip-idle"><span class="chip-text">☕ No active or upcoming tasks left for today</span></div>`;
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
    if (data.presets[name]) {
        DAYS.forEach(day => data.schedules[day] = deepClone(data.presets[name][day] || []));
        data.appliedRoutine = name;
        saveData();
        renderCurrentDay();
        alert(`Applied preset: ${name}`);
    }
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
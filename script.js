/* =========================================================
   SYNCDAY - ULTIMATE TIME BLOCK SCHEDULER (V5 COMPLETE)
   ========================================================= */

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

const STORAGE_KEY = "syncday_data_v5";

const CATEGORY_KEYWORDS = {
    "📚 Study": ["school", "study", "revise", "class", "hw", "homework", "science", "maths", "hindi","exam", "read"],
    "🏃 Exercise": ["football", "exercise", "physical", "play down", "sport"],
    "🎮 Gaming/Relax": ["minecraft", "gaming", "game", "relax", "tv", "do whatever", "free time", "wind down"],
    "🍔 Food": ["food", "dinner", "lunch", "breakfast", "eat"]
};

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
            { start: "20:30", end: "22:00", activity: "Read & Sleep Early" }
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
            { start: "20:30", end: "22:00", activity: "Read & Sleep Early" }
        ]
    }
};

/* APP STATE */
let data = {
    schedules: {},
    notes: {},
    presets: {},
    currentDay: getTodayIndex(),
    appliedRoutine: "Custom",
    lastResetWeek: getWeekIdentifier(),
    notificationsEnabled: false,
    theme: { color: "#6c5ce7", hover: "#5b4cc4", alpha: "rgba(108, 92, 231, 0.25)" }
};

let currentActiveTaskName = null;
let draggedRowIndex = null;

/* STARTUP */
document.addEventListener("DOMContentLoaded", () => {
    loadData();
    checkAutoWeeklyReset();
    ensureDays();
    applySavedTheme();
    buildDayTabs();
    populatePresetMenus();
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
        console.error("Could not load SyncDay data:", error);
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
        console.error("Could not save SyncDay data:", error);
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
        const header = document.querySelector(".header-section") || document.body;
        badge = document.createElement("div");
        badge.id = "progress-tracker-badge";
        badge.style.fontWeight = "bold";
        badge.style.marginTop = "6px";
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
    row.appendChild(categoryBadge);
    row.appendChild(deleteBtn);

    if (task.completed) row.classList.add("completed");
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

function saveSchedule() {
    const day = DAYS[data.currentDay];
    const notes = document.getElementById("daily-notes");
    if (notes) data.notes[day] = notes.value;

    data.schedules[day].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
    saveData();
    renderCurrentDay();
    showSavedMessage("✓ Saved & Sorted Successfully!");
}

/* WEEKLY TIME ANALYTICS */
function renderWeeklyAnalytics() {
    const container = document.getElementById("weekly-analytics-container");
    if (!container) return;

    let totals = { "📚 Study": 0, "🏃 Exercise": 0, "🎮 Gaming/Relax": 0, "🍔 Food": 0, "📌 General": 0 };
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
    for (const [cat, mins] of Object.entries(totals)) {
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

/* AUDIO CHIME ONLY (Browser Notifications Completely Removed) */
function playChime() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        
        // Boosted volume from 0.15 to 0.70
        gain.gain.setValueAtTime(0.70, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
        console.error("Audio error:", e);
    }
}

// Directly turns sound on/off — zero browser popups or permission prompts
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
    showSavedMessage(`✓ "${name}" deleted.`);
}

/* LIVE CLOCK & STATUS CHIPS */
function updateClock() {
    const clock = document.getElementById("live-clock");
    if (clock) {
        clock.textContent = "🕒 " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
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

    // Audio chime trigger (No desktop notifications)
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
    const card = document.getElementById("checkin-card");
    const prompt = document.getElementById("today-prompt");
    if (!card || !prompt) return;

    const selectedDay = DAYS[data.currentDay];
    const tasks = data.schedules[selectedDay] || [];

    if (tasks.length === 0) {
        prompt.textContent = `Your schedule for ${selectedDay} is currently empty.`;
    } else {
        const completed = tasks.every(task => task.completed);
        prompt.textContent = completed
            ? `🔥 Nice! All tasks for ${selectedDay} are complete!`
            : `Ready to take down today's schedule?`;
    }

    card.style.display = "block";
}

function showSavedMessage(message) {
    const status = document.getElementById("save-status");
    if (!status) return alert(message);
    status.textContent = message;
    status.classList.add("show");
    setTimeout(() => status.classList.remove("show"), 2200);
}

/* EVENT LISTENERS */
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
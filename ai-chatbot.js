/* =========================================================
   SYNCDAY LOCAL AI ENGINE & DATABASE NLP LIBRARY
   ========================================================= */

// Comprehensive AI Knowledge Base & NLP Dictionary

/**
 * Advanced Multi-Phase Intent Analysis & Schedule Generation Engine
 * Handles user intent extraction, category weighting, cognitive pacing, and 7-day schedule synthesis.
 */

// ---------------------------------------------------------------------------
// CONFIGURATION & DICTIONARIES
// ---------------------------------------------------------------------------

const INTENT_DICTIONARY = {
    exam: {
        keywords: ["exam", "study", "revision", "midterm", "final", "test", "cram", "gpa", "school", "college", "university", "sat", "act", "gre"],
        primaryCategory: "DEEP_STUDY",
        secondaryCategory: "RECALL_PRACTICE",
        intensityMultiplier: 1.4,
        preferredStartTime: "07:30"
    },
    fitness: {
        keywords: ["gym", "workout", "fitness", "cardio", "weights", "marathon", "training", "cut", "bulk", "shred", "health", "physique", "run"],
        primaryCategory: "WORKOUT",
        secondaryCategory: "ACTIVE_RECOVERY",
        intensityMultiplier: 1.2,
        preferredStartTime: "06:30"
    },
    work: {
        keywords: ["sprint", "hustle", "work", "client", "deadline", "startup", "launch", "coding", "dev", "project", "business", "freelance"],
        primaryCategory: "DEEP_WORK",
        secondaryCategory: "EXECUTION",
        intensityMultiplier: 1.3,
        preferredStartTime: "08:00"
    },
    relaxation: {
        keywords: ["chill", "lazy", "relax", "vacation", "rest", "detox", "burnout", "unwind", "light", "easy", "low key"],
        primaryCategory: "LEISURE",
        secondaryCategory: "MINDFULNESS",
        intensityMultiplier: 0.7,
        preferredStartTime: "09:00"
    }
};

const TASK_DATABASE = {
    MORNING_ROUTINE: [
        { name: "Hydration, Electrolytes & Sunlight Exposure ☀️", duration: 30, category: "Health" },
        { name: "Mobility Flow & Light Dynamic Stretching 🧘", duration: 30, category: "Health" },
        { name: "Protein Breakfast & Cold Shower 🍳", duration: 45, category: "Health" },
        { name: "Daily Intent Setting & Goal Alignment 🎯", duration: 15, category: "Planning" }
    ],
    DEEP_STUDY: [
        { name: "High-Cognitive Focus: Active Recall & Spaced Repetition 🧠", duration: 90, category: "Study" },
        { name: "Textbook Deep Read & Synthesis Notes 📖", duration: 75, category: "Study" },
        { name: "Past Exam Paper Simulation & Error Analysis ✍️", duration: 105, category: "Study" },
        { name: "Weak Concept Remediation & Problem Sets 🔬", duration: 90, category: "Study" }
    ],
    RECALL_PRACTICE: [
        { name: "Anki Flashcard Deck Clearance 🎴", duration: 45, category: "Study" },
        { name: "Peer Quiz Session & Concept Teaching 🗣️", duration: 60, category: "Study" },
        { name: "Formula & Vocabulary Speed Drills ⚡", duration: 30, category: "Study" }
    ],
    DEEP_WORK: [
        { name: "Deep Work: High-Value Architecture & Problem Solving 💻", duration: 120, category: "Work" },
        { name: "Sprint Execution: Core Deliverable Development 🚀", duration: 90, category: "Work" },
        { name: "Strategic Planning & Roadmap Optimization 🗺️", duration: 60, category: "Work" },
        { name: "Code Review / Technical Documentation Writing 📝", duration: 75, category: "Work" }
    ],
    EXECUTION: [
        { name: "Async Communication & Inbox Zero Sweep 📥", duration: 30, category: "Admin" },
        { name: "Client Alignment & Standup Meetings 🤝", duration: 45, category: "Work" },
        { name: "Administrative Overhead Clearance 🗂️", duration: 30, category: "Admin" }
    ],
    WORKOUT: [
        { name: "Heavy Compound Lifting (Hypertrophy/Strength) 🏋️‍♂️", duration: 75, category: "Fitness" },
        { name: "Zone 2 Endurance Cardio & Pace Tracking 🏃", duration: 60, category: "Fitness" },
        { name: "High-Intensity Interval Training (HIIT) ⚡", duration: 45, category: "Fitness" },
        { name: "Functional Core & Kettlebell Conditioning 💪", duration: 50, category: "Fitness" }
    ],
    ACTIVE_RECOVERY: [
        { name: "Full Body Myofascial Release & Foam Rolling 🧘", duration: 40, category: "Recovery" },
        { name: "Brisk Outdoor Walk & Podcast Listening 🎧", duration: 45, category: "Recovery" },
        { name: "Sauna / Hydrotherapy Recovery Protocol ♨️", duration: 30, category: "Recovery" }
    ],
    LEISURE: [
        { name: "Unstructured Creative Time & Hobbies 🎨", duration: 90, category: "Personal" },
        { name: "Fiction Reading & Narrative Consumption 📚", duration: 60, category: "Personal" },
        { name: "Social Connection & Quality Time 👥", duration: 120, category: "Personal" }
    ],
    MINDFULNESS: [
        { name: "Guided Breathwork & Meditation Practice 🧘‍♀️", duration: 20, category: "Mental" },
        { name: "Reflective Journaling & Evening Brain Dump ✍️", duration: 25, category: "Mental" }
    ],
    EVENING_ROUTINE: [
        { name: "Nutrition Prep & Dinner 🥗", duration: 60, category: "Health" },
        { name: "Screen-Free Wind Down & Sleep Hygiene Protocol 🌙", duration: 45, category: "Health" }
    ]
};

// ---------------------------------------------------------------------------
// HELPER FUNCTIONS & TIME MATH
// ---------------------------------------------------------------------------

function parseTimeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function formatMinutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function getRandomTask(category) {
    const pool = TASK_DATABASE[category] || TASK_DATABASE["DEEP_WORK"];
    return pool[Math.floor(Math.random() * pool.length)];
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// ---------------------------------------------------------------------------
// INTENT ANALYSIS PARSER
// ---------------------------------------------------------------------------

function analyzeUserIntent(rawPrompt) {
    const promptLower = rawPrompt.toLowerCase();
    const scores = { exam: 0, fitness: 0, work: 0, relaxation: 0 };

    // Score matching
    Object.keys(INTENT_DICTIONARY).forEach(intentKey => {
        const config = INTENT_DICTIONARY[intentKey];
        config.keywords.forEach(keyword => {
            if (promptLower.includes(keyword)) {
                scores[intentKey] += 1;
            }
        });
    });

    // Find dominant intent
    let primaryIntent = "work";
    let maxScore = 0;

    Object.keys(scores).forEach(key => {
        if (scores[key] > maxScore) {
            maxScore = scores[key];
            primaryIntent = key;
        }
    });

    // Determine secondary focus
    let secondaryIntent = "relaxation";
    let secondaryMax = -1;
    Object.keys(scores).forEach(key => {
        if (key !== primaryIntent && scores[key] > secondaryMax) {
            secondaryMax = scores[key];
            secondaryIntent = key;
        }
    });

    return {
        primary: INTENT_DICTIONARY[primaryIntent],
        secondary: INTENT_DICTIONARY[secondaryIntent],
        rawPrompt
    };
}

// ---------------------------------------------------------------------------
// CORE SCHEDULE SYNTHESIZER
// ---------------------------------------------------------------------------

function generateSmartWeekFromIntent(intentRaw) {
    const intentAnalysis = analyzeUserIntent(intentRaw);
    const newWeek = {};

    DAYS.forEach((day, dayIndex) => {
        const isWeekend = (day === "Saturday" || day === "Sunday");
        const daySchedule = [];
        
        let currentMinutes = parseTimeToMinutes(intentAnalysis.primary.preferredStartTime);

        // 1. MORNING BLOCK
        const morningTask = TASK_DATABASE.MORNING_ROUTINE[dayIndex % TASK_DATABASE.MORNING_ROUTINE.length];
        daySchedule.push({
            start: formatMinutesToTime(currentMinutes),
            end: formatMinutesToTime(currentMinutes + morningTask.duration),
            task: morningTask.name,
            completed: false
        });
        currentMinutes += morningTask.duration + 15; // 15 min buffer

        // 2. PRIMARY FOCUS BLOCK 1 (Morning High-Energy)
        const primaryTask1 = getRandomTask(intentAnalysis.primary.primaryCategory);
        daySchedule.push({
            start: formatMinutesToTime(currentMinutes),
            end: formatMinutesToTime(currentMinutes + primaryTask1.duration),
            task: `${day} Priority: ${primaryTask1.name}`,
            completed: false
        });
        currentMinutes += primaryTask1.duration + 15;

        // 3. MID-MORNING SECONDARY TASK
        const secondaryTask1 = getRandomTask(intentAnalysis.primary.secondaryCategory);
        daySchedule.push({
            start: formatMinutesToTime(currentMinutes),
            end: formatMinutesToTime(currentMinutes + secondaryTask1.duration),
            task: secondaryTask1.name,
            completed: false
        });
        currentMinutes += secondaryTask1.duration + 20;

        // 4. LUNCH & RECOVERY
        daySchedule.push({
            start: formatMinutesToTime(currentMinutes),
            end: formatMinutesToTime(currentMinutes + 60),
            task: "Nutritional Lunch & Cognitive Reset 🥗",
            completed: false
        });
        currentMinutes += 60;

        // 5. AFTERNOON FOCUS BLOCK 2
        if (!isWeekend || intentAnalysis.primary.intensityMultiplier > 1.2) {
            const primaryTask2 = getRandomTask(intentAnalysis.primary.primaryCategory);
            daySchedule.push({
                start: formatMinutesToTime(currentMinutes),
                end: formatMinutesToTime(currentMinutes + primaryTask2.duration),
                task: primaryTask2.name,
                completed: false
            });
            currentMinutes += primaryTask2.duration + 15;
        } else {
            const leisureTask = getRandomTask("LEISURE");
            daySchedule.push({
                start: formatMinutesToTime(currentMinutes),
                end: formatMinutesToTime(currentMinutes + leisureTask.duration),
                task: leisureTask.name,
                completed: false
            });
            currentMinutes += leisureTask.duration + 15;
        }

        // 6. LATE AFTERNOON / HEALTH & FITNESS
        const healthCategory = (intentAnalysis.primary.primaryCategory === "WORKOUT") ? "WORKOUT" : "ACTIVE_RECOVERY";
        const healthTask = getRandomTask(healthCategory);
        daySchedule.push({
            start: formatMinutesToTime(currentMinutes),
            end: formatMinutesToTime(currentMinutes + healthTask.duration),
            task: healthTask.name,
            completed: false
        });
        currentMinutes += healthTask.duration + 30;

        // 7. EVENING ROUTINE
        const dinnerTask = TASK_DATABASE.EVENING_ROUTINE[0];
        daySchedule.push({
            start: formatMinutesToTime(currentMinutes),
            end: formatMinutesToTime(currentMinutes + dinnerTask.duration),
            task: dinnerTask.name,
            completed: false
        });
        currentMinutes += dinnerTask.duration + 15;

        // 8. WIND DOWN / MINDFULNESS
        const windDownTask = TASK_DATABASE.EVENING_ROUTINE[1];
        daySchedule.push({
            start: formatMinutesToTime(currentMinutes),
            end: formatMinutesToTime(currentMinutes + windDownTask.duration),
            task: windDownTask.name,
            completed: false
        });

        newWeek[day] = daySchedule;
    });

    return newWeek;
}


const AI_DATABASE = {
    knowledgeBase: {
        botName: "SyncDay AI Assistant",
        version: "1.0-NLP",
        greetings: [
            "Hey there! Ready to optimize your schedule today?",
            "Hello! I can add tasks, switch themes, load presets, or summarize your day. What's on your mind?",
            "Hi! Ask me anything about your time blocks or presets."
        ],
        farewells: [
            "Catch you later! Keep crushing your routine.",
            "Goodbye! Stay focused!",
            "See you! Don't forget to check off your completed tasks."
        ],
        colorMap: {
            red: { color: "#e74c3c", hover: "#c0392b", alpha: "rgba(231, 76, 60, 0.25)" },
            blue: { color: "#3498db", hover: "#2980b9", alpha: "rgba(52, 152, 219, 0.25)" },
            green: { color: "#2ecc71", hover: "#27ae60", alpha: "rgba(46, 204, 113, 0.25)" },
            orange: { color: "#e67e22", hover: "#d35400", alpha: "rgba(230, 126, 34, 0.25)" },
            pink: { color: "#e84393", hover: "#d63031", alpha: "rgba(232, 67, 147, 0.25)" },
            purple: { color: "#6c5ce7", hover: "#5b4cc4", alpha: "rgba(108, 92, 231, 0.25)" },
            cyan: { color: "#00cec9", hover: "#00b894", alpha: "rgba(0, 206, 201, 0.25)" }
        }
    },

    // Intent Classifiers & Action Parsers
    intents: [
        {
            id: "greeting",
            keywords: ["hello", "hi", "hey", "greetings", "sup"],
            handler: () => {
                const choices = AI_DATABASE.knowledgeBase.greetings;
                return choices[Math.floor(Math.random() * choices.length)];
            }
        },
        {
            id: "add_task_full",
            patterns: [
                /add\s+(.+?)\s+from\s+(\d{1,2}:\d{2}(?:\s*[ap]m)?)\s+to\s+(\d{1,2}:\d{2}(?:\s*[ap]m)?)/i,
                /add\s+(.+?)\s+(\d{1,2}:\d{2}(?:\s*[ap]m)?)\s+(\d{1,2}:\d{2}(?:\s*[ap]m)?)/i
            ],
            handler: (match) => {
                const title = match[1].trim();
                const start = match[2].trim();
                const end = match[3].trim();
                const currentDayName = DAYS[data.currentDay];

                if (!data.schedules[currentDayName]) data.schedules[currentDayName] = [];

                data.schedules[currentDayName].push({
                    start: start,
                    end: end,
                    task: title,
                    completed: false
                });

                data.schedules[currentDayName].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
                saveData();
                renderCurrentDay();
                return `Added **${title}** (${start} - ${end}) to **${currentDayName}**! ⏱️`;
            }
        },
        {
            id: "delete_task_by_index",
            patterns: [
                /(?:delete|remove)\s+(?:block|task)\s+(\d+)/i
            ],
            handler: (match) => {
                const index = parseInt(match[1], 10) - 1;
                const currentDayName = DAYS[data.currentDay];
                const dayBlocks = data.schedules[currentDayName] || [];

                if (index >= 0 && index < dayBlocks.length) {
                    const removed = dayBlocks.splice(index, 1)[0];
                    saveData();
                    renderCurrentDay();
                    return `Removed task #${index + 1} (**${removed.task || "Task"}**) from ${currentDayName}. 🗑️`;
                }
                return `Task #${index + 1} doesn't exist on ${currentDayName}.`;
            }
        },
        {
            id: "delete_task_by_name",
            patterns: [
                /(?:delete|remove)\s+task\s+(.+)/i,
                /(?:delete|remove)\s+(.+)/i
            ],
            handler: (match) => {
                const targetTitle = match[1].trim().toLowerCase();
                if (targetTitle.includes("preset")) return null; // Pass through to preset intent

                const currentDayName = DAYS[data.currentDay];
                const dayBlocks = data.schedules[currentDayName] || [];
                const foundIndex = dayBlocks.findIndex(b => b.task && b.task.toLowerCase().includes(targetTitle));

                if (foundIndex !== -1) {
                    const removed = dayBlocks.splice(foundIndex, 1)[0];
                    saveData();
                    renderCurrentDay();
                    return `Deleted task "**${removed.task}**" from ${currentDayName}. 🗑️`;
                }
                return `Could not find a task matching "**${match[1]}**" on ${currentDayName}.`;
            }
        },
        {
            id: "create_or_save_preset",
            patterns: [
                /(?:create|new)\s+(?:week|preset)\s+(.+)/i,
                /save\s+preset\s+(.+)/i
            ],
            handler: (match, rawInput) => {
                const presetName = match[1].trim();
                data.presets = data.presets || {};

                if (rawInput.toLowerCase().includes("save")) {
                    data.presets[presetName] = deepClone(data.schedules);
                    data.appliedRoutine = presetName;
                    saveData();
                    populatePresetMenus();
                    renderPresetsManager();
                    return `Saved current schedule as new preset "**${presetName}**"! 💾`;
                } else {
                    const filledWeek = generateFilledWeek();
                    data.presets[presetName] = filledWeek;
                    data.schedules = deepClone(filledWeek);
                    data.appliedRoutine = presetName;

                    saveData();
                    renderCurrentDay();
                    populatePresetMenus();
                    renderPresetsManager();
                    return `Created brand new preset "**${presetName}**" packed with default schedule blocks! 📅⚡`;
                }
            }
        },
        {
            id: "delete_preset",
            patterns: [
                /(?:delete|remove)\s+preset\s+(.+)/i
            ],
            handler: (match) => {
                const targetPreset = match[1].trim();
                const availablePresets = Object.keys(data.presets || {});
                const matchedKey = availablePresets.find(p => p.toLowerCase() === targetPreset.toLowerCase());

                if (matchedKey) {
                    if (Object.prototype.hasOwnProperty.call(BUILT_IN_PRESETS, matchedKey)) {
                        return `Built-in preset "**${matchedKey}**" cannot be deleted.`;
                    }
                    delete data.presets[matchedKey];
                    saveData();
                    populatePresetMenus();
                    renderPresetsManager();
                    return `Deleted preset "**${matchedKey}**". 🗑️`;
                }
                return `Preset "**${targetPreset}**" not found. Existing: ${availablePresets.join(", ") || "None"}`;
            }
        },
        {
            id: "apply_preset",
            keywords: ["apply", "load", "preset", "routine"],
            handler: (match, rawInput) => {
                const availablePresets = Object.keys(data.presets || {});
                const inputLower = rawInput.toLowerCase();
                const matched = availablePresets.find(p => inputLower.includes(p.toLowerCase()));

                if (matched) {
                    DAYS.forEach(day => data.schedules[day] = deepClone(data.presets[matched][day] || []));
                    data.appliedRoutine = matched;
                    saveData();
                    renderCurrentDay();
                    return `Successfully applied the "**${matched}**" routine to your week! 🎉`;
                }
                return null; // Fallthrough
            }
        },
        {
            id: "theme_change",
            keywords: ["theme", "color", "red", "blue", "green", "orange", "pink", "purple", "cyan"],
            handler: (match, rawInput) => {
                const inputLower = rawInput.toLowerCase();
                const colorMap = AI_DATABASE.knowledgeBase.colorMap;

                for (const [key, themeObj] of Object.entries(colorMap)) {
                    if (inputLower.includes(key)) {
                        setAccentColor(themeObj.color, themeObj.hover, themeObj.alpha);
                        return `Updated accent theme color to **${key}**! 🎨`;
                    }
                }
                return null;
            }
        },
        {
            id: "query_schedule",
            keywords: ["what", "today", "schedule", "summary", "next"],
            handler: (match, rawInput) => {
                const inputLower = rawInput.toLowerCase();
                const currentDayName = DAYS[data.currentDay];
                const tasks = data.schedules[currentDayName] || [];

                if (inputLower.includes("next")) {
                    const currentMins = new Date().getHours() * 60 + new Date().getMinutes();
                    const upcoming = tasks.find(t => timeToMinutes(t.start) > currentMins);
                    if (upcoming) {
                        return `Your next task on ${currentDayName} is **${upcoming.task}** at **${upcoming.start}**.`;
                    }
                    return `No upcoming tasks left for today! ☕`;
                }

                if (tasks.length === 0) {
                    return `Your schedule for **${currentDayName}** is currently empty.`;
                }

                const taskList = tasks.map((t, idx) => `${idx + 1}. **${t.start} - ${t.end}**: ${t.task || "Untitled"}`).join("\n");
                return `Here is your schedule for **${currentDayName}**:\n${taskList}`;
            }
        },
        {
            id: "sound_toggle",
            keywords: ["notification", "sound", "chime", "mute", "unmute", "alert"],
            handler: () => {
                toggleNotifications();
                const status = data.notificationsEnabled ? "ON 🔔" : "OFF 🔕";
                return `Sound and transition alerts are now turned **${status}**.`;
            }
        },
                {
    id: "clear_day",
    keywords: ["clear day", "reset day", "uncheck day", "reset checkboxes"],
    handler: () => {
        const currentDayName = DAYS[data.currentDay];
        const dayTasks = data.schedules[currentDayName] || [];

        if (dayTasks.length === 0) {
            return `No tasks to uncheck for **${currentDayName}**!`;
        }

        // Keep all tasks intact; uncheck all checkboxes
        let clearedCount = 0;
        dayTasks.forEach(task => {
            if (task.completed) {
                task.completed = false;
                clearedCount++;
            }
        });

        saveData();
        renderCurrentDay();
        return `Reset ${clearedCount} checked task(s) for **${currentDayName}**! Time blocks remain intact. 🧹`;
    }
},

        {
    id: "generate_full_intent_week",
    patterns: [
        /(?:generate|create|build|make)\s+(?:a|an)?\s*(.+?)\s*(?:week|routine|schedule)/i
    ],
    keywords: ["build my week", "create week for", "generate schedule"],
    handler: (match, rawInput) => {
        const userIntent = (match && match[1]) ? match[1] : rawInput;
        
        // Dynamic schedule generator based on intent keywords
        const generatedWeek = generateSmartWeekFromIntent(userIntent);

        // Apply generated week across all 7 days
        DAYS.forEach(day => {
            data.schedules[day] = deepClone(generatedWeek[day]);
        });

        data.appliedRoutine = `AI: ${userIntent.substring(0, 20)}...`;
        saveData();
        renderCurrentDay();
        populatePresetMenus();

        return `⚡ **Generated full 7-day schedule based on:** *"${userIntent}"*\n\nAll tasks have been scheduled with specific times and titles!`;
    }
}
    ]
};

/* AI CHATBOT ENGINE LOGIC */

function toggleChatWindow() {
    const win = document.getElementById("ai-chat-window");
    if (win) win.classList.toggle("chat-hidden");
}

function sendChatMessage() {
    const input = document.getElementById("chat-input");
    const text = input.value.trim();

    if (!text) return;

    appendMessage(text, "user-msg");
    input.value = "";

    setTimeout(() => {
        processNLPIntent(text);
    }, 150);
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
    const input = rawInput.toLowerCase().trim();

    // 1. Regex Pattern Matching Strategy
    for (const intent of AI_DATABASE.intents) {
        if (intent.patterns) {
            for (const pattern of intent.patterns) {
                const match = rawInput.match(pattern);
                if (match) {
                    const result = intent.handler(match, rawInput);
                    if (result) {
                        appendMessage(result, "bot-msg");
                        return;
                    }
                }
            }
        }
    }

    // 2. Keyword Classification Strategy
    for (const intent of AI_DATABASE.intents) {
        if (intent.keywords) {
            const hasKeyword = intent.keywords.some(kw => input.includes(kw));
            if (hasKeyword) {
                const result = intent.handler(null, rawInput);
                if (result) {
                    appendMessage(result, "bot-msg");
                    return;
                }
            }
        }
    }

    // 3. Fallback / Helpful Directory
    appendMessage(
        `I didn't quite recognize that command. Here are things you can ask me:\n\n` +
        `• **Add block**: "add Science Homework 14:00 15:30"\n` +
        `• **Delete block**: "delete task 1" or "delete Math"\n` +
        `• **Summary**: "what is my schedule today?" or "what's next?"\n` +
        `• **Presets**: "apply Study Week" or "save preset Spring Term"\n` +
        `• **Presets**: "delete preset Spring Term"\n` +
        `• **Themes**: "change theme to green" or "red"\n` +
        `• **Settings**: "turn off sound" / "clear day"`,
        "bot-msg"
    );
}
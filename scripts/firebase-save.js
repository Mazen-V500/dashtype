import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase, ref, push, get, update, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { readTypingGameState, patchTypingGameState } from "./app-state.js";

const firebaseConfig = {
    apiKey: "AIzaSyABT9cJ3H2e1YaljPhmFb8dgXfaV7cZEQs",
    authDomain: "dashtype-9855c.firebaseapp.com",
    projectId: "dashtype-9855c",
    storageBucket: "dashtype-9855c.firebasestorage.app",
    messagingSenderId: "758504188835",
    appId: "1:758504188835:web:a75d6f9452f09a067f0816",
    databaseURL: "https://dashtype-9855c-default-rtdb.firebaseio.com"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app);

const ALLOWED_THEMES = new Set(["ocean", "sunset", "forest", "berry", "neon", "violet", "brown"]);
const ALLOWED_COLOR_MODES = new Set(["dark", "blur", "light"]);
const ALLOWED_LANGUAGES = new Set(["ar", "en"]);
const DEFAULT_PREFS = {
    theme: "ocean",
    colorMode: "blur",
    language: "ar"
};
const FAILED_ROUNDS_CACHE_KEY = "dashTypeFailedRounds";
const FAILED_ROUNDS_CACHE_MAX = 40;
const TRAINING_MISSES_KEY = "dashTypeTrainingMisses";
const TRAINING_MISSES_MAX = 200;
const SAVE_TOAST_CONTAINER_ID = "dashTypeSaveToastContainer";

let lastKnownUid = null;

onAuthStateChanged(auth, (user) => {
    lastKnownUid = user?.uid || null;
    if (user?.uid) {
        void retryFailedRoundSaves(5);
    }
});

function readStoredUserUid() {
    try {
        const stored = JSON.parse(localStorage.getItem("dashTypeUser") || "null");
        if (stored && typeof stored.uid === "string" && stored.uid.trim()) {
            return stored.uid.trim();
        }
    } catch (_error) {
        // Ignore malformed local storage payload.
    }
    return null;
}

function resolveActiveUid() {
    if (auth.currentUser?.uid) {
        return auth.currentUser.uid;
    }
    if (lastKnownUid) {
        return lastKnownUid;
    }
    return readStoredUserUid();
}

function normalizePreferencePayload(input) {
    const source = input && typeof input === "object" ? input : {};
    const normalized = {};

    if (typeof source.theme === "string" && ALLOWED_THEMES.has(source.theme)) {
        normalized.theme = source.theme;
    }

    if (typeof source.colorMode === "string" && ALLOWED_COLOR_MODES.has(source.colorMode)) {
        normalized.colorMode = source.colorMode;
    }

    if (typeof source.language === "string" && ALLOWED_LANGUAGES.has(source.language)) {
        normalized.language = source.language;
    }

    return normalized;
}

function writeTypingGameState(preferences) {
    patchTypingGameState({
        ...(preferences.theme ? { currentTheme: preferences.theme } : {}),
        ...(preferences.colorMode ? { currentColorMode: preferences.colorMode } : {}),
        ...(preferences.language ? { currentLanguage: preferences.language } : {})
    });
}

export async function loadUserPreferences() {
    const localState = readTypingGameState();
    const localPrefs = normalizePreferencePayload({
        theme: localState.currentTheme,
        colorMode: localState.currentColorMode,
        language: localState.currentLanguage
    });

    let merged = {
        theme: localPrefs.theme || DEFAULT_PREFS.theme,
        colorMode: localPrefs.colorMode || DEFAULT_PREFS.colorMode,
        language: localPrefs.language || DEFAULT_PREFS.language
    };

    const uid = resolveActiveUid();
    if (!uid) {
        writeTypingGameState(merged);
        return merged;
    }

    try {
        const snapshot = await get(ref(db, `users/${uid}/profile/preferences`));
        if (snapshot.exists()) {
            const remotePrefs = normalizePreferencePayload(snapshot.val());
            merged = {
                ...merged,
                ...remotePrefs
            };
        }
    } catch (error) {
        console.warn("Preference load failed:", error);
    }

    writeTypingGameState(merged);
    return merged;
}

export async function saveUserPreferences(preferences) {
    const normalized = normalizePreferencePayload(preferences);
    if (!Object.keys(normalized).length) {
        return;
    }

    writeTypingGameState(normalized);

    const uid = resolveActiveUid();
    if (!uid) {
        return;
    }

    try {
        await update(ref(db, `users/${uid}/profile/preferences`), {
            ...normalized,
            updatedAt: Date.now()
        });
    } catch (error) {
        console.warn("Preference save failed:", error);
    }
}

window.DashTypePreferences = {
    load: loadUserPreferences,
    save: saveUserPreferences
};

const TELEMETRY_REFRESH_MS = 10 * 60 * 1000;
let cachedTelemetry = null;
let cachedTelemetryAt = 0;
let inFlightTelemetryPromise = null;

function parseClientDevice() {
    const ua = navigator.userAgent || "";
    const platform = navigator.userAgentData?.platform || navigator.platform || "Unknown";
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
    const screenSize = window.screen ? `${window.screen.width}x${window.screen.height}` : "unknown";
    const language = navigator.language || "unknown";

    let browser = "Unknown";
    if (/edg/i.test(ua)) {
        browser = "Edge";
    } else if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) {
        browser = "Chrome";
    } else if (/firefox|fxios/i.test(ua)) {
        browser = "Firefox";
    } else if (/safari/i.test(ua) && !/chrome|crios|edg/i.test(ua)) {
        browser = "Safari";
    }

    return {
        browser,
        platform,
        deviceType: /Mobi|Android|iPhone|iPad|iPod/i.test(ua) ? "mobile" : "desktop",
        language,
        timezone,
        screenSize
    };
}

function countWords(text) {
    return String(text || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;
}

function normalizeTrainingWord(word, language) {
    const compact = String(word || "").replace(/\s+/g, " ").trim();
    if (!compact) {
        return "";
    }
    if ((language || "ar") === "en") {
        return compact.toLowerCase().normalize("NFC");
    }
    return compact
        .normalize("NFD")
        .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
        .replace(/\u0640/g, "")
        .normalize("NFC");
}

function getSpeedTier(secondsPerWord) {
    if (secondsPerWord <= 0.1) {
        return { tier: "elite-50", multiplier: 50 };
    }
    if (secondsPerWord <= 0.2) {
        return { tier: "pro-30", multiplier: 30 };
    }
    if (secondsPerWord <= 0.5) {
        return { tier: "fast-10", multiplier: 10 };
    }
    if (secondsPerWord <= 1) {
        return { tier: "solid-5", multiplier: 5 };
    }
    if (secondsPerWord <= 2) {
        return { tier: "steady-2", multiplier: 2 };
    }
    return { tier: "base-1", multiplier: 1 };
}

function buildRoundScore(word, timeTaken) {
    const wordCount = Math.max(1, countWords(word));
    const safeTime = Math.max(0.001, Number(timeTaken) || 0.001);
    const secondsPerWord = safeTime / wordCount;
    const basePoints = wordCount;
    const speedTier = getSpeedTier(secondsPerWord);
    const speedPoints = wordCount * speedTier.multiplier;
    const totalPoints = basePoints + speedPoints;

    return {
        wordCount,
        secondsPerWord: Number(secondsPerWord.toFixed(4)),
        basePoints,
        speedPoints,
        totalPoints,
        speedTier: speedTier.tier,
        speedMultiplier: speedTier.multiplier
    };
}

function getWeekKey(timestamp) {
    const date = new Date(timestamp);
    const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = utc.getUTCDay() || 7;
    utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
    return `${utc.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function getMonthKey(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function computeBadges(totalPoints) {
    const badges = [];
    if (totalPoints >= 500) badges.push("Bronze");
    if (totalPoints >= 1500) badges.push("Silver");
    if (totalPoints >= 3000) badges.push("Gold");
    if (totalPoints >= 6000) badges.push("Diamond");
    return badges;
}

async function updateUserStats(uid, roundMeta) {
    const statsRef = ref(db, `users/${uid}/profile/stats`);
    const now = roundMeta.timestamp || Date.now();
    const weekKey = getWeekKey(now);
    const monthKey = getMonthKey(now);

    await runTransaction(statsRef, (current) => {
        const safe = (current && typeof current === "object") ? current : {};
        const totalRounds = Number(safe.totalRounds || 0) + 1;
        const totalWords = Number(safe.totalWords || 0) + Number(roundMeta.wordCount || 0);
        const totalPoints = Number(safe.totalPoints || 0) + Number(roundMeta.totalPoints || 0);
        const level = Math.floor(totalPoints / 100) + 1;
        const speedBest = Number(safe.bestSecondsPerWord || 9999);
        const nextBest = Math.min(speedBest, Number(roundMeta.secondsPerWord || 9999));

        const weekly = (safe.weeklyPoints && typeof safe.weeklyPoints === "object") ? { ...safe.weeklyPoints } : {};
        const monthly = (safe.monthlyPoints && typeof safe.monthlyPoints === "object") ? { ...safe.monthlyPoints } : {};

        weekly[weekKey] = Number(weekly[weekKey] || 0) + Number(roundMeta.totalPoints || 0);
        monthly[monthKey] = Number(monthly[monthKey] || 0) + Number(roundMeta.totalPoints || 0);

        return {
            totalRounds,
            totalWords,
            totalPoints,
            level,
            bestSecondsPerWord: Number(nextBest.toFixed(4)),
            weeklyPoints: weekly,
            monthlyPoints: monthly,
            badges: computeBadges(totalPoints),
            updatedAt: now
        };
    });
}

async function getClientTelemetry() {
    const now = Date.now();

    if (cachedTelemetry && now - cachedTelemetryAt < TELEMETRY_REFRESH_MS) {
        return cachedTelemetry;
    }

    if (inFlightTelemetryPromise) {
        return inFlightTelemetryPromise;
    }

    inFlightTelemetryPromise = (async () => {
        const device = parseClientDevice();
        const telemetry = {
            device,
            capturedAt: Date.now()
        };

        cachedTelemetry = telemetry;
        cachedTelemetryAt = Date.now();
        inFlightTelemetryPromise = null;
        return telemetry;
    })().catch((_error) => {
        inFlightTelemetryPromise = null;
        return {
            device: parseClientDevice(),
            capturedAt: Date.now()
        };
    });

    return inFlightTelemetryPromise;
}

function readFailedRoundQueue() {
    try {
        const parsed = JSON.parse(localStorage.getItem(FAILED_ROUNDS_CACHE_KEY) || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
        return [];
    }
}

function writeFailedRoundQueue(entries) {
    const safeEntries = Array.isArray(entries) ? entries.slice(-FAILED_ROUNDS_CACHE_MAX) : [];
    localStorage.setItem(FAILED_ROUNDS_CACHE_KEY, JSON.stringify(safeEntries));
}

function cacheFailedRoundPayload(payload) {
    const queue = readFailedRoundQueue();
    queue.push(payload);
    writeFailedRoundQueue(queue);
}

function notifyRoundSaveStatus(detail) {
    try {
        window.dispatchEvent(new CustomEvent("dashType:round-save", { detail }));
    } catch (_error) {
        // Ignore status event errors.
    }
}

function ensureToastStyles() {
    if (document.getElementById("dashTypeSaveToastStyle")) {
        return;
    }
    const style = document.createElement("style");
    style.id = "dashTypeSaveToastStyle";
    style.textContent = `
        #${SAVE_TOAST_CONTAINER_ID} {
            position: fixed;
            inset-inline-end: 16px;
            bottom: 18px;
            z-index: 9999;
            display: grid;
            gap: 8px;
            max-width: min(380px, calc(100vw - 24px));
            pointer-events: none;
        }
        .dash-save-toast {
            border-radius: 14px;
            padding: 10px 14px;
            color: #ffffff;
            font-size: 13px;
            font-weight: 700;
            box-shadow: 0 10px 22px rgba(0,0,0,0.28);
            opacity: 0;
            transform: translateY(8px);
            transition: opacity .22s ease, transform .22s ease;
        }
        .dash-save-toast.is-visible {
            opacity: 1;
            transform: translateY(0);
        }
        .dash-save-toast.success { background: linear-gradient(120deg, #059669, #10b981); }
        .dash-save-toast.warning { background: linear-gradient(120deg, #b45309, #f59e0b); }
        .dash-save-toast.error { background: linear-gradient(120deg, #b91c1c, #ef4444); }
    `;
    document.head.appendChild(style);
}

function getToastContainer() {
    let container = document.getElementById(SAVE_TOAST_CONTAINER_ID);
    if (container) {
        return container;
    }
    container = document.createElement("div");
    container.id = SAVE_TOAST_CONTAINER_ID;
    document.body.appendChild(container);
    return container;
}

function showSaveToast(message, type = "success") {
    if (!document.body) {
        return;
    }
    ensureToastStyles();
    const container = getToastContainer();
    const toast = document.createElement("div");
    toast.className = `dash-save-toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => {
        toast.classList.add("is-visible");
    });
    setTimeout(() => {
        toast.classList.remove("is-visible");
        setTimeout(() => toast.remove(), 240);
    }, 2400);
}

async function scheduleRoundSync() {
    if (!("serviceWorker" in navigator)) {
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.sync) {
            await registration.sync.register("dashType-sync-rounds");
        }
    } catch (_error) {
        // Background sync is optional.
    }
}

function setupRoundSaveNotifications() {
    if (window.__dashSaveNotificationsReady) {
        return;
    }
    window.__dashSaveNotificationsReady = true;
    window.addEventListener("dashType:round-save", (event) => {
        const detail = event.detail || {};
        const saved = readTypingGameState();
        const language = saved.currentLanguage === "en" ? "en" : "ar";

        if (detail.success) {
            const points = Number(detail.points || 0);
            if (points > 0) {
                showSaveToast(
                    language === "en"
                        ? `Round saved (+${points} pts)`
                        : `تم حفظ الجولة (+${points} نقطة)`,
                    "success"
                );
            } else {
                showSaveToast(language === "en" ? "Round saved successfully" : "تم حفظ الجولة بنجاح", "success");
            }
            return;
        }

        if (detail.cached) {
            showSaveToast(language === "en" ? "Offline: saved locally, will sync automatically" : "تم الحفظ محليًا وستتم المزامنة تلقائيًا", "warning");
            return;
        }

        showSaveToast(language === "en" ? "Save failed" : "فشل الحفظ", "error");
    });
}

function readTrainingMisses() {
    try {
        const parsed = JSON.parse(localStorage.getItem(TRAINING_MISSES_KEY) || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
        return [];
    }
}

function writeTrainingMisses(entries) {
    const safeEntries = Array.isArray(entries) ? entries.slice(-TRAINING_MISSES_MAX) : [];
    localStorage.setItem(TRAINING_MISSES_KEY, JSON.stringify(safeEntries));
}

window.recordTypingMiss = function(word, mode = "single", language = "ar") {
    const normalizedWord = normalizeTrainingWord(word, language);
    if (!normalizedWord) {
        return;
    }

    const entries = readTrainingMisses();
    entries.push({
        word: normalizedWord,
        mode,
        language,
        timestamp: Date.now()
    });
    writeTrainingMisses(entries);
};

window.getTrainingSuggestions = function(language = "ar", limit = 6) {
    const entries = readTrainingMisses();
    const stats = new Map();
    entries
        .filter((entry) => entry && entry.language === language)
        .forEach((entry) => {
            const key = `${entry.mode}::${entry.word}`;
            const current = stats.get(key) || { mode: entry.mode, word: entry.word, count: 0 };
            current.count += 1;
            stats.set(key, current);
        });

    return Array.from(stats.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, Math.max(1, Number(limit) || 6));
};

async function retryFailedRoundSaves(maxItems = 5) {
    const queue = readFailedRoundQueue();
    if (!queue.length) {
        return { attempted: 0, succeeded: 0, remaining: 0 };
    }

    const activeUid = resolveActiveUid();
    if (!activeUid) {
        return { attempted: 0, succeeded: 0, remaining: queue.length };
    }

    let attempted = 0;
    let succeeded = 0;
    const remaining = [];

    for (const item of queue) {
        if (attempted >= maxItems) {
            remaining.push(item);
            continue;
        }

        if (!item || item.uid !== activeUid || !item.roundData || !item.publicRoundData) {
            remaining.push(item);
            continue;
        }

        attempted += 1;
        try {
            await Promise.all([
                push(ref(db, `users/${activeUid}/rounds`), item.roundData),
                push(ref(db, "publicRounds"), item.publicRoundData)
            ]);

            const points = Number(item.roundData.totalPoints || 0);
            const wordCount = Number(item.roundData.wordCount || countWords(item.roundData.word));
            const secondsPerWord = Number(item.roundData.secondsPerWord || ((Number(item.roundData.timeTaken || 0) || 0) / Math.max(1, wordCount)));
            await updateUserStats(activeUid, {
                wordCount,
                totalPoints: points,
                secondsPerWord,
                timestamp: Number(item.roundData.timestamp || Date.now())
            });

            succeeded += 1;
        } catch (_error) {
            remaining.push(item);
        }
    }

    writeFailedRoundQueue(remaining);
    return { attempted, succeeded, remaining: remaining.length };
}

window.retryFailedRoundSaves = retryFailedRoundSaves;

if (typeof window !== "undefined") {
    setupRoundSaveNotifications();
    if (navigator.serviceWorker) {
        navigator.serviceWorker.addEventListener("message", (event) => {
            const type = event.data && event.data.type;
            if (type === "retry-round-saves") {
                void retryFailedRoundSaves(8);
            }
        });
    }
}

window.saveRoundDataToFirebase = async function(word, timeTaken, mode, language, extraData = {}) {
    try {
        const authUser = auth.currentUser;
        const storedUserRaw = localStorage.getItem("dashTypeUser");
        const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;

        const uid = (authUser && authUser.uid) || (storedUser && storedUser.uid);
        if (!uid) {
            console.warn("Firebase save skipped: no authenticated user.");
            notifyRoundSaveStatus({ success: false, reason: "no-user", cached: false });
            return { success: false, reason: "no-user" };
        }

        const displayName = (storedUser && storedUser.nickname) || (authUser && authUser.displayName) || (storedUser && storedUser.displayName);
        const playerName = displayName || "لاعب مجهول";
        const shortId = uid.substring(0, 6);

        const safeExtra = (extraData && typeof extraData === "object" && !Array.isArray(extraData)) ? extraData : {};
        const clientTelemetry = await getClientTelemetry();
        const score = buildRoundScore(word, timeTaken);
        const now = Date.now();

        const roundData = {
            word: word,
            timeTaken: timeTaken,
            mode: mode,
            language: language,
            playerName: playerName,
            shortId: shortId,
            timestamp: now,
            wordCount: score.wordCount,
            basePoints: score.basePoints,
            speedPoints: score.speedPoints,
            totalPoints: score.totalPoints,
            secondsPerWord: score.secondsPerWord,
            speedTier: score.speedTier,
            speedMultiplier: score.speedMultiplier,
            ...safeExtra,
            clientTelemetry
        };

        const userRef = ref(db, `users/${uid}/rounds`);
        const publicRoundsRef = ref(db, "publicRounds");

        const { clientTelemetry: _privateTelemetry, ...publicSafeRoundData } = roundData;

        const publicRoundData = {
            ...publicSafeRoundData
        };

        await Promise.all([
            push(userRef, roundData),
            push(publicRoundsRef, publicRoundData)
        ]);

        await updateUserStats(uid, {
            wordCount: score.wordCount,
            totalPoints: score.totalPoints,
            secondsPerWord: score.secondsPerWord,
            timestamp: now
        });

        notifyRoundSaveStatus({ success: true, cached: false, mode, timeTaken, points: score.totalPoints });
        void retryFailedRoundSaves(2);
        void scheduleRoundSync();
        return { success: true, cached: false };
    } catch (error) {
        console.error("Firebase save error:", error);
        try {
            const fallbackUid = resolveActiveUid();
            if (fallbackUid) {
                const safeExtra = (extraData && typeof extraData === "object" && !Array.isArray(extraData)) ? extraData : {};
                const score = buildRoundScore(word, timeTaken);
                const fallbackRoundData = {
                    word,
                    timeTaken,
                    mode,
                    language,
                    playerName: "لاعب مجهول",
                    shortId: fallbackUid.substring(0, 6),
                    timestamp: Date.now(),
                    wordCount: score.wordCount,
                    basePoints: score.basePoints,
                    speedPoints: score.speedPoints,
                    totalPoints: score.totalPoints,
                    secondsPerWord: score.secondsPerWord,
                    speedTier: score.speedTier,
                    speedMultiplier: score.speedMultiplier,
                    ...safeExtra
                };
                const fallbackPublicRoundData = {
                    ...fallbackRoundData
                };
                cacheFailedRoundPayload({
                    uid: fallbackUid,
                    roundData: fallbackRoundData,
                    publicRoundData: fallbackPublicRoundData,
                    cachedAt: Date.now()
                });
                notifyRoundSaveStatus({ success: false, cached: true, mode, timeTaken, points: score.totalPoints });
                void scheduleRoundSync();
                return { success: false, cached: true };
            }
        } catch (_cacheError) {
            // Ignore cache fallback errors.
        }

        notifyRoundSaveStatus({ success: false, cached: false, mode, timeTaken });
        return { success: false, cached: false };
    }
};

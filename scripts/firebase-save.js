import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase, ref, push, get, update, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { readTypingGameState, patchTypingGameState } from "./app-state.js";
import getFirebaseConfig from "./firebase-config.js";

/**
 * @security Uses centralized config from firebase-config.js
 * Never hardcode API keys in application code
 */
const firebaseConfig = getFirebaseConfig();

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app);

const ALLOWED_THEMES = new Set(["ocean", "sunset", "forest", "berry", "neon", "violet", "brown", "maroon"]);
const ALLOWED_COLOR_MODES = new Set(["dark", "blur", "light"]);
const ALLOWED_LANGUAGES = new Set(["ar", "en"]);
const ALLOWED_KEYBOARD_TYPES = new Set(["auto", "english", "arabic", "mixed"]);
const ALLOWED_KEYBOARD_LAYOUTS = new Set(["qwerty", "azerty", "qwertz"]);
const DEFAULT_PREFS = {
    theme: "ocean",
    colorMode: "blur",
    language: "ar"
};
const DEFAULT_TYPING_SETTINGS = {
    enabled: false,
    type: "auto",
    layout: "qwerty",
    inlineTrace: false,
    hideTypedText: false
};
const TYPING_SETTINGS_STORAGE_KEY = "dashTypeKeyboardAssistSettings";
const FAILED_ROUNDS_CACHE_KEY = "dashTypeFailedRounds";
const FAILED_ROUNDS_CACHE_MAX = 40;
const TRAINING_MISSES_KEY = "dashTypeTrainingMisses";
const TRAINING_MISSES_MAX = 200;
const SAVE_TOAST_CONTAINER_ID = "dashTypeSaveToastContainer";
const PUBLIC_IDENTITY_CACHE_TTL_MS = 5 * 60 * 1000;
const FIRST_LEVEL_POINTS = 40;
const LEVEL_STEP_POINTS = 100;
const ANON_SHORT_ID_STORAGE_KEY = "dashTypeAnonShortId";
const SHORT_ID_LENGTH = 4;

let lastKnownUid = null;
const publicIdentityCache = new Map();

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

function normalizeNonEmptyString(value) {
    if (typeof value !== "string") {
        return "";
    }
    const compact = value.trim();
    return compact || "";
}

function normalizeShortId(value, fallback = "") {
    const cleaned = String(value || "").trim().replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    const fallbackCleaned = String(fallback || "").trim().replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    const preferred = (cleaned || fallbackCleaned).slice(0, SHORT_ID_LENGTH);
    if (!preferred) {
        return "";
    }
    return preferred.padEnd(SHORT_ID_LENGTH, "0").slice(0, SHORT_ID_LENGTH);
}

function getLegacyFallbackPlayerName(language = "ar") {
    const lang = language === "en" ? "en" : "ar";
    return lang === "en" ? "Player - Mar 2026" : "لاعب - مارس 2026";
}

function getAnonymousShortId() {
    try {
        const saved = String(localStorage.getItem(ANON_SHORT_ID_STORAGE_KEY) || "").trim();
        if (/^ANON[A-Za-z0-9]{4,8}$/.test(saved)) {
            return saved;
        }

        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let suffix = "";
        for (let i = 0; i < 6; i += 1) {
            suffix += chars[Math.floor(Math.random() * chars.length)];
        }
        const generated = `ANON${suffix}`;
        localStorage.setItem(ANON_SHORT_ID_STORAGE_KEY, generated);
        return generated;
    } catch (_error) {
        return "ANON0000";
    }
}

function getCachedPublicIdentity(uid) {
    const cached = publicIdentityCache.get(uid);
    if (!cached) {
        return null;
    }
    if (Date.now() - Number(cached.cachedAt || 0) > PUBLIC_IDENTITY_CACHE_TTL_MS) {
        publicIdentityCache.delete(uid);
        return null;
    }
    return cached.identity || null;
}

async function resolvePublicRoundIdentity(uid, storedUser, authUser) {
    const cached = getCachedPublicIdentity(uid);
    if (cached) {
        return cached;
    }

    const fallbackPlayerName = normalizeNonEmptyString(storedUser?.nickname)
        || normalizeNonEmptyString(storedUser?.displayName)
        || normalizeNonEmptyString(authUser?.displayName);
    const fallbackShortId = normalizeShortId(storedUser?.shortId, uid);
    const stateLanguage = readTypingGameState().currentLanguage === "en" ? "en" : "ar";

    const fallbackIdentity = {
        playerName: fallbackPlayerName || getLegacyFallbackPlayerName(stateLanguage),
        shortId: fallbackShortId,
        canWritePublicRound: false
    };

    try {
        const snapshot = await get(ref(db, `users/${uid}`));
        if (!snapshot.exists()) {
            publicIdentityCache.set(uid, { identity: fallbackIdentity, cachedAt: Date.now() });
            return fallbackIdentity;
        }

        const userNode = snapshot.val() || {};
        const profileNode = (userNode.profile && typeof userNode.profile === "object") ? userNode.profile : {};

        const dbPlayerName = normalizeNonEmptyString(profileNode.nickname)
            || normalizeNonEmptyString(profileNode.displayName)
            || normalizeNonEmptyString(userNode.nickname)
            || normalizeNonEmptyString(userNode.displayName);
        const dbShortId = normalizeShortId(profileNode.shortId || userNode.shortId, uid);

        const resolvedIdentity = {
            playerName: dbPlayerName || fallbackIdentity.playerName,
            shortId: dbShortId || fallbackIdentity.shortId,
            canWritePublicRound: Boolean(dbPlayerName && dbShortId)
        };

        publicIdentityCache.set(uid, { identity: resolvedIdentity, cachedAt: Date.now() });
        return resolvedIdentity;
    } catch (_error) {
        publicIdentityCache.set(uid, { identity: fallbackIdentity, cachedAt: Date.now() });
        return fallbackIdentity;
    }
}

function buildRoundWritePayload(uid, roundId, roundData, includePublicRound, publicRoundData) {
    const payload = {
        [`users/${uid}/rounds/${roundId}`]: roundData
    };

    if (includePublicRound && publicRoundData) {
        payload[`publicRounds/${roundId}`] = publicRoundData;
    }

    return payload;
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

    const typingSettings = normalizeTypingSettingsPayload(source.typingSettings);
    if (typingSettings) {
        normalized.typingSettings = typingSettings;
    }

    return normalized;
}

function normalizeTypingSettingsPayload(input) {
    const source = input && typeof input === "object" ? input : {};
    const normalized = {};

    if (typeof source.enabled === "boolean") {
        normalized.enabled = source.enabled;
    }

    if (typeof source.type === "string" && ALLOWED_KEYBOARD_TYPES.has(source.type)) {
        normalized.type = source.type;
    }

    if (typeof source.layout === "string" && ALLOWED_KEYBOARD_LAYOUTS.has(source.layout)) {
        normalized.layout = source.layout;
    }

    if (typeof source.inlineTrace === "boolean") {
        normalized.inlineTrace = source.inlineTrace;
    }

    if (typeof source.hideTypedText === "boolean") {
        normalized.hideTypedText = source.hideTypedText;
    }

    if (normalized.inlineTrace === true && normalized.hideTypedText === true) {
        normalized.hideTypedText = false;
    }

    return Object.keys(normalized).length ? normalized : null;
}

function readLocalTypingSettings() {
    try {
        const parsed = JSON.parse(localStorage.getItem(TYPING_SETTINGS_STORAGE_KEY) || "{}");
        const normalized = normalizeTypingSettingsPayload(parsed);
        return normalized ? { ...DEFAULT_TYPING_SETTINGS, ...normalized } : { ...DEFAULT_TYPING_SETTINGS };
    } catch (_error) {
        return { ...DEFAULT_TYPING_SETTINGS };
    }
}

function writeLocalTypingSettings(settings) {
    const normalized = normalizeTypingSettingsPayload(settings);
    if (!normalized) {
        return;
    }
    localStorage.setItem(TYPING_SETTINGS_STORAGE_KEY, JSON.stringify({
        ...DEFAULT_TYPING_SETTINGS,
        ...normalized
    }));
}

function getTypingSettingsSnapshot() {
    return readLocalTypingSettings();
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
        language: localState.currentLanguage,
        typingSettings: readLocalTypingSettings()
    });

    let merged = {
        theme: localPrefs.theme || DEFAULT_PREFS.theme,
        colorMode: localPrefs.colorMode || DEFAULT_PREFS.colorMode,
        language: localPrefs.language || DEFAULT_PREFS.language,
        typingSettings: {
            ...DEFAULT_TYPING_SETTINGS,
            ...(localPrefs.typingSettings || {})
        }
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
            const { typingSettings: remoteTypingSettings, ...remoteBasicPrefs } = remotePrefs;
            merged = {
                ...merged,
                ...remoteBasicPrefs,
                ...(remoteTypingSettings
                    ? {
                        typingSettings: {
                            ...DEFAULT_TYPING_SETTINGS,
                            ...merged.typingSettings,
                            ...remoteTypingSettings
                        }
                    }
                    : {})
            };
        }
    } catch (error) {
        console.warn("Preference load failed:", error);
    }

    writeTypingGameState(merged);
    writeLocalTypingSettings(merged.typingSettings || DEFAULT_TYPING_SETTINGS);
    return merged;
}

export async function saveUserPreferences(preferences) {
    const normalized = normalizePreferencePayload(preferences);
    if (!Object.keys(normalized).length) {
        return;
    }

    writeTypingGameState(normalized);
    if (normalized.typingSettings) {
        writeLocalTypingSettings(normalized.typingSettings);
    }

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

    let deviceType = "other";
    if (/iPad|Tablet|PlayBook|Silk|Kindle|Nexus 7|Nexus 10|SM-T|Tab/i.test(ua)) {
        deviceType = "tablet";
    } else if (/Mobi|Android|iPhone|iPod|Windows Phone|webOS|BlackBerry/i.test(ua)) {
        deviceType = "phone";
    } else if (/Mac|Win|Linux|CrOS|X11/i.test(platform)) {
        deviceType = "computer";
    }

    return {
        browser,
        platform,
        deviceType,
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

function countCharsForWpm(text) {
    return String(text || "").replace(/\s+/g, " ").trim().length;
}

function computeWpmFromText(text, timeTaken) {
    const charCount = Math.max(1, countCharsForWpm(text));
    const safeTime = Math.max(0.001, Number(timeTaken) || 0.001);
    return ((charCount / 5) / safeTime) * 60;
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
    const charCount = Math.max(1, countCharsForWpm(word));
    const safeTime = Math.max(0.001, Number(timeTaken) || 0.001);
    const secondsPerWord = safeTime / wordCount;
    const basePoints = wordCount;
    const speedTier = getSpeedTier(secondsPerWord);
    const speedPoints = wordCount * speedTier.multiplier;
    const totalPoints = basePoints + speedPoints;

    return {
        wordCount,
        charCount,
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

function computeLevelFromPoints(totalPoints) {
    const points = Math.max(0, Number(totalPoints || 0));
    if (points < FIRST_LEVEL_POINTS) {
        return 0;
    }
    return 1 + Math.floor((points - FIRST_LEVEL_POINTS) / LEVEL_STEP_POINTS);
}

async function updateUserStats(uid, roundMeta) {
    const statsRef = ref(db, `users/${uid}/profile/stats`);
    const now = roundMeta.timestamp || Date.now();
    const weekKey = getWeekKey(now);
    const monthKey = getMonthKey(now);
    let previousLevel = 0;
    let levelAfter = 0;

    await runTransaction(statsRef, (current) => {
        const safe = (current && typeof current === "object") ? current : {};
        const currentTotalPoints = Number(safe.totalPoints || 0);
        previousLevel = Number.isFinite(Number(safe.level))
            ? Number(safe.level)
            : computeLevelFromPoints(currentTotalPoints);
        const totalRounds = Number(safe.totalRounds || 0) + 1;
        const totalWords = Number(safe.totalWords || 0) + Number(roundMeta.wordCount || 0);
        const totalCharacters = Number(safe.totalCharacters || 0) + Number(roundMeta.charCount || 0);
        const totalPoints = currentTotalPoints + Number(roundMeta.totalPoints || 0);
        const level = computeLevelFromPoints(totalPoints);
        levelAfter = level;
        const speedBest = Number(safe.bestSecondsPerWord || 9999);
        const nextBest = Math.min(speedBest, Number(roundMeta.secondsPerWord || 9999));

        const weekly = (safe.weeklyPoints && typeof safe.weeklyPoints === "object") ? { ...safe.weeklyPoints } : {};
        const monthly = (safe.monthlyPoints && typeof safe.monthlyPoints === "object") ? { ...safe.monthlyPoints } : {};

        weekly[weekKey] = Number(weekly[weekKey] || 0) + Number(roundMeta.totalPoints || 0);
        monthly[monthKey] = Number(monthly[monthKey] || 0) + Number(roundMeta.totalPoints || 0);

        return {
            totalRounds,
            totalWords,
            totalCharacters,
            totalPoints,
            level,
            bestSecondsPerWord: Number(nextBest.toFixed(4)),
            weeklyPoints: weekly,
            monthlyPoints: monthly,
            badges: computeBadges(totalPoints),
            updatedAt: now
        };
    });

    return {
        levelBefore: Math.max(0, Number(previousLevel || 0)),
        levelAfter: Math.max(0, Number(levelAfter || 0)),
        leveledUp: Number(levelAfter || 0) > Number(previousLevel || 0)
    };
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

        if (detail.rejected) {
            return;
        }

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

        if (!item || item.uid !== activeUid || !item.roundData) {
            remaining.push(item);
            continue;
        }

        const includePublicRound = item.includePublicRound !== false && Boolean(item.publicRoundData);
        const roundId = normalizeNonEmptyString(item.roundId) || push(ref(db, `users/${activeUid}/rounds`)).key;
        if (!roundId) {
            remaining.push(item);
            continue;
        }

        attempted += 1;
        try {
            const writePayload = buildRoundWritePayload(
                activeUid,
                roundId,
                item.roundData,
                includePublicRound,
                item.publicRoundData
            );
            await update(ref(db), writePayload);

            const points = Number(item.roundData.totalPoints || 0);
            const wordCount = Number(item.roundData.wordCount || countWords(item.roundData.word));
            const charCount = Number(item.roundData.charCount || countCharsForWpm(item.roundData.word));
            const secondsPerWord = Number(item.roundData.secondsPerWord || ((Number(item.roundData.timeTaken || 0) || 0) / Math.max(1, wordCount)));
            await updateUserStats(activeUid, {
                wordCount,
                charCount,
                totalPoints: points,
                secondsPerWord,
                timestamp: Number(item.roundData.timestamp || Date.now())
            });

            succeeded += 1;
        } catch (_error) {
            remaining.push({
                ...item,
                roundId,
                includePublicRound
            });
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
    let pendingUid = "";
    let pendingRoundId = "";
    let pendingRoundData = null;
    let pendingPublicRoundData = null;
    let pendingIncludePublicRound = false;

    try {
        const authUser = auth.currentUser;
        const storedUserRaw = localStorage.getItem("dashTypeUser");
        const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;

        const safeExtra = (extraData && typeof extraData === "object" && !Array.isArray(extraData)) ? extraData : {};
        const providedValidation = safeExtra.roundValidation && typeof safeExtra.roundValidation === "object"
            ? safeExtra.roundValidation
            : null;
        const persistedExtra = { ...safeExtra };
        delete persistedExtra.roundValidation;

        if (providedValidation && providedValidation.isValid === false) {
            notifyRoundSaveStatus({
                success: false,
                rejected: true,
                reason: String(providedValidation.reason || "validation")
            });
            return { success: false, rejected: true, reason: String(providedValidation.reason || "validation") };
        }

        const textCharCount = countCharsForWpm(word);
        const computedWpm = computeWpmFromText(word, timeTaken);
        if (textCharCount >= 6 && computedWpm > 250) {
            notifyRoundSaveStatus({ success: false, rejected: true, reason: "wpm" });
            return { success: false, rejected: true, reason: "wpm" };
        }

        const uid = (authUser && authUser.uid) || "";
        if (!uid) {
            const clientTelemetry = await getClientTelemetry();
            const deviceType = String(clientTelemetry?.device?.deviceType || "other");
            const score = buildRoundScore(word, timeTaken);
            const now = Date.now();
            const languageSafe = language === "en" ? "en" : "ar";
            const playerName = getLegacyFallbackPlayerName(languageSafe);

            const guestRoundData = {
                word: word,
                timeTaken: timeTaken,
                mode: mode,
                language: languageSafe,
                playerName,
                shortId: getAnonymousShortId(),
                timestamp: now,
                wordCount: score.wordCount,
                charCount: score.charCount,
                basePoints: score.basePoints,
                speedPoints: score.speedPoints,
                totalPoints: score.totalPoints,
                secondsPerWord: score.secondsPerWord,
                speedTier: score.speedTier,
                speedMultiplier: score.speedMultiplier,
                deviceType,
                ...persistedExtra
            };

            const guestRoundId = push(ref(db, "publicRounds")).key;
            if (!guestRoundId) {
                throw new Error("Failed to allocate anonymous public round key.");
            }

            await update(ref(db), {
                [`publicRounds/${guestRoundId}`]: guestRoundData
            });

            notifyRoundSaveStatus({ success: true, cached: false, mode, timeTaken, points: score.totalPoints });
            return { success: true, cached: false, anonymous: true };
        }

        const identity = await resolvePublicRoundIdentity(uid, storedUser, authUser);
        const playerName = identity.playerName;
        const shortId = identity.shortId;
        const includePublicRound = identity.canWritePublicRound;

        const clientTelemetry = await getClientTelemetry();
        const deviceType = String(clientTelemetry?.device?.deviceType || "other");
        const score = buildRoundScore(word, timeTaken);
        const now = Date.now();
        const typingSettings = getTypingSettingsSnapshot();

        const roundData = {
            word: word,
            timeTaken: timeTaken,
            mode: mode,
            language: language,
            playerName: playerName,
            shortId: shortId,
            timestamp: now,
            wordCount: score.wordCount,
            charCount: score.charCount,
            basePoints: score.basePoints,
            speedPoints: score.speedPoints,
            totalPoints: score.totalPoints,
            secondsPerWord: score.secondsPerWord,
            speedTier: score.speedTier,
            speedMultiplier: score.speedMultiplier,
            deviceType,
            typingSettings,
            ...persistedExtra,
            clientTelemetry
        };

        const {
            clientTelemetry: _privateTelemetry,
            typingSettings: _privateTypingSettings,
            ...publicSafeRoundData
        } = roundData;

        const publicRoundData = {
            ...publicSafeRoundData
        };

        const roundId = push(ref(db, `users/${uid}/rounds`)).key;
        if (!roundId) {
            throw new Error("Failed to allocate round key.");
        }

        pendingUid = uid;
        pendingRoundId = roundId;
        pendingRoundData = roundData;
        pendingPublicRoundData = publicRoundData;
        pendingIncludePublicRound = includePublicRound;

        const writePayload = buildRoundWritePayload(
            uid,
            roundId,
            roundData,
            includePublicRound,
            publicRoundData
        );
        await update(ref(db), writePayload);

        const statsUpdate = await updateUserStats(uid, {
            wordCount: score.wordCount,
            charCount: score.charCount,
            totalPoints: score.totalPoints,
            secondsPerWord: score.secondsPerWord,
            timestamp: now
        });

        notifyRoundSaveStatus({
            success: true,
            cached: false,
            mode,
            timeTaken,
            points: score.totalPoints,
            levelBefore: Number(statsUpdate?.levelBefore || 0),
            levelAfter: Number(statsUpdate?.levelAfter || 0),
            level: Number(statsUpdate?.levelAfter || 0),
            leveledUp: Boolean(statsUpdate?.leveledUp)
        });
        void retryFailedRoundSaves(2);
        void scheduleRoundSync();
        return { success: true, cached: false };
    } catch (error) {
        console.error("Firebase save error:", error);
        try {
            if (pendingUid && pendingRoundData) {
                cacheFailedRoundPayload({
                    uid: pendingUid,
                    roundId: pendingRoundId,
                    roundData: pendingRoundData,
                    publicRoundData: pendingPublicRoundData,
                    includePublicRound: pendingIncludePublicRound,
                    cachedAt: Date.now()
                });
                notifyRoundSaveStatus({ success: false, cached: true, mode, timeTaken, points: Number(pendingRoundData.totalPoints || 0) });
                void scheduleRoundSync();
                return { success: false, cached: true };
            }

            const fallbackUid = resolveActiveUid();
            if (fallbackUid) {
                const safeExtra = (extraData && typeof extraData === "object" && !Array.isArray(extraData)) ? extraData : {};
                const persistedExtra = { ...safeExtra };
                delete persistedExtra.roundValidation;
                const score = buildRoundScore(word, timeTaken);
                const typingSettings = getTypingSettingsSnapshot();
                const deviceType = String(parseClientDevice().deviceType || "other");
                const fallbackRoundData = {
                    word,
                    timeTaken,
                    mode,
                    language,
                    playerName: getLegacyFallbackPlayerName(language),
                    shortId: normalizeShortId(fallbackUid, fallbackUid),
                    timestamp: Date.now(),
                    wordCount: score.wordCount,
                    charCount: score.charCount,
                    basePoints: score.basePoints,
                    speedPoints: score.speedPoints,
                    totalPoints: score.totalPoints,
                    secondsPerWord: score.secondsPerWord,
                    speedTier: score.speedTier,
                    speedMultiplier: score.speedMultiplier,
                    deviceType,
                    typingSettings,
                    ...persistedExtra
                };
                const fallbackPublicRoundData = {
                    ...fallbackRoundData
                };
                const fallbackRoundId = push(ref(db, `users/${fallbackUid}/rounds`)).key || "";
                cacheFailedRoundPayload({
                    uid: fallbackUid,
                    roundId: fallbackRoundId,
                    roundData: fallbackRoundData,
                    publicRoundData: fallbackPublicRoundData,
                    includePublicRound: false,
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

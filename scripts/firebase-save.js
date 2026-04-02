import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase, ref, push, get, update } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

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

let lastKnownUid = null;

onAuthStateChanged(auth, (user) => {
    lastKnownUid = user?.uid || null;
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

function readTypingGameState() {
    try {
        const parsed = JSON.parse(localStorage.getItem("typingGameState") || "{}");
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_error) {
        return {};
    }
}

function writeTypingGameState(preferences) {
    const existing = readTypingGameState();
    const merged = {
        ...existing,
        ...(preferences.theme ? { currentTheme: preferences.theme } : {}),
        ...(preferences.colorMode ? { currentColorMode: preferences.colorMode } : {}),
        ...(preferences.language ? { currentLanguage: preferences.language } : {})
    };
    localStorage.setItem("typingGameState", JSON.stringify(merged));
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
        screenSize,
        userAgent: ua
    };
}

async function fetchPublicIp(timeoutMs = 3500) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch("https://api.ipify.org?format=json", {
            method: "GET",
            cache: "no-store",
            signal: controller.signal
        });

        if (!response.ok) {
            return null;
        }

        const payload = await response.json();
        return typeof payload.ip === "string" && payload.ip.trim() ? payload.ip.trim() : null;
    } catch (_error) {
        return null;
    } finally {
        clearTimeout(timeoutId);
    }
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
        const publicIp = await fetchPublicIp();
        const telemetry = {
            publicIp: publicIp || "unknown",
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
            publicIp: "unknown",
            device: parseClientDevice(),
            capturedAt: Date.now()
        };
    });

    return inFlightTelemetryPromise;
}

window.saveRoundDataToFirebase = async function(word, timeTaken, mode, language, extraData = {}) {
    try {
        const authUser = auth.currentUser;
        const storedUserRaw = localStorage.getItem("dashTypeUser");
        const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;

        const uid = (authUser && authUser.uid) || (storedUser && storedUser.uid);
        if (!uid) {
            console.warn("Firebase save skipped: no authenticated user.");
            return;
        }

        const displayName = (storedUser && storedUser.nickname) || (authUser && authUser.displayName) || (storedUser && storedUser.displayName);
        const playerName = displayName || "لاعب مجهول";
        const shortId = uid.substring(0, 6);

        const safeExtra = (extraData && typeof extraData === "object" && !Array.isArray(extraData)) ? extraData : {};
        const clientTelemetry = await getClientTelemetry();

        const roundData = {
            word: word,
            timeTaken: timeTaken,
            mode: mode,
            language: language,
            playerName: playerName,
            shortId: shortId,
            timestamp: Date.now(),
            ...safeExtra,
            clientTelemetry
        };

        const userRef = ref(db, `users/${uid}/rounds`);
        const publicRoundsRef = ref(db, "publicRounds");

        const { clientTelemetry: _privateTelemetry, ...publicSafeRoundData } = roundData;

        const publicRoundData = {
            ...publicSafeRoundData,
            uid
        };

        await Promise.all([
            push(userRef, roundData),
            push(publicRoundsRef, publicRoundData)
        ]);
    } catch (error) {
        console.error("Firebase save error:", error);
    }
};

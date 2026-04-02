import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase, ref, get, set, update, push, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { loadUserPreferences, saveUserPreferences } from "./firebase-save.js";

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

const MAX_WORDS = 1000;
const RANDOM_WORD_COUNT = 120;

const wordsByLanguage = {
    ar: [
        "الكتابة", "السرعة", "التركيز", "تدريب", "احتراف", "لوحة", "مفاتيح", "دقة", "تحدي", "جولة",
        "متصفح", "واجهة", "مستخدم", "منصة", "تجربة", "تعلم", "تحسين", "زمن", "انجاز", "تقدم",
        "فقرة", "سطر", "نص", "كلمة", "فكرة", "محتوى", "تعليم", "مهارة", "تواصل", "هدف",
        "تعاون", "سباق", "مشاركة", "رابط", "عام", "خاص", "مميز", "معرف", "قائمة", "نتيجة",
        "سجل", "احصائية", "متابعة", "أفضل", "أسرع", "دقيقة", "ثانية", "وضوح", "تخطيط", "تجهيز"
    ],
    en: [
        "typing", "speed", "focus", "practice", "challenge", "keyboard", "accuracy", "paragraph", "content", "training",
        "session", "timer", "result", "progress", "mode", "custom", "public", "private", "share", "link",
        "multiplayer", "race", "start", "finish", "leaderboard", "record", "history", "performance", "improve", "skill",
        "learn", "better", "workflow", "system", "player", "profile", "community", "text", "words", "sentence",
        "goal", "score", "track", "build", "creator", "round", "smooth", "clear", "quick", "strong"
    ]
};

const textMap = {
    ar: {
        pageTitle: "DashType - نمط الفقرة",
        gameTitle: "DashType - نمط الفقرة",
        builderWindowTitle: "مكتبتي",
        createWindowTitle: "إنشاء نص جديد",
        raceWindowTitle: "الرابط والتحدي",
        typingWindowTitle: "اختبار الكتابة",
        greeting: "الفقرة: أنشئ نصك أو اختر من مكتبتك ثم ابدأ سباق الزمن.",
        builderHint: "اكتب فقرة جديدة للبدء.",
        builderHintFirstVisit: "أول مرة هنا: أنشئ نصك الأول ثم احفظه.",
        builderHintReturning: "اختر نصاً من قائمتك، أو أنشئ نصاً جديداً من الأسفل.",
        myTextsHint: "نصوصك السابقة",
        paragraphPlaceholder: "اكتب فقرتك هنا... (حد أقصى 1000 كلمة)",
        typingPlaceholder: "ابدأ كتابة الفقرة هنا...",
        sourceLabel: "المصدر",
        sourceLibrary: "المكتبة",
        sourceCreate: "إنشاء",
        generateParagraph: "توليد فقرة عشوائية",
        visibilityLabel: "الظهور",
        visibilityPublic: "عام",
        visibilityPrivate: "خاص",
        saveParagraph: "حفظ الفقرة",
        loadPublic: "فتح النص المحدد",
        toggleCreateShow: "إنشاء نص جديد",
        toggleCreateHide: "إخفاء إنشاء النص",
        createRace: "إنشاء تحدي مباشر",
        gateStart: "بدء الجولة",
        startRound: "بدء جولة",
        retryRound: "إعادة المحاولة",
        home: "الصفحة الرئيسية",
        timerLabel: "الوقت:",
        timerUnit: "ث",
        paragraphSaveReady: "احفظ فقرتك ثم ابدأ الجولة.",
        paragraphMissing: "لا يوجد نص للعب بعد",
        resultStart: "اختر أو أنشئ فقرة أولاً",
        resultStartTyping: "بدأ الوقت! اكتب الفقرة كاملة بدون أخطاء.",
        resultGoodContinue: "أداء ممتاز، استمر",
        resultWrong: "يوجد اختلاف عن النص، صحح ثم أكمل",
        resultDone: "أحسنت! أنهيت الفقرة خلال {time} ثانية",
        resultNeedLogin: "هذه الميزة تتطلب تسجيل الدخول بحسابك أولاً.",
        resultSavedPublic: "تم حفظ الفقرة كفقرة عامة ويمكن للجميع اللعب بها.",
        resultSavedPrivate: "تم حفظ الفقرة كفقرة خاصة، اللعب عبر الرابط فقط.",
        resultLoadedShare: "تم تحميل الفقرة من رابط المشاركة.",
        resultLoadedPublic: "تم تحميل الفقرة العامة بنجاح.",
        resultMaxWords: "تم تقليص النص إلى الحد الأقصى: 1000 كلمة.",
        resultNeedParagraph: "أدخل فقرة أولاً قبل الحفظ أو اللعب.",
        resultNeedCreateMode: "انتقل إلى تبويب إنشاء إذا أردت حفظ فقرة جديدة.",
        resultNeedPublicChoice: "اختر نصاً من قائمتك أولاً.",
        resultSavedToLibrary: "تمت إضافة النص إلى قائمتك.",
        resultRaceCreated: "تم إنشاء تحدي مباشر. شارك الرابط وانتظر انضمام اللاعب الثاني.",
        resultRaceWaiting: "بانتظار انضمام لاعب آخر، وسيبدأ العد التنازلي تلقائياً.",
        resultRaceJoined: "تم الانضمام للتحدي. انتظر العد التنازلي.",
        resultRaceCountdown: "سيبدأ التحدي بعد {seconds} ثوانٍ",
        resultRaceStarted: "بدأ التحدي المشترك الآن!",
        resultRaceWinner: "الفائز: {name} بزمن {time} ثانية",
        resultRaceLeaderNow: "المتصدر حالياً: {name} بزمن {time} ثانية",
        progressTemplate: "{typed} / {total} كلمة",
        metaWords: "الكلمات: {count}",
        metaChars: "الأحرف: {count}",
        metaQuality: "الجودة: {level}",
        qualityLow: "منخفضة",
        qualityMedium: "متوسطة",
        qualityHigh: "عالية",
        publicSelectPlaceholder: "اختر نصاً محفوظاً...",
        publicSelectEmpty: "لا توجد نصوص محفوظة بعد",
        shareLinkPlaceholder: "رابط المشاركة سيظهر هنا",
        shareGuideTip: "إنشاء رابط لكل نص يعمل تلقائياً، فقط افتح اللعبة عبر رابط موقع (وليس file://).",
        raceStateIdle: "لا يوجد تحدي مباشر حالياً.",
        raceStateWaiting: "حالة التحدي: انتظار اللاعبين ({count})",
        raceStateCountdown: "حالة التحدي: عد تنازلي للبدء",
        raceStateRunning: "حالة التحدي: التحدي جارٍ الآن",
        raceStateFinished: "حالة التحدي: انتهى التحدي",
        leaderboardTitle: "أسرع اللاعبين في هذه الفقرة",
        leaderboardEmpty: "لا توجد نتائج بعد لهذه الفقرة.",
        themeLabel: "المظهر",
        colorModeLabel: "الوضع",
        langLabel: "اللغة",
        themeOcean: "أزرق وبرتقالي",
        themeSunset: "وردي وأصفر",
        themeForest: "أخضر وأزرق",
        themeBerry: "بنفسجي ووردي",
        themeNeon: "أخضر وأصفر",
        themeViolet: "بنفسجي ووردي",
        themeBrown: "بني",
        darkMode: "داكن",
        blurMode: "ضبابي",
        lightMode: "فاتح",
        langArabic: "العربية",
        langEnglish: "English",
        contactLabel: "للتواصل معنا",
        versionLabel: "الإصدار",
        betaLabel: "بيتا",
        mazenNameTxt: "مازن",
        ahmedNameTxt: "أحمد"
    },
    en: {
        pageTitle: "DashType - Paragraph Mode",
        gameTitle: "DashType - Paragraph Mode",
        builderWindowTitle: "My Library",
        createWindowTitle: "Create New Text",
        raceWindowTitle: "Share Link & Live Race",
        typingWindowTitle: "Typing Test",
        greeting: "Paragraph mode: create your text or pick one from your library, then race the timer.",
        builderHint: "Create your first text to begin.",
        builderHintFirstVisit: "First visit: create your first text and save it.",
        builderHintReturning: "Pick a saved text, or create a new one below.",
        myTextsHint: "Your Saved Texts",
        paragraphPlaceholder: "Write your paragraph here... (max 1000 words)",
        typingPlaceholder: "Start typing the paragraph here...",
        sourceLabel: "Source",
        sourceLibrary: "Library",
        sourceCreate: "Create",
        generateParagraph: "Generate Random Paragraph",
        visibilityLabel: "Visibility",
        visibilityPublic: "Public",
        visibilityPrivate: "Private",
        saveParagraph: "Save Paragraph",
        loadPublic: "Open Selected Text",
        toggleCreateShow: "Create New Text",
        toggleCreateHide: "Hide Create Panel",
        createRace: "Create Live Race",
        gateStart: "Start Round",
        startRound: "Start Round",
        retryRound: "Retry",
        home: "Home",
        timerLabel: "Time:",
        timerUnit: "s",
        paragraphSaveReady: "Save your paragraph, then start the round.",
        paragraphMissing: "No paragraph selected yet",
        resultStart: "Create or load a paragraph first",
        resultStartTyping: "Timer started! Type the full paragraph without mistakes.",
        resultGoodContinue: "Great pace, keep going",
        resultWrong: "Text mismatch detected, fix and continue",
        resultDone: "Great! You finished the paragraph in {time} seconds",
        resultNeedLogin: "This feature requires signing in with your account.",
        resultSavedPublic: "Paragraph saved as public and available for everyone.",
        resultSavedPrivate: "Paragraph saved as private. It is playable by link only.",
        resultLoadedShare: "Paragraph loaded from shared link.",
        resultLoadedPublic: "Public paragraph loaded successfully.",
        resultMaxWords: "Text trimmed to the maximum limit: 1000 words.",
        resultNeedParagraph: "Enter a paragraph before saving or playing.",
        resultNeedCreateMode: "Switch to Create tab to save a new paragraph.",
        resultNeedPublicChoice: "Choose a text from your list first.",
        resultSavedToLibrary: "Text added to your personal list.",
        resultRaceCreated: "Live race created. Share the link and wait for another player.",
        resultRaceWaiting: "Waiting for one more player. Countdown starts automatically.",
        resultRaceJoined: "Joined the race. Wait for countdown.",
        resultRaceCountdown: "Race starts in {seconds} seconds",
        resultRaceStarted: "Shared race started now!",
        resultRaceWinner: "Winner: {name} with {time} seconds",
        resultRaceLeaderNow: "Current leader: {name} with {time} seconds",
        progressTemplate: "{typed} / {total} words",
        metaWords: "Words: {count}",
        metaChars: "Chars: {count}",
        metaQuality: "Quality: {level}",
        qualityLow: "Low",
        qualityMedium: "Medium",
        qualityHigh: "High",
        publicSelectPlaceholder: "Choose a saved text...",
        publicSelectEmpty: "No saved texts yet",
        shareLinkPlaceholder: "Share link will appear here",
        shareGuideTip: "Share links are generated automatically. Open the app from a web URL (not file://).",
        raceStateIdle: "No active live race.",
        raceStateWaiting: "Race status: waiting for players ({count})",
        raceStateCountdown: "Race status: countdown",
        raceStateRunning: "Race status: live now",
        raceStateFinished: "Race status: finished",
        leaderboardTitle: "Fastest players on this paragraph",
        leaderboardEmpty: "No results yet for this paragraph.",
        themeLabel: "Theme",
        colorModeLabel: "Mode",
        langLabel: "Language",
        themeOcean: "Blue & Orange",
        themeSunset: "Pink & Yellow",
        themeForest: "Green & Blue",
        themeBerry: "Purple & Pink",
        themeNeon: "Green & Yellow",
        themeViolet: "Purple & Pink",
        themeBrown: "Brown",
        darkMode: "Dark",
        blurMode: "Blurred",
        lightMode: "Light",
        langArabic: "Arabic",
        langEnglish: "English",
        contactLabel: "Contact us",
        versionLabel: "Version",
        betaLabel: "Beta",
        mazenNameTxt: "Mazen",
        ahmedNameTxt: "Ahmed"
    }
};

const wordBox = document.getElementById("wordBox");
const typingInput = document.getElementById("typingInput");
const timeValue = document.getElementById("timeValue");
const resultText = document.getElementById("resultText");
const paragraphSaveResult = document.getElementById("paragraphSaveResult");
const startBtn = document.getElementById("startBtn");
const gateStartBtn = document.getElementById("gateStartBtn");
const startGate = document.getElementById("startGate");
const nextBtn = document.getElementById("nextBtn");
const homeBtn = document.getElementById("homeBtn");
const progressText = document.getElementById("progressText");
const playerGreeting = document.getElementById("playerGreeting");
const gameTitle = document.getElementById("gameTitle");
const timerLabel = document.getElementById("timerLabel");
const timerUnit = document.getElementById("timerUnit");
const builderHint = document.getElementById("builderHint");
const builderWindowTitle = document.getElementById("builderWindowTitle");
const createWindowTitle = document.getElementById("createWindowTitle");
const raceWindowTitle = document.getElementById("raceWindowTitle");
const typingWindowTitle = document.getElementById("typingWindowTitle");
const sourceLabel = document.getElementById("sourceLabel");
const sourceLibraryBtn = document.getElementById("sourceLibraryBtn");
const sourceCreateBtn = document.getElementById("sourceCreateBtn");
const myTextsHint = document.getElementById("myTextsHint");
const toggleCreatePanelBtn = document.getElementById("toggleCreatePanelBtn");
const toggleCreatePanelText = document.getElementById("toggleCreatePanelText");
const paragraphWordsMeta = document.getElementById("paragraphWordsMeta");
const paragraphCharsMeta = document.getElementById("paragraphCharsMeta");
const paragraphQualityMeta = document.getElementById("paragraphQualityMeta");
const composePanel = document.getElementById("composePanel");
const libraryPanel = document.getElementById("libraryPanel");
const libraryWindow = document.getElementById("libraryWindow");
const composeWindow = document.getElementById("composeWindow");
const raceWindow = document.getElementById("raceWindow");

const paragraphInput = document.getElementById("paragraphInput");
const generateParagraphBtn = document.getElementById("generateParagraphBtn");
const saveParagraphBtn = document.getElementById("saveParagraphBtn");
const visibilityLabel = document.getElementById("visibilityLabel");
const visibilityPublicBtn = document.getElementById("visibilityPublicBtn");
const visibilityPrivateBtn = document.getElementById("visibilityPrivateBtn");
const publicParagraphSelect = document.getElementById("publicParagraphSelect");
const loadPublicParagraphBtn = document.getElementById("loadPublicParagraphBtn");
const createRaceBtn = document.getElementById("createRaceBtn");
const shareLinkInput = document.getElementById("shareLinkInput");
const shareGuideText = document.getElementById("shareGuideText");
const raceStateText = document.getElementById("raceStateText");

const paragraphLeaderboardTitle = document.getElementById("paragraphLeaderboardTitle");
const paragraphLeaderboardList = document.getElementById("paragraphLeaderboardList");

const themeLabel = document.getElementById("themeLabel");
const colorModeLabel = document.getElementById("colorModeLabel");
const langLabel = document.getElementById("langLabel");
const langArBtn = document.getElementById("langArBtn");
const langEnBtn = document.getElementById("langEnBtn");

const themeOceanBtn = document.getElementById("themeOceanBtn");
const themeSunsetBtn = document.getElementById("themeSunsetBtn");
const themeForestBtn = document.getElementById("themeForestBtn");
const themeBerryBtn = document.getElementById("themeBerryBtn");
const themeNeonBtn = document.getElementById("themeNeonBtn");
const themeVioletBtn = document.getElementById("themeVioletBtn");
const themeBrownBtn = document.getElementById("themeBrownBtn");
const colorModeDarkBtn = document.getElementById("colorModeDarkBtn");
const colorModeBlurBtn = document.getElementById("colorModeBlurBtn");
const colorModeLightBtn = document.getElementById("colorModeLightBtn");

const themeButtons = [themeOceanBtn, themeSunsetBtn, themeForestBtn, themeBerryBtn, themeNeonBtn, themeVioletBtn, themeBrownBtn];
const colorModeButtons = [colorModeDarkBtn, colorModeBlurBtn, colorModeLightBtn];

let playerName = "لاعب";
let currentLanguage = "ar";
let currentParagraph = "";
let currentParagraphId = "";
let currentParagraphOwnerUid = "";
let paragraphVisibility = "public";
let sourceMode = "create";
let entryByExternalLink = false;
let hasLibraryHistory = false;

let timerStarted = false;
let startTime = 0;
let finalTime = 0;
let rafId = null;
let isApplyingRemotePreferences = false;

let currentUser = null;
let raceListenerStop = null;
let countdownTimer = null;
const publicParagraphCache = new Map();
const PROGRESSIVE_VISIT_KEY = "g4ProgressiveVisited";
const LOCAL_LIBRARY_KEY = "g4LocalParagraphs";

const raceState = {
    raceId: "",
    isHost: false,
    status: "idle",
    startsAt: 0
};

function t(key) {
    return textMap[currentLanguage][key];
}

function format(template, values) {
    let out = template;
    for (const [k, v] of Object.entries(values)) {
        out = out.replaceAll("{" + k + "}", String(v));
    }
    return out;
}

function normalizeWhitespace(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeForCompare(value) {
    const compact = normalizeWhitespace(value);
    if (currentLanguage === "en") {
        return compact.toLowerCase();
    }
    return compact;
}

function countWords(value) {
    const compact = normalizeWhitespace(value);
    if (!compact) return 0;
    return compact.split(" ").length;
}

function trimToWordLimit(value, maxWords = MAX_WORDS) {
    const words = normalizeWhitespace(value).split(" ").filter(Boolean);
    if (words.length <= maxWords) {
        return {
            text: words.join(" "),
            wasTrimmed: false
        };
    }
    return {
        text: words.slice(0, maxWords).join(" "),
        wasTrimmed: true
    };
}

function getStoredUser() {
    try {
        const stored = JSON.parse(localStorage.getItem("dashTypeUser") || "null");
        if (stored && stored.uid) {
            return stored;
        }
    } catch (_error) {
        // Ignore invalid storage.
    }
    return null;
}

function getCurrentUserPayload() {
    if (currentUser && currentUser.uid) {
        return {
            uid: currentUser.uid,
            displayName: currentUser.displayName || currentUser.email || playerName,
            shortId: currentUser.uid.substring(0, 6)
        };
    }
    const stored = getStoredUser();
    if (stored && stored.uid) {
        return {
            uid: stored.uid,
            displayName: stored.nickname || stored.displayName || stored.email || playerName,
            shortId: stored.shortId || stored.uid.substring(0, 6)
        };
    }
    return null;
}

function hasVisitedMode4() {
    return localStorage.getItem(PROGRESSIVE_VISIT_KEY) === "1";
}

function markVisitedMode4() {
    localStorage.setItem(PROGRESSIVE_VISIT_KEY, "1");
}

function getLocalLibrary() {
    try {
        const parsed = JSON.parse(localStorage.getItem(LOCAL_LIBRARY_KEY) || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
        return [];
    }
}

function saveLocalLibrary(items) {
    localStorage.setItem(LOCAL_LIBRARY_KEY, JSON.stringify(items));
}

function normalizeLibraryEntry(paragraphData, sourceType = "owned") {
    const text = normalizeWhitespace(paragraphData.text || "");
    const paragraphId = paragraphData.paragraphId || "";
    return {
        paragraphId,
        text,
        wordCount: paragraphData.wordCount || countWords(text),
        language: paragraphData.language || currentLanguage,
        ownerUid: paragraphData.ownerUid || "",
        ownerName: paragraphData.ownerName || "",
        sourceType,
        createdAt: paragraphData.createdAt || Date.now(),
        lastOpenedAt: Date.now()
    };
}

function saveState() {
    const state = {
        playerName,
        currentLanguage,
        currentTheme: document.documentElement.getAttribute("data-theme") || "ocean",
        currentColorMode: document.documentElement.getAttribute("data-color-mode") || "blur",
        selectedMode: "paragraph",
        paragraphVisibility,
        paragraphSourceMode: sourceMode
    };
    localStorage.setItem("typingGameState", JSON.stringify(state));

    if (!isApplyingRemotePreferences) {
        void saveUserPreferences({
            theme: state.currentTheme,
            colorMode: state.currentColorMode,
            language: state.currentLanguage
        });
    }
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.theme === theme);
    });
    saveState();
}

function setColorMode(colorMode) {
    document.documentElement.setAttribute("data-color-mode", colorMode);
    colorModeButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.colorMode === colorMode);
    });
    updateLogo();
    saveState();
}

function updateLogo() {
    const logoImg = document.getElementById("logoImg");
    if (!logoImg) return;
    const colorMode = document.documentElement.getAttribute("data-color-mode") || "blur";
    const lang = (document.documentElement.lang || currentLanguage || "ar").toLowerCase();
    const isArabic = lang === "ar";
    logoImg.src = colorMode === "light"
        ? (isArabic ? "photo/dashtype%20black%20Wordmark%20ar.png" : "photo/dashtype%20black%20Wordmark.png")
        : (isArabic ? "photo/dashtype%20White%20Wordmark%20ar.png" : "photo/dashtype%20white%20Wordmark.png");
}

function loadState() {
    try {
        const saved = JSON.parse(localStorage.getItem("typingGameState") || "{}");
        if (typeof saved.playerName === "string" && saved.playerName.trim()) {
            playerName = saved.playerName;
        }
        if (saved.currentLanguage === "ar" || saved.currentLanguage === "en") {
            currentLanguage = saved.currentLanguage;
        }
        if (saved.paragraphVisibility === "public" || saved.paragraphVisibility === "private") {
            paragraphVisibility = saved.paragraphVisibility;
        }
        if (saved.paragraphSourceMode === "library" || saved.paragraphSourceMode === "create") {
            sourceMode = saved.paragraphSourceMode;
        }
        setTheme(typeof saved.currentTheme === "string" ? saved.currentTheme : "ocean");
        setColorMode(typeof saved.currentColorMode === "string" ? saved.currentColorMode : "blur");
    } catch (_error) {
        setTheme("ocean");
        setColorMode("blur");
    }
}

async function applyRemotePreferences() {
    try {
        const remote = await loadUserPreferences();
        if (!remote || typeof remote !== "object") {
            return;
        }

        isApplyingRemotePreferences = true;

        if (typeof remote.theme === "string") {
            setTheme(remote.theme);
        }

        if (typeof remote.colorMode === "string") {
            setColorMode(remote.colorMode);
        }

        if (remote.language === "ar" || remote.language === "en") {
            currentLanguage = remote.language;
        }

        setLanguage(currentLanguage);
    } catch (error) {
        console.warn("Remote preferences sync failed:", error);
    } finally {
        isApplyingRemotePreferences = false;
    }
}

function setResultMessage(message, className = "result") {
    resultText.textContent = message;
    resultText.className = className;
}

function setBuilderMessage(message, className = "result") {
    paragraphSaveResult.textContent = message;
    paragraphSaveResult.className = className;
}

function setParagraphVisibility(mode) {
    paragraphVisibility = mode === "private" ? "private" : "public";
    visibilityPublicBtn.classList.toggle("active", paragraphVisibility === "public");
    visibilityPrivateBtn.classList.toggle("active", paragraphVisibility === "private");
    saveState();
}

function evaluateParagraphQuality(text) {
    const words = normalizeWhitespace(text).split(" ").filter(Boolean);
    if (!words.length) {
        return t("qualityLow");
    }

    const uniqueCount = new Set(words.map((w) => w.toLowerCase())).size;
    const uniqueRatio = uniqueCount / words.length;
    const avgLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;

    if (words.length >= 50 && uniqueRatio >= 0.55 && avgLength >= 4) {
        return t("qualityHigh");
    }
    if (words.length >= 20 && uniqueRatio >= 0.4) {
        return t("qualityMedium");
    }
    return t("qualityLow");
}

function updateParagraphMeta(overrideText = null) {
    const sourceText = typeof overrideText === "string" ? overrideText : paragraphInput.value;
    const text = normalizeWhitespace(sourceText);
    const words = countWords(text);
    const chars = text.length;
    const quality = evaluateParagraphQuality(text);

    paragraphWordsMeta.textContent = format(t("metaWords"), { count: words });
    paragraphCharsMeta.textContent = format(t("metaChars"), { count: chars });
    paragraphQualityMeta.textContent = format(t("metaQuality"), { level: quality });

    saveParagraphBtn.disabled = words === 0;
}

function setSourceMode(mode) {
    sourceMode = mode === "create" ? "create" : "library";
    if (sourceLibraryBtn) sourceLibraryBtn.classList.toggle("active", sourceMode === "library");
    if (sourceCreateBtn) sourceCreateBtn.classList.toggle("active", sourceMode === "create");

    setComposePanelOpen(sourceMode === "create");

    updateParagraphMeta();
    saveState();
}

function setComposePanelOpen(isOpen) {
    if (composeWindow) composeWindow.classList.toggle("hidden", !isOpen);
    if (composePanel) composePanel.classList.remove("hidden");
    if (toggleCreatePanelText) {
        toggleCreatePanelText.textContent = isOpen ? t("toggleCreateHide") : t("toggleCreateShow");
    }
    if (toggleCreatePanelBtn) {
        toggleCreatePanelBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
}

function applyProgressiveDisclosure() {
    const hasHistory = hasLibraryHistory;
    const forceCreateFlow = !entryByExternalLink && !hasHistory;
    if (forceCreateFlow) {
        if (libraryWindow) libraryWindow.classList.add("hidden");
        if (raceWindow) raceWindow.classList.add("hidden");
        builderHint.textContent = t("builderHintFirstVisit");
        setSourceMode("create");
        return;
    }

    if (libraryWindow) libraryWindow.classList.remove("hidden");
    if (raceWindow) raceWindow.classList.remove("hidden");
    builderHint.textContent = t("builderHintReturning");
    setSourceMode("library");
}

function updateProgress(typedText = "") {
    const typed = countWords(typedText);
    const total = countWords(currentParagraph);
    progressText.textContent = format(t("progressTemplate"), { typed, total });
}

function stopTimer() {
    timerStarted = false;
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
    finalTime = parseFloat(timeValue.textContent || "0");
}

function updateTimer() {
    if (!timerStarted) return;
    const elapsed = (performance.now() - startTime) / 1000;
    timeValue.textContent = elapsed.toFixed(3);
    rafId = requestAnimationFrame(updateTimer);
}

function showStartGate() {
    startGate.classList.remove("hidden");
}

function hideStartGate() {
    startGate.classList.add("hidden");
}

function setActiveParagraph(paragraphData, sourceMessage = "") {
    currentParagraph = normalizeWhitespace(paragraphData.text || "");
    currentParagraphId = paragraphData.paragraphId || "";
    currentParagraphOwnerUid = paragraphData.ownerUid || "";

    wordBox.textContent = currentParagraph || t("paragraphMissing");
    typingInput.value = "";
    typingInput.disabled = true;
    timeValue.textContent = "0.000";
    stopTimer();
    updateProgress("");
    updateParagraphMeta(currentParagraph);

    if (sourceMessage) {
        setBuilderMessage(sourceMessage, "result success");
    }

    setResultMessage(t("resultStart"), "result");
    showStartGate();

    if (currentParagraphId) {
        loadParagraphLeaderboard(currentParagraphId);
    } else {
        renderParagraphLeaderboard([]);
    }
}

function renderParagraphLeaderboard(rows) {
    paragraphLeaderboardList.innerHTML = "";
    if (!rows.length) {
        const li = document.createElement("li");
        li.textContent = t("leaderboardEmpty");
        paragraphLeaderboardList.appendChild(li);
        return;
    }
    rows.slice(0, 5).forEach((row, index) => {
        const li = document.createElement("li");
        const shortTag = row.shortId ? ` #${row.shortId}` : "";
        li.textContent = `${index + 1}. ${row.playerName}${shortTag} - ${row.timeTaken.toFixed(3)} ${t("timerUnit")}`;
        paragraphLeaderboardList.appendChild(li);
    });
}

async function loadParagraphLeaderboard(paragraphId) {
    try {
        const roundsSnapshot = await get(ref(db, "publicRounds"));
        if (!roundsSnapshot.exists()) {
            renderParagraphLeaderboard([]);
            return;
        }

        const rows = [];
        const rounds = roundsSnapshot.val();

        Object.keys(rounds).forEach((roundId) => {
            const round = rounds[roundId];
            if (!round) return;
            if (round.mode !== "paragraph") return;
            if (round.paragraphId !== paragraphId) return;
            if (typeof round.timeTaken !== "number") return;

            rows.push({
                playerName: round.playerName || "Player",
                shortId: round.shortId || "",
                timeTaken: parseFloat(round.timeTaken)
            });
        });

        rows.sort((a, b) => a.timeTaken - b.timeTaken);
        renderParagraphLeaderboard(rows);
    } catch (error) {
        console.error("Failed to load paragraph leaderboard:", error);
        renderParagraphLeaderboard([]);
    }
}

function updateRaceStatusText(participantsCount = 0) {
    if (!raceState.raceId) {
        raceStateText.textContent = t("raceStateIdle");
        return;
    }
    if (raceState.status === "waiting") {
        raceStateText.textContent = format(t("raceStateWaiting"), { count: participantsCount });
        return;
    }
    if (raceState.status === "countdown") {
        raceStateText.textContent = t("raceStateCountdown");
        return;
    }
    if (raceState.status === "running") {
        raceStateText.textContent = t("raceStateRunning");
        return;
    }
    if (raceState.status === "finished") {
        raceStateText.textContent = t("raceStateFinished");
        return;
    }
    raceStateText.textContent = t("raceStateIdle");
}

function clearCountdown() {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
}

function startRoundNow() {
    if (!currentParagraph) {
        setBuilderMessage(t("resultNeedParagraph"), "result warning");
        return;
    }
    typingInput.value = "";
    typingInput.disabled = false;
    timeValue.textContent = "0.000";
    setResultMessage(t("resultStartTyping"), "result");
    timerStarted = true;
    startTime = performance.now();
    updateTimer();
    updateProgress("");
    hideStartGate();
    typingInput.focus();
}

function resetRound() {
    typingInput.value = "";
    typingInput.disabled = true;
    timeValue.textContent = "0.000";
    stopTimer();
    updateProgress("");
    setResultMessage(t("resultStart"), "result");
    showStartGate();
}

function getComparisonState() {
    const typed = normalizeForCompare(typingInput.value);
    const target = normalizeForCompare(currentParagraph);
    return { typed, target };
}

async function tryFinalizeRace() {
    if (!raceState.raceId || !raceState.isHost) return;

    const snapshot = await get(ref(db, `paragraphRaces/${raceState.raceId}`));
    if (!snapshot.exists()) return;

    const data = snapshot.val();
    const participants = data.participants || {};
    const allParticipants = Object.values(participants);
    if (allParticipants.length < 2) return;

    const finished = allParticipants.filter((item) => typeof item.timeTaken === "number");
    if (finished.length >= 2 && finished.length === allParticipants.length) {
        await update(ref(db, `paragraphRaces/${raceState.raceId}`), { status: "finished" });
    }
}

function getRaceWinner(participantsMap) {
    const finished = Object.values(participantsMap || {}).filter((item) => typeof item.timeTaken === "number");
    if (!finished.length) return null;
    finished.sort((a, b) => a.timeTaken - b.timeTaken);
    return finished[0];
}

async function finishRound() {
    stopTimer();
    const doneMessage = format(t("resultDone"), { time: finalTime.toFixed(3) });
    setResultMessage(doneMessage, "result success");

    typingInput.disabled = true;
    showStartGate();

    if (window.saveRoundDataToFirebase) {
        window.saveRoundDataToFirebase(currentParagraph, finalTime, "paragraph", currentLanguage, {
            paragraphId: currentParagraphId || null,
            paragraphOwnerUid: currentParagraphOwnerUid || null,
            raceId: raceState.raceId || null
        });
    }

    if (!raceState.raceId) {
        return;
    }

    const user = getCurrentUserPayload();
    if (!user) return;

    await update(ref(db, `paragraphRaces/${raceState.raceId}/participants/${user.uid}`), {
        name: user.displayName,
        finishedAt: Date.now(),
        timeTaken: finalTime
    });

    await tryFinalizeRace();
}

function generateRandomParagraph() {
    setSourceMode("create");

    const words = wordsByLanguage[currentLanguage] || wordsByLanguage.ar;
    const generated = [];
    for (let i = 0; i < RANDOM_WORD_COUNT; i += 1) {
        const randomWord = words[Math.floor(Math.random() * words.length)];
        generated.push(randomWord);
    }

    const chunks = [];
    for (let i = 0; i < generated.length; i += 12) {
        chunks.push(generated.slice(i, i + 12).join(" "));
    }

    paragraphInput.value = `${chunks.join(". ")}.`;
    updateParagraphMeta();
    setBuilderMessage(t("paragraphSaveReady"), "result");
}

async function saveParagraph(isPublic) {
    const user = getCurrentUserPayload();
    if (!user) {
        setBuilderMessage(t("resultNeedLogin"), "result warning");
        return;
    }

    const trimmed = trimToWordLimit(paragraphInput.value, MAX_WORDS);
    paragraphInput.value = trimmed.text;

    if (trimmed.wasTrimmed) {
        setBuilderMessage(t("resultMaxWords"), "result warning");
    }

    if (!trimmed.text) {
        setBuilderMessage(t("resultNeedParagraph"), "result warning");
        return;
    }

    const paragraphRef = push(ref(db, "paragraphs"));
    const paragraphId = paragraphRef.key;

    const paragraphData = {
        paragraphId,
        text: trimmed.text,
        wordCount: countWords(trimmed.text),
        language: currentLanguage,
        isPublic,
        ownerUid: user.uid,
        ownerName: user.displayName,
        createdAt: Date.now()
    };

    await set(paragraphRef, paragraphData);
    setActiveParagraph(paragraphData, isPublic ? t("resultSavedPublic") : t("resultSavedPrivate"));
    await saveParagraphToLibrary(paragraphData, "owned");
    markVisitedMode4();

    const shareUrl = `${window.location.origin}${window.location.pathname}?paragraph=${paragraphId}`;
    shareLinkInput.value = shareUrl;

    await loadPublicParagraphs(paragraphId);
    applyProgressiveDisclosure();
}

async function saveParagraphToLibrary(paragraphData, sourceType = "owned") {
    const entry = normalizeLibraryEntry(paragraphData, sourceType);
    if (!entry.paragraphId || !entry.text) return;

    const user = getCurrentUserPayload();
    if (user) {
        await set(ref(db, `users/${user.uid}/savedParagraphs/${entry.paragraphId}`), entry);
        return;
    }

    const local = getLocalLibrary().filter((item) => item.paragraphId !== entry.paragraphId);
    local.push(entry);
    saveLocalLibrary(local);
}

async function loadPublicParagraphs(selectedParagraphId = "") {
    publicParagraphSelect.innerHTML = "";
    publicParagraphCache.clear();
    hasLibraryHistory = false;

    const user = getCurrentUserPayload();
    const merged = new Map();

    try {
        if (user) {
            const [savedSnapshot, paragraphsSnapshot] = await Promise.all([
                get(ref(db, `users/${user.uid}/savedParagraphs`)),
                get(ref(db, "paragraphs"))
            ]);

            if (savedSnapshot.exists()) {
                const savedItems = Object.values(savedSnapshot.val());
                savedItems.forEach((item) => {
                    if (item?.paragraphId && item?.text) {
                        merged.set(item.paragraphId, item);
                    }
                });
            }

            if (paragraphsSnapshot.exists()) {
                const allParagraphs = Object.values(paragraphsSnapshot.val());
                allParagraphs
                    .filter((item) => item?.paragraphId && item?.text && item.ownerUid === user.uid)
                    .forEach((item) => {
                        const existing = merged.get(item.paragraphId) || {};
                        merged.set(item.paragraphId, {
                            ...normalizeLibraryEntry(item, "owned"),
                            lastOpenedAt: existing.lastOpenedAt || item.createdAt || Date.now()
                        });
                    });
            }
        } else {
            getLocalLibrary().forEach((item) => {
                if (item?.paragraphId && item?.text) {
                    merged.set(item.paragraphId, item);
                }
            });
        }
    } catch (error) {
        console.error("Failed to load personal texts:", error);
    }

    const entries = Array.from(merged.values()).sort((a, b) => {
        const aTime = a.lastOpenedAt || a.createdAt || 0;
        const bTime = b.lastOpenedAt || b.createdAt || 0;
        return bTime - aTime;
    });
    hasLibraryHistory = entries.length > 0;
    if (hasLibraryHistory) {
        markVisitedMode4();
    }

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = entries.length ? t("publicSelectPlaceholder") : t("publicSelectEmpty");
    publicParagraphSelect.appendChild(placeholder);

    entries.forEach((item) => {
        publicParagraphCache.set(item.paragraphId, item);
        const option = document.createElement("option");
        option.value = item.paragraphId;
        const preview = String(item.text || "").slice(0, 46);
        option.textContent = `${item.wordCount || 0} - ${preview}`;
        publicParagraphSelect.appendChild(option);
    });

    const targetId = selectedParagraphId || currentParagraphId || "";
    if (targetId && publicParagraphCache.has(targetId)) {
        publicParagraphSelect.value = targetId;
    }
}

async function loadParagraphById(paragraphId, fromShare = false) {
    if (!paragraphId) return;

    const snapshot = await get(ref(db, `paragraphs/${paragraphId}`));
    if (!snapshot.exists()) {
        setBuilderMessage(t("resultNeedParagraph"), "result warning");
        return;
    }

    const paragraphData = snapshot.val();
    setActiveParagraph(paragraphData, fromShare ? t("resultLoadedShare") : t("resultLoadedPublic"));
    paragraphInput.value = paragraphData.text || "";
    updateParagraphMeta(paragraphData.text || "");
    shareLinkInput.value = `${window.location.origin}${window.location.pathname}?paragraph=${paragraphData.paragraphId}`;

    if (fromShare) {
        await saveParagraphToLibrary(paragraphData, "linked");
        setBuilderMessage(t("resultSavedToLibrary"), "result success");
    }

    markVisitedMode4();
    await loadPublicParagraphs(paragraphData.paragraphId);
    applyProgressiveDisclosure();
}

async function loadSelectedPublicParagraph() {
    const paragraphId = publicParagraphSelect.value;
    if (!paragraphId) {
        setBuilderMessage(t("resultNeedPublicChoice"), "result warning");
        return;
    }

    const local = publicParagraphCache.get(paragraphId);
    if (local) {
        setActiveParagraph(local, t("resultLoadedPublic"));
        paragraphInput.value = local.text || "";
        shareLinkInput.value = `${window.location.origin}${window.location.pathname}?paragraph=${local.paragraphId}`;
        await saveParagraphToLibrary(local, local.sourceType || "owned");
        markVisitedMode4();
        await loadPublicParagraphs(local.paragraphId);
        applyProgressiveDisclosure();
        return;
    }

    await loadParagraphById(paragraphId, false);
}

function stopRaceListener() {
    if (typeof raceListenerStop === "function") {
        raceListenerStop();
        raceListenerStop = null;
    }
}

function setRaceContext(raceId, isHost) {
    raceState.raceId = raceId || "";
    raceState.isHost = Boolean(isHost);
    raceState.status = raceId ? "waiting" : "idle";
    raceState.startsAt = 0;
}

function updateShareRaceLink(raceId) {
    const raceUrl = `${window.location.origin}${window.location.pathname}?race=${raceId}`;
    shareLinkInput.value = raceUrl;
}

function beginCountdown(startsAt) {
    clearCountdown();

    typingInput.disabled = true;
    showStartGate();

    countdownTimer = setInterval(async () => {
        const remainingMs = startsAt - Date.now();
        const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

        setResultMessage(format(t("resultRaceCountdown"), { seconds: remainingSec }), "result warning");

        if (remainingMs <= 0) {
            clearCountdown();
            if (!timerStarted) {
                setResultMessage(t("resultRaceStarted"), "result success");
                startRoundNow();
            }
            if (raceState.isHost && raceState.raceId) {
                await update(ref(db, `paragraphRaces/${raceState.raceId}`), { status: "running" });
            }
        }
    }, 250);
}

function handleRaceSnapshot(data) {
    const participants = data.participants || {};
    const participantsCount = Object.keys(participants).length;

    raceState.status = data.status || "waiting";
    raceState.startsAt = data.startsAt || 0;

    updateRaceStatusText(participantsCount);

    if (raceState.isHost && raceState.status === "waiting" && participantsCount >= 2 && !data.startsAt) {
        const startsAt = Date.now() + 5000;
        update(ref(db, `paragraphRaces/${raceState.raceId}`), {
            status: "countdown",
            startsAt
        });
        setBuilderMessage(t("resultRaceWaiting"), "result");
        return;
    }

    if (!currentParagraph && data.text) {
        setActiveParagraph({
            paragraphId: data.paragraphId,
            text: data.text,
            ownerUid: data.createdBy
        });
        paragraphInput.value = data.text || "";
    }

    if (raceState.status === "countdown" && raceState.startsAt) {
        beginCountdown(raceState.startsAt);
    } else if (raceState.status !== "countdown") {
        clearCountdown();
    }

    if (raceState.status === "finished") {
        const winner = getRaceWinner(participants);
        if (winner) {
            setResultMessage(format(t("resultRaceWinner"), {
                name: winner.name || "-",
                time: Number(winner.timeTaken || 0).toFixed(3)
            }), "result success");
        }
        return;
    }

    const leader = getRaceWinner(participants);
    if (leader && raceState.status === "running") {
        setBuilderMessage(format(t("resultRaceLeaderNow"), {
            name: leader.name || "-",
            time: Number(leader.timeTaken || 0).toFixed(3)
        }), "result");
    }
}

function listenRace(raceId) {
    stopRaceListener();

    const raceRef = ref(db, `paragraphRaces/${raceId}`);
    raceListenerStop = onValue(raceRef, (snapshot) => {
        if (!snapshot.exists()) {
            setRaceContext("", false);
            updateRaceStatusText();
            return;
        }

        const data = snapshot.val();
        handleRaceSnapshot(data);
    });
}

async function createRace() {
    const user = getCurrentUserPayload();
    if (!user) {
        setBuilderMessage(t("resultNeedLogin"), "result warning");
        return;
    }

    if (!currentParagraph) {
        const trimmed = trimToWordLimit(paragraphInput.value, MAX_WORDS);
        paragraphInput.value = trimmed.text;
        if (!trimmed.text) {
            setBuilderMessage(t("resultNeedParagraph"), "result warning");
            return;
        }

        if (!currentParagraphId) {
            const paragraphRef = push(ref(db, "paragraphs"));
            const paragraphId = paragraphRef.key;
            const paragraphData = {
                paragraphId,
                text: trimmed.text,
                wordCount: countWords(trimmed.text),
                language: currentLanguage,
                isPublic: false,
                ownerUid: user.uid,
                ownerName: user.displayName,
                createdAt: Date.now()
            };
            await set(paragraphRef, paragraphData);
            setActiveParagraph(paragraphData);
            await saveParagraphToLibrary(paragraphData, "owned");
            markVisitedMode4();
        }
    }

    const raceRef = push(ref(db, "paragraphRaces"));
    const raceId = raceRef.key;

    await set(raceRef, {
        raceId,
        paragraphId: currentParagraphId || null,
        text: currentParagraph,
        language: currentLanguage,
        status: "waiting",
        startsAt: 0,
        createdAt: Date.now(),
        createdBy: user.uid,
        createdByName: user.displayName,
        participants: {
            [user.uid]: {
                uid: user.uid,
                name: user.displayName,
                joinedAt: Date.now(),
                finishedAt: null,
                timeTaken: null
            }
        }
    });

    setRaceContext(raceId, true);
    updateShareRaceLink(raceId);
    listenRace(raceId);
    setBuilderMessage(t("resultRaceCreated"), "result success");

    const url = new URL(window.location.href);
    url.searchParams.set("race", raceId);
    history.replaceState({}, "", url.toString());
}

async function joinRaceById(raceId) {
    if (!raceId) return;

    const user = getCurrentUserPayload();
    if (!user) {
        setBuilderMessage(t("resultNeedLogin"), "result warning");
        return;
    }

    const snapshot = await get(ref(db, `paragraphRaces/${raceId}`));
    if (!snapshot.exists()) {
        setBuilderMessage(t("resultNeedParagraph"), "result warning");
        return;
    }

    const data = snapshot.val();
    await update(ref(db, `paragraphRaces/${raceId}/participants/${user.uid}`), {
        uid: user.uid,
        name: user.displayName,
        joinedAt: Date.now(),
        finishedAt: data.participants?.[user.uid]?.finishedAt || null,
        timeTaken: data.participants?.[user.uid]?.timeTaken || null
    });

    setRaceContext(raceId, data.createdBy === user.uid);
    listenRace(raceId);

    setActiveParagraph({
        paragraphId: data.paragraphId,
        text: data.text,
        ownerUid: data.createdBy
    }, t("resultRaceJoined"));

    paragraphInput.value = data.text || "";
    updateParagraphMeta(data.text || "");
    updateShareRaceLink(raceId);

    await saveParagraphToLibrary({
        paragraphId: data.paragraphId,
        text: data.text,
        ownerUid: data.createdBy,
        ownerName: data.createdByName || "",
        language: data.language || currentLanguage,
        createdAt: data.createdAt || Date.now(),
        wordCount: countWords(data.text || "")
    }, "linked");
    markVisitedMode4();
    await loadPublicParagraphs(data.paragraphId || "");
    applyProgressiveDisclosure();
}

function applyTexts() {
    document.title = t("pageTitle");
    gameTitle.textContent = t("gameTitle");
    playerGreeting.textContent = t("greeting");
    if (builderWindowTitle) builderWindowTitle.textContent = t("builderWindowTitle");
    if (createWindowTitle) createWindowTitle.textContent = t("createWindowTitle");
    if (raceWindowTitle) raceWindowTitle.textContent = t("raceWindowTitle");
    if (typingWindowTitle) typingWindowTitle.textContent = t("typingWindowTitle");

    builderHint.textContent = t("builderHint");
    if (myTextsHint) myTextsHint.textContent = t("myTextsHint");
    paragraphInput.placeholder = t("paragraphPlaceholder");
    typingInput.placeholder = t("typingPlaceholder");
    if (sourceLabel) sourceLabel.textContent = t("sourceLabel");
    if (sourceLibraryBtn) sourceLibraryBtn.textContent = t("sourceLibrary");
    if (sourceCreateBtn) sourceCreateBtn.textContent = t("sourceCreate");
    visibilityLabel.textContent = t("visibilityLabel");
    visibilityPublicBtn.textContent = t("visibilityPublic");
    visibilityPrivateBtn.textContent = t("visibilityPrivate");

    document.getElementById("generateParagraphText").textContent = t("generateParagraph");
    document.getElementById("saveParagraphText").textContent = t("saveParagraph");
    document.getElementById("loadPublicText").textContent = t("loadPublic");
    if (toggleCreatePanelText) {
        toggleCreatePanelText.textContent = composeWindow && composeWindow.classList.contains("hidden") ? t("toggleCreateShow") : t("toggleCreateHide");
    }
    document.getElementById("createRaceText").textContent = t("createRace");

    document.getElementById("startBtnText").textContent = t("startRound");
    document.getElementById("gateStartText").textContent = t("gateStart");
    document.getElementById("nextBtnText").textContent = t("retryRound");
    document.getElementById("homeBtnText").textContent = t("home");

    timerLabel.textContent = t("timerLabel");
    timerUnit.textContent = t("timerUnit");

    paragraphLeaderboardTitle.textContent = t("leaderboardTitle");
    shareLinkInput.placeholder = t("shareLinkPlaceholder");
    if (shareGuideText) shareGuideText.textContent = t("shareGuideTip");

    themeLabel.textContent = t("themeLabel");
    colorModeLabel.textContent = t("colorModeLabel");
    langLabel.textContent = t("langLabel");

    const themeMap = [
        [themeOceanBtn, "themeOcean"],
        [themeSunsetBtn, "themeSunset"],
        [themeForestBtn, "themeForest"],
        [themeBerryBtn, "themeBerry"],
        [themeNeonBtn, "themeNeon"],
        [themeVioletBtn, "themeViolet"],
        [themeBrownBtn, "themeBrown"]
    ];
    themeMap.forEach(([btn, key]) => {
        btn.title = t(key);
        btn.setAttribute("aria-label", t(key));
    });

    colorModeDarkBtn.title = t("darkMode");
    colorModeBlurBtn.title = t("blurMode");
    colorModeLightBtn.title = t("lightMode");

    colorModeDarkBtn.setAttribute("aria-label", t("darkMode"));
    colorModeBlurBtn.setAttribute("aria-label", t("blurMode"));
    colorModeLightBtn.setAttribute("aria-label", t("lightMode"));

    langArBtn.textContent = t("langArabic");
    langEnBtn.textContent = t("langEnglish");

    langArBtn.classList.toggle("active", currentLanguage === "ar");
    langEnBtn.classList.toggle("active", currentLanguage === "en");

    const mazenElem = document.getElementById("mazenNameTxt");
    const ahmedElem = document.getElementById("ahmedNameTxt");
    if (mazenElem) mazenElem.textContent = t("mazenNameTxt");
    if (ahmedElem) ahmedElem.textContent = t("ahmedNameTxt");

    const contactLabel = document.getElementById("contactLabel");
    if (contactLabel) contactLabel.textContent = t("contactLabel");
    const versionLabel = document.getElementById("versionLabel");
    if (versionLabel) versionLabel.textContent = t("versionLabel");
    const betaLabel = document.getElementById("betaLabel");
    if (betaLabel) betaLabel.textContent = t("betaLabel");

    updateProgress(typingInput.value);
    if (!currentParagraph) {
        wordBox.textContent = t("paragraphMissing");
    }

    updateRaceStatusText();
    setParagraphVisibility(paragraphVisibility);
    setSourceMode(sourceMode);
    applyProgressiveDisclosure();
    updateParagraphMeta(currentParagraph || paragraphInput.value);
}

function setLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = "rtl";
    applyTexts();
    updateLogo();
    loadPublicParagraphs();
    saveState();
}

function getHomeUrl() {
    return new URL("../index.html", import.meta.url).href;
}

function goHome() {
    saveState();
    window.location.href = getHomeUrl();
}

function ensureParagraphExists() {
    if (currentParagraph) {
        return true;
    }

    const trimmed = trimToWordLimit(paragraphInput.value, MAX_WORDS);
    paragraphInput.value = trimmed.text;

    if (!trimmed.text) {
        setBuilderMessage(t("resultNeedParagraph"), "result warning");
        return false;
    }

    if (trimmed.wasTrimmed) {
        setBuilderMessage(t("resultMaxWords"), "result warning");
    }

    setActiveParagraph({
        paragraphId: "",
        text: trimmed.text,
        ownerUid: ""
    });
    return true;
}

function handleStartRequest() {
    if (!ensureParagraphExists()) {
        return;
    }

    if (raceState.raceId) {
        if (raceState.status === "waiting" || raceState.status === "countdown") {
            setBuilderMessage(t("resultRaceWaiting"), "result");
            return;
        }
    }

    startRoundNow();
}

typingInput.addEventListener("input", () => {
    if (!currentParagraph) return;

    const { typed, target } = getComparisonState();
    updateProgress(typingInput.value);

    if (typed === target) {
        finishRound();
        return;
    }

    if (!target.startsWith(typed)) {
        setResultMessage(t("resultWrong"), "result warning");
        return;
    }

    setResultMessage(t("resultGoodContinue"), "result");
});

paragraphInput.addEventListener("input", () => {
    const trimmed = trimToWordLimit(paragraphInput.value, MAX_WORDS);
    if (trimmed.wasTrimmed) {
        paragraphInput.value = trimmed.text;
        setBuilderMessage(t("resultMaxWords"), "result warning");
    }

    updateParagraphMeta();

    if (!currentParagraphId) {
        currentParagraph = "";
        wordBox.textContent = t("paragraphMissing");
        updateProgress("");
        setResultMessage(t("resultStart"), "result");
    }
});

startBtn.addEventListener("click", handleStartRequest);
gateStartBtn.addEventListener("click", handleStartRequest);

nextBtn.addEventListener("click", () => {
    resetRound();
});

homeBtn.addEventListener("click", goHome);

generateParagraphBtn.addEventListener("click", generateRandomParagraph);
saveParagraphBtn.addEventListener("click", () => saveParagraph(paragraphVisibility === "public"));
visibilityPublicBtn.addEventListener("click", () => setParagraphVisibility("public"));
visibilityPrivateBtn.addEventListener("click", () => setParagraphVisibility("private"));
if (sourceLibraryBtn) sourceLibraryBtn.addEventListener("click", () => setSourceMode("library"));
if (sourceCreateBtn) sourceCreateBtn.addEventListener("click", () => setSourceMode("create"));
if (toggleCreatePanelBtn) {
    toggleCreatePanelBtn.addEventListener("click", () => {
        const willOpen = composeWindow ? composeWindow.classList.contains("hidden") : true;
        setSourceMode(willOpen ? "create" : "library");
        if (willOpen) {
            markVisitedMode4();
            builderHint.textContent = t("builderHintReturning");
        }
    });
}
loadPublicParagraphBtn.addEventListener("click", loadSelectedPublicParagraph);
createRaceBtn.addEventListener("click", createRace);

shareLinkInput.addEventListener("click", async () => {
    if (!shareLinkInput.value) return;
    shareLinkInput.select();
    try {
        await navigator.clipboard.writeText(shareLinkInput.value);
    } catch (_error) {
        // Ignore clipboard errors silently.
    }
});

langArBtn.addEventListener("click", () => setLanguage("ar"));
langEnBtn.addEventListener("click", () => setLanguage("en"));

themeButtons.forEach((btn) => {
    btn.addEventListener("click", () => setTheme(btn.dataset.theme));
});

colorModeButtons.forEach((btn) => {
    btn.addEventListener("click", () => setColorMode(btn.dataset.colorMode));
});

document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;

    if (event.target === paragraphInput || event.target === typingInput) {
        return;
    }

    event.preventDefault();
    handleStartRequest();
});

onAuthStateChanged(auth, async (user) => {
    currentUser = user || null;
    await applyRemotePreferences();

    const params = new URLSearchParams(window.location.search);
    const raceId = params.get("race") || "";
    const paragraphId = params.get("paragraph") || "";
    entryByExternalLink = Boolean(raceId || paragraphId);

    await loadPublicParagraphs();
    applyProgressiveDisclosure();

    if (raceId) {
        await joinRaceById(raceId);
        return;
    }

    if (paragraphId) {
        await loadParagraphById(paragraphId, true);
        return;
    }

    applyProgressiveDisclosure();
});

loadState();
applyTexts();
setLanguage(currentLanguage);
showStartGate();
resetRound();
loadPublicParagraphs();
applyProgressiveDisclosure();
void applyRemotePreferences();

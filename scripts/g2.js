import { loadUserPreferences, saveUserPreferences } from "./firebase-save.js";
import { readTypingGameState, writeTypingGameState } from "./app-state.js";
import { createUiToneShiftRunner, normalizeTypingInput, resolveWordmarkSrc, setupConnectivityBanner } from "./ui-utils.js";

window.TypingGame = (() => {
    const wordsByLanguage = window.DashTypeWordBank || {
        ar: ["برمجة", "تحدي", "مطور", "سرعة"],
        en: ["code", "game", "speed", "logic"]
    };

    const textMap = {
        ar: {
            pageTitle: "DashType - النمط الثلاثي",
            gameTitle: "DashType - النمط الثلاثي",
            greeting: "الثلاثي: اكتب 3 كلمات في محاولة واحدة لرفع الانسيابية والثبات.",
            startRound: "بدء جولة",
            stopRound: "إيقاف الجولة",
            startGate: "بدء الجولة",
            newWord: "كلمة جديدة",
            home: "الصفحة الرئيسية",
            historyQuick: "السجل الشخصي",
            modeIdentityTitle: "النمط الثلاثي",
            modeIdentityHint: "دفعة واحدة لثلاث كلمات",
            typingPlaceholder: "اكتب هنا...",
            timerLabel: "الوقت:",
            timerUnit: "ث",
            progressSingle: "الفردي",
            progressTriple: "الثلاثي (مجموع 14 حرفاً)",
            progressTripleSeq: "المتتابع: الكلمة {index} من 3",
            readyWordBox: "جاهز؟ اضغط بدء",
            endedWordBox: "انتهت الجولة",
            resultStart: "اضغط بدء الجولة لتظهر الكلمات الثلاث",
            gainPoints: "+{points} نقطة",
            gainLevelUpResult: "⭐ مستوى جديد: {level} - أداء رائع! استمر",
            resultStartTyping: "بدأ الوقت!",
            resultGoodContinue: "ممتاز، استمر",
            resultWrong: "يوجد خطأ، حاول التصحيح",
            resultNextWord: "ممتاز، الكلمة التالية",
            resultDoneSingle: "ممتاز! أنهيت الكلمة في {time} ثانية",
            resultDoneTriple: "ممتاز! أنهيت 3 كلمات (14 حرفاً) خلال {time} ثانية",
            resultDoneTripleSeq: "ممتاز! أنهيت 3 كلمات متتالية (14 حرفاً) خلال {time} ثانية",
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
            themeMaroon: "عنابي وأحمر داكن",
            darkMode: "داكن",
            blurMode: "ضبابي",
            lightMode: "فاتح",
            langArabic: "العربية",
            langEnglish: "English",
            mazenNameTxt: "مازن",
            ahmedNameTxt: "أحمد",
            contactLabel: "للتواصل معنا",
            versionLabel: "الإصدار",
            betaLabel: "بيتا"
        },
        en: {
            pageTitle: "DashType - Triple Mode",
            gameTitle: "DashType - Triple Mode",
            greeting: "Triple mode: type 3 connected words in one attempt with steady flow.",
            startRound: "Start Round",
            stopRound: "Stop Round",
            startGate: "Start Round",
            newWord: "New Word",
            home: "Home",
            historyQuick: "Personal history",
            modeIdentityTitle: "Triple Mode",
            modeIdentityHint: "Three words in one burst",
            typingPlaceholder: "Type here...",
            timerLabel: "Time:",
            timerUnit: "s",
            progressSingle: "Single",
            progressTriple: "Triple (Total 14 letters)",
            progressTripleSeq: "Sequential: Word {index} of 3",
            readyWordBox: "Ready? Press start",
            endedWordBox: "Round Ended",
            resultStart: "Press Start Round to show the 3-word challenge",
            gainPoints: "+{points} pts",
            gainLevelUpResult: "⭐ New level: {level} - Great pace, keep it up",
            resultStartTyping: "Timer started!",
            resultGoodContinue: "Great, keep going",
            resultWrong: "There is a mistake, correct it",
            resultNextWord: "Great, next word",
            resultDoneSingle: "Great! You finished the word in {time} seconds",
            resultDoneTriple: "Great! You finished 3 words (14 letters) in {time} seconds",
            resultDoneTripleSeq: "Great! You finished 3 sequential words (14 letters) in {time} seconds",
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
            themeMaroon: "Burgundy & Dark Red",
            darkMode: "Dark",
            blurMode: "Blurred",
            lightMode: "Light",
            langArabic: "Arabic",
            langEnglish: "English",
            mazenNameTxt: "Mazen",
            ahmedNameTxt: "Ahmed",
            contactLabel: "Contact us",
            versionLabel: "Version",
            betaLabel: "Beta"
        }
    };

    function initGamePage(config) {
        const mode = config.mode;
        const tripleTotalLetters = 14;
        const tripleWordCount = 3;

        const wordBox = document.getElementById("wordBox");
        const typingInput = document.getElementById("typingInput");
        const timeValue = document.getElementById("timeValue");
        const resultText = document.getElementById("resultText");
        const startBtn = document.getElementById("startBtn");
        const startBtnText = document.getElementById("startBtnText");
        const gateStartBtn = document.getElementById("gateStartBtn");
        const startGate = document.getElementById("startGate");
        const nextBtn = document.getElementById("nextBtn");
        const homeBtn = document.getElementById("homeBtn");
        
        const historyQuickText = document.getElementById("historyQuickText");
        const historyPointsBadge = document.getElementById("historyPointsBadge");
        const logoHomeLink = document.getElementById("logoHomeLink");
        const progressText = document.getElementById("progressText");
        const playerGreeting = document.getElementById("playerGreeting");
        const gameTitle = document.getElementById("gameTitle");
        const timerLabel = document.getElementById("timerLabel");
        const timerUnit = document.getElementById("timerUnit");
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
        const themeMaroonBtn = document.getElementById("themeMaroonBtn");
        const colorModeDarkBtn = document.getElementById("colorModeDarkBtn");
        const colorModeBlurBtn = document.getElementById("colorModeBlurBtn");
        const colorModeLightBtn = document.getElementById("colorModeLightBtn");

        const themeButtons = [themeOceanBtn, themeSunsetBtn, themeForestBtn, themeBerryBtn, themeNeonBtn, themeVioletBtn, themeBrownBtn, themeMaroonBtn];
        const colorModeButtons = [colorModeDarkBtn, colorModeBlurBtn, colorModeLightBtn];

        let playerName = "لاعب";
        let currentLanguage = "ar";
        let currentWord = "";
        let timerStarted = false;
        let startTime = 0;
        let finalTime = 0;
        let rafId = null;
        let sequentialWords = [];
        let sequentialIndex = 0;
        let lastMistakeAt = 0;
        let roundRejected = false;
        let rejectionReason = "";
        let lastInputTimestamp = 0;
        let previousTypedValue = "";
        let keystrokeIntervals = [];
        let isApplyingRemotePreferences = false;
        setupConnectivityBanner({ resolveLanguage: () => currentLanguage });
        const MAX_ALLOWED_WPM = 250;
        const MIN_INTERVAL_MS = 80;
        const MIN_INTERVAL_SAMPLE_SIZE = 8;
        const FAST_INTERVAL_RATIO_LIMIT = 0.72;
        const runUiToneShift = createUiToneShiftRunner({ durationMs: 460 });
        let pointsToastEl = null;

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

        function saveState() {
            const state = {
                playerName,
                currentLanguage,
                currentTheme: document.documentElement.getAttribute("data-theme") || "ocean",
                currentColorMode: document.documentElement.getAttribute("data-color-mode") || "blur",
                selectedMode: mode
            };
            writeTypingGameState(state);

            if (!isApplyingRemotePreferences) {
                const typingSettings = window.DashTypeTypingSettings && typeof window.DashTypeTypingSettings.get === "function"
                    ? window.DashTypeTypingSettings.get()
                    : null;
                void saveUserPreferences({
                    theme: state.currentTheme,
                    colorMode: state.currentColorMode,
                    language: state.currentLanguage,
                    ...(typingSettings ? { typingSettings } : {})
                });
            }
        }

        function setTheme(theme, options = {}) {
            document.documentElement.setAttribute("data-theme", theme);
            themeButtons.forEach((btn) => {
                btn.classList.toggle("active", btn.dataset.theme === theme);
            });
            if (options.animate !== false) {
                runUiToneShift();
            }
            saveState();
        }

        function setColorMode(colorMode, options = {}) {
            document.documentElement.setAttribute("data-color-mode", colorMode);
            colorModeButtons.forEach((btn) => {
                btn.classList.toggle("active", btn.dataset.colorMode === colorMode);
            });
            if (options.animate !== false) {
                runUiToneShift();
            }
            updateLogo();
            saveState();
        }

        function updateLogo() {
            const logoImg = document.getElementById("logoImg");
            if (!logoImg) return;
            const colorMode = document.documentElement.getAttribute("data-color-mode") || "blur";
            const lang = (document.documentElement.lang || currentLanguage || "ar").toLowerCase();
            logoImg.src = resolveWordmarkSrc(colorMode, lang);
        }

        function loadState() {
            const saved = readTypingGameState();
            if (typeof saved.playerName === "string" && saved.playerName.trim()) {
                playerName = saved.playerName;
            }
            if (saved.currentLanguage === "ar" || saved.currentLanguage === "en") {
                currentLanguage = saved.currentLanguage;
            }
            const theme = typeof saved.currentTheme === "string" ? saved.currentTheme : "ocean";
            const colorMode = typeof saved.currentColorMode === "string" ? saved.currentColorMode : "blur";
            setTheme(theme, { animate: false });
            setColorMode(colorMode, { animate: false });
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

                if (remote.typingSettings && window.DashTypeTypingSettings && typeof window.DashTypeTypingSettings.apply === "function") {
                    window.DashTypeTypingSettings.apply(remote.typingSettings, { skipRemoteSave: true });
                }
            } catch (error) {
                console.warn("Remote preferences sync failed:", error);
            } finally {
                isApplyingRemotePreferences = false;
            }
        }

        function getWords() {
            return wordsByLanguage[currentLanguage];
        }

        function getRandomWord() {
            const words = getWords();
            return words[Math.floor(Math.random() * words.length)];
        }

        function getThreeWordsWithTotalLetters(totalLetters) {
            const words = getWords();
            const attempts = 500;
            for (let i = 0; i < attempts; i += 1) {
                const selected = [getRandomWord(), getRandomWord(), getRandomWord()];
                if (selected.join("").length === totalLetters) {
                    return selected.join(" ");
                }
            }

            for (const w1 of words) {
                for (const w2 of words) {
                    for (const w3 of words) {
                        const selected = [w1, w2, w3];
                        if (selected.join("").length === totalLetters) {
                            return selected.join(" ");
                        }
                    }
                }
            }

            return "--- --- ---";
        }

        function getThreeWordSetWithTotalLetters(totalLetters) {
            const words = getWords();
            const attempts = 500;
            for (let i = 0; i < attempts; i += 1) {
                const selected = [getRandomWord(), getRandomWord(), getRandomWord()];
                if (selected.join("").length === totalLetters) {
                    return selected;
                }
            }

            for (const w1 of words) {
                for (const w2 of words) {
                    for (const w3 of words) {
                        const selected = [w1, w2, w3];
                        if (selected.join("").length === totalLetters) {
                            return selected;
                        }
                    }
                }
            }

            return ["---", "---", "---"];
        }

        function updateTimer() {
            if (!timerStarted) {
                return;
            }
            const elapsed = (performance.now() - startTime) / 1000;
            timeValue.textContent = elapsed.toFixed(3);
            rafId = requestAnimationFrame(updateTimer);
        }

        function stopTimer() {
            timerStarted = false;
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            finalTime = parseFloat(timeValue.textContent);
        }

        function pulseClass(element, className) {
            if (!element) return;
            element.classList.remove(className);
            void element.offsetWidth;
            element.classList.add(className);
            setTimeout(() => element.classList.remove(className), 280);
        }

        function playSuccessFeedback() {
            pulseClass(wordBox, "word-animate-success");
            pulseClass(resultText, "result-animate-success");
        }

        function playFailFeedback() {
            pulseClass(resultText, "result-animate-warning");
        }

        function playRejectFeedback() {
            pulseClass(wordBox, "word-reject");
            pulseClass(resultText, "result-reject");
            pulseClass(typingInput, "typing-reject");
        }

        function getRejectMessage(reason) {
            if (currentLanguage === "en") {
                if (reason === "paste") {
                    return "Round rejected: paste/drop is not allowed";
                }
                if (reason === "automation") {
                    return "Round rejected: non-human input detected";
                }
                return reason === "cadence"
                    ? "Round rejected: sustained keystrokes were too fast"
                    : "Round rejected: speed exceeded allowed threshold";
            }
            if (reason === "paste") {
                return "تم رفض الجولة: اللصق أو السحب غير مسموح";
            }
            if (reason === "automation") {
                return "تم رفض الجولة: تم اكتشاف إدخال غير بشري";
            }
            return reason === "cadence"
                ? "تم رفض الجولة: تسارع مستمر أقل من الحد المسموح"
                : "تم رفض الجولة: السرعة تجاوزت الحد المسموح";
        }

        function handleBlockedDirectInsert() {
            resultText.textContent = currentLanguage === "en"
                ? "Paste and drop are blocked during typing"
                : "تم حظر اللصق والسحب أثناء الكتابة";
            resultText.className = "result warning";
            playRejectFeedback();

            if (timerStarted && !roundRejected) {
                rejectRound("paste");
            }
        }

        function computeWpmFromChars(charCount, secondsElapsed) {
            const safeChars = Math.max(1, Number(charCount) || 1);
            const safeSeconds = Math.max(0.001, Number(secondsElapsed) || 0.001);
            return ((safeChars / 5) / safeSeconds) * 60;
        }

        function getActiveRoundCharCount() {
            return normalizeInput(currentWord).replace(/\s+/g, " ").length;
        }

        function validateRoundIntegrity() {
            const totalChars = getActiveRoundCharCount();
            const roundWpm = computeWpmFromChars(totalChars, finalTime);
            if (totalChars >= 6 && roundWpm > MAX_ALLOWED_WPM) {
                return { valid: false, reason: "wpm" };
            }

            if (keystrokeIntervals.length >= MIN_INTERVAL_SAMPLE_SIZE) {
                const fastCount = keystrokeIntervals.filter((interval) => interval < MIN_INTERVAL_MS).length;
                const fastRatio = fastCount / keystrokeIntervals.length;
                if (fastRatio >= FAST_INTERVAL_RATIO_LIMIT) {
                    return { valid: false, reason: "cadence" };
                }
            }

            return { valid: true, reason: "" };
        }

        function rejectRound(reason) {
            if (roundRejected) {
                return;
            }

            roundRejected = true;
            rejectionReason = reason;
            stopTimer();
            resultText.textContent = getRejectMessage(reason);
            resultText.className = "result warning";
            playFailFeedback();
            playRejectFeedback();
            typingInput.value = "";
            typingInput.blur();
            wordBox.textContent = t("endedWordBox");
            showStartGate();
            setStartButtonPlaying(false);
        }

        function monitorTypingIntegrity(typedValue) {
            if (!timerStarted || roundRejected) {
                previousTypedValue = typedValue;
                return;
            }

            const insertedChars = Math.max(0, typedValue.length - previousTypedValue.length);
            previousTypedValue = typedValue;
            if (insertedChars <= 0) {
                return;
            }

            const now = performance.now();
            if (lastInputTimestamp > 0) {
                const interval = now - lastInputTimestamp;
                if (interval > 0 && interval < 2000) {
                    keystrokeIntervals.push(interval);
                    if (keystrokeIntervals.length > 40) {
                        keystrokeIntervals.shift();
                    }
                }
            }
            lastInputTimestamp = now;

            const elapsedSeconds = Math.max(0.001, (now - startTime) / 1000);
            const activeChars = typedValue.replace(/\s+/g, " ").length;
            const currentWpm = computeWpmFromChars(activeChars, elapsedSeconds);
            if (activeChars >= 12 && currentWpm > MAX_ALLOWED_WPM) {
                rejectRound("wpm");
                return;
            }

            if (keystrokeIntervals.length >= MIN_INTERVAL_SAMPLE_SIZE) {
                const fastCount = keystrokeIntervals.filter((interval) => interval < MIN_INTERVAL_MS).length;
                const fastRatio = fastCount / keystrokeIntervals.length;
                if (fastRatio >= FAST_INTERVAL_RATIO_LIMIT) {
                    rejectRound("cadence");
                }
            }
        }

        function renderProgress() {
            if (mode === "triple") {
                progressText.textContent = t("progressTriple");
                return;
            }
            if (mode === "triple-seq") {
                progressText.textContent = format(t("progressTripleSeq"), { index: sequentialIndex + 1 });
                return;
            }
            progressText.textContent = t("progressSingle");
        }

        function setStartButtonPlaying(isPlaying) {
            if (startBtnText) {
                startBtnText.textContent = isPlaying ? t("stopRound") : t("startRound");
            }
        }

        function resetRoundState() {
            resultText.textContent = t("resultStart");
            resultText.className = "result";
            wordBox.textContent = t("readyWordBox");
            typingInput.value = "";
            timeValue.textContent = "0.000";
            stopTimer();
            sequentialWords = [];
            sequentialIndex = 0;
            roundRejected = false;
            rejectionReason = "";
            lastInputTimestamp = 0;
            previousTypedValue = "";
            keystrokeIntervals = [];
            renderProgress();
            setStartButtonPlaying(false);
        }

        function showStartGate() {
            startGate.classList.remove("hidden");
        }

        function hideStartGate() {
            startGate.classList.add("hidden");
        }

        function startRound() {
            if (mode === "triple") {
                currentWord = getThreeWordsWithTotalLetters(tripleTotalLetters);
            } else if (mode === "triple-seq") {
                sequentialWords = getThreeWordSetWithTotalLetters(tripleTotalLetters);
                sequentialIndex = 0;
                currentWord = sequentialWords[sequentialIndex];
            } else {
                currentWord = getRandomWord();
            }

            wordBox.textContent = currentWord;
            typingInput.value = "";
            timeValue.textContent = "0.000";
            resultText.textContent = t("resultStartTyping");
            resultText.className = "result";
            timerStarted = true;
            startTime = performance.now();
            roundRejected = false;
            rejectionReason = "";
            lastInputTimestamp = 0;
            previousTypedValue = "";
            keystrokeIntervals = [];
            updateTimer();
            renderProgress();
            setStartButtonPlaying(true);
            typingInput.focus();
        }

        function stopRoundManually() {
            if (!timerStarted) {
                return;
            }

            stopTimer();
            resultText.textContent = currentLanguage === "en" ? "Round stopped" : "تم إيقاف الجولة";
            resultText.className = "result warning";
            typingInput.value = "";
            typingInput.blur();
            wordBox.textContent = t("endedWordBox");
            showStartGate();
            setStartButtonPlaying(false);
        }

        function goToNextWordOrFinish() {
            if (mode === "triple-seq" && sequentialIndex < tripleWordCount - 1) {
                sequentialIndex += 1;
                currentWord = sequentialWords[sequentialIndex];
                wordBox.textContent = currentWord;
                typingInput.value = "";
                previousTypedValue = "";
                resultText.textContent = t("resultNextWord");
                resultText.className = "result";
                renderProgress();
                return;
            }

            stopTimer();
            const integrity = validateRoundIntegrity();
            if (!integrity.valid) {
                rejectRound(integrity.reason);
                return;
            }

            if (mode === "triple") {
                resultText.textContent = format(t("resultDoneTriple"), { time: finalTime.toFixed(3) });
            } else if (mode === "triple-seq") {
                resultText.textContent = format(t("resultDoneTripleSeq"), { time: finalTime.toFixed(3) });
            } else {
                resultText.textContent = format(t("resultDoneSingle"), { time: finalTime.toFixed(3) });
            }
            resultText.className = "result success";
            playSuccessFeedback();
            wordBox.textContent = t("endedWordBox");
            typingInput.value = "";
            typingInput.blur();
            setStartButtonPlaying(false);
            
            // Save round data to Firebase if user is logged in
            callSaveRound();
            
            showStartGate();
        }

        function callSaveRound() {
            if (roundRejected || rejectionReason) {
                return;
            }
            let wordToSave = Array.isArray(currentWord) ? currentWord.join(" ") : currentWord;
            if (window.saveRoundDataToFirebase) {
                window.saveRoundDataToFirebase(wordToSave, finalTime, "triple", currentLanguage);
            }
        }

        function applyTexts() {
            document.title = t("pageTitle");
            gameTitle.textContent = t("gameTitle");
            playerGreeting.textContent = format(t("greeting"), { name: playerName });
            document.getElementById("startBtnText").textContent = t("startRound");
            document.getElementById("gateStartText").textContent = t("startGate");
            document.getElementById("nextBtnText").textContent = t("newWord");
            document.getElementById("homeBtnText").textContent = t("home");
            if (historyQuickText) historyQuickText.textContent = t("historyQuick");
            
            const modeIdentityTitle = document.getElementById("modeIdentityTitle");
            const modeIdentityHint = document.getElementById("modeIdentityHint");
            if (modeIdentityTitle) modeIdentityTitle.textContent = t("modeIdentityTitle");
            if (modeIdentityHint) modeIdentityHint.textContent = t("modeIdentityHint");
            typingInput.placeholder = t("typingPlaceholder");
            timerLabel.textContent = t("timerLabel");
            timerUnit.textContent = t("timerUnit");
            themeLabel.textContent = t("themeLabel");
            colorModeLabel.textContent = t("colorModeLabel");
            langLabel.textContent = t("langLabel");
            themeOceanBtn.title = t("themeOcean");
            themeSunsetBtn.title = t("themeSunset");
            themeForestBtn.title = t("themeForest");
            themeBerryBtn.title = t("themeBerry");
            themeNeonBtn.title = t("themeNeon");
            themeVioletBtn.title = t("themeViolet");
            themeBrownBtn.title = t("themeBrown");
            themeMaroonBtn.title = t("themeMaroon");
            themeOceanBtn.setAttribute("aria-label", t("themeOcean"));
            themeSunsetBtn.setAttribute("aria-label", t("themeSunset"));
            themeForestBtn.setAttribute("aria-label", t("themeForest"));
            themeBerryBtn.setAttribute("aria-label", t("themeBerry"));
            themeNeonBtn.setAttribute("aria-label", t("themeNeon"));
            themeVioletBtn.setAttribute("aria-label", t("themeViolet"));
            themeBrownBtn.setAttribute("aria-label", t("themeBrown"));
            themeMaroonBtn.setAttribute("aria-label", t("themeMaroon"));
            colorModeDarkBtn.title = t("darkMode");
            colorModeBlurBtn.title = t("blurMode");
            colorModeLightBtn.title = t("lightMode");
            colorModeDarkBtn.setAttribute("aria-label", t("darkMode"));
            colorModeBlurBtn.setAttribute("aria-label", t("blurMode"));
            colorModeLightBtn.setAttribute("aria-label", t("lightMode"));
            langArBtn.textContent = t("langArabic");
            langEnBtn.textContent = t("langEnglish");

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

            renderProgress();
            setStartButtonPlaying(timerStarted);
            if (
                !timerStarted
                && (!currentWord || wordBox.textContent === t("readyWordBox") || wordBox.textContent === t("endedWordBox"))
            ) {
                resultText.textContent = t("resultStart");
            }
        }

        function setLanguage(lang) {
            currentLanguage = lang;
            document.documentElement.lang = lang;
            document.documentElement.dir = "rtl";
            langArBtn.classList.toggle("active", lang === "ar");
            langEnBtn.classList.toggle("active", lang === "en");
            applyTexts();
            updateLogo();
            resetRoundState();
            showStartGate();
            saveState();
        }

        function getHomeUrl() {
            return new URL("../", import.meta.url).href;
        }

        function goHome() {
            saveState();
            window.location.href = getHomeUrl();
        }

        function getHistoryUrl() {
            return new URL("../history/", import.meta.url).href;
        }

        function goHistory() {
            saveState();
            window.location.href = getHistoryUrl();
        }

        function ensurePointsToast() {
            if (pointsToastEl) {
                return pointsToastEl;
            }
            const target = document.createElement("div");
            target.className = "round-gain-note round-gain-corner-toast";
            target.setAttribute("aria-live", "polite");
            document.body.appendChild(target);
            pointsToastEl = target;
            return pointsToastEl;
        }

        function showHistoryPoints(points) {
            if (!Number.isFinite(points) || points <= 0) {
                return;
            }
            const target = ensurePointsToast();
            target.textContent = `+${Math.round(points)}`;
            target.classList.remove("is-visible", "is-level-up");
            void target.offsetWidth;
            target.classList.add("is-visible");
            setTimeout(() => target.classList.remove("is-visible", "is-level-up"), 2200);
        }

        function showLevelUpResult(levelAfter = 0) {
            const nextLevel = Number(levelAfter || 0);
            if (!Number.isFinite(nextLevel) || nextLevel <= 0) {
                return;
            }
            resultText.textContent = format(t("gainLevelUpResult"), { level: nextLevel });
            resultText.className = "result success";
            playSuccessFeedback();
        }

        function normalizeInput(value) {
            return normalizeTypingInput(value, currentLanguage);
        }

        typingInput.addEventListener("beforeinput", (event) => {
            const inputType = String(event.inputType || "");
            if (inputType === "insertFromPaste" || inputType === "insertFromDrop") {
                event.preventDefault();
                handleBlockedDirectInsert();
            }
        });

        typingInput.addEventListener("paste", (event) => {
            event.preventDefault();
            handleBlockedDirectInsert();
        });

        typingInput.addEventListener("drop", (event) => {
            event.preventDefault();
            handleBlockedDirectInsert();
        });

        typingInput.addEventListener("input", (event) => {
            if (timerStarted && event.isTrusted === false) {
                rejectRound("automation");
                return;
            }

            const typedValue = normalizeInput(typingInput.value);
            const targetValue = normalizeInput(currentWord);
            monitorTypingIntegrity(typedValue);

            if (roundRejected) {
                return;
            }

            if (typedValue === targetValue) {
                goToNextWordOrFinish();
                return;
            }

            if (!targetValue.startsWith(typedValue)) {
                resultText.textContent = t("resultWrong");
                resultText.className = "result warning";
                playRejectFeedback();
                const now = Date.now();
                if (now - lastMistakeAt > 900) {
                    lastMistakeAt = now;
                    window.recordTypingMiss?.(currentWord, "triple", currentLanguage);
                }
                return;
            }

            resultText.textContent = t("resultGoodContinue");
            resultText.className = "result";
        });

        startBtn.addEventListener("click", () => {
            if (timerStarted) {
                stopRoundManually();
                return;
            }
            hideStartGate();
            startRound();
        });

        gateStartBtn.addEventListener("click", () => {
            hideStartGate();
            startRound();
        });

        nextBtn.addEventListener("click", () => {
            hideStartGate();
            startRound();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                if (startGate.classList.contains("hidden")) {
                    startRound();
                } else {
                    hideStartGate();
                    startRound();
                }
            }
        });

        homeBtn.addEventListener("click", goHome);
        
        if (logoHomeLink) {
            logoHomeLink.href = getHomeUrl();
            logoHomeLink.addEventListener("click", (event) => {
                event.preventDefault();
                goHome();
            });
        }

        window.addEventListener("dashType:round-save", (event) => {
            const detail = event.detail || {};
            if (!detail.success || detail.cached || detail.rejected) {
                return;
            }
            showHistoryPoints(Number(detail.points || 0));
            const levelBefore = Number(detail.levelBefore || 0);
            const levelAfter = Number(detail.levelAfter || detail.level || 0);
            const leveledUp = Boolean(detail.leveledUp) || (levelAfter > levelBefore);
            if (leveledUp) {
                showLevelUpResult(levelAfter);
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

        window.addEventListener("dashType:typing-settings-changed", (event) => {
            if (isApplyingRemotePreferences) {
                return;
            }
            const nextSettings = event.detail && typeof event.detail === "object" ? event.detail : null;
            if (!nextSettings) {
                return;
            }
            void saveUserPreferences({ typingSettings: nextSettings });
        });

        isApplyingRemotePreferences = true;
        loadState();
        setLanguage(currentLanguage);
        isApplyingRemotePreferences = false;
        showStartGate();
        void applyRemotePreferences();
    }

    return {
        initGamePage
    };
})();

window.TypingGame.initGamePage({ mode: "triple" });

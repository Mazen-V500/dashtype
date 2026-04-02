import { loadUserPreferences, saveUserPreferences } from "./firebase-save.js";

window.TypingGame = (() => {
    const wordsByLanguage = window.DashTypeWordBank || {
        ar: ["برمجة", "تحدي", "مطور", "سرعة"],
        en: ["code", "game", "speed", "logic"]
    };

    const textMap = {
        ar: {
            pageTitle: "DashType - النمط الفردي",
            gameTitle: "DashType - النمط الفردي",
            greeting: "الفردي: اكتب كلمة واحدة كما تظهر، وركّز على الدقة قبل السرعة.",
            startRound: "بدء جولة",
            startGate: "بدء الجولة",
            newWord: "كلمة جديدة",
            home: "الصفحة الرئيسية",
            typingPlaceholder: "اكتب هنا...",
            timerLabel: "الوقت:",
            timerUnit: "ث",
            progressSingle: "النمط الحالي: الفردي",
            progressTriple: "النمط الحالي: الثلاثي (مجموع 14 حرفاً)",
            progressTripleSeq: "المتتابع: الكلمة {index} من 3",
            readyWordBox: "جاهز؟ اضغط بدء",
            endedWordBox: "انتهت الجولة",
            resultStart: "اضغط بدء الجولة لتظهر الكلمة الأولى",
            resultStartTyping: "بدأ الوقت!",
            resultGoodContinue: "ممتاز، استمر",
            resultWrong: "يوجد خطأ، حاول التصحيح",
            resultNextWord: "ممتاز، الكلمة التالية",
            resultDoneSingle: "ممتاز! أنهيت الكلمة خلال {time} ثانية",
            resultDoneTriple: "ممتاز! أنهيت 3 كلمات (14 حرفاً) خلال {time} ثانية",
            resultDoneTripleSeq: "ممتاز! أنهيت 3 كلمات متتالية (14 حرفاً) خلال {time} ثانية",
            themeLabel: "المظهر",
            colorModeLabel: "الوضع",
            langLabel: "اللغة",
            historyBtn: "السجل",
            welcomePrefix: "مرحباً",
            modeSingle: "الفردي",
            modeTriple: "الثلاثي",
            modeTripleSeq: "المتتابع",
            themeDefault: "افتراضي",
            themeOcean: "أزرق وبرتقالي",
            themeSunset: "وردي وأصفر",
            themeForest: "أخضر وأزرق",
            themeBerry: "بنفسجي ووردي",
            themeNeon: "أخضر وأصفر",
            themeViolet: "بنفسجي ووردي",
               themeBrown: "بني",
            modeLight: "فاتح",
            modeDark: "داكن",
            blurMode: "ضبابي",
            langArabic: "العربية",
            langEnglish: "English",
            mazenNameTxt: "مازن",
            ahmedNameTxt: "أحمد",
            contactLabel: "للتواصل معنا",
            versionLabel: "الإصدار",
            betaLabel: "بيتا"
        },
        en: {
            pageTitle: "DashType - Single Mode",
            gameTitle: "DashType - Single Mode",
            greeting: "Single mode: type one shown word exactly, then improve your time.",
            startRound: "Start Round",
            startGate: "Start Round",
            newWord: "New Word",
            home: "Home",
            typingPlaceholder: "Type here...",
            timerLabel: "Time:",
            timerUnit: "s",
            progressSingle: "Current Mode: Single",
            progressTriple: "Current Mode: Triple (Total 14 letters)",
            progressTripleSeq: "Sequential: Word {index} of 3",
            readyWordBox: "Ready? Press Start",
            endedWordBox: "Round Ended",
            resultStart: "Press Start Round to show the first word",
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
            historyBtn: "History",
            welcomePrefix: "Welcome",
            modeSingle: "Single",
            modeTriple: "Triple",
            modeTripleSeq: "Sequential",
            themeDefault: "Default",
            themeOcean: "Blue & Orange",
            themeSunset: "Pink & Yellow",
            themeForest: "Green & Blue",
            themeBerry: "Purple & Pink",
            themeNeon: "Green & Yellow",
            themeViolet: "Purple & Pink",
               themeBrown: "Brown",
            modeLight: "Light",
            modeDark: "Dark",
            blurMode: "Blurred",
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
        const gateStartBtn = document.getElementById("gateStartBtn");
        const startGate = document.getElementById("startGate");
        const nextBtn = document.getElementById("nextBtn");
        const homeBtn = document.getElementById("homeBtn");
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
        const colorModeDarkBtn = document.getElementById("colorModeDarkBtn");
        const colorModeBlurBtn = document.getElementById("colorModeBlurBtn");
        const colorModeLightBtn = document.getElementById("colorModeLightBtn");

        const themeButtons = [
            themeOceanBtn,
            themeSunsetBtn,
            themeForestBtn,
            themeBerryBtn,
            themeNeonBtn,
            themeVioletBtn,
            themeBrownBtn
        ];
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
        let isApplyingRemotePreferences = false;

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
            const logoSrc = colorMode === "light"
                ? (isArabic ? "photo/dashtype%20black%20Wordmark%20ar.png" : "photo/dashtype%20black%20Wordmark.png")
                : (isArabic ? "photo/dashtype%20White%20Wordmark%20ar.png" : "photo/dashtype%20white%20Wordmark.png");
            logoImg.src = logoSrc;
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
                const theme = typeof saved.currentTheme === "string" ? saved.currentTheme : "ocean";
                const colorMode = typeof saved.currentColorMode === "string" ? saved.currentColorMode : "blur";
                setTheme(theme);
                setColorMode(colorMode);
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

        function resetRoundState() {
            resultText.textContent = t("resultStart");
            resultText.className = "result";
            wordBox.textContent = t("readyWordBox");
            typingInput.value = "";
            timeValue.textContent = "0.000";
            stopTimer();
            sequentialWords = [];
            sequentialIndex = 0;
            renderProgress();
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
            updateTimer();
            renderProgress();
            typingInput.focus();
        }

        function goToNextWordOrFinish() {
            if (mode === "triple-seq" && sequentialIndex < tripleWordCount - 1) {
                sequentialIndex += 1;
                currentWord = sequentialWords[sequentialIndex];
                wordBox.textContent = currentWord;
                typingInput.value = "";
                resultText.textContent = t("resultNextWord");
                resultText.className = "result";
                renderProgress();
                return;
            }

            stopTimer();
            if (mode === "triple") {
                resultText.textContent = format(t("resultDoneTriple"), { time: finalTime.toFixed(3) });
            } else if (mode === "triple-seq") {
                resultText.textContent = format(t("resultDoneTripleSeq"), { time: finalTime.toFixed(3) });
            } else {
                resultText.textContent = format(t("resultDoneSingle"), { time: finalTime.toFixed(3) });
            }
            resultText.className = "result success";
            wordBox.textContent = t("endedWordBox");
            typingInput.value = "";
            typingInput.blur();
            
            // Save round data to Firebase if user is logged in
            callSaveRound();
            
            showStartGate();
        }

        function callSaveRound() {
            if (window.saveRoundDataToFirebase) {
                window.saveRoundDataToFirebase(currentWord, finalTime, "single", currentLanguage);
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
            themeOceanBtn.setAttribute("aria-label", t("themeOcean"));
            themeSunsetBtn.setAttribute("aria-label", t("themeSunset"));
            themeForestBtn.setAttribute("aria-label", t("themeForest"));
            themeBerryBtn.setAttribute("aria-label", t("themeBerry"));
            themeNeonBtn.setAttribute("aria-label", t("themeNeon"));
            themeVioletBtn.setAttribute("aria-label", t("themeViolet"));
               themeBrownBtn.setAttribute("aria-label", t("themeBrown"));
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
            return new URL("../index.html", import.meta.url).href;
        }

        function goHome() {
            saveState();
            window.location.href = getHomeUrl();
        }

        function normalizeInput(value) {
            if (currentLanguage === "en") {
                return value.toLowerCase();
            }
            return value;
        }

        typingInput.addEventListener("input", () => {
            const typedValue = normalizeInput(typingInput.value);
            const targetValue = normalizeInput(currentWord);

            if (typedValue === targetValue) {
                goToNextWordOrFinish();
                return;
            }

            if (!targetValue.startsWith(typedValue)) {
                resultText.textContent = t("resultWrong");
                resultText.className = "result warning";
                return;
            }

            resultText.textContent = t("resultGoodContinue");
            resultText.className = "result";
        });

        startBtn.addEventListener("click", () => {
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

        langArBtn.addEventListener("click", () => setLanguage("ar"));
        langEnBtn.addEventListener("click", () => setLanguage("en"));

        themeButtons.forEach((btn) => {
            btn.addEventListener("click", () => setTheme(btn.dataset.theme));
        });

        colorModeButtons.forEach((btn) => {
            btn.addEventListener("click", () => setColorMode(btn.dataset.colorMode));
        });

        loadState();
        setLanguage(currentLanguage);
        showStartGate();
        void applyRemotePreferences();
    }

    return {
        initGamePage
    };
})();

window.TypingGame.initGamePage({ mode: "single" });

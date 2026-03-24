window.TypingGame = (() => {
    const wordsByLanguage = {
        ar: ["برمجة", "تحدي", "مطور", "سرعة", "متصفح", "انجاز", "مستقبل", "واجهة", "ابداع", "تقنية"],
        en: ["code", "game", "speed", "logic", "play", "input", "timer", "fast", "skill", "debug"]
    };

    const textMap = {
        ar: {
            pageTitle: "DashType - نمط كلمة واحدة",
            gameTitle: "DashType - نمط كلمة واحدة",
            greeting: "مرحباً {name}! استعد للتحدي.",
            startRound: "بدء جولة",
            startGate: "بدء الجولة",
            newWord: "كلمة جديدة",
            home: "الصفحة الرئيسية",
            typingPlaceholder: "اكتب هنا...",
            timerLabel: "الوقت:",
            timerUnit: "ث",
            progressSingle: "النمط الحالي: كلمة واحدة",
            progressTriple: "النمط الحالي: 3 كلمات (مجموع 14 حرفاً)",
            progressTripleSeq: "الكلمة {index} من 3 (المجموع 14 حرفاً)",
            readyWordBox: "جاهز؟ اضغط بدء",
            endedWordBox: "انتهت الجولة",
            resultStart: "ابدأ الجولة الآن",
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
            darkMode: "داكن",
            blurMode: "ضبابي",
            lightMode: "فاتح",
            langArabic: "العربية",
            langEnglish: "English"
        },
        en: {
            pageTitle: "DashType - Single Word Challenge",
            gameTitle: "DashType - Single Word",
            greeting: "Welcome, {name}! Get ready.",
            startRound: "Start Round",
            startGate: "Start Round",
            newWord: "New Word",
            home: "Home",
            typingPlaceholder: "Type here...",
            timerLabel: "Time:",
            timerUnit: "s",
            progressSingle: "Current Mode: Single Word",
            progressTriple: "Current Mode: 3 Words (Total 14 letters)",
            progressTripleSeq: "Word {index} of 3 (Total 14 letters)",
            readyWordBox: "Ready? Press start",
            endedWordBox: "Round Ended",
            resultStart: "Start a round now",
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
            darkMode: "Dark",
            blurMode: "Blurred",
            lightMode: "Light",
            langArabic: "Arabic",
            langEnglish: "English"
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
        const colorModeDarkBtn = document.getElementById("colorModeDarkBtn");
        const colorModeBlurBtn = document.getElementById("colorModeBlurBtn");
        const colorModeLightBtn = document.getElementById("colorModeLightBtn");

        const themeButtons = [themeOceanBtn, themeSunsetBtn, themeForestBtn, themeBerryBtn];
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
            const logoSrc = colorMode === "light" ? "photo/dashtype%20black%20logo.png" : "photo/dashtype%20white%20logo.png";
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
            showStartGate();
        }

        function applyTexts() {
            document.title = t("pageTitle");
            gameTitle.textContent = t("gameTitle");
            playerGreeting.textContent = format(t("greeting"), { name: playerName });
            startBtn.textContent = t("startRound");
            gateStartBtn.textContent = t("startGate");
            nextBtn.textContent = t("newWord");
            homeBtn.textContent = t("home");
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
            themeOceanBtn.setAttribute("aria-label", t("themeOcean"));
            themeSunsetBtn.setAttribute("aria-label", t("themeSunset"));
            themeForestBtn.setAttribute("aria-label", t("themeForest"));
            themeBerryBtn.setAttribute("aria-label", t("themeBerry"));
            colorModeDarkBtn.title = t("darkMode");
            colorModeBlurBtn.title = t("blurMode");
            colorModeLightBtn.title = t("lightMode");
            colorModeDarkBtn.setAttribute("aria-label", t("darkMode"));
            colorModeBlurBtn.setAttribute("aria-label", t("blurMode"));
            colorModeLightBtn.setAttribute("aria-label", t("lightMode"));
            langArBtn.textContent = t("langArabic");
            langEnBtn.textContent = t("langEnglish");
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
            document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
            langArBtn.classList.toggle("active", lang === "ar");
            langEnBtn.classList.toggle("active", lang === "en");
            applyTexts();
            resetRoundState();
            showStartGate();
            saveState();
        }

        function goHome() {
            saveState();
            window.location.href = "index.html";
        }

        typingInput.addEventListener("input", () => {
            if (typingInput.value === currentWord) {
                goToNextWordOrFinish();
                return;
            }

            if (!currentWord.startsWith(typingInput.value)) {
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
    }

    return {
        initGamePage
    };
})();

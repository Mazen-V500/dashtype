const textMap = {
	ar: {
		pageTitle: "DashType - اختبر سرعتك",
		welcomeTitle: "انطلق نحو الاحتراف في كتابتك!",
		welcomeSubtitle: "حدد النمط المفضل لديك ثم ابدأ",
		nameLabel: "اسم اللاعب",
		nameNote: "اكتب اسمك ثم اختر النمط المناسب",
		modeTitleWelcome: "ما هو النمط الذي ستبدأ به؟",
		namePlaceholder: "اكتب اسمك هنا",
		modeSingle: "نمط كلمة واحدة",
		modeTriple: "نمط 3 كلمات",
		modeTripleSeq: "نمط 7 كلمات متتالية",
		historyText: "السجل الشخصي",
		globalLeaderboardText: "السجل العالمي",
		enterGame: "ابدأ التحدي",
		themeLabel: "المظهر",
		colorModeLabel: "الوضع",
		langLabel: "اللغة",
		themeOcean: "أزرق وبرتقالي",
		themeSunset: "وردي وأصفر",
		themeForest: "أخضر وأزرق",
		themeBerry: "بنفسجي ووردي",
		themeBrown: "بني",
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
		pageTitle: "DashType - Test Your Speed",
		welcomeTitle: "Start Your DashType Journey!",
		welcomeSubtitle: "Select your preferred mode and start typing",
		nameLabel: "Player Name",
		nameNote: "Type your name, then select your preferred mode",
		modeTitleWelcome: "Which mode will you play?",
		namePlaceholder: "Type your name here",
		modeSingle: "Single Word Mode",
		modeTriple: "3 Words Mode",
		modeTripleSeq: "Sequential 7 Words Mode",
		historyText: "Round History",
		globalLeaderboardText: "Global Leaderboard",
		enterGame: "Start Challenge",
		themeLabel: "Theme",
		colorModeLabel: "Mode",
		langLabel: "Language",
		themeOcean: "Blue & Orange",
		themeSunset: "Pink & Yellow",
		themeForest: "Green & Blue",
		themeBerry: "Purple & Pink",
		themeBrown: "Brown",
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

const modePages = {
	single: "G1.html",
	triple: "G2.html",
	"triple-seq": "G3.html"
};

const welcomeSingleModeBtn = document.getElementById("welcomeSingleModeBtn");
const welcomeTripleModeBtn = document.getElementById("welcomeTripleModeBtn");
const welcomeTripleSeqModeBtn = document.getElementById("welcomeTripleSeqModeBtn");
const enterGameBtn = document.getElementById("enterGameBtn");
const playerNameInput = document.getElementById("playerNameInput");
const welcomeTitle = document.getElementById("welcomeTitle");
const welcomeSubtitle = document.getElementById("welcomeSubtitle");
const nameLabel = document.getElementById("nameLabel");
const nameNote = document.getElementById("nameNote");
const modeTitleWelcome = document.getElementById("modeTitleWelcome");
const themeLabel = document.getElementById("themeLabel");
const colorModeLabel = document.getElementById("colorModeLabel");
const langLabel = document.getElementById("langLabel");
const langArBtn = document.getElementById("langArBtn");
const langEnBtn = document.getElementById("langEnBtn");
const themeOceanBtn = document.getElementById("themeOceanBtn");
const themeSunsetBtn = document.getElementById("themeSunsetBtn");
const themeForestBtn = document.getElementById("themeForestBtn");
const themeBerryBtn = document.getElementById("themeBerryBtn");
const themeBrownBtn = document.getElementById("themeBrownBtn");
const colorModeDarkBtn = document.getElementById("colorModeDarkBtn");
const colorModeBlurBtn = document.getElementById("colorModeBlurBtn");
const colorModeLightBtn = document.getElementById("colorModeLightBtn");

const themeButtons = [themeOceanBtn, themeSunsetBtn, themeForestBtn, themeBerryBtn, themeBrownBtn];
const colorModeButtons = [colorModeDarkBtn, colorModeBlurBtn, colorModeLightBtn];

let currentLanguage = "ar";
let currentTheme = "ocean";
let currentColorMode = "blur";
let selectedMode = "single";

function t(key) {
	return textMap[currentLanguage][key];
}

function setMode(mode) {
	selectedMode = mode;
	welcomeSingleModeBtn.classList.toggle("active", mode === "single");
	welcomeTripleModeBtn.classList.toggle("active", mode === "triple");
	welcomeTripleSeqModeBtn.classList.toggle("active", mode === "triple-seq");
}

function setTheme(theme) {
	currentTheme = theme;
	document.documentElement.setAttribute("data-theme", theme);
	themeButtons.forEach((btn) => {
		btn.classList.toggle("active", btn.dataset.theme === theme);
	});
}

function setColorMode(colorMode) {
	currentColorMode = colorMode;
	document.documentElement.setAttribute("data-color-mode", colorMode);
	colorModeButtons.forEach((btn) => {
		btn.classList.toggle("active", btn.dataset.colorMode === colorMode);
	});
	updateLogo();
}

function updateLogo() {
	const logoImg = document.getElementById("logoImg");
	if (!logoImg) return;
	const logoSrc = currentColorMode === "light" ? "photo/dashtype%20black%20logo.png" : "photo/dashtype%20white%20logo.png";
	logoImg.src = logoSrc;
}

function applyTexts() {
	document.title = t("pageTitle");
	welcomeTitle.textContent = t("welcomeTitle");
	welcomeSubtitle.textContent = t("welcomeSubtitle");
	nameLabel.textContent = t("nameLabel");
	nameNote.textContent = t("nameNote");
	modeTitleWelcome.textContent = t("modeTitleWelcome");
	playerNameInput.placeholder = t("namePlaceholder");
	welcomeSingleModeBtn.textContent = t("modeSingle");
	welcomeTripleModeBtn.textContent = t("modeTriple");
	welcomeTripleSeqModeBtn.textContent = t("modeTripleSeq");
	if (enterGameBtn) enterGameBtn.textContent = t("enterGame");
	
	const historyTxtSpan = document.getElementById("historyText");
	if (historyTxtSpan) historyTxtSpan.textContent = t("historyText");
	
	const globalLeaderboardTxtSpan = document.getElementById("globalLeaderboardText");
	if (globalLeaderboardTxtSpan) globalLeaderboardTxtSpan.textContent = t("globalLeaderboardText");

	themeLabel.textContent = t("themeLabel");
	colorModeLabel.textContent = t("colorModeLabel");
	langLabel.textContent = t("langLabel");
	themeOceanBtn.title = t("themeOcean");
	themeSunsetBtn.title = t("themeSunset");
	themeForestBtn.title = t("themeForest");
	themeBerryBtn.title = t("themeBerry");
	themeBrownBtn.title = t("themeBrown");
	themeOceanBtn.setAttribute("aria-label", t("themeOcean"));
	themeSunsetBtn.setAttribute("aria-label", t("themeSunset"));
	themeForestBtn.setAttribute("aria-label", t("themeForest"));
	themeBerryBtn.setAttribute("aria-label", t("themeBerry"));
	themeBrownBtn.setAttribute("aria-label", t("themeBrown"));
	colorModeDarkBtn.title = t("darkMode");
	colorModeBlurBtn.title = t("blurMode");
	colorModeLightBtn.title = t("lightMode");
	colorModeDarkBtn.setAttribute("aria-label", t("darkMode"));
	colorModeBlurBtn.setAttribute("aria-label", t("blurMode"));
	colorModeLightBtn.setAttribute("aria-label", t("lightMode"));
	langArBtn.textContent = t("langArabic");
	langEnBtn.textContent = t("langEnglish");

	const mazenTxt = document.getElementById("mazenNameTxt");
	if (mazenTxt) mazenTxt.textContent = t("mazenNameTxt");
	const ahmedTxt = document.getElementById("ahmedNameTxt");
	if (ahmedTxt) ahmedTxt.textContent = t("ahmedNameTxt");
	const contactLabel = document.getElementById("contactLabel");
	if (contactLabel) contactLabel.textContent = t("contactLabel");
	const versionLabel = document.getElementById("versionLabel");
	if (versionLabel) versionLabel.textContent = t("versionLabel");
	const betaLabel = document.getElementById("betaLabel");
	if (betaLabel) betaLabel.textContent = t("betaLabel");
}

function setLanguage(lang) {
	currentLanguage = lang;
	document.documentElement.lang = lang;
	document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
	langArBtn.classList.toggle("active", lang === "ar");
	langEnBtn.classList.toggle("active", lang === "en");
	applyTexts();
}

function saveState(playerName) {
	const state = {
		playerName,
		currentLanguage,
		currentTheme,
		currentColorMode,
		selectedMode
	};
	localStorage.setItem("typingGameState", JSON.stringify(state));
}

function enterGame() {
	const fallbackName = currentLanguage === "ar" ? "لاعب" : "Player";
	const playerName = playerNameInput.value.trim() || fallbackName;
	saveState(playerName);
	const nextPage = modePages[selectedMode] || modePages.single;
	window.location.href = nextPage;
}

function restoreState() {
	try {
		const saved = JSON.parse(localStorage.getItem("typingGameState") || "{}");
		if (saved.currentLanguage === "ar" || saved.currentLanguage === "en") {
			currentLanguage = saved.currentLanguage;
		}
		if (typeof saved.currentTheme === "string") {
			currentTheme = saved.currentTheme;
		}
		if (typeof saved.currentColorMode === "string") {
			currentColorMode = saved.currentColorMode;
		}
		if (saved.selectedMode === "single" || saved.selectedMode === "triple" || saved.selectedMode === "triple-seq") {
			selectedMode = saved.selectedMode;
		}
		if (typeof saved.playerName === "string") {
			playerNameInput.value = saved.playerName;
		}
	} catch (_error) {
		// Ignore invalid storage and continue with defaults.
	}
}

enterGameBtn.addEventListener("click", enterGame);
welcomeSingleModeBtn.addEventListener("click", () => setMode("single"));
welcomeTripleModeBtn.addEventListener("click", () => setMode("triple"));
welcomeTripleSeqModeBtn.addEventListener("click", () => setMode("triple-seq"));

playerNameInput.addEventListener("keydown", (event) => {
	if (event.key === "Enter") {
		enterGame();
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

restoreState();
setTheme(currentTheme);
setColorMode(currentColorMode);
setLanguage(currentLanguage);
setMode(selectedMode);
updateLogo();

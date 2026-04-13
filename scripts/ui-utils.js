export function createUiToneShiftRunner(options = {}) {
    const className = typeof options.className === "string" ? options.className : "ui-tone-shift";
    const durationMs = Number.isFinite(options.durationMs) ? options.durationMs : 460;
    const resolveTarget = typeof options.resolveTarget === "function"
        ? options.resolveTarget
        : () => document.body;

    let toneShiftTimer = 0;

    return function runUiToneShift() {
        const target = resolveTarget();
        if (!target) {
            return;
        }

        target.classList.remove(className);
        void target.offsetWidth;
        target.classList.add(className);

        if (toneShiftTimer) {
            clearTimeout(toneShiftTimer);
        }

        toneShiftTimer = window.setTimeout(() => {
            target.classList.remove(className);
            toneShiftTimer = 0;
        }, durationMs);
    };
}

export function normalizeTypingInput(value, language = "ar") {
    const compact = String(value ?? "").replace(/\s+/g, " ").trim();
    if ((language || "ar") === "en") {
        return compact.toLowerCase().normalize("NFC");
    }

    return compact
        .normalize("NFD")
        .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
        .replace(/\u0640/g, "")
        .normalize("NFC");
}

export function resolveWordmarkSrc(colorMode = "blur", language = "ar") {
    const lang = String(language || "ar").toLowerCase();
    const isArabic = lang === "ar";

    if (colorMode === "light") {
        return isArabic
            ? "photo/dashtype%20black%20Wordmark%20ar.png"
            : "photo/dashtype%20black%20Wordmark.png";
    }

    return isArabic
        ? "photo/dashtype%20White%20Wordmark%20ar.png"
        : "photo/dashtype%20white%20Wordmark.png";
}

export function setupConnectivityBanner(options = {}) {
    if (typeof window === "undefined" || typeof document === "undefined") {
        return null;
    }

    if (window.__dashConnectivityBanner) {
        return window.__dashConnectivityBanner;
    }

    const resolveLanguage = typeof options.resolveLanguage === "function"
        ? options.resolveLanguage
        : () => ((document.documentElement.lang || "ar").toLowerCase() === "en" ? "en" : "ar");

    const resolveMessages = () => {
        const lang = resolveLanguage();
        if (lang === "en") {
            return {
                offline: "No internet connection",
                online: "Back online"
            };
        }
        return {
            offline: "لا يوجد اتصال بالإنترنت",
            online: "تمت استعادة الاتصال"
        };
    };

    const banner = document.createElement("div");
    banner.className = "connectivity-toast";
    banner.setAttribute("aria-live", "polite");
    document.body.appendChild(banner);

    let hideTimer = 0;

    const show = (type, message, autoHideMs = 0) => {
        banner.textContent = message;
        banner.classList.remove("online", "offline", "show");
        banner.classList.add(type);
        void banner.offsetWidth;
        banner.classList.add("show");

        if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = 0;
        }

        if (autoHideMs > 0) {
            hideTimer = window.setTimeout(() => {
                banner.classList.remove("show", "online", "offline");
                hideTimer = 0;
            }, autoHideMs);
        }
    };

    const onOffline = () => {
        const messages = resolveMessages();
        show("offline", messages.offline, 0);
    };

    const onOnline = () => {
        const messages = resolveMessages();
        show("online", messages.online, 2200);
    };

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);

    if (!navigator.onLine) {
        onOffline();
    }

    const api = {
        element: banner,
        showOffline: onOffline,
        showOnline: onOnline
    };

    window.__dashConnectivityBanner = api;
    return api;
}

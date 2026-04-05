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

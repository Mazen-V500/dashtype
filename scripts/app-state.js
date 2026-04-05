export function readTypingGameState() {
    try {
        const parsed = JSON.parse(localStorage.getItem("typingGameState") || "{}");
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_error) {
        return {};
    }
}

export function writeTypingGameState(nextState) {
    try {
        const safeState = nextState && typeof nextState === "object" ? nextState : {};
        localStorage.setItem("typingGameState", JSON.stringify(safeState));
        return true;
    } catch (_error) {
        return false;
    }
}

export function patchTypingGameState(updates) {
    const current = readTypingGameState();
    const safeUpdates = updates && typeof updates === "object" ? updates : {};
    const next = { ...current, ...safeUpdates };
    writeTypingGameState(next);
    return next;
}

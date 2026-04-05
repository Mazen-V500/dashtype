export function isLocalPreviewContext() {
    const host = window.location.hostname || "";
    return window.location.protocol === "file:" || host === "localhost" || host === "127.0.0.1" || host === "::1";
}

export function isGitHubPagesContext() {
    const host = (window.location.hostname || "").toLowerCase();
    return host.endsWith("github.io");
}

export function getGitHubPagesBasePath() {
    const segments = (window.location.pathname || "/").split("/").filter(Boolean);
    if (!segments.length || segments[0].includes(".")) {
        return "/";
    }
    return `/${segments[0]}/`;
}

export function resolveRuntimeRoute(routePath = "", options = {}) {
    const cleanPath = String(routePath || "").replace(/^\/+/, "");
    const localPrefix = typeof options.localPrefix === "string" ? options.localPrefix : "./";

    if (isGitHubPagesContext()) {
        return `${getGitHubPagesBasePath()}${cleanPath}`;
    }

    if (isLocalPreviewContext()) {
        return `${localPrefix}${cleanPath}`;
    }

    return `/${cleanPath}`;
}

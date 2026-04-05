(function registerPwa() {
  const LOADER_ID = "dtPageLoaderHint";
  const LOADER_STYLE_ID = "dtPageLoaderHintStyle";

  function getPageLoadText() {
    const lang = (document.documentElement.lang || "ar").toLowerCase();
    return lang === "en" ? "Loading..." : "جاري التحميل...";
  }

  function ensureLoaderStyle() {
    if (document.getElementById(LOADER_STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = LOADER_STYLE_ID;
    style.textContent = [
      `#${LOADER_ID} {`,
      "  position: fixed;",
      "  top: 12px;",
      "  inset-inline-end: 14px;",
      "  z-index: 9998;",
      "  display: inline-flex;",
      "  align-items: center;",
      "  gap: 7px;",
      "  padding: 6px 10px;",
      "  border-radius: 999px;",
      "  border: 1px solid rgba(255, 255, 255, 0.24);",
      "  background: rgba(0, 0, 0, 0.34);",
      "  color: #f7fbff;",
      "  font-size: 11px;",
      "  font-weight: 700;",
      "  opacity: 0;",
      "  transform: translateY(-4px);",
      "  transition: opacity .18s ease, transform .18s ease;",
      "  pointer-events: none;",
      "  backdrop-filter: blur(10px) saturate(120%);",
      "  -webkit-backdrop-filter: blur(10px) saturate(120%);",
      "}",
      `#${LOADER_ID}.is-visible {`,
      "  opacity: 1;",
      "  transform: translateY(0);",
      "}",
      `#${LOADER_ID}::before {`,
      "  content: \"\";",
      "  width: 12px;",
      "  height: 12px;",
      "  border-radius: 50%;",
      "  border: 2px solid rgba(255, 255, 255, 0.35);",
      "  border-top-color: #ffd179;",
      "  animation: dtPageLoaderSpin .8s linear infinite;",
      "}",
      "@keyframes dtPageLoaderSpin {",
      "  from { transform: rotate(0deg); }",
      "  to { transform: rotate(360deg); }",
      "}"
    ].join("\n");

    document.head.appendChild(style);
  }

  function mountLoaderHint() {
    if (!document.body || document.getElementById(LOADER_ID)) {
      return null;
    }

    ensureLoaderStyle();
    const node = document.createElement("div");
    node.id = LOADER_ID;
    node.setAttribute("role", "status");
    node.setAttribute("aria-live", "polite");
    node.textContent = getPageLoadText();
    document.body.appendChild(node);
    return node;
  }

  function initPageLoaderHint() {
    const node = mountLoaderHint();
    if (!node) {
      return;
    }

    let shown = false;
    const showTimer = setTimeout(() => {
      if (document.readyState !== "complete") {
        shown = true;
        node.classList.add("is-visible");
      }
    }, 120);

    const hide = () => {
      clearTimeout(showTimer);
      if (!shown) {
        node.remove();
        return;
      }
      node.classList.remove("is-visible");
      setTimeout(() => node.remove(), 220);
    };

    if (document.readyState === "complete") {
      hide();
      return;
    }

    window.addEventListener("load", hide, { once: true });
  }

  initPageLoaderHint();

  if (!("serviceWorker" in navigator)) {
    return;
  }

  function getBasePath() {
    const host = (window.location.hostname || "").toLowerCase();
    if (!host.endsWith("github.io")) {
      return "/";
    }

    const parts = (window.location.pathname || "/").split("/").filter(Boolean);
    if (!parts.length) {
      return "/";
    }
    return `/${parts[0]}/`;
  }

  async function register() {
    try {
      const base = getBasePath();
      const registration = await navigator.serviceWorker.register(`${base}sw.js`, { scope: base });
      if (registration && registration.sync) {
        try {
          await registration.sync.register("dashType-sync-rounds");
        } catch (_error) {}
      }
    } catch (_error) {}
  }

  window.addEventListener("online", async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.sync) {
        await registration.sync.register("dashType-sync-rounds");
      }
      navigator.serviceWorker.controller?.postMessage({ type: "retry-round-saves" });
    } catch (_error) {}
  });

  register();
})();

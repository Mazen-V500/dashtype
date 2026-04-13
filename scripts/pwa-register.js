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

  function getHomeBackText() {
    const lang = (document.documentElement.lang || "ar").toLowerCase();
    return lang === "en" ? "Back to Home" : "العودة للرئيسية";
  }

  function getHistoryIconLabel() {
    const lang = (document.documentElement.lang || "ar").toLowerCase();
    return lang === "en" ? "Personal history" : "السجل الشخصي";
  }

  function isHomePage() {
    if (document.body && document.body.classList.contains("home-page")) {
      return true;
    }
    return false;
  }

  function getFallbackHomeHref() {
    const path = (window.location.pathname || "").replace(/\\/g, "/");
    const parts = path.split("/").filter(Boolean);
    if (parts.length <= 1) {
      return "./";
    }
    return "../";
  }

  function getFallbackHistoryHref() {
    const path = (window.location.pathname || "").replace(/\\/g, "/");
    const parts = path.split("/").filter(Boolean);
    if (parts.length <= 1) {
      return "./history/";
    }
    return "../history/";
  }

  function isPlayModePage() {
    const body = document.body;
    if (!body) {
      return false;
    }
    return body.classList.contains("play-mode-page") || body.classList.contains("mode4-page");
  }

  function shouldIgnoreBackCandidate(btn) {
    if (!btn) {
      return true;
    }
    if (btn.closest(".auth-required") || btn.closest("#gateSection")) {
      return true;
    }
    if (btn.closest(".global-home-back-wrap")) {
      return true;
    }
    return false;
  }

  function setButtonText(button, text) {
    if (!button) {
      return;
    }

    let textNode = button.querySelector("span:last-child");
    if (!textNode) {
      textNode = document.createElement("span");
      button.appendChild(textNode);
    }
    textNode.textContent = text;
  }

  function suppressDuplicateBackButtons(activeButton) {
    const duplicateButtons = Array.from(document.querySelectorAll("button"))
      .filter((btn) => {
        if (!btn || btn === activeButton) {
          return false;
        }
        if (btn.closest(".global-home-back-wrap")) {
          return false;
        }
        if (btn.id === "homeBtn") {
          return true;
        }
        return Boolean(btn.querySelector(".icon-back"));
      });

    duplicateButtons.forEach((btn) => {
      const anchor = btn.closest("a");
      if (anchor && anchor.childElementCount === 1) {
        anchor.style.display = "none";
      } else {
        btn.style.display = "none";
      }
    });
  }

  function refreshUnifiedHomeBackText() {
    const button = document.querySelector(".global-home-back-wrap .global-home-back-btn");
    if (!button) {
      return;
    }
    setButtonText(button, getHomeBackText());

    const historyButton = document.querySelector(".global-home-back-wrap .global-history-shortcut-btn");
    if (historyButton) {
      const historyText = getHistoryIconLabel();
      historyButton.setAttribute("aria-label", historyText);
      historyButton.setAttribute("title", historyText);
    }
  }

  function ensureModeHistoryShortcut(wrap) {
    if (!wrap || !isPlayModePage()) {
      return;
    }

    let historyLink = wrap.querySelector(".global-history-shortcut-link");
    let historyButton = historyLink ? historyLink.querySelector(".global-history-shortcut-btn") : null;

    if (!historyLink) {
      historyLink = document.createElement("a");
      historyLink.className = "global-home-back-link global-history-shortcut-link";
      historyLink.setAttribute("href", getFallbackHistoryHref());

      historyButton = document.createElement("button");
      historyButton.className = "btn-icon icon-only-btn global-history-shortcut-btn";
      historyButton.type = "button";

      const icon = document.createElement("span");
      icon.className = "icon icon-history";
      icon.setAttribute("aria-hidden", "true");

      const text = document.createElement("span");
      text.className = "icon-only-label";

      historyButton.appendChild(icon);
      historyButton.appendChild(text);
      historyLink.appendChild(historyButton);
      wrap.appendChild(historyLink);
    }

    const historyText = getHistoryIconLabel();
    if (historyButton) {
      historyButton.setAttribute("aria-label", historyText);
      historyButton.setAttribute("title", historyText);
      const hiddenText = historyButton.querySelector(".icon-only-label");
      if (hiddenText) {
        hiddenText.textContent = historyText;
      }
    }

    if (historyLink && !historyLink.getAttribute("href")) {
      historyLink.setAttribute("href", getFallbackHistoryHref());
    }
  }

  function installUnifiedHomeBackButton() {
    if (isHomePage()) {
      return;
    }

    const footer = document.querySelector(".page-footer");
    if (!footer) {
      return;
    }

    if (document.querySelector(".global-home-back-wrap")) {
      refreshUnifiedHomeBackText();
      ensureModeHistoryShortcut(document.querySelector(".global-home-back-wrap"));
      return;
    }

    const explicitHomeButton = document.getElementById("homeBtn");
    const candidates = Array.from(document.querySelectorAll("button"))
      .filter((btn) => {
        if (!btn.querySelector(".icon-back")) {
          return false;
        }
        return !shouldIgnoreBackCandidate(btn);
      });

    if (explicitHomeButton && !shouldIgnoreBackCandidate(explicitHomeButton)) {
      candidates.unshift(explicitHomeButton);
    }

    const wrap = document.createElement("div");
    wrap.className = "global-home-back-wrap";

    let anchor = null;
    let button = null;
    let nodeToAppend = null;

    if (candidates.length) {
      const chosen = candidates[0];
      anchor = chosen.closest("a");
      button = chosen;
      if (anchor) {
        nodeToAppend = anchor;
      } else {
        nodeToAppend = chosen;
      }
    }

    if (!nodeToAppend) {
      anchor = document.createElement("a");
      button = document.createElement("button");
      button.className = "btn-icon";
      button.type = "button";

      const icon = document.createElement("span");
      icon.className = "icon icon-back";
      icon.setAttribute("aria-hidden", "true");

      const text = document.createElement("span");
      text.textContent = "";

      button.appendChild(icon);
      button.appendChild(text);
      anchor.appendChild(button);
      nodeToAppend = anchor;
    }

    if (anchor && !anchor.getAttribute("href")) {
      anchor.setAttribute("href", getFallbackHomeHref());
    }

    if (anchor) {
      anchor.classList.add("global-home-back-link");
    }

    const backBtn = button || (anchor ? anchor.querySelector("button") : null);
    if (backBtn) {
      backBtn.classList.add("global-home-back-btn");
      setButtonText(backBtn, getHomeBackText());
    }

    wrap.appendChild(nodeToAppend);

    ensureModeHistoryShortcut(wrap);

    footer.parentNode.insertBefore(wrap, footer);

    suppressDuplicateBackButtons(backBtn);

    const langObserver = new MutationObserver(() => {
      refreshUnifiedHomeBackText();
    });
    langObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"]
    });

    window.addEventListener("dashType:language-changed", () => {
      refreshUnifiedHomeBackText();
    });
  }

  initPageLoaderHint();
  installUnifiedHomeBackButton();

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

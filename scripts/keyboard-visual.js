(function initDashTypeKeyboardVisual() {
  if (window.__dashTypeKeyboardVisualReady) {
    return;
  }
  window.__dashTypeKeyboardVisualReady = true;

  const typingInput = document.getElementById("typingInput");
  const wordBox = document.getElementById("wordBox");
  if (!typingInput || !wordBox) {
    return;
  }

  const host = document.querySelector(".game-shell");
  if (!host) {
    return;
  }

  const STORAGE_KEY = "dashTypeKeyboardAssistSettings";
  const DEFAULT_SETTINGS = {
    enabled: false,
    type: "auto"
  };

  function getUiLanguage() {
    return (document.documentElement.lang || "ar").toLowerCase() === "en" ? "en" : "ar";
  }

  function getLabels() {
    const lang = getUiLanguage();
    if (lang === "en") {
      return {
        title: "Keyboard Assistant",
        enabled: "Enable",
        typeLabel: "Type",
        optionAuto: "Auto",
        optionEnglish: "English",
        optionArabic: "Arabic",
        optionMixed: "Mixed",
        space: "Space"
      };
    }

    return {
      title: "لوحة الكيبورد المساعدة",
      enabled: "تشغيل",
      typeLabel: "النوع",
      optionAuto: "تلقائي",
      optionEnglish: "إنجليزي",
      optionArabic: "عربي",
      optionMixed: "مختلط",
      space: "مسافة"
    };
  }

  function readSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const type = String(saved.type || DEFAULT_SETTINGS.type);
      return {
        enabled: Boolean(saved.enabled),
        type: ["auto", "english", "arabic", "mixed"].includes(type) ? type : DEFAULT_SETTINGS.type
      };
    } catch (_error) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function writeSettings(nextSettings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings));
  }

  const settings = readSettings();

  const shell = document.createElement("section");
  shell.className = "keyboard-assist-shell";

  const head = document.createElement("div");
  head.className = "keyboard-assist-head";

  const assistLabel = document.createElement("span");
  assistLabel.id = "kbAssistLabel";
  assistLabel.textContent = "لوحة الكيبورد المساعدة";

  const assistTarget = document.createElement("span");
  assistTarget.id = "kbAssistTarget";
  assistTarget.className = "keyboard-assist-target";
  assistTarget.textContent = "-";

  head.appendChild(assistLabel);
  head.appendChild(assistTarget);

  const controls = document.createElement("div");
  controls.className = "keyboard-assist-controls";

  const enabledLabel = document.createElement("label");
  enabledLabel.className = "keyboard-assist-toggle";
  enabledLabel.setAttribute("for", "kbAssistEnabled");

  const assistEnabledInput = document.createElement("input");
  assistEnabledInput.id = "kbAssistEnabled";
  assistEnabledInput.type = "checkbox";

  const assistEnabledText = document.createElement("span");
  assistEnabledText.id = "kbAssistEnabledText";
  assistEnabledText.textContent = "تشغيل";

  enabledLabel.appendChild(assistEnabledInput);
  enabledLabel.appendChild(assistEnabledText);

  const typeWrap = document.createElement("label");
  typeWrap.className = "keyboard-assist-type-wrap";
  typeWrap.setAttribute("for", "kbAssistType");

  const assistTypeLabel = document.createElement("span");
  assistTypeLabel.id = "kbAssistTypeLabel";
  assistTypeLabel.textContent = "النوع";

  const assistTypeSelect = document.createElement("select");
  assistTypeSelect.id = "kbAssistType";
  assistTypeSelect.className = "keyboard-assist-select";
  [
    { value: "auto", text: "تلقائي" },
    { value: "english", text: "إنجليزي" },
    { value: "arabic", text: "عربي" },
    { value: "mixed", text: "مختلط" }
  ].forEach((item) => {
    const option = document.createElement("option");
    option.value = item.value;
    option.textContent = item.text;
    assistTypeSelect.appendChild(option);
  });

  typeWrap.appendChild(assistTypeLabel);
  typeWrap.appendChild(assistTypeSelect);

  controls.appendChild(enabledLabel);
  controls.appendChild(typeWrap);

  const layout = document.createElement("div");
  layout.className = "keyboard-layout";
  layout.id = "keyboardLayout";

  shell.appendChild(head);
  shell.appendChild(controls);
  shell.appendChild(layout);

  host.appendChild(shell);

  const targetEl = assistTarget;
  const enabledInput = assistEnabledInput;
  const typeSelect = assistTypeSelect;
  const keyById = new Map();

  const keyRows = [
    [
      ["q", "Q", "ض"], ["w", "W", "ص"], ["e", "E", "ث"], ["r", "R", "ق"], ["t", "T", "ف"],
      ["y", "Y", "غ"], ["u", "U", "ع"], ["i", "I", "ه"], ["o", "O", "خ"], ["p", "P", "ح"],
      ["[", "[", "ج"], ["]", "]", "د"]
    ],
    [
      ["a", "A", "ش"], ["s", "S", "س"], ["d", "D", "ي"], ["f", "F", "ب"], ["g", "G", "ل"],
      ["h", "H", "ا"], ["j", "J", "ت"], ["k", "K", "ن"], ["l", "L", "م"]
    ],
    [
      ["z", "Z", "ئ"], ["x", "X", "ء"], ["c", "C", "ؤ"], ["v", "V", "ر"], ["b", "B", "لا"],
      ["n", "N", "ى"], ["m", "M", "ة"], [",", ",", "و"], [".", ".", "ز"], ["/", "/", "ظ"]
    ],
    [
      ["space", "Space", "مسافة"]
    ]
  ];

  keyRows.forEach((rowDef) => {
    const row = document.createElement("div");
    row.className = "keyboard-row";
    rowDef.forEach(([id, en, ar]) => {
      const key = document.createElement("div");
      key.className = `keyboard-key ${id === "space" ? "space" : ""}`;
      key.dataset.keyId = id;

      const enSpan = document.createElement("span");
      enSpan.className = "key-en";
      enSpan.textContent = en;

      const arSpan = document.createElement("span");
      arSpan.className = "key-ar";
      arSpan.textContent = ar;

      key.appendChild(enSpan);
      key.appendChild(arSpan);
      keyById.set(id, key);
      row.appendChild(key);
    });
    layout.appendChild(row);
  });

  const arabicToKey = {
    "ض": "q", "ص": "w", "ث": "e", "ق": "r", "ف": "t", "غ": "y", "ع": "u", "ه": "i", "خ": "o", "ح": "p",
    "ش": "a", "س": "s", "ي": "d", "ب": "f", "ل": "g", "ا": "h", "أ": "h", "إ": "h", "آ": "h", "ٱ": "h", "ت": "j", "ن": "k", "م": "l", "ك": "l", "ط": "p",
    "ئ": "z", "ء": "x", "ؤ": "c", "ر": "v", "ى": "n", "ة": "m", "و": ",", "ز": ".", "ظ": "/", "ج": "[", "د": "]"
  };

  function clearActive() {
    keyById.forEach((el) => el.classList.remove("active"));
  }

  function normalizeChar(ch) {
    return String(ch || "")
      .normalize("NFC")
      .replace(/\u0640/g, "")
      .trim();
  }

  function detectNextChar(targetText, typedText) {
    let i = 0;
    const target = String(targetText || "");
    const typed = String(typedText || "");
    while (i < typed.length && i < target.length && typed[i] === target[i]) {
      i += 1;
    }
    return target[i] || "";
  }

  function mapCharToKeyId(ch) {
    if (!ch) return "";
    if (ch === " ") return "space";

    const normalized = normalizeChar(ch);
    const lower = normalized.toLowerCase();

    if (lower >= "a" && lower <= "z") {
      return lower;
    }

    if (arabicToKey[normalized]) {
      return arabicToKey[normalized];
    }

    return "";
  }

  function isPlayingTarget(text) {
    const value = String(text || "").trim();
    if (!value) return false;
    const blocked = [
      "جاهز",
      "انتهت الجولة",
      "Ready?",
      "Round Ended",
      "Press",
      "اضغط"
    ];
    return !blocked.some((item) => value.includes(item));
  }

  function resolveVisualType() {
    if (settings.type === "auto") {
      return getUiLanguage() === "en" ? "english" : "arabic";
    }
    return settings.type;
  }

  function updateTypeClass() {
    const visualType = resolveVisualType();
    shell.classList.remove("kb-type-english", "kb-type-arabic", "kb-type-mixed");
    shell.classList.add(`kb-type-${visualType}`);
  }

  function updateLabels() {
    const labels = getLabels();
    assistLabel.textContent = labels.title;
    assistEnabledText.textContent = labels.enabled;
    assistTypeLabel.textContent = labels.typeLabel;

    const options = typeSelect.querySelectorAll("option");
    options.forEach((option) => {
      if (option.value === "auto") option.textContent = labels.optionAuto;
      if (option.value === "english") option.textContent = labels.optionEnglish;
      if (option.value === "arabic") option.textContent = labels.optionArabic;
      if (option.value === "mixed") option.textContent = labels.optionMixed;
    });

    const spaceKey = keyById.get("space");
    if (spaceKey) {
      const enLabel = spaceKey.querySelector(".key-en");
      const arLabel = spaceKey.querySelector(".key-ar");
      if (enLabel) enLabel.textContent = "Space";
      if (arLabel) arLabel.textContent = "مسافة";
    }
  }

  function render() {
    if (window.innerWidth <= 820) {
      return;
    }

    updateTypeClass();
    shell.classList.toggle("is-disabled", !settings.enabled);
    clearActive();

    if (!settings.enabled) {
      targetEl.textContent = "-";
      return;
    }

    const targetText = wordBox.textContent || "";
    if (!isPlayingTarget(targetText)) {
      targetEl.textContent = "-";
      return;
    }

    const typedText = typingInput.value || "";
    const nextChar = detectNextChar(targetText, typedText);
    const keyId = mapCharToKeyId(nextChar);
    const labels = getLabels();

    if (!keyId) {
      targetEl.textContent = nextChar ? nextChar : "-";
      return;
    }

    const keyEl = keyById.get(keyId);
    if (keyEl) {
      keyEl.classList.add("active");
    }

    targetEl.textContent = nextChar === " " ? labels.space : nextChar;
  }

  enabledInput.checked = Boolean(settings.enabled);
  typeSelect.value = settings.type;
  updateLabels();

  enabledInput.addEventListener("change", () => {
    settings.enabled = Boolean(enabledInput.checked);
    writeSettings(settings);
    render();
  });

  typeSelect.addEventListener("change", () => {
    const nextType = String(typeSelect.value || "auto");
    settings.type = ["auto", "english", "arabic", "mixed"].includes(nextType) ? nextType : "auto";
    writeSettings(settings);
    render();
  });

  const observer = new MutationObserver(() => render());
  observer.observe(wordBox, { subtree: true, childList: true, characterData: true });

  const langObserver = new MutationObserver(() => {
    updateLabels();
    render();
  });
  langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  typingInput.addEventListener("input", render);
  typingInput.addEventListener("focus", render);
  window.addEventListener("resize", render, { passive: true });

  render();
})();

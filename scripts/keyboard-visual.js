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

  const host = document.querySelector(".game-shell") || typingInput.closest(".play-main") || document.querySelector(".status-panel");
  if (!host) {
    return;
  }

  const STORAGE_KEY = "dashTypeKeyboardAssistSettings";
  const MOBILE_BREAKPOINT_PX = 820;
  const TRACE_SUPPORTED = typingInput.tagName.toLowerCase() === "input";
  const DEFAULT_SETTINGS = {
    enabled: false,
    type: "auto",
    layout: "qwerty",
    inlineTrace: false,
    hideTypedText: false
  };

  const ALLOWED_TYPES = ["auto", "english", "arabic", "mixed"];
  const ALLOWED_LAYOUTS = ["qwerty", "azerty", "qwertz"];

  function normalizeExclusiveTypingFlags(inlineTrace, hideTypedText, preferred) {
    const normalized = {
      inlineTrace: Boolean(inlineTrace) && TRACE_SUPPORTED,
      hideTypedText: Boolean(hideTypedText)
    };

    if (normalized.inlineTrace && normalized.hideTypedText) {
      if (preferred === "hideTypedText") {
        normalized.inlineTrace = false;
      } else {
        normalized.hideTypedText = false;
      }
    }

    return normalized;
  }

  const KEYBOARD_LAYOUTS = {
    qwerty: [
      ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
      ["shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
      ["space"]
    ],
    azerty: [
      ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
      ["a", "z", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
      ["q", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
      ["shift", "w", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
      ["space"]
    ],
    qwertz: [
      ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
      ["q", "w", "e", "r", "t", "z", "u", "i", "o", "p", "[", "]", "\\"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
      ["shift", "y", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
      ["space"]
    ]
  };

  const KEY_LABELS = {
    "`": { en: "`", ar: "ذ" },
    "1": { en: "1", ar: "١" },
    "2": { en: "2", ar: "٢" },
    "3": { en: "3", ar: "٣" },
    "4": { en: "4", ar: "٤" },
    "5": { en: "5", ar: "٥" },
    "6": { en: "6", ar: "٦" },
    "7": { en: "7", ar: "٧" },
    "8": { en: "8", ar: "٨" },
    "9": { en: "9", ar: "٩" },
    "0": { en: "0", ar: "٠" },
    "-": { en: "-", ar: "-" },
    "=": { en: "=", ar: "=" },
    q: { en: "Q", ar: "\u0636" },
    w: { en: "W", ar: "\u0635" },
    e: { en: "E", ar: "\u062b" },
    r: { en: "R", ar: "\u0642" },
    t: { en: "T", ar: "\u0641" },
    y: { en: "Y", ar: "\u063a" },
    u: { en: "U", ar: "\u0639" },
    i: { en: "I", ar: "\u0647" },
    o: { en: "O", ar: "\u062e" },
    p: { en: "P", ar: "\u062d" },
    "[": { en: "[", ar: "\u062c" },
    "]": { en: "]", ar: "\u062f" },
    "\\": { en: "\\", ar: "\\" },
    a: { en: "A", ar: "\u0634" },
    s: { en: "S", ar: "\u0633" },
    d: { en: "D", ar: "\u064a" },
    f: { en: "F", ar: "\u0628" },
    g: { en: "G", ar: "\u0644" },
    h: { en: "H", ar: "\u0627" },
    j: { en: "J", ar: "\u062a" },
    k: { en: "K", ar: "\u0646" },
    l: { en: "L", ar: "\u0645" },
    ";": { en: ";", ar: "\u0643" },
    "'": { en: "'", ar: "\u0637" },
    z: { en: "Z", ar: "\u0626" },
    x: { en: "X", ar: "\u0621" },
    c: { en: "C", ar: "\u0624" },
    v: { en: "V", ar: "\u0631" },
    b: { en: "B", ar: "\u0644\u0627" },
    n: { en: "N", ar: "\u0649" },
    m: { en: "M", ar: "\u0629" },
    ",": { en: ",", ar: "\u0648" },
    ".": { en: ".", ar: "\u0632" },
    "/": { en: "/", ar: "\u0638" },
    shift: { en: "Shift", ar: "Shift" },
    space: { en: "Space", ar: "\u0645\u0633\u0627\u0641\u0629" }
  };

  const SHIFT_SYMBOL_TO_BASE_KEY = {
    "~": "`",
    "!": "1",
    "@": "2",
    "#": "3",
    "$": "4",
    "%": "5",
    "^": "6",
    "&": "7",
    "*": "8",
    "(": "9",
    ")": "0",
    "_": "-",
    "+": "=",
    "{": "[",
    "}": "]",
    "|": "\\",
    ":": ";",
    "\"": "'",
    "<": ",",
    ">": ".",
    "?": "/",
    "\u061f": "/",
    "\u061b": ";",
    "\u060c": ","
  };

  const ARABIC_INDIC_DIGIT_TO_KEY = {
    "\u0660": "0",
    "\u0661": "1",
    "\u0662": "2",
    "\u0663": "3",
    "\u0664": "4",
    "\u0665": "5",
    "\u0666": "6",
    "\u0667": "7",
    "\u0668": "8",
    "\u0669": "9"
  };

  const arabicToKey = {
    "\u0636": "q", "\u0635": "w", "\u062b": "e", "\u0642": "r", "\u0641": "t", "\u063a": "y", "\u0639": "u", "\u0647": "i", "\u062e": "o", "\u062d": "p",
    "\u0634": "a", "\u0633": "s", "\u064a": "d", "\u0628": "f", "\u0644": "g", "\u0627": "h", "\u0623": "h", "\u0625": "h", "\u0622": "h", "\u0671": "h", "\u062a": "j", "\u0646": "k", "\u0645": "l", "\u0643": ";", "\u0637": "'",
    "\u0626": "z", "\u0621": "x", "\u0624": "c", "\u0631": "v", "\u0649": "n", "\u0629": "m", "\u0648": ",", "\u0632": ".", "\u0638": "/", "\u062c": "[", "\u062f": "]"
  };

  const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`);
  const keyById = new Map();

  function getUiLanguage() {
    return (document.documentElement.lang || "ar").toLowerCase() === "en" ? "en" : "ar";
  }

  function getLabels() {
    const lang = getUiLanguage();
    if (lang === "en") {
      return {
        title: "Typing Settings",
        keyboardEnabled: "Enable keyboard assistant",
        typeLabel: "Keyboard language",
        optionAuto: "Auto",
        optionEnglish: "English",
        optionArabic: "Arabic",
        optionMixed: "Mixed",
        layoutLabel: "Keyboard layout",
        layoutQwerty: "QWERTY",
        layoutAzerty: "AZERTY",
        layoutQwertz: "QWERTZ",
        shift: "Shift",
        inlineTrace: "Trace word inside typing bar",
        hideTypedText: "Hide typed text in input bar",
        traceExclusiveHint: "Inline trace and hidden text cannot be enabled together",
        traceUnsupported: "Inline trace works in word modes only",
        space: "Space"
      };
    }

    return {
      title: "\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0643\u062a\u0627\u0628\u0629",
      keyboardEnabled: "\u062a\u0641\u0639\u064a\u0644 \u0644\u0648\u062d\u0629 \u0627\u0644\u0643\u064a\u0628\u0648\u0631\u062f \u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629",
      typeLabel: "\u0644\u063a\u0629 \u0627\u0644\u0643\u064a\u0628\u0648\u0631\u062f",
      optionAuto: "\u062a\u0644\u0642\u0627\u0626\u064a",
      optionEnglish: "\u0625\u0646\u062c\u0644\u064a\u0632\u064a",
      optionArabic: "\u0639\u0631\u0628\u064a",
      optionMixed: "\u0645\u062e\u062a\u0644\u0637",
      layoutLabel: "\u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u0643\u064a\u0628\u0648\u0631\u062f",
      layoutQwerty: "QWERTY",
      layoutAzerty: "AZERTY",
      layoutQwertz: "QWERTZ",
      shift: "Shift",
      inlineTrace: "\u0627\u0644\u0643\u062a\u0627\u0628\u0629 \u0641\u0648\u0642 \u0627\u0644\u0643\u0644\u0645\u0629 \u062f\u0627\u062e\u0644 \u0634\u0631\u064a\u0637 \u0627\u0644\u0625\u062f\u062e\u0627\u0644",
      hideTypedText: "\u0625\u062e\u0641\u0627\u0621 \u0627\u0644\u0646\u0635 \u0627\u0644\u0645\u0643\u062a\u0648\u0628 \u062f\u0627\u062e\u0644 \u0634\u0631\u064a\u0637 \u0627\u0644\u0643\u062a\u0627\u0628\u0629",
      traceExclusiveHint: "\u0644\u0627 \u064a\u0645\u0643\u0646 \u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u062e\u064a\u0627\u0631\u064a\u0646 \u0645\u0639\u0627\u064b",
      traceUnsupported: "\u0627\u0644\u062a\u062a\u0628\u0639 \u062f\u0627\u062e\u0644 \u0627\u0644\u0628\u0627\u0631 \u0645\u062a\u0627\u062d \u0641\u064a \u0623\u0646\u0645\u0627\u0637 \u0627\u0644\u0643\u0644\u0645\u0627\u062a \u0641\u0642\u0637",
      space: "\u0645\u0633\u0627\u0641\u0629"
    };
  }

  function normalizeSettings(input, options = {}) {
    const source = input && typeof input === "object" ? input : {};
    const exclusiveFlags = normalizeExclusiveTypingFlags(
      source.inlineTrace,
      source.hideTypedText,
      typeof options.preferredExclusiveOption === "string" ? options.preferredExclusiveOption : ""
    );
    const normalized = {
      enabled: Boolean(source.enabled),
      type: ALLOWED_TYPES.includes(String(source.type || "")) ? String(source.type) : DEFAULT_SETTINGS.type,
      layout: ALLOWED_LAYOUTS.includes(String(source.layout || "")) ? String(source.layout) : DEFAULT_SETTINGS.layout,
      inlineTrace: exclusiveFlags.inlineTrace,
      hideTypedText: exclusiveFlags.hideTypedText
    };
    return normalized;
  }

  function readSettings() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return { ...DEFAULT_SETTINGS, ...normalizeSettings(parsed) };
    } catch (_error) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function writeSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function emitSettingsChanged() {
    try {
      window.dispatchEvent(new CustomEvent("dashType:typing-settings-changed", {
        detail: { ...settings }
      }));
    } catch (_error) {
      // Ignore event dispatch errors.
    }
  }

  function persistSettings(options = {}) {
    writeSettings();
    emitSettingsChanged();
    if (options.skipRemoteSave) {
      return;
    }
    if (window.DashTypePreferences && typeof window.DashTypePreferences.save === "function") {
      void window.DashTypePreferences.save({ typingSettings: { ...settings } });
    }
  }

  const settings = readSettings();

  const traceWrap = document.createElement("div");
  traceWrap.className = "typing-trace-wrap";
  const traceLayer = document.createElement("div");
  traceLayer.className = "typing-trace-layer";
  const traceTarget = document.createElement("span");
  traceTarget.className = "typing-trace-target";
  traceLayer.appendChild(traceTarget);

  const inputParent = typingInput.parentElement;
  if (inputParent) {
    inputParent.insertBefore(traceWrap, typingInput);
    traceWrap.appendChild(traceLayer);
    traceWrap.appendChild(typingInput);
  }

  const shell = document.createElement("section");
  shell.className = "keyboard-assist-shell";

  const head = document.createElement("div");
  head.className = "keyboard-assist-head";

  const assistLabel = document.createElement("span");
  assistLabel.id = "kbAssistLabel";

  const assistTarget = document.createElement("span");
  assistTarget.id = "kbAssistTarget";
  assistTarget.className = "keyboard-assist-target is-empty";

  head.appendChild(assistLabel);
  head.appendChild(assistTarget);

  const controls = document.createElement("div");
  controls.className = "keyboard-assist-controls";

  const quickToggles = document.createElement("div");
  quickToggles.className = "keyboard-assist-quick-toggles";

  const inlineTraceLabel = document.createElement("label");
  inlineTraceLabel.className = "keyboard-assist-toggle keyboard-assist-trace-toggle";
  inlineTraceLabel.setAttribute("for", "kbAssistInlineTrace");

  const inlineTraceInput = document.createElement("input");
  inlineTraceInput.id = "kbAssistInlineTrace";
  inlineTraceInput.type = "checkbox";

  const inlineTraceText = document.createElement("span");
  inlineTraceText.id = "kbAssistInlineTraceText";

  inlineTraceLabel.appendChild(inlineTraceInput);
  inlineTraceLabel.appendChild(inlineTraceText);

  const hideTypedTextLabel = document.createElement("label");
  hideTypedTextLabel.className = "keyboard-assist-toggle keyboard-assist-trace-toggle";
  hideTypedTextLabel.setAttribute("for", "kbAssistHideTypedText");

  const hideTypedTextInput = document.createElement("input");
  hideTypedTextInput.id = "kbAssistHideTypedText";
  hideTypedTextInput.type = "checkbox";

  const hideTypedTextText = document.createElement("span");
  hideTypedTextText.id = "kbAssistHideTypedTextText";

  hideTypedTextLabel.appendChild(hideTypedTextInput);
  hideTypedTextLabel.appendChild(hideTypedTextText);

  const keyboardBlock = document.createElement("div");
  keyboardBlock.className = "keyboard-assist-keyboard-block";

  const enabledLabel = document.createElement("label");
  enabledLabel.className = "keyboard-assist-toggle keyboard-assist-keyboard-toggle";
  enabledLabel.setAttribute("for", "kbAssistEnabled");

  const assistEnabledInput = document.createElement("input");
  assistEnabledInput.id = "kbAssistEnabled";
  assistEnabledInput.type = "checkbox";

  const assistEnabledText = document.createElement("span");
  assistEnabledText.id = "kbAssistEnabledText";

  enabledLabel.appendChild(assistEnabledInput);
  enabledLabel.appendChild(assistEnabledText);

  const keyboardOptionsRow = document.createElement("div");
  keyboardOptionsRow.className = "keyboard-assist-options-row";

  const typeWrap = document.createElement("label");
  typeWrap.className = "keyboard-assist-type-wrap keyboard-assist-keyboard-option";
  typeWrap.setAttribute("for", "kbAssistType");

  const assistTypeLabel = document.createElement("span");
  assistTypeLabel.id = "kbAssistTypeLabel";

  const assistTypeSelect = document.createElement("select");
  assistTypeSelect.id = "kbAssistType";
  assistTypeSelect.className = "keyboard-assist-select";
  [
    { value: "auto", text: "Auto" },
    { value: "english", text: "English" },
    { value: "arabic", text: "Arabic" },
    { value: "mixed", text: "Mixed" }
  ].forEach((item) => {
    const option = document.createElement("option");
    option.value = item.value;
    option.textContent = item.text;
    assistTypeSelect.appendChild(option);
  });

  typeWrap.appendChild(assistTypeLabel);
  typeWrap.appendChild(assistTypeSelect);

  const layoutWrap = document.createElement("label");
  layoutWrap.className = "keyboard-assist-type-wrap keyboard-assist-keyboard-option";
  layoutWrap.setAttribute("for", "kbAssistLayout");

  const assistLayoutLabel = document.createElement("span");
  assistLayoutLabel.id = "kbAssistLayoutLabel";

  const assistLayoutSelect = document.createElement("select");
  assistLayoutSelect.id = "kbAssistLayout";
  assistLayoutSelect.className = "keyboard-assist-select";
  [
    { value: "qwerty", text: "QWERTY" },
    { value: "azerty", text: "AZERTY" },
    { value: "qwertz", text: "QWERTZ" }
  ].forEach((item) => {
    const option = document.createElement("option");
    option.value = item.value;
    option.textContent = item.text;
    assistLayoutSelect.appendChild(option);
  });

  layoutWrap.appendChild(assistLayoutLabel);
  layoutWrap.appendChild(assistLayoutSelect);

  keyboardOptionsRow.appendChild(typeWrap);
  keyboardOptionsRow.appendChild(layoutWrap);
  keyboardBlock.appendChild(enabledLabel);
  keyboardBlock.appendChild(keyboardOptionsRow);

  const inlineTraceHint = document.createElement("span");
  inlineTraceHint.className = "keyboard-assist-hint";
  inlineTraceHint.id = "kbAssistInlineTraceHint";

  quickToggles.appendChild(inlineTraceLabel);
  quickToggles.appendChild(hideTypedTextLabel);

  controls.appendChild(keyboardBlock);
  controls.appendChild(quickToggles);
  controls.appendChild(inlineTraceHint);

  const layout = document.createElement("div");
  layout.className = "keyboard-layout";
  layout.id = "keyboardLayout";

  shell.appendChild(head);
  shell.appendChild(layout);
  shell.appendChild(controls);
  host.appendChild(shell);

  const targetEl = assistTarget;
  const enabledInput = assistEnabledInput;
  const typeSelect = assistTypeSelect;
  const layoutSelect = assistLayoutSelect;
  const traceInput = inlineTraceInput;
  const hideTypedInput = hideTypedTextInput;

  function applyTypedTextMask() {
    typingInput.classList.toggle("hide-typed-text", Boolean(settings.hideTypedText));
  }

  function setAssistTarget(value) {
    const text = String(value || "").trim();
    targetEl.textContent = text;
    targetEl.classList.toggle("is-empty", !text);
  }

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

  function mapCharToKeyInfo(ch) {
    if (!ch) return { keyId: "", requiresShift: false };
    if (ch === " ") return { keyId: "space", requiresShift: false };

    const normalized = normalizeChar(ch);
    const lower = normalized.toLowerCase();

    if (SHIFT_SYMBOL_TO_BASE_KEY[normalized]) {
      return { keyId: SHIFT_SYMBOL_TO_BASE_KEY[normalized], requiresShift: true };
    }

    if (normalized >= "A" && normalized <= "Z") {
      return { keyId: lower, requiresShift: true };
    }

    if (lower >= "a" && lower <= "z") {
      return { keyId: lower, requiresShift: false };
    }

    if (normalized >= "0" && normalized <= "9") {
      return { keyId: normalized, requiresShift: false };
    }

    if (ARABIC_INDIC_DIGIT_TO_KEY[normalized]) {
      return { keyId: ARABIC_INDIC_DIGIT_TO_KEY[normalized], requiresShift: false };
    }

    if (arabicToKey[normalized]) {
      return { keyId: arabicToKey[normalized], requiresShift: false };
    }

    if (["`", "-", "=", "[", "]", "\\", ";", "'", ",", ".", "/"].includes(normalized)) {
      return { keyId: normalized, requiresShift: false };
    }

    return { keyId: "", requiresShift: false };
  }

  function isPlayingTarget(text) {
    const value = String(text || "").trim();
    if (!value) return false;
    if (value.length > 90) return false;

    const blocked = [
      "Ready?",
      "Round Ended",
      "Press",
      "\u062c\u0627\u0647\u0632",
      "\u0627\u0646\u062a\u0647\u062a \u0627\u0644\u062c\u0648\u0644\u0629",
      "\u0627\u0636\u063a\u0637"
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

  function getLayoutRows() {
    return KEYBOARD_LAYOUTS[settings.layout] || KEYBOARD_LAYOUTS.qwerty;
  }

  function rebuildKeyboardLayout() {
    layout.textContent = "";
    keyById.clear();

    getLayoutRows().forEach((rowDef) => {
      const row = document.createElement("div");
      row.className = "keyboard-row";

      rowDef.forEach((id) => {
        const label = KEY_LABELS[id] || { en: String(id).toUpperCase(), ar: String(id) };
        const key = document.createElement("div");
        key.className = `keyboard-key ${id === "space" ? "space" : ""} ${id === "shift" ? "shift" : ""}`.trim();
        key.dataset.keyId = id;

        const enSpan = document.createElement("span");
        enSpan.className = "key-en";
        enSpan.textContent = label.en;

        const arSpan = document.createElement("span");
        arSpan.className = "key-ar";
        arSpan.textContent = label.ar;

        key.appendChild(enSpan);
        key.appendChild(arSpan);
        keyById.set(id, key);
        row.appendChild(key);
      });

      layout.appendChild(row);
    });
  }

  function updateInlineTrace(targetText) {
    const shouldShowTrace = TRACE_SUPPORTED && settings.inlineTrace && isPlayingTarget(targetText);
    traceWrap.classList.toggle("trace-active", shouldShowTrace);
    typingInput.classList.toggle("is-inline-trace", shouldShowTrace);

    if (!shouldShowTrace) {
      traceTarget.textContent = "";
      return;
    }

    const expected = String(targetText || "");
    const typed = String(typingInput.value || "");

    traceTarget.textContent = "";

    const typedSpan = document.createElement("span");
    typedSpan.className = "typing-trace-typed";
    typedSpan.textContent = typed;

    const ghostSpan = document.createElement("span");
    ghostSpan.className = "typing-trace-ghost";
    ghostSpan.textContent = typed.length <= expected.length ? expected.slice(typed.length) : "";

    traceTarget.appendChild(typedSpan);
    traceTarget.appendChild(ghostSpan);
  }

  function updateLabels() {
    const labels = getLabels();
    assistLabel.textContent = labels.title;
    assistEnabledText.textContent = labels.keyboardEnabled;
    assistTypeLabel.textContent = labels.typeLabel;
    assistLayoutLabel.textContent = labels.layoutLabel;
    inlineTraceText.textContent = labels.inlineTrace;
    hideTypedTextText.textContent = labels.hideTypedText;
    inlineTraceHint.textContent = TRACE_SUPPORTED ? labels.traceExclusiveHint : labels.traceUnsupported;

    typeSelect.querySelectorAll("option").forEach((option) => {
      if (option.value === "auto") option.textContent = labels.optionAuto;
      if (option.value === "english") option.textContent = labels.optionEnglish;
      if (option.value === "arabic") option.textContent = labels.optionArabic;
      if (option.value === "mixed") option.textContent = labels.optionMixed;
    });

    layoutSelect.querySelectorAll("option").forEach((option) => {
      if (option.value === "qwerty") option.textContent = labels.layoutQwerty;
      if (option.value === "azerty") option.textContent = labels.layoutAzerty;
      if (option.value === "qwertz") option.textContent = labels.layoutQwertz;
    });

    const spaceKey = keyById.get("space");
    if (spaceKey) {
      const enLabel = spaceKey.querySelector(".key-en");
      const arLabel = spaceKey.querySelector(".key-ar");
      if (enLabel) enLabel.textContent = labels.space;
      if (arLabel) arLabel.textContent = labels.space;
    }

    const shiftKey = keyById.get("shift");
    if (shiftKey) {
      const enLabel = shiftKey.querySelector(".key-en");
      const arLabel = shiftKey.querySelector(".key-ar");
      if (enLabel) enLabel.textContent = labels.shift;
      if (arLabel) arLabel.textContent = labels.shift;
    }
  }

  function render() {
    const targetText = wordBox.textContent || "";
    const isMobileCompact = Boolean(mediaQuery.matches);
    const keyboardRenderEnabled = settings.enabled && !isMobileCompact;

    shell.classList.toggle("keyboard-enabled", settings.enabled);
    shell.classList.toggle("is-mobile-compact", isMobileCompact);
    shell.classList.toggle("is-disabled", !settings.enabled);

    typeSelect.disabled = !settings.enabled;
    layoutSelect.disabled = !settings.enabled;

    updateTypeClass();
    applyTypedTextMask();
    updateInlineTrace(targetText);
    clearActive();

    if (!keyboardRenderEnabled || !isPlayingTarget(targetText)) {
      setAssistTarget("");
      return;
    }

    const typedText = typingInput.value || "";
    const nextChar = detectNextChar(targetText, typedText);
    const keyInfo = mapCharToKeyInfo(nextChar);
    const labels = getLabels();

    if (!keyInfo.keyId) {
      setAssistTarget(nextChar || "");
      return;
    }

    const keyEl = keyById.get(keyInfo.keyId);
    if (keyEl) {
      keyEl.classList.add("active");
    }

    if (keyInfo.requiresShift) {
      const shiftKey = keyById.get("shift");
      if (shiftKey) {
        shiftKey.classList.add("active");
      }
    }

    setAssistTarget(nextChar === " " ? labels.space : nextChar);
  }

  function applySettings(nextSettings, options = {}) {
    const normalized = normalizeSettings(
      { ...settings, ...(nextSettings && typeof nextSettings === "object" ? nextSettings : {}) },
      { preferredExclusiveOption: options.preferredExclusiveOption }
    );
    const changed = (
      normalized.enabled !== settings.enabled
      || normalized.type !== settings.type
      || normalized.layout !== settings.layout
      || normalized.inlineTrace !== settings.inlineTrace
      || normalized.hideTypedText !== settings.hideTypedText
    );

    settings.enabled = normalized.enabled;
    settings.type = normalized.type;
    settings.layout = normalized.layout;
    settings.inlineTrace = normalized.inlineTrace;
    settings.hideTypedText = normalized.hideTypedText;

    enabledInput.checked = settings.enabled;
    typeSelect.value = settings.type;
    layoutSelect.value = settings.layout;
    traceInput.checked = TRACE_SUPPORTED ? settings.inlineTrace : false;
    traceInput.disabled = !TRACE_SUPPORTED;
    hideTypedInput.checked = settings.hideTypedText;

    rebuildKeyboardLayout();
    updateLabels();
    render();

    if (changed || options.forcePersist) {
      persistSettings({ skipRemoteSave: Boolean(options.skipRemoteSave) });
    }
  }

  enabledInput.addEventListener("change", () => {
    applySettings({ enabled: enabledInput.checked }, { forcePersist: true });
  });

  typeSelect.addEventListener("change", () => {
    applySettings({ type: typeSelect.value }, { forcePersist: true });
  });

  layoutSelect.addEventListener("change", () => {
    applySettings({ layout: layoutSelect.value }, { forcePersist: true });
  });

  traceInput.addEventListener("change", () => {
    applySettings({ inlineTrace: traceInput.checked }, { forcePersist: true, preferredExclusiveOption: "inlineTrace" });
  });

  hideTypedInput.addEventListener("change", () => {
    applySettings({ hideTypedText: hideTypedInput.checked }, { forcePersist: true, preferredExclusiveOption: "hideTypedText" });
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
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", render);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(render);
  }
  window.addEventListener("resize", render, { passive: true });

  window.DashTypeTypingSettings = {
    get() {
      return { ...settings };
    },
    apply(next, options = {}) {
      applySettings(next, {
        forcePersist: true,
        skipRemoteSave: Boolean(options.skipRemoteSave)
      });
    },
    isTraceSupported: TRACE_SUPPORTED
  };

  applySettings(settings, { forcePersist: false, skipRemoteSave: true });
  emitSettingsChanged();
})();
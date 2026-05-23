const STORAGE_KEY = "floatingNotesData";

const POPUP_POS_KEY = "replacePopupPosition";

const tabsEl = document.getElementById("tabs");

const addTabBtn = document.getElementById("add-tab");

const searchEl = document.getElementById("search");

const themeBtn = document.getElementById("theme-btn");

const exportBtn = document.getElementById("export-btn");

const importBtn = document.getElementById("import-btn");

const importFile = document.getElementById("import-file");

let state = {
  theme: "dark",

  currentTab: 0,

  tabs: [
    {
      title: "Nota 1",

      content: {
        ops: [],
      },
    },
  ],
};

// =====================================
// COLOR MEMORY
// =====================================

state.lastColor = state.lastColor || "#000000";
state.lastBackground = state.lastBackground || "#ffff00";

state.recentColors = state.recentColors || [];
state.recentBackgrounds = state.recentBackgrounds || [];

const OFFICE_COLORS = [
  // Linha 1 — preto ao branco
  "#000000",
  "#1f1f1f",
  "#3d3d3d",
  "#5c5c5c",
  "#7a7a7a",
  "#999999",
  "#b8b8b8",
  "#d6d6d6",
  "#f0f0f0",
  "#ffffff",
  // Linha 2 — cores vivas
  "#ff0000",
  "#ff4000",
  "#ff8000",
  "#ffbf00",
  "#ffff00",
  "#80ff00",
  "#00ff00",
  "#00ff80",
  "#00ffff",
  "#0080ff",
  // Linha 3 — cores médias
  "#8000ff",
  "#ff00ff",
  "#ff0080",
  "#ff6666",
  "#ffb366",
  "#ffff66",
  "#b3ff66",
  "#66ffcc",
  "#66b3ff",
  "#0000ff",
  // Linha 4 — tons pastel
  "#f4cccc",
  "#fce5cd",
  "#fff2cc",
  "#d9ead3",
  "#d0e0e3",
  "#cfe2f3",
  "#d9d2e9",
  "#ead1dc",
  "#f4b8c1",
  "#c9daf8",
  // Linha 5 — tons médios
  "#ea9999",
  "#f9cb9c",
  "#ffe599",
  "#b6d7a8",
  "#a2c4c9",
  "#9fc5e8",
  "#b4a7d6",
  "#d5a6bd",
  "#e06666",
  "#6d9eeb",
  // Linha 6 — tons escuros
  "#cc0000",
  "#e69138",
  "#f1c232",
  "#6aa84f",
  "#45818e",
  "#3d85c6",
  "#674ea7",
  "#a64d79",
  "#85200c",
  "#1c4587",
];

// =====================================
// CUSTOM ICONS
// =====================================

const icons = window.Quill.import("ui/icons");

icons.undo = `
  <svg viewBox="0 0 18 18">
    <path class="ql-stroke"
      d="M7 10l-4 -4l4 -4" />

    <path class="ql-stroke"
      d="M3 6h7a5 5 0 1 1 0 10h-1" />
  </svg>
`;

icons.redo = `
  <svg viewBox="0 0 18 18">
    <path class="ql-stroke"
      d="M11 10l4 -4l-4 -4" />

    <path class="ql-stroke"
      d="M15 6h-7a5 5 0 1 0 0 10h1" />
  </svg>
`;

icons.uppercase = "A↑";

icons.lowercase = "a↓";

icons.capitalize = "Aa";

icons.clearAll = `
  <svg viewBox="0 0 18 18">
    <path class="ql-stroke" d="M3 3l12 12M3 15L15 3"/>
  </svg>
`;
icons.copyAll = `
  <svg viewBox="0 0 18 18">
    <rect class="ql-stroke" x="3" y="5" width="9" height="11" rx="1"/>
    <path class="ql-stroke" d="M6 5V4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1"/>
  </svg>
`;

// =====================================
// QUILL
// =====================================

const quill = new window.Quill("#editor", {
  theme: "snow",

  modules: {
    history: {
      delay: 500,

      maxStack: 500,

      userOnly: true,
    },

    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }, { size: [] }, { font: [] }],

        ["bold", "italic", "underline", "strike"],
        ["uppercase", "lowercase", "capitalize"],

        ["color", "background"],

        [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],

        ["code-block"],

        ["link"],

        ["clean"],

        ["undo", "redo"],

        ["clearAll", "copyAll"],
      ],
      handlers: {
        undo: () => {
          quill.history.undo();
        },

        redo: () => {
          quill.history.redo();
        },

        uppercase: () => transformText("upper"),
        lowercase: () => transformText("lower"),
        capitalize: () => transformText("capitalize"),

        // 🎨 COR TEXTO
        color: function (value) {
          // LIMPAR COR
          if (value === false) {
            quill.format("color", false, "user");
            return;
          }

          // botão principal = última cor
          if (!value) {
            quill.format("color", state.lastColor, "user");
            return;
          }

          // nova cor escolhida
          state.lastColor = value;

          quill.format("color", value, "user");

          updateColorUI();
          saveState();
        },

        // 🖍️ COR FUNDO
        background: function (value) {
          // LIMPAR FUNDO
          if (value === false) {
            quill.format("background", false, "user");
            return;
          }

          // botão principal = última cor
          if (!value) {
            quill.format("background", state.lastBackground, "user");
            return;
          }

          // nova cor
          state.lastBackground = value;

          quill.format("background", value, "user");

          updateColorUI();
          saveState();
        },

        clearAll: function () {
          const confirmed = confirm("Apagar todo o conteúdo desta aba?");
          if (!confirmed) return;
          quill.setContents([{ insert: "\n" }], "user");
          saveCurrentTab();
          saveState();
        },

        copyAll: function () {
          const text = quill.getText();
          navigator.clipboard.writeText(text).then(() => {
            // feedback visual temporário no botão
            const btn = document.querySelector(".ql-copyAll");
            if (!btn) return;
            btn.style.opacity = "0.4";
            setTimeout(() => (btn.style.opacity = ""), 400);
          });
        },
      },
    },
  },
});

quill.root.setAttribute("spellcheck", "false");

// REMOVE PICKERS ORIGINAIS DO QUILL
const colorPicker = document.querySelector(".ql-color");
const bgPicker = document.querySelector(".ql-background");

if (colorPicker) {
  colorPicker.innerHTML = `
    <button class="color-apply-btn" id="apply-color-btn" title="Aplicar cor">
      <span class="color-btn-letter">A</span>
      <span class="color-btn-bar" id="color-bar"></span>
    </button>
    <button class="color-arrow-btn" id="open-color-picker" title="Escolher cor">▾</button>
  `;
}
if (bgPicker) {
  bgPicker.innerHTML = `
    <button class="color-apply-btn" id="apply-bg-btn" title="Aplicar cor de fundo">
      <span class="color-btn-letter">🖍</span>
      <span class="color-btn-bar" id="bg-bar"></span>
    </button>
    <button class="color-arrow-btn" id="open-bg-picker" title="Escolher cor de fundo">▾</button>
  `;
}

// =====================================
// FIX QUILL TOOLBAR FOCUS
// =====================================

const toolbar = document.querySelector(".ql-toolbar");

// elementos que NÃO devem roubar foco do editor
const keepEditorFocusSelectors = [
  "button",
  ".tab",
  ".close-tab",
  "#topbar",
  "#actions",
  "#tabs-wrapper",
  ".statusbar",
  ".color-item",
];

// impede perda de cursor
document.addEventListener("mousedown", (e) => {
  // se clicou em input REAL → deixa focar normalmente
  if (
    e.target.closest("input") ||
    e.target.closest("textarea") ||
    e.target.closest(".tab-title[contenteditable='true']") ||
    e.target.closest(".replace-popup") ||
    e.target.closest(".export-popup")
  ) {
    return;
  }

  // elementos decorativos/UI
  const shouldKeepFocus = keepEditorFocusSelectors.some((selector) =>
    e.target.closest(selector),
  );

  if (!shouldKeepFocus) return;

  // salva posição atual
  const range = quill.getSelection();

  // impede blur do editor
  e.preventDefault();

  // restaura cursor imediatamente
  requestAnimationFrame(() => {
    quill.focus();

    if (range) {
      quill.setSelection(range, "silent");
    }
  });
});

// impede toolbar de roubar foco do editor
toolbar.addEventListener("mousedown", (e) => {
  const button = e.target.closest("button");

  if (!button) return;

  // PERMITE O BOTÃO ...
  if (button.classList.contains("toolbar-more")) {
    return;
  }

  e.preventDefault();
});

// =====================================
// TOOLTIP TOOLBAR QUILL
// =====================================

const tooltips = {
  bold: "Negrito",
  italic: "Itálico",
  underline: "Sublinhado",
  strike: "Riscado",
  link: "Inserir link",
  "code-block": "Bloco de código",
  clean: "Limpar formatação",
  undo: "Desfazer (Ctrl+Z)",
  redo: "Refazer (Ctrl+Shift+Z)",
  uppercase: "Transformar em MAIÚSCULO",
  lowercase: "Transformar em minúsculo",
  capitalize: "Primeira letra maiúscula",
};

document.querySelectorAll(".ql-toolbar button").forEach((btn) => {
  const cls = Array.from(btn.classList).find((c) => c.startsWith("ql-"));

  if (!cls) return;

  const key = cls.replace("ql-", "");

  if (tooltips[key]) {
    btn.title = tooltips[key];
  }
});

// =====================================
// UPDATE COLOR UI
// =====================================

function updateColorUI() {
  const colorBar = document.getElementById("color-bar");
  const bgBar = document.getElementById("bg-bar");
  if (colorBar) colorBar.style.background = state.lastColor;
  if (bgBar) bgBar.style.background = state.lastBackground;
}

// =====================================
// CUSTOM COLOR PICKER
// =====================================

const colorPopup = document.getElementById("color-popup");

const colorGrid = document.getElementById("color-grid");

const recentColorsEl = document.getElementById("recent-colors");

const hiddenColorPicker = document.getElementById("hidden-color-picker");

let currentColorMode = "color";

// =====================================
// CREATE GRID
// =====================================

function renderColorGrid() {
  colorGrid.innerHTML = "";

  OFFICE_COLORS.forEach((color) => {
    const item = document.createElement("div");

    item.className = "color-item";

    item.style.background = color;

    item.addEventListener("click", () => {
      applyColor(color);
    });

    colorGrid.appendChild(item);
  });
}

// =====================================
// RECENTS
// =====================================

function renderRecentColors() {
  recentColorsEl.innerHTML = "";
  const recent =
    currentColorMode === "color" ? state.recentColors : state.recentBackgrounds;

  if (recent.length === 0) {
    // ADICIONE ISSO:
    recentColorsEl.innerHTML =
      '<span style="font-size:11px;opacity:0.45;">Nenhuma cor recente</span>';
    return;
  }

  recent.slice(0, 10).forEach((color) => {
    const item = document.createElement("div");
    item.className = "color-item";
    item.style.background = color;
    item.addEventListener("click", () => applyColor(color));
    recentColorsEl.appendChild(item);
  });
}

// =====================================
// APPLY
// =====================================

function applyColor(color) {
  if (savedSelection) quill.setSelection(savedSelection);
  if (currentColorMode === "color") {
    quill.format("color", color, "user");

    state.lastColor = color;

    if (!state.recentColors.includes(color)) {
      state.recentColors.unshift(color);
    }
  } else {
    quill.format("background", color, "user");

    state.lastBackground = color;

    if (!state.recentBackgrounds.includes(color)) {
      state.recentBackgrounds.unshift(color);
    }
  }

  updateColorUI();

  saveState();

  colorPopup.classList.add("hidden");
}

// =====================================
// OPEN POPUP
// =====================================

let savedSelection = null;

function setupCustomColorPickers() {
  // ── BOTÃO ESQUERDO (aplicar) ──────────────────────────────
  // Usa mousedown + stopPropagation para evitar que o Quill
  // receba o evento e resete a cor depois do nosso handler
  document
    .getElementById("apply-color-btn")
    .addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const sel = quill.getSelection();
      if (sel !== null) {
        quill.format("color", state.lastColor, "user");
      }
    });
  document.getElementById("apply-color-btn").addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation(); // impede o Quill de agir no click também
  });

  document.getElementById("apply-bg-btn").addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const sel = quill.getSelection();
    if (sel !== null) {
      quill.format("background", state.lastBackground, "user");
    }
  });
  document.getElementById("apply-bg-btn").addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  // ── BOTÃO DIREITO (seta / dropdown) ──────────────────────
  function openPopup(e, mode) {
    e.preventDefault();
    e.stopPropagation();
    savedSelection = quill.getSelection();
    currentColorMode = mode;
    renderColorGrid();
    renderRecentColors();
    const rect = e.currentTarget.getBoundingClientRect();
    colorPopup.style.left = rect.left + "px";
    colorPopup.style.top = rect.bottom + 8 + "px";
    colorPopup.classList.remove("hidden");
  }

  document
    .getElementById("open-color-picker")
    .addEventListener("mousedown", (e) => openPopup(e, "color"));
  document
    .getElementById("open-color-picker")
    .addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

  document
    .getElementById("open-bg-picker")
    .addEventListener("mousedown", (e) => openPopup(e, "background"));
  document.getElementById("open-bg-picker").addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
}

// =====================================
// CLEAR
// =====================================

document.querySelector(".color-clear").addEventListener("click", () => {
  if (currentColorMode === "color") {
    quill.format("color", false, "user");
  } else {
    quill.format("background", false, "user");
  }

  colorPopup.classList.add("hidden");
});

// =====================================
// CUSTOM COLOR
// =====================================

document.getElementById("custom-color-btn").addEventListener("click", () => {
  hiddenColorPicker.click();
});

hiddenColorPicker.addEventListener("input", (e) => {
  applyColor(e.target.value);
});

// =====================================
// CLOSE OUTSIDE
// =====================================

document.addEventListener("mousedown", (e) => {
  if (
    !e.target.closest(".color-popup") &&
    !e.target.closest(".ql-color") &&
    !e.target.closest(".ql-background")
  ) {
    colorPopup.classList.add("hidden");
  }
});

// =====================================
// SHORTCUTS
// =====================================

// =====================================
// TEXT TRANSFORM
// =====================================

function transformText(type) {
  const range = quill.getSelection();

  if (!range || range.length === 0) return;

  const text = quill.getText(range.index, range.length);

  let transformed = text;

  // =====================================
  // TRANSFORM
  // =====================================

  if (type === "upper") {
    transformed = text.toUpperCase();
  }

  if (type === "lower") {
    transformed = text.toLowerCase();
  }

  if (type === "capitalize") {
    transformed = text.replace(/\b\w/g, (l) => l.toUpperCase());
  }

  // =====================================
  // PRESERVA FORMATAÇÃO
  // =====================================

  const formats = quill.getFormat(range.index, range.length);

  quill.deleteText(range.index, range.length, "user");

  quill.insertText(range.index, transformed, formats, "user");

  quill.setSelection(range.index, transformed.length);
}

// =====================================
// SPELL CHECK CONTEXT MENU
// =====================================

// ==========================
// LOAD
// ==========================

async function loadState() {
  try {
    const saved = await window.electronAPI.loadData();

    if (saved) {
      state = {
        theme: saved.theme || "dark",
        currentTab: typeof saved.currentTab === "number" ? saved.currentTab : 0,
        tabs: Array.isArray(saved.tabs) ? saved.tabs : [],
        lastColor: saved.lastColor || "#000000",
        lastBackground: saved.lastBackground || "#ffff00",
        recentColors: Array.isArray(saved.recentColors)
          ? saved.recentColors
          : [],
        recentBackgrounds: Array.isArray(saved.recentBackgrounds)
          ? saved.recentBackgrounds
          : [],
      };
    }
  } catch (err) {
    console.error(err);
  }

  // GARANTE TABS

  if (!Array.isArray(state.tabs) || !state.tabs.length) {
    state.tabs = [
      {
        title: "Nota 1",

        content: {
          ops: [],
        },

        cursor: 0,
      },
    ];
  }

  // GARANTE CONTENT

  state.tabs = state.tabs.map((tab) => ({
    title: tab.title || "Sem título",

    content: tab.content || { ops: [] },

    cursor: typeof tab.cursor === "number" ? tab.cursor : 0,
  }));

  // GARANTE INDEX

  if (state.currentTab >= state.tabs.length) {
    state.currentTab = 0;
  }

  document.body.className = state.theme;

  updateThemeIcon();

  renderTabs();

  loadCurrentTab();

  quill.focus();

  updateColorUI();
}

// ==========================
// SAVE
// ==========================

async function saveState() {
  try {
    await window.electronAPI.saveData(state);
  } catch (err) {
    console.error(err);
  }
}
// =====================================
// SAVE CURSOR POSITION
// =====================================

quill.on("selection-change", (range) => {
  if (!range) return;

  const currentTab = state.tabs[state.currentTab];

  if (!currentTab) return;

  currentTab.cursor = range.index;
});
// ==========================
// SAVE CURRENT TAB
// ==========================

function saveCurrentTab() {
  if (!state.tabs[state.currentTab]) return;

  state.tabs[state.currentTab].content = quill.getContents();
}

// ==========================
// LOAD CURRENT TAB
// ==========================

function loadCurrentTab() {
  const tab = state.tabs[state.currentTab];

  if (!tab) return;

  quill.setContents(tab.content || { ops: [] });

  const cursorPos = typeof tab.cursor === "number" ? tab.cursor : 0;

  // espera o Quill terminar de renderizar COMPLETAMENTE
  setTimeout(() => {
    const max = Math.max(0, quill.getLength() - 1);

    const finalPos = Math.min(cursorPos, max);

    quill.setSelection(finalPos, 0, "silent");

    quill.focus();
    updateStatusBar();
  }, 0);
}

// ==========================
// RENDER TABS
// ==========================

function renderTabs() {
  tabsEl.innerHTML = "";

  state.tabs.forEach((tabData, index) => {
    const tab = document.createElement("div");

    tab.className = "tab";

    if (index === state.currentTab) {
      tab.classList.add("active");
    }

    // TITLE

    const title = document.createElement("div");

    title.className = "tab-title";

    title.contentEditable = false;

    title.innerText = tabData.title;
    title.title = tabData.title;

    // EVITA SELECIONAR ABA ENQUANTO EDITA

    title.addEventListener("click", (e) => {
      if (title.isContentEditable) {
        e.stopPropagation();
      }
    });

    // CLOSE

    const close = document.createElement("div");

    close.className = "close-tab";

    close.innerText = "✕";
    close.title = "Fechar aba";

    close.addEventListener("click", async (e) => {
      e.stopPropagation();

      if (state.tabs.length === 1) {
        return;
      }

      // CONFIRMAÇÃO

      const confirmed = confirm(
        `Deseja realmente fechar a aba "${tabData.title}"?`,
      );

      if (!confirmed) {
        return;
      }

      // REMOVE

      state.tabs.splice(index, 1);

      // AJUSTA CURRENT TAB

      if (state.currentTab >= state.tabs.length) {
        state.currentTab = state.tabs.length - 1;
      }

      // RENDER

      renderTabs();

      loadCurrentTab();
      quill.focus();

      await saveState();
    });

    // =====================================
    // CLICK / DOUBLE CLICK
    // =====================================

    let clickTimer = null;
    let isEditing = false;

    // CLICK = TROCAR ABA
    tab.addEventListener("click", async (e) => {
      if (isEditing) return;

      clearTimeout(clickTimer);

      clickTimer = setTimeout(async () => {
        // salva cursor da aba atual
        const range = quill.getSelection();

        if (range && state.tabs[state.currentTab]) {
          state.tabs[state.currentTab].cursor = range.index;
        }

        saveCurrentTab();

        state.currentTab = index;

        renderTabs();

        loadCurrentTab();
        quill.focus();

        await saveState();
      }, 10);
    });

    // DOUBLE CLICK = EDITAR
    title.addEventListener("dblclick", (e) => {
      e.stopPropagation();

      clearTimeout(clickTimer);

      isEditing = true;

      title.contentEditable = true;

      title.focus();

      // DESABILITA DRAG
      tab.draggable = false;

      // CURSOR NO FINAL
      const range = document.createRange();

      range.selectNodeContents(title);

      range.collapse(false);

      const selection = window.getSelection();

      selection.removeAllRanges();

      selection.addRange(range);
    });

    // FINALIZA EDIÇÃO
    title.addEventListener("blur", async () => {
      isEditing = false;

      title.contentEditable = false;

      tab.draggable = true;

      // nome digitado
      let newTitle = title.innerText.trim() || "Sem título";

      // remove a própria aba da comparação
      const existing = state.tabs
        .filter((_, i) => i !== index)
        .map((t) => t.title);

      // função local pra evitar conflito
      function makeUnique(name) {
        if (!existing.includes(name)) {
          return name;
        }

        let counter = 1;

        while (existing.includes(`${name} (${counter})`)) {
          counter++;
        }

        return `${name} (${counter})`;
      }

      newTitle = makeUnique(newTitle);

      tabData.title = newTitle;

      title.innerText = newTitle;

      title.title = newTitle;

      await saveState();
    });

    // ENTER FINALIZA
    title.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        e.preventDefault();

        title.blur();
      }
    });
    /////////////////////////////////////////////////////
    tab.appendChild(title);

    tab.appendChild(close);

    tabsEl.appendChild(tab);
  });
}

// =====================================
// UNIQUE TAB NAME
// =====================================

function getUniqueTabName(baseName) {
  const existing = state.tabs.map((t) => t.title);

  // se não existir igual
  if (!existing.includes(baseName)) {
    return baseName;
  }

  let counter = 1;

  while (existing.includes(`${baseName} (${counter})`)) {
    counter++;
  }

  return `${baseName} (${counter})`;
}

// ==========================
// ADD TAB
// ==========================

addTabBtn.addEventListener("click", async () => {
  saveCurrentTab();

  state.tabs.push({
    title: getUniqueTabName(`Nota ${state.tabs.length + 1}`),

    content: {
      ops: [],
    },

    cursor: 0,
  });

  state.currentTab = state.tabs.length - 1;

  renderTabs();

  loadCurrentTab();
  quill.focus();

  await saveState();
});

// ==========================
// QUILL AUTOSAVE
// ==========================

quill.on("text-change", async () => {
  saveCurrentTab();

  await saveState();
});

// ==========================
// THEME
// ==========================

const themeIcon = document.querySelector(".theme-icon");

function updateThemeIcon() {
  themeIcon.textContent = state.theme === "dark" ? "☀" : "🌙";
}

themeBtn.addEventListener("click", async () => {
  themeBtn.classList.add("animate");

  setTimeout(() => {
    themeBtn.classList.remove("animate");
  }, 400);

  state.theme = state.theme === "dark" ? "light" : "dark";

  document.body.className = state.theme;

  updateThemeIcon();

  await saveState();
});

// ==========================
// SEARCH
// ==========================

searchEl.addEventListener("input", () => {
  const value = searchEl.value.toLowerCase();

  document.querySelectorAll(".tab").forEach((tab, index) => {
    const visible = state.tabs[index].title.toLowerCase().includes(value);

    tab.style.display = visible ? "flex" : "none";
  });
});

// =====================================
// EXPORT POPUP
// =====================================

const exportPopup = document.getElementById("export-popup");
const closeExport = document.getElementById("close-export");
const exportTxtBtn = document.getElementById("export-txt");
const exportPdfBtn = document.getElementById("export-pdf");

exportBtn.onclick = () => {
  exportPopup.classList.remove("hidden");
};

closeExport.onclick = () => {
  exportPopup.classList.add("hidden");
};

// TXT

exportTxtBtn.onclick = () => {
  const current = state.tabs[state.currentTab];
  const text = quill.getText();
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${current.title}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  exportPopup.classList.add("hidden");
};

// =====================================
// PDF CORRIGIDO
// =====================================

exportPdfBtn.onclick = () => {
  const current = state.tabs[state.currentTab];

  // =====================================
  // CLONE + FIX CHECKLIST
  // =====================================

  const clone = document.createElement("div");

  clone.innerHTML = quill.root.innerHTML;

  clone.style.padding = "20px";
  clone.style.background = "#fff";
  clone.style.color = "#000";

  // 🔥 CONVERTE CHECKLIST DO QUILL
  // =====================================
  // 🔥 FIX TOTAL LISTAS (CHECK + BULLET)
  // =====================================

  clone.querySelectorAll("li").forEach((li, i) => {
    const type = li.getAttribute("data-list");

    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "flex-start";
    wrapper.style.gap = "8px";
    wrapper.style.marginBottom = "4px";

    const prefix = document.createElement("span");

    // =====================
    // CHECKLIST
    // =====================
    const isChecked = type === "checked";

    if (type === "checked" || type === "unchecked") {
      prefix.innerText = isChecked ? "✔" : "☐";
      prefix.style.color = isChecked ? "green" : "#000000";
      prefix.style.fontWeight = "bold";
    }

    const textEl = document.createElement("span");
    textEl.innerHTML = li.innerHTML;

    if (isChecked) {
      textEl.style.textDecoration = "line-through";
      textEl.style.opacity = "0.6";
    }

    // =====================
    // BULLET (🔥 CORRETO)
    // =====================
    else if (type === "bullet") {
      prefix.innerText = "•";
      prefix.style.fontWeight = "bold";
    }

    // =====================
    // ORDERED
    // =====================
    else if (type === "ordered") {
      // pega índice dentro da lista pai
      const parent = li.parentNode;
      const items = Array.from(parent.children);
      const index = items.indexOf(li) + 1;

      prefix.innerText = index + ".";
    }

    const text = document.createElement("span");
    text.innerHTML = li.innerHTML;

    // checklist riscado
    if (type === "checked") {
      text.style.textDecoration = "line-through";
      text.style.opacity = "0.6";
    }

    wrapper.appendChild(prefix);
    wrapper.appendChild(textEl);

    li.parentNode.insertBefore(wrapper, li);
    li.remove();
  });

  // evita quebra feia
  clone.querySelectorAll("p, li, h1, h2, h3").forEach((el) => {
    const wrap = document.createElement("div");
    wrap.style.pageBreakInside = "avoid";

    el.parentNode.insertBefore(wrap, el);
    wrap.appendChild(el);
  });

  const opt = {
    margin: 10,
    filename: `${current.title}.pdf`,
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4" },
    pagebreak: { mode: ["avoid-all"] },
  };

  html2pdf().set(opt).from(clone).save();

  exportPopup.classList.add("hidden");
};

// ==========================
// IMPORT
// ==========================

importBtn.addEventListener("click", () => {
  importFile.accept = ".txt";

  importFile.click();
});

importFile.addEventListener("change", async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = async () => {
    const text = reader.result;

    // SALVA ABA ATUAL ANTES
    saveCurrentTab();

    // NOME DO ARQUIVO SEM .txt
    const fileName = getUniqueTabName(file.name.replace(/\.[^/.]+$/, ""));

    // NOVA ABA
    state.tabs.push({
      title: fileName || `Nota ${state.tabs.length + 1}`,

      content: {
        ops: [
          {
            insert: text,
          },
        ],
      },
    });

    // MUDA PRA NOVA ABA
    state.currentTab = state.tabs.length - 1;

    // RENDER
    renderTabs();

    loadCurrentTab();
    quill.focus();

    await saveState();

    // limpa input pra permitir importar mesmo arquivo novamente
    importFile.value = "";
  };

  reader.readAsText(file);
});

// ==========================
// BEFORE CLOSE
// ==========================
window.addEventListener("beforeunload", async () => {
  // salva conteúdo atual
  saveCurrentTab();

  // pega posição REAL do cursor no momento exato do fechamento
  const range = quill.getSelection();

  if (range && state.tabs[state.currentTab]) {
    state.tabs[state.currentTab].cursor = range.index;
  }

  // força persistência final
  await saveState();
});

// =====================================
// DRAG TABS
// =====================================

new Sortable(tabsEl, {
  animation: 150,

  ghostClass: "dragging-tab",

  draggable: ".tab",

  onEnd: async (evt) => {
    // MOVE TAB NO ARRAY

    const moved = state.tabs.splice(evt.oldIndex, 1)[0];

    state.tabs.splice(evt.newIndex, 0, moved);

    // AJUSTA CURRENT TAB

    if (state.currentTab === evt.oldIndex) {
      state.currentTab = evt.newIndex;
    } else {
      if (evt.oldIndex < state.currentTab && evt.newIndex >= state.currentTab) {
        state.currentTab--;
      } else if (
        evt.oldIndex > state.currentTab &&
        evt.newIndex <= state.currentTab
      ) {
        state.currentTab++;
      }
    }

    renderTabs();

    await saveState();
  },
});

// =====================================
// REPLACE SYSTEM
// =====================================

const replacePopup = document.getElementById("replace-popup");

const findInput = document.getElementById("find-input");
const replaceInput = document.getElementById("replace-input");
const caseSensitive = document.getElementById("case-sensitive");
const replaceBtn = document.getElementById("replace-btn");
const replaceAllBtn = document.getElementById("replace-all");
findInput.addEventListener("input", () => {
  lastFindIndex = 0;
});
const closeReplace = document.getElementById("close-replace");

// ABRIR (CTRL + H)

function openReplacePopup() {
  replacePopup.classList.remove("hidden");

  findInput.focus();
}

// botão
replaceBtn.addEventListener("click", () => {
  openReplacePopup();
});

// atalho
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "h") {
    e.preventDefault();

    openReplacePopup();
  }
});

// FECHAR

closeReplace.onclick = () => {
  replacePopup.classList.add("hidden");
};

// =====================================
// FIND NEXT
// =====================================

const findNextBtn = document.getElementById("find-next");

let lastFindIndex = 0;

findNextBtn.onclick = () => {
  const find = findInput.value;

  if (!find) return;

  const flags = caseSensitive.checked ? "g" : "gi";

  try {
    const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(escapeRegex(find), flags);

    const text = quill.getText();

    regex.lastIndex = lastFindIndex;

    const match = regex.exec(text);

    // encontrou
    if (match) {
      const index = match.index;

      quill.setSelection(index, match[0].length, "user");

      quill.scrollIntoView();

      lastFindIndex = index + match[0].length;
    }

    // reinicia busca
    else {
      lastFindIndex = 0;

      const restartMatch = regex.exec(text);

      if (restartMatch) {
        quill.setSelection(restartMatch.index, restartMatch[0].length, "user");

        quill.scrollIntoView();

        lastFindIndex = restartMatch.index + restartMatch[0].length;
      }
    }
  } catch (err) {
    console.error("Erro find:", err);
  }
};

// SUBSTITUIR TUDO

// =====================================
// REPLACE ALL (MANTÉM FORMATAÇÃO PERFEITA)
// =====================================

replaceAllBtn.onclick = () => {
  const find = findInput.value;
  const replace = replaceInput.value;

  if (!find) return;

  const flags = caseSensitive.checked ? "g" : "gi";

  try {
    const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(escapeRegex(find), flags);

    const text = quill.getText();

    let match;

    const matches = [];

    // 🔍 encontrar ocorrências
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
      });
    }

    // 🔥 processar de trás pra frente
    for (let i = matches.length - 1; i >= 0; i--) {
      const m = matches[i];

      // 🧠 pega formatação EXATA do início
      const formats = quill.getFormat(m.index, m.length);

      // remove texto antigo
      quill.deleteText(m.index, m.length, "user");

      // insere novo texto COM FORMATAÇÃO
      quill.insertText(m.index, replace, formats, "user");
    }
  } catch (err) {
    console.error("Erro replace:", err);
  }
};

// =====================================
// DRAG + SNAP + LIMIT + SAVE
// =====================================

const popup = document.getElementById("replace-popup");
const dragHandle = document.getElementById("replace-drag");

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

// DRAG START

dragHandle.addEventListener("mousedown", (e) => {
  isDragging = true;

  const rect = popup.getBoundingClientRect();

  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  popup.style.transform = "none";
});

// DRAG MOVE

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const width = popup.offsetWidth;
  const height = popup.offsetHeight;

  let left = e.clientX - offsetX;
  let top = e.clientY - offsetY;

  // LIMITES DA TELA

  left = Math.max(0, Math.min(window.innerWidth - width, left));
  top = Math.max(0, Math.min(window.innerHeight - height, top));

  // SNAP

  const SNAP = 20;

  if (left < SNAP) left = 0;
  if (top < SNAP) top = 0;

  if (left + width > window.innerWidth - SNAP) {
    left = window.innerWidth - width;
  }

  if (top + height > window.innerHeight - SNAP) {
    top = window.innerHeight - height;
  }

  popup.style.left = left + "px";
  popup.style.top = top + "px";
});

// DRAG END

document.addEventListener("mouseup", async () => {
  if (!isDragging) return;

  isDragging = false;

  // SAVE POSITION
});
// ==========================
// AUTO SAVE
// ==========================

setInterval(async () => {
  saveCurrentTab();

  await saveState();
}, 1000);

// =====================================
// APP VERSION TITLE
// =====================================

async function updateAppTitle() {
  const version = await window.electronAPI.getVersion();

  document.title = `Notas Independente - v${version}`;
}

updateAppTitle();

// =====================================
// UPDATE UI
// =====================================
const updateOverlay = document.getElementById("update-overlay");
const updateTitle = document.getElementById("update-title");
const updateSubtitle = document.getElementById("update-subtitle");
const updatePercent = document.getElementById("update-percent");
const updateProgressBar = document.getElementById("update-progress-bar");
const updateActions = document.getElementById("update-actions");
const updateIcon = document.getElementById("update-icon");

window.electronAPI.onUpdateAvailable((version) => {
  updateTitle.textContent = `Nova versão v${version} disponível`;
  updateSubtitle.textContent = "Baixando atualização...";
  updateOverlay.classList.remove("hidden");
});

window.electronAPI.onUpdateProgress((percent) => {
  updateProgressBar.style.width = percent + "%";
  updatePercent.textContent = percent + "%";
});

window.electronAPI.onUpdateDownloaded(() => {
  updateIcon.textContent = "✅";
  updateTitle.textContent = "Atualização pronta!";
  updateSubtitle.textContent = "";
  updatePercent.textContent = "";
  document.getElementById("update-progress-wrap").classList.add("hidden");
  updateActions.classList.remove("hidden");
});

document.getElementById("update-restart-btn").addEventListener("click", () => {
  window.electronAPI.restartApp();
});

document.getElementById("update-later-btn").addEventListener("click", () => {
  updateOverlay.classList.add("hidden");
});

// =====================================
// QUILL TOOLBAR RESPONSIVE
// =====================================

function initResponsiveToolbar() {
  const toolbar = document.querySelector(".ql-toolbar");

  if (!toolbar) return;

  // evita duplicar
  if (toolbar.dataset.responsiveReady) return;

  toolbar.dataset.responsiveReady = "true";

  // botão
  const moreBtn = document.createElement("button");

  moreBtn.className = "toolbar-more";

  moreBtn.innerHTML = "⋯";

  // dropdown
  const dropdown = document.createElement("div");

  dropdown.className = "toolbar-dropdown";

  toolbar.appendChild(moreBtn);

  toolbar.appendChild(dropdown);

  // grupos originais
  const groups = [...toolbar.querySelectorAll(".ql-formats")];

  function update() {
    // devolve tudo
    groups.forEach((group) => {
      toolbar.insertBefore(group, moreBtn);
    });

    dropdown.innerHTML = "";

    moreBtn.style.display = "none";

    const toolbarRect = toolbar.getBoundingClientRect();

    const limit = toolbarRect.right - 50;

    let collision = false;

    groups.forEach((group) => {
      const rect = group.getBoundingClientRect();

      // PRIMEIRA COLISÃO REAL
      if (rect.right > limit || collision) {
        collision = true;

        dropdown.appendChild(group);

        moreBtn.style.display = "flex";
      }
    });

    // fecha se vazio
    if (!dropdown.children.length) {
      dropdown.classList.remove("show");
    }
  }

  // toggle
  moreBtn.addEventListener("mousedown", (e) => {
    e.stopPropagation();

    dropdown.classList.toggle("show");
  });

  // fechar fora
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && !moreBtn.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });

  // resize
  window.addEventListener("resize", () => {
    requestAnimationFrame(update);
  });

  // primeira render
  setTimeout(update, 200);
}

initResponsiveToolbar();

// =====================================
// STATUS BAR
// =====================================

const cursorPosEl = document.getElementById("cursor-pos");
const charCountEl = document.getElementById("char-count");
const wordCountEl = document.getElementById("word-count");

function updateStatusBar() {
  const range = quill.getSelection();

  // POSIÇÃO CURSOR
  if (range) {
    const textBefore = quill.getText(0, range.index);

    const lines = textBefore.split("\n");

    const line = lines.length;

    const col = lines[lines.length - 1].length + 1;

    cursorPosEl.textContent = `Ln ${line}, Col ${col}`;
  }

  // TEXTO TOTAL
  const text = quill.getText().trim();

  // CARACTERES
  charCountEl.textContent = `${text.length} caracteres`;

  // PALAVRAS
  const words = text ? text.split(/\s+/).length : 0;

  wordCountEl.textContent = `${words} palavras`;
}

// CURSOR
quill.on("selection-change", () => {
  updateStatusBar();
});

// TEXTO
quill.on("text-change", () => {
  updateStatusBar();
});

// =====================================
// PERSISTENT EDITOR FOCUS
// =====================================
/*
let lastRange = null;

// salva última posição válida
quill.on("selection-change", (range) => {
  if (range) {
    lastRange = range;
  }
});

// elementos que PODEM roubar foco
function isAllowedFocusTarget(el) {
  if (!el) return false;

  return (
    el.closest(".tab-title") ||
    el.closest("input") ||
    el.closest("textarea") ||
    el.closest(".ql-picker-options") ||
    el.closest(".color-popup") ||
    el.closest(".replace-popup") ||
    el.closest(".export-popup")
  );
}

// restaura foco automaticamente
document.addEventListener("mousedown", (e) => {
  // editor mantém foco
  if (isAllowedFocusTarget(e.target)) {
    return;
  }

  // espera click terminar
  requestAnimationFrame(() => {
    // se já focou algo válido
    const active = document.activeElement;

    if (isAllowedFocusTarget(active)) {
      return;
    }

    // restaura cursor
    quill.focus();

    if (lastRange) {
      quill.setSelection(lastRange, "silent");
    }
  });
});
*/
// =====================================
// GLOBAL SHORTCUT -> NEW TAB
// =====================================

window.electronAPI.onNewTabShortcut(() => {
  addTabBtn.click();
});

// ==========================
// INIT
// ==========================

loadState();
updateColorUI();
setupCustomColorPickers();

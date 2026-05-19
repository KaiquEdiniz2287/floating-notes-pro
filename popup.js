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

        [
          {
            color: [
              false,

              "#ffffff",
              "#f9fafb",
              "#f3f4f6",
              "#e5e7eb",
              "#d1d5db",

              "#000000",
              "#111827",
              "#1f2937",
              "#374151",
              "#4b5563",
              "#6b7280",
              "#9ca3af",
              "#d1d5db",
              "#e5e7eb",
              "#f9fafb",

              "#fee2e2",
              "#fecaca",
              "#fca5a5",
              "#ffedd5",
              "#fed7aa",
              "#fdba74",
              "#fef9c3",
              "#fef08a",
              "#fde047",
              "#dcfce7",
              "#bbf7d0",
              "#86efac",
              "#cffafe",
              "#a5f3fc",
              "#67e8f9",
              "#dbeafe",
              "#bfdbfe",
              "#93c5fd",
              "#ede9fe",
              "#ddd6fe",
              "#c4b5fd",
              "#fce7f3",
              "#fbcfe8",
              "#f9a8d4",

              "#ef4444",
              "#dc2626",
              "#b91c1c",
              "#f97316",
              "#ea580c",
              "#c2410c",
              "#eab308",
              "#ca8a04",
              "#a16207",
              "#22c55e",
              "#16a34a",
              "#15803d",
              "#06b6d4",
              "#0891b2",
              "#0e7490",
              "#3b82f6",
              "#2563eb",
              "#1d4ed8",
              "#8b5cf6",
              "#7c3aed",
              "#6d28d9",
              "#ec4899",
              "#db2777",
              "#be185d",
            ],
          },
        ],
        [
          {
            background: [
              false,

              "#ffffff",
              "#f9fafb",
              "#f3f4f6",
              "#e5e7eb",
              "#d1d5db",

              "#000000",
              "#111827",
              "#1f2937",
              "#374151",
              "#4b5563",
              "#6b7280",
              "#9ca3af",
              "#d1d5db",
              "#e5e7eb",
              "#f9fafb",

              "#fee2e2",
              "#fecaca",
              "#fca5a5",
              "#ffedd5",
              "#fed7aa",
              "#fdba74",
              "#fef9c3",
              "#fef08a",
              "#fde047",
              "#dcfce7",
              "#bbf7d0",
              "#86efac",
              "#cffafe",
              "#a5f3fc",
              "#67e8f9",
              "#dbeafe",
              "#bfdbfe",
              "#93c5fd",
              "#ede9fe",
              "#ddd6fe",
              "#c4b5fd",
              "#fce7f3",
              "#fbcfe8",
              "#f9a8d4",

              "#ef4444",
              "#dc2626",
              "#b91c1c",
              "#f97316",
              "#ea580c",
              "#c2410c",
              "#eab308",
              "#ca8a04",
              "#a16207",
              "#22c55e",
              "#16a34a",
              "#15803d",
              "#06b6d4",
              "#0891b2",
              "#0e7490",
              "#3b82f6",
              "#2563eb",
              "#1d4ed8",
              "#8b5cf6",
              "#7c3aed",
              "#6d28d9",
              "#ec4899",
              "#db2777",
              "#be185d",
            ],
          },
        ],

        [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],

        ["code-block"],

        ["link"],

        ["clean"],

        ["undo", "redo"],
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
      },
    },
  },
});

// =====================================
// FIX QUILL TOOLBAR FOCUS
// =====================================

const toolbar = document.querySelector(".ql-toolbar");

// impede toolbar de roubar foco do editor
toolbar.addEventListener("mousedown", (e) => {
  const button = e.target.closest("button");

  // só botões normais
  if (!button) return;

  e.preventDefault();
});

// PICKERS
document.querySelectorAll(".ql-picker-label").forEach((label) => {
  label.addEventListener("mousedown", (e) => {
    e.preventDefault();
  });
});

document.querySelectorAll(".ql-picker-item").forEach((item) => {
  item.addEventListener("mousedown", (e) => {
    e.preventDefault();
  });
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
  redo: "Refazer (Ctrl+Y)",
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
  const colorBtn = document.querySelector(
    ".ql-color .ql-picker-label div div:first-child",
  );

  const bgBtn = document.querySelector(
    ".ql-background .ql-picker-label div div:first-child",
  );

  if (colorBtn) {
    colorBtn.style.borderBottom = `3px solid ${state.lastColor}`;
  }

  if (bgBtn) {
    bgBtn.style.borderBottom = `3px solid ${state.lastBackground}`;
  }
}

// =====================================
// SPLIT BUTTON COLOR (WORD STYLE)
// =====================================

function setupSplitColorButtons() {
  createSplit(".ql-color", "color");
  createSplit(".ql-background", "background");
}

// fecha dropdown ao clicar fora
document.addEventListener("mousedown", (e) => {
  if (!e.target.closest(".ql-picker")) {
    document
      .querySelectorAll(".ql-picker")
      .forEach((p) => p.classList.remove("ql-expanded"));
  }
});

function createSplit(selector, format) {
  const picker = document.querySelector(selector);
  if (!picker) return;

  const label = picker.querySelector(".ql-picker-label");

  // 🔥 remove comportamento padrão do Quill
  label.setAttribute("data-value", "");
  label.innerHTML = "";

  // wrapper
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.width = "100%";

  // =====================
  // ESQUERDA (APLICAR COR)
  // =====================
  const action = document.createElement("div");
  action.style.flex = "1";
  action.style.cursor = "pointer";
  action.style.padding = "0 6px";
  action.style.display = "flex";
  action.style.alignItems = "center";
  action.style.justifyContent = "center";

  action.innerHTML = "A";

  action.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (format === "color") {
      quill.format("color", state.lastColor, "user");
    } else {
      quill.format("background", state.lastBackground, "user");
    }
  });

  // =====================
  // DIREITA (SETA)
  // =====================
  const arrow = document.createElement("div");
  arrow.style.width = "18px";
  arrow.style.cursor = "pointer";
  arrow.style.textAlign = "center";
  arrow.innerHTML = "▼";

  arrow.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isOpen = picker.classList.contains("ql-expanded");

    // fecha todos
    document
      .querySelectorAll(".ql-picker")
      .forEach((p) => p.classList.remove("ql-expanded"));

    // abre só esse
    if (!isOpen) {
      picker.classList.add("ql-expanded");
    }
  });

  wrapper.appendChild(action);
  wrapper.appendChild(arrow);
  label.appendChild(wrapper);

  // 🔥 impedir Quill de abrir no click padrão
  label.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
}

// =====================================
// SHORTCUTS
// =====================================

document.addEventListener("keydown", (e) => {
  // CTRL + Z

  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
    e.preventDefault();

    quill.history.undo();
  }

  // CTRL + Y
  // CTRL + SHIFT + Z

  if (
    ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") ||
    ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")
  ) {
    e.preventDefault();

    quill.history.redo();
  }
});

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
      },
    ];
  }

  // GARANTE CONTENT

  state.tabs = state.tabs.map((tab) => ({
    title: tab.title || "Sem título",

    content: tab.content || { ops: [] },
  }));

  // GARANTE INDEX

  if (state.currentTab >= state.tabs.length) {
    state.currentTab = 0;
  }

  document.body.className = state.theme;

  updateThemeIcon();

  renderTabs();

  loadCurrentTab();

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
        saveCurrentTab();

        state.currentTab = index;

        renderTabs();

        loadCurrentTab();

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

      tabData.title = title.innerText.trim() || "Sem título";

      title.innerText = tabData.title;

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

// ==========================
// ADD TAB
// ==========================

addTabBtn.addEventListener("click", async () => {
  saveCurrentTab();

  state.tabs.push({
    title: `Nota ${state.tabs.length + 1}`,

    content: {
      ops: [],
    },
  });

  state.currentTab = state.tabs.length - 1;

  renderTabs();

  loadCurrentTab();

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
  const text = quill.getText();

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "nota.txt";
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
      prefix.style.color = isChecked ? "green" : "#555";
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

    // IMPORTA COMO TEXTO

    quill.setText(text);

    // SALVA NA ABA ATUAL

    saveCurrentTab();

    await saveState();
  };

  reader.readAsText(file);
});

// ==========================
// BEFORE CLOSE
// ==========================

window.addEventListener("beforeunload", async () => {
  saveCurrentTab();

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

const replaceAllBtn = document.getElementById("replace-all");
const closeReplace = document.getElementById("close-replace");

// ABRIR (CTRL + H)

document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "h") {
    e.preventDefault();

    replacePopup.classList.remove("hidden");

    findInput.focus();
  }
});

// FECHAR

closeReplace.onclick = () => {
  replacePopup.classList.add("hidden");
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

// ==========================
// INIT
// ==========================

loadState();
updateColorUI();
setupSplitColorButtons();

// =====================================
// GLOBAL SHORTCUT -> NEW TAB
// =====================================

window.electronAPI.onNewTabShortcut(() => {
  addTabBtn.click();
});

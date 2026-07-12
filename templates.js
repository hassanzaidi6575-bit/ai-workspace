// templates.js - built-in prompt templates + custom saved templates

const BUILTIN_TEMPLATES = [
  {
    id: "summarize",
    label: "Summarize Text",
    prompt: "Summarize the following text in a clear and concise way:\n\n"
  },
  {
    id: "explain-code",
    label: "Explain Code",
    prompt: "Explain what the following code does, step by step:\n\n"
  },
  {
    id: "generate-ideas",
    label: "Generate Ideas",
    prompt: "Generate a list of creative ideas about the following topic:\n\n"
  },
  {
    id: "rewrite",
    label: "Rewrite Content",
    prompt: "Rewrite the following content to make it clearer and more engaging:\n\n"
  },
  {
    id: "translate",
    label: "Translate",
    prompt: "Translate the following text to English (or specify target language):\n\n"
  },
  {
    id: "create-email",
    label: "Create Email",
    prompt: "Write a professional email about the following:\n\n"
  },
  {
    id: "brainstorm",
    label: "Brainstorm",
    prompt: "Brainstorm possible approaches/solutions for the following problem:\n\n"
  },
];

function getCustomTemplates() {
  try {
    return JSON.parse(localStorage.getItem("ai_workspace_custom_templates")) || [];
  } catch {
    return [];
  }
}

function saveCustomTemplate(label, prompt) {
  const templates = getCustomTemplates();
  templates.push({ id: "custom-" + Date.now(), label, prompt, custom: true });
  localStorage.setItem("ai_workspace_custom_templates", JSON.stringify(templates));
}

function deleteCustomTemplate(id) {
  const templates = getCustomTemplates().filter((t) => t.id !== id);
  localStorage.setItem("ai_workspace_custom_templates", JSON.stringify(templates));
}

function renderTemplateButtons() {
  const bar = document.getElementById("templatesBar");
  bar.innerHTML = "";

  const allTemplates = [...BUILTIN_TEMPLATES, ...getCustomTemplates()];

  allTemplates.forEach((tpl) => {
    const btn = document.createElement("button");
    btn.className = "template-btn";
    btn.textContent = tpl.custom ? `★ ${tpl.label}` : tpl.label;
    btn.title = tpl.custom ? "Custom template (right-click to delete)" : tpl.label;
    btn.addEventListener("click", () => {
      const input = document.getElementById("messageInput");
      input.value = tpl.prompt;
      input.focus();
    });
    if (tpl.custom) {
      btn.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (confirm(`Delete custom template "${tpl.label}"?`)) {
          deleteCustomTemplate(tpl.id);
          renderTemplateButtons();
        }
      });
    }
    bar.appendChild(btn);
  });

  // "+" button to save current input as a new template
  const addBtn = document.createElement("button");
  addBtn.className = "template-btn";
  addBtn.textContent = "+ Save as template";
  addBtn.addEventListener("click", () => {
    const input = document.getElementById("messageInput");
    if (!input.value.trim()) {
      alert("Type a prompt in the input box first, then save it as a template.");
      return;
    }
    const label = prompt("Name this template:");
    if (label) {
      saveCustomTemplate(label, input.value);
      renderTemplateButtons();
    }
  });
  bar.appendChild(addBtn);
}

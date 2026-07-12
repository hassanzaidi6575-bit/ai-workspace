// main.js - app entry point, wires up all event listeners

document.addEventListener("DOMContentLoaded", () => {
  loadSessions();
  renderSessionList();
  renderTemplateButtons();
  loadActiveSessionIntoUI();
  applySavedTheme();

  // Send message on button click
  document.getElementById("sendBtn").addEventListener("click", sendMessage);

  // Send message on Enter (Shift+Enter for newline)
  document.getElementById("messageInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // New chat session
  document.getElementById("newChatBtn").addEventListener("click", () => {
    createSession();
    renderSessionList();
    loadActiveSessionIntoUI();
  });

  // Export current chat
  document.getElementById("exportBtn").addEventListener("click", exportActiveSession);

  // Dark/light mode toggle
  document.getElementById("darkModeToggle").addEventListener("click", toggleTheme);

  // Persist system prompt + model choice as they change
  document.getElementById("systemPromptInput").addEventListener("change", (e) => {
    getActiveSession().systemPrompt = e.target.value;
    persistSessions();
  });

  document.getElementById("modelSelect").addEventListener("change", (e) => {
    getActiveSession().model = e.target.value;
    persistSessions();
  });
});

function toggleTheme() {
  const body = document.body;
  const newTheme = body.getAttribute("data-theme") === "dark" ? "light" : "dark";
  body.setAttribute("data-theme", newTheme);
  localStorage.setItem("ai_workspace_theme", newTheme);
}

function applySavedTheme() {
  const saved = localStorage.getItem("ai_workspace_theme");
  if (saved) {
    document.body.setAttribute("data-theme", saved);
  }
}
